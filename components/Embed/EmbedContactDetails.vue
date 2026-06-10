<template>
  <div>
    <el-form ref="form3" :model="form" :rules="rules" label-position="top">
      <div class="grid grid-cols-12 gap-x-4 lg:gap-x-12">
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="First Name" prop="booking.firstName">
            <el-input
              placeholder="Enter first name"
              v-model="form.booking.firstName"
            ></el-input>
          </el-form-item>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="Last Name" prop="booking.lastName">
            <el-input
              placeholder="Enter last name"
              v-model="form.booking.lastName"
            ></el-input>
          </el-form-item>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="Email" prop="booking.email">
            <el-input
              placeholder="Enter email"
              v-model="form.booking.email"
            ></el-input>
          </el-form-item>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="Mobile" prop="booking.mobile">
            <el-input
              placeholder="e.g. +4479123456789"
              v-model="form.booking.mobile"
              maxlength="15"
            ></el-input>
          </el-form-item>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item
            label="Alternative Mobile"
            prop="booking.secondaryMobile"
          >
            <el-input
              placeholder="e.g. +4479123456789"
              v-model="form.booking.secondaryMobile"
              maxlength="15"
            ></el-input>
          </el-form-item>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    companyId: {
      type: String,
      required: true
    },
    form: {
      type: Object,
      required: true,
      default: () => {
        return { booking: {} };
      }
    }
  },
  data() {
    return {
      formValid: false,
      rules: {
        "booking.firstName": [
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
        "booking.lastName": [
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
        "booking.email": [
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
        "booking.mobile": [
          {
            required: true,
            message: "Mobile number is required",
            trigger: "change"
          }
        ]
      }
    };
  },
  created() {},
  methods: {
    isValidForm() {
      this.$refs["form3"].validate(valid => {
        if (valid) {
          this.formValid = true;
        } else {
          this.formValid = false;
        }
      });
      return this.formValid;
    }
  }
};
</script>
