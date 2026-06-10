const functions = require("firebase-functions");
const { XeroClient, Invoice, Invoices, LineItem, Contacts, Contact, Payment } = require("xero-node");
const http = require("http");
const moment = require("moment");

const firebaseAdmin = require("firebase-admin");
const db = firebaseAdmin.firestore();

const invoicingTypes = require('./types');
const settingsFunctions = require("../settings");

const Name = 'Xero';

const scopes = ['openid', 'profile', 'email', 'accounting.transactions', 'accounting.settings', 'accounting.contacts', 'offline_access'];

class XeroProxy {
    constructor() {

    }
    async createInvoice(elementAppCompanyId, bookingContact, bookingInvoiceDetails) {
        console.log('createInvoice', bookingInvoiceDetails.reference);

        let invoiceId = '';
        let invoiceNumber = '';
        try {

            let xero = await this.xeroConnect(elementAppCompanyId);
            let xeroTenantTenantId = this.getXeroTenantTenantId(xero);

            //map to zero line items
            let accountCodeName = "accountCodeBookingOffline";
            if (bookingInvoiceDetails.isOnlineBooking === true) {
                accountCodeName = "accountCodeBookingOnline";
            }

            let mapped = await this.mapZeroLineItems(elementAppCompanyId, bookingInvoiceDetails.items, accountCodeName);
            let total = mapped.total;

            let invoiceDate = new Date(bookingInvoiceDetails.invoiceDate).toISOString().split('T')[0];
            let dueDate = new Date(bookingInvoiceDetails.dueDate).toISOString().split('T')[0];

            let contact = new Contact();
            contact.contactID = bookingContact.id;

            let zeroInvoice = new Invoice();
            zeroInvoice.type = Invoice.TypeEnum.ACCREC;
            zeroInvoice.contact = contact;
            zeroInvoice.lineItems = mapped.zeroLineItems;
            zeroInvoice.date = invoiceDate;
            zeroInvoice.dueDate = dueDate;
            zeroInvoice.reference = bookingInvoiceDetails.reference;
            zeroInvoice.amountDue = total;
            zeroInvoice.total = total;

            let zeroRequestInvoices = [];
            zeroRequestInvoices.push(zeroInvoice);

            let request = new Invoices();
            request.invoices = zeroRequestInvoices;

            const createdInvoiceResponse = await xero.accountingApi.createInvoices(xeroTenantTenantId, request);

            if (typeof (createdInvoiceResponse) !== 'undefined' && createdInvoiceResponse !== null) {
                if (createdInvoiceResponse.body.invoices.length > 0) {
                    let firstResult = createdInvoiceResponse.body.invoices[0];
                    invoiceId = firstResult.invoiceID;
                    invoiceNumber = firstResult.invoiceNumber;
                }
            }
        }
        catch (error) {
            console.error(
                "createContact ERROR:",
                error
            );
            handleError(error);
        }

        return {
            id: invoiceId,
            number: invoiceNumber,
            system: Name
        };
    }
    async findContact(elementAppCompanyId, email) {
        console.log('findContact', Name);

        let contact = null;

        try {
            let xero = await this.xeroConnect(elementAppCompanyId);
            let xeroTenantTenantId = this.getXeroTenantTenantId(xero);

            let searchEmail = email.trim().toLowerCase();
            let searchWhere = 'EmailAddress="' + searchEmail + '"';

            let contactSearchResponse = await xero.accountingApi.getContacts(xeroTenantTenantId, null, searchWhere);
            if (typeof (contactSearchResponse) !== 'undefined' && contactSearchResponse !== null) {
                if (contactSearchResponse.body.contacts.length > 0) {
                    console.log('Contact found');
                    let firstResult = contactSearchResponse.body.contacts[0];
                    //map item
                    contact = this.mapContact(firstResult);
                }
            }
        }
        catch (error) {
            console.error(
                "findContact ERROR:",
                error
            );
            handleError(error);
        }
        return contact;
    }
    async createContact(elementAppCompanyId, bookingContact) {
        console.log('createContact', Name);

        let contact = null;

        try {
            let xero = await this.xeroConnect(elementAppCompanyId);
            let xeroTenantTenantId = this.getXeroTenantTenantId(xero);

            let firstName = bookingContact.firstName.trim();
            let lastName = bookingContact.lastName.trim();
            let email = bookingContact.email.trim().toLowerCase();

            let newContact = new Contacts();
            newContact.contacts = [{
                firstName: firstName,
                lastName: lastName,
                emailAddress: email,
                name: firstName + ' ' + lastName
            }];

            const createContactsResponse = await xero.accountingApi.createContacts(xeroTenantTenantId, newContact);
            if (typeof (createContactsResponse) !== 'undefined' && createContactsResponse !== null) {
                if (createContactsResponse.body.contacts.length > 0) {
                    let firstResult = createContactsResponse.body.contacts[0];
                    //map item
                    contact = this.mapContact(firstResult);
                }
            }
        }
        catch (error) {
            console.error(
                "createContact ERROR:",
                error
            );
            handleError(error);
        }
        return contact;
    }
    async updateInvoice(elementAppCompanyId, bookingContact, bookingInvoiceDetails) {
        console.log('updateInvoice', Name, elementAppCompanyId);

        if (bookingInvoiceDetails.id === null || bookingInvoiceDetails.id === '') {
            console.log('bookingInvoiceDetails.id null, nothing to update', Name);
        }

        try {

            let xero = await this.xeroConnect(elementAppCompanyId);
            let xeroTenantTenantId = this.getXeroTenantTenantId(xero);

            //find the invoice
            let zeroInvoice = await this.getXeroInvoiceById(elementAppCompanyId, bookingInvoiceDetails.id, xero, xeroTenantTenantId);

            if (zeroInvoice !== null) {
                //console.log('Zero Invoice', zeroInvoice);
                console.log('Zero Invoice', zeroInvoice.status);

                let hasContactChanged = false;

                if (zeroInvoice.contact.contactID !== bookingContact.id) {
                    console.log('Potential invoice Contact update');
                    let contact = new Contact();
                    contact.contactID = bookingContact.id;
                    zeroInvoice.contact = contact;
                    hasContactChanged = true;
                }

                let currentAmountPaid = zeroInvoice.AmountPaid;
                let hasPayments = false;
                if (typeof (zeroInvoice.payments) !== 'undefined' && zeroInvoice.payments !== null && zeroInvoice.payments.length > 0) {
                    console.log(`Invoice ${bookingInvoiceDetails.id} has payments.`);
                    hasPayments = true;
                }

                if (hasPayments === false) {
                    //no payments so safe to update totals
                    console.log(`Updating Invoice Amounts`);

                    let mapped = await this.mapZeroLineItems(elementAppCompanyId, bookingInvoiceDetails.items, "accountCodeBookingOffline");
                    let newTotal = mapped.total;

                    //recalculate totals and set new values
                    zeroInvoice.lineItems = mapped.zeroLineItems;
                    zeroInvoice.amountDue = newTotal - currentAmountPaid;
                    zeroInvoice.total = newTotal;
                }

                //cannot update just the invoice if it has payments. It's a Xero 'feature' Payments must be removed then invoice updated then re add payment
                //https://community.xero.com/developer/discussion/99246017
                if (hasPayments === false /*|| hasContactChanged === true*/) {
                    let zeroRequestInvoices = [];
                    zeroRequestInvoices.push(zeroInvoice);

                    let request = new Invoices();
                    request.invoices = zeroRequestInvoices;

                    let updateInvoiceResponse = await xero.accountingApi.updateInvoice(xeroTenantTenantId, bookingInvoiceDetails.id, request);
                    console.log('Zero Invoice Update Response', updateInvoiceResponse);
                } else {
                    console.log(`Invoice ${bookingInvoiceDetails.id} will not be updated.`);
                }
            }
        }
        catch (error) {
            console.error(
                "updateInvoice ERROR:",
                error
            );
            handleError(error);
        }
        return null;
    }
    async getConnectionStatus(elementAppCompanyId) {
        console.log('getConnectionStatus', Name);

        let connected = false;

        try {
            let org = await this.getXeroOrganisation(elementAppCompanyId);
            if (org !== null) {
                connected = (org.organisationStatus) && org.organisationStatus.toLocaleLowerCase() === 'active';
            }
            else {
                console.error('getConnectionStatus organisation not found');
            }
        }
        catch (error) {
            handleError(error);
        }
        return connected;
    }
    async getDeepLink(elementAppCompanyId, id) {
        console.log('getDeepLink', Name);

        let xeroSettings = await getXeroSettings(elementAppCompanyId);

        let deepLink = null;
        if (xeroSettings) {
            deepLink = xeroSettings.deepLinkBaseUri +
            '?shortcode=' +
            xeroSettings.organisationShortCode + '&'
            + xeroSettings.invoiceRedirectUri + id;
        }

        return deepLink;
    }

    async getInvoiceById(elementAppCompanyId, id) {
        console.log('getInvoiceById', Name);

        let zeroInvoice = await this.getXeroInvoiceById(elementAppCompanyId, id, null, null);

        if (zeroInvoice !== null) {

            let hasPayments = false;
            if ((typeof (zeroInvoice.payments) !== 'undefined' && zeroInvoice.payments !== null && zeroInvoice.payments.length > 0) ||
                (zeroInvoice.status && zeroInvoice.status === Invoice.StatusEnum.PAID)
            ) {
                hasPayments = true;
            }

            return new invoicingTypes.Invoice(null, null, null, null, id, hasPayments, false);
        }

        return null;
    }
    async setInvoicePaid(elementAppCompanyId, id, paymentId) {
        console.log('setInvoicePaid', Name);

        try {

            let xero = await this.xeroConnect(elementAppCompanyId);
            let xeroTenantTenantId = this.getXeroTenantTenantId(xero);

            //find the invoice
            let zeroInvoice = await this.getXeroInvoiceById(elementAppCompanyId, id, xero, xeroTenantTenantId);

            if (zeroInvoice !== null) {

                let currentStatus = zeroInvoice.status;
                //Check status just in case someone in Xero and edits invoice by mistake
                if (currentStatus !== Invoice.StatusEnum.DRAFT && currentStatus !== Invoice.StatusEnum.AUTHORISED) {
                    let message = `setInvoicePaid unexpected status companyId: ${elementAppCompanyId} zero invoice id: ${id}`;
                    console.error(message);
                    throw new functions.https.HttpsError('internal', message);
                }
                if (currentStatus === Invoice.StatusEnum.DRAFT) {
                    //invoice must be set authoroisd before payment can be added to it
                    zeroInvoice.status = Invoice.StatusEnum.AUTHORISED;

                    let zeroRequestInvoices = [];
                    zeroRequestInvoices.push(zeroInvoice);

                    let request = new Invoices();
                    request.invoices = zeroRequestInvoices;
                    let updateInvoiceResponse = await xero.accountingApi.updateInvoice(xeroTenantTenantId, id, request);
                    if (typeof (updateInvoiceResponse) !== 'undefined' && updateInvoiceResponse !== null) {
                        if (updateInvoiceResponse.body.invoices.length > 0) {
                            zeroInvoice = updateInvoiceResponse.body.invoices[0];
                        }
                    }
                }

                let response = await this.getAccountCode(elementAppCompanyId, "accountCodePaymentOnline");

                let acc = {};
                let accResponse = await xero.accountingApi.getAccount(xeroTenantTenantId, response.accountCodeId);
                if (accResponse.body.accounts && accResponse.body.accounts.length > 0) {
                    acc = accResponse.body.accounts[0];
                }
                else {
                    let message = `setInvoicePaid Account code not found in Xero companyId: ${elementAppCompanyId} zero invoice id: ${id}, code ${response.accountCode}`;
                    console.error(message);
                    throw new functions.https.HttpsError('internal', message);
                }

                let request = new Payment();
                request.invoice = zeroInvoice;
                request.account = acc;
                request.invoiceNumber = zeroInvoice.invoiceNumber;
                request.amount = zeroInvoice.total;
                request.code = response.accountCode;
                request.date = moment().format("YYYY-MM-DD");
                request.reference = paymentId;

                let paidResponse = await xero.accountingApi.createPayment(xeroTenantTenantId, request);
                console.log(`createPayment response companyId: ${elementAppCompanyId} zero invoice id: ${id}`, paidResponse);
            }
            else {
                console.error(`Failed to find invoice companyId: ${elementAppCompanyId} zero invoice id: ${id}`);
            }
        }
        catch (error) {
            console.error(
                "setInvoicePaid ERROR:",
                error
            );
            handleError(error);
        }

        return null;
    }

    /* The following functions are effectively 'private' tothe XeroProxy class
     so not expected to be called from the invoicingFacade.js implementation  */
    async mapZeroLineItems(elementAppCompanyId, items, accountCodeName) {

        let zeroLineItems = [];
        let total = 0;
        let xeroSettings = await getXeroSettings(elementAppCompanyId);
        let response = await this.getAccountCode(elementAppCompanyId, accountCodeName, xeroSettings);

        items.forEach(line => {

            total += line.price;

            let xeroTaxType = this.getXeroTaxType(line, xeroSettings);
            let xeroItemCode = this.getXeroItemCode(line, xeroSettings);
            let zeroLineItem = this.mapToZeroInvoiceLine(line, xeroTaxType, xeroItemCode, response.accountCode);

            zeroLineItems.push(zeroLineItem);
        });

        return {
            total: total,
            zeroLineItems: zeroLineItems
        };
    }
    mapToZeroInvoiceLine(line, xeroTaxType, xeroItemCode, accountCode) {
        let zeroLineItem = new LineItem();

        if (xeroItemCode && xeroItemCode !== null && xeroItemCode !== '') {
            zeroLineItem.itemCode = xeroItemCode;
        }

        zeroLineItem.description = line.description;
        zeroLineItem.quantity = 1;
        zeroLineItem.unitAmount = line.net;
        zeroLineItem.accountCode = accountCode;

        if (xeroTaxType && xeroTaxType !== null && xeroTaxType !== '') {
            zeroLineItem.taxType = xeroTaxType;
            zeroLineItem.taxAmount = line.tva;
        } else {
            zeroLineItem.taxAmount = 0;
        }

        return zeroLineItem;
    }

    mapContact(xeroContact) {
        return new invoicingTypes.Contact(xeroContact.firstName, xeroContact.lastName, xeroContact.emailAddress, xeroContact.contactID);
    }

    getXeroTenantTenantId(xero) {
        let xeroTenantTenantId = xero.tenants.length > 0 ? xero.tenants[0].tenantId : '';

        if (xeroTenantTenantId === '') {
            console.error("Empty xeroTenantTenantId");

            throw new invoicingTypes.InvoiceSystemError('Invalid Xero Tenant TenantId');
        }
        return xeroTenantTenantId;
    }

    async xeroConnect(elementAppCompanyId) {

        let xero = null;

        let xeroSettings = await getXeroSettings(elementAppCompanyId);

        xero = createXeroClient(xeroSettings, elementAppCompanyId);
        await xero.initialize();
        await xero.setTokenSet(xeroSettings.tokenSet);
        let tokenSet = await xero.readTokenSet();
        if (tokenSet.expired()) {
            console.log('Token expired');
            const validTokenSet = await xero.refreshToken();

            //xero = new XeroClient();
            //await xero.refreshWithRefreshToken(xeroSettings.clientId, xeroSettings.clientSecret, tokenSet);
            //let validTokenSet = await xero.readTokenSet();

            //const tokenSet2 = await xero.readTokenSet();
            //await xero.setTokenSet(tokenSet2);
            await setXeroTokenSet(elementAppCompanyId, validTokenSet);
        }
        else {
            console.log('Token not expired');
        }

        await xero.updateTenants();

        return xero;
    }

    async getXeroInvoiceById(elementAppCompanyId, id, connectedXero = null, currentXeroTenantTenantId = null) {

        let xero = connectedXero !== null ? connectedXero : await this.xeroConnect(elementAppCompanyId);
        let xeroTenantTenantId = currentXeroTenantTenantId !== null ? currentXeroTenantTenantId : this.getXeroTenantTenantId(xero);

        //find the invoice
        let zeroInvoice = null;
        const getInvoiceResponse = await xero.accountingApi.getInvoice(xeroTenantTenantId, id);

        if (typeof (getInvoiceResponse) !== 'undefined' && getInvoiceResponse !== null) {
            if (getInvoiceResponse.body.invoices.length > 0) {
                zeroInvoice = getInvoiceResponse.body.invoices[0];
            }
        }
        return zeroInvoice;
    }

    async getXeroOrganisation(elementAppCompanyId) {

        let organisation = null;

        let xeroSettings = await getXeroSettings(elementAppCompanyId);
        if (typeof (xeroSettings.organisationName) === 'undefined' || xeroSettings.organisationName === '') {
            console.error('organisationName not saved in xeroSettings');
            return null;
        }

        let xero = await this.xeroConnect(elementAppCompanyId);
        let xeroTenantTenantId = this.getXeroTenantTenantId(xero);

        const getOrgsResponse = await xero.accountingApi.getOrganisations(xeroTenantTenantId);
        if (typeof (getOrgsResponse) !== 'undefined' && getOrgsResponse !== null) {

            if (getOrgsResponse.body.organisations.length > 0) {

                let orgIndex = getOrgsResponse.body.organisations.findIndex(item => item.name === xeroSettings.organisationName);
                console.log("orgIndex", orgIndex);
                if (orgIndex > -1) {
                    organisation = getOrgsResponse.body.organisations[orgIndex];
                }
                else {
                    console.error(`Organisation: ${xeroSettings.organisationName} not found`);
                }
            }
        }
        return organisation;
    }
    async getAccountCode(elementAppCompanyId, name, xeroSettingsRef = null) {

        let xeroSettings = xeroSettingsRef !== null ? xeroSettingsRef : await getXeroSettings(elementAppCompanyId);

        let idName = name + "Id";
        let accountCode = xeroSettings[name];
        let accountCodeId = xeroSettings[idName];

        if (!accountCode || accountCode === null || accountCode === "" || !accountCodeId || accountCodeId === null || accountCodeId === "") {
            //Use the default account code of 'Sales - 200' if not in the firestore settings
            //Then save code and value to settings for future use
            accountCode = "200";
            accountCodeId = "";

            let accountsLookup = await this.getAccounts(elementAppCompanyId, [accountCode]);
            if (accountsLookup[accountCode]) {
                accountCodeId = accountsLookup[accountCode].accountID;
            }
            if (accountCodeId !== "") {
                //save in firestore settings
                await setXeroSettingsValues(elementAppCompanyId, [{ name: name, value: accountCode }, { name: idName, value: accountCodeId }]);
            }
        }

        return {
            accountCode: accountCode,
            accountCodeId: accountCodeId
        };
    }
    async getAccounts(elementAppCompanyId, items) {

        let itemsLookup = {};

        let xero = await this.xeroConnect(elementAppCompanyId);
        let xeroTenantTenantId = this.getXeroTenantTenantId(xero);

        let filters = "";

        items.forEach(item => {
            if (item !== null && item !== '') {
                filters = this.appendORFilter(filters, "code", item);
            }
        });

        if (filters !== '') {
            let getItemsResponse = await xero.accountingApi.getAccounts(xeroTenantTenantId, null, filters);
            if (getItemsResponse.body.accounts && getItemsResponse.body.accounts.length > 0) {
                getItemsResponse.body.accounts.forEach((item) => {
                    itemsLookup[item.code] = { accountID: item.accountID, enablePaymentsToAccount: item.enablePaymentsToAccount };
                });
            }
        }

        return itemsLookup;
    }
    async getTaxRates(elementAppCompanyId, items) {

        let taxRateLookup = {};

        let xero = await this.xeroConnect(elementAppCompanyId);
        let xeroTenantTenantId = this.getXeroTenantTenantId(xero);

        let filters = "";

        items.forEach(item => {
            if (item !== null && item !== '') {
                filters = this.appendORFilter(filters, "name", item);
            }
        });

        if (filters !== '') {
            let getTaxRatesResponse = await xero.accountingApi.getTaxRates(xeroTenantTenantId, filters);
            if (getTaxRatesResponse.body.taxRates && getTaxRatesResponse.body.taxRates.length > 0) {
                getTaxRatesResponse.body.taxRates.forEach((item) => {
                    taxRateLookup[item.name] = item.taxType;
                });
            }
        }

        return taxRateLookup;
    }

    async getItems(elementAppCompanyId, items) {

        let itemsLookup = [];

        let xero = await this.xeroConnect(elementAppCompanyId);
        let xeroTenantTenantId = this.getXeroTenantTenantId(xero);

        let filters = "";

        items.forEach(item => {
            if (item !== null && item !== '') {
                filters = this.appendORFilter(filters, "code", item);
            }
        });

        if (filters !== '') {
            let getItemsResponse = await xero.accountingApi.getItems(xeroTenantTenantId, null, filters);
            if (getItemsResponse.body.items && getItemsResponse.body.items.length > 0) {
                getItemsResponse.body.items.forEach((item) => {
                    itemsLookup.push(item.code);
                });
            }
        }

        return itemsLookup;
    }

    getXeroTaxType(line, xeroSettings) {
        let xeroTaxType = '';
        let lookupResult = '';

        switch (line.taxLineType) {
            case invoicingTypes.TaxLineType.primary:
                lookupResult = xeroSettings.primaryTaxRateType;
                break;
            case invoicingTypes.TaxLineType.secondary:
                lookupResult = xeroSettings.secondaryTaxRateType;
                break;
            default:
                break;
        }

        if (lookupResult && lookupResult !== null && lookupResult !== '') {
            xeroTaxType = lookupResult;
        }

        return xeroTaxType;
    }

    getXeroItemCode(line, xeroSettings) {
        let xeroItemCode = '';
        let lookupResult = '';

        switch (line.taxLineType) {
            case invoicingTypes.TaxLineType.primary:
                lookupResult = xeroSettings.primaryTaxRateItemCode;
                break;
            case invoicingTypes.TaxLineType.secondary:
                lookupResult = xeroSettings.secondaryTaxRateItemCode;
                break;
            default:
                break;
        }

        if (lookupResult && lookupResult !== null && lookupResult !== '') {
            xeroItemCode = lookupResult;
        }

        return xeroItemCode;
    }

    appendORFilter(currentFilter, name, value) {
        var filters = currentFilter;

        if (value && value !== null && value !== '') {
            filters = (currentFilter.length > 0 ? `${currentFilter} OR ` : ``) + `${name}=="${value}"`;
        }
        return filters;
    }
}

exports.XeroProxy = XeroProxy;

async function setXeroSettingsValue(elementAppCompanyId, name, value) {

    try {
        const settingsRef = settingsFunctions.getSettingsRef(elementAppCompanyId);

        let snapshot = await settingsRef.get();
        let settings = snapshot.data();
        let xeroSettings = settings.xero;

        xeroSettings[name] = value;

        await settingsRef.set({ xero: xeroSettings }, { merge: true });
        console.log(`xeroSettings ${name} written`);
    } catch (error) {
        console.error(`Unable to set xeroSettings ${name} in the data store`, error);
        throw (error);
    }
}

async function setXeroSettingsValues(elementAppCompanyId, nameValuePairs) {

    try {
        const settingsRef = settingsFunctions.getSettingsRef(elementAppCompanyId);

        let snapshot = await settingsRef.get();
        let settings = snapshot.data();
        let xeroSettings = settings.xero;

        for (let i = 0; i < nameValuePairs.length; i++) {
            let nvp = nameValuePairs[i];
            let name = nvp.name;
            let value = nvp.value;

            xeroSettings[name] = value;
        }

        await settingsRef.set({ xero: xeroSettings }, { merge: true });
        console.log(`companyId ${elementAppCompanyId} xeroSettings written:`, nameValuePairs);
    } catch (error) {
        console.error(`companyId ${elementAppCompanyId} Unable to set xeroSettings in the data store`, nameValuePairs, error);
        throw (error);
    }
}

async function getXeroSettings(elementAppCompanyId) {

    const settingsRef = settingsFunctions.getSettingsRef(elementAppCompanyId);

    let xeroSettings;
    try {
        let snapshot = await settingsRef.get();

        let settings = snapshot.data();
        xeroSettings = settings.xero;

        //console.log("xeroSettings:", xeroSettings);
    } catch (error) {
        console.error("Unable to pull xeroSettings from the data store", error);
        throw (error);
    }
    return xeroSettings;
}

async function setXeroTokenSet(elementAppCompanyId, tokenSet) {

    await setXeroSettingsValue(elementAppCompanyId, 'tokenSet', JSON.parse(JSON.stringify(tokenSet)));
}

function createXeroClient(xeroSettings, elementAppCompanyId) {
    let client;
    if (typeof (xeroSettings) !== 'undefined') {

        client = new XeroClient({
            clientId: xeroSettings.clientId,
            clientSecret: xeroSettings.clientSecret,
            redirectUris: xeroSettings.redirectUris,
            scopes: scopes,
            state: elementAppCompanyId
        });
    }
    return client;
}

function handleError(error) {

    let errorCode = 'internal';
    let errorMessage = '';

    if (typeof (error.response) !== 'undefined' && (error.response instanceof http.IncomingMessage)) {
        let errorNumber = '';
        let message = '';
        let type = '';
        if (typeof (error.response.body) !== 'undefined') {
            errorNumber = error.response.body.ErrorNumber;
            message = error.response.body.Message;
            type = error.response.body.Type;
        }
        errorMessage = `Xero Error: ${errorNumber}, ${message}`;

        console.error('Xero Error:', type, errorNumber, message);
    }
    else if ((error instanceof invoicingTypes.InvoiceSystemError)) {
        errorCode = 'unauthenticated';
        errorMessage = error.message;
    }
    else if ((error instanceof functions.https.HttpsError)) {
        errorCode = error.code;
        errorMessage = error.message;
    }
    else {
        console.log('typeof error', typeof error, error);

        if (typeof (error.message) !== 'undefined') {
            errorMessage = `Xero Error: ${error.message}`;
        }
        else {
            errorMessage = 'Xero Error';
        }
    }

    throw new functions.https.HttpsError(
        errorCode,
        errorMessage
    );
}

exports.verifiyXeroData = functions.https.onCall(async (data, context) => {
    console.log("verifiyXeroData", data.companyId);

    const elementAppCompanyId = data.companyId
    let taxRateNamesToVerify = data.taxRateNamesToVerify;
    let itemCodesToVerify = data.itemCodesToVerify;
    let accountsToVerify = data.accountsToVerify;

    let taxRateLookup = {};
    let accountsLookup = {};
    let errors = [];

    try {
        let proxy = new XeroProxy();
        if (taxRateNamesToVerify && taxRateNamesToVerify.length > 0) {
            taxRateLookup = await proxy.getTaxRates(elementAppCompanyId, taxRateNamesToVerify);

            taxRateNamesToVerify.forEach(taxRate => {

                if (taxRate !== null && taxRate !== '') {

                    if (!taxRateLookup[taxRate]) {
                        errors.push(`Xero Tax Rate '${taxRate}' not found.`);
                    }
                }
            });
        }

        if (itemCodesToVerify && itemCodesToVerify.length > 0) {
            let itemsLookup = await proxy.getItems(elementAppCompanyId, itemCodesToVerify);

            itemCodesToVerify.forEach(itemCode => {

                if (itemCode !== null && itemCode !== '') {

                    const found = itemsLookup.find(element => element === itemCode);
                    if (!found) {
                        errors.push(`Xero Item Code '${itemCode}' not found.`);
                    }
                }
            });
        }
        if (accountsToVerify && accountsToVerify.length > 0) {

            let accountNames = accountsToVerify.map(item => {
                return item.name;
            });

            accountsLookup = await proxy.getAccounts(elementAppCompanyId, accountNames);

            accountsToVerify.forEach(account => {

                if (account && account !== null && account.name && account.name !== null && account.name !== '') {

                    let result = accountsLookup[account.name];
                    if (!result) {
                        errors.push(`Xero Account Code '${account.name}' not found.`);
                    }
                    else {
                        if (account.verifyPaymentAllowed === true && result.enablePaymentsToAccount !== true) {
                            errors.push(`Xero Account Code '${account.name}' must be set "Verify Payment Allowed" in Xero.`);
                        }
                    }
                }
            });
        }

    } catch (error) {
        handleError(error);
    }

    return {
        taxRateLookup: taxRateLookup,
        accountsLookup: accountsLookup,
        errors: errors
    };
});

//Method used for onetine token set-up
exports.xeroLink = functions.https.onCall(async (data, context) => {

    const elementAppCompanyId = data.companyId
    console.log('xeroLink', elementAppCompanyId);

    let xeroSettings = await getXeroSettings(elementAppCompanyId);

    if (typeof (xeroSettings) !== 'undefined') {

        let xero = createXeroClient(xeroSettings, elementAppCompanyId);

        return xero.buildConsentUrl().then(consentUrl => {
            console.log('THEN :: xero.buildConsentUrl', consentUrl);
            // send URL back
            return { url: consentUrl }
        }).catch(err => {
            console.error('CATCH :: xero.buildConsentUrl', err);
            throw (err);
        });
    }

    return { url: '' };
});

//Method used for onetine token set-up
exports.xeroRedirect = functions.https.onRequest(async (req, res) => {
    console.log('xeroProxyRedirect', req.query.state);

    const elementAppCompanyId = req.query.state;

    try {
        let xeroSettings = await getXeroSettings(elementAppCompanyId);

        let xero = createXeroClient(xeroSettings, elementAppCompanyId);
        console.log("req.url:", req.url);
        await xero.initialize();
        tokenSet = await xero.apiCallback(req.url);

        console.log("tokenSet:", tokenSet);

        await setXeroTokenSet(elementAppCompanyId, tokenSet);

        //If connection is established, the shortCode must be extracted from the organisation
        let code = 200;
        let message = "Successfully added Initial connection credentials in firebase, you can close this window";
        let orgError = '';

        let proxy = new XeroProxy();
        let org = await proxy.getXeroOrganisation(elementAppCompanyId);
        if (org !== null) {
            let shortCode = org.shortCode;
            await setXeroSettingsValue(elementAppCompanyId, 'organisationShortCode', shortCode);
        }
        else {
            code = 404;
            orgError = "Unable to find organisation. Check firebase --settings--/xero/organisationName";
        }

        res.status(code).send(`<h2>${message}${orgError}</h2>`);
    } catch (error) {
        console.error("Unable to set xero token in the data store", error);

        let errorMessage = '';
        if (typeof (error.message) !== 'undefined') {
            errorMessage = error.message;
        }

        res.status(500).send(`<h2>Unable to set xero token in the data store: ${errorMessage}</h2>`);
    }

    return;
});
