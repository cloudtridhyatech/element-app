// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require("firebase-admin");
const accommodationFunctions = require("./accommodations");
const dateUtilsFunctions = require("./dateUtils");
const arrayUtilFunctions = require("./arrayUtils");

const db = firebaseAdmin.firestore();


const getCollectionReferenceTransfers = (companyId) => {
    return `companies/${companyId}/transfers`;
};

const getDocumentReferenceTransfers = (companyId, id) => {
    return `${getCollectionReferenceTransfers(companyId)}/${id}`;
};

const getCollectionTransfers = (companyId) => {
    return db.collection(getCollectionReferenceTransfers(companyId));
};

const getDocumentReferenceTransfer = (companyId, id) => {
    return db.doc(getDocumentReferenceTransfers(companyId, id));
};

exports.addTransfer = async (
    companyId,
    transferData
) => {
    return await handleAddTransfer(companyId, transferData);
};

exports.updateTransfer = async (
    companyId,
    transferData
) => {
    return await handleUpdateTransfer(companyId, transferData);
};

async function handleAddTransfer(companyId, transferData) {

    console.log(`handleAddTransfer companyId: ${companyId}, bookingId: ${transferData.bookingId}`);
    const created = firebaseAdmin.firestore.FieldValue.serverTimestamp();
    transferData.created = created;
    transferData.lastModified = created;
    sanitizeTransferDatesBeforeCreateOrUpdate(transferData);

    const transferRef = getCollectionTransfers(companyId);
    const transfer = await transferRef.add(transferData);
    transferData.id = transfer.id;
    return transfer.id;
}

async function handleUpdateTransfer(companyId, transferData) {

    console.log(`handleUpdateTransfer companyId: ${companyId}, transferData.id: ${transferData.id}`);

    let transferId = transferData.id;
    delete transferData.id;
    delete transferData.created;
    sanitizeTransferDatesBeforeCreateOrUpdate(transferData);

    const transferRef = getDocumentReferenceTransfer(companyId, transferId);
    const updatedTransfer = await transferRef.update(transferData);

    return updatedTransfer;
}

exports.getTransfersByBookingId = async (
    companyId,
    bookingId
) => {

    let transfers = [];

    const query = getCollectionTransfers(companyId)
                    .where("bookingId", "==", bookingId);

    const snapshot = await query.get();
    transfers = await mapResults(companyId, snapshot.docs);

    return transfers;
}

exports.getTransferByTransferId = async (
    companyId,
    transferId
) => {

    console.log(`getTransferByTransferId companyId: ${companyId}, transferId: ${transferId}`);
    let transfer = null;

    if (transferId) {

        const transferRef = getDocumentReferenceTransfer(companyId, transferId);
        // await the fetch of the  document
        const doc = await transferRef.get();

        if (doc.exists) {
            transfer = doc.data();
            transfer.id = doc.id;

            // Not use here: sanitizeteTransferDatesForReading
            //if it is required to be used, tjis may affect Algola journey insert
            //date time mapping functions, so refactor may be required

        }
    }

    return transfer;
}

exports.getTransfersByTransferIds = async (
    companyId,
    transferIds
) => {

    let transfers = [];

    if (transferIds.length > 0) {

        let colRef = getCollectionReferenceTransfers(companyId);
        transfers = await arrayUtilFunctions.queryByIds(colRef, transferIds);

        const asyncResults = [];

        transfers.forEach(transfer => {
            asyncResults.push(mapTransfer(companyId, transfer));
        });
        await Promise.all(asyncResults);
    }

    return transfers;
}

async function mapResults(companyId, docs) {

    const asyncResults = [];

    let mapped = docs.map(doc => {
        let transfer = doc.data();
        transfer.id = doc.id;

        asyncResults.push(mapTransfer(companyId, transfer));

        return transfer;
    });
    await Promise.all(asyncResults);

    return mapped;
}

async function mapTransfer(companyId, transfer) {
    sanitizeteTransferDatesForReading(transfer);
    return setAccommodation(companyId, transfer);
}

async function setAccommodation(companyId, transfer) {

    if (typeof (transfer.accommodationId) !== 'undefined' && transfer.accommodationId !== '' && typeof (transfer.accommodation) === 'undefined') {
        let result = await accommodationFunctions.executeSearchOfAccommodationsById(companyId, transfer.accommodationId);
        if (result !== null) {

            transfer.accommodation = {
                label: result.accommodationName,
                value: transfer.accommodationId
            };
        }
    }
    return null;
}


function sanitizeTransferDatesBeforeCreateOrUpdate(transfer) {

    delete transfer.flightArrivesDateTimeLocal;
    delete transfer.flightDepartsDateTimeLocal;

    // update the lastModified timestamp
    transfer.lastModified = firebaseAdmin.firestore.FieldValue.serverTimestamp();

    transfer.flightArrivesDateTime = dateUtilsFunctions.convertDateTimeToFirestoreTimestamp(
        transfer.flightArrivesDateTime
    );


    transfer.flightDepartsDateTime = dateUtilsFunctions.convertDateTimeToFirestoreTimestamp(
        transfer.flightDepartsDateTime
    );
}

function sanitizeteTransferDatesForReading(transfer) {
    transfer.created = transfer.created.toMillis();

    transfer.lastModified = transfer.lastModified.toMillis();

    transfer.flightArrivesDateTime = dateUtilsFunctions.convertFirestoreTimestampToMilliseconds(
        transfer.flightArrivesDateTime
    );
    transfer.flightDepartsDateTime = dateUtilsFunctions.convertFirestoreTimestampToMilliseconds(
        transfer.flightDepartsDateTime
    );
}