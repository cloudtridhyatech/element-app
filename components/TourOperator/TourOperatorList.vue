<template>
  <div v-loading="loading">

    <section v-if="mixinCanReadTourOperators(loggedInUser)">
      <el-card class="c74-list-section">
        <div slot="header" class="clearfix c74-card-header">
          <div>Tour Operators</div>
          <div class="c74-list-controls">
            <div class="c74-active-switcher">
              <el-switch
                style="display: block"
                v-model="activeRecords"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="Active"
                inactive-text="Archived"
              ></el-switch>
            </div>
            <div @click="handleRefresh">
              <i class="el-icon-refresh"></i>
            </div>
          </div>
        </div>

        <el-table
          :data="
            activeOrArchivedRecords.filter(
              data =>
                !search ||
                data.vehicleName.toLowerCase().includes(search.toLowerCase())
            )
          "
          style="width: 100%"
          :default-sort="{ prop: 'name', order: 'ascending' }"
        >
          <el-table-column label="ID" prop="id"></el-table-column>
          <el-table-column
            label="Tour Operator Name"
            prop="name"
            sortable
          ></el-table-column>

          <el-table-column align="right">
            <template slot="header" slot-scope="scope">
              <el-input
                v-model="search"
                size="mini"
                placeholder="Type to search"
              />
            </template>
            <template slot-scope="scope">
              <el-button
                v-if="mixinCanEditTourOperators(loggedInUser)"
                size="medium"
                @click="handleEdit(scope.$index, scope.row)"
                type="primary"
                icon="el-icon-edit"
              ></el-button>
              <el-popconfirm
                v-if="mixinCanArchiveTourOperators(loggedInUser)"
                confirmButtonText="OK"
                cancelButtonText="No, Thanks"
                icon="el-icon-info"
                iconColor="red"
                title="Are you sure you want to archive this tour operator?"
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
      </el-card>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import { tourOperatorPermissionsMixin } from "@/statics/auth/tourOperatorPermissions.js";

export default {
  mixins: [tourOperatorPermissionsMixin],

  data() {
    return {
      search: "",
      activeRecords: true,
      loading: true
    };
  },
  created() {
    this.initTourOperators();
  },
  computed: {
    ...mapGetters("tourOperators", {
      allActiveTourOperators: "getAllActiveTourOperators",
      allArchivedTourOperators: "getAllArchivedTourOperators"
    }),

    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    }),

    // allows the user to change the records being shown in the data table
    activeOrArchivedRecords: function() {
      if (this.activeRecords) {
        return this.allActiveTourOperators;
      } else {
        return this.allArchivedTourOperators;
      }
    }
  },

  methods: {
    handleEdit(index, row) {
      if (this.mixinCanEditTourOperators(this.loggedInUser)) {
        this.$emit("load-existing-tour-operator", row.id);
        this.$emit("open-form");
      }
    },
    handleArchive(index, row) {
      if (this.mixinCanArchiveTourOperators(this.loggedInUser)) {
        // make a copy of the vuex object as we shouldn't directly mutate the vuex object
        const archivedTourOperator = {
          ...row
        };
        // change the active status on the copied object
        archivedTourOperator.active = false;

        this.$store
          .dispatch("tourOperators/editTourOperator", archivedTourOperator)
          .then(() => {
            this.$notify.success({
              title: "Success",
              message: "The tour operator was archived",
              offset: 100
            });
          });
      }
    },
    initTourOperators() {
      this.$store.dispatch("tourOperators/initTourOperators").then(() => {
        this.loading = false;
      });
    }, 
    handleRefresh() {
      this.loading = true;      
      this.initTourOperators();
    }
  }
};
</script>

<style lang="scss" scoped>
.c74-list-section {
  margin: 48px 0px;

  .c74-card-header {
    display: flex;
    justify-content: space-between;

    .c74-list-controls {
      display: flex;
      margin-right: 14px;

      div:not(:last-child) {
        margin-right: 24px;
      }
    }
  }
}
</style>
