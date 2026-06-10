const functions = require("firebase-functions");
// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require("firebase-admin");
const db = firebaseAdmin.firestore();

const getCollectionReferenceTourOperators = (companyId) => {
    return `companies/${companyId}/tourOperators`;
};

const getDocumentReferenceTourOperators = (companyId, id) => {
    return `${getCollectionReferenceTourOperators(companyId)}/${id}`;
};

const getCollectionTourOperators = (companyId) => {
    return db.collection(getCollectionReferenceTourOperators(companyId));
};

const getDocumentReferenceTourOperator = (companyId, id) => {
    return db.doc(getDocumentReferenceTourOperators(companyId, id));
};


exports.getTourOperatorById = (async (companyId, id) => {

    let data = null;

    try {
        if (id) {
            const docRef = getDocumentReferenceTourOperator(companyId, id);

            const doc = await docRef.get();

            if (doc.exists) {
                data = doc.data();
            }
        }
    } catch (error) {
        console.error(`getTourOperatorById companyId: ${companyId}, id:${id}`, error);
        data = null;
    }
    return data;
});

