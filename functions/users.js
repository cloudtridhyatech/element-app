const functions = require("firebase-functions");
const searchFunctions = require("./searchFacade");

// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require("firebase-admin");

const db = firebaseAdmin.firestore();

const getCollectionReferenceUsers = (companyId) => {
  return `companies/${companyId}/users`;
};

const getDocumentReferenceUsers = (companyId, id) => {
  return `${getCollectionReferenceUsers(companyId)}/${id}`;
};

const getCollectionUsers = (companyId) => {
  return db.collection(getCollectionReferenceUsers(companyId));
};

const getDocumentReferenceUser = (companyId, id) => {
  return db.doc(getDocumentReferenceUsers(companyId, id));
};


exports.userOnCreate = functions.firestore
  .document("/companies/{companyId}/users/{userId}")
  .onCreate(async (snapshot, context) => {

    const user = snapshot.data();

    return await searchFunctions.addUser(
      context.params.companyId,
      snapshot.id,
      user);
  });

exports.userOnUpdate = functions.firestore
  .document("/companies/{companyId}/users/{userId}")
  .onUpdate(async (snapshot, context) => {

    const oldData = snapshot.before.data();
    const newdata = snapshot.after.data();

    //oldData.lastModified.seconds and  newdata.lastModified.seconds may not exist
    let newDataLastModified = new Date().getTime() / 1000;
    if (typeof (newdata.lastModified) !== 'undefined') {
      newDataLastModified = newdata.lastModified.seconds;
    }

    let oldDataLastModified = newDataLastModified - 1;
    if (typeof (oldData.lastModified) !== 'undefined') {
      oldDataLastModified = oldData.lastModified.seconds;
    }

    if (newDataLastModified === oldDataLastModified) {
      console.log("user unchanged");
      return null;
    }

    return await searchFunctions.updateUser(
      context.params.companyId,
      snapshot.after.id,
      newdata);
  });

exports.executeFulltextSearchOfUsers = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can search accommodations"
      );
    }

    if (!data.companyId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "companyId is not a valid argument"
      );
    }

    let searchResults = await searchFunctions.searchUsers(data.companyId, data);
    return searchResults;
  }
);

exports.syncFirestoreAlgolia = async (
  companyId,
  companyKey
) => {

  let searchResults = [];

  try {
    searchResults = await searchFunctions.searchUsers(companyId, {});
    console.log('syncFirestoreAlgolia searchUsers found:', searchResults.length);
  } catch (error) {
    console.error('syncFirestoreAlgolia searchUsers error:', error);
  }
  
  console.log('syncFirestoreAlgolia searchUsers found:', searchResults.length);

  searchResults.forEach(async hit => {

    let hitObjectID = hit.objectID;

    const userRef = getDocumentReferenceUser(companyId, hitObjectID);

    // await the fetch of the booking document
    const userDoc = await userRef.get();

    if (userDoc.exists) {

      const userData = userDoc.data();

      console.log('User Found:', userDoc.id);

      await searchFunctions.addUser(companyId, hitObjectID, userData);
    }
    else {
      console.log('User Not Found:', hitObjectID);

      await searchFunctions.deleteUser(companyId, hitObjectID);
    }
  });

  console.log('syncFirestoreAlgolia users complete');
  return null;
};
