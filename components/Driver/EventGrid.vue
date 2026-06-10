<template>
  <div>
    <div v-if="events" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="event in events" :key="event.id">
        <EventGridCard
          v-if="journiesForEventMap && journiesForEventMap.get(event.id)"
          :event="event"
          :journies="journiesForEventMap.get(event.id)"
          :dateWithFormat="dateWithFormat"
          :currentDate="currentDate"
        />
      </div>
    </div>
  </div>
</template>

<script>
import EventGridCard from "@/components/Driver/EventGridCard";

export default {
  name: "event-grid",
  components: {
    EventGridCard
  },

  props: {
    events: {
      type: Array,
      required: true
    },
    journiesForEventMap: {
      type: Map,
      required: true
    },
    dateWithFormat: {
      required: true
    },
    currentDate: {
      required: true
    }
  },

  data() {
    return {};
  }
};
</script>

<style lang="scss" scoped></style>
