<template>
  <el-card class="box-card c74-extra-rounded">
    <div class="c74-card-inner">
      <div class="c74-summary-block c74-summary-block-journey">
        <div class="c74-time">
          {{ pickUpTime }}
        </div>
        <div class="c74-pax">{{ journey.numPassengers }} pax</div>
      </div>

      <div class="c74-title-and-summary">
        <div class="c74-title">
          {{ transferObject.ref.firstName }} {{ transferObject.ref.lastName }}
        </div>

        <div class="c74-xxx">
          <p>
            {{ journey.transient.fromPlace.name }} to
            {{ journey.transient.toPlace.name }}<br />
            Type: {{ transferObject.journeyType }}
          </p>
        </div>

        <div class="c74-flight-details">
          <p v-if="accommodation">
            Drop off at/Pick up from:<br />{{ accommodation.accommodationName }},
            {{ accommodation.address }}<br /><br />
            <el-button
              @click="openNativeMapsApp(accommodation)"
              size="small"
              type="primary"
              icon="el-icon-location-outline"
            >
              Waze</el-button
            >
            <a
              ref="wazeAnchor"
              target="_blank"
              :href="showWazeLink"
              v-show="false"
            ></a>            
            <el-button
              v-if="accommodation.telMobile"
              @click="openNativeDialerApp(accommodation.telMobile)"
              size="small"
              type="primary"
              icon="el-icon-location-outline"
            >
              Call</el-button
            >
          </p>
          <p v-if="transferObject.flightDepartsDateTime">
            Flight Departs:<br />
            {{
              mixinFormatDateTimeUTC(transferObject.flightDepartsDateTime, "HH:mm ddd MMM DD yy")
            }}<br />
            {{ transferObject.flightNumber }}
          </p>
          <p v-if="transferObject.flightArrivesDateTime">
            Flight Arrives:<br />
            {{
              mixinFormatDateTimeUTC(transferObject.flightArrivesDateTime, "HH:mm ddd MMM DD yy")              
            }}<br />
            {{ transferObject.flyingFrom }} {{ transferObject.flightNumber }}
          </p>
        </div>

        <div class="c74-summary">
          <div v-if="transferObject.numBabySeats">
            {{ transferObject.numBabySeats }} baby seat(s)
          </div>
          <div v-if="transferObject.numBoosterSeats">
            {{ transferObject.numBoosterSeats }} booster seat(s)
          </div>
          <div v-if="transferObject.numChildSeats">
            {{ transferObject.numChildSeats }} child seat(s)
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { addTransientDataToJourney } from "@/statics/shared/functions.js";
import { getNativeMapsUrl } from "@/statics/scheduler/functions.js";
import { dateUtilsMixin } from "@/statics/utils/dateUtils.js";

export default {
  mixins: [dateUtilsMixin],
  name: "journey-card",

  props: {
    journey: {
      type: Object,
      required: true
    },
    transferObject: {
      type: Object,
      required: true
    },    
    accommodation: {
      type: Object,
      required: false
    },
    places: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      showWazeLink: null
    };
  },
  created() {
    addTransientDataToJourney(this.journey, this.places);
  },

  computed: {
    pickUpTime() {
      const pickUpDateTime = this.mixinFormatDateTimeUTC(this.journey.pickUpDateTime,"HH:mm");
      return `${pickUpDateTime}`;
    }
  },

  methods: {
    openNativeMapsApp(accommodation) {
        let url = getNativeMapsUrl(accommodation);

        if(url && url !== '') {
          this.showWazeLink = url;
          setTimeout(() => {
            this.$refs.wazeAnchor.click();
          }, 0);
        } else {
          this.$message({
            message: "Sorry, no Geo location registered for this address.",
            type: "info",
            duration: 5000
          });
        }      
    },
    openNativeDialerApp(telMobile) {
      location.href = "tel:" + telMobile;
    }
  }
};
</script>

<style lang="scss" scoped>
.el-card {
  margin-bottom: 20px;
}
</style>
