const functions = require("firebase-functions");
const dateUtilsFunctions = require("./dateUtils");
const transferFunctions = require("./transfers");
const journiesFunctions = require("./journies");
const invoicingFunctions = require("./invoicingFacade");
const paymentsFunctions = require("./paymentsFacade");
const emailFunctions = require("./emailFacade");
const searchFunctions = require("./searchFacade");

// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require("firebase-admin");

const db = firebaseAdmin.firestore();

const { firestore } = require("firebase-admin");

const getCollectionReferenceBookings = (companyId) => {
  return `companies/${companyId}/bookings`;
};

const getDocumentReferenceBookings = (companyId, id) => {
  return `${getCollectionReferenceBookings(companyId)}/${id}`;
};

const getCollectionBookings = (companyId) => {
  return db.collection(getCollectionReferenceBookings(companyId));
};

const getDocumentReferenceBooking = (companyId, id) => {
  return db.doc(getDocumentReferenceBookings(companyId, id));
};

const handleSetBookingData = (async (companyId, bookingId, name, value) => {
  let savedBookingRef = getDocumentReferenceBooking(companyId, bookingId);

  let lastModified = firebaseAdmin.firestore.FieldValue.serverTimestamp();

  let data = { lastModified: lastModified };
  data[name] = value;

  await savedBookingRef.set(data, { merge: true });
  return null;
})

exports.bookingOnCreate = functions.firestore
  .document("/companies/{companyId}/bookings/{bookingId}")
  .onCreate(async (snapshot, context) => {
    let bookingData = snapshot.data();

    let companyId = context.params.companyId;
    let bookingId = context.params.bookingId;

    return null;
  });

exports.bookingOnUpdate = functions.firestore
  .document("/companies/{companyId}/bookings/{bookingId}")
  .onUpdate(async (snapshot, context) => {
    const oldData = snapshot.before.data();
    const newdata = snapshot.after.data();

    if (newdata.lastModified.seconds === oldData.lastModified.seconds) {
      console.log("booking unchanged");
      return null;
    }

    return null;
  });

exports.executeFulltextSearchOfBookings = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can execute Full text Search Of Bookings"
      );
    }

    if (!data.companyId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "companyId is not a valid argument"
      );
    } 

    let searchResults = await searchFunctions.searchBookings(data.companyId, data);
    return searchResults;
  }
);

/*
 * IMPORTANT NOTE
 * Callable statements treat date objects differently.
 *
 * https://stackoverflow.com/questions/53520674/returning-dates-server-timestamps-in-cloud-callable-functions
 *
 * All the callable statements contained below, accept date objects as milliseconds since epoch and
 * they all return date objects as milliseconds since epoch
 */
exports.createBooking = functions.https.onCall(async (data, context) => {

  if (!data.companyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "companyId is not a valid argument"
    );
  }

  const bookingData = data;
  const companyId = bookingData.companyId;
  const journiesArrayData = bookingData.journiesArray;
  const invoicableTransfers = bookingData.transfersArray;
  
  let isConfirmed = bookingData.isConfirmed;
  let isOnlineBooking = false;
  if (bookingData.isOnlineBooking && bookingData.isOnlineBooking === true) {
    isOnlineBooking = true;
  }
  delete bookingData.isOnlineBooking;  

  // remove the companyId from the booking data
  delete bookingData.companyId;
  delete bookingData.isConfirmed;
  // remove the jounriesArray attribute from the booking data as we want to add these in root level documents
  delete bookingData.journiesArray;
  delete bookingData.transfersArray;

  if (bookingData) {
    // create a unique booking reference
    bookingData.bookingRef = bookingData.lastName
      ? bookingData.lastName.toUpperCase()
      : "";
    bookingData.bookingRef =
      bookingData.bookingRef + "-" + createUniqueBookingRefNumber();
    const created = firebaseAdmin.firestore.FieldValue.serverTimestamp();
    bookingData.created = created;
    bookingData.lastModified = created;

    const bookingRef = getCollectionBookings(companyId);
    const booking = await bookingRef.add(bookingData);
    const bookingId = booking.id;

    // await the fetch of the new booking document
    const newBookingDoc = await booking.get();

    if (!newBookingDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "booking could not be found"
      );
    }

    //reset dates/times for Algolia insert
    delete bookingData.created;
    delete bookingData.lastModified;

    const newBookingData = newBookingDoc.data();

    bookingData.created = newBookingData.created;
    bookingData.lastModified = newBookingData.lastModified;

    await searchFunctions.addBooking(companyId, bookingId, bookingData);

    journiesArrayData.forEach((item, index) => {

      //for booking create, the journey to transfer mapping will be 1-to-1
      //so just assign by index
      let transferObject = invoicableTransfers[index];
      transferObject.bookingId = bookingId;
      item.transferObject = transferObject;
    });

    journiesFunctions.addJournies(
      companyId,
      bookingData.firstName,
      bookingData.lastName,
      bookingId,
      journiesArrayData
    );

    let invoiceCallSuccess = true;
    let invoiceCallErrorMessage = '';

    //reassign id, journies + transfers before Invoicing and emailing
    bookingData.id = bookingId;
    bookingData.journiesArray = journiesArrayData;
    bookingData.transfersArray = invoicableTransfers;
    bookingData.isOnlineBooking = isOnlineBooking;

    if (isConfirmed === true) {
      await emailFunctions.sendNewBookingEmail(companyId, bookingData);
    }
    else {
      await emailFunctions.sendBookingEnquiryEmail(companyId, bookingData);
    }

    try {
      let invoiceSummary = await invoicingFunctions.createContactAndInvoice(
        companyId,
        bookingData
      );
      if (invoiceSummary !== null) {
        console.log('Updating Booking with invoice summary:', invoiceSummary);

        await handleSetBookingData(companyId, bookingId, "invoiceSummary", invoiceSummary);
      }
    }
    catch (error) {
      invoiceCallSuccess = false;
      if (typeof (error.message) !== 'undefined') {
        invoiceCallErrorMessage = error.message;
      }
    }

    return {
      bookingId: bookingId,
      invoiceCallSuccess: invoiceCallSuccess,
      invoiceCallErrorMessage: invoiceCallErrorMessage,
      bookingRef: bookingData.bookingRef
    };
  } else {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "no booking data has been supplied"
    );
  }
});

exports.updateBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can update bookings"
    );
  }

  if (!data.companyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "companyId is not a valid argument"
    );
  }

  if (!data.id) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "id is not a valid argument (the booking id)"
    );
  }

  const bookingData = data;
  const bookingId = bookingData.id;
  const companyId = bookingData.companyId;
  const journiesArrayData = bookingData.journiesArray;
  const transfersArrayData = bookingData.transfersArray;

  const created = dateUtilsFunctions.convertFirestoreTimestampToMilliseconds(
    bookingData.created
  );

  // remove the bookingId from the booking data
  delete bookingData.id;
  // remove the companyId from the booking data
  delete bookingData.companyId;
  // remove the jounriesArray attribute from the booking data as we want to add these in root level documents
  delete bookingData.journiesArray;
  delete bookingData.transfersArray;
  // remove the created timestamp data to prevent tampering
  delete bookingData.created;

  let hasPayments = false;
  if (bookingData.invoiceSummary) {
    delete bookingData.invoiceSummary.deepLink;
    hasPayments = bookingData.invoiceSummary.hasPayments === true;
    delete bookingData.invoiceSummary.hasPayments;
    delete bookingData.invoiceSummary.hasLoadError;
  }

  if (bookingData.paymentSummary) {
    delete bookingData.paymentSummary.deepLink;
    delete bookingData.paymentSummary.hasCompletedCardPayment;
  }

  let createInvoice = false;
  if (bookingData.createInvoice === true) {
    createInvoice = true;
  }
  delete bookingData.createInvoice;

  if (bookingData) {
    const bookingRef = getDocumentReferenceBooking(companyId, bookingId);

    // asyncronously add the new booking
    bookingData.lastModified = firebaseAdmin.firestore.FieldValue.serverTimestamp();
    const editedBooking = await bookingRef.update(bookingData);

    //reassign dates before Angolia update
    bookingData.created = new Date(created);
    bookingData.lastModified = editedBooking.writeTime.toDate();

    await searchFunctions.updateBooking(companyId, bookingId, bookingData);

    //the journey/transfer link must be save before the journies are updated
    let invoicableTransfers = [];
    let invoicableJournies = [];
    let transferIds = [];
    journiesArrayData.forEach(journey => {
      if ((typeof journey.active) === 'undefined' || journey.active === true) {

        invoicableJournies.push(journey);
        let transferObject = journey.transferObject;
        if (typeof (journey.id) === 'undefined') {
          //a new journey transfer pair - always add as a 1-to-1 mapping
          invoicableTransfers.push(transferObject);
        }
        else {
          //Existng transfer...don't add the same transfer twice
          if (transferIds.includes(transferObject.id) === false) {
            console.log('transferLookup.findIndex NOT FOUND');
            transferIds.push(transferObject.id);
            invoicableTransfers.push(transferObject);
          }
          else {
            console.log('transferLookup.findIndex FOUND');
          }
        }
      }
    });
    console.log('invoicableTransfers count:', invoicableTransfers.length);

    journiesFunctions.addOrUpdateJournies(
      companyId,
      bookingData.firstName,
      bookingData.lastName,
      bookingId,
      journiesArrayData
    );
    
    let invoiceCallSuccess = true;
    let invoiceCallErrorMessage = "";
    if (bookingData.invoiceSummary || createInvoice) {
      if (hasPayments === false) {

        //reassign only the relevamt journies + transfers before Invoicing
        //It is possbile that this is a craete or update invoice so both must be supplied
        bookingData.journiesArray = invoicableJournies;
        bookingData.transfersArray = invoicableTransfers;
        bookingData.isOnlineBooking = false;

        let response = await handleUpdateBookingInvoice(companyId, bookingId, createInvoice, bookingData);
        invoiceCallSuccess = response.invoiceCallSuccess;
        invoiceCallErrorMessage = response.invoiceCallErrorMessage;
      }
      else {
        console.log(`Booking ${bookingData.bookingRef} ${bookingId} has payment(s) so invoice not updated`);
      }  
    }

    return { bookingId: bookingId, invoiceCallSuccess: invoiceCallSuccess, invoiceCallErrorMessage: invoiceCallErrorMessage };
  } else {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "no booking data has been supplied"
    );
  }
});

exports.setPaymentSummary = async (
  companyId,
  bookingId,
  paymentSummary) => handleSetPaymentSummary(companyId, bookingId, paymentSummary);

async function handleSetPaymentSummary(companyId, bookingId, paymentSummary) {
  await handleSetBookingData(companyId, bookingId, "paymentSummary", paymentSummary);
  return null;
}

exports.finaliseEmbedBooking = functions.https.onCall(async (data, context) => {

  if (!data.companyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "companyId is not a valid argument"
    );
  }

  if (!data.id) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "id is not a valid argument (the booking id)"
    );
  }

  const bookingId = data.id;
  const companyId = data.companyId;

  let bookingData = await handleGetBooking(companyId, bookingId);

  //transfers must be relinked before email sent
  let transfers = bookingData.transfersArray && bookingData.transfersArray.length > 0 ? bookingData.transfersArray : [];
  bookingData.journiesArray.forEach(async (journey) => {
    journey.transferObject = {};
    let transfer = findTransferByTransferId(transfers, journey.transferId);
    if (transfer && transfer !== null) {
      journey.transferObject = transfer;
    }
  });

  if (data.isPaymentComplete === true) {

    let paymentId = '';
    if (bookingData.paymentSummary && data.status) {
      paymentId = bookingData.paymentSummary.id;
      let paymentSummary = { ...bookingData.paymentSummary };
      paymentSummary.status = data.status;
      await handleSetPaymentSummary(companyId, bookingId, paymentSummary);
    }

    //update all journies to confirmed    
    bookingData.journiesArray.forEach(async (journey) => {
      journey.status = "confirmed";
      await journiesFunctions.updateJourneyStatus(companyId, journey.id, "confirmed");
    });

    //send a Payment confirmation email    
    await emailFunctions.sendPaymentConfirmationEmail(companyId, bookingData);

    if (bookingData.invoiceSummary) {
      let invoiceSummaryCopy = { ...bookingData.invoiceSummary };
      invoiceSummaryCopy.paymentId = paymentId;
      await invoicingFunctions.setInvoicePaid(companyId, invoiceSummaryCopy);
    }
  }
  else if (data.isPaymentComplete === false) {

    if (bookingData.paymentSummary) {
      let response = await paymentsFunctions.cancelPayment(companyId, bookingData.paymentSummary);
      if (response && response.status) {
        let paymentSummary = { ...bookingData.paymentSummary };
        paymentSummary.status = response.status;
        await handleSetPaymentSummary(companyId, bookingId, paymentSummary);
      }
    }

    //send an enquiry email only
    await emailFunctions.sendBookingEnquiryEmail(companyId, bookingData);
  }

});

async function handleUpdateBookingInvoice(companyId, bookingId, createInvoice, bookingData) {

  let invoiceCallSuccess = true;
  let invoiceCallErrorMessage = "";

  try {

    if (createInvoice === true) {
      let invoiceSummary = await invoicingFunctions.createContactAndInvoice(
        companyId,
        bookingData
      );
      if (invoiceSummary !== null) {
        console.log('Updating Booking with invoice summary:', invoiceSummary);

        await handleSetBookingData(companyId, bookingId, "invoiceSummary", invoiceSummary);
      }
    } else {
      await invoicingFunctions.updateInvoice(companyId, bookingData);
    }
  }
  catch (error) {
    invoiceCallSuccess = false;
    if (typeof (error.message) !== 'undefined') {
      invoiceCallErrorMessage = error.message;
    }
  }

  return { bookingId: bookingId, invoiceCallSuccess: invoiceCallSuccess, invoiceCallErrorMessage: invoiceCallErrorMessage };
}

exports.getBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can read bookings"
    );
  }

  if (!data.bookingId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "bookingId is not a valid argument"
    );
  }

  if (!data.companyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "companyId is not a valid argument"
    );
  }

  return await handleGetBooking(data.companyId, data.bookingId, false);
});

/* An unauthorised version of get booking for payment links only
  THis retunrs the bare minimum information to make a payment from a provided link
*/
exports.getBookingForPayment = functions.https.onCall(async (data, context) => {

  if (!data.bookingId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "bookingId is not a valid argument"
    );
  }

  if (!data.companyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "companyId is not a valid argument"
    );
  }

  let bookingId = data.bookingId;
  let companyId = data.companyId;
  let response = null;

  try {
    let loadedBooking = await handleGetBooking(companyId, bookingId, false);

    let hasCompletedCardPayment = false;
    if (loadedBooking.paymentSummary && loadedBooking.paymentSummary !== null) {

      if (loadedBooking.paymentSummary.hasCompletedCardPayment === true) {
        hasCompletedCardPayment = true;
      }
    }

    if (hasCompletedCardPayment === false) {
      let totalDue = 0;
      let transfers = loadedBooking.transfersArray && loadedBooking.transfersArray.length > 0 ? loadedBooking.transfersArray : [];
      transfers.forEach((item) => {
        totalDue += item.price;
      });

      response = {
        email: loadedBooking.email,
        firstName: loadedBooking.firstName,
        lastName: loadedBooking.lastName,
        bookingRef: loadedBooking.bookingRef,
        bookingId: loadedBooking.id,
        companyId: companyId,
        totalDue: totalDue
      };
    }
    else {
      response = {
        bookingRef: loadedBooking.bookingRef,
        bookingId: loadedBooking.id,
        hasAlreadyPaid: true
      };
    }
  }
  catch (error) {
    console.error(`getBookingForPayment booking: ${bookingId} companyId: ${companyId}`, error);
    response = null;
  }

  return response;
});

async function handleGetBooking(companyId, bookingId, reThrowErrors = true) {

  console.log(`Function handleGetBooking booking: ${bookingId} companyId: ${companyId}`);

  const bookingRef = getDocumentReferenceBooking(companyId, bookingId);

  // await the fetch of the booking document
  const bookingDoc = await bookingRef.get();

  if (bookingDoc.exists) {
    let existingBooking = bookingDoc.data();
    existingBooking.id = bookingDoc.id;

    if (existingBooking.paymentSummary && existingBooking.paymentSummary !== null) {

      let deepLink = await paymentsFunctions.getDeepLink(
        companyId,
        existingBooking.paymentSummary
      );
      if (deepLink && deepLink !== null) {
        existingBooking.paymentSummary.deepLink = deepLink;
      }

      let response = await paymentsFunctions.hasCompletedCardPayment(companyId, existingBooking.paymentSummary);
      if (response && response !== null && response.result === true) {
        existingBooking.paymentSummary.hasCompletedCardPayment = true;
      }
    }

    existingBooking.journiesArray = await journiesFunctions.getJourniesByBookingId(
      companyId,
      existingBooking.id
    );

    // Only search for referenced transfers i.e. must be referenced by a journey
    let transferIds = [];
    existingBooking.journiesArray.forEach((item) => {
      if (item.transferId) {
        if (transferIds.includes(item.transferId) === false) {
          transferIds.push(item.transferId);
        }
      }
    });

    let transfers = await transferFunctions.getTransfersByTransferIds(
      companyId,
      transferIds
    );
    existingBooking.transfersArray = transfers;

    if (existingBooking.invoiceSummary) {
      let deepLink = await invoicingFunctions.getDeepLink(
        companyId,
        existingBooking.invoiceSummary
      );
      existingBooking.invoiceSummary.deepLink = deepLink;

      try {
        let response = await invoicingFunctions.getInvoice(companyId, existingBooking.invoiceSummary);
        existingBooking.invoiceSummary.hasPayments = response && response !== null && response.hasPayments;
      }
      catch (error) {
        console.error(`handleGetBooking Invoice retrieve error booking: ${bookingId} companyId: ${companyId}`, error);
        //in cerain scearios, we want the booking load to continue even if
        //there are error contacting the invoice system
        if (reThrowErrors === true) {
          throw (error);
        }
        existingBooking.invoiceSummary.hasLoadError = true;
      }
    }

    console.log("Function handleGetBooking returning booking:", existingBooking);
    return existingBooking;
  } else {
    throw new functions.https.HttpsError(
      "not-found",
      "booking could not be found"
    );
  }
}

/*Redundant. covered in get booking
exports.getBookingInvoice = functions.https.onCall(async (data, context) => {

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can read bookings"
    );
  }

  if (!data.companyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "companyId is not a valid argument"
    );
  }

  if (!data.bookingId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "bookingId is not a valid argument"
    );
  }


  let companyId = data.companyId;
  let bookingId = data.bookingId;

  let existingBooking = await handleGetBooking(companyId, bookingId);

  let getBookingInvoiceResponse = {
    hasPayments: false
  };

  if (existingBooking && existingBooking.invoiceSummary) {
    let response = await invoicingFunctions.getInvoice(companyId, existingBooking.invoiceSummary);
    if (response !== null) {
      getBookingInvoiceResponse.id = response.id;
      getBookingInvoiceResponse.hasPayments = response.hasPayments;
    }
  } else {
    console.log(`getBookingInvoice Booking ${existingBooking.bookingRef} ${bookingId} has no invoice.`);
  }

  return getBookingInvoiceResponse;
});
*/
/*Redundant. if required move to journies.js ???
exports.getJourney = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can read journies"
    );
  }

  if (!data.journeyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "journeyId is not a valid argument"
    );
  }

  if (!data.companyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "companyId is not a valid argument"
    );
  }

  const journeyRef = db.doc(
    `companies/${data.companyId}/journies/${data.journeyId}`
  );

  // await the fetch of the booking document
  const journeyDoc = await journeyRef.get();

  if (journeyDoc.exists) {
    const existingJourney = journeyDoc.data();
    existingJourney.id = journeyDoc.id;

    // sanitizeJourneyDatesForReading(existingJourney);

    return existingJourney;
  } else {
    throw new functions.https.HttpsError(
      "not-found",
      "journey could not be found"
    );
  }
});
*/

exports.syncFirestoreAlgolia = async (
  companyId,
  companyKey
) => {

  console.log('syncFirestoreAlgolia bookings');

  let searchResults = [];

  try {
    searchResults = await searchFunctions.searchBookings(companyId, { hitsPerPage: 150 });
  } catch (error) {
    console.error('syncFirestoreAlgolia searchBookings error:', error);
  }

  searchResults.forEach(async hit => {

    let hitObjectID = hit.objectID;

    const bookingRef = getDocumentReferenceBooking(companyId, hitObjectID);

    // await the fetch of the booking document
    const bookingDoc = await bookingRef.get();

    if (bookingDoc.exists) {

      const bookingData = bookingDoc.data();
      console.log('Booking Found:', bookingDoc.id/*, bookingData*/);
      await searchFunctions.addBooking(companyId, hitObjectID, bookingData);
    }
    else {
      console.log('Booking Not Found:', hitObjectID);
      await searchFunctions.deleteBooking(companyId, hitObjectID);
    }
  });
};

exports.sendBookingEmail = functions.https.onCall(
  async (data, context) => {

    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can execute Full text Search Of Bookings"
      );
    }

    if (!data.companyId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "companyId is not a valid argument"
      );
    }

    if (!data.bookingId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "bookingId is not a valid argument"
      );
    }

    let companyId = data.companyId;
    let bookingId = data.bookingId;

    console.log('sendBookingEmail', data);
    if (data.isManualResend === true || data.isUpdateResend === true || data.isSendPaymentLink === true) {
      let bookingData = await handleGetBooking(companyId, bookingId, false);

      if (data.isManualResend === true) {
        await emailFunctions.resendBookingEmail(companyId, bookingData);
      }
      if (data.isUpdateResend === true) {
        await emailFunctions.sendModifiedBookingEmail(companyId, bookingData);
      }
      if (data.isSendPaymentLink === true) {
        await emailFunctions.sendPaymentLinkEmail(companyId, bookingData);
      }
    }

    return null;
  });

function createUniqueBookingRefNumber() {
  let now = Date.now().toString(); // '1492341545873'
  // pad with extra random digit
  now += now + Math.floor(Math.random() * 10);
  // format
  return [now.slice(0, 4), now.slice(4, 10), now.slice(10, 14)].join("-");
}

function findTransferByTransferId(transfers, transferId) {
  let transfer = null;
  let index = transfers.findIndex(item => item.id === transferId);
  if (index !== -1) {
    transfer = transfers[index];
  }
  return transfer;
}