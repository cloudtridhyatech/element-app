const settingsFunctions = require("../settings");
const companyFunctions = require("../company");
const emailTypes = require('./types');
const dateUtilsFunctions = require("../dateUtils");

// using Twilio SendGrid's v3 Node.js Library
// https://sendgrid.com/
// https://github.com/sendgrid/sendgrid-nodejs
// https://github.com/sendgrid/sendgrid-nodejs/tree/main/packages/mail
const sgMail = require("@sendgrid/mail/index");

const Name = 'SendGrid';

class SendGridProxy {
    constructor() {

    }

    async sendEmail(companyId, data) {

        let bookingData = { ...data.bookingData };
        console.log(`${Name} sendEmail companyid ${companyId} bookingid ${data.bookingData.id} type ${data.type}`);

        let title = data.title;
        let body = data.body;

        if (data.link) {
            bookingData.link = data.link;
        }
        let templateId = "";

        switch (data.type) {
            case emailTypes.EmailType.new:
                templateId = "newBookingEmailTemplateId";
                break;
            case emailTypes.EmailType.modified:
                templateId = "modifiedBookingEmailTemplateId";
                break;
            case emailTypes.EmailType.resend:
                templateId = "resendBookingEmailTemplateId";
                break;
            case emailTypes.EmailType.enquiry:
                templateId = "enquiryBookingEmailTemplateId";
                break;
            case emailTypes.EmailType.payment:
                templateId = "paymentConfirmationEmailTemplateId";
                break;
            case emailTypes.EmailType.paymentLink:
                templateId = "paymentLinkEmailTemplateId";
                break;
            default:
                break;
        }

        if (templateId !== "" && title && title !== "" && title !== null) {
            await sendBookingEmail(companyId, bookingData, title, body, templateId);
        }

        return null;
    }
}

exports.SendGridProxy = SendGridProxy;

const sendBookingEmail = (async (companyId, bookingData, title, body, templateIdName) => {
  
    try {
        console.log(`${Name} sendBookingEmail title ${title} templateIdName ${templateIdName}`);

        let editableSettings = await settingsFunctions.getEditableSettingsData(companyId);

        let sgMailSettings = editableSettings.sgMail;
        if (sgMailSettings) {

            let templateId = getTextValueOrNull(sgMailSettings[templateIdName]);
            let emailFromAddress = getTextValueOrNull(editableSettings.emailFromAddress);

            if (templateId !== null && emailFromAddress !== null) {

                let companyData = await companyFunctions.getCompanyData(companyId);
                let data = getBookingEmailData(title, body, bookingData, companyData);
                let msg = prepareEmail(
                    emailFromAddress,
                    bookingData.email,
                    templateId,
                    data);

                if (msg !== null) {
                    let mailService = getMailService(editableSettings);
                    if (mailService !== null) {
                        await mailService.send(msg);
                    }
                }
            }
            else {
                console.error("Cannot prepareEmail. emailFromAddress or templateId not configured in --editableSettings--");
            }
        } else {
            console.error("sgMail not configured in --editableSettings--. Email", title, " cannot be sent");
        }

    }
    catch (error) {
        console.error("sendBookingEmail error:", error);
        if (error.response.body.errors) {
            error.response.body.errors.forEach((item) => {
                console.error("sendBookingEmail body error:", item);
            });
        }
    }
    return null;
})


const getMailService = ((settings) => {

    let mailService = null;
    let sgMailSettings = settings.sgMail;

    if (sgMailSettings && sgMailSettings.sendmailApiKey && sgMailSettings.sendmailApiKey !== null && sgMailSettings.sendmailApiKey !== "") {
        mailService = new sgMail.MailService();
        mailService.setApiKey(sgMailSettings.sendmailApiKey);
    }
    else {
        console.error('getMailService cannot call sgMail setApiKey, setting sendmailApiKey has no value');
    }
    return mailService;
})

const prepareEmail = ((emailFromAddress, emailToAddress, templateId, data) => {
    console.log(`prepareEmail ${emailToAddress}, templateId: ${templateId}`);

    let emailData = {
        to: emailToAddress,
        from: emailFromAddress,
        templateId: templateId,
        dynamic_template_data: data
    };

    return emailData;
})

const getTextValueOrNull = (value) => {

    if (value && value !== null && value !== "") {
        return value;
    }
    return null;
}

/**
 * Transforms a booking into JSON data that can be sent to SendGrid
 * 
 * @param {*} title 
 * @param {*} bookingData 
 * @param {*} companyData 
 * @returns JSON data containing the booking and transfer data.
 */
const getBookingEmailData = ((title, body, bookingData, companyData) => {

    let transferData = [];
    let total = 0;
    if (bookingData.transfersArray) {
        bookingData.transfersArray.forEach(transfer => {

            total += transfer.price;

            let from = "";
            let to = "";
            let routeSummary = transfer.routeSummary;
            let pickUpDate = '';
            let numPassengers = '';

            if (bookingData.journiesArray && bookingData.journiesArray.length > 0) {
                //just find any transfer in the journies array for this transfer
                let index = bookingData.journiesArray.findIndex(x => x.transferId === transfer.id);
                if (index > -1) {
                    let journey = bookingData.journiesArray[index];
                    pickUpDate = journey.pickUpDate;
                    numPassengers = String(journey.numPassengers);
                }
            }

            if (typeof (routeSummary) !== 'undefined') {
                from = routeSummary.fromCode;
                to = routeSummary.toCode;
            }

            let transferObject =
            {
                journeyType: transfer.journeyType,
                numPassengers: numPassengers,
                flightDepartsDateTime: dateUtilsFunctions.formatUnknownTimestampAsHumanReadableDate(transfer.flightDepartsDateTime),
                flightArrivesDateTime: dateUtilsFunctions.formatUnknownTimestampAsHumanReadableDate(transfer.flightArrivesDateTime),
                flightDepartsDateTimeRAW: transfer.flightDepartsDateTime,
                flightArrivesDateTimeRAW: transfer.flightArrivesDateTime,
                pickUpDate: pickUpDate,
                flightNumber: transfer.flightNumber,
                flyingFrom: transfer.flightFrom,

                from: from,
                to: to,

                numBabySeats: transfer.numBabySeats,
                numBoosterSeats: transfer.numBoosterSeats,
                numChildSeats: transfer.numChildSeats,
                numSummerEquipment: transfer.numSummerEquipment,
                numWinterEquipment: transfer.numWinterEquipment,
            };

            transferData.push(transferObject);
        });
    }

    let response = {
        subject: title,
        body: body,
        bookingRef: bookingData.bookingRef,
        companyName: companyData.companyName,
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        transfers: transferData,
        totalPrice: total
    };

    if (bookingData.link) {
        response.link = bookingData.link;
    }

    console.log('getBookingEmailData', response);

    return response;
})