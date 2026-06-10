<template>
  <section>
    <div>      
      <el-button type="info" @click.native="handleBackClickEvent()"><i class="el-icon-back"/>Back</el-button>
    </div>

    <CurrentDate :date="currentDate.format('ddd MMM DD yy')" />
    <div v-if="event && journies.length > 0" style="margin-bottom: 48px;">
      <EventCard
        v-if="event && journies.length > 0"
        :event="event"
        :journies="journies"
        @click.native="eventStatusFormVisible = !eventStatusFormVisible"
      />
      <transition name="el-zoom-in-bottom">
        <EventStatusCard
          :event="event"
          :journies="journies"
          v-show="eventStatusFormVisible"
          v-on:cancel="eventStatusFormVisible = false"
          v-on:close="eventStatusFormVisible = false"
        />
      </transition>
    </div>

    <div v-for="journey of journies" :key="journey.id">
      <JourneyCard
        :journey="journey"
        :transferObject="journey.transferObject"
        :places="allPlaces"
        :accommodation="getAccommodationById(journey.transferObject.accommodationId)"
      />
    </div>

    <EventStatusTimeline v-if="event" :event="event" />
  </section>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";

import { addTransientDataToJourney } from "@/statics/shared/functions.js";
import EventStatusTimeline from "@/components/Driver/EventStatusTimeline";
import EventCard from "@/components/Driver/EventCard";
import JourneyCard from "@/components/Driver/JourneyCard";
import EventStatusCard from "@/components/Driver/EventStatusCard";
import CurrentDate from "@/components/Driver/CurrentDate";

export default {
  components: {
    EventStatusTimeline,
    EventCard,
    JourneyCard,
    EventStatusCard,
    CurrentDate
  },

  transition: {
    name: "page",
    mode: "out-in"
  },

  data() {
    return {
      event: Object,
      journies: [],

      eventStatusFormVisible: false,

      // the following data elements are populated via nuxt-link params from the calling page
      currentDate: null,
      dateWithFormat: moment(new Date()).format("yyyy-MM-DD")
    };
  },

  computed: {
    ...mapGetters("users", {
      loggedInUserId: "getLoggedInUserId"
    }),
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    }),
    ...mapGetters("events", {
      getEventById: "getEventById",
      getAllEventsForSetDate: "getAllEventsForSetDate"
    }),
    ...mapGetters("journies", {
      getJourniesByEventId: "getJourniesByEventId"
    }),
    ...mapGetters("accommodations", {
      getAccommodationById: "getAccommodationById"
    })
  },

  watch: {
    getAllEventsForSetDate(newEvents, oldEvents) {
      this.watchEvents();
    }
  },

  async created() {
    const id = this.$route.params.eventId;
    const dateWithFormat = this.$route.params.dateWithFormat;
    const currentDate = this.$route.params.currentDate;

    console.log("details params", this.$route.params);

    if (!id) {
      console.error("This page expects a nuxt-link param named eventId.");
      return;
    }
    if (!dateWithFormat) {
      console.error(
        "This page expects a nuxt-link param named dateWithFormat in the format: yyyy-MM-DD"
      );
      return;
    }
    if (!currentDate) {
      console.error(
        "This page expects a nuxt-link param named currenDate as an instance of a moment date"
      );
      return;
    }

    this.dateWithFormat = dateWithFormat;
    this.currentDate = currentDate;

    console.log("currentDate", currentDate);

    await this.loadEventsForDriver();
    this.event = this.getEventById(id);
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
      console.log("detail.vue watchEvents()");

      const id = this.$route.params.eventId;
      if (!id) {
        console.error("This page expects a nuxt-link param named eventId.");
        return;
      }
      this.event = this.getEventById(id);

      // build an array of all journeyIds contained in the drivers events for the chosen date
      const journies = this.getJourniesByEventId(this.event.id);
      this.journies = [];
      journies.forEach(journeyVuex => {
        // [vuex] do not mutate vuex store state outside mutation handlers.
        const copiedJourney = { ...journeyVuex };
        addTransientDataToJourney(copiedJourney, this.allPlaces);
        this.journies.push(copiedJourney);
      });

      // load the store with up to 1 accommodation per journey
      this.getAccommodationsForAllJournies();
    },

    getAccommodationsForAllJournies() {
      // build an array of all journeyIds contained in the drivers events for the chosen date
      let accommodationIdArray = [];
      this.journies.forEach(journey => {
        if(journey.transferObject && journey.transferObject.accommodationId && journey.transferObject.accommodationId !== null && journey.transferObject.accommodationId !== ''){
          accommodationIdArray.push(journey.transferObject.accommodationId);
        }
      });

      if (accommodationIdArray.length > 0) {
        // collect all the accommodation documents
        this.$store.dispatch("accommodations/getAccommodationsByIds", {
          accommodationIdArray: accommodationIdArray
        });
      } else {
        // clear the store
        this.$store.dispatch("accommodations/setAccommodations", []);
      }
    },
    handleBackClickEvent() {
      this.$router.push({
        name: "driver",
        params: {
          dateWithFormat: this.dateWithFormat
        }
      });
    }    
  }
};
</script>

<style lang="scss" scoped></style>
