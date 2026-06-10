<template>
  <div class="c74-journey-button">
    <span v-on:mouseover="handleMouseOver" v-on:mouseleave="handleMouseLeave">
      <el-button size="default" :disabled="disabled">
        <span
          class="c74-dot"
          v-bind:style="`background-color: ${
            getPlaceColor(transferObject.fromPlaceId)
          }`"
        ></span>
        <i v-if="transferObject.flightArrivesDateTime" class="el-icon-download"></i>
        <i v-if="transferObject.flightDepartsDateTime" class="el-icon-upload2"></i>
        {{ showPickUpTime(journey) }}
        {{ getPlaceFromId(transferObject.fromPlaceId).code }}-{{
          getPlaceFromId(transferObject.toPlaceId).code
        }}
        {{ showJourneyType(transferObject) }} : {{ transferObject.ref.lastName }}
        <span
          class="c74-dot"
          v-bind:style="`background-color: ${
            getPlaceColor(transferObject.toPlaceId)
          }`"
        ></span>
      </el-button>
    </span>
  </div>
</template>

<script>
import moment from "moment";
import { dateUtilsMixin } from "@/statics/utils/dateUtils.js";

export default {
  mixins: [dateUtilsMixin],  
  props: {
    journey: { type: Object, required: true },
    allPlaces: { type: Array, required: true },
    disabled: { type: Boolean, required: false },
    transferObject: { type: Object, required: true },
  },

  methods: {
    showPickUpTime(journey) {
      return this.mixinFormatDateTimeUTC(journey.pickUpDateTime,"HH:mm");
    },

    showJourneyType(data) {
      return data.journeyType === "private" ? "PRV" : "SHA";
    },

    getPlaceFromId(id) {
      const place = this.allPlaces.find((place) => place.id === id);
      return place;
    },
    getPlaceColor(placeId) {
      let color = "";

      const place = this.getPlaceFromId(placeId);
      if(place) {
        color = place.color;
      }
      return color;
    },

    handleMouseOver() {
      if (this.journey.status === "scheduled") {
        // we only want to respond to mouse overs for scheduled journies
        this.$store.dispatch(
          "events/setHighlightedEventId",
          this.journey.eventId
        );
      }
    },

    handleMouseLeave() {
      if (this.journey.status === "scheduled") {
        // we only want to respond to mouse leaves for scheduled journies
        this.$store.dispatch("events/setHighlightedEventId", "");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.c74-dot {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  display: inline-block;
}

.c74-journey-button {
  margin-bottom: 16px;
  button {
    min-width: 300px;
    text-align: left;
  }
}
</style>
