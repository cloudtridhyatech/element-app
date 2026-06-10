const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require("firebase-admin");

exports.setCreatedAndLastUpdatedForNewNote = functions.firestore
  .document("/companies/{companyId}/notes/{noteId}")
  .onCreate((snapshot, context) => {
    return snapshot.ref.update({
      created: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      lastModified: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    });
  });

exports.setLastUpdatedForExistingNote = functions.firestore
  .document("/companies/{companyId}/notes/{noteId}")
  .onUpdate((snapshot, context) => {
    const oldData = snapshot.before.data();

    const newTimestamp = firebaseAdmin.firestore.Timestamp.now();

    // lastModified may not exist right away as it depends on the onCreate handler having been executed before any calls to onUpdate
    if (oldData.lastModified) {
      const seconds = newTimestamp.seconds - oldData.lastModified.seconds;
      // avoid a non-terminating loop and big firebase charges by checking we have more than a 60 second difference.
      // the 2nd call to this function will return null as it'll execute within milliseconds of the first call.
      if (seconds > 60) {
        return snapshot.after.ref.update({
          lastModified: newTimestamp
        });
      }
    }
    return null;
  });
