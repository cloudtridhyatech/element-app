const functions = require("firebase-functions");
// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require("firebase-admin");
const db = firebaseAdmin.firestore();

const getCollectionReferencePlaces = (companyId) => {
    return `companies/${companyId}/places`;
};

const getDocumentReferencePlaces = (companyId, id) => {
    return `${getCollectionReferencePlaces(companyId)}/${id}`;
};

const getCollectionPlaces = (companyId) => {
    return db.collection(getCollectionReferencePlaces(companyId));
};

const getDocumentReferencePlace = (companyId, id) => {
    return db.doc(getDocumentReferencePlaces(companyId, id));
};


exports.getPlaceById = (async (companyId, id) => {

    let data = null;

    try {
        if (id) {

            const docRef = getDocumentReferencePlace(companyId, id);

            const doc = await docRef.get();

            if (doc.exists) {
                data = doc.data();
            }
        }
    } catch (error) {
        console.error(`getPlaceById companyId: ${companyId}, id:${id}`, error);
        data = null;
    }
    return data;
});

