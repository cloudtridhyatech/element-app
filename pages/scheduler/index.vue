<template>
  <div
    v-loading="loading"
    v-bind:class="{
      'absolute w-full h-full top-0 left-0 bg-white p-10': isFullscreen,
    }"
  >
    <PageHeader :breadCrumb="breadCrumb">
      <slot>
        <div>
          <el-button
            @click="$refs.notesForm.open()"
            type="primary"
            plain
            icon="el-icon-plus"
            >Add Note
          </el-button>
          <el-button
            v-if="isFullscreen"
            @click="isFullscreen = !isFullscreen"
            type="danger"
            icon="el-icon-circle-close"
            >Exit Fullscreen</el-button
          >
          <el-button
            v-else
            @click="isFullscreen = !isFullscreen"
            type="primary"
            plain
            icon="el-icon-upload2"
            >Go Fullscreen</el-button
          >
        </div>
      </slot>
    </PageHeader>

    <div v-if="!loading" class="flex flex-row space-x-6 mt-6">
      <div
        v-bind:class="{
          'w-5/6': isFullscreen,
          'w-3/4': !isFullscreen,
        }"
      >
        <el-card class="">
          <div slot="header" class="flex flex-row justify-between">
            <SchedulerNavigation
              :currentDate="currentDate"
              v-on:date-changed="handleDateChanged"
              v-on:date-moved="handleDateMoved"
            />
            <div class="">
              <SchedulerControls
                v-on:change-cell-duration="handleChangeCellDuration"
                v-on:change-days-duration="handleChangDaysDuration"
                v-on:change-mode="handleChangeMode"
              />
            </div>
          </div>
          <JourneyScheduler
            :allPlaces="allPlaces"
            :allRoutes="allRoutes"
            :allActiveVehicles="allActiveVehicles"
            :currentDate="currentDate"
            @event-clicked-in-scheduler="handleEventClickedInScheduler"
            ref="journeyScheduler"
            v-if="!loading"
          />
        </el-card>
      </div>

      <div
        v-bind:class="{
          'w-1/6': isFullscreen,
          'w-1/4': !isFullscreen,
        }"
      >
        <NotesList :allNotes="allNotes" @edit-note="handleEditNote($event)" />
        <JourneyList
          v-if="!loading"
          ref="journeyList"
          :currentDate="currentDate"
          :enquiryJournies="enquiryJournies"
          :confirmedJournies="confirmedJournies"
          :scheduledJournies="scheduledJournies"
          :cancelledJournies="cancelledJournies"
          :deadJournies="deadJournies"
          :allPlaces="allPlaces"
        />
      </div>
    </div>

    <!-- Edit an event dialog -->
    <section>
      <el-dialog
        title="Edit Scheduled Transfer"
        :visible.sync="editScheduledDialogFormVisible"
        width="1140px"
        top="6vh"
      >
        <EventForm
          ref="eventForm"
          :eventId="clickedEventId"
          :allActiveDrivers="allActiveDrivers"
          @update-journey-start-time="onHearUpdateJourneyStartTime"
          @remove-journey-from-event="onHearRemoveJourneyFromEvent"
          @redraw-event="onHearRedrawEvent"
        />
      </el-dialog>
    </section>

    <!-- NotesForm section modal / popup -->
    <section>
      <NotesForm
        ref="notesForm"
        :existingNote="existingNote"
        :noteDate="currentDate"
        @close="existingNote = {}"
      />
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";

import JourneyScheduler from "@/components/Scheduler/JourneyScheduler";
import SchedulerControls from "@/components/Scheduler/SchedulerControls";
import SchedulerNavigation from "@/components/Scheduler/SchedulerNavigation";
import JourneyList from "@/components/Scheduler/JourneyList";
import NotesList from "@/components/Scheduler/NotesList";
import NotesForm from "@/components/Scheduler/NotesForm";

import PageHeader from "@/components/Shared/PageHeader";
import EventForm from "@/components/Scheduler/EventForm";

import {
  getScheduledJourniesForThisEvent,
  getEventEndDateTime,
  getRouteBetweenTwoPlacesUsingIds,
} from "@/statics/scheduler/functions.js";

export default {
  components: {
    JourneyScheduler,
    SchedulerControls,
    SchedulerNavigation,
    JourneyList,
    EventForm,
    PageHeader,
    NotesList,
    NotesForm,
  },

  data() {
    return {
      breadCrumb: {
        routeName: "Scheduler",
        title: "Scheduler",
      },
      loading: true,

      isFullscreen: false,

      // each journey has an attribute pickUpDate used or easy querying of transfers for a particular day.
      currentDate: moment(new Date()).format("YYYY-MM-DD"),

      editScheduledDialogFormVisible: false,
      clickedEventId: "",

      existingNote: {}
    };
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId",
    }),

    ...mapGetters("vehicles", {
      allActiveVehicles: "getAllActiveVehicles",
    }),

    ...mapGetters("routes", {
      allRoutes: "getAllRoutes",
    }),

    ...mapGetters("places", {
      allPlaces: "getAllPlaces",
    }),

    ...mapGetters("scheduler", {
      allNotes: "getAllNotes",
    }),

    ...mapGetters("drivers", {
      allActiveDrivers: "getAllActiveDrivers",
    }),

    ...mapGetters("events", {
      getEventById: "getEventById",
    }),

    ...mapGetters("journies", {
      allJournies: "getAllJourniesForSetDate",
      enquiryJournies: "getAllEnquiryJourniesForSetDate",
      scheduledJournies: "getAllScheduledJourniesForSetDate",
      confirmedJournies: "getAllConfirmedJourniesForSetDate",
      cancelledJournies: "getAllCancelledJourniesForSetDate",
      deadJournies: "getAllDeadJourniesForSetDate",
      getJourneyById: "getJourneyById",
    }),
  },

  async created() {
    if (this.allActiveVehicles.length === 0) {
      await this.$store.dispatch("vehicles/initVehicles");
    }

    if (this.allRoutes.length === 0) {
      await this.$store.dispatch("routes/initRoutes").then(() => {});
    }

    if (this.allPlaces.length === 0) {
      await this.$store.dispatch("places/initPlaces");
    }

    await this.dispatchInitNotes();

    if (this.allActiveDrivers.length === 0) {
      await this.$store.dispatch("drivers/initDrivers");
    }

    await this.dispatchInitJourniesForDate();
    await this.dispatchInitAccommodation();    

    this.loading = false;
  },

  methods: {
    async dispatchInitJourniesForDate() {
      await this.$store.dispatch(
        "journies/initJourniesForDate",
        this.currentDate
      );
      return null;
    },
    async dispatchInitNotes() {
      // fetch notes
      await this.$store.dispatch(
        "scheduler/initNotes",
        this.currentDate
      );
      return null;      
    },
    async dispatchInitAccommodation() {
      // fetch notes
      await this.$store.dispatch(
        "accommodations/initAccommodations",
        this.currentDate
      );
      return null;      
    },    
    handleEventClickedInScheduler(args) {
      console.log("handleEventClickedInScheduler", args);

      // if the same event is being clicked upon, let's reload the journies within in case
      // anything has been added or removed.
      if (this.clickedEventId === args.e.data.id) {
        // belt and braces: be sure the components created lifecycle hook has been executed and the component is not undefined
        if (this.$refs.eventForm) {
          this.$refs.eventForm.initForm();
        }
      }
      this.clickedEventId = args.e.data.id;

      this.editScheduledDialogFormVisible = true;
    },

    async handleDateChanged(date) {
      this.$refs.journeyScheduler.handleDateChanged(date);
      this.currentDate = date;
      await this.dispatchInitJourniesForDate();
      await this.dispatchInitNotes();
      this.makeUpdatesForNewSchedulerDate();
    },

    async handleDateMoved(instruction) {
      this.currentDate = this.$refs.journeyScheduler.handleDateMoved(
        instruction
      );
      await this.dispatchInitJourniesForDate();     
      await this.dispatchInitNotes();       
      this.makeUpdatesForNewSchedulerDate();
    },

    makeUpdatesForNewSchedulerDate() {
      this.$refs.journeyScheduler.clearAllEvents();
      this.$refs.journeyScheduler.loadExistingEvents();
    },

    handleChangeCellDuration(value) {
      this.$refs.journeyScheduler.handleChangeCellDuration(value);
    },

    handleChangDaysDuration(value) {
      this.$refs.journeyScheduler.handleChangDaysDuration(value);
    },

    handleChangeMode(value) {
      this.$refs.journeyScheduler.handleChangeMode(value);
    },

    onHearUpdateJourneyStartTime(journeyStartTime) {
      console.log("onHearUpdateJourneyStartTime", journeyStartTime);
    },

    /**
     * Gets both the journey and event from the vuex store.  Removes the specified journeyId from the event
     * and makes updates to both the journey and the event from the store.
     *
     * If the last journey is being removed from the store, then the event is deleted.
     */
    async onHearRemoveJourneyFromEvent(journeyId, eventId) {
      // get all objects from the store to ensure we're working with true copies of the data
      const journeyVuex = this.getJourneyById(journeyId);
      const eventVuex = this.getEventById(eventId);

      const editedJourney = {
        ...journeyVuex,
        status: "confirmed",
      };

      const editedEvent = { ...eventVuex };

      // remove the reference to the eventId which was added during scheduling.
      delete editedJourney.eventId;
      await this.$store.dispatch("journies/editJourney", editedJourney);

      // the event object holds an array of journeyIds, we need to remove the selected one.
      editedEvent.journeyIds = editedEvent.journeyIds.filter(
        (item) => item !== journeyId
      );

      // if we've just removed the last journeyId from the event, remove the event from the scheduler
      if (editedEvent.journeyIds.length === 0) {
        await this.$store.dispatch("events/deleteEvent", editedEvent);
        this.$refs.journeyScheduler.removeEventFromScheduler(editedEvent);
      } else {
        // recalculate the event start and end time
        // we need to update the endDateTime so that it is equal to last journey in the event startDateTime + duration
        const firstJourney = this.getJourneyById(editedEvent.journeyIds[0]);

        const lastJourney = this.getJourneyById(
          editedEvent.journeyIds[editedEvent.journeyIds.length - 1]
        );
        const transferObject = lastJourney.transferObject;

        // if the first journey was removed, the start date time will need to change
        editedEvent.startDateTime = firstJourney.pickUpDateTime;
        const route = getRouteBetweenTwoPlacesUsingIds(
          transferObject.fromPlaceId,
          transferObject.toPlaceId,
          this.allPlaces,
          this.allRoutes
        );
        editedEvent.endDateTime = getEventEndDateTime(lastJourney, route);

        await this.$store.dispatch("events/editEvent", editedEvent);

        this.$refs.journeyScheduler.redrawEvent(eventId);
      }

      this.$message({
        type: "success",
        message: "The journey was removed from the event",
      });
    },

    onHearRedrawEvent(eventId) {
      console.log("onHearRedrawEvent", eventId);
      this.$refs.journeyScheduler.redrawEvent(eventId);
    },

    handleEditNote(note) {
      this.existingNote = note;
      setTimeout(() => {
        this.$refs.notesForm.open();
      }, 0);
    }
  },
};
</script>

<style lang="scss" scoped>
.c74-horizontal-layout {
  display: flex;

  height: 100vh;

  .c74-scheduler {
    flex-grow: 2;
    margin-right: 48px;
  }

  .c74-scrollable-content {
    overflow: auto;

    /* for Firefox */
    min-height: 0;
  }
}

.c74-list-section {
  margin: 48px 0px;

  .c74-card-header {
    display: flex;
    justify-content: space-between;

    .c74-list-controls {
      display: flex;
      margin-right: 14px;

      div:not(:last-child) {
        margin-right: 24px;
      }
    }
  }
}
</style>
