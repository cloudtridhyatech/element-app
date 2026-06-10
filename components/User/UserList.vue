<template>
  <div v-loading="loading">
    <section>
      <UserSearchForm
        v-on:firstname-changed="handleFirstNameChanged"
        v-on:lastname-changed="handleLastNameChanged"
        v-on:user-type-changed="handleUserTypeChanged"
        v-on:active-changed="handleActiveChanged"
        ref="usersearchform"
      />
    </section>
    <section v-if="mixinCanReadUsers(loggedInUser)" class="mt-12">
      <el-card>
        <div slot="header" class="flex flex-row justify-between">
          <div>Users</div>
          <div>
            <i @click="executeUserSearch" class="el-icon-refresh"></i>
          </div>
        </div>

        <el-table
          :data="allActiveUsers"
          style="width: 100%"
          :default-sort="{ prop: 'firstName', order: 'ascending' }"
        >
          <el-table-column label="ID" prop="id"></el-table-column>

          <el-table-column
            label="First Name"
            prop="firstName"
            sortable
          ></el-table-column>

          <el-table-column
            label="Last Name"
            prop="lastName"
            sortable
          ></el-table-column>
          <el-table-column
            label="Active"
          >
            <template slot-scope="scope">
              {{scope.row.active === true ? "Yes": "No"}}
            </template>          
          </el-table-column>          

          <el-table-column label="Permissions">
            <template slot-scope="scope">
              <div v-for="role in scope.row.roles" :key="role">
                {{ getRoleLabelFromKey(role) }}
              </div>
            </template>
          </el-table-column>

          <el-table-column align="right">
            <template slot="header" slot-scope="scope"> </template>
            <template slot-scope="scope">
              <el-button
                v-if="mixinCanEditUsers(loggedInUser)"
                size="medium"
                @click="handleEdit(scope.$index, scope.row)"
                type="primary"
                icon="el-icon-edit"
              ></el-button>
              <el-popconfirm
                v-if="mixinCanArchiveUsers(loggedInUser)"
                confirmButtonText="OK"
                cancelButtonText="No, Thanks"
                icon="el-icon-info"
                iconColor="red"
                title="Are you sure to archive this user?"
                @confirm="handleArchive(scope.$index, scope.row)"
              >
                <el-button
                  slot="reference"
                  size="medium"
                  type="danger"
                  icon="el-icon-document-remove"
                ></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <Pager
          :results="allActiveUsers"
          :current-page="currentPage"
          :current-page-size="currentPageSize"
          :page-sizes="[5, 10, 15, 20]"
          :no-more-results="noMoreResults"
          v-on:handle-previous-click="handlePreviousClick"
          v-on:handle-next-click="handleNextClick"
          v-on:handle-change-results-per-page="handleChangeResultsPerPage"
        />
      </el-card>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb, firebaseFunctions } from "@/plugins/firebase.js";
import UserSearchForm from "@/components/User/UserSearchForm";
import Pager from "@/components/Pager/Pager";

import { userPermissionsMixin } from "@/statics/auth/userPermissions.js";

export default {
  mixins: [userPermissionsMixin],

  components: {
    UserSearchForm,
    Pager
  },

  data() {
    return {
      loading: true,
      search: "",
      allActiveUsers: [],
      roleOptions: [],

      form: {
        firstName: "",
        lastName: "",
        userType: "",
        active: false,
      },

      currentPageSize: 5,
      currentPage: 0,
      noMoreResults: false,
    };
  },
  mounted() {
    this.roleOptions = this.userRoleOptions;
  },
  async created() {
    // this.getAllActiveUsers();
    this.executeUserSearch();

    await this.$store.dispatch("users/getDriverSettings");
  },

  computed: {
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser",
    }),
    ...mapGetters("users", {
      userRoleOptions: "getUserRoleOptions"
    }),    
    ...mapGetters("companies", {
      companyId: "getCompanyId",
    }),
    ...mapGetters("companies", {
      companyKey: "getCompanyKey",
    }),
  },

  methods: {
    /*Deprecated*/
    /*
    async getAllActiveUsers() {
      this.allActiveUsers = [];
      this.resetForm();
      const companyId = this.companyId;

      const ref = fireDb
        .collection("companies")
        .doc(companyId)
        .collection("users");
      let snapshot;
      try {
        snapshot = await ref.get();

        for (const doc of snapshot.docs) {
          let user = doc.data();
          user.id = doc.id;
          this.allActiveUsers.push(user);
        }

        this.loading = false;
      } catch (error) {
        console.error("Unable to pull users from the data store", error);
      }
    },
    */
    handleEdit(index, row) {
      // emit the selected price so we can edit it.
      if (this.mixinCanEditUsers(this.loggedInUser)) {
        this.$emit("load-existing-user", row.id);
        this.$emit("open-form");
      } else {
        console.info("Incorrect permissions");
      }
    },

    handleArchive(index, row) {
      if (this.mixinCanArchiveUsers(this.loggedInUser)) {
        // make a copy of the vuex object as we shouldn't directly mutate the vuex object
        const archivedUser = {
          ...row,
        };
        // change the active status on the copied object
        archivedUser.active = false;

        this.$store.dispatch("users/editUser", archivedUser).then(() => {
          this.$notify.success({
            title: "Success",
            message: "The user was archived",
            offset: 100,
          });
        });
      } else {
        console.info("Incorrect permissions");
      }
    },

    getRoleLabelFromKey(roleKey) {
      const roleFound = this.roleOptions.find(
        (roleOption) => roleOption.key === roleKey
      );
      return roleFound ? roleFound.label : "";
    },

    handleFirstNameChanged(value) {
      this.form.firstName = value;
      this.currentPage = 0;
      this.executeUserSearch();
    },

    handleLastNameChanged(value) {
      this.form.lastName = value;
      this.currentPage = 0;
      this.executeUserSearch();
    },

    handleUserTypeChanged(value) {
      this.form.userType = value;
      this.currentPage = 0;
      this.executeUserSearch();
    },

    handleActiveChanged(value) {
      this.form.active = value;
      this.currentPage = 0;
      this.executeUserSearch();
    },

    executeUserSearch() {
      this.loading = true;
      this.allActiveUsers = [];

      console.log(
        "executeUserSearch",
        this.form.firstName,
        this.form.lastName,
        this.form.userType,
        this.form.active
      );
      const executeFulltextSearch = firebaseFunctions.httpsCallable(
        "users-executeFulltextSearchOfUsers"
      );

      executeFulltextSearch({
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        userType: this.form.userType,
        active: this.form.active,
        companyKey: this.companyKey,
        companyId : this.companyId,
        page: this.currentPage,
        hitsPerPage: this.currentPageSize,
      })
        .then((result) => {
          result.data.forEach((hit) => {
            this.allActiveUsers.push({ ...hit });
          });

          this.loading = false;
        })
        .catch((error) => {
          console.error(
            "Unable to pull users from the fulltext (Algolia) store. ",
            error
          );
        });
    },
    resetForm() {
      this.form.firstName = "";
      this.form.lastName = "";
      this.form.userType = "";
      this.form.active = false;
      if (this.$refs.usersearchform) {
        this.$refs.usersearchform.resetForm(); // reset <UserSearchForm> component input fields
      }
    },

    handlePreviousClick() {
      if (this.currentPage > 0) {
        this.currentPage--;
      }
      this.executeUserSearch();
    },

    handleNextClick() {
      this.currentPage++;
      this.executeUserSearch();
    },

    handleChangeResultsPerPage(currentPageSizeValue) {
      this.currentPageSize = +currentPageSizeValue;
      // go back to page 0
      this.currentPage = 0;
      this.executeUserSearch();
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
