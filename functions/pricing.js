const functions = require("firebase-functions");
const moment = require("moment");
const companyFunctions = require("./company");
// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require("firebase-admin");

const db = firebaseAdmin.firestore();

const getCollectionReference = (companyId, name) => {
  return `companies/${companyId}/${name}`;
};

const getCollectionReferencePricingRulesCache = (companyId) => {
  return getCollectionReference(companyId, "pricingRulesCache");
}

const getCollectionPricingRulesCache = (companyId) => {
  return db.collection(getCollectionReferencePricingRulesCache(companyId))
}

const getCollectionReferencePricingRules = (companyId) => {
  return getCollectionReference(companyId, "pricingRules");
};

const getDocumentReferencePricingRules = (companyId, id) => {
  return `${getCollectionReferencePricingRules(companyId)}/${id}`;
};

const getDocumentReferencePricingRule = (companyId, id) => {
  return db.doc(getDocumentReferencePricingRules(companyId, id));
};

const getCollectionReferencePlaceGroups = (companyId) => {
  return getCollectionReference(companyId, "placeGroups");
};

const getDocumentReferencePlaceGroups = (companyId, id) => {
  return `${getCollectionReferencePlaceGroups(companyId)}/${id}`;
};

const getDocumentReferencePlaceGroup = (companyId, id) => {
  return db.doc(getDocumentReferencePlaceGroups(companyId, id));
};

// listens for new bookings and will find any pricing rules that have been used as part of the booking
// and increment the usage count for the pricing rule that helps indicate the amount each rule is being used
exports.incrementPricingRuleUsageCounter = functions.firestore
  .document("/companies/{companyId}/transfers/{transferId}")
  .onCreate(async (snapshot, context) => {
    const companyId = context.params.companyId;
    const transfer = snapshot.data();
    const pricingRuleUsed = transfer.pricingRuleUsed;

    if (pricingRuleUsed && pricingRuleUsed.id) {

      console.log(`IncrementPricingRuleUsageCounter compandId: ${companyId} id: ${pricingRuleUsed.id}`);

      const pricingRuleRef = getDocumentReferencePricingRule(companyId, pricingRuleUsed.id);

      const increment = firebaseAdmin.firestore.FieldValue.increment(1);

      // update use count - but don't update the LastModified
      //this will trigger onUpdate below
      return pricingRuleRef.update({ numUses: increment });
    }

    return null;
  });

// Listens for new pricingRules added to /companies/{companyId}/pricingRules/{pricingRuleId}
exports.pricingRuleOnCreate = functions.firestore
  .document("/companies/{companyId}/pricingRules/{pricingRuleId}")
  .onCreate(async (snapshot, context) => {

    const pricingRule = snapshot.data();
    let id = snapshot.id;
    pricingRule.id = id;
    const companyId = context.params.companyId;
    const arrayTagsInPrice = pricingRule.tags;

    console.log(`pricingRuleOnCreate companyId: ${companyId} id: ${id}`);

    const asyncResults = [];

    let tagMergePromise = mergeNewTagWithCentralList(arrayTagsInPrice, companyId);
    asyncResults.push(tagMergePromise);

    let cacheAddPromise = cacheNewPricingRule(companyId, pricingRule);
    asyncResults.push(cacheAddPromise);

    return Promise.all(asyncResults);
});

// Listens for updates to existing pricingRules pushed to /companies/{companyId}/pricingRules/{pricingRuleId} and  
exports.pricingRuleOnUpdate = functions.firestore
  .document("/companies/{companyId}/pricingRules/{pricingRuleId}")
  .onUpdate(async (snapshot, context) => {
    const oldData = snapshot.before.data();
    const newData = snapshot.after.data();
    let id = snapshot.after.id;

    const companyId = context.params.companyId;

    console.log(`pricingRuleOnUpdate companyId: ${companyId} id: ${id}`);

    let oldDataLastModified = oldData.lastModified;
    let newDataLastModified = newData.lastModified;

    if (oldDataLastModified && newDataLastModified && newDataLastModified.seconds === oldDataLastModified.seconds) {
      console.log(`pricing rule unchanged companyId: ${companyId} id: ${id}`);

      if (newData.numUses > oldData.numUses) {
        console.log(`incrementPricingRuleUsageCounter only companyId: ${companyId} id: ${id}`);
      }
      return null;
    }

    const asyncResults = [];

    if (!newData.tags.every(e => oldData.tags.includes(e))) {
      // there is a new tag that wasn't there before
      const arrayTagsInPrice = newData.tags;

      let tagMergePromise = mergeNewTagWithCentralList(arrayTagsInPrice, companyId);
      asyncResults.push(tagMergePromise);
    }

    newData.id = id;
    let cacheUpdatePromise = cacheExistingPricingRule(companyId, newData);
    asyncResults.push(cacheUpdatePromise);

    return Promise.all(asyncResults);
  });

// maintain the array of tags in the document '/companies/{companyId}/tags/pricing-rule-tags'
// In this document is one array named 'tags'
const mergeNewTagWithCentralList = (async (tags, companyId) => {
  const pricingRulesTagsDocRef = db.collection("companies")
                                    .doc(companyId)
                                    .collection("tags")
                                    .doc("pricing-rule-tags");

  console.log(`mergeNewTagWithCentralList ${companyId}`);

  let tagsDoc = await pricingRulesTagsDocRef.get();

  if (tagsDoc.exists) {
    // https://medium.com/@alvaro.saburido/set-theory-for-arrays-in-es6-eb2f20a61848
    const arrayExistingTagsAcrossAllPricingRules = tagsDoc.data().tags;
    const arrayWithPossDupes = [
      ...tags,
      ...arrayExistingTagsAcrossAllPricingRules
    ];
    const arrayUnion = Array.from([...new Set(arrayWithPossDupes)]);
    // onsole.log("arrayUnion", arrayUnion);
    return pricingRulesTagsDocRef.update({
      tags: arrayUnion
    });
  }
  return null;
})

const cacheNewPricingRule = (async (companyId, pricingRule) => {

  console.log(`cacheNewPricingRule ${companyId} id: ${pricingRule.id}`);
  // obtain a reference to the pricingRulesCache collection
  const pricingCacheRef = getPricingRef(companyId);

  removeRedundantData(pricingRule);

  const pricingCache = await pricingCacheRef.get();

  let pricingRulesToCache = await getPricingRuleArrayToCache(companyId, pricingRule);

  if (pricingCache.data() && pricingCache.data().cache) {
    return appendToExistingArray(pricingRulesToCache, pricingCacheRef, pricingCache);
  } else {
    // the cache is empty, we need to create the cache array in the cache document
    return createInitialArray(pricingRulesToCache, pricingCacheRef);
  }
});

const cacheExistingPricingRule = (async (companyId, pricingRule) => {

  console.log(`cacheExistingPricingRule ${companyId} id: ${pricingRule.id}`);

  // obtain a reference to the pricingRulesCache collection
  const pricingCacheRef = getPricingRef(companyId);

  removeRedundantData(pricingRule);

  const pricingCache = await pricingCacheRef.get();

  if (pricingCache.data() && pricingCache.data().cache) {
    let existingPricingRulesInCache = pricingCache.data().cache;

    // remove the pre-existing pricing rule based upon id (it may have been removed at an earlier time if it was marked as inactive)
    existingPricingRulesInCache = existingPricingRulesInCache.filter(
      a => a.id !== pricingRule.id
    );

    //push the changed pricing rule onto the end IF AND ONLY IF it is active
    if (pricingRule.active) {

      let pricingRulesToCache = await getPricingRuleArrayToCache(companyId, pricingRule);

      pricingRulesToCache.forEach((item) => {
        existingPricingRulesInCache.push(item);
      });
    }

    // send the whole array back to the database
    return pricingCacheRef.update({ cache: existingPricingRulesInCache });
  } else {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "the cache is not available in the database so we cannot update an existing record!"
    );
  }
});

function appendToExistingArray(pricingRules, pricingCacheRef, pricingCache) {
  const largerArray = pricingCache.data().cache;

  pricingRules.forEach((pricingRule) => {
    largerArray.push(pricingRule);
  });
  return pricingCacheRef.update({ cache: largerArray });
}

function createInitialArray(pricingRules, pricingCacheRef) {
  const initialArray = [];

  pricingRules.forEach((pricingRule) => {
    initialArray.push(pricingRule);
  });

  return pricingCacheRef.set({ cache: initialArray });
}

const getPlaceGroupPlaces = (async (companyId, id) => {

  const placeGroupRef = getDocumentReferencePlaceGroup(companyId, id);
  // await the fetch of the booking document
  const placeGroupDoc = await placeGroupRef.get();

  let placeGroupPlaces = [];

  if (placeGroupDoc.exists) {
    placeGroup = placeGroupDoc.data();
    placeGroup.id = placeGroupDoc.id;

    if (placeGroup.places && placeGroup.places.length > 0) {
      placeGroupPlaces = placeGroup.places;
    }
  }
  return placeGroupPlaces;
})

const getPricingRuleArrayToCache = (async (companyId, pricingRule) => {

  let pricingRulesToCache = [];

  let fromPlaceGroupId = pricingRule.fromPlaceGroupId;
  let toPlaceGroupId = pricingRule.toPlaceGroupId;
  let isPlaceGroupFrom = false;
  let isPlaceGroupTo = false;

  //only use group if both flag set and value defined
  if (pricingRule.isPlaceGroupFrom === true && fromPlaceGroupId && fromPlaceGroupId !== null && fromPlaceGroupId !== "") {
    isPlaceGroupFrom = true;
  }
  if (pricingRule.isPlaceGroupTo === true && toPlaceGroupId && toPlaceGroupId !== null && toPlaceGroupId !== "") {
    isPlaceGroupTo = true;
  }

  removeRedundantPlaceGroupData(pricingRule);

  if (isPlaceGroupFrom === true && isPlaceGroupTo === true) {
    //iterate through both from and to groups making a pricing rule
    //for earch combination
    const fromPlaces = await getPlaceGroupPlaces(companyId, fromPlaceGroupId);
    const toPlaces = await getPlaceGroupPlaces(companyId, toPlaceGroupId);

    fromPlaces.forEach((fromPlace) => {
      let pricingRuleForCache1 = {
        ...pricingRule
      };
      pricingRuleForCache1.fromPlaceId = fromPlace;
      toPlaces.forEach((toPlace) => {

        let pricingRuleForCache2 = {
          ...pricingRuleForCache1
        };
        pricingRuleForCache2.toPlaceId = toPlace;
        pricingRulesToCache.push(pricingRuleForCache2);
      });
    });
  }
  else if (isPlaceGroupFrom === true && isPlaceGroupTo !== true) {
    //iterate through from groups only
    const fromPlaces = await getPlaceGroupPlaces(companyId, fromPlaceGroupId);
    fromPlaces.forEach((fromPlace) => {
      let pricingRuleForCache = {
        ...pricingRule
      };
      pricingRuleForCache.fromPlaceId = fromPlace;
      pricingRulesToCache.push(pricingRuleForCache);
    });
  }
  else if (isPlaceGroupFrom !== true && isPlaceGroupTo === true) {
    //iterate through to groups only
    const toPlaces = await getPlaceGroupPlaces(companyId, toPlaceGroupId);
    toPlaces.forEach((toPlace) => {
      let pricingRuleForCache = {
        ...pricingRule
      };
      pricingRuleForCache.toPlaceId = toPlace;
      pricingRulesToCache.push(pricingRuleForCache);
    });
  }
  else if (isPlaceGroupFrom !== true && isPlaceGroupTo !== true) {
    //no grouping, just the single original rule
    pricingRulesToCache.push(pricingRule);
  }

  return pricingRulesToCache;
})

const getPricingRef = (companyId) => {

  if (!companyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "companyId is not a valid argument"
    );
  }

  const documentId = "--cache--";
  return getCollectionPricingRulesCache(companyId).doc(documentId);
}

function removeRedundantData(pricingRule) {
  delete pricingRule.displayNoticeUponQuoteDelivery;
  delete pricingRule.noticeUponQuoteDelivery;
  delete pricingRule.displayTnCUponQuoteDelivery;
  delete pricingRule.termsAndConditions;
}

const removeRedundantPlaceGroupData = (pricingRule) => {
  delete pricingRule.isPlaceGroupFrom;
  delete pricingRule.isPlaceGroupTo;
  delete pricingRule.fromPlaceGroupId;
  delete pricingRule.toPlaceGroupId;
}
