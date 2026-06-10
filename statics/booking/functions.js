import moment from "moment";
import { firebaseFunctions } from "@/plugins/firebase.js";
import {
  isFromAndToABookableRoute,
  isFromAndToDifferentPlaces,
  isFlightArriveAndPickupTimeDifferent,
  isFlightDepartAndPickupTimeDifferent
} from "@/statics/shared/functions.js";
import { dateUtilsMixin } from "@/statics/utils/dateUtils.js";

const dateTimeValueFormat = "yyyy-MM-ddTHH:mm:ss+0000";

export const sendBookingEmail = (async (data) => {

  console.log(`sendBookingEmail`, data);

  const sendBookingEmail = firebaseFunctions.httpsCallable("bookings-sendBookingEmail");
  sendBookingEmail(data)
    .then(result => {

    })
    .catch(error => {
      console.error(error);
    })
    .finally(() => {
    });
});

const createEmptyBookingObject = () => {
  return {
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    secondaryMobile: "",
    journiesArray: [],
    transfersArray: [],
    customerNotes: "",
    internalNotes: ""
  };
}

const createEmptyJourneyObject = () => {
  return {
    pickUpDateTime: null,
    pickUpDateTimeLocal: null,
    numPassengers: 0,
    status: "enquiry"
  };
}

const createEmptyTransferObject = () => {
  return {
    price: 0,
    pricingRuleUsed: null,
    routeSummary: {
      distance: 0,
      secondaryTVARateApplies: false,
      secondaryTVARateAllocation: 0,
      fromCode: "unknown",
      toCode: "unknown"
    },
    journeyType: "",
    fromPlaceId: "",
    toPlaceId: "",
    accommodationId: "",
    accommodation: {
      value: "",
      label: ""
    },
    flyingFrom: "",
    flightNumber: "",
    flightArrivesDateTime: null,
    flightDepartsDateTime: null,
    flightArrivesDateTimeLocal: null,
    flightDepartsDateTimeLocal: null,
    ref: {
      lastName: "",
      firstName: ""
    },
    numBabySeats: 0,
    numChildSeats: 0,
    numBoosterSeats: 0,
    numWinterEquipment: 0,
    numSummerEquipment: 0,
    address: ""
  };
}

const getPriceFromPricingRule = (pricingRule, numPassengers) => {
  let localPrice = null;
  let error = '';
  let isPricedPerPerson = false;
  let pricePerPerson = 0;
  if (pricingRule.pricingByGroupOrPerson === "Per Person") {
    // we need to look in pricesArray
    let index = numPassengers - 1;
    if (pricingRule.pricesArray &&
      pricingRule.pricesArray[index] &&
      pricingRule.pricesArray[index].cumulativePrice &&
      pricingRule.pricesArray[index].cumulativePrice !== 0
    ) {

      let cumulativePrice = pricingRule.pricesArray[index].cumulativePrice;
      localPrice = Number(cumulativePrice);
      isPricedPerPerson = true;

      //add any minor decimal discrepancies places to price for odd number of passengers
      //used for display only.
      let perPerson = localPrice / numPassengers;
      let reTotal = roundPrice(perPerson) * numPassengers;
      let difference = (reTotal < cumulativePrice) ? cumulativePrice - reTotal : 0;
      pricePerPerson = roundPrice(perPerson + difference);
    } else {
      error = `Cannot find a price for ${numPassengers} passengers in the matched pricing rule.`;
    }
  } else {
    localPrice = Number(pricingRule.price);
  }

  return {
    price: localPrice,
    error: error,
    isPricedPerPerson: isPricedPerPerson,
    pricePerPerson: pricePerPerson
  };
}

function roundPrice(price) {
  return Math.round((price + Number.EPSILON) * 100) / 100;
}

const checkRouteIsViable = (allActivePlaces, allActiveRoutes, transferObject) => {

  let matchedRoute = null;
  let error = ""
  let routeSummary = null;

  if (
    !isFromAndToDifferentPlaces(
      transferObject.fromPlaceId,
      transferObject.toPlaceId
    )
  ) {
    error = "Heads up! You can't set the from and to as the same place.";
  } else {
    if (transferObject.fromPlaceId && transferObject.toPlaceId) {

      matchedRoute = isFromAndToABookableRoute(
        transferObject.fromPlaceId,
        transferObject.toPlaceId,
        allActivePlaces,
        allActiveRoutes
      );

      if (matchedRoute && matchedRoute !== null) {
        let secondaryTVARateApplies = matchedRoute.secondaryTVARateApplies ? matchedRoute.secondaryTVARateApplies : false;
        routeSummary = {
          distance: Number(matchedRoute.distance),
          secondaryTVARateApplies: secondaryTVARateApplies,
          secondaryTVARateAllocation: matchedRoute.secondaryTVARateAllocation && secondaryTVARateApplies ? matchedRoute.secondaryTVARateAllocation : 0,
          fromCode: matchedRoute.fromCode,
          toCode: matchedRoute.toCode,
        };
      }
    }
  }

  return {
    matchedRoute: matchedRoute,
    error: error,
    routeSummary: routeSummary,
  };
}


const checkArrivalTimeIsViable = (transfer, journey) => {

  let response = {
    messageType: '',
    message: ''
  }

  let flightArrivesDateTime = transfer.flightArrivesDateTime;
  let flightDepartsDateTime = transfer.flightDepartsDateTime;
  let pickUpDateTime = journey.pickUpDateTime;

  if (flightArrivesDateTime && pickUpDateTime && !Number.isNaN(flightArrivesDateTime) && !Number.isNaN(pickUpDateTime)
  ) {
    if (
      !isFlightArriveAndPickupTimeDifferent(
        flightArrivesDateTime,
        pickUpDateTime
      ) &&
      (!flightDepartsDateTime || flightDepartsDateTime === null)
    ) {
      response.message = "Heads up! You can't set inappropriate time.";
      response.messageType = "warning"
    } else if (
      isFlightArriveAndPickupTimeDifferent(
        flightArrivesDateTime,
        pickUpDateTime
      ) &&
      (!flightDepartsDateTime || flightDepartsDateTime === null)
    ) {
      response.message = "Great! The chosen time is a valid time.";
      response.messageType = "success"
    }
  }
  return response;
}

const checkDepartTimeIsViable = (transfer, journey) => {

  let response = {
    messageType: '',
    message: ''
  }

  let flightArrivesDateTime = transfer.flightArrivesDateTime;
  let flightDepartsDateTime = transfer.flightDepartsDateTime;
  let pickUpDateTime = journey.pickUpDateTime;

  if (flightDepartsDateTime && pickUpDateTime && !Number.isNaN(flightDepartsDateTime) && !Number.isNaN(pickUpDateTime)
  ) {
    if (
      !isFlightDepartAndPickupTimeDifferent(
        flightDepartsDateTime,
        pickUpDateTime
      ) &&
      (!flightArrivesDateTime || flightArrivesDateTime === null)
    ) {
      response.message = "Heads up! You can't set inappropriate time.";
      response.messageType = "warning"
    } else if (
      isFlightDepartAndPickupTimeDifferent(
        flightDepartsDateTime,
        pickUpDateTime
      ) &&
      (!flightArrivesDateTime || flightArrivesDateTime === null)
    ) {
      response.message = "Great! The chosen time is a valid time.";
      response.messageType = "success"
    }
  }
  return response;
}

const setJourneyPickUpDateTime = (journey, flightDateTime, offset) => {

  if (flightDateTime && !Number.isNaN(flightDateTime)) {

    let pickUpDateTime = moment.utc(flightDateTime);

    //set an initial pick up time
    if (isNaN(offset) === false) {
      if (offset > 0) {
        pickUpDateTime = pickUpDateTime.add(offset, 'minutes');
      }
      else if (offset < 0) {
        pickUpDateTime = pickUpDateTime.subtract(-offset, 'minutes')
      }
    }

    journey.pickUpDateTime = pickUpDateTime.valueOf();
    journey.pickUpDateTimeLocal = convertMillisToDateTimeInValueFormat(journey.pickUpDateTime);

    console.log('setJourneyPickUpDateTime', 'offset', offset, 'flightDateTime', moment.utc(flightDateTime).valueOf(), 'journey.pickUpDateTime', journey.pickUpDateTime);
  }
}

const calculateArrivalPickUpTimeDelay = (place) => {

  let transitPointPickUpDelay = 0;
  if (place && place !== null && place.isTransitPoint === true && isNaN(place.transitPointPickUpDelay) === false) {
    transitPointPickUpDelay = place.transitPointPickUpDelay;
  }

  console.log('calculateArrivalPickUpTimeDelay', transitPointPickUpDelay);

  return transitPointPickUpDelay;
}

const calculateDeparturePickUpTimeOffset = (place, matchedRoute, allActivePlaces, allActiveRoutes, transfer) => {

  let totalPickUpOffset = 0;
  let transitPointCheckInTime = 0;

  if (place && place !== null && place.isTransitPoint === true && isNaN(place.transitPointCheckInTime) === false) {
    transitPointCheckInTime = place.transitPointCheckInTime;
  }

  let route = matchedRoute;
  if (route === null) {
    let response = checkRouteIsViable(allActivePlaces, allActiveRoutes, transfer);
    route = response.matchedRoute;
  }

  let routeTransitTime = 0;
  if (route && route !== null && isNaN(route.time) === false) {
    routeTransitTime = route.time;
  }

  totalPickUpOffset = -(routeTransitTime + transitPointCheckInTime);

  console.log('calculateDeparturePickUpTimeOffset', totalPickUpOffset);

  return totalPickUpOffset;
}

const convertDateTimeInValueFormatToMillis = (dateTimeInValueFormat) => {
  return new Date(dateTimeInValueFormat).getTime();
}

const convertMillisToDateTimeInValueFormat = (dateTimeInMillis) => {

  if(dateTimeInMillis && Number.isNaN(dateTimeInMillis) === false) {
    return dateUtilsMixin.methods.mixinFormatDateTimeUTC(dateTimeInMillis, "YYYY-MM-DDTHH:mm:ss+0000");    
  }
  return null;


}

export const bookingMixin = {
  data() {
    return {
      mixinDateTimeValueFormat: dateTimeValueFormat
    }
  },
  methods: {
    mixinCreateEmptyBookingObject() {
      return createEmptyBookingObject();
    },
    mixinCreateEmptyJourneyObject() {
      return createEmptyJourneyObject();
    },
    mixinCreateEmptyTransferObject() {
      return createEmptyTransferObject();
    },
    mixinGetPriceFromPricingRule(pricingRule, numPassengers) {
      return getPriceFromPricingRule(pricingRule, numPassengers);
    },
    mixinCheckRouteIsViable(allActivePlaces, allActiveRoutes, transferObject) {
      return checkRouteIsViable(allActivePlaces, allActiveRoutes, transferObject);
    },
    mixinCheckArrivalTimeIsViable(transfer, journey) {
      return checkArrivalTimeIsViable(transfer, journey);
    },
    mixinCheckDepartTimeIsViable(transfer, journey) {
      return checkDepartTimeIsViable(transfer, journey);
    },
    mixinSetJourneyPickUpDateTime(journey, flightDateTime, offset) {
      return setJourneyPickUpDateTime(journey, flightDateTime, offset);
    },
    mixinCalculateArrivalPickUpTimeDelay(place) {
      return calculateArrivalPickUpTimeDelay(place);
    },
    mixinCalculateDeparturePickUpTimeOffset(place, matchedRoute, allActivePlaces, allActiveRoutes, transfer) {
      return calculateDeparturePickUpTimeOffset(place, matchedRoute, allActivePlaces, allActiveRoutes, transfer);
    },
    mixinConvertDateTimeInValueFormatToMillis(dateTimeValueFormat) {
      return convertDateTimeInValueFormatToMillis(dateTimeValueFormat);
    },
    mininConvertMillisToDateTimeInValueFormat(dateTimeInMillis) {
      return convertMillisToDateTimeInValueFormat(dateTimeInMillis);
    }
  }
};