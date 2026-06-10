<template>
  <div v-loading="loading">
    <section v-if="mixinCanReadVehicles(loggedInUser)">
      <el-card class="c74-list-section">
        <div slot="header" class="clearfix c74-card-header">
          <div>Vehicles</div>
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
          </div>
          <div @click="handleRefresh">
            <i class="el-icon-refresh"></i>
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
            label="Vehicle Name"
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
                v-if="mixinCanEditVehicles(loggedInUser)"
                size="medium"
                @click="handleEdit(scope.$index, scope.row)"
                type="primary"
                icon="el-icon-edit"
              ></el-button>
              <el-popconfirm
                v-if="mixinCanArchiveVehicles(loggedInUser)"
                confirmButtonText="OK"
                cancelButtonText="No, Thanks"
                icon="el-icon-info"
                iconColor="red"
                title="Are you sure to archive this vehicle?"
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

import { vehiclePermissionsMixin } from "@/statics/auth/vehiclePermissions.js";

export default {
  mixins: [vehiclePermissionsMixin],

  data() {
    return {
      search: "",
      activeRecords: true,
      loading: true
    };
  },

  created() {
    if (this.allVehicles.length === 0) {
      this.initVehicles();
    } else {
      this.loading = false;
    }
  },

  computed: {
    ...mapGetters("vehicles", {
      allVehicles: "getAllVehicles",
      allActiveVehicles: "getAllActiveVehicles",
      allArchivedVehicles: "getAllArchivedVehicles"
    }),

    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    }),

    // allows the user to change the records being shown in the data table
    activeOrArchivedRecords: function() {
      if (this.activeRecords) {
        return this.allActiveVehicles;
      } else {
        return this.allArchivedVehicles;
      }
    }
  },

  methods: {
    handleEdit(index, row) {
      if (this.mixinCanEditVehicles(this.loggedInUser)) {
        this.$emit("load-existing-vehicle", row.id);
        this.$emit("open-form");
      }
    },
    handleArchive(index, row) {
      if (this.mixinCanArchiveVehicles(this.loggedInUser)) {
        // make a copy of the vuex object as we shouldn't directly mutate the vuex object
        const archivedVehicle = {
          ...row
        };
        // change the active status on the copied object
        archivedVehicle.active = false;

        this.$store
          .dispatch("vehicles/editVehicle", archivedVehicle)
          .then(() => {
            this.$notify.success({
              title: "Success",
              message: "The vehicle was archived",
              offset: 100
            });
          });
      }
    },
    initVehicles() {
      this.$store.dispatch("vehicles/initVehicles").then(() => {
        this.loading = false;
      });
    }, 
    handleRefresh() {
      this.loading = true;      
      this.initVehicles();
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
