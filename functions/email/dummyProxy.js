const emailTypes = require('./types');

const Name = 'Dummy';

class DummyProxy {
    constructor() {

    }
    async sendEmail(companyId, data) {
        console.log(`${Name} sendEmail companyid ${companyId} bookingid ${data.bookingData.id} type ${data.type}`);
    }
}

exports.DummyProxy = DummyProxy;

