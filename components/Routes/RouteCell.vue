<template>
  <div>
    <div
      class="c74-box"
      :class="connectionFound.bookable ? 'bg-green-100' : 'bg-red-100'"
      v-if="connectionExists"
      v-bind:class="classObject"
      v-on:click="handleClick()"
    >
      <div class="distance">{{ connectionFound.distance }}&nbsp;km</div>
      <div class="time">{{ connectionFound.time }}&nbsp;mins</div>
    </div>
    <div
      v-else
      v-on:click="handleClick()"
      class="c74-box"
      v-bind:class="classObject"
    >
      -
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: {
    outerPlace: Object,
    innerPlace: Object,
    outerIndex: Number,
    innerIndex: Number
  },

  data() {
    return {
      connectionFound: null
    };
  },

  computed: {
    classObject: function() {
      return {
        "c74-hidden": this.outerIndex < this.innerIndex
      };
    },

    connectionExists() {
      // console.log("connectionExists", this.allRoutes);

      const connectionFound = this.allRoutes.find(
        route =>
          route.fromCode === this.outerPlace.code &&
          route.toCode === this.innerPlace.code
      );
      this.connectionFound = connectionFound;
      return this.connectionFound;
    },

    ...mapGetters("routes", {
      allRoutes: "getAllRoutes"
    })
  },

  methods: {
    handleClick() {
      if (this.outerPlace.code != this.innerPlace.code) {
        // only act on the click if the user hasn't clicked on the same start and to place in the chart
        this.$emit("route-clicked", this.outerPlace, this.innerPlace);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.c74-hidden {
  opacity: 1;
}

.c74-box {
  width: 60px;
  height: 60px;
  border: 1px solid #d8d8d8;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  cursor: pointer;
}
</style>
