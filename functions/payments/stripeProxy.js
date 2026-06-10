const functions = require("firebase-functions");
const settingsFunctions = require("../settings");
const bookingFunctions = require("../bookings");

const express = require("express");
const app = express();
app.use(express.static("."));
app.use(express.json());

const Name = 'Stripe';

class StripeProxy {
    constructor() {

    }
    async getDeepLink(elementAppCompanyId, id) {
        console.log('getDeepLink', Name);

        let stripeSettings = await getStripeSettings(elementAppCompanyId);

        let deepLink = null;

        //https://dashboard.stripe.com/test/payments/pi_1Il97DJEsdysTTN3Y2V6hMNl
        if (stripeSettings) {
            deepLink = stripeSettings.deepLinkBaseUri + id;
        }

        return deepLink;
    }
    async cancelPayment(elementAppCompanyId, paymentData) {
        console.log('cancelPayment', Name);

        let response = { result: false, status: '' };

        try {
            //https://stripe.com/docs/api/payment_intents/cancel            
            let paymentIntentId = paymentData.id;

            let stripeSettings = await getStripeSettingsWithChecks(elementAppCompanyId);
            let secretKey = stripeSettings.secretKey;

            const stripe = require("stripe")(secretKey);

            const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

            response.status = paymentIntent.status;
            if (paymentIntent.status === "canceled") {
                response.result = true;
            }
        }
        catch (error) {
            console.error(`Stripe cancelPayment error companyid: ${elementAppCompanyId} payment intent id: ${paymentIntentId}`);
        }

        return response;
    }

    async mapSettings(elementAppCompanyId, settings) {
        console.log('mapSettings', Name);

        return {
            pk: settings.stripe.publishableKey
        };
    }

    async hasCompletedCardPayment(elementAppCompanyId, paymentData) {
        console.log('hasCompletedCardPayment', Name);

        let hasCompletedCardPayment = false;

        if (paymentData && paymentData.status && paymentData.status === "succeeded") {
            hasCompletedCardPayment = true;
        }

        let response = {
            result: hasCompletedCardPayment
        };
        return response;
    }
}

exports.StripeProxy = StripeProxy;

exports.createPaymentIntent = functions.https.onCall(async (data, context) => {

    console.log('createPaymentIntent', data.companyId);

    if (!data.companyId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "companyId is not a valid argument"
        );
    }

    if (!data.paymentDetails) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "paymentDetails is not a valid argument"
        );
    }

    if (!data.booking) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "booking is not a valid argument"
        );
    }

    let elementAppCompanyId = data.companyId;
    let paymentDetails = data.paymentDetails;
    let booking = data.booking;
    let bookingId = booking.bookingId;

    let stripeSettings = await getStripeSettingsWithChecks(elementAppCompanyId);
    let secretKey = stripeSettings.secretKey;

    let client_secret = "";
    try {

        const stripe = require("stripe")(secretKey);

        //always create a customer in case the payment is taken but the bookin gprocess fails.
        //This is so a customer/payment can be found in stripe without the booking details
        const customer = await stripe.customers.create({
            description: booking.bookingRef,
            email: booking.email,
            name: booking.firstName + " " + booking.lastName
        });

        //stripe only accepts amounts without a decimal places (i.e in pence/cents)
        //alway multipl values by 100
        let amountWithoutDecimal = paymentDetails.amount * 100;

        //hard coded to EUR for now - should really be changed toa select GBP/EUR/CHF in the settings form
        let createIntentRequest = {
            amount: amountWithoutDecimal,
            currency: "eur",
            description: booking.bookingRef
        };
        if (customer) {
            createIntentRequest.customer = customer.id;
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create(createIntentRequest);
        client_secret = paymentIntent.client_secret;

        //update the booking asap. If an error occurs in the booking process this, 
        //along with the cutomer records will make it easier to find payments
        await bookingFunctions.setPaymentSummary(elementAppCompanyId, bookingId, { system: 'stripe', id: paymentIntent.id, status: paymentIntent.status });
    }
    catch (error) {
        console.log('createPaymentIntent error', error);
        throw new functions.https.HttpsError(
            "internal",
            "createPaymentIntent error"
        );
    }

    return {
        client_secret: client_secret
    }
});

const getStripeSettings = (async (companyId) => {

    let settings = await settingsFunctions.getSettingsData(companyId);

    let stripeSettings = settings.stripe;

    return stripeSettings;
});

const getStripeSettingsWithChecks = (async (companyId) => {

    let settings = await settingsFunctions.getSettingsData(companyId);

    let paymentSystemAllowed = settings.paymentSystemAllowed;
    let paymentSystemName = settings.paymentSystemName;
    let stripeSettings = settings.stripe;
    if (!paymentSystemAllowed ||
        paymentSystemAllowed !== true ||
        !paymentSystemName ||
        paymentSystemName === null ||
        paymentSystemName === '' ||
        paymentSystemName !== 'stripe' ||
        !stripeSettings) {

        throw new functions.https.HttpsError(
            "internal",
            "Payment system not configured"
        );
    }

    let secretKey = stripeSettings.secretKey;

    if (!secretKey || secretKey === null || secretKey === '') {
        throw new functions.https.HttpsError(
            "internal",
            "Stripe payment system not configured. Check API keys"
        );
    }

    return stripeSettings;
});