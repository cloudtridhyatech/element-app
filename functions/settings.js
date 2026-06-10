const functions = require("firebase-functions");
const firebaseAdmin = require("firebase-admin");
const journiesFunctions = require("./journies");
const bookingFunctions = require("./bookings");
const accommodationFunctions = require("./accommodations");
const userFunctions = require("./users");

const db = firebaseAdmin.firestore();

exports.getSettingsRef = ((companyId) => {
    return dbSettingsRef(companyId);
})

exports.getSettingsData = (async (companyId) => {

    let settingsRef = dbSettingsRef(companyId);
    let snapshot = await settingsRef.get();
    return snapshot.data();
})

exports.getEditableSettingsRef = ((companyId) => {
    return dbEditableSettingsRef(companyId);
})

exports.getEditableSettingsData = (async (companyId) => {

    let editableSettingsRef = dbEditableSettingsRef(companyId);
    let snapshot = await editableSettingsRef.get();
    return snapshot.data();
})

function dbSettingsRef(companyId) {
    return db.collection("companies")
        .doc(companyId)
        .collection("settings")
        .doc("--settings--");
}

function dbEditableSettingsRef(companyId) {
    return db.collection("companies")
        .doc(companyId)
        .collection("settings")
        .doc("--editableSettings--");
}

exports.syncFirestoreAlgolia = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "only authenticated users can syncFirestoreAlgolia"
        );
    }

    if (!data.companyKey) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "companyKey is not a valid argument"
        );
    }

    if (!data.companyId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "companyId is not a valid argument"
        );
    }

    //Additional security checks
    const userRef = db.doc(`companies/${data.companyId}/users/${context.auth.uid}`);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "only authenticated users can perform sync"
        );
    }

    const userData = userDoc.data();
    const roles = userData.roles;

    if (roles.indexOf('booking-admin') < 0) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "only authenticated users can perform sync"
        );
    }

    console.log(`syncFirestoreAlgolia for ${data.companyId}`);

    const companyKey = data.companyKey;
    const companyId = data.companyId;

    await bookingFunctions.syncFirestoreAlgolia(
        companyId,
        companyKey
    );

    await journiesFunctions.syncFirestoreAlgolia(
        companyId,
        companyKey
    );

    await accommodationFunctions.syncFirestoreAlgolia(
        companyId,
        companyKey
    );

    await userFunctions.syncFirestoreAlgolia(
        companyId,
        companyKey
    );

    console.log('syncFirestoreAlgolia complete');
    return null;
});
