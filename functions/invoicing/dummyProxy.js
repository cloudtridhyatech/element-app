const invoicingTypes = require('./types');

const Name = 'Dummy';

class DummyProxy {
    constructor() {

    }

    async createInvoice(elementAppCompanyId, bookingContact, bookingInvoiceDetails) {
        console.log('createInvoice', Name);
        return null;
    }
    async findContact(elementAppCompanyId, email) {
        console.log('findContact', Name);
        return new invoicingTypes.Contact('', '', email, "N/A");
    }
    async createContact(elementAppCompanyId, bookingContact) {
        console.log('createContact', Name);
        return new invoicingTypes.Contact(bookingContact.firstName, bookingContact.lastName, bookingContact.email, "N/A");
    }
    async updateInvoice(elementAppCompanyId, bookingContact, bookingInvoiceDetails) {
        console.log('updateInvoice', Name);
        return null;
    }
    async getInvoiceById(elementAppCompanyId, id) {
        console.log('getInvoiceById', Name);
        return null;
    }
    async getDeepLink(elementAppCompanyId, id) {
        console.log('getDeepLink', Name);
        return null;
    }
    async getConnectionStatus(elementAppCompanyId) {
        console.log('getConnectionStatus', Name);
        return false;
    }
    async setInvoicePaid(elementAppCompanyId, id, paymentId) {
        console.log('setInvoicePaid', Name);
        return null;
    }
}

exports.DummyProxy = DummyProxy;
