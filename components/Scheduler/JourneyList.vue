<template>
  <div>
    <el-collapse v-model="activeList">
      <el-collapse-item title="Confirmed" name="confirmed">
        <div class="c74-padded-item">
          <div id="confirmedExternal">
            <div
              v-for="journey in confirmedJournies"
              :key="journey.id"
              :data-id="journey.id"
              :data-duration="3600"
              class="draggable"
            >
              <JourneyDisplay
                :journey="journey"
                :allPlaces="allPlaces"
                @open-split-journey-form="onHearOpenSplitJourneyForm"
                @open-quick-edit-journey-form="onHearOpenQuickEditJourneyForm"
              />
            </div>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="Enquiry" name="enquiry">
        <div class="c74-padded-item">
          <div id="enquiryExternal">
            <div v-for="journey in enquiryJournies" :key="journey.id"
                  :data-id="journey.id"
                  :data-duration="3600"
                  class="draggable"
            >
              <JourneyDisplay :journey="journey"
                :allPlaces="allPlaces"
                  @open-split-journey-form="onHearOpenSplitJourneyForm"
                  @open-quick-edit-journey-form="onHearOpenQuickEditJourneyForm"          
              />
            </div>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="Scheduled" name="scheduled">
        <div class="c74-padded-item">
          <div v-for="journey in scheduledJournies" :key="journey.id">
            <JourneyDisplay :journey="journey" :allPlaces="allPlaces"/>
          </div>
        </div>
        <p v-if="scheduledJournies.length === 0">Nothing scheduled yet</p>
      </el-collapse-item>
      <el-collapse-item title="Cancelled" name="cancelled">
        <div class="c74-padded-item">
          <div v-for="journey in cancelledJournies" :key="journey.id">
            <JourneyDisplay :journey="journey" :allPlaces="allPlaces"/>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item title="Dead" name="dead">
        <div class="c74-padded-item">
          <div v-for="journey in deadJournies" :key="journey.id">
            <JourneyDisplay :journey="journey" :allPlaces="allPlaces"/>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <section>
      <SplitJourneyForm
        ref="splitJourneyForm"
        :shouldOpenSplitJourneyDialog="shouldOpenSplitJourneyDialog"
        :journeyId="splitJourneyId"
        v-on:close-form="onCloseForm"
      />
    </section>

    <section>
      <QuickEditJourneyForm
        ref="splitJourneyForm"
        :shouldOpenQuickEditJourneyDialog="shouldOpenQuickEditJourneyDialog"
        :journeyId="quickJourneyId"
        v-on:close-form="onCloseForm"
      />
    </section>
  </div>
</template>

<script>
import Vue from "vue";
import { mapGetters } from "vuex";

import { fireDb } from "@/plugins/firebase.js";
import { DayPilot } from "daypilot-pro-vue";

import { pushJourniesToArray } from "@/statics/scheduler/functions.js";
import { addTransientDataToJourney } from "@/statics/shared/functions.js";
import JourneyDisplay from "@/components/Scheduler/JourneyDisplay";
import JourneyButton from "@/components/Scheduler/JourneyButton";

import SplitJourneyForm from "@/components/Scheduler/SplitJourneyForm";
import QuickEditJourneyForm from "@/components/Scheduler/QuickEditJourneyForm";

export default {
  components: {
    JourneyDisplay,
    JourneyButton,
    SplitJourneyForm,
    QuickEditJourneyForm
  },

  props: {
    currentDate: { type: String, required: true },
    enquiryJournies: { type: Array, required: true },
    confirmedJournies: { type: Array, required: true },
    scheduledJournies: { type: Array, required: true },
    cancelledJournies: { type: Array, required: true },
    deadJournies: { type: Array, required: true },
    allPlaces: { type: Array, required: true }
  },

  data() {
    return {
      loading: true,

      activeList: ["1"],

      splitJourneyId: "",
      quickJourneyId: "",

      splitJourneyDialogFormVisible: false,
      shouldOpenSplitJourneyDialog: false,

      quickEditJourneyDialogFormVisible: false,
      shouldOpenQuickEditJourneyDialog: false
    };
  },

  watch: {
    confirmedJournies: function(val) {
      // wait until the next tick as we need the DOM updated before executing makeDraggable()
      this.$nextTick(() => {
        this.makeDraggable(this.confirmedJournies, "confirmedExternal");
      });
    },
    enquiryJournies: function(val) {
      // wait until the next tick as we need the DOM updated before executing makeDraggable()
      this.$nextTick(() => {
        this.makeDraggable(this.enquiryJournies, "enquiryExternal");
      });
    },    
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
  },

  async mounted() {
    this.makeDraggable(this.confirmedJournies, "confirmedExternal");
    this.makeDraggable(this.enquiryJournies, "enquiryExternal");    
    this.loading = false;
  },

  methods: {
    onHearOpenSplitJourneyForm(journeyId) {
      console.log("onHearOpenSplitJourneyForm", journeyId);
      this.splitJourneyId = journeyId;
      this.shouldOpenSplitJourneyDialog = true;
    },

    onHearOpenQuickEditJourneyForm(journeyId) {
      console.log("onHearOpenQuickEditJourneyForm", journeyId);
      this.quickJourneyId = journeyId;
      this.shouldOpenQuickEditJourneyDialog = true;
    },

    onCloseForm() {
      console.log("onCloseForm");
      this.shouldOpenSplitJourneyDialog = false;
      this.shouldOpenQuickEditJourneyDialog = false;
      this.splitJourneyId = "";
    },

    getPlaceFromId(id) {
      const place = this.allPlaces.find(place => place.id === id);
      return place;
    },

    makeDraggable(journies, externalClass) {
      var parent = document.getElementById(externalClass);
      var items = parent.getElementsByClassName("draggable");
      for (var i = 0; i < items.length; i++) {
        const e = items[i];
        const journeyId = e.getAttribute("data-id");

        const journey = journies.find(
          journey => journey.id === journeyId
        );

        if (journey) {
          // [vuex] do not mutate vuex store state outside mutation handlers.
          const copiedJourney = { ...journey };

          var item = {
            element: e,
            id: "temp" + Math.random(),
            text: e.innerText,
            duration: e.getAttribute("data-duration"),
            keepElement: true
          };

          item.customData = {
            event: {
              journies: []
            }
          };

          addTransientDataToJourney(copiedJourney, this.allPlaces);

          item.customData.event.journies.push(copiedJourney);

          DayPilot.Scheduler.makeDraggable(item);
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.c74-padded-item {
  padding-top: 24px;
  padding-right: 36px;
}
</style>
