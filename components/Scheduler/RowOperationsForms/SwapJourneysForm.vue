<template>
  <div style="margin-top: 48px;">
    <el-form
      ref="form"
      :model="form"
      :label-position="labelPosition"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="Select Vehicle">
            <el-select
              v-model="form.targetVehicleId"
              placeholder="select vehicle"
            >
              <el-option
                v-for="vehicle in allActiveVehicles.filter(
                  v => v.id != vehicle.id
                )"
                :key="vehicle.id"
                :label="vehicle.name"
                :value="vehicle.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <span class="dialog-footer">
      <el-button
        @click="handleSwapJourniesBetweenVehicles()"
        type="primary"
        :loading="loading"
        >Swap Jobs</el-button
      >
      <el-button @click="handleCancel()" icon="el-icon-close">Cancel</el-button>
    </span>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import { swapJourniesBetweenVehicles } from "@/statics/scheduler/functions.js";

export default {
  name: "SwapJourniesForm",

  props: {
    vehicle: { type: Object, required: true }
  },

  data() {
    return {
      labelPosition: "top",
      loading: false,
      form: {
        sourceVehicleId: "",
        targetVehicleId: ""
      }
    };
  },

  mounted() {
    this.initForm();
  },

  computed: {
    ...mapGetters("vehicles", {
      allActiveVehicles: "getAllActiveVehicles"
    }),
    ...mapGetters("events", {
      getAllEventsForSetDateAssignedToVehicleId:
        "getAllEventsForSetDateAssignedToVehicleId"
    })
  },

  methods: {
    initForm() {
      this.form.sourceVehicleId = this.vehicle.id;
    },

    async handleSwapJourniesBetweenVehicles() {
      // disable the button and show a spinner whilst we work
      this.loading = true;

      const eventsAssignedToSourceVehicle = this.getAllEventsForSetDateAssignedToVehicleId(
        this.form.sourceVehicleId
      );

      const eventsAssignedToTargetVehicle = this.getAllEventsForSetDateAssignedToVehicleId(
        this.form.targetVehicleId
      );

      try {
        await swapJourniesBetweenVehicles(
          eventsAssignedToSourceVehicle,
          eventsAssignedToTargetVehicle,
          this.form.sourceVehicleId,
          this.form.targetVehicleId,
          this.$store
        );

        this.loading = false;
        this.$emit("close-form");

        // set the array of events needing a redraw in the store. This'll be picked up by the scheduler
        const sourceEventIds = [
          ...new Set(eventsAssignedToSourceVehicle.map(e => e.id))
        ];
        const targetEventIds = [
          ...new Set(eventsAssignedToTargetVehicle.map(e => e.id))
        ];
        this.$store.dispatch("events/setEventsNeedingRedraw", [
          ...sourceEventIds,
          ...targetEventIds
        ]);

        this.$message({
          message: `Successfully moved transfers between the chosen vehicles.`,
          type: "success",
          showClose: true,
          duration: 5000
        });
      } catch (error) {
        this.$message({
          message: error,
          type: "error"
        });
      }
    },

    handleCancel() {
      this.$emit("close-form");
    }
  }
};
</script>

<style lang="scss" scoped></style>
