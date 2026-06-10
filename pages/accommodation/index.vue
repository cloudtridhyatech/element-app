<template>
  <div v-loading="loading">
    <div v-if="mixinCanReadAccommodations(loggedInUser)">
      <EntityEmptyState
        v-if="allAccommodations.length === 0"
        v-on:create-new-entity="createNewAccommodation"
        message="No accommodations have been created ..."
        instruction="Please create accommodations for clients to book transfers to and from ..."
        buttonText="Create New Accommodation"
        image="nothing-found"
      />
      <PageHeader :breadCrumb="breadCrumb">
        <slot>
          <AccommodationForm
            :accommodationId="accommodationId"
            :existingAccommodation="existingAccommodation"
            :allActiveTourOperators="allActiveTourOperators"
            :allActivePlaces="allActivePlaces"
            :allPlaces="allPlaces"
            v-bind:shouldOpenDialog="shouldOpenDialog"
            v-on:close-form="onCloseForm"
            v-on:open-form="onOpenForm"
            :displayAddAccommodationButton="allAccommodations.length > 0"
            ref="mainAccommodationForm"
          />
        </slot>
      </PageHeader>

      <section v-if="allAccommodations.length > 0">
        <AccommodationList
          :allPlaces="allPlaces"
          :allActiveTourOperators="allActiveTourOperators"
          v-on:load-existing-accommodation="onLoadExistingAccommodation"
          v-on:open-form="onOpenForm"
        />
      </section>
    </div>
    <div v-else>You do not have permission.</div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb } from "@/plugins/firebase.js";

import { accommodationPermissionsMixin } from "@/statics/auth/accommodationPermissions.js";

import PageHeader from "@/components/Shared/PageHeader";
import AccommodationList from "@/components/Accommodation/AccommodationList";
import AccommodationForm from "@/components/Accommodation/AccommodationForm";
import EntityEmptyState from "@/components/EmptyStates/EntityEmptyState";

export default {
  mixins: [accommodationPermissionsMixin],

  components: {
    AccommodationList,
    AccommodationForm,
    EntityEmptyState,
    PageHeader,
  },

  data() {
    return {
      breadCrumb: {
        routeName: "Accommodations",
        title: "Accommodations",
      },
      loading: true,
      tourOperatorsLoaded: false,
      placesLoaded: false,
      accommodationsLoaded: false,

      accommodationId: "",
      existingAccommodation: null,
      shouldOpenDialog: false,
    };
  },

  created() {
    if (this.allActiveTourOperators.length === 0) {
      this.$store.dispatch("tourOperators/initTourOperators").then(() => {
        this.tourOperatorsLoaded = true;
      });
    } else {
      this.tourOperatorsLoaded = true;
    }

    if (this.allAccommodations.length === 0) {
      this.$store.dispatch("accommodations/initAccommodations").then(() => {
        this.accommodationsLoaded = true;
      });
    } else {
      this.accommodationsLoaded = true;
    }

    if (this.allPlaces.length === 0) {
      this.$store.dispatch("places/initPlaces").then(() => {
        this.placesLoaded = true;
      });
    } else {
      this.placesLoaded = true;
    }
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId",
    }),
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser",
    }),
    ...mapGetters("accommodations", {
      allAccommodations: "getAllAccommodations",
    }),
    ...mapGetters("tourOperators", {
      allActiveTourOperators: "getAllActiveTourOperators",
    }),
    ...mapGetters("places", {
      allActivePlaces: "getAllActivePlaces",
    }),
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    }),
  },

  watch: {
    tourOperatorsLoaded: function (value, oldValue) {
      if (value) {
        this.disableLoadingStateIfAllDataLoaded();
      }
    },
    placesLoaded: function (value, oldValue) {
      if (value) {
        this.disableLoadingStateIfAllDataLoaded();
      }
    },
    accommodationsLoaded: function (value, oldValue) {
      if (value) {
        this.disableLoadingStateIfAllDataLoaded();
      }
    },
  },

  methods: {
    disableLoadingStateIfAllDataLoaded() {
      if (
        this.tourOperatorsLoaded &&
        this.placesLoaded &&
        this.accommodationsLoaded
      ) {
        this.loading = false;
      }
    },

    createNewAccommodation() {
      this.$refs['mainAccommodationForm'].resetForm();
      this.existingAccommodation = null;
      this.shouldOpenDialog = true;
    },

    async onLoadExistingAccommodation(id) {
      // clearing the accommodationId will change the truth value that presents the form.
      // the effect of this will also trigger the fade animation in and out as the priceID
      // gets set again.
      this.accommodationId = "";

      const ref = fireDb
        .collection("companies")
        .doc(this.companyId)
        .collection("accommodations")
        .doc(id);

      try {
        const snapshot = await ref.get();

        this.accommodationId = id;
        this.existingAccommodation = snapshot.data();

        // console.log(this.existingAccommodation);
      } catch (e) {
        console.error(e);
      }
    },
    onCloseForm() {
      this.existingAccommodation = null;
      this.shouldOpenDialog = false;
    },
    onOpenForm() {
      // console.log("parent.onOpenForm");
      this.shouldOpenDialog = true;
    },
  },
};
</script>

<style lang="scss" scoped></style>
