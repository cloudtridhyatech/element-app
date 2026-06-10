const functions = require("firebase-functions");
const dummy = require("./email/dummyProxy");
const sendgrid = require("./email/sendGridProxy");
const emailTypes = require("./email/types");
const settingsFunctions = require("./settings");

const sendEmailMethod = "sendEmail";

const getEmailProxy = async (elementAppCompanyId, settingsRef = null) => {
  // only available system is 'sendgrid'
  let systemName = "sendgrid";

  //There is only one email at the moment so it's hard coded
  //If a different email was introduced uncomment the section below and add the
  //emailSystemName to --settings--
  /*
    try {
        let settings = await settingsFunctions.getSettingsData(elementAppCompanyId);

        if (settings && settings.emailSystemName && settings.emailSystemName !== null) {
            systemName = settings.emailSystemName;
        }
    } catch (error) {
        console.error("Unable to pull email setting from the data store", error);
        throw new functions.https.HttpsError(
            "internal",
            "Unable to pull email setting from the data store"
        );
    }
    */

  return createEmailProxy(systemName);
};

const createEmailProxy = systemName => {
  let proxy;

  let systemNameLowerCase = "";
  if (systemName && systemName !== null && systemName !== "") {
    systemNameLowerCase = systemName.toLowerCase();
  }

  switch (systemNameLowerCase) {
    case "sendgrid":
      proxy = new sendgrid.SendGridProxy();
      break;
    default:
      proxy = new dummy.DummyProxy();
      break;
  }

  return proxy;
};

exports.sendNewBookingEmail = async (elementAppCompanyId, bookingData) => {
  const method = "sendNewBookingEmail";
  console.log(`emailFacade ${method}`, elementAppCompanyId);

  try {
    const system = await getEmailProxy(elementAppCompanyId);
    const emailTitleAndBody = await getEmailTitleAndBody(
      elementAppCompanyId,
      "emailTitleNewBooking",
      "emailCopyNewBooking"
    );

    if (system && system.can(sendEmailMethod)) {
      let data = {
        bookingData: bookingData,
        title: emailTitleAndBody.title,
        body: emailTitleAndBody.body,
        type: emailTypes.EmailType.new
      };
      await system.sendEmail(elementAppCompanyId, data);
    } else {
      console.log(`${method} not supported`);
    }
  } catch (error) {
    console.error(`${method} ${elementAppCompanyId} error:`, error);
  }
  return null;
};

exports.sendModifiedBookingEmail = async (elementAppCompanyId, bookingData) => {
  const method = "sendModifiedBookingEmail";
  console.log(`emailFacade ${method}`, elementAppCompanyId);

  try {
    const system = await getEmailProxy(elementAppCompanyId);
    const emailTitleAndBody = await getEmailTitleAndBody(
      elementAppCompanyId,
      "emailTitleModifiedBooking",
      "emailCopyModifiedBooking"
    );

    if (system && system.can(sendEmailMethod)) {
      let data = {
        bookingData: bookingData,
        title: emailTitleAndBody.title,
        body: emailTitleAndBody.body,
        type: emailTypes.EmailType.modified
      };
      await system.sendEmail(elementAppCompanyId, data);
    } else {
      console.log(`${method} not supported`);
    }
  } catch (error) {
    console.error(`${method} ${elementAppCompanyId} error:`, error);
  }
  return null;
};

exports.resendBookingEmail = async (elementAppCompanyId, bookingData) => {
  const method = "resendBookingEmail";
  console.log(`emailFacade ${method}`, elementAppCompanyId);

  try {
    const system = await getEmailProxy(elementAppCompanyId);
    const emailTitleAndBody = await getEmailTitleAndBody(
      elementAppCompanyId,
      "emailTitleResendBooking",
      "emailCopyResendBooking"
    );

    if (system && system.can(sendEmailMethod)) {
      let data = {
        bookingData: bookingData,
        title: emailTitleAndBody.title,
        body: emailTitleAndBody.body,
        type: emailTypes.EmailType.resend
      };
      await system.sendEmail(elementAppCompanyId, data);
    } else {
      console.log(`${method} not supported`);
    }
  } catch (error) {
    console.error(`${method} ${elementAppCompanyId} error:`, error);
  }

  return null;
};

exports.sendBookingEnquiryEmail = async (elementAppCompanyId, bookingData) => {
  const method = "sendBookingEnquiryEmail";
  console.log(`emailFacade ${method}`, elementAppCompanyId);

  try {
    const system = await getEmailProxy(elementAppCompanyId);
    const emailTitleAndBody = await getEmailTitleAndBody(
      elementAppCompanyId,
      "emailTitleEnquiryBooking",
      "emailCopyEnquiryBooking"
    );

    if (system && system.can(sendEmailMethod)) {
      let data = {
        bookingData: bookingData,
        title: emailTitleAndBody.title,
        body: emailTitleAndBody.body,
        type: emailTypes.EmailType.enquiry
      };
      await system.sendEmail(elementAppCompanyId, data);
    } else {
      console.log(`${method} not supported`);
    }
  } catch (error) {
    console.error(`${method} ${elementAppCompanyId} error:`, error);
  }
  return null;
};

exports.sendPaymentConfirmationEmail = async (
  elementAppCompanyId,
  bookingData
) => {
  const method = "sendPaymentConfirmationEmail";
  console.log(`emailFacade ${method}`, elementAppCompanyId);

  try {
    const system = await getEmailProxy(elementAppCompanyId);
    const emailTitleAndBody = await getEmailTitleAndBody(
      elementAppCompanyId,
      "emailTitlePaymentConfirmation",
      "emailCopyPaymentConfirmation"
    );

    if (system && system.can(sendEmailMethod)) {
      let data = {
        bookingData: bookingData,
        title: emailTitleAndBody.title,
        body: emailTitleAndBody.body,
        type: emailTypes.EmailType.payment
      };
      await system.sendEmail(elementAppCompanyId, data);
    } else {
      console.log(`${method} not supported`);
    }
  } catch (error) {
    console.error(`${method} ${elementAppCompanyId} error:`, error);
  }
  return null;
};

exports.sendPaymentLinkEmail = async (elementAppCompanyId, bookingData) => {
  const method = "sendPaymentLinkEmail";
  console.log(`emailFacade ${method}`, elementAppCompanyId);

  try {
    const system = await getEmailProxy(elementAppCompanyId);
    const emailTitleAndBody = await getEmailTitleAndBody(
      elementAppCompanyId,
      "emailTitlePaymentLink",
      "emailCopyPaymentLink"
    );

    if (system && system.can(sendEmailMethod)) {
      let editableSettings = await settingsFunctions.getEditableSettingsData(
        elementAppCompanyId
      );

      if (
        editableSettings &&
        editableSettings.emailPaymentLinkBaseUri &&
        editableSettings.emailPaymentLinkBaseUri !== null &&
        editableSettings.emailPaymentLinkBaseUri !== ""
      ) {
        let paymentLink = `${editableSettings.emailPaymentLinkBaseUri}/${elementAppCompanyId}?ref=${bookingData.id}`;

        let data = {
          bookingData: bookingData,
          title: emailTitleAndBody.title,
          body: emailTitleAndBody.body,
          type: emailTypes.EmailType.paymentLink,
          link: paymentLink
        };
        await system.sendEmail(elementAppCompanyId, data);
      }
    } else {
      console.log(`${method} not supported`);
    }
  } catch (error) {
    console.error(`${method} ${elementAppCompanyId} error:`, error);
  }
  return null;
};

const getEmailTitle = async (
  elementAppCompanyId,
  titleName,
  settingsRef = null
) => {
  //a default
  let title = "Booking";

  let editableSettings =
    settingsRef !== null
      ? settingsRef
      : await settingsFunctions.getEditableSettingsData(elementAppCompanyId);

  if (editableSettings) {
    let settingsTitle = editableSettings[titleName];

    if (settingsTitle && settingsTitle !== null && settingsTitle !== "") {
      title = settingsTitle;
    }
  }

  return title;
};

const getEmailTitleAndBody = async (
  elementAppCompanyId,
  titleName,
  bodyName,
  settingsRef = null
) => {
  //a default
  let title = "Booking";
  let body = "";

  let editableSettings =
    settingsRef !== null
      ? settingsRef
      : await settingsFunctions.getEditableSettingsData(elementAppCompanyId);

  if (editableSettings) {
    let settingsTitle = editableSettings[titleName];

    if (settingsTitle && settingsTitle !== null && settingsTitle !== "") {
      title = settingsTitle;
    }

    // an empty value is acceptable
    body = editableSettings[bodyName];
  }

  return { "title": title, "body": body };
};