import moment from "moment";
// import { fireDb } from "@/plugins/firebase.js";
import { DayPilot } from "daypilot-pro-vue";
import { convertFromMillisToFirestoreTimestampIfRequired, dateUtilsMixin } from "@/statics/utils/dateUtils.js";
import { sortByObjectKey } from "@/statics/array-utils.js";
import {
  EVENT_STATUS,
  addTransientDataToJourney
} from "@/statics/shared/functions.js";

const dayPilotDateTimeFormat = "YYYY-MM-DDTHH:mm:ss";

export const SCHEDULER_MODE = Object.freeze({
  EDIT: "Edit",
  VIEW: "View"
});

export const createStatusVersionForEvent = (
  args,
  event,
  vehiclePlace,
  fromPlace,
  toPlace,
  routes
) => {
  const version = {
    start: args.e.start,
    end: args.e.end,
    barHidden: true,
    backColor: "#E8E8E8",
    borderColor: "transparent",
    areas: []
  };

  if (!event.hideWarmUpTime) {
    version.start = args.e.start.addMinutes(
      -getMinutesBetweenTwoPlaces(vehiclePlace, fromPlace, routes)
    );
  }

  if (!event.hideCoolDownTime) {
    version.end = args.e.end.addMinutes(
      getMinutesBetweenTwoPlaces(toPlace, vehiclePlace, routes)
    );
  }

  args.data.versions.push(version);
  version.areas = [];

  if (event.eventStatuses) {
    event.eventStatuses.forEach((eventStatus, key, arr) => {
      if (eventStatus.disabled) {
        // do not draw this event status
        return;
      }

      let cssClass = "";

      let areaStartDateTime = new DayPilot.Date(
        dateUtilsMixin.methods.mixinFormatDateTime(eventStatus.startDateTime, dayPilotDateTimeFormat)
      );

      // in some instances, an eventStatus will NOT have an endDateTime
      let areaEndDateTime;
      if (eventStatus.endDateTime) {
        areaEndDateTime = new DayPilot.Date(
          dateUtilsMixin.methods.mixinFormatDateTime(eventStatus.endDateTime, dayPilotDateTimeFormat)
        );
      } else {
        const nowMilliseconds = moment().valueOf();
        const versionEndMilliseconds = version.end.getTime();

        if (nowMilliseconds < versionEndMilliseconds) {
          // let's set the endDateTime to now as it's likely this status is still 'running'
          areaEndDateTime = new DayPilot.Date(
            moment().format(dayPilotDateTimeFormat)
          );

          console.error("areaEndDateTime set to now");
        } else {
          // it's likely that this status is still 'running' but it's gone beyond the expected end of the event
          areaEndDateTime = version.end;
          console.error("areaEndDateTime set to version.end");
        }
      }

      // if the status is 'finished' and this is the last iteration of the array, normally there wouldn't be
      // an additional status so let's presnt it as a 3 minute 'slice'
      // https://stackoverflow.com/questions/29738535/catch-foreach-last-iteration/50688391#50688391
      if (eventStatus.status === "finished" && Object.is(arr.length - 1, key)) {
        console.error("XXXXXXXXXXX special finiasg case");
        areaEndDateTime = new DayPilot.Date(
          dateUtilsMixin.methods.mixinFormatDateTime(eventStatus.startDateTime, dayPilotDateTimeFormat)
        );
        areaStartDateTime = areaEndDateTime.addMinutes(-3);
      }

      cssClass = getCssClassAccordingToEventStatus(eventStatus.status);

      const versionArea = {
        top: 0,
        bottom: 0,
        start: areaStartDateTime,
        end: areaEndDateTime,
        cssClass: cssClass
      };

      // console.log("versionArea", versionArea);
      version.areas.push(versionArea);

      // conditionally change the version start time if the event status start or end times require it.
      if (version.start > areaStartDateTime) {
        console.log("adjusting start time");
        version.start = areaStartDateTime;
      }
      if (version.end < areaEndDateTime) {
        console.log("adjusting end time");
        version.end = areaEndDateTime;
      }
    });
  }
};

const getCssClassAccordingToEventStatus = status => {
  switch (status) {
    case EVENT_STATUS.STARTED:
      return "c74-event-version-status-started";
    case EVENT_STATUS.PICKING_UP_PASSENGERS:
      return "c74-event-version-status-picking-up-passengers";
    case EVENT_STATUS.EN_ROUTE_PASSENGERS_ON_BOARD:
      return "c74-event-version-status-en-route-passengers-on-board";
    case EVENT_STATUS.DROPPING_OFF_PASSENGERS:
      return "c74-event-version-status-dropping-off-passengers";
    case EVENT_STATUS.EN_ROUTE_EMPTY:
      return "c74-event-version-status-en-route-empty";
    case EVENT_STATUS.FINISHED:
      return "c74-event-version-status-finished";
    default:
      return "undefined";
  }
};

export const createJourneyVersionForEvent = (
  args,
  event,
  vehiclePlace,
  fromPlace,
  toPlace,
  routes,
  numMinutes
) => {
  const version = {
    start: args.e.start,
    end: args.e.end,
    barHidden: true,
    backColor: "#E8E8E8",
    borderColor: "transparent",
    areas: []
  };

  if (!event.hideWarmUpTime) {
    version.start = args.e.start.addMinutes(
      -getMinutesBetweenTwoPlaces(vehiclePlace, fromPlace, routes)
    );
  }

  if (!event.hideCoolDownTime) {
    version.end = args.e.end.addMinutes(
      getMinutesBetweenTwoPlaces(toPlace, vehiclePlace, routes)
    );
  }

  args.data.versions.push(version);

  // add colored area for fromPlaceColor
  version.areas = [];

  version.areas.push({
    top: 0,
    bottom: 0,
    start: args.e.start,
    end: args.e.start.addMinutes(numMinutes),
    backColor: fromPlace.color,
    text: fromPlace.code.toUpperCase(),
    fontColor: fromPlace.fontColor,
    cssClass: "c74-event-version-start"
  });

  // add colored area for toPlaceColor
  version.areas.push({
    top: 0,
    bottom: 0,
    start: args.e.end.addMinutes(-numMinutes),
    end: args.e.end,
    backColor: toPlace.color,
    text: toPlace.code.toUpperCase(),
    fontColor: toPlace.fontColor,
    cssClass: "c74-event-version-end"
  });
};

export const swapJourniesBetweenVehicles = async (
  eventsAssignedToSourceVehicle,
  eventsAssignedToTargetVehicle,
  sourceVehicleId,
  targetVehicleId,
  vuexStore
) => {
  for (let index = 0; index < eventsAssignedToSourceVehicle.length; index++) {
    const event = eventsAssignedToSourceVehicle[index];

    const editedEvent = { ...event };
    editedEvent.vehicleId = targetVehicleId;

    await vuexStore.dispatch("events/editEvent", editedEvent);
  }

  for (let index = 0; index < eventsAssignedToTargetVehicle.length; index++) {
    const event = eventsAssignedToTargetVehicle[index];

    const editedEvent = { ...event };
    editedEvent.vehicleId = sourceVehicleId;

    await vuexStore.dispatch("events/editEvent", editedEvent);
  }
};

export const assignDriverToAllEventsInRow = async (
  eventsAssignedToVehicle,
  driverId,
  vehicleId,
  vuexStore
) => {
  console.log(
    "assignDriverToAllEventsInRow",
    eventsAssignedToVehicle,
    driverId,
    vehicleId
  );

  for (let index = 0; index < eventsAssignedToVehicle.length; index++) {
    const event = eventsAssignedToVehicle[index];

    const editedEvent = { ...event };
    editedEvent.userId = driverId;

    await vuexStore.dispatch("events/editEvent", editedEvent);
  }
};

export const orderEventJourneyArrayByPickUpTime = (event, journiesVuex) => {
  const eventJourniesArray = [];

  event.journeyIds.forEach(journeyId => {
    const journey = journiesVuex.find(j => j.id === journeyId);

    if (journey) {
      eventJourniesArray.push(journey);
    } else {
      console.error(
        "Unable to find one or more journies to control ordering or journeyIds "
      );
    }
  });

  // now we need to sort the journies based on their respective pickUpDateTime property
  eventJourniesArray.sort(sortByObjectKey("pickUpDateTime"));

  // now that they are sorted, reconstruct the journeyIds based upon this ordering.
  event.journeyIds = [];
  eventJourniesArray.forEach(j => {
    event.journeyIds.push(j.id);
  });
};

export const getMinutesBetweenTwoPlaces = (fromPlace, toPlace, routes) => {
  if (fromPlace === toPlace) return 0;

  if (fromPlace == null || toPlace == null) {
    console.error("One or both places is null or undefined");
    return 0;
  }

  const route = routes.find(
    r => r.fromCode === fromPlace.code && r.toCode === toPlace.code
  );
  if (!route) {
    console.error("route not found between two places, will return 0.");
    return 0;
  }

  return route.time;
};

export const getRouteBetweenTwoPlacesUsingIds = (
  fromPlaceId,
  toPlaceId,
  places,
  routes
) => {
  const fromPlace = places.find(p => p.id === fromPlaceId);
  const toPlace = places.find(p => p.id === toPlaceId);
  if (fromPlace && toPlace) {
    const route = routes.find(
      r => r.fromCode === fromPlace.code && r.toCode === toPlace.code
    );
    if (!route) {
      console.error("route not found between two places, will return null.");
      return null;
    }

    return route;
  }

  console.error("fromPlace and/or toPlace not found using supplied ids.");
  return null;
};

/**
 * Creates an event in the format needed by DayPilot for display and also creates a customData
 * variable that will hold the scheduled journies related to this event.
 *
 * @param {*} event As held in firestore
 * @param {*} scheduledJournies Array of scheduled journies for a specific date or period of days.
 */
export const constructDayPilotEvent = (event, allPlaces) => {
  let dpEvent = {
    id: event.id,
    resource: event.vehicleId,
    start: new DayPilot.Date(dateUtilsMixin.methods.mixinFormatDateTimeUTC(event.startDateTime, dayPilotDateTimeFormat)),
    end: new DayPilot.Date(dateUtilsMixin.methods.mixinFormatDateTimeUTC(event.endDateTime, dayPilotDateTimeFormat)),
    // https://doc.daypilot.org/scheduler/limit-event-moving/
    moveVDisabled: false,
    moveHDisabled: true
  };

  let customData = constructCustomDataForDayPilotEvent(event, allPlaces);
  dpEvent.customData = customData;

  return dpEvent;
};

export const createDayPilotEventText = (event, driver, vehicle) => {
  let text = "";
  // display some basics
  const firstJourney = event.journies[0];

  if (firstJourney && firstJourney.transferObject && firstJourney.transferObject.journeyType) {
    text = firstJourney.transferObject.journeyType === "shared" ? "SHR " : "PRV ";
  }

  if (vehicle) {
    // we can determine the number spaces left....
    let spacesTaken = 0;
    event.journies.forEach(journey => {
      spacesTaken = spacesTaken + journey.numPassengers;
    });
    text = text + `${vehicle.capacity - spacesTaken}`;
  }

  if (driver) {
    text = text + `<br/>Driver: ${driver.firstName} ${driver.lastName}`;
  }

  return text;
};

export const getScheduledJourniesForThisEvent = (event, allJournies) => {
  let journies = [];
  let eventStatuses = [];

  if (event.eventStatuses) {
    eventStatuses = event.eventStatuses.filter(
      s => s.disabled != true
    );
  }

  event.journeyIds.forEach(journeyId => {
    const journey = allJournies.find(j => j.id === journeyId);

    const eventStatus = eventStatuses.filter(e=> {
      if(e.journey && e.journey.bookingId === journey.bookingId) {
        return e
      } else if (!e.journey) {
        return e
      }
    })

    // [vuex] do not mutate vuex store state outside mutation handlers.
    const copiedJourney = { ...journey, eventStatus };
    if (copiedJourney) {
      journies.push(copiedJourney);
    } else {
      console.error(
        "Unable to find one or more journies in vuex store that belong to this event"
      );
    }
  });

  return journies;
};

/**
 * Defines a json variable that will hold an array of scheduled journies for a DayPilot event.
 *
 * @param {*} event As held in firestore
 * @param {*} scheduledJournies Array of scheduled journies for a specific date or period of days.
 */
export const constructCustomDataForDayPilotEvent = (event, allPlaces) => {
  let customData = {};

  event.journies.forEach(journey => {
    addTransientDataToJourney(journey, allPlaces);
  });

  customData.event = event;

  return customData;
};

export const pushJourniesToArray = snapshot => {
  const journies = [];

  for (const doc of snapshot.docs) {
    let journey = doc.data();
    journey.id = doc.id;
    journies.push(journey);
  }

  console.log("READ ", journies.length, " journey documents.");
  return journies;
};

export const getEventEndDateTime = (journey, route) => {
  // we're starting with a firestore timestamp for the pickUpDateTime
  const javascriptPickUpDateTime = journey.pickUpDateTime.seconds * 1000;

  // route.time is in minutes, so lets convert to milliseconds
  const journeyDuration = route.time * 60 * 1000;
  const endDateTimeTimestamp = convertFromMillisToFirestoreTimestampIfRequired(
    javascriptPickUpDateTime + journeyDuration
  );

  return endDateTimeTimestamp;
};

export const createNewEventInVuexStore = async (
  journey,
  route,
  newResource,
  journies,
  vuexStore
) => {
  const endDateTimeTimestamp = getEventEndDateTime(journey, route);
  try {
    // TODO correct the 50 percent as this is just for showing something at the moment
    var newEvent = {
      journeyIds: [journey.id],
      vehicleId: newResource,
      startDateTime: journey.pickUpDateTime,
      endDateTime: endDateTimeTimestamp,
      complete: 50
    };

    // The vuex store handles adding the new doc id to the event in the store after creation in firestore
    const docRef = await vuexStore.dispatch("events/addEvent", newEvent);

    updateJourneyStatusAndLinkToEvent(
      docRef.id,
      journey.id,
      journies,
      vuexStore
    );

    // return the id of the newly created event
    return docRef.id;
  } catch (error) {
    console.error(error);
  }
};

export const updateJourneyStatusAndLinkToEvent = async (
  eventId,
  journeyId,
  journies,
  vuexStore
) => {
  const journeyFound = journies.find(j => j.id === journeyId);

  if (journeyFound) {
    // add a reference to the event that the journey is scheduled within
    const editedJourney = {
      ...journeyFound,
      eventId: eventId,
      status: "scheduled"
    };

    await vuexStore.dispatch("journies/editJourney", editedJourney);
  } else {
    console.error(
      "unable to obtain and update the journey from the vuex store"
    );
  }
};

export const getNativeMapsUrl = (accommodation) => {
  // location.href = "https://maps.google.com/?q=" + group.geo;
  // https://developers.google.com/waze/deeplinks

  if (accommodation && accommodation.latitude && accommodation.longitude && accommodation.latitude !== 0 && accommodation.longitude !== 0) {
    return `https://www.waze.com/ul?ll=${accommodation.latitude},${accommodation.longitude}&navigate=yes`;
  }
  return '';
};
