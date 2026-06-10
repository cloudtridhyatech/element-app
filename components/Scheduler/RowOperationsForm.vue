<template>
  <div>
    <div v-if="vehicle">
      <el-dialog
        :visible.sync="rowOperationsDialogFormVisible"
        width="800px"
        top="0vh"
        v-on:closed="handleDialogClosed"
      >
        <span slot="title" class="dialog-header">
          {{ vehicle.name }}
        </span>

        <el-dropdown @command="handleCommand">
          <el-button type="primary" size="small">
            Choose Operation<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              command="assign-driver"
              :disabled="isZeroEventsAssignedToVehicle()"
              >Assign driver to ...
            </el-dropdown-item>
            <el-dropdown-item
              command="swap-journies-between-vehicles"
              :disabled="isZeroEventsAssignedToVehicle()"
              >Swap transfers with ...</el-dropdown-item
            >
            <el-dropdown-item divided disabled
              >Deactivate this Vehicle</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>

        <div v-if="performingCommand == 'assign-driver'">
          <AssignDriverForm
            :vehicle="vehicle"
            v-on:close-form="$emit('close-form')"
          />
        </div>
        <div v-if="performingCommand == 'swap-journies-between-vehicles'">
          <SwapJourneysForm
            :vehicle="vehicle"
            v-on:close-form="$emit('close-form')"
          />
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import AssignDriverForm from "@/components/Scheduler/RowOperationsForms/AssignDriverForm";
import SwapJourneysForm from "@/components/Scheduler/RowOperationsForms/SwapJourneysForm";

export default {
  name: "RowOperationsForm",

  components: {
    AssignDriverForm,
    SwapJourneysForm
  },

  props: {
    rowId: { type: String, required: true },
    shouldOpenRowOperationsDialog: Boolean
  },

  data() {
    return {
      loading: false,
      vehicle: null,
      performingCommand: "",
      form: {
        // splitValue: 0,
        driverId: ""
      },
      rowOperationsDialogFormVisible: false
    };
  },

  watch: {
    shouldOpenRowOperationsDialog: function(value, oldValue) {
      if (value) {
        this.rowOperationsDialogFormVisible = true;
      } else {
        this.rowOperationsDialogFormVisible = false;
      }
    },

    rowId: function(value, oldValue) {
      this.initForm();
    }
  },

  mounted() {
    console.log("mounted");
    this.initForm();
  },

  computed: {
    ...mapGetters("vehicles", {
      getVehicleById: "getVehicleById"
    }),
    ...mapGetters("events", {
      getAllEventsForSetDateAssignedToVehicleId:
        "getAllEventsForSetDateAssignedToVehicleId"
    })
  },

  methods: {
    initForm() {
      this.performingCommand = "";

      if (this.rowId) {
        this.vehicle = this.getVehicleById(this.rowId);
      }
    },

    isZeroEventsAssignedToVehicle() {
      return (
        this.getAllEventsForSetDateAssignedToVehicleId(this.vehicle.id)
          .length === 0
      );
    },

    handleCommand(command) {
      this.performingCommand = command;
    },

    handleDialogClosed() {
      this.performingCommand = "";
      this.$emit("close-form");
    }
  }
};
</script>

<style lang="scss" scoped></style>
