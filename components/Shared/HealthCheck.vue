<template>
  <!-- This example requires Tailwind CSS v2.0+ -->
  <div v-loading="loading" class="py-62">
    <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <StatWithIcon
        title="Active Vehicles"
        :amount="allActiveVehicles.length"
        :bgClass="
          allActiveVehicles.length === 0 ? 'bg-orange-300' : 'bg-green-300'
        "
      >
        <template v-slot:icon>
          <!-- prettier-ignore -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        </template>

        <template v-slot:secondaryStat>
          {{
            allArchivedVehicles.length > -1
              ? `${allArchivedVehicles.length} inactive vehicles`
              : ""
          }}
        </template>

        <template v-slot:link>
          <nuxt-link
            no-prefetch
            to="/vehicles"
            class="font-medium text-gray-600 hover:text-gray-700"
            ><el-button
              v-if="allActiveVehicles.length === 0"
              plain
              type="warning"
              size="mini"
              >Create your first vehicle</el-button
            >
            <div v-else>
              View all vehicles
            </div>
          </nuxt-link>
        </template>
      </StatWithIcon>

      <StatWithIcon
        title="Active Routes"
        :amount="allActiveRoutes.length"
        :bgClass="
          allActiveRoutes.length === 0 ? 'bg-orange-300' : 'bg-green-300'
        "
      >
        <template v-slot:icon>
          <!-- prettier-ignore -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        </template>

        <template v-slot:secondaryStat>
          {{
            allArchivedRoutes.length > -1
              ? `${allArchivedRoutes.length} inactive routes`
              : ""
          }}
        </template>

        <template v-slot:link>
          <nuxt-link
            no-prefetch
            to="/routes"
            class="font-medium text-gray-600 hover:text-gray-700"
            ><el-button
              v-if="allActiveRoutes.length === 0"
              plain
              type="warning"
              size="mini"
              >Create your first route</el-button
            >
            <div v-else>
              View all routes
            </div>
          </nuxt-link>
        </template>
      </StatWithIcon>

      <StatWithIcon
        title="Active Places"
        :amount="allActivePlaces.length"
        :bgClass="
          allActivePlaces.length === 0 ? 'bg-orange-300' : 'bg-green-300'
        "
      >
        <template v-slot:icon>
          <!-- prettier-ignore -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </template>

        <template v-slot:secondaryStat>
          {{
            allArchivedPlaces.length > -1
              ? `${allArchivedPlaces.length} inactive places`
              : ""
          }}
        </template>

        <template v-slot:link>
          <nuxt-link
            no-prefetch
            to="/routes"
            class="font-medium text-gray-600 hover:text-gray-700"
            ><el-button
              v-if="allActivePlaces.length === 0"
              plain
              type="warning"
              size="mini"
              >Create your first place</el-button
            >
            <div v-else>
              View all places
            </div>
          </nuxt-link>
        </template>
      </StatWithIcon>

      <StatWithIcon
        title="Active Drivers"
        :amount="allActiveDrivers.length"
        :bgClass="
          allActiveDrivers.length === 0 ? 'bg-orange-300' : 'bg-green-300'
        "
      >
        <template v-slot:icon>
          <!-- prettier-ignore -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </template>

        <template v-slot:secondaryStat>
          {{
            allArchivedDrivers.length > -1
              ? `${allArchivedDrivers.length} inactive drivers`
              : ""
          }}
        </template>

        <template v-slot:link>
          <nuxt-link
            no-prefetch
            to="/users"
            class="font-medium text-gray-600 hover:text-gray-700"
            ><el-button
              v-if="allActiveDrivers.length === 0"
              plain
              type="warning"
              size="mini"
              >Create your first driver</el-button
            >
            <div v-else>
              View all driver/users
            </div>
          </nuxt-link>
        </template>
      </StatWithIcon>

      <StatWithIcon
        title="Active Tour Operators"
        :amount="allActiveTourOperators.length"
        :bgClass="
          allActiveTourOperators.length === 0 ? 'bg-orange-300' : 'bg-green-300'
        "
      >
        <template v-slot:icon>
          <!-- prettier-ignore -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        </template>

        <template v-slot:secondaryStat>
          {{
            allArchivedTourOperators.length > -1
              ? `${allArchivedTourOperators.length} inactive tour operators`
              : ""
          }}
        </template>

        <template v-slot:link>
          <nuxt-link
            no-prefetch
            to="/tourOperator"
            class="font-medium text-gray-600 hover:text-gray-700"
            ><el-button
              v-if="allActiveTourOperators.length === 0"
              plain
              type="warning"
              size="mini"
              >Create your first tour operator</el-button
            >
            <div v-else>
              View all tour operators
            </div>
          </nuxt-link>
        </template>
      </StatWithIcon>

      <StatWithIcon
        title="Active Accommodations"
        :amount="allActiveAccommodations.length"
        :bgClass="
          allActiveAccommodations.length === 0
            ? 'bg-orange-300'
            : 'bg-green-300'
        "
      >
        <template v-slot:icon>
          <!-- prettier-ignore -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </template>

        <template v-slot:secondaryStat>
          {{
            allArchivedAccommodations.length > -1
              ? `${allArchivedAccommodations.length} inactive accommodation`
              : ""
          }}
        </template>

        <template v-slot:link>
          <nuxt-link
            no-prefetch
            to="/accommodation"
            class="font-medium text-gray-600 hover:text-gray-700"
            ><el-button
              v-if="allActiveAccommodations.length === 0"
              plain
              type="warning"
              size="mini"
              >Create your first accommodation</el-button
            >
            <div v-else>
              View all accommodation
            </div>
          </nuxt-link>
        </template>
      </StatWithIcon>
    </dl>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import StatWithIcon from "@/components/Shared/StatWithIcon";

export default {
  name: "HealthCheck",

  components: {
    StatWithIcon
  },

  data() {
    return {
      loading: true
    };
  },

  async created() {
    if (this.allActiveVehicles.length === 0) {
      await this.$store.dispatch("vehicles/initVehicles");
    }

    if (this.allActiveRoutes.length === 0) {
      await this.$store.dispatch("routes/initRoutes").then(() => {});
    }

    if (this.allActivePlaces.length === 0) {
      await this.$store.dispatch("places/initPlaces");
    }

    if (this.allActiveTourOperators.length === 0) {
      await this.$store.dispatch("tourOperators/initTourOperators");
    }

    if (this.allActiveAccommodations.length === 0) {
      await this.$store.dispatch("accommodations/initAccommodations");
    }

    if (this.allActiveDrivers.length === 0) {
      await this.$store.dispatch("drivers/initDrivers");
    }

    this.loading = false;
  },

  computed: {
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    }),

    ...mapGetters("vehicles", {
      allActiveVehicles: "getAllActiveVehicles"
    }),
    ...mapGetters("vehicles", {
      allArchivedVehicles: "getAllArchivedVehicles"
    }),

    ...mapGetters("routes", {
      allActiveRoutes: "getAllActiveRoutes"
    }),
    ...mapGetters("routes", {
      allArchivedRoutes: "getAllArchivedRoutes"
    }),

    ...mapGetters("places", {
      allActivePlaces: "getAllActivePlaces"
    }),
    ...mapGetters("places", {
      allArchivedPlaces: "getAllArchivedPlaces"
    }),

    ...mapGetters("tourOperators", {
      allActiveTourOperators: "getAllActiveTourOperators"
    }),
    ...mapGetters("tourOperators", {
      allArchivedTourOperators: "getAllArchivedTourOperators"
    }),

    ...mapGetters("accommodations", {
      allActiveAccommodations: "getAllActiveAccommodations"
    }),
    ...mapGetters("accommodations", {
      allArchivedAccommodations: "getAllArchivedAccommodations"
    }),

    ...mapGetters("drivers", {
      allActiveDrivers: "getAllActiveDrivers"
    }),
    ...mapGetters("drivers", {
      allArchivedDrivers: "getAllArchivedDrivers"
    })
  }
};
</script>

<style lang="scss" scoped></style>
