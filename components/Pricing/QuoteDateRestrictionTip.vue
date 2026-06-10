<template>
  <div class="c74-tip">
    <p v-if="!quoteDateTimeFrom && !quoteDateTimeTo">
      No restrictions apply and this pricing is available for quotes requested
      at any time.
    </p>
    <p v-else-if="quoteDateTimeFrom && !quoteDateTimeTo">
      Okay, this pricing option will only be available for quotes made
      from:<br /><br />
      {{ $moment(quoteDateTimeFrom).format("MMMM Do") }} at
      {{ $moment(quoteDateTimeFrom).format("HH:mm") }}
    </p>
    <p v-else-if="!quoteDateTimeFrom && quoteDateTimeTo">
      Okay, this pricing option will only be available for quotes made
      until:<br /><br />
      {{ $moment(quoteDateTimeTo).format("MMMM Do") }} at
      {{ $moment(quoteDateTimeTo).format("HH:mm") }}
    </p>    
    <p v-else-if="quoteDateTimeFrom && quoteDateTimeTo">
      Okay, this pricing option will only be available for quotes made
      between:<br /><br />
      {{ $moment(quoteDateTimeFrom).format("MMMM Do") }} at
      {{ $moment(quoteDateTimeFrom).format("HH:mm") }} and
      {{ $moment(quoteDateTimeTo).format("MMMM Do") }} at
      {{ $moment(quoteDateTimeTo).format("HH:mm") }}
    </p>

    <p v-else>
      ... please complete all dates and times (or clear each entry)
    </p>
  </div>
</template>

<script>
export default {
  name: "QuoteDateRestrictionTip",

  props: {
    quoteDateTimeFrom: {
      required: true
    },
    quoteDateTimeTo: {
      required: true
    },
  }
};
</script>

<style scoped></style>
