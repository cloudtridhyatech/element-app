const dateUtilsFunctions = require("./dateUtils");
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require("firebase-admin");

const db = firebaseAdmin.firestore();

exports.eventOnCreate = functions.firestore
  .document("/companies/{companyId}/events/{eventId}")
  .onCreate((snapshot, context) => {
    const event = snapshot.data();

    return null;
  });

exports.eventOnUpdate = functions.firestore
  .document("/companies/{companyId}/events/{eventId}")
  .onUpdate(async (snapshot, context) => {
    const oldData = snapshot.before.data();
    const newData = snapshot.after.data();

    // If the last journeyId is being removed, this event is empt and can be deleted
    if (newData.journeyIds.length === 0) {
      const eventRef = db.doc(
        `companies/${context.params.companyId}/events/${context.params.eventId}`
      );

      return eventRef.delete();
    }

    return null;
  });
