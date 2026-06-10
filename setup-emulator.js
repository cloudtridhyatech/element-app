/**
 * There is no way to export the contents of the firebase local authentication emulator.
 * This script, executed upon startup will populate the local auth emulator with data
 * held in the collection: 'companies/6515M7iTKqThTT997M7I/users' which we use for the 'morzine_transfer'
 * company used for development purposes.
 *
 * This script can be altered as shown below in comments to re-initialise users in the firebase
 * environment named 'element-app-development'. You might want to do this if you've just imported
 * a local dev firestore database into firebase/firestore dev environment
 *
 * This script was created following a guide in: https://github.com/firebase/firebase-tools/issues/2749
 */

const admin = require("firebase-admin");
const faker = require("faker/locale/en");
const readline = require("readline");
const moment = require("moment");
const algoliaSearch = require("algoliasearch");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// uncomment if you wish to initialise the users in firebase authentication in the
// environment named 'element-app-development'
// this json file should not be in source control
// var serviceAccount = require("./element-app-development-firebase-adminsdk.json");

let config = {
  // as above, uncomment crendential if you wish to initialise the users in firebase authentication in the
  // environment named 'element-app-development'
  // credential: admin.credential.cert(serviceAccount),

  projectId: "element-app-development"
};

admin.initializeApp(config);

const createUsersInAuthenticationEmulator = async () => {
  const auth = admin.auth();
  const firestore = admin.firestore();

  const usersSnapshot = await firestore
    .collection("companies/6515M7iTKqThTT997M7I/users")
    .get();
  usersSnapshot.forEach((doc, index) => {
    const data = doc.data();

    if (data.email) {
      console.log("creating user in authentication emulator: ", data.email);
      auth.createUser({
        uid: doc.id,
        email: data.email,
        password: data.email,
        displayName: `${data.firstName} ${data.lastName}`
      });
    }
  });
};


const formatDateAsText = (dateTime) => {
  return moment.utc(dateTime.getTime()).format("YYYY-MM-DD");
}

const getEnv = (config) => {

  let env = config.hosting.environment
    ? config.hosting.environment
    : "dev";

  if (config.algolia.env) {
    env = config.algolia.env;
  }

  console.log('getEnv', env);

  return env;
};

const createBookingsAndJourniesUsingFaker = async (
  numFakeBookings,
  startDate,
  endDate
) => {
  const firestore = admin.firestore();

  faker.seed(23);

  const companyId = "6515M7iTKqThTT997M7I";
  const companyKey = "morzine_transfer";

  let config = require('./functions/.runtimeconfig.json');
  if (!config || config === null) {
    //try root
    config = require('./.runtimeconfig.json');
    if (!config || config === null) {
      console.log('Cant find .runtimeconfig.json');
      return;
    }
  }

  const ENV = getEnv(config);

  const ALGOLIA_APP_ID = config.algolia.application_id;
  const ALGOLIA_ADMIN_KEY = config.algolia.admin_api_key;
  const indexSuffix = "bookings";
  const algoliaClient = algoliaSearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
  let initIndex = `${ENV}_${companyKey}_${indexSuffix}`;
  console.log('algoliaClient.initIndex', initIndex);
  const algoliaIndex = algoliaClient.initIndex(initIndex);

  let collections = [
    "bookings",
    "journies",
    "transfers",
    "events",
  ];

  let count = 0;

  for (let i = 0; i < collections.length; i++) {

    let name = collections[i];
    const ref = firestore.collection(`companies/${companyId}/${name}`);

    let snapshot = await ref.get();

    for (const doc of snapshot.docs) {
      firestore.collection(`companies/${companyId}/${name}`).doc(doc.id).delete().then(() => {
        count++;
        return null;
      }).catch((error) => {
        console.error(`Error removing ${name} item: `, error);
      });
    }
  }

  console.log(`Deleted ${count} items! in ${collections.length} collections`);

  const resorts = [
    "7vo3x4ggWQ2M7jLp5vwc",
    "UfiOedxVjbhHCdQpfS3P",
    "byj0o8BwiMsn3VNnmKX8"
  ]; // avo, mzn, les gets

  const resortCodes = [
    "AVO",
    "MZN",
    "LGE"
  ]; // avo, mzn, les gets  
  const distances = [
    93.5,
    80.4,
    77
  ]; // avo, mzn, les gets
  const prices = [
    245,
    235,
    220,
    210,
    195
  ];
  const trueOrFalse = [
    true,
    false
  ];
  const genevaAirportPlaceId = "9VmENLiy3sEnHEOONA4v";
  const genevaAirportCode = "GVA";

  let accommodationIds = [
    "",
    "mhwmuecmBGf98NDQcA8o",
    "fDitzjAv3vIiSnxFxtZR",
    "dgsG28rQ3nKrfGefctDg"
  ];

  let accommodationNames = [
    "",
    "Chalet Alice / Custom Breaks / Morzine",
    "Apartment Pleny/ More Mountain/ Morzine",
    "Apartment Central"
  ];


  const airports = [
    "Luton",
    "Gatwick",
    "Glasgow",
    "",
    "Manchester",
    "Bristol"
  ];

  Array(numFakeBookings)
    .fill(0)
    .forEach((_, index) => {

      const created = admin.firestore.FieldValue.serverTimestamp();

      const bookingData = {
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        mobile: faker.phone.phoneNumber(),
        secondaryMobile: "",
        created: created,
        lastModified: created,
        customerNotes: "",
        internalNotes: "",
        journiesArray: [],
        transfersArray: [],
      };

      bookingData.bookingRef = createBookingRef(bookingData.lastName);

      // ms in 5 minutes.
      const coff = 1000 * 60 * 5;

      let inboundDate = faker.date.between(startDate, endDate);
      // round up to next 5 mins
      inboundDate = new Date(Math.round(inboundDate.getTime() / coff) * coff);
      const delay = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
      const inboundDatePickUpTime = new Date(inboundDate.getTime() + delay);
      const tenDaysLater = new Date(
        inboundDate.getTime() + 10 * 24 * 60 * 60 * 1000
      );

      let outboundDate = faker.date.between(inboundDate, tenDaysLater);
      // round up to next 5 mins
      outboundDate = new Date(Math.round(outboundDate.getTime() / coff) * coff);

      const threeHours = 3 * 60 * 60 * 1000;
      const outboundDatePickUpTime = new Date(
        outboundDate.getTime() - threeHours
      );

      const numPassengersPrivate = faker.random.number({ min: 1, max: 12 });
      const numPassengersShared = faker.random.number({ min: 1, max: 6 });

      const numBabySeats = faker.random.number({ min: 0, max: 1 });
      const numBoosterSeats = faker.random.number({ min: 0, max: 1 });
      const numChildSeats = faker.random.number({ min: 0, max: 1 });

      const randomPrivateOrShared = faker.random.number({ min: 0, max: 1 });

      const randomResortNum = faker.random.number({ min: 0, max: 2 });

      const randomResort = resorts[randomResortNum];
      const randomResortCode = resortCodes[randomResortNum];
      const randomResortDistance = distances[randomResortNum];

      const randomAirport = faker.random.number({ min: 0, max: (airports.length - 1) });
      const randomPrice1 = faker.random.number({ min: 0, max: (prices.length - 1) });
      const randomPrice2 = faker.random.number({ min: 0, max: (prices.length - 1) });
      const includeFlightNumberYesNo1 = faker.random.number({ min: 0, max: (trueOrFalse.length - 1) });
      const includeFlightNumberYesNo2 = faker.random.number({ min: 0, max: (trueOrFalse.length - 1) });
      let flightNumber1 = "";
      let flightNumber2 = "";
      if (trueOrFalse[includeFlightNumberYesNo1] === true) {
        flightNumber1 = "EZY" + faker.random.number({ min: 1000, max: 9999 });
      }
      if (trueOrFalse[includeFlightNumberYesNo2] === true) {
        flightNumber2 = "EZY" + faker.random.number({ min: 1000, max: 9999 });
      }
      let randomSkiNum = faker.random.number({ min: 0, max: 5 });
      let randomBikeNum = faker.random.number({ min: 0, max: 5 });

      let include2ndjourney = trueOrFalse[faker.random.number({ min: 0, max: (trueOrFalse.length - 1) })];

      const randomAccommIndex = faker.random.number({ min: 0, max: (accommodationIds.length - 1) });
      let accommodationId = accommodationIds[randomAccommIndex];
      let accommodationLabel = accommodationNames[randomAccommIndex];

      let enquiryOrConfirmed = trueOrFalse[faker.random.number({ min: 0, max: (trueOrFalse.length - 1) })];

      let status = enquiryOrConfirmed ? "enquiry" : "confirmed";

      const numPassengers =
        randomPrivateOrShared === 0
          ? numPassengersShared
          : numPassengersPrivate;



      bookingData.journiesArray.push({
          numPassengers: numPassengers,
          pickUpDateTime: inboundDatePickUpTime,
          pickUpDate: formatDateAsText(inboundDatePickUpTime),
        status: status,
          created: created,
          lastModified: created,
      });

      if (include2ndjourney === true) {
        bookingData.journiesArray.push({
          numPassengers: numPassengers,
          pickUpDateTime: outboundDatePickUpTime,
          pickUpDate: formatDateAsText(outboundDatePickUpTime),
          status: status,
          created: created,
          lastModified: created,
        });
      }

      const journeyType = randomPrivateOrShared === 0 ? "shared" : "private";

      bookingData.transfersArray.push({
          price: prices[randomPrice1],
          pricingRuleUsed: null,
          routeSummary: {
            distance: randomResortDistance,
            secondaryTVARateApplies: true,
            secondaryTVARateAllocation: 12,
            fromCode: genevaAirportCode,
            toCode: randomResortCode
          },
          created: created,
          lastModified: created,
          journeyType: journeyType,
          accommodationId: accommodationId,
          accommodation: {
            label: accommodationLabel,
            value: accommodationId
          },
          fromPlaceId: genevaAirportPlaceId,
          toPlaceId: randomResort,
          flightNumber: flightNumber1,
          flyingFrom: airports[randomAirport],
          flightArrivesDateTime: inboundDate,
          ref: {
            lastName: bookingData.lastName,
            firstName: bookingData.firstName
          },
          numBabySeats: numPassengers > 3 ? numBabySeats : 0,
          numBoosterSeats: numPassengers > 3 ? numBoosterSeats : 0,
          numChildSeats: numPassengers > 3 ? numChildSeats : 0,
          numSummerEquipment: randomBikeNum,
          numWinterEquipment: randomSkiNum,
        address: "",
      });

      if (include2ndjourney === true) {
        bookingData.transfersArray.push({
          price: prices[randomPrice2],
          pricingRuleUsed: null,
          routeSummary: {
            distance: randomResortDistance,
            secondaryTVARateApplies: true,
            secondaryTVARateAllocation: 12,
            fromCode: randomResortCode,
            toCode: genevaAirportCode
          },
          created: created,
          lastModified: created,
          journeyType: journeyType,
          accommodationId: accommodationId,
          accommodation: {
            label: accommodationLabel,
            value: accommodationId
          },
          fromPlaceId: randomResort,
          toPlaceId: genevaAirportPlaceId,
          flightNumber: flightNumber2,
          flyingFrom: "",
          flightDepartsDateTime: outboundDate,
          ref: {
            lastName: bookingData.lastName,
            firstName: bookingData.firstName
          },
          numBabySeats: numPassengers > 3 ? numBabySeats : 0,
          numBoosterSeats: numPassengers > 3 ? numBoosterSeats : 0,
          numChildSeats: numPassengers > 3 ? numChildSeats : 0,
          numSummerEquipment: randomBikeNum,
          numWinterEquipment: randomSkiNum,
          address: "",
        });
      }

      let bookingRef = firestore.collection(`companies/${companyId}/bookings`);
      let journeyRef = firestore.collection(`companies/${companyId}/journies`);
      let transferRef = firestore.collection(`companies/${companyId}/transfers`);

      let journies = bookingData.journiesArray;
      let transfers = bookingData.transfersArray;
      delete bookingData.journiesArray;
      delete bookingData.transfersArray;

      return bookingRef
        .add(bookingData)
        .then((bookingDoc) => {

          let bookingDocId = bookingDoc.id;

          bookingDoc.get().then((newBookingDoc) => {
            //console.log('newBookingDoc.data()', newBookingDoc.data());

            addOrUpdateBookingInAlgoliaIndex(algoliaIndex, bookingDocId, newBookingDoc.data())
              .then(response => {
                return null;
              });
          });

          journies.forEach((journey, index) => {
            let transfer = transfers[index];
            transfer.bookingId = bookingDocId;

            transferRef.add(transfer)
              .then(transferDoc => {
                journey.bookingId = bookingDocId;
                journey.transferId = transferDoc.id;

                journeyRef
                  .add(journey).then(journeyDoc => {
                    console.log(`${bookingData.lastName} Bookingid ${bookingDocId}, TransferId: ${transferDoc.id}, JourneyId: ${journeyDoc.id}`);
                });
              });
          });


        })
        .catch(error => {
          console.error("Unable to create dummy booking.", error);
        });
    });
};

async function addOrUpdateBookingInAlgoliaIndex(algoliaIndex, id, data) {
  try {

    // connect the objects together on the two platforms by using the firestore doc id as the id for each record on algolia
    const algoliaObjectId = id;
    const sanitisedData = sanitiseBookingDataForAlgolia(data);

    await algoliaIndex
      .saveObject({
        ...sanitisedData,
        objectID: algoliaObjectId
      })
      .wait()
      .then(response => {
        return console.log(
          `Booking ${id} addOrUpdateBookingInAlgoliaIndex Complete`,
          response
        );
      }).catch(error => {
        console.log(`Booking ${id} addOrUpdateBookingInAlgoliaIndex error: `, error);
      })
      .finally(() => {
      });
  } catch (error) {
    console.log(`Booking ${id} addOrUpdateBookingInAlgoliaIndex error: `, error);
  }
  return null;
}

function sanitiseBookingDataForAlgolia(data) {
  let booking = {};

  booking.bookingRef = data.bookingRef;
  booking.firstName = data.firstName;
  booking.lastName = data.lastName;
  booking.email = data.email;
  booking.mobile = data.mobile;
  booking.mobileSearchable = data.mobile.replace(/\D/g, "");
  booking.secondaryMobile = data.secondaryMobile;
  booking.secondaryMobileSearchable = data.secondaryMobile.replace(/\D/g, "");
  booking.created = convertDateOfUnknownTypeToUnixTimestamp(data.created);
  booking.lastModified = convertDateOfUnknownTypeToUnixTimestamp(data.lastModified);

  return booking;
}

function convertDateOfUnknownTypeToUnixTimestamp(date) {

  if (date) {
    if (date instanceof admin.firestore.Timestamp) {
      return date.toDate().getTime();
    }
    if (date instanceof Date) {
      return date.getTime();
    }
    console.log('convertDateOfUnknownTypeToUnixTimestamp UNKNOWN!!');
    return null;
  }
  return null;
}

function createBookingRef(lastName) {

  let bookingRef = "";
  if (lastName) {
    bookingRef = lastName.toUpperCase();
  }

  let now = Date.now().toString(); // '1492341545873'
  // pad with extra random digit
  now += now + Math.floor(Math.random() * 10);
  // format
  return bookingRef + "-" + [now.slice(0, 4), now.slice(4, 10), now.slice(10, 14)].join("-");
}

(async () => {
  // createUsersInAuthenticationEmulator();

  let startDate = moment.utc().add(20, 'days').format("YYYY-MM-DD");
  let endDate = moment.utc().add(27, 'days').format("YYYY-MM-DD");

  //createBookingsAndJourniesUsingFaker(100, startDate, endDate);

  // used to keep firebase emulator alive
  rl.question("Hit CTRL+C to close", () => {});
})();
