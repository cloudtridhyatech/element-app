<template>
  <div>
    <el-row :gutter="20">
      <el-form
        ref="journeyForm"
        :model="journeyForm"
        :rules="rules"
        :label-position="labelPosition"
        :disabled="journeyForm.isSplit === true"
      >
        <el-col :span="24">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Transfer type" prop="transferObject.journeyType">
                <el-select
                  v-model="journeyForm.transferObject.journeyType"
                  placeholder="select private/shared"
                  class="c74-block-select"
                >
                  <el-option label="Private" value="private"></el-option>
                  <el-option label="Shared" value="shared"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Num Passengers" prop="journey.numPassengers">
                <el-input-number
                  v-model="journeyForm.journey.numPassengers"
                  :min="1"
                  :max="30"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="From" prop="transferObject.fromPlaceId">
                <el-select
                  v-model="journeyForm.transferObject.fromPlaceId"
                  placeholder="select"
                  filterable
                  clearable
                  default-first-option
                  @change="
                    handleCheckRouteIsViable(),
                      handleChangeFormInputsIfFromTransitPoint()
                  "
                  class="c74-block-select"
                >
                  <el-option
                    v-for="place in getPlacesList(journeyForm.transferObject.fromPlaceId)"
                    :key="place.id"
                    :label="place.name"
                    :value="place.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="To" prop="transferObject.toPlaceId">
                <el-select
                  v-model="journeyForm.transferObject.toPlaceId"
                  placeholder="select"
                  filterable
                  clearable
                  default-first-option
                  @change="handleCheckRouteIsViable"
                  class="c74-block-select"
                >
                  <el-option
                    v-for="place in getPlacesList(journeyForm.transferObject.toPlaceId)"
                    :key="place.id"
                    :label="place.name"
                    :value="place.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="isflightArrival === true">
            <el-col :span="12">
              <el-form-item label="Flying From" prop="transferObject.flyingFrom">
                <el-input
                  placeholder="Enter flying from"
                  v-model="journeyForm.transferObject.flyingFrom"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Flight Number" prop="transferObject.flightNumber">
                <el-input
                  placeholder="Enter flight number"
                  v-model="journeyForm.transferObject.flightNumber"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12" v-if="isflightArrival === true">
              <el-form-item label="Flight arrives" prop="transferObject.flightArrivesDateTime">
                <el-date-picker
                  v-model="journeyForm.transferObject.flightArrivesDateTimeLocal"
                  type="datetime"
                  placeholder="flight arrives"
                  format="dd MMM yyyy HH:mm"
                  :value-format=mixinDateTimeValueFormat
                  @change="handleCheckArrivalTimeIsViable(true)"
                  :picker-options="pickerOptions"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-else>
              <el-form-item label="Flight departs" prop="transferObject.flightDepartsDateTime">
                <el-date-picker
                  v-model="journeyForm.transferObject.flightDepartsDateTimeLocal"
                  type="datetime"
                  placeholder="flight departs"
                  format="dd MMM yyyy HH:mm"
                  :value-format=mixinDateTimeValueFormat
                  @change="handleCheckDepartTimeIsViable(true)"
                  :picker-options="pickerOptions"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Pick up time" prop="journey.pickUpDateTime">
                <el-date-picker
                  v-model="journeyForm.journey.pickUpDateTimeLocal"
                  type="datetime"
                  placeholder="pick up time"
                  format="dd MMM yyyy HH:mm"
                  :value-format=mixinDateTimeValueFormat
                  @change="
                    handleSyncPickupDateTime(),
                    handleCheckArrivalTimeIsViable(false),
                      handleCheckDepartTimeIsViable(false)
                  "
                  :picker-options="pickerOptions"
                  :disabled="journeyForm.isScheduled === true"
                ></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="accommodationLabel">
                <el-select
                  v-model="journeyForm.transferObject.accommodationId"
                  clearable
                  filterable
                  remote
                  reserve-keyword
                  placeholder="Search accommodations"
                  :remote-method="searchAccommodation"
                  :loading="accommodationSearchLoading"
                  @change="handleAccommodationChange"
                  class="c74-block-select"
                >
                  <el-option
                    v-for="item in searchResultOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="Baby Seats" prop="transferObject.numBabySeats">
                <el-input-number
                  v-model="journeyForm.transferObject.numBabySeats"
                  :min="0"
                  :max="30"
                  size="mini"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Child Seats" prop="transferObject.numChildSeats">
                <el-input-number
                  v-model="journeyForm.transferObject.numChildSeats"
                  :min="0"
                  :max="30"
                  size="mini"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Booster Seats" prop="transferObject.numBoosterSeats">
                <el-input-number
                  v-model="journeyForm.transferObject.numBoosterSeats"
                  :min="0"
                  :max="30"
                  size="mini"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="Num Ski Bags" prop="transferObject.numWinterEquipment">
                <el-input-number
                  v-model="journeyForm.transferObject.numWinterEquipment"
                  :min="0"
                  :max="30"
                  size="mini"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Num Bikes" prop="transferObject.numSummerEquipment">
                <el-input-number
                  v-model="journeyForm.transferObject.numSummerEquipment"
                  :min="0"
                  :max="30"
                  size="mini"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="10">
              <el-form-item label="Price" prop="transferObject.price">
                <el-input-number
                  v-model="journeyForm.transferObject.price"
                  :min="0"
                  size="mini"
                  :step="5"
                  :disabled="journeyForm.canEditPrice === false"
                  @change="handlePriceChange"
                ></el-input-number>

              </el-form-item>

              <div style="display: flex; align-items: center">
                <el-button type="default" @click="handleCalculatePrice"
                  :disabled="journeyForm.canEditPrice === false"
                  >Calculate Price</el-button
                >
                <el-checkbox
                  v-model="showMatchedPricingList"
                  style="padding-left: 24px"
                  :disabled="journeyForm.canEditPrice === false"
                  >Show Matches</el-checkbox
                >
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-form>
    </el-row>

    <transition name="fade">
      <el-row :gutter="20" v-if="showMatchedPricingList" class="mt-6">
        <el-col :span="24">
          <MatchedPricingList
            :matchedPricingRules="matchedPricingRules"
            :numPassengers="safeGetNumPassengers()"
            :allPlaces="allPlaces"
            v-on:refresh-matched-pricing-rules="
              filterPricingListCacheForMatches
            "
            v-on:use-pricing-rule="handleUseThisPricingRule"
          />
        </el-col>
      </el-row>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";
import MatchedPricingList from "@/components/Bookings/MatchedPricingList";
import { queryAccommodation, mergeAccommodationLists} from "@/statics/accommodation/functions.js";
import { bookingMixin } from "@/statics/booking/functions.js";
import { quotesMixin } from "@/statics/pricing/quotes.js";
export default {
  mixins: [quotesMixin,bookingMixin],
  components: {
    MatchedPricingList
  },
  props: {
    journeyIndex: {
      required: true,
      type: Number
    },
    pricingRulesCache: {
      type: Array,
      required: true
    },
    journeyForm:{
      type: Object,
      required: true,
      default: () => {return {journey:{},
              transferObject:{},
              isScheduled: false,
              isSplit: false,
              canEditPrice:true
          }}
    },
    isEditing: {
      required: true,
      type: Boolean
    }
  },
  data() {
    return {
      // position of labels in the display of form, valid values are 'top', 'left', 'right'
      labelPosition: "top",

      matchedPricingRules: [],
      showMatchedPricingList: false,
      // arrays are not reactive in vue, so just holding this seperatly so user can instantly see in form
      // methods communicate the price changes via emit so the parent model is updated too
      localPrice: 0,
      searchResultOptions: [],
      accommodationSearchLoading: false,
      pickerOptions: {
        disabledDate: this.disabledDate
      },
      rules: {
        "transferObject.journeyType": [
          {
            required: true,
            message: "Transfer type is required",
            trigger: "change"
          }
        ],
        "journey.numPassengers": [
          {
            required: true,
            message: "Num. of Passengers required",
            trigger: "change"
          }
        ],
        "transferObject.fromPlaceId": [
          {
            required: true,
            message: "Journey from is required",
            trigger: "change"
          }
        ],
        "transferObject.toPlaceId": [
          {
            required: true,
            message: "Journey to is required",
            trigger: "change"
          }
        ],
        "journey.pickUpDateTime": [
          {
            required: true,
            message: "Pick Up Time is required",
            trigger: "change"
          }
        ],
        "transferObject.flightArrivesDateTime": [
          {
            required: true,
            message: "Flight Date/Time is required",
            trigger: "change"
          }
        ],
        "transferObject.flightDepartsDateTime": [
          {
            required: true,
            message: "Flight Date/Time is required",
            trigger: "change"
          }
        ],
        "transferObject.numBabySeats" : [
          {
            required: true,
            trigger: "change",
            message: "The number of baby seats is required",
          }
        ],
        "transferObject.numChildSeats" : [
          {
            required: true,
            trigger: "change",
            message: "The number of child seats is required",
          }
        ],
        "transferObject.numBoosterSeats" : [
          {
            required: true,
            trigger: "change",
            message: "The number of booster seats is required",
          }
        ],
        "transferObject.numWinterEquipment" : [
          {
            required: true,
            trigger: "change",
            message: "The number of ski bags is required",
          }
        ],
        "transferObject.numSummerEquipment" : [
          {
            required: true,
            trigger: "change",
            message: "The number of bikes is required",
          }
        ],
        "transferObject.price":[
          {
            required: true,
            trigger: "change",
            message: "Price is required"
          }
        ]
      }
    };
  },
  computed: {
    ...mapGetters("places", {
      allActivePlaces: "getAllActivePlaces"
    }),
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    }),    
    ...mapGetters("routes", {
      allActiveRoutes: "getAllActiveRoutes"
    }),
    ...mapGetters("companies", {
      companyKey: "getCompanyKey"
    }),
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    isFromPlaceKnown: function() {
      let transfer = this.journeyForm.transferObject;
      if(transfer && transfer.fromPlaceId && transfer.fromPlaceId !== null && transfer.fromPlaceId !== '') {
        return true;
      }
      return false;
    },
    // a flag indicating whether this form is being used to book a journey following a flight arrival
    // the place will be an airport
    isflightArrival: function() {
      let flightArrival = true;

      let transfer = this.journeyForm.transferObject;

      if(this.isFromPlaceKnown === true) {
        const foundFromPlace = this.findPlace(transfer.fromPlaceId);
        if (foundFromPlace && foundFromPlace !== null) {
          flightArrival = foundFromPlace.isTransitPoint;
        }
      }
      return flightArrival;
    },
    accommodationLabel: function() {
      if(this.isflightArrival === true) {
        return "Drop off at";
      }
      return "Pick up from";
    }
  },
  created() {
    let transferObject = this.journeyForm.transferObject;

    if (transferObject.accommodation) {
      const duplicate = Object.assign({}, transferObject.accommodation);
      this.searchResultOptions.push(duplicate);
    }
    if (this.allActivePlaces.length === 0) {
      this.$store.dispatch("places/initPlaces");
    }
    if (this.allActiveRoutes.length === 0) {
      this.$store.dispatch("routes/initRoutes").then(() => {
      });
    }
  },
  methods: {
    resetForm() {
      this.$refs["journeyForm"].resetFields();
    },

    isValidForm() {
      this.$refs["journeyForm"].validate(valid => {
        if (valid) {
          this.formValid = true;
        } else {
          this.formValid = false;
        }
      });
      return this.formValid;
    },

    // We use the getTime() method and get the unixtime (in milliseconds,
    // but we want current date selectable, therefore we subtract 8.64e7,
    // which is the number of milliseconds in a day.)
    disabledDate(time) {
      return time.getTime() < moment().seconds(0).milliseconds(0).valueOf();
    },

    handleAccommodationChange(value) {
      let accommodation = {
          value: "",
          label: ""
      };

      if(value) {
        let selection = this.searchResultOptions[this.searchResultOptions.findIndex(item => item.value === value)];
        accommodation =  {
          value: selection.value,
          label: selection.label
        };
      }

      this.journeyForm.transferObject.accommodation = accommodation;

      // clear the previous search results if the select was cleared
      if (!value) {
        this.searchResultOptions = [];
      }
    },
    async searchAccommodation(query) {
      this.accommodationSearchLoading = true;

      this.searchResultOptions = [];

      try {

        let results = await queryAccommodation(query, this.companyId);
        this.searchResultOptions = mergeAccommodationLists(results, this.searchResultOptions);
      }
      catch(error) {
        console.error('queryAccommodation error', error);
        this.searchResultOptions = [];
      }
      finally {
        this.accommodationSearchLoading = false;
      }
    },

    filterPricingListCacheForMatches() {
      let journey = this.journeyForm.journey;      
      let transferObject = this.journeyForm.transferObject;
      // Note: all pricing rules are active in the cache
      // Note: the cache is already ordered according to the priority we need so we can start at the top
      let quoteRequest = {
        pricingRulesList : this.pricingRulesCache,
        fromPlaceId : transferObject.fromPlaceId,
        toPlaceId : transferObject.toPlaceId,
        numPassengers : journey.numPassengers,
        pickUpDateTime : journey.pickUpDateTime,
        journeyType : transferObject.journeyType
      };

      this.matchedPricingRules = this.mixinGetPricingListMatches(quoteRequest);      
    },
    handlePriceChange(currentValue, oldValue) {
      //for manual price, set pricing rule to null
      this.localPrice = currentValue;
      this.handleUpdatePricing(this.journeyIndex, this.localPrice, null);
    },
    handleCalculatePrice() {
      // clear the local model price
      this.localPrice = 0;

      // clear the parent model
      this.handleUpdatePricing(this.journeyIndex, this.localPrice, null);

      this.filterPricingListCacheForMatches();

      //this.executePricingRuleSearch();
      if (this.matchedPricingRules && this.matchedPricingRules.length > 0) {
        // always take the first element which will be the highest priority match
        const pricingRule = this.matchedPricingRules[0];
        console.log("this.matchedPricingRules[0]", pricingRule);
        this.handleUseThisPricingRule(pricingRule);
      } else {
        this.$message({
          message:
            "No pricing rules can be found that match the journey details.",
          type: "warning"
        });
      }
    },
    handleUseThisPricingRule(pricingRule) {
      let success = false;

      let response = this.mixinGetPriceFromPricingRule(pricingRule, this.journeyForm.journey.numPassengers);
      if(response.price !== null && response.error === '') {
        this.localPrice = response.price;
        success = true;
      }
      else if(response.error !== '') {
        this.$message({
          message: response.error,
          type: "error"
        });
      }

      if(success === true) {
        console.log("this.localPrice", this.localPrice);
        this.handleUpdatePricing(this.journeyIndex, this.localPrice, pricingRule);
      }
    },
    handleUpdatePricing(journeyIndex, price, pricingRule) {
      // update the parent model
      this.$emit("update-journey-pricing", { journeyIndex:journeyIndex, pricingRule: pricingRule, price: price});
    },
    handleShowValidPrices() {
      this.filterPricingListCacheForMatches();
      this.showMatchedPricingList = !this.showMatchedPricingList;
    },

    handleCheckRouteIsViable() {

      let journey = this.journeyForm.journey;
      let transferObject = this.journeyForm.transferObject;
      transferObject.routeSummary = null;

      let response = this.mixinCheckRouteIsViable(this.allActivePlaces,this.allActiveRoutes,transferObject);
      let matchedRoute = response.matchedRoute;
      if(matchedRoute === null && response.error !== '') {
        this.$message({
          message: response.error,
          type: "warning"
        });
      }
      else if(matchedRoute !== null && response.routeSummary !== null) {

        if(this.isflightArrival === true) {
          this.setArrivalPickUpTime(journey,transferObject,true);
        }else {
          this.setDeparturePickUpTime(journey,transferObject,true,matchedRoute);
        }
        
        transferObject.routeSummary = response.routeSummary;

        this.$message({
          message:
            "Great! The chosen route is a valid route that can be booked by a client.",
          type: "success"
        });
      }
      else {
        this.$message({
          message:
            "Heads up! This route has not been defined as a route that clients can book.",
          type: "warning"
        });
      }
    },
    autoSetJourneyPickUpDateTime(journey, flightDateTime, offset) {
      if(this.journeyForm.isScheduled === false) {
        this.mixinSetJourneyPickUpDateTime(journey, flightDateTime, offset);
      }
    },
    setArrivalPickUpTime(journey, transfer, autoSetJourneyPickUpDateTime){
      if(autoSetJourneyPickUpDateTime === true && this.journeyForm.isScheduled === false) {
        let place = this.findPlace(transfer.fromPlaceId);
        let transitPointPickUpDelay = this.mixinCalculateArrivalPickUpTimeDelay(place);
        this.autoSetJourneyPickUpDateTime(journey, transfer.flightArrivesDateTime, transitPointPickUpDelay);
      }
    },
    setDeparturePickUpTime(journey, transfer, autoSetJourneyPickUpDateTime, matchedRoute){
      if(autoSetJourneyPickUpDateTime === true && this.journeyForm.isScheduled === false) {
        let place = this.findPlace(transfer.toPlaceId);
        let totalPickUpOffset = this.mixinCalculateDeparturePickUpTimeOffset(place, matchedRoute, this.allActivePlaces,this.allActiveRoutes,transfer);
        this.autoSetJourneyPickUpDateTime(journey, transfer.flightDepartsDateTime, totalPickUpOffset);
      }
    },
    convertDateTime(dateTimeTextFormatted) {
      if(dateTimeTextFormatted !== null) {
        return this.mixinConvertDateTimeInValueFormatToMillis(dateTimeTextFormatted);
      }
      return null;
    },    
    handleSyncPickupDateTime() {
      let journey = this.journeyForm.journey;
      journey.pickUpDateTime = this.convertDateTime(journey.pickUpDateTimeLocal);
    },
    handleCheckArrivalTimeIsViable(autoSetJourneyPickUpDateTime) {
      let journey = this.journeyForm.journey;
      let transfer = this.journeyForm.transferObject;
    
      transfer.flightArrivesDateTime = this.convertDateTime(transfer.flightArrivesDateTimeLocal);

      this.setArrivalPickUpTime(journey, transfer, autoSetJourneyPickUpDateTime);
      let response=this.mixinCheckArrivalTimeIsViable(transfer, journey);
      if(response.message !== '' && response.messageType !== '') {
          this.$message({
            message: response.message,
            type: response.messageType
          });
      }
    },
    handleCheckDepartTimeIsViable(autoSetJourneyPickUpDateTime) {
      let journey = this.journeyForm.journey;
      let transfer = this.journeyForm.transferObject;

      transfer.flightDepartsDateTime = this.convertDateTime(transfer.flightDepartsDateTimeLocal);

      this.setDeparturePickUpTime(journey, transfer, autoSetJourneyPickUpDateTime,null);

      let response=this.mixinCheckDepartTimeIsViable(transfer, journey);
      if(response.message !== '' && response.messageType !== '') {
          this.$message({
            message: response.message,
            type: response.messageType
          });
      }
    },
    findPlace(placeId) {
        if(placeId && placeId !== null && placeId !== '') {
          return this.allActivePlaces.find(place => place.id === placeId);
        }
        return null;
    },
    handleChangeFormInputsIfFromTransitPoint() {

      let transferObject = this.journeyForm.transferObject;
      let journey = this.journeyForm.journey;

      const foundFromPlace = this.findPlace(transferObject.fromPlaceId);
      if (foundFromPlace && foundFromPlace !== null) {
        if (foundFromPlace.isTransitPoint) {
          transferObject.flightDepartsDateTime = null;
          transferObject.flightDepartsDateTimeLocal = null;          
        } else {
          transferObject.flightArrivesDateTime = null;
          transferObject.flightArrivesDateTimeLocal = null;
        }
        if(this.journeyForm.isScheduled === false) {
          journey.pickUpDateTime = null;
          journey.pickUpDateTimeLocal = null;
        }        
      }
    },
    safeGetNumPassengers() {
      if(this.journeyForm.journey.numPassengers) {
        return this.journeyForm.journey.numPassengers;
      }
      return 0;
    },
    getPlacesList(id) {

      let reponse = this.allActivePlaces;

      if(this.isEditing === true && id) {
        //if place is still active , no need to show all places     
        let place = this.findPlace(id);
        if(!place || place === null) {
          reponse = this.allPlaces;
        }
      }

      return reponse;
    },    
  }
};
</script>

<style lang="scss" scoped>
.c74-block-select {
  display: block;
}
.fade-enter-active {
  transition: opacity 1s;
}
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
