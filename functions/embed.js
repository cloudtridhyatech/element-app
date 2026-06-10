const functions = require("firebase-functions");
const settingsFunctions = require("./settings");
const paymentsFunctions = require("./paymentsFacade");

exports.getSettings = functions.https.onCall(async (data, context) => {

    if (!data.companyId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "companyId is not a valid argument"
        );
    }

    let companyId = data.companyId;

    let editableSettings = await settingsFunctions.getEditableSettingsData(companyId);

    let paymentSystemSettings = await paymentsFunctions.getPaymentSystemSettings(companyId);

    let paymentsEnabled = paymentSystemSettings.paymentsEnabled;
    let paymentSystemName = paymentSystemSettings.paymentSystemName;
    delete paymentSystemSettings.paymentsEnabled;
    delete paymentSystemSettings.paymentSystemName;

    //avoid exposing more settings than required in public UI
    let response = {
        paymentSystemName: paymentSystemName,
        tandcLink: editableSettings.tandcLink,
        paymentsEnabled: paymentsEnabled,
        paymentCompanyName: editableSettings.paymentCompanyName,
        contactPhoneNumber: editableSettings.contactPhoneNumber,
        contactEmail: editableSettings.contactEmail,
        paymentSystem: paymentSystemSettings
    };

    return response;
});