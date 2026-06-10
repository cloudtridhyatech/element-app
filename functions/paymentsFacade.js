const functions = require("firebase-functions");
const dummy = require('./payments/dummyProxy');
const stripe = require('./payments/stripeProxy');
const settingsFunctions = require("./settings");

const getPaymentProxy = (async (elementAppCompanyId, settingsRef = null) => {
    let systemName = "";
    try {
        let settings = settingsRef !== null ? settingsRef : await settingsFunctions.getSettingsData(elementAppCompanyId);

        if (settings && settings.paymentSystemName && settings.paymentSystemName !== null) {
            systemName = settings.paymentSystemName;
        }
    } catch (error) {
        console.error("Unable to pull payment setting from the data store", error);
        throw new functions.https.HttpsError(
            "internal",
            "Unable to pull payment setting from the data store"
        );
    }

    return createPaymentProxy(systemName);
});


const createPaymentProxy = (systemName) => {

    let proxy;

    let systemNameLowerCase = "";
    if (systemName && systemName !== null && systemName !== "") {
        systemNameLowerCase = systemName.toLowerCase();
    }

    switch (systemNameLowerCase) {
        case 'stripe':
            proxy = new stripe.StripeProxy();
            break;
        default:
            proxy = new dummy.DummyProxy();
            break;
    }

    return proxy;
};

exports.cancelPayment = (async (elementAppCompanyId, paymentSummary) => {

    let response = { result: false, status: '' };

    if (!paymentSummary) {
        return response;
    }

    const system = createPaymentProxy(paymentSummary.system);

    if (system && system.can("cancelPayment")) {
        let cancelResponse = await system.cancelPayment(elementAppCompanyId, paymentSummary);
        console.log(`cancelPayment companyId: ${elementAppCompanyId} response:`, cancelResponse);
        if (cancelResponse && cancelResponse.result === true) {
            response.status = cancelResponse.status;
            response.result = true;
        }
    }
    else {
        console.log("cancelPayment not supported");
    }

    return response;
});

exports.getDeepLink = (async (elementAppCompanyId, paymentSummary) => {

    let deepLink = null;

    if (!paymentSummary.system || paymentSummary.system === null || paymentSummary.system === '') {
        return deepLink;
    }

    const system = createPaymentProxy(paymentSummary.system);

    if (system && system.can("getDeepLink")) {
        deepLink = await system.getDeepLink(elementAppCompanyId, paymentSummary.id);
    }
    else {
        console.log("getDeepLink not supported");
    }

    return deepLink;
});

exports.getPaymentSystemSettings = (async (elementAppCompanyId) => {

    let settings = await settingsFunctions.getSettingsData(elementAppCompanyId);

    let response = {
        paymentsEnabled: false,
        paymentSystemName: ''
    };

    if (!settings) {
        return response;
    }

    let paymentSystemAllowed = settings.paymentSystemAllowed;
    let paymentSystemName = settings.paymentSystemName;
    if (paymentSystemAllowed && paymentSystemAllowed === true && paymentSystemName && paymentSystemName !== null && paymentSystemName !== '') {
        response.paymentsEnabled = true;
        response.paymentSystemName = paymentSystemName;

        let system = await getPaymentProxy(elementAppCompanyId, settings);

        let paymentSystemSettings = {};

        if (system && system.can("mapSettings")) {
            paymentSystemSettings = await system.mapSettings(elementAppCompanyId, settings);
        }
        else {
            console.log("mapSettings not supported");
        }

        response[paymentSystemName] = paymentSystemSettings;
    }
    return response;
});

exports.hasCompletedCardPayment = (async (elementAppCompanyId, paymentSummary) => {

    let response = null;

    if (!paymentSummary.system || paymentSummary.system === null || paymentSummary.system === '') {
        return response;
    }

    const system = createPaymentProxy(paymentSummary.system);

    if (system && system.can("hasCompletedCardPayment")) {
        let systemResponse = await system.hasCompletedCardPayment(elementAppCompanyId, paymentSummary);

        response = {
            result: systemResponse.result
        };
    }
    else {
        console.log("hasCompletedCardPayment not supported");
    }

    return response;
});