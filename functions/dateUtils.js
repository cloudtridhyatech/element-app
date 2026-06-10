// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require("firebase-admin");
const moment = require("moment");

// Tuesday July 13th 2021, 8:18:19 am
const humanReadableDateFormat = "dddd MMMM Do YYYY, HH:mm";

exports.convertDateOfUnknownTypeToUnixTimestamp = ((name, date) => {

    if (date) {
        /*
        console.log(`\n ${name}`);
        console.log("class is ", date.constructor.name);
        console.log("value is ", date);
        */
        if (date instanceof firebaseAdmin.firestore.Timestamp) {
            //console.log(`was Timestamp, is now: ${date.toDate().getTime()}\n`);
            return date.toDate().getTime();
        }
        if (date instanceof Date) {
            //console.log(`was Date, is now: ${date.getTime()}\n`);
            return date.getTime();
        }
        //console.log(`was neither Date nor Timestamp`);
        return null;
    }
    return null;
})

exports.formatUnknownTimestampAsHumanReadableDate = ((timeObject) => {
    if (timeObject) {

        let milliseconds = 0;
        if (timeObject instanceof firebaseAdmin.firestore.Timestamp) {
            milliseconds = timeObject.toMillis();
        }
        else {
            milliseconds = timeObject;
        }

        let formattedDateTime = moment.utc(milliseconds).format(humanReadableDateFormat);
        console.log('formatUnknownTimestampAsHumanReadableDate', timeObject, formattedDateTime, milliseconds);
        return formattedDateTime;
    }
    return null;
})

exports.convertFirestoreTimestampToMilliseconds = ((timeObject) => {
    if (timeObject) {
        if (timeObject instanceof firebaseAdmin.firestore.Timestamp) {
            console.log("timeObject is firestore.Timestamp");
            return timeObject.toMillis();
        } else if (
            Object.prototype.toString.call(timeObject) === "[object Object]"
        ) {
            // Check if it's a Map (accessed from Cloud Functions)
            const seconds = timeObject["_seconds"];
            const nanoseconds = timeObject["_nanoseconds"];
            if (seconds && nanoseconds) {
                console.log("timeObject is Map");
                return seconds * 1000;
            } else {
                console.error("is [object Object] but something wrong");
            }
        } else {
            console.error("timeObject is unknown object type.");
        }
    }
    return null;
})

exports.convertDateTimeToFirestoreTimestamp = ((dateTime) => {
    if (dateTime) {
        try {
            if (Object.prototype.toString.call(dateTime) === "[object Object]") {
                // Check if it's a Map (accessed from Cloud Functions)
                const seconds = dateTime["_seconds"];
                const nanoseconds = dateTime["_nanoseconds"];

                if (seconds && nanoseconds) {
                    console.log("date is Map");
                    const fbTimestamp = firebaseAdmin.firestore.Timestamp.fromMillis(seconds * 1000);
                    return fbTimestamp;
                } else {
                    console.error("is [object Object] but something wrong");
                    return null;
                }
            }
            else {
                const fbTimestamp = firebaseAdmin.firestore.Timestamp.fromMillis(dateTime);
                return fbTimestamp;
            }
        } catch (error) {
            console.error(
                "ERROR CONVERTING FROM JAVASCRIPT TO TIMESTAMP:",
                error.message
            );
        }
    }
    return null;
})

exports.formatDateTimeUTC = ((inputDateTime, format) => {
    if (inputDateTime) {

        let milliseconds = 0;

        if (inputDateTime.hasOwnProperty("seconds")) {
            milliseconds = inputDateTime.seconds * 1000;
        } else if (inputDateTime instanceof firebaseAdmin.firestore.Timestamp) {
            milliseconds = inputDateTime.toMillis();
        } else if (Object.prototype.toString.call(inputDateTime) === "[object Object]" && inputDateTime.hasOwnProperty("_seconds")) {
            milliseconds = inputDateTime["_seconds"] * 1000;
        } else if (Number.NaN(inputDateTime) === false) {
            milliseconds = inputDateTime;
        }

        if (milliseconds !== 0) {
            return moment.utc(milliseconds).format(format);
        }
    }
    return "";
})

