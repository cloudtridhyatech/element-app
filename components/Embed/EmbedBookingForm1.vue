<template>
  <div>
    <el-form ref="form1" :model="form" :rules="rules" label-position="top" :loading="loading">
      <div class="mb-2 text-lg font-semibold">Transfer {{ index + 1 }}</div>
      <div class="grid grid-cols-12 gap-x-4 lg:gap-x-12">
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="From" prop="transfer.fromPlaceId">
            <el-select
              v-model="form.transfer.fromPlaceId"
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
                v-for="place in allActivePlaces"
                :key="place.id"
                :label="place.name"
                :value="place.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="To" prop="transfer.toPlaceId">
            <el-select
              v-model="form.transfer.toPlaceId"
              placeholder="select"
              filterable
              clearable
              default-first-option
              @change="handleCheckRouteIsViable"
              class="c74-block-select"
            >
              <el-option
                v-for="place in allActivePlaces"
                :key="place.id"
                :label="place.name"
                :value="place.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <div v-if="isFromPlaceKnown">
            <div v-if="isflightArrival">
              <el-form-item
                label="Flight arrives"
                prop="transfer.flightArrivesDateTime"
              >
                <el-date-picker
                  v-model="form.transfer.flightArrivesDateTimeLocal"
                  type="datetime"
                  placeholder="flight arrives"
                  format="dd MMM yyyy HH:mm"
                  :value-format=mixinDateTimeValueFormat
                  @change="handleCheckArrivalTimeIsViable"
                  :picker-options="pickerOptions"
                ></el-date-picker>
              </el-form-item>
            </div>
            <div v-else>
              <el-form-item
                label="Flight departs"
                prop="transfer.flightDepartsDateTime"
              >
                <el-date-picker
                  v-model="form.transfer.flightDepartsDateTimeLocal"
                  type="datetime"
                  placeholder="flight departs"
                  format="dd MMM yyyy HH:mm"
                  :value-format=mixinDateTimeValueFormat            
                  @change="handleCheckDepartTimeIsViable"
                  :picker-options="pickerOptions"
                ></el-date-picker>
              </el-form-item>
            </div>
          </div>
          <div v-else>
            <el-form-item label="Flight arrives/departs">
              <el-date-picker
                v-model="form.placeholder"
                type="datetime"
                placeholder="flight arrives/departs"
                format="dd MMM yyyy HH:mm"
                value-format="timestamp"
                :disabled="true"
              ></el-date-picker>
            </el-form-item>
          </div>
        </div>
        <div class="col-span-12 sm:col-span-6 md:col-span-3">
          <el-form-item label="Num Passengers" prop="journey.numPassengers">
            <el-input-number
              v-model="form.journey.numPassengers"
              :min="1"
              :max="30"
              @change="handleChangeNumPassengers"
            ></el-input-number>
          </el-form-item>
        </div>
      </div>
      <el-button
        v-if="index > 0 || numTransfers > 1"
        type="text"
        @click="$emit('delete-transfer', index)"
        >Delete this transfer
      </el-button>
    </el-form>
  </div>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";
import { bookingMixin } from "@/statics/booking/functions.js";

export default {
  mixins: [bookingMixin],  
  components: {},
  props: {
    index: {
      type: Number,
      required: true
    },
    numTransfers: {
      type: Number,
      required: true
    },
    allActivePlaces: {
      type: Array,
      required: true
    },
    allActiveRoutes: {
      type: Array,
      required: true
    },
    companyId: {
      type: String,
      required: true
    },
    form: {
      type: Object,
      required: true,
      default: () => {
        return { journey: {}, transfer: {}, placeholder: "" };
      }
    },
    loading:  {
      type: Boolean,
      required: true
    },    
  },
  data() {
    return {
      formValid: false,
      rules: {
        "journey.numPassengers": [
          {
            required: true,
            message: "Num. of Passengers required",
            trigger: "change"
          }
        ],
        "transfer.fromPlaceId": [
          {
            required: true,
            message: "Journey from is required",
            trigger: "change"
          }
        ],
        "transfer.toPlaceId": [
          {
            required: true,
            message: "Journey to is required",
            trigger: "change"
          }
        ],
        "transfer.flightArrivesDateTime": [
          {
            required: true,
            message: "Flight Date/Time is required",
            trigger: "change"
          }
        ],
        "transfer.flightDepartsDateTime": [
          {
            required: true,
            message: "Flight Date/Time is required",
            trigger: "change"
          }
        ]
      },
      pickerOptions: {}
    };
  },
  computed: {
    isFromPlaceKnown: function() {
      let transfer = this.form.transfer;
      if (
        transfer &&
        transfer.fromPlaceId &&
        transfer.fromPlaceId !== null &&
        transfer.fromPlaceId !== ""
      ) {
        return true;
      }
      return false;
    },
    // a flag indicating whether this form is being used to book a journey following a flight arrival
    // the place will be an airport
    isflightArrival: function() {
      let flightArrival = true;
      if (this.isFromPlaceKnown === true) {
        const foundFromPlace = this.findPlace(
          this.form.transfer.fromPlaceId
        );
        if (foundFromPlace && foundFromPlace !== null) {
          flightArrival = foundFromPlace.isTransitPoint;
        }
      }
      return flightArrival;
    }
  },
  created() {},
  methods: {
    isValidForm() {
      this.$refs["form1"].validate(valid => {
        if (valid) {
          this.formValid = true;
        } else {
          this.formValid = false;
        }
      });
      return this.formValid;
    },
    handleCheckRouteIsViable() {
      this.resetQuote();
      let transfer = this.form.transfer;
      let journey = this.form.journey;      

      if (!(transfer.fromPlaceId && transfer.toPlaceId)) {
        // only one or the other is set, do nothing.
        return;
      }

      transfer.routeSummary = null;
      let response = this.mixinCheckRouteIsViable(
        this.allActivePlaces,
        this.allActiveRoutes,
        transfer
      );

      const matchedRoute = response.matchedRoute;
      const routeSummary = response.routeSummary;

      if (response.error) {
        this.$message({
          message: response.error,
          type: "warning"
        });
        return;
      }

      if (matchedRoute === null) {
        this.$message({
          message: "We don't provide transfers on this route.",
          type: "warning"
        });
      }

      if (matchedRoute !== null && routeSummary !== null) {

        if(this.isflightArrival === true) {
          this.setArrivalPickUpTime(journey,transfer);
        }else {
          this.setDeparturePickUpTime(journey,transfer,matchedRoute);
        }

        transfer.routeSummary = routeSummary;
      }
    },
    findPlace(placeId) {
      if (placeId) {
        return this.allActivePlaces.find(place => place.id === placeId);
      }
      return null;
    },
    handleChangeFormInputsIfFromTransitPoint() {
      let transfer = this.form.transfer;
      let journey = this.form.journey;      
      const foundFromPlace = this.findPlace(transfer.fromPlaceId);
      if (foundFromPlace && foundFromPlace !== null) {
        if (foundFromPlace.isTransitPoint) {
          transfer.flightDepartsDateTime = null;
          transfer.flightDepartsDateTimeLocal = null;          
        } else {
          transfer.flightArrivesDateTime = null;
          transfer.flightArrivesDateTimeLocal = null;          
        }
        journey.pickUpDateTime = null;
        journey.pickUpDateTimeLocal = null;
      /*} else {
        this.form.journey.pickUpDateTime = null;
        this.form.journey.pickUpDateTimeLocal = null;*/        
      }
    },
    setArrivalPickUpTime(journey, transfer){
      let place = this.findPlace(transfer.fromPlaceId);
      let transitPointPickUpDelay = this.mixinCalculateArrivalPickUpTimeDelay(place);
      this.mixinSetJourneyPickUpDateTime(journey, transfer.flightArrivesDateTime, transitPointPickUpDelay);
    },
    setDeparturePickUpTime(journey, transfer, matchedRoute){
      let place = this.findPlace(transfer.toPlaceId);
      let totalPickUpOffset = this.mixinCalculateDeparturePickUpTimeOffset(place, matchedRoute, this.allActivePlaces,this.allActiveRoutes,transfer);
      this.mixinSetJourneyPickUpDateTime(journey, transfer.flightDepartsDateTime, totalPickUpOffset);
    },    
    convertDateTime(dateTimeTextFormatted) {
      if(dateTimeTextFormatted !== null) {
        return this.mixinConvertDateTimeInValueFormatToMillis(dateTimeTextFormatted);
      }
      return null;
    },    
    handleCheckArrivalTimeIsViable() {
      this.resetQuote();
      let transfer = this.form.transfer;
      let journey = this.form.journey;

      transfer.flightArrivesDateTime = this.convertDateTime(transfer.flightArrivesDateTimeLocal);

      this.setArrivalPickUpTime(journey, transfer);

      let response = this.mixinCheckArrivalTimeIsViable(transfer, journey);
    },
    handleCheckDepartTimeIsViable() {
      this.resetQuote();
      let transfer = this.form.transfer;
      let journey = this.form.journey;

      transfer.flightDepartsDateTime = this.convertDateTime(transfer.flightDepartsDateTimeLocal);

      this.setDeparturePickUpTime(journey, transfer, null);      

      let response = this.mixinCheckDepartTimeIsViable(transfer, journey);
    },
    handleChangeNumPassengers() {
      this.resetQuote();
    },
    resetQuote() {
      this.$emit("reset-quote");
    }
  }
};
</script>
