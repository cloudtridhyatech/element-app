import moment from "moment";
const perPerson = "Per Person";
const ruleTimeFormat = "HH:mm:ss";
const ruleDateFormat = "YYYY-MM-DD";

const hasAvailableRestriction = ((restriction) => {

    if (restriction && restriction !== null && restriction !== '') {
        return true;
    }
    return false;
})

const isJourneyTypeAvailable = ((pr, journeyType) => {
    if (!pr.journeyType || pr.journeyType === null || pr.journeyType === '' || pr.journeyType === "all") {
        return true;
    }
    return pr.journeyType === journeyType;
})

const isFromAndToPlacesAvailable = ((pr, fromPlaceId, toPlaceId) => {

    let isMatch = false;

    if (hasAvailableRestriction(pr.fromPlaceId) === false && hasAvailableRestriction(pr.toPlaceId) === false) {
        // everywhere to everywhere
        // console.log("  isFromAndToPlacesAvailable: Everywhere to Everywhere");
        console.log("  TEST NOT RUN: isFromAndToPlacesAvailable");
        isMatch = true;
    } else {
        if (pr.fromPlaceId === fromPlaceId && pr.toPlaceId === toPlaceId) {
            console.log("  TEST PASSED: isFromAndToPlacesAvailable: Exact match");
            isMatch = true;
        } else if (pr.bidirectional && pr.fromPlaceId === toPlaceId && pr.toPlaceId === fromPlaceId) {
            console.log("  TEST PASSED: isFromAndToPlacesAvailable: Bidirectional");
            isMatch = true;
        }
    }

    return isMatch;
})

const isPickUpOnDayOfWeekAvailable = ((pr, pickUpDateTime) => {

    let isMatch = false;

    if (pr.availableDaysOfWeek && pr.availableDaysOfWeek.length > 0) {

        let dateTimeWrapper = moment(pickUpDateTime);
        let iso = dateTimeWrapper.isoWeekday();

        if (pr.availableDaysOfWeek.includes(iso) === true) {
            isMatch = true;
        }
    }
    else {
        //Day of week not specified
        console.log("  TEST NOT RUN: isPickUpOnDayOfWeekAvailable");
        isMatch = true;
    }

    return isMatch;
})

const isPricingRuleValidForDateTime = ((pr, dateTime) => {

    let isQuoteFromDateTimeMatch = false;
    let isQuoteToDateTimeMatch = false;

    let hasQuoteDateTimeFromRestriction = hasAvailableRestriction(pr.quoteDateTimeFrom);
    let hasQuoteDateTimeToRestriction = hasAvailableRestriction(pr.quoteDateTimeTo);

    if (hasQuoteDateTimeFromRestriction === true) {
        isQuoteFromDateTimeMatch = dateTime >= pr.quoteDateTimeFrom;
    } else {
        //No restrictions
        isQuoteFromDateTimeMatch = true;
    }

    if (hasQuoteDateTimeToRestriction === true) {
        isQuoteToDateTimeMatch = dateTime <= pr.quoteDateTimeTo;
    } else {
        //No restrictions
        isQuoteToDateTimeMatch = true;
    }

    return isQuoteFromDateTimeMatch && isQuoteToDateTimeMatch;
})

const hasAvailableDateFrom = ((pr) => {
    return hasAvailableRestriction(pr.availableDateFrom);
})

const hasAvailableDateTo = ((pr) => {
    return hasAvailableRestriction(pr.availableDateTo);
})

const hasAvailableTimeFrom = ((pr) => {
    return hasAvailableRestriction(pr.availableTimeFrom);
})

const hasAvailableTimeTo = ((pr) => {
    return hasAvailableRestriction(pr.availableTimeTo);
})

const isPickUpBetweenTimes = ((pr, pickUpDateTime) => {
    let dateTimeWrapper = moment(pickUpDateTime);
    let availableTimeFrom = moment(pr.availableTimeFrom, ruleTimeFormat);
    let availableTimeTo = moment(pr.availableTimeTo, ruleTimeFormat);

    // we need to set the date on the wrapper to the same as those we're using directly above in availableTimeFrom and availableTimeTo
    dateTimeWrapper.set({
        year: availableTimeFrom.get("year"),
        month: availableTimeFrom.get("month"),
        date: availableTimeFrom.get("date")
    });

    if (
        availableTimeFrom.isSameOrBefore(dateTimeWrapper) &&
        dateTimeWrapper.isSameOrBefore(availableTimeTo)
    ) {
        console.log("    TEST PASSED: isPickUpBetweenTimes");
        return true;
    }

    console.log("    TEST FAILED: isPickUpBetweenTimes");
    return false;
})

const isPickUpBetweenDates = ((pr, pickUpDateTime) => {

    console.log(`    ${pr.id} isPickUpBetweenDates ${pr.availableDateFrom} ${pr.availableDateTo}`);

    let availableDateFrom = moment(pr.availableDateFrom, ruleDateFormat);
    let dateTimeWrapper = moment(pickUpDateTime);
    let availableDateTo = moment(pr.availableDateTo, ruleDateFormat);

    if (
        availableDateFrom.isSameOrBefore(dateTimeWrapper) &&
        dateTimeWrapper.isSameOrBefore(availableDateTo)
    ) {
        console.log("    TEST PASSED: isPickUpBetweenDates");
        return true;
    }

    console.log("    TEST FAILED: isPickUpBetweenDates");
    return false;
})

const isPricingRuleFreeOfDateTimeRestrictions = ((pr) => {

    if (hasAvailableDateFrom(pr) === false &&
        hasAvailableDateTo(pr) === false &&
        hasAvailableTimeFrom(pr) === false &&
        hasAvailableTimeTo(pr) === false
    ) {
        console.log("  TEST PASSED: isPricingRuleFreeOfDateTimeRestrictions");
        return true;
    }

    console.log("  TEST NOT RUN: isPricingRuleFreeOfDateTimeRestrictions");

    return false;
})

const isPickUpBetweenRuleFromAndToDates = ((pr, pickUpDateTime) => {
    if (hasAvailableDateFrom(pr) === true &&
        hasAvailableDateTo(pr) === true &&
        hasAvailableTimeFrom(pr) === false &&
        hasAvailableTimeTo(pr) === false
    ) {
        if (isPickUpBetweenDates(pr, pickUpDateTime)) {
            console.log("  TEST PASSED: isPickUpBetweenRuleFromAndToDates");
            return true;
        }
    }

    console.log("  TEST NOT RUN: isPickUpBetweenRuleFromAndToDates");
    return false;
})

const isPickUpBetweenRuleFromAndToTimes = ((pr, pickUpDateTime) => {
    if (hasAvailableDateFrom(pr) === false &&
        hasAvailableDateTo(pr) === false &&
        hasAvailableTimeFrom(pr) === true &&
        hasAvailableTimeTo(pr) === true
    ) {
        return isPickUpBetweenTimes(pr, pickUpDateTime);
    }

    console.log("  TEST NOT RUN: isPickUpBetweenRuleFromAndToTimes");
})

const isPickUpBetweenRuleFromAndToDatesAndTimes = ((pr, pickUpDateTime) => {
    if (hasAvailableDateFrom(pr) === true &&
        hasAvailableDateTo(pr) === true &&
        hasAvailableTimeFrom(pr) === true &&
        hasAvailableTimeTo(pr) === true
    ) {
        return isPickUpBetweenDates(pr, pickUpDateTime) && isPickUpBetweenTimes(pr, pickUpDateTime);
    }

    console.log("  TEST NOT RUN: isPickUpBetweenRuleFromAndToDatesAndTimes");

    return false;
})

const isPickUpBetweenAvailabilityDates = ((pr, pickUpDateTime) => {
    if (isPricingRuleFreeOfDateTimeRestrictions(pr) === true) {
        return true;
    }

    if (isPickUpBetweenRuleFromAndToDates(pr, pickUpDateTime) === true) {
        return true;
    }

    if (isPickUpBetweenRuleFromAndToTimes(pr, pickUpDateTime) === true) {
        return true;
    }

    if (isPickUpBetweenRuleFromAndToDatesAndTimes(pr, pickUpDateTime) === true) {
        return true;
    }

    return false;
})

const isPricingRulePerMatch = ((pr, numPassengers) => {

    let isMatch = false;

    if (numPassengers && numPassengers > 0 && pr.pricingByGroupOrPerson === perPerson) {
        let index = numPassengers - 1;
        // we need to look in pricesArray
        if (pr.pricesArray &&
            pr.pricesArray[index] &&
            pr.pricesArray[index].cumulativePrice &&
            pr.pricesArray[index].cumulativePrice !== 0
        ) {
            isMatch = true;
        }
    }
    else {
        //not per person so always a match
        console.log("  TEST NOT RUN: isPricingRulePerMatch");
        isMatch = true;
    }

    return isMatch;
})

export const getPricingListMatches = (request) => {
    // Note: all pricing rules are active in the cache
    // Note: the cache is already ordered according to the priority we need so we can start at the top
    let matchedPricingRules = [];

    let pricingRulesList = request.pricingRulesList;
    let journeyType = request.journeyType;
    let fromPlaceId = request.fromPlaceId;
    let toPlaceId = request.toPlaceId;
    let numPassengers = request.numPassengers;
    let pickUpDateTime = request.pickUpDateTime;

    let quoteDateTime = moment().valueOf();

    console.log("Total pricingRulesList rule:", pricingRulesList.length);
    for (let pr of pricingRulesList) {
        console.log(`pricingRule: ${pr.id} ${pr.name}`);

        if (isJourneyTypeAvailable(pr, journeyType) === false) {
            console.log(`pricingRule: ${pr.id} TEST FAILED: isJourneyTypeAvailable`);
            continue;
        }

        if (isFromAndToPlacesAvailable(pr, fromPlaceId, toPlaceId) === false) {
            console.log(`pricingRule: ${pr.id} TEST FAILED: isFromAndToDestinationsAvailable`);
            continue;
        }

        if (isPickUpOnDayOfWeekAvailable(pr, pickUpDateTime) === false) {
            console.log(`pricingRule: ${pr.id} TEST FAILED: isPickUpOnDayOfWeekAvailable`);
            continue;
        }

        if (isPricingRuleValidForDateTime(pr, quoteDateTime) === false) {
            console.log(`pricingRule: ${pr.id} TEST FAILED: isPricingRuleValidForDateTime`);
            continue;
        }

        if (isPickUpBetweenAvailabilityDates(pr, pickUpDateTime) === false) {
            console.log(`pricingRule: ${pr.id} TEST FAILED: isPickUpBetweenAvailabilityDates`);
            continue;
        }

        // all dates and times work, let's continue testing this pricing rule
        if (isPricingRulePerMatch(pr, numPassengers) === false) {
            console.log(`pricingRule: ${pr.id} TEST FAILED: isPricingRulePerMatch`);
            continue;
        }

        //Passed everthing, add rule to the list
        console.log(`pricingRule: ${pr.id} isPricingRulePerMatch: OK`);
        matchedPricingRules.push(pr);
    }

    console.log("Total matchedPricingRules found:", matchedPricingRules.length);
    return matchedPricingRules;
}


export const quotesMixin = {
    methods: {
        mixinGetPricingListMatches(request) {
            return getPricingListMatches(request);
        },
    }
};