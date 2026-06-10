// ==UserScript==
// @name         Create users
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://localhost:4000/firestore/companies/*
// @grant        none
// ==/UserScript==

(function() {
  "use strict";
  const fakerScript = document.createElement("script");
  const momentScript = document.createElement("script");
  fakerScript.src =
    "https://cdnjs.cloudflare.com/ajax/libs/Faker/3.1.0/faker.min.js";
  document.body.appendChild(fakerScript);

  momentScript.src =
    "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.27.0/moment.min.js";

  document.body.appendChild(momentScript);

  setTimeout(() => {
    faker.seed(23);

    const container = document.querySelector(".Firestore-actions");

    const btn = document.createElement("button");
    btn.innerHTML = "Add 200 Bookings";
    btn.className = "mdc-button mdc-button--unelevated";
    btn.onclick = async () => {
      Array(1)
        .fill(0)
        .forEach((_, index) => {
          const bookingData = {
            address: "",
            companyId: "6515M7iTKqThTT997M7I",
            email: faker.internet.email(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            mobile: faker.phone.phoneNumber(),
            secondaryMobile: ""
          };

          // ms in 5 minutes.
          const coff = 1000 * 60 * 5;

          let inboundDate = faker.date.between("2020-11-13", "2020-11-16");
          // round up to next 5 mins
          inboundDate = new Date(
            Math.round(inboundDate.getTime() / coff) * coff
          );
          const delay = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
          const inboundDatePickUpTime = new Date(inboundDate.getTime() + delay);
          const tenDaysLater = new Date(
            inboundDate.getTime() + 10 * 24 * 60 * 60 * 1000
          );

          let outboundDate = faker.date.between(inboundDate, tenDaysLater);
          // round up to next 5 mins
          outboundDate = new Date(
            Math.round(outboundDate.getTime() / coff) * coff
          );

          console.log("outboundDate", outboundDate);
          const threeHours = 3 * 60 * 60 * 1000;
          const outboundDatePickUpTime = new Date(
            outboundDate.getTime() - threeHours
          );
          console.log("inboundDate", inboundDate);
          console.log("outboundDate", outboundDate);

          const numPassengersPrivate = faker.random.number({ min: 1, max: 12 });
          const numPassengersShared = faker.random.number({ min: 1, max: 6 });

          const numBabySeats = faker.random.number({ min: 0, max: 1 });
          const numBoosterSeats = faker.random.number({ min: 0, max: 1 });
          const numChildSeats = faker.random.number({ min: 0, max: 1 });

          const randomPrivateOrShared = faker.random.number({ min: 0, max: 1 });

          const randomResortNum = faker.random.number({ min: 0, max: 2 });
          const resorts = [
            "7vo3x4ggWQ2M7jLp5vwc",
            "UfiOedxVjbhHCdQpfS3P",
            "byj0o8BwiMsn3VNnmKX8"
          ]; // avo, mzn, les gets
          const randomResort = resorts[randomResortNum];

          const numPassengers =
            randomPrivateOrShared === 0
              ? numPassengersShared
              : numPassengersPrivate;

          const journies = [
            {
              ref: {
                lastName: bookingData.lastName,
                firstName: bookingData.firstName
              },
              accommodationId: "mhwmuecmBGf98NDQcA8o",
              flightArrivesDateTime: inboundDate,
              flightNumber: "EZY" + faker.random.number({ min: 1000, max: 9999 }),
              fromPlaceId: "9VmENLiy3sEnHEOONA4v",
              numBabySeats: numPassengers > 3 ? numBabySeats : 0,
              numBoosterSeats: numPassengers > 3 ? numBoosterSeats : 0,
              numChildSeats: numPassengers > 3 ? numChildSeats : 0,
              numPassengers: numPassengers,
              numSummerEquipment: 0,
              numWinterEquipment: 0,
              pickUpDateTime: inboundDatePickUpTime,
              price: "220",
              toPlaceId: randomResort,
              journeyType: randomPrivateOrShared === 0 ? "shared" : "private",
              status: "confirmed"
            },
            {
              ref: {
                lastName: bookingData.lastName,
                firstName: bookingData.firstName
              },
              accommodationId: "mhwmuecmBGf98NDQcA8o",
              flightDepartsDateTime: outboundDate,
              flightNumber: "EZY" + faker.random.number({ min: 1000, max: 9999 }),
              fromPlaceId: randomResort,
              numBabySeats: numPassengers > 3 ? numBabySeats : 0,
              numBoosterSeats: numPassengers > 3 ? numBoosterSeats : 0,
              numChildSeats: numPassengers > 3 ? numChildSeats : 0,
              numPassengers: numPassengers,
              numSummerEquipment: 0,
              numWinterEquipment: 0,
              pickUpDateTime: outboundDatePickUpTime,
              price: "220",
              toPlaceId: "9VmENLiy3sEnHEOONA4v",
              journeyType: randomPrivateOrShared === 0 ? "shared" : "private",
              status: "confirmed"
            }
          ];

          const companyKey = "6515M7iTKqThTT997M7I";

          setTimeout(() => {
            firestore
              .collection("companies")
              .doc(companyKey)
              .collection("bookings")
              .add(bookingData)
              .then(doc => {
                journies.forEach((journey, index) => {
                  journey.bookingId = doc.id;
                  firestore
                    .collection("companies")
                    .doc(companyKey)
                    .collection("journies")
                    .add(journey);
                });
              });
          }, index * 1000);
        });
    };

    container.appendChild(btn);
  }, 2000);
})();
