<template>
  <div class="w-full rounded-2xl p-6 border shadow bg-white">
    <div class="flex flex-col">
      <div
        class="flex items-center justify-center rounded-lg  bg-black text-white p-3 w-16"
      >
        {{ firstPickUpTime }}
      </div>
    </div>
    <div class="text-sm font-semibold mt-5">{{ fromAndTo }}</div>
    <div class="mt-5 flex flex-row flex-wrap">
      <div
        class="bg-green-200 text-xs text-green-600 px-2 py-1 rounded mr-2 mb-2"
      >
        {{ totalNumPassengers }} pax
      </div>
      <div
        class="bg-green-200 text-xs text-green-600 px-2 py-1 rounded mr-2 mb-2"
      >
        {{ journies.length }} pickup{{ journies.length > 1 ? "s" : "" }}
      </div>
      <div
        v-if="totalNumBabySeats"
        class="bg-green-200 text-xs text-green-600 px-2 py-1 rounded mr-2 mb-2"
      >
        {{ totalNumBabySeats }} baby seats
      </div>
      <div
        v-if="totalNumBoosterSeats"
        class="bg-green-200 text-xs text-green-600 px-2 py-1 rounded mr-2 mb-2"
      >
        {{ totalNumBoosterSeats }} boosters seats
      </div>
      <div
        v-if="totalNumChildSeats"
        class="bg-green-200 text-xs text-green-600 px-2 py-1 rounded mr-2 mb-2"
      >
        {{ totalNumChildSeats }} child seats
      </div>
    </div>

<!--     <div class="mt-5 text-sm">
      Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
      voluptatibus maiores alias consequatur aut perferendis doloribus
      asperiores repellat.
    </div> -->

    <div class="mt-5">
      <el-button type="primary" @click.native="handleClickEvent()"
        >View</el-button
      >
    </div>
  </div>
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
  props: {
    event: {
      type: Object,
      required: true
    },

    journies: {
      type: Array,
      required: true
    },

    dateWithFormat: {
      required: true
    },
    currentDate: {
      required: true
    }
  },

  computed: {
    toPlaceCode() {
      const toCode = this.journies[
        this.journies.length - 1
      ].transient.toPlace.code.toLowerCase();
      return toCode;
    },

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
      return calculateTotalNumBabySeats(this.journies);
    },

    totalNumBoosterSeats() {
      return calculateTotalNumBoosterSeats(this.journies);
    },

    totalNumChildSeats() {
      return calculateTotalNumChildSeats(this.journies);
    }
  },

  methods: {
    handleClickEvent() {
      this.$router.push({
        name: "driver-detail",
        params: {
          eventId: this.event.id,
          dateWithFormat: this.dateWithFormat,
          currentDate: this.currentDate
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped></style>
