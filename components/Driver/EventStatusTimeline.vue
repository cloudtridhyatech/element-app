<template>
  <el-card
    v-if="eventStatuses"
    class="box-card c74-extra-rounded"
    v-loading="loading"
  >
    <div class="c74-card-inner">
      <div class="c74-title-and-summary">
        <div class="c74-title">
          Status updates
        </div>

        <div class="c74-summary">
          <el-timeline v-if="eventStatuses" style="margin-top:24px;">
            <el-timeline-item
              v-for="(eventStatus, index) in eventStatuses"
              :key="index"
              :color="getStatusData(eventStatus).color"
              :timestamp="formatDate(eventStatus)"
            >
              {{ getStatusData(eventStatus).text }}
              <el-button type="text" @click="deleteStatus(eventStatus)"
                >delete</el-button
              >
            </el-timeline-item>
          </el-timeline>

          <p v-if="eventStatuses.length === 0">
            The status updates of this event will be shown here after you have
            recorded 1 or more. Click on the event summary above to add a
            status.
          </p>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import moment from "moment";
import { EVENT_STATUS } from "@/statics/shared/functions.js";
import { dateUtilsMixin } from "@/statics/utils/dateUtils.js";

export default {
  mixins: [dateUtilsMixin],  
  name: "status-timeline",

  props: {
    event: {
      required: true
    }
  },

  data() {
    return {
      loading: true,

      eventStatuses: []
    };
  },

  watch: {
    event(newEvent, oldEvent) {
      console.log("StatusBar watch event", newEvent);
      if (this.event.eventStatuses) {
        this.eventStatuses = newEvent.eventStatuses.filter(
          s => s.disabled != true
        );
      }
      this.loading = false;
    }
  },

  methods: {
    async deleteStatus(eventStatus) {
      // [vuex] do not mutate vuex store state outside mutation handlers.
      const editedEvent = { ...this.event };

      const indexToDelete = editedEvent.eventStatuses.findIndex(
        s =>
          s.startDateTime === eventStatus.startDateTime &&
          s.status === eventStatus.status
      );

      if (indexToDelete > -1) {
        this.loading = true;
        editedEvent.eventStatuses[indexToDelete].disabled = true;
        await this.$store.dispatch("events/editEvent", editedEvent);
        this.loading = false;
      }
    },

    formatDate(eventStatus) {
      /* This is intentionally NOT UTC */
      const startDateTime = this.mixinFormatDateTime(eventStatus.startDateTime, "HH:mm");
      return `${startDateTime}`;
    },

    getStatusData(eventStatus) {
      switch (eventStatus.status) {
        case EVENT_STATUS.STARTED:
          return { color: "#7bed9f", text: "Started" };

        case EVENT_STATUS.PICKING_UP_PASSENGERS:
          return { color: "#eccc68", text: "Picking up passengers" };

        case EVENT_STATUS.EN_ROUTE_PASSENGERS_ON_BOARD:
          return { color: "#2ed573", text: "En-route POB" };

        case EVENT_STATUS.DROPPING_OFF_PASSENGERS:
          return { color: "#1e90ff", text: "Dropping off passengers" };

        case EVENT_STATUS.EN_ROUTE_EMPTY:
          return { color: "#b2bec3", text: "En-route empty" };

        case EVENT_STATUS.FINISHED:
          return { color: "#ff6348", text: "finished" };

        default:
          return { color: "undefined", text: "undefined" };
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.el-button {
  padding: 0px;
}
</style>
