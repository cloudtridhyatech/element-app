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
              Element Transfer Driver Login
            </h1>
            <h2 class="mt-4 ">
              If you are not a driver, please use a desktop computer to login.
            </h2>
          </div>

          <div class="hidden md:flex flex flex-col ">
            <h1 class="font-extrabold text-4xl">
              Welcome Back!
            </h1>

            <h2 class="mt-4 ">Let's get started!</h2>
          </div>

          <el-form
            ref="authForm"
            :label-position="labelPosition"
            :model="authForm"
            :rules="rules"
            label-width="120px"
            size="medium"
            class="mt-12 text-lg"
          >
            <el-form-item label="Email" prop="email">
              <el-input
                placeholder="Enter email"
                v-model="authForm.email"
              ></el-input>
            </el-form-item>
            <el-form-item label="Password" prop="password">
              <el-input
                placeholder="Enter password"
                v-model="authForm.password"
                type="password"
              ></el-input>
            </el-form-item>
            <el-form-item label="Company Key" prop="companyKey">
              <el-input
                placeholder="Enter company reference"
                v-model="authForm.companyKey"
              ></el-input>
            </el-form-item>
            <el-button
              @click="onSubmit"
              type="primary"
              :disabled="false"
              :loading="loading"
              class="w-full"
              >Sign in</el-button
            >
          </el-form>

          <div class="mt-4 ">
            <nuxt-link
              no-prefetch
              to="/auth/resetPassword"
              class="text-base hover:text-gray-900"
              >Forgot Password?</nuxt-link
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

export default {
  layout: "auth",
  name: "login",

  data() {
    return {
      // position of labels in the display of form, valid values are 'top', 'left', 'right'
      labelPosition: "top",

      loading: false,

      authForm: {
        email: "",
        password: "",
        companyKey: ""
      },

      rules: {
        email: [
          {
            required: true,
            message: "Email is required",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "Password is required", trigger: "blur" },
          {
            min: 8,
            message: "Password length should be at least 8 characters",
            trigger: "blur"
          }
        ],
        companyKey: [
          { required: true, message: "Company is required", trigger: "blur" }
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
      let valid = await this.$refs.authForm.validate();
      if (!valid) {
        return;
      }
      this.loading = true;

      const authData = {
        email: this.authForm.email,
        password: this.authForm.password,
        companyKey: this.authForm.companyKey
      };

      this.$store
        .dispatch("auth/signInWithEmailAndPassword", authData)
        .then(data => {
          this.checkUserBelongsToCompanyAndContinueLogin(authData, data.user);
        })
        .catch(error => {
          this.reportAuthError(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    checkUserBelongsToCompanyAndContinueLogin(authData, user) {
      // Create a reference to the companies collection
      const companiesRef = fireDb.collection("companies");

      // Create a query against the collection.
      const query = companiesRef.where("companyKey", "==", authData.companyKey);

      query
        .get()
        .then(querySnapshot => {
          if (querySnapshot.empty) {
            this.$message({
              duration: 5000,
              message: `The company could not be not found using supplied company name: ${authData.companyKey}. Ensure you are correctly using lowercase/uppercase letters.`,
              type: "error"
            });
            this.logoutAndRedirectToAuth();
          } else {
            if (querySnapshot.docs.length > 1) {
              // we have a situation where two companies are using the same key !!!
              this.$message({
                message:
                  "non-unique-company-name: The company name supplied is not unique to you, pleae contact support",
                type: "error"
              });
              this.logoutAndRedirectToAuth();
            } else {
              const companyId = querySnapshot.docs[0].id;
              const company = querySnapshot.docs[0].data();

              // ok, we have a matching company, but does the user logging in BELONG to the supplied company
              // Create a reference to the users collection within the companies parent collection
              const userRef = fireDb
                .collection("companies")
                .doc(companyId)
                .collection("users")
                .doc(user.uid);

              console.log("Looking for user with uid: ", company, user.uid);

              userRef
                .get()
                .then(doc => {
                  if (!doc.exists) {
                    this.$message({
                      message:
                        "You have a valid login but are not a member of the company: " +
                        authData.companyKey,
                      type: "error"
                    });
                    this.logoutAndRedirectToAuth();
                  } else {
                    const userId = doc.id;
                    const user = doc.data();

                    // User has been found and DOES belong to supplied company ...
                    this.$store.dispatch("companies/setCompanyId", companyId);
                    this.$store.dispatch("companies/setCompany", company);
                    this.$store.dispatch("users/setLoggedInUserId", userId);
                    this.$store.dispatch("users/setLoggedInUser", user);

                    if (user.userType === "driver") {
                      this.$router.push("/driver");
                    } else {
                      this.$router.push("/");
                    }
                  }
                })
                .catch(error => {
                  this.$message({
                    message:
                      "You have a valid login but are not a member of the company: " +
                      authData.companyKey,
                    type: "error"
                  });
                });
            }
          }
        })
        .catch(function(error) {
          console.log("Error getting documents: ", error);
        });
    },

    logoutAndRedirectToAuth() {
      // immediately log the user out
      console.log("Undoing login ... ");
      this.$store.dispatch("auth/signOut");
      this.$router.push("/auth");
    },

    reportAuthError(error) {
      console.log("error", error);
      if (error) {
        console.log(error.message);
        if (error.code === "auth/invalid-email") {
          this.$message({
            message: "Oops, the email appears to be invalid.",
            type: "error"
          });
        } else if (error.code === "auth/user-not-found") {
          this.$message({
            message:
              "Oops, there is no user record corresponding to the supplied email address.",
            type: "error"
          });
        } else if (error.code === "auth/wrong-password") {
          this.$message({
            message:
              "Oops, we found the your account but the password appears to be invalid.",
            type: "error"
          });
        } else {
          this.$message({
            message: error.code + ": " + error.message,
            type: "error"
          });
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
