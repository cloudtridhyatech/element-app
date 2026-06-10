<template>
  <div>
    <el-form ref="form2" :model="form" :rules="rules" label-position="top">
      <div class="text-lg font-semibold">
        Details for {{ getFormattedDate() }} (Transfer #{{ index + 1 }})
      </div>
      <div>
        {{ getPlaceName(form.transfer.fromPlaceId) }} to
        {{ getPlaceName(form.transfer.toPlaceId) }}, Passengers:
        {{ form.journey.numPassengers }}, {{ getArriveOrDepart() }}
        {{ getFormattedDate() }}
      </div>
      <div class="mt-4 grid grid-cols-12 gap-x-4 lg:gap-x-12">
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="Flight Number">
            <el-input
              v-model="form.transfer.flightNumber"
              placeholder="Enter flight number"
            ></el-input>
          </el-form-item>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item :label="accommodationLabel" ref="accommSearchFormItem">
            <el-select
              v-model="form.transfer.accommodationId"
              clearable
              filterable
              remote
              reserve-keyword
              placeholder="Search accommodations"
              :remote-method="searchAccommodation"
              :loading="accommodationLoading"
              @change="handleAccommodationChange"
            >
              <el-option
                v-for="item in accommodationSearchResults"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="Address">
            <el-input
              v-model="form.transfer.address"
              placeholder="As much info as possible please (Accom Name & Address & website/link etc)"
              type="textarea"
            ></el-input>
          </el-form-item>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="Baby Seats" prop="transfer.numBabySeats">
            <el-input-number
              v-model="form.transfer.numBabySeats"
              :min="0"
              :max="30"
            ></el-input-number>
          </el-form-item>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="Child Seats" prop="transfer.numChildSeats">
            <el-input-number
              v-model="form.transfer.numChildSeats"
              :min="0"
              :max="30"
            ></el-input-number>
          </el-form-item>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="Booster Seats" prop="transfer.numBoosterSeats">
            <el-input-number
              v-model="form.transfer.numBoosterSeats"
              :min="0"
              :max="30"
            ></el-input-number>
          </el-form-item>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="Num Ski Bags" prop="transfer.numWinterEquipment">
            <el-input-number
              v-model="form.transfer.numWinterEquipment"
              :min="0"
              :max="30"
            ></el-input-number>
          </el-form-item>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="Num Bikes" prop="transfer.numSummerEquipment">
            <el-input-number
              v-model="form.transfer.numSummerEquipment"
              :min="0"
              :max="30"
            ></el-input-number>
          </el-form-item>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import { getFormattedDate } from "@/statics/embed/functions.js";
import ElementUi from 'element-ui';

// Workarround foran issue with filters not working on mobile
// https://github.com/ElemeFE/element/issues/11397
ElementUi.Select.computed.readonly = function () {
    // trade-off for IE input readonly problem: https://github.com/ElemeFE/element/issues/10403
    const isIE = !this.$isServer && !Number.isNaN(Number(document.documentMode));

    console.log('ElementUi.Select.computed.readonly');

    return !(this.filterable || this.multiple || !isIE) && !this.visible;
};

import {
  queryAccommodation,
  mergeAccommodationLists
} from "@/statics/accommodation/functions.js";
export default {
  ElementUi,
  components: {},
  props: {
    companyId: {
      type: String,
      required: true
    },
    companyKey: {
      type: String,
      required: true
    },
    form: {
      type: Object,
      required: true,
      default: () => {
        return { journey: {}, transfer: {} };
      }
    },
    index: {
      type: Number,
      required: true
    },
    allActivePlaces: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      formValid: false,
      rules: {
        "transfer.numBabySeats": [
          {
            required: true,
            trigger: "change",
            message: "The number of baby seats is required"
          }
        ],
        "transfer.numChildSeats": [
          {
            required: true,
            trigger: "change",
            message: "The number of child seats is required"
          }
        ],
        "transfer.numBoosterSeats": [
          {
            required: true,
            trigger: "change",
            message: "The number of booster seats is required"
          }
        ],
        "transfer.numWinterEquipment": [
          {
            required: true,
            trigger: "change",
            message: "The number of ski bags is required"
          }
        ],
        "transfer.numSummerEquipment": [
          {
            required: true,
            trigger: "change",
            message: "The number of bikes is required"
          }
        ]
      },
      accommodationLoading:false,
      accommodationSearchResults: []
    };
  },
  computed: {
    accommodationLabel: function() {
      return this.getDropOffOrPickUp() + " location";
    },
    isFlightArrival: function() {
      if (
        this.form.transfer.flightArrivesDateTime &&
        this.form.transfer.flightArrivesDateTime !== ""
      ) {
        return true;
      }
      return false;
    },
    isFlightDeparture: function() {
      if (
        this.form.transfer.flightDepartsDateTime &&
        this.form.transfer.flightDepartsDateTime !== ""
      ) {
        return true;
      }
      return false;
    },    
  },
  created() {},
  mounted() {
    this.resetData();
  },
  methods: {
    isValidForm() {
      this.$refs["form2"].validate(valid => {
        if (valid) {
          this.formValid = true;
        } else {
          this.formValid = false;
        }
      });
      return this.formValid;
    },
    getPlaceName(placeId) {
      let placeName = "";

      if (placeId) {
        const foundPlace = this.allActivePlaces.find(
          place => place.id === placeId
        );
        if (foundPlace) {
          placeName = foundPlace.name;
        }
      }
      return placeName;
    },
    getFormattedDate() {
      return getFormattedDate(this.form.transfer);
    },
    getArriveOrDepart() {
      if (this.isFlightArrival === true) {
        return "Flight arrives";
      } else if (this.isFlightDeparture === true) {
        return "Flight departs";
      }
      return "";
    },
    getDropOffOrPickUp() {
      if (this.isFlightArrival === true) {
        return "Drop-off";
      } else if (this.isFlightDeparture === true) {
        return "Pickup";
      }
      return "";
    },
    async searchAccommodation(query) {
      this.accommodationSearchResults = [];

      try {
        if(query !== '') {
          this.accommodationLoading = true;
          let results = await queryAccommodation(query, this.companyId);
          this.accommodationSearchResults = mergeAccommodationLists(
            results,
            this.accommodationSearchResults
          );
        }
      } catch (error) {
        console.error("searchAccommodation error", query, error);
        this.accommodationSearchResults = [];
      } finally {
          this.accommodationLoading = false;        
      }
    },
    handleAccommodationChange(value) {
      let accommodation = {
        value: "",
        label: ""
      };

      let sr = this.accommodationSearchResults;

      if (value) {
        let selection = sr[sr.findIndex(item => item.value === value)];
        accommodation = {
          value: selection.value,
          label: selection.label
        };
      }

      this.form.transfer.accommodation = accommodation;

      // clear the previous search results if the select was cleared
      if (!value) {
        this.accommodationSearchResults = [];
      }
    },
    resetData() {
      let transferObject = this.form.transfer;

      if (transferObject.accommodation) {
        const duplicate = Object.assign({}, transferObject.accommodation);
        this.accommodationSearchResults.push(duplicate);
      }
    }
  }
};
</script>
