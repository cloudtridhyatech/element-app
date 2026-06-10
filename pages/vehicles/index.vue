<template>
  <div v-loading="loading">
    <div v-if="mixinCanReadVehicles(loggedInUser)">
      <EntityEmptyState
        v-if="allVehicles.length === 0"
        v-on:create-new-entity="createNewVehicle"
        message="No vehicles have been created ..."
        instruction="Please create vehicles to operate your jobs/transfers."
        buttonText="Create New Vehicle"
        image="nothing-found"
      />

      <section>
        <PageHeader :breadCrumb="breadCrumb">
          <slot>
            <VehicleForm
              :vehicleId="vehicleId"
              :existingVehicle="existingVehicle"
              v-bind:shouldOpenDialog="shouldOpenDialog"
              v-on:close-form="onCloseForm"
              v-on:open-form="onOpenForm"
              :displayAddVehicleButton="allVehicles.length > 0"
              :allVehicles="allVehicles"
              :allVehicleSettings="allVehicleSettings"
            />
          </slot>
        </PageHeader>
      </section>

      <section v-if="allVehicles.length > 0">
        <VehicleList
          v-on:load-existing-vehicle="onLoadExistingVehicle"
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

import { vehiclePermissionsMixin } from "@/statics/auth/vehiclePermissions.js";

import PageHeader from "@/components/Shared/PageHeader";
import VehicleList from "@/components/Vehicle/VehicleList";
import VehicleForm from "@/components/Vehicle/VehicleForm";
import EntityEmptyState from "@/components/EmptyStates/EntityEmptyState";

export default {
  mixins: [vehiclePermissionsMixin],

  components: {
    VehicleList,
    VehicleForm,
    EntityEmptyState,
    PageHeader,
  },

  data() {
    return {
      breadCrumb: {
        routeName: "Existing Vehicle",
        title: "Existing Vehicle",
      },
      loading: true,
      vehicleId: "",
      existingVehicle: null,
      shouldOpenDialog: false,
    };
  },

  created() {
    if (this.allVehicles.length === 0) {
      this.$store.dispatch("vehicles/initVehicles").then(() => {
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId",
    }),
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser",
    }),
    ...mapGetters("vehicles", {
      allVehicles: "getAllVehicles",
    }),
    ...mapGetters("vehicles", {
      allVehicleSettings: "getAllVehicleSettings",
    }),
  },

  methods: {
    createNewVehicle() {
      this.existingVehicle = null;
      this.shouldOpenDialog = true;
    },

    async onLoadExistingVehicle(id) {
      this.vehicleId = "";

      const ref = fireDb
        .collection("companies")
        .doc(this.companyId)
        .collection("vehicles")
        .doc(id);

      try {
        const snapshot = await ref.get();

        this.vehicleId = id;
        this.existingVehicle = snapshot.data();
      } catch (e) {
        console.error(e);
      }
    },
    onCloseForm() {
      this.existingVehicle = null;
      this.shouldOpenDialog = false;
    },
    onOpenForm() {
      this.shouldOpenDialog = true;
    },
  },
};
</script>

<style lang="scss" scoped></style>
