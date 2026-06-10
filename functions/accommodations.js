const functions = require("firebase-functions");
const searchFunctions = require("./searchFacade");

// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require("firebase-admin");

const db = firebaseAdmin.firestore();

const getCollectionReferenceAccommodations = (companyId) => {
  return `companies/${companyId}/accommodations`;
};

const getDocumentReferenceAccommodations = (companyId, id) => {
  return `${getCollectionReferenceAccommodations(companyId)}/${id}`;
};

const getCollectionAccommodations = (companyId) => {
  return db.collection(getCollectionReferenceAccommodations(companyId));
};

const getDocumentReferenceAccommodation = (companyId, id) => {
  return db.doc(getDocumentReferenceAccommodations(companyId, id));
};


exports.accommodationOnCreate = functions.firestore
  .document("/companies/{companyId}/accommodations/{accommodationId}")
  .onCreate(async (snapshot, context) => {

    const accommodation = snapshot.data();

    return await searchFunctions.addAccommodation(context.params.companyId,
      snapshot.id,
      accommodation);
  });

exports.accommodationOnUpdate = functions.firestore
  .document("/companies/{companyId}/accommodations/{accommodationId}")
  .onUpdate(async (snapshot, context) => {

    const oldData = snapshot.before.data();
    const newdata = snapshot.after.data();

    if (newdata.lastModified.seconds === oldData.lastModified.seconds) {
      console.log("accommodation unchanged");
      return null;
    }

    return await searchFunctions.updateAccommodation(context.params.companyId,
      snapshot.after.id,
      newdata);
  });

exports.executeFulltextSearchOfAccommodations = functions.https.onCall(
  async (data, context) => {


    if (!data.companyId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "companyId is not a valid argument"
      );
    }

    return await searchFunctions.searchAccommodationByText(data.companyId, data);
  }
);

exports.executeSearchOfAccommodationsById = (async (
  companyId,
  accommodationId
) => {

  return await searchFunctions.searchAccommodationById(companyId, { accommodationId: accommodationId });
});

exports.getAccommodationById = (async (
  companyId,
  accommodationId
) => {

  const accommodationRef = getDocumentReferenceAccommodation(companyId, accommodationId);

  let accommodationData = null;

  // await the fetch of the booking document
  const accommodationDoc = await accommodationRef.get();

  if (accommodationDoc.exists) {

    accommodationData = accommodationDoc.data();
  }
  return accommodationData;
});


exports.syncFirestoreAlgolia = async (
  companyId,
  companyKey
) => {

  let searchResults = [];

  //this won't work - needs actual text I think
  try {
    //an empty character will return all results
    searchResults = await searchFunctions.searchAccommodationByText(companyId, { includeInActiveInSearchResults: true, query: ' ' });
  } catch (error) {
    console.error('syncFirestoreAlgolia searchJournies error:', error);
  }

  console.log('syncFirestoreAlgolia searchAccommodationByText found:', searchResults.length);

  searchResults.forEach(async hit => {

    console.log('syncFirestoreAlgolia searchAccommodationByText found:', hit);

    let hitObjectID = hit.id;

    const accommodationRef = getDocumentReferenceAccommodation(companyId, hitObjectID);

    // await the fetch of the booking document
    const accommodationDoc = await accommodationRef.get();

    if (accommodationDoc.exists) {

      const accommodationData = accommodationDoc.data();

      console.log('Accommodation Found:', accommodationDoc.id);

      await searchFunctions.addAccommodation(companyId, hitObjectID, accommodationData);
    }
    else {
      console.log('Accommodation Not Found:', hitObjectID);

      await searchFunctions.deleteAccommodation(companyId, hitObjectID);
    }
  });
  console.log('syncFirestoreAlgolia accommodation complete');
  return null;
};
