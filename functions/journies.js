const functions = require("firebase-functions");
const dateUtilsFunctions = require("./dateUtils");
const transferFunctions = require("./transfers");
const searchFunctions = require("./searchFacade");

// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require("firebase-admin");

const db = firebaseAdmin.firestore();

const getCollectionReferenceJournies = (companyId) => {
  return `companies/${companyId}/journies`;
};

const getDocumentReferenceJournies = (companyId, id) => {
  return `${getCollectionReferenceJournies(companyId)}/${id}`;
};

const getCollectionJournies = (companyId) => {
  return db.collection(getCollectionReferenceJournies(companyId));
};

const getDocumentReferenceJourney = (companyId, id) => {
  return db.doc(getDocumentReferenceJournies(companyId, id));
};


exports.journeyOnCreate = functions.firestore
  .document("/companies/{companyId}/journies/{journeyId}")
  .onCreate(async (snapshot, context) => {
    const journey = snapshot.data();

    await searchFunctions.addJourney(
      context.params.companyId,
      snapshot.id,
      journey);

    return null;
  });

exports.journeyOnUpdate = functions.firestore
  .document("/companies/{companyId}/journies/{journeyId}")
  .onUpdate(async (snapshot, context) => {

    const oldData = snapshot.before.data();
    const newdata = snapshot.after.data();

    if (newdata.lastModified.seconds === oldData.lastModified.seconds) {
      console.log("journey unchanged");
      return null;
    }

    await searchFunctions.updateJourney(
      context.params.companyId,
      snapshot.after.id,
      newdata);

      return null;
  });

exports.addJournies = (
  companyId,
  firstName,
  lastName,
  bookingId,
  journiesArrayData
) => {
  const journiesRef = getCollectionJournies(companyId);

  journiesArrayData.forEach(async journeyData => {
    addJourney(
      companyId,
      journiesRef,
      firstName,
      lastName,
      journeyData,
      bookingId      
    );
  });
};

exports.addOrUpdateJournies = (
  companyId,
  firstName,
  lastName,
  bookingId,
  journiesArrayData
) => {
  const journiesRef = getCollectionJournies(companyId);

  journiesArrayData.forEach(async journeyData => {
    if (journeyData.id && journeyData.bookingId) {
      // this is a pre-existing journey so we should just update it
      await updateJourney(
        companyId,
        journiesRef,
        firstName,
        lastName,
        journeyData
      );
    } else {
      await addJourney(
        companyId,
        journiesRef,
        firstName,
        lastName,
        journeyData,
        bookingId        
      );
    }
  });
};

/* Shortcut method to just update journey status
   Used as part of payment process */
exports.updateJourneyStatus = async (
  companyId,
  journeyId,
  status
) => {

  let savedRef = getDocumentReferenceJourney(companyId, journeyId);

  let lastModified = firebaseAdmin.firestore.FieldValue.serverTimestamp();

  await savedRef.set({ status: status, lastModified: lastModified }, { merge: true });
};

exports.getJourniesByBookingId = async (
  companyId,
  bookingId) => {

  let journies = [];

  const journiesRef = getCollectionJournies(companyId);

  const journiesQuery = journiesRef
    .where("bookingId", "==", bookingId)
    .orderBy("pickUpDateTime"); // every journey has a pick up time but could be either flightDep or flightArr so can't use those

  // await the fetching of any journies related to the booking
  const snapshot = await journiesQuery.get();

  for (const doc of snapshot.docs) {
    let journey = doc.data();
    journey.id = doc.id;

    //Only include active journies
    if (journey.active !== false) {

      // sanitize the dates turning them into javascript Date objects
      sanitizeJourneyDatesForReading(journey);

      journies.push(journey);
    }
  }
  return journies;
};

async function addJourney(
  companyId,
  journiesRef,
  firstName,
  lastName,
  journeyData,
  bookingId  
) {
  const created = firebaseAdmin.firestore.FieldValue.serverTimestamp();

  let transferObject = journeyData.transferObject;
  delete journeyData.transferObject;
  transferObject.bookingId = bookingId;

  transferObject.ref = getJourneyRef(firstName, lastName);
  let transferId = await transferFunctions.addTransfer(companyId, transferObject);

  // sanitize dates and times
  sanitizeJourneyDatesBeforeCreateOrUpdate(journeyData);

  // add in firstName and lastName so that it can be easily displayed without need to pull parent booking entity
  journeyData.bookingId = bookingId;
  journeyData.created = created;
  journeyData.pickUpDate = getPickUpDateAsText(journeyData);
  journeyData.transferId = transferId;

  const journey = await journiesRef.add(journeyData);
  const journeyId = journey.id;
  // await the fetch of the new booking document
  const newJourneyDoc = await journey.get();

  if (!newJourneyDoc.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      "journey could not be found"
    );
  }
  journeyData.id = journeyId;

  return null;
}

async function updateJourney(
  companyId,
  journiesRef,
  firstName,
  lastName,
  journeyData
) {
  // sanitize dates and times
  const created = journeyData.created;
  sanitizeJourneyDatesBeforeCreateOrUpdate(journeyData);

  // we don't want to store the doc reference in the journey doc, so delete it
  const journeyId = journeyData.id;
  delete journeyData.id;

  let transferObject = journeyData.transferObject;
  delete journeyData.transferObject;

  transferObject.ref = getJourneyRef(firstName, lastName);
  await transferFunctions.updateTransfer(companyId, transferObject);

  journeyData.pickUpDate = getPickUpDateAsText(journeyData);

  const editedJourney = await journiesRef.doc(journeyId).update(journeyData);

  return null;
}


function getPickUpDateAsText(journeyData) {
  return dateUtilsFunctions.formatDateTimeUTC(journeyData.pickUpDateTime, "YYYY-MM-DD");
}

function getJourneyRef(firstName, lastName) {
  return {
    firstName: firstName,
    lastName: lastName
  };
}

exports.executeFulltextSearchOfJournies = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can search journies"
      );
    }

    if (!data.companyId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "companyId is not a valid argument"
      );
    }

    let searchResults = await searchFunctions.searchJournies(data.companyId, data);
    return searchResults;
  }
);


function sanitizeJourneyDatesBeforeCreateOrUpdate(journey) {
  delete journey.created;
  delete journey.pickUpDateTimeLocal;

  // update the lastModified timestamp
  journey.lastModified = firebaseAdmin.firestore.FieldValue.serverTimestamp();

  journey.pickUpDateTime = dateUtilsFunctions.convertDateTimeToFirestoreTimestamp(journey.pickUpDateTime);
}

function sanitizeJourneyDatesForReading(journey) {
  journey.created = journey.created.toMillis();

  journey.lastModified = journey.lastModified.toMillis();

  journey.pickUpDateTime = dateUtilsFunctions.convertFirestoreTimestampToMilliseconds(
    journey.pickUpDateTime
  );
}

exports.syncFirestoreAlgolia = async (
  companyId,
  companyKey
) => {

  let searchResults = [];

  try {
    searchResults = await searchFunctions.searchJournies(companyId, { hitsPerPage: 500, ignorefromDate: true });
  } catch (error) {
    console.error('syncFirestoreAlgolia searchJournies error:', error);
  }

  console.log('syncFirestoreAlgolia searchJournies found:', searchResults.length);

  searchResults.forEach(async hit => {

    let hitObjectID = hit.objectID;

    const journeyRef = getDocumentReferenceJourney(companyId, hitObjectID);

    // await the fetch of the booking document
    const journeyDoc = await journeyRef.get();

    if (journeyDoc.exists) {

      const journeyData = journeyDoc.data();

      console.log('Journey Found:', journeyDoc.id/*, journeyData*/);

      await searchFunctions.addJourney(companyId, hitObjectID, journeyData);
    }
    else {
      console.log('Journey Not Found:', hitObjectID);

      await searchFunctions.deleteJourney(companyId, hitObjectID);
    }
  });

  console.log('syncFirestoreAlgolia journies complete');
  return null;
};
