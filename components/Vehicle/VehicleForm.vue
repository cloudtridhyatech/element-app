<template>
  <div>
    <section v-if="displayAddVehicleButton">
      <div class="mt-6 md:mt-0">
        <el-button
          type="primary"
          @click.prevent="createNewVehicle"
          icon="el-icon-circle-plus"
          >Create New Vehicle</el-button
        >
      </div>
    </section>

    <section>
      <el-dialog
        :visible.sync="editFormVisible"
        width="1140px"
        top="6vh"
        v-on:closed="handleDialogClosed"
      >
        <span slot="title" class="dialog-header">
          <el-button
            type="primary"
            :disabled="false"
            @click.prevent="saveOrUpdate('vehicleForm')"
            :loading="loading"
            icon="el-icon-download"
            size="mini"
            >{{ isEditing ? "Update Vehicle" : "Save Vehicle" }}</el-button
          >
        </span>
        <h2>
          {{ isEditing ? "Edit Existing Vehicle" : "Create New Vehicle" }}
        </h2>
        <el-form
          ref="vehicleForm"
          :label-position="labelPosition"
          :model="vehicleForm"
          :rules="rules"
          label-width="180px"
          size="medium"
        >
          <el-collapse v-model="activeFormPanels" accordion>
            <el-collapse-item title="Required" name="1">
              <div class="c74-padded-form">
                <VehicleForm1 :vehicleForm="vehicleForm" />
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button
            :type="buttonType"
            @click="saveOrUpdate('vehicleForm')"
            :loading="loading"
            icon="el-icon-download"
            >{{ isEditing ? "Update Vehicle" : "Save Vehicle" }}</el-button
          >
          <el-button @click="handleCancel()" icon="el-icon-close"
            >Cancel</el-button
          >
        </span>
      </el-dialog>
    </section>
  </div>
</template>

<script>
import { fireDb } from "@/plugins/firebase.js";

import VehicleForm1 from "@/components/Vehicle/VehicleForm1";

export default {
  components: {
    VehicleForm1,
  },
  props: {
    existingVehicle: Object,
    vehicleId: String,
    shouldOpenDialog: Boolean,
    displayAddVehicleButton: Boolean,
    allVehicles: Array,
    allVehicleSettings: Object,
  },
  data() {
    return {
      buttonType: "primary",

      editFormVisible: false,
      isCreating: false,
      isEditing: false,

      // keeping track of the submit button status
      loading: false,

      // position of labels in the display of form, valid values are 'top', 'left', 'right'
      labelPosition: "top",

      activeFormPanels: ["1"],

      vehicleForm: this.createEmptyVehicleObject(),

      rules: {
        name: [
          {
            required: true,
            message: "Please input vehicle name",
            trigger: "blur",
          },
          {
            min: 3,
            max: 50,
            message: "Length should be 3 to 50 characters",
            trigger: "blur",
          },
        ],
        capacity:[
          {
            required: true,
            message: "Capacity is required",
            trigger: "change"
          }          
        ]        
      },

      allowedActiveVehicles: 0
    };
  },

  watch: {
    shouldOpenDialog: function (value, oldValue) {
      if (value) {
        this.editFormVisible = true;
      } else {
        this.editFormVisible = false;
      }
    },

    vehicleId: function (value, oldValue) {},

    existingVehicle: function (value, oldValue) {
      this.isEditing = true;

      this.resetForm();

      this.vehicleForm = {
        ...this.existingVehicle,
      };
    },
  },

  methods: {
    async saveOrUpdate(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true;

          if (this.isEditing) {
            this.updateVehicle();
          } else {
            this.createVehicle();
          }
        } else {
          return false;
        }
      });
    },
    createVehicle() {
      const isAllowed = this.isAllowedToCreateNewVehicle()
      if (!isAllowed) {
        this.$notify.warning({
          title: "Max active vehicle allowed limit reached",
          message: `Your account is limited to ${this.allowedActiveVehicles} vehicles.  Please contact us to upgrade your account so that you can add more vehicles.`,
          offset: 100,
        });
        this.loading = false;
        return;
      }
      const vehicle = {
        active: true,
        ...this.vehicleForm,
      };
      this.$store
        .dispatch("vehicles/addVehicle", vehicle)
        .then(() => {
          this.$notify.success({
            title: "Success",
            message: "The vehicle was saved",
            offset: 100,
          });

          this.activeFormPanels = ["1"];
          this.$emit("close-form");
        })
        .catch((error) => {
          this.$notify.error({
            title: "Failed",
            message: "Saving failed",
            offset: 100,
          });
        })
        .finally(() => {
          this.loading = false;
          this.isCreating = false;
        });
    },
    updateVehicle() {
      const editedVehicle = {
        id: this.vehicleId,
        active: true,
        ...this.vehicleForm,
      };
      this.$store
        .dispatch("vehicles/editVehicle", editedVehicle)
        .then(() => {
          this.$notify.success({
            title: "Success",
            message: "The vehicle was updated",
            offset: 100,
          });

          this.activeFormPanels = ["1"];
          this.$emit("close-form");
        })
        .catch((error) => {
          this.$notify.error({
            title: "Failed",
            message: "The updated failed",
            offset: 100,
          });
        })
        .finally(() => {
          this.loading = false;
          this.isEditing = false;
        });
    },

    createNewVehicle() {
      this.resetForm();      
      this.activeFormPanels = ["1"];
      this.isCreating = true;
      this.isEditing = false;
      this.$emit("open-form");
    },
    resetForm() {
      if (this.$refs["vehicleForm"]) {
        this.$refs["vehicleForm"].resetFields();      
      }
      this.vehicleForm = this.createEmptyVehicleObject();
    },
    handleDialogClosed() {
      this.activeFormPanels = ["1"];
      this.$emit("close-form");
    },
    handleCancel() {
      this.isEditing = false;
      this.isCreating = false;
      this.$emit("close-form");
    },

    isAllowedToCreateNewVehicle() {
      const activeVehicles = this.allVehicles.filter(v => v.active);
      const { maxActiveVehicles } = this.allVehicleSettings;

      // used to display allowed numbers in the toast 
      this.allowedActiveVehicles = parseInt(maxActiveVehicles);

      return activeVehicles.length < parseInt(maxActiveVehicles);
    },
    createEmptyVehicleObject() {
      return {
        placeId :"",
        name:"",
        capacity: 1,
        active : true
      };
    }    
  },
};
</script>

<style lang="scss" scoped>
.create-button {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
</style>
