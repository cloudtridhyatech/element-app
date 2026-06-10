<template>
  <el-card class="box-card c74-extra-rounded">
    <div class="c74-card-inner">
      <div class="c74-summary-block c74-summary-block-event">
        <div class="c74-time">
          {{ firstPickUpTime }}
        </div>
        <div class="c74-pax">{{ totalNumPassengers }} pax</div>
      </div>

      <div class="c74-title-and-summary">
        <div class="c74-title">
          {{ fromAndTo }}
        </div>

        <div class="c74-summary">
          {{ totalNumBabySeats }} {{ totalNumBoosterSeats }}
          {{ totalNumChildSeats }}
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import moment from "moment";
import {
  getFirstPickUpTime,
  calculateTotalNumPassengers,
  calculateTotalNumBoosterSeats,
  calculateTotalNumChildSeats,
  calculateTotalNumBabySeats } from "@/statics/driver/functions.js";

export default {
  name: "event-card",

  props: {
    event: {
      type: Object,
      required: true
    },

    journies: {
      type: Array,
      required: true
    }
  },

  computed: {
    fromAndTo() {
      const fromName = this.journies[0].transient.fromPlace.name;
      const toName = this.journies[this.journies.length - 1].transient.toPlace
        .name;
      return `${fromName} to ${toName}`;
    },

    firstPickUpTime() {
      return getFirstPickUpTime(this.journies);      
    },

    totalNumPassengers() {
      return calculateTotalNumPassengers(this.journies);
    },

    totalNumBabySeats() {
      var total = calculateTotalNumBabySeats(this.journies);

      if (!total) return;
      return `${total} baby seats`;
    },

    totalNumBoosterSeats() {
      var total = calculateTotalNumBoosterSeats(this.journies);

      if (!total) return;
      return `${total} booster seats`;
    },

    totalNumChildSeats() {
      var total = calculateTotalNumChildSeats(this.journies);

      if (!total) return;
      return `${total} child seats`;
    }
  }
};
</script>

<style lang="scss" scoped></style>
