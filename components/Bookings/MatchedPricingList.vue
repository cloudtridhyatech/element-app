<template>
  <div>
    <div v-if="mixinCanReadPricingRules(loggedInUser)" class=" overflow-auto">
      <table
        class="min-w-full divide-y divide-gray-200 mb-6"
        v-if="matchedPricingRules.length > 0"
        v-loading="loading"
      >
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Name &amp; Route
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Availability
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Between
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Price
            </th>

            <th scope="col" class="relative px-6 py-3">
              <div @click="handleRequestRefresh" class="flex justify-end">
                <i class="el-icon-refresh"></i>
              </div>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(mpr,counter) in matchedPricingRules" class="hover:bg-gray-100" v-bind:key="counter">
            <td class="px-6 py-4 whitespace-no-wrap">
              <div class="flex items-center">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ mpr.name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ getPlaceNameById(mpr.fromPlaceId,mpr.fromPlaceGroupId) }}
                    {{ mpr.bidirectional ? "&lt;&equals;&gt;" : "to" }}
                    {{ getPlaceNameById(mpr.toPlaceId,mpr.fromPlaceGroupId) }}
                  </div>
                  <div class="text-sm text-gray-500"></div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-no-wrap">
              <div class="text-sm font-medium text-gray-900 ">
                {{ mixinFormatFirestoreDate(mpr.availableDateFrom) }} -
                {{ mixinFormatFirestoreDate(mpr.availableDateTo) }}
              </div>
              <div class="text-sm text-gray-500">
                {{ mpr.availableTimeFrom }} -
                {{ mpr.availableTimeTo }}
              </div>
              <div class="text-sm text-gray-500">
                {{
                  mixinConvertArrayOfDayKeysToLabel(mpr.availableDaysOfWeek)
                }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-no-wrap text-sm text-gray-500 ">
              {{ mixinFormatFirestoreDateAndTime(mpr.quoteDateTimeFrom) }} -
              {{ mixinFormatFirestoreDateAndTime(mpr.quoteDateTimeTo) }}
            </td>
            <td class="px-6 py-4 text-sm whitespace-no-wrap">
              <div class="font-medium text-gray-900">
                Pax: {{ numPassengers }}
              </div>
              <div v-if="mpr.pricingByGroupOrPerson === 'Per Person'">
                <div
                  v-if="mpr.pricesArray.length > numPassengers - 1"
                  class="text-gray-500"
                >
                  {{ mpr.pricesArray[numPassengers - 1].cumulativePrice }}
                </div>
                <div v-else>
                  N/A
                </div>
              </div>
              <div v-else>{{ mpr.price }}</div>
            </td>
            <td class="px-6 py-4 whitespace-no-wrap">
              <el-button
                type="primary"
                icon="el-icon-s-ticket"
                plain
                size="mini"
                @click="handleUseThisPricingRule(mpr)"
                >Use</el-button
              >
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="mb-6">
        <el-alert
          title="No matching pricing rules found."
          type="warning"
          :closable="false"
        >
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb } from "@/plugins/firebase.js";

import { dateUtilsMixin } from "@/statics/utils/dateUtils.js";
import { priceUtilsMixin } from "@/statics/pricing/functions.js";
import { pricingRulesPermissionsMixin } from "@/statics/auth/pricingRulesPermissions.js";

export default {
  name: "MatchedPricingList",

  mixins: [dateUtilsMixin, pricingRulesPermissionsMixin, priceUtilsMixin],

  props: {
    matchedPricingRules: {
      required: true,
      type: Array
    },
    numPassengers: {
      required: true,
      type: Number
    },
    allPlaces: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      loading: false
    };
  },

  created() {},

  computed: {
    ...mapGetters("placeGroups", {
      allPlaceGroups: "getAllPlaceGroups"
    }),       
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    })
  },

  methods: {
    handleRequestRefresh() {
      this.loading = true;
      setTimeout(() => {
        this.$emit("refresh-matched-pricing-rules");

        this.loading = false;
      }, 1000);
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
        this.$emit("load-existing-price", row.id);
        this.$emit("open-form");
      }
    },

    handleUseThisPricingRule(mpr) {
      console.log(`handleUseThisPricingRule ${mpr.id}`);
      this.$emit("use-pricing-rule", mpr);
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
