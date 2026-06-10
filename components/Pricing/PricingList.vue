<template>
  <div>
    <section v-if="mixinCanReadPricingRules(loggedInUser)">
      <el-card class="c74-list-section" v-loading="loading">
        <div slot="header" class="flex flex-row justify-between">
          <div>Pricing Rules</div>
          <div class="flex flex-row space-x-6 items-center">
            <el-select
              v-model="listValue"
              placeholder="Filter rules"
              size="small"
              clearable
              filterable
              v-on:change="handleChangeList"
            >
              <el-option
                v-for="item in listOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              ></el-option>
            </el-select>
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
        </div>
        <el-table
          :data="filteredRecords"
          style="width: 100%"
          :default-sort="{ prop: 'priority', order: 'descending' }"
        >
          <el-table-column
            label="Priority"
            prop="priority"
            sortable
            width="100"
          ></el-table-column>
          <el-table-column label="Used" prop="numUses" sortable width="100">
            <template slot-scope="scope">{{
              scope.row.numUses ? scope.row.numUses : 0
            }}</template>
          </el-table-column>

          <el-table-column label="Name" prop="name"></el-table-column>
          <el-table-column label="Route">
            <template slot-scope="scope">
              <span class="c74-cap-first-letter">
                {{ getPlaceNameById(scope.row.fromPlaceId,scope.row.fromPlaceGroupId) }}
              </span>
              {{ scope.row.bidirectional ? " &lt;=&gt; " : " to " }}
              {{ getPlaceNameById(scope.row.toPlaceId,scope.row.toPlaceGroupId) }}
            </template>
          </el-table-column>
          <el-table-column
            label="Type"
            prop="journeyType"
            width="100"
          ></el-table-column>

          <el-table-column label="Available">
            <template slot-scope="scope">
              {{ mixinFormatFirestoreDate(scope.row.availableDateFrom) }} -
              {{ mixinFormatFirestoreDate(scope.row.availableDateTo) }}
              <br />
              {{ scope.row.availableTimeFrom }} -
              {{ scope.row.availableTimeTo }}
              <br />
              {{
                mixinConvertArrayOfDayKeysToLabel(
                  scope.row.availableDaysOfWeek
                )
              }}
            </template>
          </el-table-column>
          <el-table-column label="For Quotes Between">
            <template slot-scope="scope">
              {{ mixinFormatFirestoreDateAndTime(scope.row.quoteDateTimeFrom) }} -
              {{ mixinFormatFirestoreDateAndTime(scope.row.quoteDateTimeTo) }}
            </template>
          </el-table-column>
          <el-table-column align="right">
            <template slot-scope="scope">
              <el-button
                size="medium"
                @click="handleEdit(scope.$index, scope.row)"
                type="primary"
                icon="el-icon-edit"
                plain
              ></el-button>
              <el-popconfirm
                v-if="mixinCanEditPricingRules(loggedInUser)"
                confirmButtonText="OK"
                cancelButtonText="No, Thanks"
                icon="el-icon-info"
                iconColor="red"
                title="Are you sure want to copy this pricing rule?"
                @confirm="handleCopy(scope.$index, scope.row)"
              >
                <el-button
                  slot="reference"
                  size="medium"
                  type="primary"
                  plain
                  icon="el-icon-document-copy"
                ></el-button>
              </el-popconfirm>
              <el-popconfirm
                v-if="mixinCanEditPricingRules(loggedInUser)"
                confirmButtonText="OK"
                cancelButtonText="No, Thanks"
                icon="el-icon-info"
                iconColor="red"
                title="Are you sure want to archive this pricing rule?"
                @confirm="handleArchive(scope.$index, scope.row)"
              >
                <el-button
                  slot="reference"
                  size="medium"
                  type="danger"
                  plain
                  icon="el-icon-delete"
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
import { fireDb } from "@/plugins/firebase.js";

import { dateUtilsMixin } from "@/statics/utils/dateUtils.js";
import { pricingRulesPermissionsMixin } from "@/statics/auth/pricingRulesPermissions.js";
import { priceUtilsMixin } from "@/statics/pricing/functions.js";

export default {
  name: "PricingList",

  mixins: [dateUtilsMixin, pricingRulesPermissionsMixin, priceUtilsMixin],

  data() {
    return {
      loading: true,
      pricingRulesLoaded: false,
      placesLoaded: false,
      tagsLoaded: false,

      search: "",
      activeRecords: true,
      loading: true,

      listValue: ""
    };
  },

  created() {
    if (this.allPricingRules.length === 0) {
      this.$store.dispatch("pricingRules/initPricingRules").then(() => {
        this.pricingRulesLoaded = true;
      });
    } else {
      this.pricingRulesLoaded = true;
    }

    if (this.allPlaces.length === 0) {
      this.$store.dispatch("places/initPlaces").then(() => {
        this.placesLoaded = true;
      });
    } else {
      this.placesLoaded = true;
    }

    if (this.allTags.length === 0) {
      this.$store.dispatch("tags/initTags").then(() => {
        this.tagsLoaded = true;
      });
    } else {
      this.tagsLoaded = true;
    }
  },

  watch: {
    pricingRulesLoaded: function(value, oldValue) {
      if (value) {
        this.disableLoadingStateIfAllDataLoaded();
      }
    },
    placesLoaded: function(value, oldValue) {
      if (value) {
        this.disableLoadingStateIfAllDataLoaded();
      }
    },
    tagsLoaded: function(value, oldValue) {
      if (value) {
        this.disableLoadingStateIfAllDataLoaded();
      }
    }
  },

  computed: {
    ...mapGetters("pricingRules", {
      allPricingRules: "getAllPricingRules",
      allActivePricingRules: "getAllActivePricingRules",
      allArchivedPricingRules: "getAllArchivedPricingRules"
    }),
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    }),
    ...mapGetters("placeGroups", {
      allPlaceGroups: "getAllPlaceGroups"
    }),    
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    }),
    ...mapGetters("tags", {
      allPricingRuleTags: "getAllPricingRuleTags",
      allTags: "getAllTags"
    }),

    // allows the user to change the records being shown in the data table
    filteredRecords: function() {
      if (this.activeRecords) {
        return this.filterByTags(this.allActivePricingRules);
      } else {
        return this.filterByTags(this.allArchivedPricingRules);
      }
    },

    listOptions: function() {
      if (this.allPricingRuleTags) {
        let prListOptions = [];

        this.allPricingRuleTags.forEach(tagText => {
          let optionMap = {};
          optionMap.value = tagText;
          optionMap.label = tagText;

          prListOptions.push(optionMap);
        });

        return prListOptions.sort((a, b) => (a.value > b.value ? 1 : -1));
      }
    }
  },

  methods: {
    filterByTags(pricingRules) {
      if (this.listValue) {
        return pricingRules.filter(
          pricingRule =>
            pricingRule.tags && pricingRule.tags.indexOf(this.listValue) > -1
        );
      }

      return pricingRules;
    },

    handleChangeList(value) {
      // do nothing
    },

    disableLoadingStateIfAllDataLoaded() {
      if (
        this.pricingRulesLoaded &&
        this.placesLoaded &&
        this.tagsLoaded
      ) {
        this.loading = false;
      }
    },

    getPlaceNameById(placeId, placeGroupId) {
      const place = this.allPlaces.find(place => place.id === placeId);
      if (place) {
        return place.name;
      }
      const placeGroup = this.allPlaceGroups.find(placeGroup => placeGroup.id === placeGroupId);
      if (placeGroup) {
        return placeGroup.name;
      }

      return "Everywhere";
    }, 
    handleEdit(index, row) {
      if (this.mixinCanEditPricingRules(this.loggedInUser)) {
        this.$root.$router.push({
          path: "/pricing/edit",
          query: { priceId: row.id }
        });
      }
    },

    handleCopy(index, row) {
      if (this.mixinCanEditPricingRules(this.loggedInUser)) {
        this.$emit("copy-existing-price", row.id);
      }
    },

    handleArchive(index, row) {
      if (this.mixinCanEditPricingRules(this.loggedInUser)) {
        // make a copy of the vuex object as we shouldn't directly mutate the vuex object
        const archivedPricingRule = {
          ...row
        };
        // change the active status on the copied object
        archivedPricingRule.active = false;

        this.$store
          .dispatch("pricingRules/editPricingRule", archivedPricingRule)
          .then(() => {
            this.$notify.success({
              title: "Success",
              message: "The pricing rule was archived",
              offset: 100
            });
          });
      }
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
      align-items: center;
      margin-right: 14px;

      div:not(:last-child) {
        margin-right: 24px;
      }
    }
  }
}
</style>
