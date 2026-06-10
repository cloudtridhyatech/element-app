<template>
  <div>
    <div v-if="journey">
      <el-dialog
        :visible.sync="splitJourneyDialogFormVisible"
        width="600px"
        top="0vh"
        v-on:closed="handleDialogClosed"
      >
        <span slot="title" class="dialog-header"> Split Journey </span>

        <p style="margin-bottom: 48px">
          You can split any journey into two (or more) journies. Use the slider
          to set the number of passengers in the original and new journey.
        </p>

        <el-form
          ref="form"
          :model="form"
          :label-position="labelPosition"
          label-width="120px"
        >
          <div class="c74-journey-container">
            <el-badge
              style="cursor: move"
              :value="form.splitValue"
              class="item"
              type="info"
            >
              <JourneyButton
                :journey="journey"
                :allPlaces="allPlaces"
                :disabled="form.splitValue === 0"
                :transferObject="transferObject"                
              />
            </el-badge>
          </div>

          <div class="c74-block">
            <el-slider
              v-model="form.splitValue"
              :step="1"
              :max="journey.numPassengers"
              show-stops
              class="c74-el-slider"
            >
            </el-slider>
          </div>

          <div class="c74-journey-container">
            <el-badge
              style="cursor: move"
              :value="journey.numPassengers - form.splitValue"
              class="item"
              type="info"
            >
              <JourneyButton
                :journey="journey"
                :allPlaces="allPlaces"
                :disabled="form.splitValue === journey.numPassengers"
                :transferObject="transferObject"                
              />
            </el-badge>
          </div>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            @click="splitJourney"
            :loading="loading"
            :disabled="isSplitJourneyDisabled()"
            icon="el-icon-connection"
            >Split Journey</el-button
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
import { fireDb } from "@/plugins/firebase.js";

import JourneyButton from "@/components/Scheduler/JourneyButton";

export default {
  components: {
    JourneyButton,
  },

  props: {
    journeyId: { type: String, required: true },
    shouldOpenSplitJourneyDialog: Boolean,
  },
  data() {
    return {
      loading: false,
      labelPosition: "top",
      journey: null,
      transferObject : null,
      form: {
        splitValue: 0,
      },
      splitJourneyDialogFormVisible: false,
    };
  },

  watch: {
    shouldOpenSplitJourneyDialog: function (value, oldValue) {
      if (value) {
        this.splitJourneyDialogFormVisible = true;
      } else {
        this.splitJourneyDialogFormVisible = false;
      }
    },

    journeyId: function (value, oldValue) {
      this.initForm();
    },
  },

  mounted() {
    this.initForm();
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId",
    }),
    ...mapGetters("journies", {
      getJourneyById: "getJourneyById",      
    }),
    ...mapGetters("places", {
      allPlaces: "getAllPlaces",
    }),
  },

  methods: {
    initForm() {
      if (this.journeyId) {
        // get the journey from the vuex store
        this.journey = this.getJourneyById(this.journeyId);        
        this.transferObject = this.journey.transferObject;

        // set initial value for split
        this.form.splitValue = this.journey.numPassengers;
      }
    },

    async splitJourney() {
      this.loading = true;
      // [vuex] do not mutate vuex store state outside mutation handlers.
      const editedJourney = { ...this.journey };
      const newJourneyAfterSplit = { ...this.journey };

      editedJourney.numPassengers = this.form.splitValue;
      newJourneyAfterSplit.numPassengers =
        this.journey.numPassengers - this.form.splitValue;

      editedJourney.isSplit = true;
      newJourneyAfterSplit.isSplit = true;      

      await this.$store.dispatch("journies/editJourney", editedJourney);
      await this.$store.dispatch("journies/addJourney", newJourneyAfterSplit);

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
    isSplitJourneyDisabled() {
      return this.form.splitValue === 0 || this.form.splitValue === this.journey.numPassengers;
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

.c74-block {
  padding: 30px 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  .c74-el-slider {
    min-width: 70%;
  }
}
</style>
