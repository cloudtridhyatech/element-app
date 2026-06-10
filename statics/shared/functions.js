export const EVENT_STATUS = Object.freeze({
  STARTED: "started",
  PICKING_UP_PASSENGERS: "picking-up-passengers",
  EN_ROUTE_PASSENGERS_ON_BOARD: "en-route-passengers-on-board",
  DROPPING_OFF_PASSENGERS: "dropping-off-passengers",
  EN_ROUTE_EMPTY: "en-route-empty",
  FINISHED: "finished",
  CANCELLED: "cancelled"
});

/**
 *
 * @param {*} journey
 * @param {*} allPlaces
 */
export const addTransientDataToJourney = (journey, allPlaces) => {
  let fromPlace;
  let toPlace;
  if (journey.transferObject) {
    fromPlace = getPlaceFromId(journey.transferObject.fromPlaceId, allPlaces);
    toPlace = getPlaceFromId(journey.transferObject.toPlaceId, allPlaces);
  }

  // add transient data that the DayPilot scheduler can use to draw colored handles above the event
  journey.transient = {
    fromPlace: fromPlace,
    toPlace: toPlace
  };
};

function getPlaceFromId(id, allPlaces) {
  return allPlaces.find(place => place.id === id);
}

export const isFromAndToDifferentPlaces = (fromPlaceId, toPlaceId) => {
  if (fromPlaceId != toPlaceId) {
    return true;
  }
  return false;
};
export const isFlightArriveAndPickupTimeDifferent = (
  flightArrivesDateTime,
  pickUpDateTime
) => {
  if (
    flightArrivesDateTime != pickUpDateTime &&
    flightArrivesDateTime <= pickUpDateTime
  ) {
    return true;
  }
  return false;
};
export const isFlightDepartAndPickupTimeDifferent = (
  flightDepartsDateTime,
  pickUpDateTime
) => {
  if (
    flightDepartsDateTime != pickUpDateTime &&
    flightDepartsDateTime >= pickUpDateTime
  ) {
    return true;
  }
  return false;
};

export const isFromAndToABookableRoute = (
  fromPlaceId,
  toPlaceId,
  places,
  routes
) => {
  let matchedRoute = null;
  if (fromPlaceId && toPlaceId) {
    // check if it's a viable route
    const from = places.find(place => place.id === fromPlaceId);
    const to = places.find(place => place.id === toPlaceId);

    const chosenRoute = routes.find(
      route => route.fromCode === from.code && route.toCode === to.code
    );

    if (chosenRoute && chosenRoute.bookable) {
      matchedRoute = chosenRoute;
    }
  }
  return matchedRoute;
};
