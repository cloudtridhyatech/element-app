<template>
  <div class="flex flex-row">
    <!-- hidden on small screen -->
    <div class="hidden lg:flex w-1/3 bg-blue-500">
      <div class="p-12">
        <div class="text-white font-extrabold text-2xl">
          element transfer
        </div>
        <div class="p-8">
          <div class="mt-32 text-white font-extrabold text-4xl">
            Airport Transfer Scheduling Made Easy!
          </div>
          <div class="mt-6 text-white text-xl">
            The gold standard in airport transfer booking systems.
          </div>
        </div>
      </div>
    </div>
    <!-- always visible -->
    <div class="w-full lg:w-2/3 bg-gray-100">
      <div class="flex items-center justify-center  h-screen">
        <div class="bg-gray-100 m-4 w-full md:w-3/4 lg:w-1/3">
          <div class="md:hidden flex flex-col ">
            <h1 class="md:hidden font-extrabold text-4xl">
              Element Transfer Password Reset
            </h1>
            <h2 class="mt-4 ">
              If you are not a driver, please use a desktop computer.
            </h2>
          </div>

          <div class="hidden md:flex flex flex-col ">
            <h1 class="font-extrabold text-4xl">
              Element Transfer Password Reset
            </h1>

            <h2 class="mt-4 ">Use the form below to start a password reset</h2>
          </div>

          <el-form
            ref="resetForm"
            :label-position="labelPosition"
            :model="resetForm"
            :rules="rules"
            label-width="120px"
            size="medium"
            class="mt-6"
          >
            <el-form-item label="E-mail" prop="email">
              <el-input
                placeholder="Type your e-mail"
                v-model="resetForm.email"
              ></el-input>
            </el-form-item>
            <el-button
              @click="onSubmit"
              class="w-full"
              type="primary"
              :disabled="false"
              :loading="loading"
              >Send me a password reset link</el-button
            >
          </el-form>

          <div class="mt-4 ">
            <nuxt-link
              no-prefetch
              to="/auth"
              class="text-base hover:text-gray-900"
              >Cancel and return to login</nuxt-link
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb } from "@/plugins/firebase.js";
import { fireAuth } from "@/plugins/firebase.js";

export default {
  layout: "auth",

  data() {
    return {
      // position of labels in the display of form, valid values are 'top', 'left', 'right'
      labelPosition: "top",
      loading: false,
      resetForm: {
        email: ""
      },
      rules: {
        email: [
          { required: true, message: "Email is required", trigger: "blur" }
        ]
      }
    };
  },

  computed: {
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    })
  },

  methods: {
    async onSubmit() {
      let valid = await this.$refs.resetForm.validate();
      if (!valid) {
        return;
      }
      this.loading = true;

      fireAuth
        .sendPasswordResetEmail(this.resetForm.email)
        .then(data => {
          this.$message({
            message:
              "you will shortly receive a password reset email at that email address " +
              this.resetForm.email,
            type: "success"
          });
        })
        .catch(error => {
          this.$message({
            message: error.code + ": " + error.message,
            type: "error"
          });
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped></style>
