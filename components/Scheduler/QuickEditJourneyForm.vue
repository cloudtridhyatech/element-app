<template>
  <div>
    <div v-if="journey">
      <el-dialog
        :visible.sync="quickEditJourneyDialogFormVisible"
        width="600px"
        top="0vh"
        v-on:closed="handleDialogClosed"
      >
        <span slot="title" class="dialog-header"> Quick Edit Journey </span>

        <p style="margin-bottom: 48px">
          You may change the pick up time and/or flight times as needed.
        </p>
        <div class="c74-journey-container">
          <JourneyButton :journey="journey" :allPlaces="allPlaces" :transferObject="transferObject" disabled />
        </div>

        <el-form
          v-if="journey"
          ref="quickEditForm"
          :model="quickEditForm"
          :label-position="labelPosition"
          label-width="120px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Pick up time">
                <el-date-picker
                  v-model="quickEditForm.journey.pickUpDateTimeLocal"
                  type="datetime"
                  placeholder="pick up time"
                  format="dd MMM yyyy HH:mm"
                  :value-format=mixinDateTimeValueFormat
                ></el-date-picker>
              </el-form-item>
            </el-col>

            <el-col :span="12" v-if="fromTransitPoint">
              <el-form-item label="Flight arrives">
                <el-date-picker
                  v-model="quickEditForm.transfer.flightArrivesDateTimeLocal"
                  type="datetime"
                  placeholder="flight arrives"
                  format="dd MMM yyyy HH:mm"
                  :value-format=mixinDateTimeValueFormat
                ></el-date-picker>
              </el-form-item>
            </el-col>

            <el-col :span="12" v-if="!fromTransitPoint">
              <el-form-item label="Flight departs">
                <el-date-picker
                  v-model="quickEditForm.transfer.flightDepartsDateTimeLocal"
                  type="datetime"
                  placeholder="flight departs"
                  format="dd MMM yyyy HH:mm"
                  :value-format=mixinDateTimeValueFormat
                ></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            @click="saveJourney"
            :loading="loading"
            icon="el-icon-connection"
            >Save Journey</el-button
          >
          <el-button @click="handleCancel()" icon="el-icon-close"
            >Cancel</el-button
          >
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb, firebaseFunctions } from "@/plugins/firebase.js";
import app from "firebase/app";

import JourneyButton from "@/components/Scheduler/JourneyButton";

import { convertFirestoreTimestampToMillis } from "@/statics/utils/dateUtils.js";
import { bookingMixin } from "@/statics/booking/functions.js";

export default {
  mixins: [bookingMixin],  
  components: {
    JourneyButton
  },

  props: {
    journeyId: { type: String, required: true },
    shouldOpenQuickEditJourneyDialog: Boolean
  },
  data() {
    return {
      loading: false,
      labelPosition: "top",
      journey: null,
      transferObject: null,
      quickEditForm: {
        journey:{},
        transfer:{}
      },
      quickEditJourneyDialogFormVisible: false,

      // a flag indicating whether this form is being used to book a journey following a flight arrival
      // the place will be an airport
      fromTransitPoint: false
    };
  },

  watch: {
    shouldOpenQuickEditJourneyDialog: function(value, oldValue) {
      if (value) {
        this.quickEditJourneyDialogFormVisible = true;
      } else {
        this.quickEditJourneyDialogFormVisible = false;
      }
    },

    journeyId: function(value, oldValue) {
      this.initForm();
    }
  },

  mounted() {
    this.initForm();
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("journies", {
      getJourneyById: "getJourneyById"
    }),
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    })
  },

  methods: {
    initForm() {

      if (this.journeyId) {
        this.journey = this.getJourneyById(this.journeyId);        
        this.transferObject = this.journey.transferObject;

        let response = this.convertAllDatesToMilliseconds({
          ...this.journey
        },{
          ...this.transferObject
        });

        this.quickEditForm.journey = response.journey;
        this.quickEditForm.transfer = response.transfer;


        this.handleCheckFromIsTransitPoint();
      }
    },

    handleCheckFromIsTransitPoint() {
      const foundPlace = this.allPlaces.find(
        place => place.id === this.transferObject.fromPlaceId
      );

      if (foundPlace && foundPlace.isTransitPoint) {
        this.fromTransitPoint = true;
      } else {
        this.fromTransitPoint = false;
      }
    },

    async saveJourney() {
      this.loading = true;

      this.quickEditForm.journey.pickUpDateTime = this.convertDateTime(this.quickEditForm.journey.pickUpDateTimeLocal);
      let transfer = this.quickEditForm.transfer;
      transfer.flightArrivesDateTime = this.convertDateTime(transfer.flightArrivesDateTimeLocal);
      transfer.flightDepartsDateTime = this.convertDateTime(transfer.flightDepartsDateTimeLocal);

      // [vuex] do not mutate vuex store state outside mutation handlers.
      //always call transfer first
      const editedTransfer = { ...this.quickEditForm.transfer };
      await this.$store.dispatch("transfers/editTransfer", editedTransfer);

      const editedJourney = { ...this.quickEditForm.journey };
      await this.$store.dispatch("journies/editJourney", editedJourney);
      
      this.loading = false;

      this.$emit("close-form");
    },

    handleDialogClosed() {
      this.activeFormPanels = ["1"];
      this.$emit("close-form");
    },

    handleCancel() {
      this.$emit("close-form");
    },
    convertAllDatesToMilliseconds(journey, transferObject) {
      /*
       * IMPORTANT NOTE
       * We check if each date is a Date as the element data picker is capable of showing
       * dates from a Date object or milliseconds (since epoch).
       * So we only call getTime if we know the object is a Date
       */

      if (journey.pickUpDateTime) {
        journey.pickUpDateTime = convertFirestoreTimestampToMillis(
          journey.pickUpDateTime
        );
        journey.pickUpDateTimeLocal = this.mininConvertMillisToDateTimeInValueFormat(journey.pickUpDateTime);                    
      }
      if (transferObject.flightArrivesDateTime) {
        transferObject.flightArrivesDateTime = convertFirestoreTimestampToMillis(
          transferObject.flightArrivesDateTime
        );
        transferObject.flightArrivesDateTimeLocal = this.mininConvertMillisToDateTimeInValueFormat(transferObject.flightArrivesDateTime);
      }
      if (transferObject.flightDepartsDateTime) {
        transferObject.flightDepartsDateTime = convertFirestoreTimestampToMillis(
          transferObject.flightDepartsDateTime
        );
        transferObject.flightDepartsDateTimeLocal = this.mininConvertMillisToDateTimeInValueFormat(transferObject.flightDepartsDateTime);        
      }

      return {
        journey: journey,
        transfer: transferObject
      };
    },
    convertDateTime(dateTimeTextFormatted) {
      if(dateTimeTextFormatted !== null) {
        return this.mixinConvertDateTimeInValueFormatToMillis(dateTimeTextFormatted);
      }
      return null;
    },    
  },
};
</script>

<style lang="scss" scoped>
.c74-journey-container {
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
