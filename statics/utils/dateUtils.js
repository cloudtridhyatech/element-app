import moment from "moment";
import firebase from "firebase/app";

export const formatFirestoreTime = inputDate => {
  if (inputDate && inputDate.hasOwnProperty("seconds")) {
    return moment(inputDate.seconds * 1000).format("HH:mm");
  } else {
    // it's not a firestore object but a javascript date

    if (inputDate) {
      return moment(inputDate).format("HH:mm");
    }
    return "";
  }
  return "";
};

export const formatFirestoreDate = inputDate => {
  if (inputDate && inputDate.hasOwnProperty("seconds")) {
    return moment(inputDate.seconds * 1000).format("MMMM Do");
  } else {
    // it's not a firestore object but a javascript date
    if (inputDate) {
      return moment(inputDate).format("MMM Do");
    }
    return "";
  }
  return "";
};

export const formatFirestoreDateAndTime = (inputDate, inFormat) => {
  let format = "MMMM Do HH:mm";
  if (inFormat) {
    format = inFormat;
  }

  if (inputDate && inputDate.hasOwnProperty("seconds")) {
    return moment(inputDate.seconds * 1000).format(format);
  } else {
    // it's not a firestore object but a javascript date
    if (inputDate) {
      return moment(inputDate).format(format);
    }
    return "";
  }
  return "";
};

const formatDateTimeUTC = (inputDateTime, format) => {
  if (inputDateTime) {

    let milliseconds = 0;

    if (inputDateTime.hasOwnProperty("seconds")) {
      milliseconds = inputDateTime.seconds * 1000;
    }
    else {
      // it's not a firestore object but a javascript date      
      milliseconds = inputDateTime;
    }
    return moment.utc(milliseconds).format(format);
  }
  return "";
}

const formatDateTime = (inputDateTime, format) => {
  if (inputDateTime) {

    let milliseconds = 0;

    if (inputDateTime.hasOwnProperty("seconds")) {
      milliseconds = inputDateTime.seconds * 1000;
    }
    else {
      // it's not a firestore object but a javascript date      
      milliseconds = inputDateTime;
    }
    return moment(milliseconds).format(format);
  }
  return "";
}

export const dateUtilsMixin = {
  methods: {
    mixinFormatFirestoreTime(inputDate) {
      return formatFirestoreTime(inputDate);
    },
    mixinFormatFirestoreDate(inputDate) {
      return formatFirestoreDate(inputDate);
    },
    mixinFormatFirestoreDateAndTime(inputDate, format) {
      return formatFirestoreDateAndTime(inputDate, format);
    },
    mixinFormatDateTimeUTC(inputDateTime, format) {
      return formatDateTimeUTC(inputDateTime, format);
    },
    mixinFormatDateTime(inputDateTime, format) {
      return formatDateTime(inputDateTime, format);
    }
  }
};

export const convertFromMillisToFirestoreTimestampIfRequired = timeObject => {
  if (timeObject && typeof timeObject === "number") {
    console.log(timeObject, " is type ", typeof timeObject);
    try {
      return firebase.firestore.Timestamp.fromMillis(timeObject);
    } catch (error) {
      console.error(
        "ERROR CONVERTING FROM MILLISECONDS TO TIMESTAMP:",
        error.message
      );
    }
  }

  // looke like we don't have a number, so return the orignal value
  return timeObject;
};

export const convertFirestoreTimestampToMillis = timeObject => {
  if (timeObject) {
    if (timeObject instanceof firebase.firestore.Timestamp) {
      console.log("timeObject is firestore.Timestamp");
      return timeObject.seconds * 1000;
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
};
