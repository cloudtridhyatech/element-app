<template>
  <div v-loading="loading">
    <div v-if="mixinCanReadTourOperators(loggedInUser)">
      <EntityEmptyState
        v-if="allTourOperators.length === 0"
        v-on:create-new-entity="createNewTourOperator"
        message="No tour operators have been created ..."
        instruction="Please create tour operators."
        buttonText="Create New Tour Operator"
        image="nothing-found"
      />

      <PageHeader :breadCrumb="breadCrumb">
        <slot>
          <TourOperatorForm
            :tourOperatorId="tourOperatorId"
            :existingTourOperator="existingTourOperator"
            v-bind:shouldOpenDialog="shouldOpenDialog"
            v-on:close-form="onCloseForm"
            v-on:open-form="onOpenForm"
            :displayAddTourOperatorButton="allTourOperators.length > 0"
            ref="mainTourOperatorForm"            
          />
        </slot>
      </PageHeader>

      <section v-if="allTourOperators.length > 0">
        <TourOperatorList
          v-on:load-existing-tour-operator="onLoadExistingTourOperator"
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

import { tourOperatorPermissionsMixin } from "@/statics/auth/tourOperatorPermissions.js";

import PageHeader from "@/components/Shared/PageHeader";
import TourOperatorList from "@/components/TourOperator/TourOperatorList";
import TourOperatorForm from "@/components/TourOperator/TourOperatorForm";
import EntityEmptyState from "@/components/EmptyStates/EntityEmptyState";

export default {
  mixins: [tourOperatorPermissionsMixin],

  components: {
    TourOperatorList,
    TourOperatorForm,
    EntityEmptyState,
    PageHeader
  },

  data() {
    return {
      breadCrumb: {
        routeName: "Tour Operators",
        title: "Tour Operators",
      },
      loading: true,
      tourOperatorId: "",
      existingTourOperator: null,
      shouldOpenDialog: false,
    };
  },

  created() {
    this.$store.dispatch("tourOperators/initTourOperators").then(() => {
      this.loading = false;
    });
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId",
    }),
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser",
    }),
    ...mapGetters("tourOperators", {
      allTourOperators: "getAllTourOperators",
    }),
  },

  methods: {
    createNewTourOperator() {
      this.$refs['mainTourOperatorForm'].resetForm();      
      this.existingTourOperator = null;
      this.shouldOpenDialog = true;
    },

    async onLoadExistingTourOperator(id) {
      this.tourOperatorId = "";

      const ref = fireDb
        .collection("companies")
        .doc(this.companyId)
        .collection("tourOperators")
        .doc(id);

      try {
        const snapshot = await ref.get();

        this.tourOperatorId = id;
        this.existingTourOperator = snapshot.data();
      } catch (e) {
        console.error(e);
      }
    },
    onCloseForm() {
      this.existingTourOperator = null;
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
