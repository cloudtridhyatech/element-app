<template>
  <div class="c74-tip">
    <p v-if="!availableDateRange && !availableTimeRange">
      No restrictions apply and this pricing is available year round at any time
      of day.
    </p>
    <p v-if="availableDateRange && !availableTimeRange">
      Okay, this price will be available:
      <br />
      <br />
      All day, every day from
      {{ $moment(availableDateRange[0]).format("MMMM Do") }}
      until
      {{ $moment(availableDateRange[1]).format("MMMM Do") }}
      inclusive.
    </p>
    <p v-if="!availableDateRange && availableTimeRange">
      Okay, this price will be available:
      <br />
      <br />
      Each day of the year from
      {{ $moment(availableTimeRange[0]).format("HH:mm") }} until
      {{ $moment(availableTimeRange[1]).format("HH:mm") }} each day.
    </p>
    <p v-if="availableDateRange && availableTimeRange">
      Okay, this price will be available between:
      <br />
      <br />
      {{ $moment(availableDateRange[0]).format("MMMM Do") }} and
      {{ $moment(availableDateRange[1]).format("MMMM Do") }}
      from
      {{ $moment(availableTimeRange[0]).format("HH:mm") }} until
      {{ $moment(availableTimeRange[1]).format("HH:mm") }} each day.
    </p>
    <p v-if="availableDaysOfWeekSelected">{{ availableDaysOfWeekSelected }}</p>
  </div>
</template>

<script>
export default {
  name: "DateRestrictionTip",
  props: {
    availableDateRange: {
      required: true
    },
    availableTimeRange: {
      // specifically not setting type as Array as this produces a strange issue in the time selevtor
      // when there is not default value.
      required: true
    },
    availableDaysOfWeekSelected: {
      type: Array,
      required: true
    }
  },
  computed: {
    fromDate: function() {
      return this.availableDateRange[0];
    },
    toDate: function() {
      return this.availableDateRange[1];
    },
    fromTime: function() {
      return this.availableTimeRange[0];
    },
    toTime: function() {
      return this.availableTimeRange[1];
    }
  }
};
</script>

<style scoped></style>
