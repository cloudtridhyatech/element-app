const firebaseAdmin = require("firebase-admin");

const db = firebaseAdmin.firestore();

exports.getCompanyRef = ((companyId) => {
    return dbCompanyRef(companyId);
})

exports.getCompanyData = (async (companyId) => {

    let companyRef = dbCompanyRef(companyId);
    let snapshot = await companyRef.get();
    return snapshot.data();
})

function dbCompanyRef(companyId) {
    return db.doc(`companies/${companyId}`);
}
