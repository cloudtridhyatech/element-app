<template>
  <div>
    <!--     <div>firebaseUser: {{ firebaseUser }}</div>
    <div>loggedInUser: {{ loggedInUser }}</div>
    <div>companyId: {{ companyId }}</div>
    <div>company: {{ company }}</div>-->

    <EntityEmptyState
      v-if="
        !mixinCanReadUsers(loggedInUser) &&
          !mixinCanReadPlacesAndRoutes(loggedInUser) &&
          !mixinCanReadAccommodations(loggedInUser) &&
          !mixinCanReadVehicles(loggedInUser) &&
          !mixinCanReadTourOperators(loggedInUser) &&
          !mixinCanReadSettings(loggedInUser)
      "
      message="Oops... you've not been granted any permissions ... at all!"
      instruction="Please ask the person who created your account to give you suitable permissions to begin using the system."
      buttonText
      image="nothing-found"
    />

    <div class="flex flex-col justify-between md:flex-row md:items-center mt-3">
      <div class="flex flex-col space-y-3">
        <div class="flex flex-row items-center">
          <nuxt-link to="/">Home</nuxt-link>
        </div>
        <div class="text-3xl font-extrabold">Account Health Check</div>
      </div>
    </div>

    <HealthCheck v-show="mixinCanSeeHealthCheck(loggedInUser)"/>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb } from "@/plugins/firebase.js";

import { accommodationPermissionsMixin } from "@/statics/auth/accommodationPermissions.js";
import { userPermissionsMixin } from "@/statics/auth/userPermissions.js";
import { placeAndRoutePermissionsMixin } from "@/statics/auth/placeAndRoutePermissions.js";
import { vehiclePermissionsMixin } from "@/statics/auth/vehiclePermissions.js";
import { tourOperatorPermissionsMixin } from "@/statics/auth/tourOperatorPermissions.js";
import { pricingRulesPermissionsMixin } from "@/statics/auth/pricingRulesPermissions.js";
import { bookingPermissionsMixin } from "@/statics/auth/bookingPermissions.js";
import { settingsPermissionsMixin } from "@/statics/auth/settingsPermissions.js";
import { navigationPermissionsMixin } from "@/statics/auth/navigationPermissions.js";

import EntityEmptyState from "@/components/EmptyStates/EntityEmptyState";

import HealthCheck from "@/components/Shared/HealthCheck";

export default {
  mixins: [
    accommodationPermissionsMixin,
    userPermissionsMixin,
    placeAndRoutePermissionsMixin,
    vehiclePermissionsMixin,
    tourOperatorPermissionsMixin,
    pricingRulesPermissionsMixin,
    bookingPermissionsMixin,
    settingsPermissionsMixin,
    navigationPermissionsMixin    
  ],

  components: {
    EntityEmptyState,
    HealthCheck
  },

  data() {
    return {
      companyDocId: "",
      dashboardCardProps: {
        booking: {
          imageName: require("~/assets/images/dashboard/users.png"),
          title: "Bookings",
          description:
            "Create new bookings and maintain existing bookings, view existing journies and add new journies as needed.",
          linkButtonText: "Manage Bookings",
          buttonUrl: "/bookings"
        },
        users: {
          imageName: require("~/assets/images/dashboard/routes.png"),
          title: "Users",
          description:
            "Create and maintain users that can access your administration system.",
          linkButtonText: "Manage Users",
          buttonUrl: "/users"
        },
        routes: {
          imageName: require("~/assets/images/dashboard/routes.png"),
          title: "Routes and Places",
          description:
            "Create and maintain the places you serve and the routes you can supply.",
          linkButtonText: "Manage Routes & Places",
          buttonUrl: "/routes"
        },
        accommodation: {
          imageName: require("~/assets/images/dashboard/accommodation.png"),
          title: "Accommodation",
          description:
            "Maintain the accommodation you can transfer to and from to enable clients to specify exactly where they are holidaying.",
          linkButtonText: "Manage Accommodation",
          buttonUrl: "/accommodation"
        },
        vehicles: {
          imageName: require("~/assets/images/dashboard/routes.png"),
          title: "Vehicles",
          description: "Create and maintain vehicles.",
          linkButtonText: "Manage Vehicles",
          buttonUrl: "/vehicles"
        },
        tourOperator: {
          imageName: require("~/assets/images/dashboard/accommodation.png"),
          title: "Tour Operators",
          description: "Create and maintain tour operators.",
          linkButtonText: "Manage Tour Operators",
          buttonUrl: "/tourOperator"
        }
      }
    };
  },

  created() {
    console.log("created");
    // this.getUser();
  },

  computed: {
    ...mapGetters("auth", {
      firebaseUser: "getUser"
    }),
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    }),
    ...mapGetters("companies", {
      companyId: "getCompanyId",
      company: "getCompany"
    })
  },

  methods: {}
};
</script>

<style lang="scss" scoped></style>
