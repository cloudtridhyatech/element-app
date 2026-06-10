<template>
  <div>
    <el-form
      ref="bookingForm"
      :label-position="labelPosition"
      :model="bookingForm"
      label-width="180px"
      size="medium"
      :rules="rules"
      v-loading="loading"
    >
      <el-row :gutter="64">
        <el-col :span="12">
          <el-form-item label="First Name" prop="firstName">
            <el-input
              placeholder="Enter first name"
              v-model="bookingForm.firstName"
            ></el-input>
          </el-form-item>

          <el-form-item label="Last Name" prop="lastName">
            <el-input
              placeholder="Enter last name"
              v-model="bookingForm.lastName"
            ></el-input>
          </el-form-item>

          <el-form-item label="Email" prop="email">
            <el-input
              placeholder="Enter email"
              v-model="bookingForm.email"
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Mobile" prop="mobile">
            <el-input
              placeholder="e.g. +4479123456789"
              v-model="bookingForm.mobile"
              maxlength="15"
            ></el-input>
          </el-form-item>

          <el-form-item label="2nd Mobile" prop="secondaryMobile">
            <el-input
              placeholder="e.g. +4479123456789"
              v-model="bookingForm.secondaryMobile"
              maxlength="15"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="64">
        <el-col :span="24">
          <el-form-item label="Internal Notes" prop="internalNotes">
            <el-input
              v-model="bookingForm.internalNotes"
              type="textarea"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="64" v-show="isEditing">
        <el-col :span="24">
          <el-form-item label="Customer Notes" prop="customerNotes">
            <el-input :disabled="true"
              v-model="bookingForm.customerNotes"
              type="textarea"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="64" v-if="showBookingChoice">
        <el-col :span="12">
          <el-form-item prop="isConfirmed">
            <el-switch
              v-model="bookingForm.isConfirmed"
              active-text="Confirmed Booking"
              inactive-text="Enquiry/unconfirmed"
            ></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    bookingForm: {
      required: true
    },
    isEditing: false,
    showBookingChoice : false
  },
  data() {
    return {
    }
  },

  methods: {
    resetForm() {
      this.$refs["bookingForm"].resetFields();
    },

    isValidForm() {
      this.$refs["bookingForm"].validate(valid => {
        if (valid) {
          this.formValid = true;
        } else {
          this.formValid = false;
        }
      });

      return this.formValid;
    }
  },
  data() {
    return {
      // position of labels in the display of form, valid values are 'top', 'left', 'right'
      labelPosition: "top",

      // keeping track of the submit button status
      loading: false,

      rules: {
        firstName: [
          {
            required: true,
            message: "First name is required",
            trigger: "change"
          },
          {
            max: 35,
            message: "First Name must be under 35 characters",
            trigger: "change"
          }
        ],
        lastName: [
          {
            required: true,
            message: "Last name is required",
            trigger: "change"
          },
          {
            max: 35,
            message: "Last Name must be under 35 characters",
            trigger: "change"
          }
        ],
        email: [
          {
            required: true,
            message: "Email is required",
            trigger: "change"
          },
          {
            max: 50,
            message: "Email must be less than 50",
            trigger: "change"
          },
          {
            type: "email",
            message: "Please enter correct email address",
            trigger: "change"
          }
        ],
        mobile: [
          {
            required: true,
            message: "Mobile number is required",
            trigger: "change"
          }
        ]
      }
    };
  }
};
</script>

<style lang="scss" scoped></style>
