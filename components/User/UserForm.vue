<template>
  <div>
    <PageHeader :breadCrumb="breadCrumb">
      <slot>
        <div class="create-button">
          <el-button
            type="primary"
            @click.prevent="createNewUser"
            icon="el-icon-circle-plus"
            >Create New User</el-button
          >
        </div>
      </slot>
    </PageHeader>

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
            @click.prevent="saveOrUpdate('userForm')"
            :loading="loading"
            icon="el-icon-download"
            size="mini"
            >{{ isEditing ? "Update User" : "Save User" }}</el-button
          >
        </span>
        <h2>{{ isEditing ? "Edit Existing User" : "Create New User" }}</h2>

        <el-form
          ref="userForm"
          :label-position="labelPosition"
          :model="userForm"
          :rules="rules"
          label-width="180px"
          size="medium"
        >
          <el-collapse v-model="activeFormPanels" accordion>
            <el-collapse-item title="Required" name="1">
              <div class="c74-padded-form">
                <UserForm1 :userForm="userForm" :isEditing="isEditing" />
              </div>
            </el-collapse-item>
            <el-collapse-item title="Permissions" name="2">
              <div class="c74-padded-form">
                <UserForm2
                  :userForm="userForm"
                  v-on:update-roles="updateRoles"
                />
              </div>
            </el-collapse-item>
            <el-collapse-item title="User Type" name="3">
              <div class="c74-padded-form">
                <UserForm3 :userForm="userForm" />
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button
            :type="buttonType"
            @click="saveOrUpdate('userForm')"
            :loading="loading"
            icon="el-icon-download"
            >{{ isEditing ? "Update User" : "Save User" }}</el-button
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
import { mapGetters } from "vuex";
import { fireDb } from "@/plugins/firebase.js";
import { fireAuth, firestoreNameSpace } from "@/plugins/firebase.js";

import {
  getCollectionUsers,
  getDocumentReferenceUser
} from "@/statics/user/functions.js";

import firebase from "firebase/app";

import PageHeader from "@/components/Shared/PageHeader";
import UserForm1 from "@/components/User/UserForm1";
import UserForm2 from "@/components/User/UserForm2";
import UserForm3 from "@/components/User/UserForm3";

const driver = "driver";

export default {
  components: {
    UserForm1,
    UserForm2,
    UserForm3,
    PageHeader
  },
  props: {
    existingUser: Object,
    userId: String,
    shouldOpenDialog: Boolean
  },
  data() {
    return {
      breadCrumb: {
        routeName: "Users",
        title: "Users"
      },
      buttonType: "primary",

      editFormVisible: false,
      isCreating: false,
      isEditing: false,

      // keeping track of the submit button status
      loading: false,

      // position of labels in the display of form, valid values are 'top', 'left', 'right'
      labelPosition: "top",

      activeFormPanels: ["1"],

      userForm: this.createEmptyUserObject(),
      previousUserType: "",
      previousUserActiveStatus: false,
      rules: {
        firstName: [
          {
            required: true,
            message: "Please input first name",
            trigger: "blur"
          },
          {
            min: 3,
            max: 50,
            message: "Length should be 3 to 50 characters",
            trigger: "blur"
          }
        ],
        email: [
          {
            required: true,
            message: "Please input email",
            trigger: "blur"
          },
          {
            min: 3,
            max: 50,
            message: "Length should be 3 to 50 characters",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "Please input password",
            trigger: "blur"
          },
          {
            min: 8,
            max: 50,
            message: "Length should be 8 to 50 characters",
            trigger: "blur"
          }
        ]
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

    userId: function(value, oldValue) {},

    existingUser: function(value, oldValue) {
      this.isEditing = true;

      if (this.$refs["userForm"]) this.$refs["userForm"].resetFields();

      this.userForm = {
        ...this.existingUser
      };
      if (this.existingUser) {
        this.previousUserType = this.existingUser.userType;
        this.previousUserActiveStatus = this.existingUser.active;
      }
    }
  },

  methods: {
    // having to jump through hoops because of a bug in element component https://element.eleme.io/#/en-US/component/checkbox
    // it cannot be supplied an array in the form userForm.roles, it must be a top level data element instead so using this as a workaround
    updateRoles(updatedRoles) {
      this.userForm.roles = updatedRoles;
    },
    async getActiveDriverCount() {
      let activeDriverCount = null;

      //search for the number of active drivers
      try {
        let ref = await getCollectionUsers(this.companyId)
          .where("userType", "==", driver)
          .where("active", "==", true);

        let snapshot = await ref.get();
        activeDriverCount = snapshot.docs.length;
      } catch (error) {
        console.error("Unable to pull active drivers from the data store");
        activeDriverCount = 0;
      }
      return activeDriverCount;
    },
    async saveOrUpdate(formName) {
      let driverLimitReached = false;

      let maxActiveDrivers = this.driverSettings.maxActiveDrivers;
      let activeDriverCount = await this.getActiveDriverCount();

      let isMaxExceeded = activeDriverCount + 1 > maxActiveDrivers;

      if (this.isCreating === true && this.isEditing === false) {
        let isUserDriver = this.userForm.userType === driver;
        let isUserActive = this.userForm.active === true;

        if (isUserDriver && isUserActive && isMaxExceeded) {
          driverLimitReached = true;
        }
      } else if (this.isCreating === false && this.isEditing === true) {
        //for edits, only check if the users type has been changed and/or a change in active status
        let isUserNowActive =
          this.userForm.active === true &&
          this.previousUserActiveStatus === false;
        let isUserNowDriver =
          this.userForm.userType === driver && this.previousUserType !== driver;
        let isUserNowActiveStillDriver =
          isUserNowActive &&
          this.userForm.userType === driver &&
          this.previousUserType === driver;
        let isUserNowDriverStillActive =
          isUserNowDriver &&
          this.userForm.active === true &&
          this.previousUserActiveStatus === true;

        if (
          ((isUserNowActive && isUserNowDriver) ||
            isUserNowActiveStillDriver ||
            isUserNowDriverStillActive) &&
          isMaxExceeded
        ) {
          driverLimitReached = true;
        }
      }

      if (driverLimitReached === true) {
        this.$notify.warning({
          title: "Max active driver allowed limit reached",
          message: `Your account is limited to ${maxActiveDrivers} drivers.  Please contact us to upgrade your account so that you can add more drivers.`,
          offset: 100
        });
      } else {
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.loading = true;

            if (this.isEditing) {
              this.updateUser();
            } else {
              this.asyncCreateNewAuthInFirebase();
            }
          } else {
            return false;
          }
        });
      }
    },

    updateUser() {
      const editedUser = {
        id: this.userId,
        active: true,
        ...this.userForm
      };

      console.log("editedUser", editedUser);

      this.$store
        .dispatch("users/editUser", editedUser)
        .then(() => {
          this.$message({
            message: `Updated user ${editedUser.firstName} ${editedUser.lastName}`,
            type: "success",
            duration: 5000
          });

          this.activeFormPanels = ["1"];
          this.resetForm();
          this.$emit("close-form");
        })
        .catch(error => {
          this.$message({
            message: `Failed to update user: ${error.message}`,
            type: "error",
            duration: 5000
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getAuthAppInstance() {
      // pick up the config from nuxt.config.js
      let authApp;
      // pick up the config from nuxt.config.js
      if (location.hostname === process.env.devUrl) {
        // pick up the config from nuxt.config.js
        authApp = firebase.initializeApp(
          process.env.firebaseConfigDevelopment,
          "signupInstance"
        );
        console.log("firebase development loading");
      } else if (location.hostname === process.env.stagingUrl) {
        authApp = firebase.initializeApp(
          process.env.firebaseConfigStaging,
          "signupInstance"
        );
        console.log("firebase staging loading");
      } else if (location.hostname === process.env.productionUrl) {
        authApp = firebase.initializeApp(
          process.env.firebaseConfigProduction,
          "signupInstance"
        );
        console.log("firebase production loading");
      } else if (location.hostname === process.env.localUrl) {
        authApp = firebase.initializeApp(
          process.env.firebaseConfigDevelopment,
          "signupInstance"
        );
      }

      // If the application is running locally, we want to use the local emulators
      if (location.hostname === "localhost") {
        // Instrument your app to talk to the Authentication emulator
        authApp.auth().useEmulator("http://localhost:9099/");
      }

      return authApp;
    },

    /**
     * https://stackoverflow.com/questions/51737462/call-method-createuserwithemailandpassword-without-doing-signin
     */
    async asyncCreateNewAuthInFirebase() {
      let userCredential;

      const authApp = this.getAuthAppInstance();
      var detachedAuth = authApp.auth();

      // create a new user and use the auth uid from the firebase auth record
      const user = {
        active: true,
        ...this.userForm
      };

      try {
        // create the new instance in firebase auth using the detached auth instance to avoid
        // current user being logged out and the new user being logged in
        userCredential = await detachedAuth.createUserWithEmailAndPassword(
          user.email,
          user.password
        );

        console.log("userCredential.uid", userCredential.user.uid);
        const created = firestoreNameSpace.FieldValue.serverTimestamp();
        user.created = created;
        user.lastModified = created;

        // we don't want to embed the uid in the newly created user doc as it's defined in the document id
        await getDocumentReferenceUser(
          this.companyId,
          userCredential.user.uid
        ).set(user);

        this.$message({
          message: `Successfully created user ${user.firstName} ${user.lastName}`,
          type: "success",
          duration: 5000
        });

        this.resetForm();
        this.activeFormPanels = ["1"];
        this.$emit("close-form");
        this.$emit("refresh-user-list");
      } catch (error) {
        this.$message({
          message: `Failed to create user: ${error.message}`,
          type: "error",
          duration: 5000
        });
      } finally {
        // Once the user is signed up, we can safely delete the app instance.
        authApp.delete();
        this.loading = false;
      }
    },

    createNewUser() {
      this.activeFormPanels = ["1"];
      this.isCreating = true;
      this.isEditing = false;
      this.userForm = this.createEmptyUserObject();
      this.$emit("open-form");
    },

    resetForm() {
      this.isEditing = false;
      this.isCreating = false;
      this.$refs["userForm"].resetFields();
    },

    handleDialogClosed() {
      this.activeFormPanels = ["1"];
      this.$emit("close-form");
    },

    handleCancel() {
      this.resetForm();
      this.$emit("refresh-user-list");
      this.$emit("close-form");
    },
    createEmptyUserObject() {
      return {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        active: true,
        roles: [],
        userType: ""
      };
    }
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("users", {
      driverSettings: "getDriverSettings"
    })
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
