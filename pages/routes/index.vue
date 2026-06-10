<template>
  <div v-if="mixinCanReadPlacesAndRoutes(loggedInUser)">
    <EntityEmptyState
      v-if="allPlaces.length === 0"
      v-on:create-new-entity="handleCreateNewPlace"
      message="No places have been created ..."
      instruction="Please create places so that you can begin created routes between places ..."
      buttonText="Create New Place"
      image="map-flying"
    />

    <PageHeader :breadCrumb="breadCrumb">
      <slot>
        <section>
          <el-button
            type="info"
            @click="handleCreateNewGroup"
            icon="el-icon-circle-plus"
            plain
            >Create New Group</el-button
          >
          <el-button
            type="primary"
            @click="handleCreateNewPlace"
            icon="el-icon-circle-plus"
            >Create New Place</el-button
          >
        </section>
      </slot>
    </PageHeader>

    <section v-if="allPlaces.length > 0">
      <Routes />
    </section>

    <section>
      <div class="text-2xl font-extrabold">Groups</div>
      <div v-if="allPlaceGroups.length > 0" class="mt-4">
        The following groups have been created and can be used in pricing rules.
        <PlaceGroupList :placeGroups="allPlaceGroups" :allPlaces="allPlaces" />
      </div>
      <div v-else>
        You have not created any groups yet. Groups of places can significantly
        ease the management of prices.
      </div>
    </section>
  </div>
  <div v-else>You do not have permission.</div>
</template>

<script>
import { mapGetters } from "vuex";

import PageHeader from "@/components/Shared/PageHeader";
import Routes from "@/components/Routes/Routes";
import EntityEmptyState from "@/components/EmptyStates/EntityEmptyState";
import PlaceGroupList from "@/components/Routes/PlaceGroupList";

import { placeAndRoutePermissionsMixin } from "@/statics/auth/placeAndRoutePermissions.js";

export default {
  mixins: [placeAndRoutePermissionsMixin],

  components: {
    Routes,
    EntityEmptyState,
    PageHeader,
    PlaceGroupList
  },

  data() {
    return {
      breadCrumb: {
        routeName: "Routes",
        title: "Existing Routes"
      }
    };
  },

  async created() {
    if (this.allPlaces.length === 0) {
      await this.$store.dispatch("places/initPlaces");
    }

    if (this.allPlaceGroups.length === 0) {
      await this.$store.dispatch("placeGroups/initPlaceGroups");
    }

    this.loading = false;
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    }),

    ...mapGetters("placeGroups", {
      allPlaceGroups: "getAllPlaceGroups"
    }),

    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    })
  },

  methods: {
    handleCreateNewPlace() {
      this.$router.push({
        path: "/routes/editPlace"
      });
    },
    handleCreateNewGroup() {
      this.$router.push({
        path: "/routes/editGroup"
      });
    }
  }
};
</script>
