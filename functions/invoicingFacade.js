const functions = require("firebase-functions");

const dummy = require('./invoicing/dummyProxy');
const xero = require('./invoicing/xeroProxy');

const invoicingTypes = require('./invoicing/types');
const dateUtilsFunctions = require("./dateUtils");
const settingsFunctions = require("./settings");

async function getInvoiceProxy(elementAppCompanyId) {
    let systemName = "";
    try {
        let settings = await settingsFunctions.getSettingsData(elementAppCompanyId);

        if (settings && settings.accountingSystemName && settings.accountingSystemName !== null) {
            systemName = settings.accountingSystemName;
        }
    } catch (error) {
        console.error("Unable to pull invoice setting from the data store", error);
        throw new functions.https.HttpsError(
            "internal",
            "Unable to pull invoice setting from the data store"
        );
    }

    return createInvoiceProxy(systemName);
}

const createInvoiceProxy = (systemName) => {

    let proxy;

    let systemNameLowerCase = "";
    if (systemName && systemName !== null && systemName !== "") {
        systemNameLowerCase = systemName.toLowerCase();
    }

    switch (systemNameLowerCase) {
        case 'xero':
            proxy = new xero.XeroProxy();
            break;
        default:
            proxy = new dummy.DummyProxy();
            break;
    }

    return proxy;
}

async function getContact(elementAppCompanyId, system, bookingContact) {
    if (!(bookingContact instanceof invoicingTypes.Contact)) {
        throw new functions.https.HttpsError(
            "data-loss",
            "Unexpected invoicing data type"
        );
    }

    let existingContact = null;
    if (system.can("findContact")) {
        existingContact = await system.findContact(elementAppCompanyId, bookingContact.email);
    }
    else {
        console.log("findContact not supported");
    }

    if (existingContact === null) {
        if (system.can("createContact")) {
            existingContact = await system.createContact(elementAppCompanyId, bookingContact);
        }
        else {
            console.log("createContact not supported");
        }
    }
    return existingContact;
}

function calculateTVA(tvaRate, gross) {

    let net = 0;
    let tva = 0;

    if (gross !== 0 && tvaRate !== 0) {

        let rateForCalc = tvaRate / 100;
        //round the net value to 2dp
        net = round(gross / (1 + rateForCalc));
        tva = round(gross - net);

        let adjustment = fixRoundingDiscrepancies(gross, net, tva);
        net += adjustment;

        console.log(`calculateTVA: GROSS ${gross}, NET ${net}, TVA ${tva} sum`, (net + tva));
    }
    return {
        net: net,
        gross: gross,
        tva: tva
    };

}
function round(value) {
    let decimals = 2;
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function fixRoundingDiscrepancies(expected, value1, value2) {

    let sum = (value1 + value2);
    let adjustment = 0;

    if (expected !== sum) {
        adjustment = expected - sum;
    }

    console.log(`fixRoundingDiscrepancies ${expected}, value1 ${value1}, value2 ${value2} sum ${sum}`, adjustment);

    return adjustment;
}

async function getTVARates(elementAppCompanyId) {

    const editableSettingsRef = settingsFunctions.getEditableSettingsRef(elementAppCompanyId);

    let snapshot = await editableSettingsRef.get();

    let settings = snapshot.data();

    return {
        primaryTVARate: settings.primaryTVARate ? settings.primaryTVARate : 0,
        secondaryTVARateEnabled: settings.secondaryTVARateEnabled ? settings.secondaryTVARateEnabled : false,
        secondaryTVARate: settings.secondaryTVARate ? settings.secondaryTVARate : 0,
        secondaryTVARateDescription: (settings.secondaryTVARateDescription && settings.secondaryTVARateDescription !== null && settings.secondaryTVARateDescription !== '') ? settings.secondaryTVARateDescription : 'Secondary TVA Transfer Price'
    };
}

function getTransferLineItems(tvaRates, transfer) {

    let invoiceLineItems = [];

    let routeSummary = transfer.routeSummary ? transfer.routeSummary : {
        distance: 0,
        secondaryTVARateApplies: false,
        secondaryTVARateAllocation: 0,
        fromCode: "unknown",
        toCode: "unknown"
    };
    let distance = routeSummary.distance;
    let grossPrice = Number(transfer.price);
    let secondaryTVARateApplies = routeSummary.secondaryTVARateApplies;
    let secondaryTVARateAllocation = secondaryTVARateApplies ? routeSummary.secondaryTVARateAllocation : 0;

    try {

        let lineDescription = `Transfer from ${routeSummary.fromCode} to ${routeSummary.toCode}`;
        if (tvaRates.primaryTVARate !== 0) {

            if (tvaRates.secondaryTVARateEnabled === true &&
                secondaryTVARateApplies === true &&
                tvaRates.secondaryTVARate !== 0 &&
                secondaryTVARateAllocation !== 0) {


                //Split the price into an amount relative the the distance in each sector
                let primaryGrossPriceSplit = round((grossPrice / distance) * (distance - secondaryTVARateAllocation));
                let secondaryGrossPriceSplit = round(grossPrice - primaryGrossPriceSplit);

                let adjustment = fixRoundingDiscrepancies(grossPrice, primaryGrossPriceSplit, secondaryGrossPriceSplit);
                primaryGrossPriceSplit += adjustment;

                let resultPrimary = calculateTVA(tvaRates.primaryTVARate, primaryGrossPriceSplit);
                let resultSecondary = calculateTVA(tvaRates.secondaryTVARate, secondaryGrossPriceSplit);

                let lineItemPrimary = new invoicingTypes.InvoiceItem(lineDescription, resultPrimary.gross, resultPrimary.net, resultPrimary.tva, invoicingTypes.TaxLineType.primary);
                invoiceLineItems.push(lineItemPrimary);
                let lineItemSecondary = new invoicingTypes.InvoiceItem(`${lineDescription}. ${tvaRates.secondaryTVARateDescription}`, resultSecondary.gross, resultSecondary.net, resultSecondary.tva, invoicingTypes.TaxLineType.secondary);
                invoiceLineItems.push(lineItemSecondary);
            }
            else {

                let results = calculateTVA(tvaRates.primaryTVARate, grossPrice);
                let lineItemPrimary = new invoicingTypes.InvoiceItem(lineDescription, results.gross, results.net, results.tva, invoicingTypes.TaxLineType.primary);
                invoiceLineItems.push(lineItemPrimary);
            }
        }
        else {

            let lineItem = new invoicingTypes.InvoiceItem(lineDescription, grossPrice, 0, 0, invoicingTypes.TaxLineType.none);
            invoiceLineItems.push(lineItem);
        }
    } catch (error) {
        console.error("getTransferLineItems error", error);
        throw new functions.https.HttpsError(
            "internal",
            "getTransferLineItems error"
        );
    }

    return invoiceLineItems;
}

exports.createContactAndInvoice = (async (elementAppCompanyId, bookingData) => {

    console.log(`invoicingFacde::createContactAndInvoice ${elementAppCompanyId}`);

    let invoiceSummary = null;
    let bookingContact = new invoicingTypes.Contact(bookingData.firstName, bookingData.lastName, bookingData.email, null);

    const system = await getInvoiceProxy(elementAppCompanyId);
    let existingAccountingSystemContact = await getContact(elementAppCompanyId, system, bookingContact);

    if ((existingAccountingSystemContact instanceof invoicingTypes.Contact) && system.can("createInvoice")) {

        let tvaRates = await getTVARates(elementAppCompanyId);
        let invoiceLineItems = [];

        //use the earliestPickUpDateTime to determine the invoice due date
        let earliestPickUpDateTime = 0;
        bookingData.journiesArray.forEach(journey => {

            let pickUpDateTime = dateUtilsFunctions.convertDateOfUnknownTypeToUnixTimestamp("pickUpDateTime", journey.pickUpDateTime);

            if (earliestPickUpDateTime === 0 || (pickUpDateTime < earliestPickUpDateTime)) {
                earliestPickUpDateTime = pickUpDateTime;
            }
        });

        bookingData.transfersArray.forEach(transfer => {

            let transferLineItems = getTransferLineItems(tvaRates, transfer);
            transferLineItems.forEach(lineItem => {
                invoiceLineItems.push(lineItem);
            });
        });

        let bookingCreated = dateUtilsFunctions.convertDateOfUnknownTypeToUnixTimestamp("created", bookingData.created);
        let bookingInvoice = new invoicingTypes.Invoice(bookingCreated, earliestPickUpDateTime, bookingData.bookingRef, invoiceLineItems, null, false, bookingData.isOnlineBooking);

        invoiceSummary = await system.createInvoice(elementAppCompanyId, existingAccountingSystemContact, bookingInvoice);
    }
    else {
        console.log("createInvoice not suppoted");
    }

    return invoiceSummary;
});


exports.updateInvoice = (async (elementAppCompanyId, bookingData) => {

    console.log(`invoicingFacde::updateInvoice ${elementAppCompanyId}`);

    let bookingContact = new invoicingTypes.Contact(bookingData.firstName, bookingData.lastName, bookingData.email, null);

    const system = await getInvoiceProxy(elementAppCompanyId);
    let existingAccountingSystemContact = await getContact(elementAppCompanyId, system, bookingContact);

    if ((existingAccountingSystemContact instanceof invoicingTypes.Contact) && system.can("updateInvoice")) {

        let bookingTotal = 0;
        let tvaRates = await getTVARates(elementAppCompanyId);

        let invoiceLineItems = [];
        bookingData.transfersArray.forEach(transfer => {

            bookingTotal += Number(transfer.price);

            let transferLineItems = getTransferLineItems(tvaRates, transfer);
            transferLineItems.forEach(lineItem => {
                invoiceLineItems.push(lineItem);
            });

        });

        let id = '';
        if (typeof (bookingData.invoiceSummary) !== 'undefined' && bookingData.invoiceSummary !== null) {
            id = bookingData.invoiceSummary.id;
        }

        if (id !== '') {

            let bookingInvoice = new invoicingTypes.Invoice(null, null, null, invoiceLineItems, id);

            await system.updateInvoice(elementAppCompanyId, existingAccountingSystemContact, bookingInvoice);
        } else {
            console.log('No invoice associated with booking to update.');
        }
    }
    else {
        console.log("updateInvoice not suppoted");
    }

    return null;
});

exports.getDeepLink = (async (elementAppCompanyId, invoiceSummary) => {

    let deepLink = '';

    if (!invoiceSummary.system || invoiceSummary.system === null || invoiceSummary.system === '') {
        return deepLink;
    }

    const system = createInvoiceProxy(invoiceSummary.system);

    if (system && system.can("getDeepLink")) {
        deepLink = await system.getDeepLink(elementAppCompanyId, invoiceSummary.id);
    }
    else {
        console.log("getDeepLink not supported");
    }

    return deepLink;
});

//Method used for systemConnectionStatus
exports.systemConnectionStatus = functions.https.onCall(async (data, context) => {

    if (!data.companyId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "companyId is not a valid argument"
        );
    }

    if (!data.system) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "system is not a valid argument"
        );
    }

    const systemName = data.system;
    const elementAppCompanyId = data.companyId;

    const system = createInvoiceProxy(systemName);

    let connected = false;
    if (system.can("getConnectionStatus")) {
        connected = await system.getConnectionStatus(elementAppCompanyId);
    }

    return {
        status: connected
    };
});

exports.getInvoice = (async (elementAppCompanyId, invoiceSummary) => {

    const system = createInvoiceProxy(invoiceSummary.system);

    if (system.can("getInvoiceById")) {
        let getInvoiceResponse = await system.getInvoiceById(elementAppCompanyId, invoiceSummary.id);

        if (getInvoiceResponse !== null) {
            return {
                id: getInvoiceResponse.id,
                hasPayments: getInvoiceResponse.hasPayments
            };
        }
    }

    return null;
});

exports.setInvoicePaid = (async (elementAppCompanyId, invoiceSummary) => {

    const system = createInvoiceProxy(invoiceSummary.system);

    if (system.can("setInvoicePaid")) {
        let setInvoicePaidResponse = await system.setInvoicePaid(elementAppCompanyId, invoiceSummary.id, invoiceSummary.paymentId);


    }

    return null;
});
