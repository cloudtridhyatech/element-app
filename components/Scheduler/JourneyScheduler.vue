<template>
  <div>
    <DayPilotScheduler id="dp" :config="schedulerConfig" ref="scheduler" />

    <el-button @click="tempDumpSchedulerContents"
      >Dump Scheduler Contents</el-button
    >

    <section>
      <RowOperationsForm
        ref="rowClickForm"
        :shouldOpenRowOperationsDialog="shouldOpenRowOperationsDialog"
        :rowId="rowIdClicked"
        v-on:close-form="onCloseRowOperationsForm"
      />
    </section>
  </div>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";

import { DayPilot, DayPilotScheduler } from "daypilot-pro-vue";

import RowOperationsForm from "@/components/Scheduler/RowOperationsForm";

import {
  SCHEDULER_MODE,
  EVENT_STATUS,
  createNewEventInVuexStore,
  constructDayPilotEvent,
  getScheduledJourniesForThisEvent,
  createDayPilotEventText,
  updateJourneyStatusAndLinkToEvent,
  getRouteBetweenTwoPlacesUsingIds,
  orderEventJourneyArrayByPickUpTime,
  getEventEndDateTime,
  createStatusVersionForEvent,
  createJourneyVersionForEvent
} from "@/statics/scheduler/functions.js";

export default {
  components: {
    DayPilotScheduler,
    RowOperationsForm
  },

  props: {
    allPlaces: { type: Array, required: true },
    allRoutes: { type: Array, required: true },
    allActiveVehicles: { type: Array, required: true },
    currentDate: { type: String, required: true }
  },

  watch: {
    // adds or removes a css class that highlights the relevant event dependant on a value in vuex store
    highlightedEventId(newEventId, oldEventId) {
      if (newEventId) {
        // it has a value as a component is being hovered.
        var e = this.scheduler.events.find(newEventId);
        if(e && e !== null) {
          if(e.data) {
            e.data.cssClass = "c74-highlight-event";
          }
          this.scheduler.events.scrollIntoView(e);
          this.scheduler.events.update(e);
        }
      } else {        
        var e = this.scheduler.events.find(oldEventId);
        if(e && e !== null) {
          if(e.data) {
            e.data.cssClass = "";
          }
          this.scheduler.events.update(e);
        }
      }
    },

    // picks up on events needing a redraw because some underlying data will have changed
    // any component can initiate this by calling : this.$store.dispatch("events/setEventsNeedingRedraw", eventIds);
    eventsNeedingRedraw(newEventIds, oldEventIds) {
      newEventIds.forEach(id => {
        this.redrawEvent(id);
      });
    },

    allEvents(newEvents, oldEvents) {
      this.watchExistingEvents();
    }
  },

  computed: {
    // returns DayPilot.Scheduler object (https://api.daypilot.org/daypilot-scheduler-class/)
    scheduler: function() {
      return this.$refs.scheduler.control;
    },

    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),

    ...mapGetters("events", {
      allEvents: "getAllEventsForSetDate"
    }),

    ...mapGetters("journies", {
      allJournies: "getAllJourniesForSetDate",
      scheduledJournies: "getAllScheduledJourniesForSetDate",
      confirmedJournies: "getAllConfirmedJourniesForSetDate",
      enquiryJournies: "getAllEnquiryJourniesForSetDate",      
      getJourneyById: "getJourneyById"
    }),

    ...mapGetters("drivers", {
      allDrivers: "getAllDrivers"
    }),

    ...mapGetters("vehicles", {
      getVehicleById: "getVehicleById"
    }),

    ...mapGetters("places", {
      getPlaceById: "getPlaceById"
    }),

    ...mapGetters("events", {
      highlightedEventId: "getHighlightedEventId",
      getEventById: "getEventById",
      eventsNeedingRedraw: "getEventsNeedingRedraw"
    })
  },

  data() {
    var self = this;

    return {
      eventsData: [],

      loading: true,

      // is the scheduler in 'Edit' mode or 'View' mode.
      // this changes what the user sees. Edit mode is used when scheduling transfers, View mode is used more
      // when monitoring the progress of a day.
      mode: "Edit",

      // references the last click row in the scheduler and facilitates opening of dialog
      rowIdClicked: "",
      shouldOpenRowOperationsDialog: false,

      // used as a reference to the function that rebuilds the current time indicator every x seconds
      dayPilotTimeIndicatorLine: null,

      schedulerConfig: {
        locale: "en-gb",
        timeHeaders: [
          {
            groupBy: "Day",
            format: "dddd, d MMMM yyyy"
          },
          {
            groupBy: "Hour"
          },
          {
            groupBy: "Cell",
            format: "mm"
          }
        ],

        scale: "CellDuration",
        cellDuration: 15,
        days: 1,

        rowHeaderColumns: [
          { text: "Name", display: "name" },
          { text: "Capacity", display: "capacity" }
        ],

        // set the start date to today (or start of the week)
        // startDate: DayPilot.Date.today().firstDayOfWeek(),
        startDate: DayPilot.Date.today(),

        // Allow display of event versions and dictate some of their appearance.
        eventVersionsEnabled: true,
        eventVersionHeight: 20,
        eventVersionMargin: 4,

        durationBarVisible: false,
        rowMarginBottom: 4,
        rowMarginTop: 4,

        // when dragging events, they will snap to grid and it's dependant on the grid size
        // 5, 15, 30 or 60.  Setting this as false allows stops events being dragged left and right in the timeline
        // but allows resource (vehicle) to be changed.
        snapToGrid: false,

        // related to snapToGrid, allows exact drawing of event 'decoration' data
        // for example, from and to colors and driver details
        useEventBoxes: "Never",

        // Do not allow user to select parts of the scheduler with mouse drag
        timeRangeSelectedHandling: "Disabled",

        // highlighting current time : https://javascript.daypilot.org/scheduler/user-experience/
        // draws the first seperator on load, it's moved by the function showCurrentTime() every x seconds
        separators: [{ color: "red", location: new DayPilot.Date() }],

        // DayPilot Scheduler can highlight the current cursor position by showing a crosshair.
        // https://doc.daypilot.org/scheduler/crosshair/
        crosshairType: "Header",

        onBeforeEventRender: function(args) {
          self.handleOnBeforeEventRender(args);
        },

        eventMoveHandling: "Update",
        onEventMove: function(args) {
          // console.log("onEventMove", args);
          self.handleEventMove(args);
        },

        onEventMoved: function(args) {
          self.handleEventMoved(args);
        },

        eventResizeHandling: "Update",
        onEventResized: function(args) {
          this.message("Event resized: " + args.e.text());
        },

        onEventDeleted: function(args) {
          this.message("Event deleted: " + args.e.text());
        },

        onEventClicked: function(args) {
          self.handleEventClicked(args);
        },

        rowClickHandling: "Select",
        onRowSelected: function(args) {
          self.rowIdClicked = args.row.data.id;
          self.shouldOpenRowOperationsDialog = true;
        }
      }
    };
  },

  async mounted() {
    if (this.confirmedJournies.length === 0) {
      console.log("loading confirmed journies in JourneyScheduler");
      await this.$store.dispatch(
        "journies/initJourniesForDate",
        this.currentDate
      );
    }

    this.initScheduler();
  },

  /**
   * When you are no longer interested in listening to your data, you must
   * detach your listener so that your event callbacks stop getting called.
   *
   * This allows the client to stop using bandwidth to receive updates.
   */
  destroyed() {
    this.$store.dispatch("events/detachFirestoreEventListener");

    clearInterval(this.dayPilotTimeIndicatorLine);
    console.log("destroyed", this.dayPilotTimeIndicatorLine);
  },

  methods: {
    tempDumpSchedulerContents() {
      console.log(this.scheduler.events.list);
    },

    async initScheduler() {
      this.loading = true;

      this.loadResourcesIntoCalendar();
      await this.loadExistingEvents();

      this.loading = false;

      // scroll the calender to the current time
      // DayPilot.Date() can accept dates in the format yyyy-MM-dd
      this.scheduler.scrollTo(new DayPilot.Date(this.currentDate));
      this.showCurrentTime();
    },

    onCloseRowOperationsForm() {
      this.shouldOpenRowOperationsDialog = false;

      // clear any row selection that might be in place on the scheduler.
      this.scheduler.rows.selection.clear();
    },

    showCurrentTime() {
      var that = this;
      if (!this.dayPilotTimeIndicatorLine) {
        console.log("creating a timeInidicator Line");
        this.dayPilotTimeIndicatorLine = setInterval(function() {
          console.log("redrawing", that.scheduler);
          that.scheduler.update({
            separators: [{ color: "Red", location: new DayPilot.Date() }]
          });

          if (that.mode === "View") {
            // redraw all the events every minute
            // TODO: WARNING, if the scheduler (or browser) becomes sluggish, consider not redrawing all events every minute
            // the reason we do this is to allow the status bars to draw right up to the timeline, else the timeline creeps away from the
            // status bar each minute.
            that.scheduler.update();
            console.log(
              "WARNING : Redrawing all events as timeline is updated"
            );
          }
        }, 60 * 1000); // once per minute
      }
    },

    async clearAllEvents() {
      await this.$store.dispatch("events/setEvents", []);
    },

    async loadExistingEvents() {
      this.loading = true;

      // attempt close any open listener (in the instance the user has switched dates)
      await this.$store.dispatch("events/detachFirestoreEventListener");

      await this.$store.dispatch("events/setupFirestoreEventListenerForDate", {
        dateWithFormat: this.currentDate,
        userId: null
      });
      this.loading = false;
    },

    watchExistingEvents() {
      let dayPilotEvents = [];
      this.allEvents.forEach((eventVuex, index) => {
        // [vuex] do not mutate vuex store state outside mutation handlers.
        const copiedEvent = { ...eventVuex };

        copiedEvent.journies = getScheduledJourniesForThisEvent(
          copiedEvent,
          this.allJournies
        );

        // create the event as DayPilot needs it from our underlying data
        dayPilotEvents.push(
          constructDayPilotEvent(copiedEvent, this.allPlaces)
        );
      });

      // update he daypilot scheduler with the events
      this.scheduler.update({ events: dayPilotEvents });
    },

    loadResourcesIntoCalendar() {
      var resources = [];
      this.allActiveVehicles.forEach(vehicle => {
        resources.push({
          id: vehicle.id,
          name: vehicle.name,
          capacity: vehicle.capacity
        });
      });
      this.scheduler.update({ resources: resources });
    },

    updateDayPilotEventText(args) {
      const vehicleId = args.data.resource;
      const driverId = args.data.customData.event.userId;

      let vehicleVuex = null;
      if (vehicleId) {
        vehicleVuex = this.allActiveVehicles.find(v => v.id === vehicleId);
      }

      let driverVuex = null;
      if (driverId) {
        driverVuex = this.allDrivers.find(d => d.id === driverId);
      }

      // use the scheduler to find the event so we can update the textual property
      const dpEvent = this.scheduler.events.find(args.e.id);

      args.data.html = createDayPilotEventText(
        args.data.customData.event,
        driverVuex,
        vehicleVuex
      );
    },

    /**
     * Initiated by the DayPilot Scheduler component.  Delegated from within data()
     *
     * Renders:
     * - coloured handles above the event, left and right sides according to fromPlace and toPlace
     * - solid bar between from and to colors to indicate driver assigned
     * - amends the text displayed within the event according to latest underlying data
     */
    handleOnBeforeEventRender(args) {
      // console.error("handleOnBeforeEventRender", args);

      // obtain a reference on the array of journies in the customData
      const journies = args.data.customData.event.journies;
      const event = args.data.customData.event;

      let defaultPlace = {
        color : "",
        code : "",
        fontColor : ""
      };

      let fromPlace = journies[0].transient.fromPlace;
      let toPlace = journies[journies.length - 1].transient.toPlace;

      this.updateDayPilotEventText(args);

      const numMinutes = this.scheduler.cellDuration;

      const vehicleId = args.e.resource;
      const vehicle = this.getVehicleById(vehicleId);
      const vehiclePlace = this.getPlaceById(vehicle.placeId);

      // create a new empty array for event versions
      args.data.versions = [];

      // add in warm up time and cool down time into a version
      if (this.mode === SCHEDULER_MODE.EDIT) {

        if(!fromPlace) {
          fromPlace = defaultPlace;
        }

        if(!toPlace) {
          toPlace = defaultPlace;
        }

        // add in from and to place markers, warm up and cool down
        createJourneyVersionForEvent(
          args,
          event,
          vehiclePlace,
          fromPlace,
          toPlace,
          this.allRoutes,
          numMinutes
        );
      } else if (this.mode === SCHEDULER_MODE.VIEW) {

        if(!fromPlace) {
          fromPlace = null;
        }

        if(!toPlace) {
          toPlace = null;
        }

        // add in the warm up and cool down but also add any status updates into the version/view
        createStatusVersionForEvent(
          args,
          event,
          vehiclePlace,
          fromPlace,
          toPlace,
          this.allRoutes
        );
      }

      // console.log("args.data.versions", args.data.versions);
    },

    /**
     * Initiated by the DayPilot Scheduler component.  Delegated from within data()
     */
    handleEventClicked(args) {
      console.log("handleEventClicked", args);
      this.$emit("event-clicked-in-scheduler", args);
    },

    /**
     * Initiated by the DayPilot Scheduler component.  Delegated from within data()
     */
    async handleEventMove(args) {
      if (args.external) {
        this.handleEventMoveFromExternal(args);
      } else {
        this.handleEventMoveWithinScheduler(args);
      }
    },

    /**
     * We only allow the user to change the vehicle (resource).  The start and end times remain the same
     * and we don't allow them to be changed during drag and drop.  Only vertical movement is allowed.
     */
    async handleEventMoveWithinScheduler(args) {
      const newResource = args.newResource;
      const eventId = args.e.data.id;

      const event = this.allEvents.find(e => e.id === eventId);
      if (event) {
        const editedEvent = {
          ...event,
          vehicleId: newResource
        };

        // when dragging and dropping an event within the scheduler, we want to remove any assigned driver.
        editedEvent.userId = null;

        await this.$store.dispatch("events/editEvent", editedEvent);

        // we must redraw the event after update via the vuex store
        this.redrawEvent(editedEvent.id);
      } else {
        console.error("cannot find existing event in scheduler data");
      }
    },

    /**
     * Executed when a journey is dropped from external (outside the scheduler)
     */
    async handleEventMoveFromExternal(args) {
      console.log("handleEventMoveFromExternal", args);
      const eventData = args.e.data;
      const journey = eventData.customData.event.journies[0];

      var targetRow = this.scheduler.rows.find(args.newResource);
      var existing = targetRow.events.forRange(args.newStart, args.newEnd);

      const transferObject = journey.transferObject;
      // from the journey data, determine the associated places and the route
      let route = getRouteBetweenTwoPlacesUsingIds(
        transferObject.fromPlaceId,
        transferObject.toPlaceId,
        this.allPlaces,
        this.allRoutes
      );

      if (existing.length > 1) {
        // DayPilot.Modal.alert("More than 1 event at the target position");
        this.$message.error(
          "Journey NOT scheduled. Please drop on a single transfer event."
        );
        args.preventDefault();
        return;
      }

      let journiesToUse = journey.status === "confirmed" ? this.confirmedJournies : this.enquiryJournies;

      if (existing.length === 0) {
        // Creating a brand new event but do not allow daypilot to render the
        // event right now, we want to successfully commit to firebase first.
        args.preventDefault();

        const eventRefId = await createNewEventInVuexStore(
          journey,
          route,
          args.newResource,
          journiesToUse,
          this.$store
        );

        const eventVuex = this.allEvents.find(e => e.id === eventRefId);
        if (eventVuex) {

          const dayPilotEvent = this.scheduler.events.find(eventRefId);
          if(!dayPilotEvent) {

            const copiedEvent = { ...eventVuex };

            copiedEvent.journies = getScheduledJourniesForThisEvent(
              copiedEvent,
              this.allJournies
            );
            const dpEvent = constructDayPilotEvent(copiedEvent, this.allPlaces);
            this.scheduler.events.add(dpEvent);
          }
          else {
            console.log('Found dayPilotEvent', eventRefId);
          }          
        } 

        // Emit a message so that the originating confirmed journey can be moved to scheduled
        // this.$emit("handle-journey-dropped-in-scheduler", journey.id);
        this.$message({
          message: "Journey added to new event",
          type: "success"
        });
        return;
      }

      // user is trying to add a journey to an existing scheduler event
      // onEventMove Fires when the moving is finished (after drop) but before the default action is performed.
      // The default action (set using eventMoveHandling) is set to "Update" by default. This means the event box will be moved to
      // the selected position. You can use this event to check the move rules and cancel the moving using args.preventDefault() if necessary.
      var sourceEvent = args.e;
      var targetEvent = existing[0];
      args.preventDefault();

      // find the event in the vuex store
      const eventVuex = this.getEventById(targetEvent.data.id);

      // [vuex] do not mutate vuex store state outside mutation handlers.
      const editedEvent = { ...eventVuex };

      // create a new array of journey ids, combining the existing ids held in firestore with this new journey id
      const newArrayJourneyIds = [
        ...new Array(journey.id),
        ...editedEvent.journeyIds
      ];

      editedEvent.journeyIds = newArrayJourneyIds;

      // we need to order the journies in the event journey array based upon their respective pickUpDateTime
      orderEventJourneyArrayByPickUpTime(editedEvent, this.allJournies);

      // we need to update the endDateTime so that it is equal to last journey in the event startDateTime + duration
      const lastJourneyIdInEvent =
        editedEvent.journeyIds[editedEvent.journeyIds.length - 1];
      const lastJourney = this.getJourneyById(lastJourneyIdInEvent);
      const lastJourneyTransferObject = lastJourney.transferObject;      
      route = getRouteBetweenTwoPlacesUsingIds(
        lastJourneyTransferObject.fromPlaceId,
        lastJourneyTransferObject.toPlaceId,
        this.allPlaces,
        this.allRoutes
      );
      const endDateTimeTimestamp = getEventEndDateTime(journey, route);
      editedEvent.endDateTime = endDateTimeTimestamp;

      // dispatch to the vuex store
      await this.$store.dispatch("events/editEvent", editedEvent);

      // We need to update the customData attribute in the scheduler event
      var dayPilotEvent = this.scheduler.events.find(targetEvent.data.id);
      dayPilotEvent.data.customData.event.journies.push(journey);

      await updateJourneyStatusAndLinkToEvent(
        editedEvent.id,
        journey.id,
        journiesToUse,
        this.$store
      );

      this.redrawEvent(editedEvent.id);

      this.$message({
        message: "Journey added to existing event",
        type: "success"
      });
    },

    handleEventMoved(args) {},

    handleChangeCellDuration(value) {
      this.scheduler.update({ cellDuration: value });
    },

    handleChangDaysDuration(value) {
      this.scheduler.update({ days: value });
    },

    handleChangeMode(value) {
      this.mode = value;

      // the following is enough to ask DayPilot to redraw the scheduler
      this.scheduler.update();
    },

    /**
     * Date must be supplied in the format 'yyyy-MM-dd'
     */
    handleDateChanged(date) {
      const dayPilotDate = new DayPilot.Date(date);

      this.scheduler.startDate = dayPilotDate;
      this.scheduler.events.list = []; // provide event data for the new date range
      this.scheduler.update();

      this.initScheduler();
    },

    /**
     * Value must be one of : 'PREVIOUS', 'NEXT', 'TODAY'
     */
    handleDateMoved(value) {
      console.log("handleDateMoved", value);

      switch (value) {
        case "PREVIOUS":
          this.scheduler.startDate = this.scheduler.startDate.addDays(-1);
          break;
        case "NEXT":
          this.scheduler.startDate = this.scheduler.startDate.addDays(1);
          break;
        default:
          // TODAY
          this.scheduler.startDate = DayPilot.Date.today();
      }

      this.scheduler.events.list = []; // provide event data for the new date range
      this.scheduler.update();

      this.initScheduler();

      return this.scheduler.startDate.toString("yyyy-MM-dd");
    },

    removeEventFromScheduler(event) {
      const dayPilotEvent = this.scheduler.events.find(event.id);
      if (dayPilotEvent) {
        this.scheduler.events.remove(dayPilotEvent);
      }
    },

    redrawEvent(id) {
      const eventVuex = this.getEventById(id);
      // [vuex] do not mutate vuex store state outside mutation handlers.
      const copiedEvent = { ...eventVuex };

      copiedEvent.journies = getScheduledJourniesForThisEvent(
        copiedEvent,
        this.allJournies
      );

      // create the event as DayPilot needs it from our underlying data
      const dayPilotEvent = constructDayPilotEvent(copiedEvent, this.allPlaces);
      this.scheduler.events.update(dayPilotEvent);
    }
  }
};
</script>

<style lang="scss" scoped>
.dragging-over {
  outline: 2px solid red;
}
</style>
