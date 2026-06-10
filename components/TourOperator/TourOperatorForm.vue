<template>
  <div>
    <section v-if="displayAddTourOperatorButton">
      <div class="create-button">
        <el-button
          type="primary"
          @click.prevent="createNewTourOp"
          icon="el-icon-circle-plus"
        >Create New Tour Operator</el-button>
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
            @click.prevent="saveOrUpdate('tourOperatorForm')"
            :loading="loading"
            icon="el-icon-download"
            size="mini"
          >{{ isEditing ? "Update Tour Operator" : "Save Tour Operator" }}</el-button>
        </span>
        <h2>
          {{
          isEditing
          ? "Edit Existing Tour Operator"
          : "Create New Tour Operator"
          }}
        </h2>
        <el-form
          ref="tourOperatorForm"
          :label-position="labelPosition"
          :model="tourOperatorForm"
          :rules="rules"
          label-width="180px"
          size="medium"
        >
          <el-collapse v-model="activeFormPanels" accordion>
            <el-collapse-item title="Required" name="1">
              <div class="c74-padded-form">
                <TourOperatorForm1 :tourOperatorForm="tourOperatorForm" />
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button
            :type="buttonType"
            @click="saveOrUpdate('tourOperatorForm')"
            :loading="loading"
            icon="el-icon-download"
          >{{ isEditing ? "Update Tour Operator" : "Save Tour Operator" }}</el-button>
          <el-button @click="handleCancel()" icon="el-icon-close">Cancel</el-button>
        </span>
      </el-dialog>
    </section>
  </div>
</template>

<script>
import { fireDb } from "@/plugins/firebase.js";

import TourOperatorForm1 from "@/components/TourOperator/TourOperatorForm1";

export default {
  components: {
    TourOperatorForm1,
  },
  props: {
    existingTourOperator: Object,
    tourOperatorId: String,
    shouldOpenDialog: Boolean,
    displayAddTourOperatorButton: Boolean,
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

      tourOperatorForm: this.createEmptyTourOperatorObject(),
      rules: {
        name: [
          {
            required: true,
            message: "Please input tour operator name",
            trigger: "blur",
          },
          {
            min: 3,
            max: 50,
            message: "Length should be 3 to 50 characters",
            trigger: "blur",
          },
        ],
      },
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

    tourOperatorId: function (value, oldValue) {},

    existingTourOperator: function (value, oldValue) {
      this.isEditing = true;

      this.resetForm();

      this.tourOperatorForm = {
        ...this.existingTourOperator,
      };
    },
  },

  methods: {
    async saveOrUpdate(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true;

          if (this.isEditing) {
            this.updateTourOperator();
          } else {
            this.createTourOperator();
          }
        } else {
          return false;
        }
      });
    },
    createTourOperator() {
      const tourOperator = {
        active: true,
        ...this.tourOperatorForm,
      };
      this.$store
        .dispatch("tourOperators/addTourOperator", tourOperator)
        .then(() => {
          this.$notify.success({
            title: "Success",
            message: "The tour operator was saved",
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
    updateTourOperator() {
      const editedTourOperator = {
        id: this.tourOperatorId,
        active: true,
        ...this.tourOperatorForm,
      };
      this.$store
        .dispatch("tourOperators/editTourOperator", editedTourOperator)
        .then(() => {
          this.$notify.success({
            title: "Success",
            message: "The tour operator was updated",
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

    createNewTourOp() {
      this.resetForm();      
      this.activeFormPanels = ["1"];
      this.isCreating = true;
      this.isEditing = false;
      this.$emit("open-form");
    },
    resetForm() {
      if (this.$refs["tourOperatorForm"]) {
        this.$refs["tourOperatorForm"].resetFields();
      }
      this.tourOperatorForm = this.createEmptyTourOperatorObject();
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
    createEmptyTourOperatorObject() {
      return {
        active: true,
        name: ""
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
