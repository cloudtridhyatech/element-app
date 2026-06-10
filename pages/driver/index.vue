<template>
  <div v-loading="loading">
    <DriverAvatar :user="loggedInUser" />
    <DateNavigation v-on:date-moved="handleDateMoved" />
    <CurrentDate :date="currentDate.format('ddd MMM DD yy')" />

    <EventGrid
      v-if="getAllEventsForSetDate && journiesForEventMap"
      :events="getAllEventsForSetDate"
      :journiesForEventMap="journiesForEventMap"
      :dateWithFormat="dateWithFormat"
      :currentDate="currentDate"
    />

    <section>
      <ResponsiveEmptyState
        v-if="getAllEventsForSetDate.length === 0"
        message="No jobs have been assigned to you ..."
        image="nothing-found"
      />
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";

import DriverAvatar from "@/components/Driver/DriverAvatar";
import DateNavigation from "@/components/Driver/DateNavigation";
import CurrentDate from "@/components/Driver/CurrentDate";
import EventGrid from "@/components/Driver/EventGrid";
import ResponsiveEmptyState from "@/components/EmptyStates/ResponsiveEmptyState";

import { addTransientDataToJourney } from "@/statics/shared/functions.js";

const dateFormat = "yyyy-MM-DD";

export default {
  layout: "driver",
  components: {
    DateNavigation,
    DriverAvatar,
    CurrentDate,
    EventGrid,
    ResponsiveEmptyState
  },

  data() {
    return {
      loading: true,

      currentDate: moment(new Date()),
      dateWithFormat: moment(new Date()).format(dateFormat),

      journiesForEventMap: null
    };
  },

  watch: {
    getAllEventsForSetDate(newEvents, oldEvents) {
      this.watchEvents();
    },
    getAllScheduledJourniesForSetDate(newJournies, oldJournies) {
      this.watchJournies();
    }
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),

    ...mapGetters("users", {
      loggedInUserId: "getLoggedInUserId",
      loggedInUser: "getLoggedInUser"
    }),

    ...mapGetters("routes", {
      allRoutes: "getAllRoutes"
    }),

    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    }),

    ...mapGetters("events", {
      getEventById: "getEventById",
      getAllEventsForSetDate: "getAllEventsForSetDate"
    }),

    ...mapGetters("journies", {
      getAllScheduledJourniesForSetDate: "getAllScheduledJourniesForSetDate"
    })
  },

  async created() {

    console.log("index params", this.$route.params);
    if(this.$route.params.dateWithFormat) {
      //reset data to params
      let paramDate = moment(this.$route.params.dateWithFormat, dateFormat);
      this.currentDate = paramDate;
      this.dateWithFormat = paramDate.format(dateFormat);
    }

    if (this.allRoutes.length === 0) {
      await this.$store.dispatch("routes/initRoutes").then(() => {});
    }

    if (this.allPlaces.length === 0) {
      await this.$store.dispatch("places/initPlaces");
    }

    await this.loadEventsForDriver();

    this.loading = false;
  },

  /**
   * When you are no longer interested in listening to your data, you must
   * detach your listener so that your event callbacks stop getting called.
   *
   * This allows the client to stop using bandwidth to receive updates.
   */
  destroyed() {
    this.$store.dispatch("events/detachFirestoreEventListener");
  },

  methods: {
    async loadEventsForDriver() {
      this.loading = true;

      // attempt close any open listener (in the instance the user has switched dates)
      await this.$store.dispatch("events/detachFirestoreEventListener");

      await this.$store.dispatch("events/setupFirestoreEventListenerForDate", {
        dateWithFormat: this.dateWithFormat,
        userId: this.loggedInUserId
      });

      this.loading = false;
    },

    watchEvents() {
      // build an array of all journeyIds contained in the drivers events for the chosen date
      let journeyIdArray = [];
      this.getAllEventsForSetDate.forEach(event => {
        journeyIdArray.push(...event.journeyIds);
      });

      if (journeyIdArray.length > 0) {
        // collect all the journey documents
        this.$store.dispatch("journies/getJourniesForDateByIds", {
          journeyIdArray: journeyIdArray
        });
      } else {
        // clear the store
        this.$store.dispatch("journies/resetJournies");
      }
    },

    watchJournies() {
      this.journiesForEventMap = new Map();

      this.getAllEventsForSetDate.forEach(event => {
        this.getAllScheduledJourniesForSetDate.forEach(journeyVuex => {
          if (journeyVuex.eventId === event.id) {
            // [vuex] do not mutate vuex store state outside mutation handlers.
            const copiedJourney = { ...journeyVuex };
            addTransientDataToJourney(copiedJourney, this.allPlaces);
            if (this.journiesForEventMap.has(event.id)) {
              this.journiesForEventMap.get(event.id).push(copiedJourney);
            } else {
              this.journiesForEventMap.set(event.id, [copiedJourney]);
            }
          }
        });
      });

      console.log("this.journiesForEventMap", this.journiesForEventMap);
    },

    async handleDateMoved(instruction) {
      switch (instruction) {
        case "PREVIOUS":
          this.currentDate = this.currentDate
            .subtract(1, "days")
            .startOf("day");

          break;
        case "NEXT":
          this.currentDate = this.currentDate.add(1, "days").startOf("day");
          break;
        default:
          // TODAY
          this.currentDate = moment(new Date());
      }

      this.currentDateFormatted = this.currentDate.format("ddd MMM DD yy");
      this.dateWithFormat = this.currentDate.format("yyyy-MM-DD");

      console.log("fetching for ", this.currentDate.format("yyyy-MM-DD"));

      await this.loadEventsForDriver();
    }
  }
};
</script>

<style lang="scss" scoped>
section {
  margin-top: 24px;
}

.el-card {
  margin-bottom: 20px;
}

a {
  text-decoration: none;
}

.header-layout {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
