const moment = require("moment");
import { dateUtilsMixin } from "@/statics/utils/dateUtils.js";


export const getFirstPickUpTime = (journies) => {

    const pickUpDateTime = dateUtilsMixin.methods.mixinFormatDateTimeUTC(journies[0].pickUpDateTime, "HH:mm");
    return `${pickUpDateTime}`;
};

export const calculateTotalNumPassengers = (journies) => {
    return journies.reduce(function (prev, cur) {
        return prev + cur.numPassengers;
    }, 0);
};

export const calculateTotalNumBoosterSeats = (journies) => {
    return journies.reduce(function (prev, cur) {
        return prev + cur.transferObject.numBoosterSeats;
    }, 0);
};

export const calculateTotalNumChildSeats = (journies) => {
    return journies.reduce(function (prev, cur) {
        return prev + cur.transferObject.numChildSeats;
    }, 0);
};

export const calculateTotalNumBabySeats = (journies) => {
    return journies.reduce(function (prev, cur) {
        return prev + cur.transferObject.numBabySeats;
    }, 0);
};
