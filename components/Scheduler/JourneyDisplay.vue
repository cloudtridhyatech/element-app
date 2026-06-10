<template>
  <div class="c74-journey-button" v-if="journey.transferObject">
    <el-badge
      style="cursor: move"
      :value="journey.numPassengers"
      class="item"
      type="info"
    >
      <el-dropdown @command="handleCommand" placement="top">
        <div>
          <JourneyButton :journey="journey" :allPlaces="allPlaces" :transferObject="journey.transferObject" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-if="journey.status === 'confirmed' || journey.status === 'enquiry'"
            command="QUICK_EDIT_JOURNEY"
            >Quick Edit</el-dropdown-item
          >
          <el-dropdown-item
            v-if="journey.status === 'confirmed' || journey.status === 'enquiry'"
            command="SPLIT_JOURNEY"
            >Split Journey</el-dropdown-item
          >
          <el-dropdown-item
            v-if="journey.status === 'confirmed' || journey.status === 'enquiry'"
            command="SET_STATUS_AS_CANCELLED"
            divided
          >
            Mark as cancelled</el-dropdown-item
          >
          <el-dropdown-item
            v-if="journey.status === 'confirmed' || journey.status === 'enquiry'"
            command="SET_STATUS_AS_DEAD"
            >Mark as dead</el-dropdown-item
          >
          <el-dropdown-item
            v-if="journey.status === 'cancelled' || journey.status === 'dead'"
            command="QUICK_EDIT_JOURNEY"
            >View / Edit</el-dropdown-item
          >
          <el-dropdown-item
            v-if="journey.status === 'cancelled' || journey.status === 'dead'"
            command="SET_STATUS_AS_CONFIRMED"
            divided
            >Mark as confirmed</el-dropdown-item
          >
          <el-dropdown-item
            v-show="mixinCanEditBookings(loggedInUser)"
            command="OPEN_BOOKING"
            >Open Booking
            <a
              ref="bookingAnchor"
              target="_blank"
              :href="bookingLink"
              v-show="false"
            ></a>
            </el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
    </el-badge>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { bookingPermissionsMixin } from "@/statics/auth/bookingPermissions.js";

import JourneyButton from "@/components/Scheduler/JourneyButton";

export default {
  mixins: [bookingPermissionsMixin],
  props: {
    journey: { type: Object, required: true },
    allPlaces: { type: Array, required: true },
  },
  components: {
    JourneyButton,
  },
  computed: {
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    }),
  },
  data() {
    return {
      bookingLink: null
    };
  },
  created() {
    let route = this.$router.resolve({path: '/bookings/edit?bookingId=' + this.journey.bookingId});
    this.bookingLink = route.href;
  },
  methods: {
    async handleCommand(command) {
      if (command === "QUICK_EDIT_JOURNEY") {
        this.$emit("open-quick-edit-journey-form", this.journey.id);
      }

      if (command === "SPLIT_JOURNEY") {
        this.$emit("open-split-journey-form", this.journey.id);
      }

      if (command === "SET_STATUS_AS_CANCELLED") {
        this.changeJourneyStatus("cancelled");
      }

      if (command === "SET_STATUS_AS_CONFIRMED") {
        this.changeJourneyStatus("confirmed");
      }

      if (command === "SET_STATUS_AS_DEAD") {
        this.changeJourneyStatus("dead");
      }

      if (command === "OPEN_BOOKING") {
        this.$refs.bookingAnchor.click();
      }
    },

    async changeJourneyStatus(status) {
      // [vuex] do not mutate vuex store state outside mutation handlers.
      const editedJourney = { ...this.journey };

      editedJourney.status = status;
      await this.$store.dispatch("journies/editJourneyStatus", editedJourney);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
