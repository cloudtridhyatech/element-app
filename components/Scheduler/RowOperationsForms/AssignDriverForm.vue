<template>
  <div style="margin-top: 48px;">
    <el-form
      ref="form"
      :model="form"
      :label-position="labelPosition"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Select Driver">
            <el-select
              clearable
              v-model="form.driverId"
              placeholder="select driver"
            >
              <el-option
                v-for="driver in allActiveDrivers"
                :key="driver.id"
                :label="driver.firstName + ' ' + driver.lastName"
                :value="driver.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <span class="dialog-footer">
      <el-button
        @click="handleChangeDriver()"
        type="primary"
        :loading="loading"
        :disabled="!form.driverId"
        >Assign to {{ vehicle.name }}</el-button
      >
      <el-button
        @click="handleChangeDriver()"
        type="danger"
        :loading="loading"
        :disabled="form.driverId != ''"
        >Remove driver(s)</el-button
      >
      <el-button @click="handleCancel()" icon="el-icon-close">Cancel</el-button>
    </span>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import { assignDriverToAllEventsInRow } from "@/statics/scheduler/functions.js";

export default {
  name: "AssignDriverForm",

  props: {
    vehicle: { type: Object, required: true }
  },

  data() {
    return {
      labelPosition: "top",
      loading: false,
      form: {
        driverId: ""
      }
    };
  },

  mounted() {},

  computed: {
    ...mapGetters("drivers", {
      allActiveDrivers: "getAllActiveDrivers"
    }),
    ...mapGetters("events", {
      getAllEventsForSetDateAssignedToVehicleId:
        "getAllEventsForSetDateAssignedToVehicleId"
    })
  },

  methods: {
    async handleChangeDriver() {
      // disable the button and show a spinner whilst we work
      this.loading = true;

      const eventsAssignedToVehicle = this.getAllEventsForSetDateAssignedToVehicleId(
        this.vehicle.id
      );

      try {
        await assignDriverToAllEventsInRow(
          eventsAssignedToVehicle,
          this.form.driverId,
          this.vehicle.id,
          this.$store
        );

        this.loading = false;
        this.$emit("close-form");

        // set the array of events needing a redraw in the store. This'll be picked up by the scheduler
        const eventIds = [...new Set(eventsAssignedToVehicle.map(e => e.id))];
        this.$store.dispatch("events/setEventsNeedingRedraw", eventIds);

        const message = this.form.driverId
          ? `${this.getDriverFullName()} was successfully assigned to all transfers for ${
              this.vehicle.name
            }`
          : "Each driver was successfully removed from each transfer.";

        this.$message({
          message: message,
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

    getDriverFullName() {
      if (!this.form.driverId) {
        return "";
      }

      const driver = this.allActiveDrivers.find(
        d => d.id === this.form.driverId
      );

      if (driver) {
        return `${driver.firstName} ${driver.lastName}`;
      }
      return "";
    },

    handleCancel() {
      this.$emit("close-form");
    }
  }
};
</script>

<style lang="scss" scoped></style>
