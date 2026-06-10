const Name = 'Dummy';

class DummyProxy {
    constructor() {

    }
    async getDeepLink(elementAppCompanyId, id) {
        console.log('getDeepLink', Name);
        return null;
    }
    async cancelPayment(elementAppCompanyId, paymentData) {
        console.log('cancelPayment', Name);
        let response = { result: false, status: '' };
        return response;
    }
    async mapSettings(elementAppCompanyId, settings) {
        console.log('mapSettings', Name);
        return {};
    }
    async hasCompletedCardPayment(elementAppCompanyId, paymentData) {
        console.log('hasCompletedCardPayment', Name);
        let response = { result: false };
        return response;
    }
}

exports.DummyProxy = DummyProxy;
