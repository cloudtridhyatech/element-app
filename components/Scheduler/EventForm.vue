<template>
  <div>
    <div v-if="journies.length === 0">
      The last (or only) journey has been removed from this transfer, so the
      transfer has also been removed from the scheduler.
    </div>
    <div v-if="event && journies.length > 0">
      <el-form
        ref="form"
        :model="form"
        :label-position="labelPosition"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="Driver">
              <el-select
                v-model="form.driverId"
                placeholder="select driver"
                v-on:change="handleChangeFormValue"
              >
                <el-option
                  v-for="driver in allActiveDrivers"
                  :key="driver.id"
                  :label="driver.firstName + ' ' + driver.lastName"
                  :value="driver.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Warm Up Time">
              <el-switch
                v-model="form.hideWarmUpTime"
                active-text="Hide"
                v-on:change="handleChangeFormValue"
              >
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Cool Down Time">
              <el-switch
                v-model="form.hideCoolDownTime"
                active-text="Hide"
                v-on:change="handleChangeFormValue"
              >
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <section v-if="event && journies.length > 0" style="margin-top: 48px">
      <el-table :data="journies" style="width: 100%" row-key="id">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-row>
              <el-col :span="12">
                <div>
                  <p>Flight No.: {{ props.row.flightNum }}</p>

                  <p>Address: {{ getAccommodationFromId(props.row.transferObject.accommodationId).address }}</p>
                  <p>Geo:

                  <el-button
                    @click="openNativeMapsApp(props.row.transferObject)"
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
                  ></a></p>
                </div>
              </el-col>
              <el-col :span="12">
                <div>
                  <ul v-for="(es, index) in props.row.eventStatus" :key="index">
                    <!-- time : status -->
                    <li>
                      <div>
                        <!-- This is intentionally NOT UTC -->
                        {{ mixinFormatDateTime(es.startDateTime, "HH:mm") }} : {{ es.status }}
                      </div>
                    </li>
                  </ul>
                </div>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" :index="indexMethod"></el-table-column>
        <el-table-column label="Full Name">
          <template slot-scope="props">
            {{ props.row.transferObject.ref.firstName }}
            {{ props.row.transferObject.ref.lastName }}
          </template>
        </el-table-column>
        <el-table-column label="Pick Up" prop="pickUpDateTime">
          <template slot-scope="props">
            {{
              mixinFormatDateTimeUTC(props.row.pickUpDateTime, "HH:mm")
            }}</template
          >
        </el-table-column>

        <el-table-column label="Flight">
          <template slot-scope="props">
            {{props.row.flightNum}}
          </template>
        </el-table-column>

        <el-table-column label="Route">
          <template slot-scope="props"
            >{{ getPlaceFromId(props.row.transferObject.fromPlaceId).code }} -
            {{ getPlaceFromId(props.row.transferObject.toPlaceId).code }}</template
          >
        </el-table-column>
        <el-table-column label="Type" prop="journeyType"></el-table-column>
        <el-table-column min-width="150" label="PAX" prop="numPassengers">
          <template slot-scope="props">
            <el-row>
              <el-col :span="5">
                <div>
                  {{props.row.numPassengers}}
                </div>
              </el-col>
              <el-col :span="12">
                <div>
                  <div>{{props.row.transferObject.numChildSeats}} child seat</div>
                  <div>{{props.row.transferObject.numBabySeats}} baby seat</div>
                  <div>{{props.row.transferObject.numBoosterSeats}} booster</div>
                </div>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="Operation">
          <template slot-scope="scope">
            <el-button-group>
              <el-popconfirm
                confirmButtonText="OK"
                cancelButtonText="No, Thanks"
                icon="el-icon-info"
                iconColor="red"
                title="Are you sure you want to remove this transfer from the schedule?"
                @confirm="handleRemoveJourneyFromEvent(scope.$index, event)"
              >
                <el-button
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="small"
                ></el-button>
              </el-popconfirm>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb } from "@/plugins/firebase.js";

import { getScheduledJourniesForThisEvent, getNativeMapsUrl } from "@/statics/scheduler/functions.js";
import { dateUtilsMixin } from "@/statics/utils/dateUtils.js";

export default {
  mixins: [dateUtilsMixin],  
  props: {
    eventId: { type: String, required: true },
    allActiveDrivers: { type: Array, required: true }
  },
  data() {
    return {
      labelPosition: "top",
      form: {
        driverId: null,
        hideWarmUpTime: false,
        hideCoolDownTime: false
      },
      currentIndex: 0,
      event: null,
      journies: [],
      showWazeLink: null
    };
  },

  mounted() {
    this.initForm();
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    }),
    ...mapGetters("events", {
      getEventById: "getEventById"
    }),
    ...mapGetters("journies", {
      scheduledJournies: "getAllScheduledJourniesForSetDate"
    }),
    ...mapGetters("accommodations", {
      allAccommodations: "getAllAccommodations",
    }),    
  },

  watch: {
    eventId: function(value, oldValue) {
      /* if (value !== oldValue) {
        this.initForm();
      } */
      this.initForm();
    }
  },
  methods: {
    async initForm() {
      const eventVuex = this.getEventById(this.eventId);
      this.event = { ...eventVuex };

      // pre-populate the form.
      this.form.driverId = this.event.userId;
      this.form.hideWarmUpTime = this.event.hideWarmUpTime
        ? this.event.hideWarmUpTime
        : false;
      this.form.hideCoolDownTime = this.event.hideCoolDownTime
        ? this.event.hideCoolDownTime
        : false;

      console.log("event", this.event);

      this.journies = [];
      this.journies = getScheduledJourniesForThisEvent(
        this.event,
        this.scheduledJournies
      );
    },

    async handleChangeFormValue() {
      if (event) {
        const editedEvent = {
          ...this.event,
          hideWarmUpTime: this.form.hideWarmUpTime,
          hideCoolDownTime: this.form.hideCoolDownTime
        };

        if (this.form.driverId) {
          editedEvent.userId = this.form.driverId;
        }

        console.error("editedEvent", editedEvent);

        await this.$store.dispatch("events/editEvent", editedEvent);

        this.$emit("redraw-event", editedEvent.id);
      } else {
        console.error("cannot find existing event in scheduler data");
      }
    },

    handleRemoveJourneyFromEvent(index, event) {
      // remove 1 element at index which will update the view and assign the removed element to journeyToRemove
      const journeyToRemove = this.journies[index];
      this.journies.splice(index, 1);

      this.$emit("remove-journey-from-event", journeyToRemove.id, event.id);
    },
    indexMethod(index) {
      this.currentIndex = index;
      return "";
    },
    getPlaceFromId(id) {
      const place = this.allPlaces.find(place => place.id === id);
      return place;
    },
    getAccommodationFromId(id) {
      let accommodation = {
        accommodationName : '',
        address : ''
      };
      if(id) {
        accommodation = this.allAccommodations.find(item => item.id === id);
      }
      return accommodation;
    },
    openNativeMapsApp(transferObject) {
      if(transferObject && transferObject.accommodationId) {
        let accommodation = this.getAccommodationFromId(transferObject.accommodationId);
        let url = getNativeMapsUrl(accommodation);

        if(url && url !== '') {
          this.showWazeLink = url;
          setTimeout(() => {
            this.$refs.wazeAnchor.click();
          }, 0);
        }else {
          this.$message({
            message: "Sorry, no Geo location registered for this address.",
            type: "info",
            duration: 5000
          });
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
