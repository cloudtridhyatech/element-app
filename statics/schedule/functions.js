import moment from "moment";

export const createNewEventOrMergeToExistingEvent = (
  dropInfo,
  confirmedTransfers,
  scheduledTransfers,
  customiseCalendar
) => {
  // Moment.js objects
  const dropDate = moment(dropInfo.date);
  let eventToMergeWith;
  let dropDateInsideNumEvents = 0;

  try {
    if (moment.isMoment(dropDate)) {
      // first filter focuses on just those with matching resourceId
      let eventsByResource = customiseCalendar.events.filter(
        event => event.resourceId === dropInfo.resource.id
      );

      // second filter run ensures we're only looking at events that have groups/transfers defined
      // it essentially ignores calender events such as start/end flags etc.
      eventsByResource = eventsByResource.filter(
        event => event.extendedProps.groups
      );

      for (let i = 0; i < eventsByResource.length; i++) {
        const eventByResource = eventsByResource[i];
        const eventByResourceStartMoment = moment(eventByResource.start);
        const eventByResourceEndMoment = moment(eventByResource.end);
        if (
          moment.isMoment(eventByResourceStartMoment) &&
          moment.isMoment(eventByResourceEndMoment)
        ) {
          if (
            moment(dropDate).isAfter(eventByResourceStartMoment) &&
            moment(dropDate).isBefore(eventByResourceEndMoment)
          ) {
            dropDateInsideNumEvents++;
            eventToMergeWith = eventByResource;
          }
        } else {
          const error =
            "Error, Any event on array of events is not valid. start or end are not Moment objects";
          console.error(error);
          throw new Error(error);
        }
      }
    } else {
      const error = "Error, start or end are not Moment objects";
      console.error(error);
      throw new Error(error);
    }

    if (dropDateInsideNumEvents === 0) {
      createNewCalendarEvent(
        dropInfo,
        confirmedTransfers,
        scheduledTransfers,
        customiseCalendar
      );
      return "NEW_EVENT_CREATED";
    } else if (dropDateInsideNumEvents === 1) {
      mergeTransferToExistingCalendarEvent(
        dropInfo,
        eventToMergeWith,
        confirmedTransfers,
        scheduledTransfers
      );
      return "TRANSFER_ADDED_TO_EXISTING_EVENT";
    } else {
      return "CANNOT_CREATE_OR_ADD_TRANSFER";
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createNewCalendarEvent = (
  dropInfo,
  confirmedTransfers,
  scheduledTransfers,
  customiseCalendar
) => {
  // our transferId is hidden awat inside the dragged element
  const transferId = dropInfo.draggedEl.dataset.id;
  const dropInfoResourceID = dropInfo.resource.id;
  console.log("createNewCalendarEvent: ", dropInfo);

  const transferToMove = confirmedTransfers.find(
    transfer => transfer.id === transferId
  );
  if (transferToMove) {
    let newEvent = {
      // TODO Need to generate a number for id somehow
      id: "THIS_STILL_NEEDS_TO_BE_SET" + Math.floor(Math.random() * 1000),
      resourceId: dropInfoResourceID,
      title: "",
      start: dropInfo.date,
      end: moment(dropInfo.date)
        .add(1, "hours")
        .add(30, "minutes")
        .toDate(),
      classNames: [],

      extendedProps: {
        type: transferToMove.type,
        groups: []
      }
    };

    if (transferToMove.flightArrives) {
      newEvent.classNames.push("c74-timeline-flight-arrival");
    }
    if (transferToMove.flightDeparts) {
      newEvent.classNames.push("c74-timeline-flight-departure");
    }

    // add the first actual transfer to this event
    newEvent.extendedProps.groups.push(transferToMove);

    setCalendarEventTitle(newEvent);
    customiseCalendar.events.push(newEvent);

    // create dummy driver event
    // customiseCalendar.events.push(createDummyStartAndEndFlagEvents(newEvent));

    // move from confirmed to scheduled
    moveConfirmedTransferToScheduledTransferArray(
      transferToMove,
      confirmedTransfers,
      scheduledTransfers
    );
  }
};

/**
 * @param {*} date javascript date
 * @param {*} startTime hh:mm
 * @param {*} endTime hh:mm
 * @param {*} resourceId unique driver id
 */
export const createDriverWorkPeriodEvent = (
  date,
  startTime,
  endTime,
  resourceId
) => {
  const startTimeArray = startTime.split(":");
  const endTimeArray = endTime.split(":");
  const eventId = Math.floor(Math.random() * 10000);

  let momentDate = moment(date);

  let newDriverEvent = {
    id: "THIS_STILL_NEEDS_TO_BE_SET" + eventId,
    resourceId: resourceId,
    title: "",
    start: momentDate
      .set({
        hours: startTimeArray[0],
        minutes: startTimeArray[1]
      })
      .toDate(),
    end: momentDate
      .set({
        hours: endTimeArray[0],
        minutes: endTimeArray[1]
      })
      .toDate(),
    classNames: ["c74-timeline-driver-event"],

    editable: false, // prevent dragging
    resourceEditable: false, // prevent resource being changed by dragging

    extendedProps: {
      type: "temporaryValue"
    }
  };

  return newDriverEvent;
};

export const createStartFlagEvent = transferEvent => {
  return createDummyFlagEvent(transferEvent, true);
};
export const createEndFlagEvent = transferEvent => {
  return createDummyFlagEvent(transferEvent, false);
};

const createDummyFlagEvent = (transferEvent, isStart) => {
  // console.log("createDummyFlagEvent", transferEvent);
  let eventId = Math.floor(Math.random() * 1000);
  let newFlagEvent = {
    // TODO Need to generate a number for id somehow
    id: "THIS_STILL_NEEDS_TO_BE_SET" + eventId,
    resourceId: transferEvent.resourceId,
    title: isStart
      ? getFirstFromPoint(transferEvent.extendedProps.groups)
      : getLastToPoint(transferEvent.extendedProps.groups),
    start: isStart
      ? moment(transferEvent.start).toDate()
      : moment(transferEvent.end)
          .subtract(30, "minutes")
          .toDate(),
    end: isStart
      ? moment(transferEvent.start)
          .add(30, "minutes")
          .toDate()
      : moment(transferEvent.end).toDate(),
    classNames: [],
    // prevent dragging
    editable: false,
    // prevent resource being changed by dragging
    resourceEditable: false,

    extendedProps: {
      type: "temporaryValue"
    }
  };

  newFlagEvent.classNames.push("c74-timeline-flag-event");
  isStart
    ? newFlagEvent.classNames.push("c74-timeline-flag-event-start")
    : newFlagEvent.classNames.push("c74-timeline-flag-event-end");
  return newFlagEvent;
};

const mergeTransferToExistingCalendarEvent = (
  dropInfo,
  eventToMergeWith,
  confirmedTransfers,
  scheduledTransfers
) => {
  // our transferId is hidden awat inside the dragged element
  const transferId = dropInfo.draggedEl.dataset.id;

  const transferToMerge = confirmedTransfers.find(
    transfer => transfer.id === transferId
  );
  if (transferToMerge) {
    console.log("eventToMergeWith", eventToMergeWith.extendedProps);
    eventToMergeWith.extendedProps.groups.push(transferToMerge);

    setCalendarEventTitle(eventToMergeWith);

    moveConfirmedTransferToScheduledTransferArray(
      transferToMerge,
      confirmedTransfers,
      scheduledTransfers
    );
  }
};

const moveConfirmedTransferToScheduledTransferArray = (
  transferToMove,
  confirmedTransfers,
  scheduledTransfers
) => {
  const transferToMoveIndex = confirmedTransfers.findIndex(
    transfer => transfer.id === transferToMove.id
  );
  if (transferToMoveIndex > -1) {
    scheduledTransfers.push(confirmedTransfers[transferToMoveIndex]);
    confirmedTransfers.splice(transferToMoveIndex, 1);
  } else {
    console.error("Cannot find the transfer to move.");
  }
};

export const moveScheduledTransferToConfirmedTransferArray = (
  transferToMove,
  confirmedTransfers,
  scheduledTransfers
) => {
  //console.log("looking for ", transferToMove.id, " in ", scheduledTransfers);
  const transferToMoveIndex = scheduledTransfers.findIndex(
    transfer => transfer.id === transferToMove.id
  );
  if (transferToMoveIndex > -1) {
    confirmedTransfers.push(scheduledTransfers[transferToMoveIndex]);
    scheduledTransfers.splice(transferToMoveIndex, 1);
  } else {
    console.error("Cannot find the transfer to move.");
  }
};

const setCalendarEventTitle = event => {
  event.title = rewriteEventTitle(event);
};

export const rewriteEventTitle = event => {
  const groups = event.extendedProps.groups;
  let eventTitle = "";

  if (event.extendedProps.type === "PRIVATE") {
    eventTitle = eventTitle.concat("P ");
  }
  if (event.extendedProps.type === "SHARED") {
    eventTitle = eventTitle.concat(getTotalPassengers(groups));
  }

  if (event.extendedProps.driver) {
    eventTitle = eventTitle.concat(" / ", event.extendedProps.driver.name);
  }
  return eventTitle;
};

const getFirstFromPoint = groups => {
  return groups[0].from;
};

const getLastToPoint = groups => {
  return groups[groups.length - 1].to;
};

const getTotalPassengers = groups => {
  let totalPassengers = 0;
  groups.forEach(group => {
    totalPassengers = totalPassengers + group.numPassengers;
  });
  return totalPassengers;
};
