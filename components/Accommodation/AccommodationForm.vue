<template>
  <div>
    <section v-if="displayAddAccommodationButton">
      <div class="create-button">
        <el-button
          type="primary"
          @click.prevent="createNewAccommodation"
          icon="el-icon-circle-plus"
          >Create New Accommodation</el-button
        >
      </div>
    </section>

    <section>
      <el-dialog
        :visible.sync="editFormVisible"
        width="1140px"
        top="0vh"
        v-on:closed="handleDialogClosed"
      >
        <span slot="title" class="dialog-header">
          <el-button
            type="primary"
            :disabled="false"
            @click.prevent="saveOrUpdate('accommodationForm')"
            :loading="loading"
            icon="el-icon-download"
            size="mini"
            >{{
              isEditing ? "Update Accommodation" : "Save Accommodation"
            }}</el-button
          >
        </span>
        <h2>
          {{
            isEditing
              ? "Edit Existing Accommodation"
              : "Create New Accommodation"
          }}
        </h2>
        <el-form
          ref="accommodationForm"
          :label-position="labelPosition"
          :model="accommodationForm"
          :rules="rules"
          label-width="180px"
          size="medium"
        >
          <el-collapse v-model="activeFormPanels" accordion>
            <el-collapse-item title="Required" name="1">
              <div class="c74-padded-form">
                <AccommodationForm1
                  :accommodationForm="accommodationForm"
                  :allActiveTourOperators="allActiveTourOperators"
                  :allActivePlaces="allActivePlaces"
                  :allPlaces="allPlaces"
                  :isEditing="isEditing"
                  ref="accommodationForm1"
                />
              </div>
            </el-collapse-item>
            <el-collapse-item title="Address & Directions" name="2">
              <div class="c74-padded-form">
                <AccommodationForm2 :accommodationForm="accommodationForm" />
              </div>
            </el-collapse-item>
            <el-collapse-item title="Contact Details" name="3">
              <div class="c74-padded-form">
                <AccommodationForm3 :accommodationForm="accommodationForm" />
              </div>
            </el-collapse-item>
            <el-collapse-item title="Notes" name="4">
              <div class="c74-padded-form">
                <AccommodationForm4 :accommodationForm="accommodationForm" />
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button
            :type="buttonType"
            @click="saveOrUpdate('accommodationForm')"
            :loading="loading"
            icon="el-icon-download"
            >{{
              isEditing ? "Update Accommodation" : "Save Accommodation"
            }}</el-button
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
import * as firebase from "firebase/app";

import AccommodationForm1 from "@/components/Accommodation/AccommodationForm1";
import AccommodationForm2 from "@/components/Accommodation/AccommodationForm2";
import AccommodationForm3 from "@/components/Accommodation/AccommodationForm3";
import AccommodationForm4 from "@/components/Accommodation/AccommodationForm4";

export default {
  components: {
    AccommodationForm1,
    AccommodationForm2,
    AccommodationForm3,
    AccommodationForm4
  },
  props: {
    existingAccommodation: Object,
    accommodationId: String,
    shouldOpenDialog: Boolean,
    displayAddAccommodationButton: Boolean,
    allActiveTourOperators: { type: Array, required: true },
    allActivePlaces: { type: Array, required: true },
    allPlaces: { type: Array, required: true }
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

      accommodationForm: this.createEmptyAccommodationObject(),
      rules: {

      }
    };
  },

  watch: {
    shouldOpenDialog: function(value, oldValue) {
      if (value) {
        this.editFormVisible = true;
      } else {
        this.editFormVisible = false;
      }
    },

    accommodationId: function(value, oldValue) {},

    existingAccommodation: function(value, oldValue) {
      this.isEditing = true;

      this.resetForm();

      this.accommodationForm = {
        ...this.existingAccommodation
      };

      if (this.existingAccommodation && this.existingAccommodation.geoPoint) {
        this.accommodationForm.latitude = this.existingAccommodation.geoPoint.latitude;
        this.accommodationForm.longitude = this.existingAccommodation.geoPoint.longitude;
      }
    }
  },

  methods: {
    async saveOrUpdate(formName) {

      let isForm1Valid = this.$refs.accommodationForm1.isValidForm();

      this.$refs[formName].validate(valid => {
        if (isForm1Valid && valid) {
          this.loading = true;

          if (this.isEditing) {
            this.updateAccommodation();
          } else {
            this.createAccommodation();
          }
        } else {
          return false;
        }
      });
    },
    createAccommodation() {
      const accommodation = {
        active: true,
        ...this.accommodationForm
      };

      this.convertLatAndLong(accommodation);

      this.$store
        .dispatch("accommodations/addAccommodation", accommodation)
        .then(() => {
          this.$notify.success({
            title: "Success",
            message: "The accommodation was saved",
            offset: 100
          });

          this.activeFormPanels = ["1"];
          this.$emit("close-form");
        })
        .catch(error => {
          this.$notify.error({
            title: "Failed",
            message: "Saving failed",
            offset: 100
          });
        })
        .finally(() => {
          this.loading = false;
          this.isCreating = false;
        });
    },
    updateAccommodation() {
      const editedAccommodation = {
        id: this.accommodationId,
        active: true,
        ...this.accommodationForm
      };

      this.convertLatAndLong(editedAccommodation);

      this.$store
        .dispatch("accommodations/editAccommodation", editedAccommodation)
        .then(() => {
          this.$notify.success({
            title: "Success",
            message: "The accommodation was updated",
            offset: 100
          });

          this.activeFormPanels = ["1"];
          this.$emit("close-form");
        })
        .catch(error => {
          this.$notify.error({
            title: "Failed",
            message: "The updated failed",
            offset: 100
          });
        })
        .finally(() => {
          this.loading = false;
          this.isEditing = false;
        });
    },

    convertLatAndLong(accommodation) {
      if(this.accommodationForm.latitude && this.accommodationForm.longitude) {
        accommodation.geoPoint = new firebase.firestore.GeoPoint(
          +this.accommodationForm.latitude, // remember the + converts to a number ;)
          +this.accommodationForm.longitude
        );
      }
    },
    createNewAccommodation() {
      this.resetForm();
      this.activeFormPanels = ["1"];
      this.isCreating = true;
      this.isEditing = false;
      this.$emit("open-form");
    },
    resetForm() {
      if (this.$refs['accommodationForm']) {
        this.$refs['accommodationForm'].resetFields();
      }
      this.accommodationForm = this.createEmptyAccommodationObject();
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
    createEmptyAccommodationObject() {
      return {
        active: true,
        accommodationName: "",
        tourOperatorId: "",
        placeId : "",
        latitude: null,
        longitude: null,
        address: "",
        directions: "",
        telNum: "",
        telMobile: "",
        email: "",
        internalNotes: "",
        clientNotes: "",
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.create-button {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
</style>
