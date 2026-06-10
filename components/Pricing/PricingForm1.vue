<template>
  <div>
    <el-form ref="pricingForm1" :model="form" :rules="rules">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="Pricing Rule Name" prop="name">
          <el-input
            placeholder="Enter a meaningful name"
            v-model="form.name"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="Transfer type"  prop="journeyType">
          <el-select
            v-model="form.journeyType"
            placeholder="select all/private/shared"
            class="c74-block-select"
          >
            <el-option label="All" value="all"></el-option>
            <el-option label="Private" value="private"></el-option>
            <el-option label="Shared" value="shared"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Priority" prop="priority">
          <el-input-number
            v-model="form.priority"
            :min="1"
            :max="10"
          ></el-input-number>
        </el-form-item>
        <el-tooltip class="item" effect="dark" placement="top">
          <div slot="content">
            The higher the priority, the more priority this pricing rule
            <br />will have with regards to other pricing rules.
          </div>
          <div class="c74-form-help">TIP: What is priority?</div>
        </el-tooltip>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-row>
          <el-switch
          v-model="form.isPlaceGroupFrom"
          active-text="Group"
          inactive-text="Place"
          @change="handleIsPlaceGroupFromChange"
          ></el-switch>
        </el-row>
        <el-row v-if="form.isPlaceGroupFrom === true">
          <el-form-item label="From Group">
            <el-select
              v-model="form.fromPlaceGroupId"
              placeholder="select"
              filterable
              clearable
              default-first-option
              @change="handleCheckRouteIsViable"
              class="c74-block-select"
            >
              <el-option
                v-for="placeGroup in allPlaceGroups"
                :key="placeGroup.id"
                :label="placeGroup.name"
                :value="placeGroup.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-row>
        <el-row v-else>
        <el-form-item label="From" prop="from">
          <el-select
            v-model="form.fromPlaceId"
            placeholder="select"
            filterable
            clearable
            default-first-option
            @change="handleCheckRouteIsViable"
            class="c74-block-select"
          >
            <el-option
              v-for="place in getPlacesList(form.fromPlaceId)"
              :key="place.id"
              :label="place.name"
              :value="place.id"
            ></el-option>
          </el-select>
        </el-form-item>
        </el-row>
      </el-col>
      <el-col :span="12">
        <el-row>
          <el-switch
          v-model="form.isPlaceGroupTo"
          active-text="Group"
          inactive-text="Place"
          @change="handleIsPlaceGroupToChange"          
          ></el-switch>
        </el-row>
        <el-row v-if="form.isPlaceGroupTo === true">
          <el-form-item label="To Group">
            <el-select
              v-model="form.toPlaceGroupId"
              placeholder="select"
              filterable
              clearable
              default-first-option
              @change="handleCheckRouteIsViable"
              class="c74-block-select"
            >
              <el-option
                v-for="placeGroup in allPlaceGroups"
                :key="placeGroup.id"
                :label="placeGroup.name"
                :value="placeGroup.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-row>
        <el-row v-else>
        <el-form-item label="To" prop="to">
          <el-select
            v-model="form.toPlaceId"
            placeholder="select"
            filterable
            clearable
            default-first-option
            @change="handleCheckRouteIsViable"
            class="c74-block-select"
          >
            <el-option
              v-for="place in getPlacesList(form.toPlaceId)"
              :key="place.id"
              :label="place.name"
              :value="place.id"
            ></el-option>
          </el-select>
        </el-form-item>
        </el-row>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-6">
      <el-col :span="24">
        <p>
          Marking the priving rule as bidirectional means that this pricing rule
          will be matched for the same destinations in BOTH directions
        </p>
        <el-switch
          v-model="form.bidirectional"
          active-text="Bidirectional"
          inactive-text="One Way"
        ></el-switch>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-6">
      <el-col :span="24">
        <p>
          Marking the rule as archived will not affect any existing bookings but
          it will prevent it being displayed for future booking enquiries.
        </p>
        <el-switch
          v-model="form.active"
          active-text="Active"
          inactive-text="Archived"
        ></el-switch>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-6">
      <el-col :span="24">
        <p>
          If you select 'Instant Payment', clients will be able to make
          immediate payments online. Selecting 'Enquiry Only' will not allow the
          client to continue to payment.
        </p>
        <el-switch
          v-model="form.instantPaymentAllowed"
          active-text="Instant Payment"
          inactive-text="Enquiry Only"
        ></el-switch>
      </el-col>
    </el-row>
  </el-form>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import {
  isFromAndToABookableRoute,
  isFromAndToDifferentPlaces
} from "@/statics/shared/functions.js";

export default {
  props: {
    form: {
      required: true,
    },
    isEditing: {
      required: true,
      type: Boolean
    }
  },
  data() {
    return {
      formValid :false,
      rules: {
        name: [
          {
            required: true,
            message: "Pricing Rule Name required",
            trigger: "change"
          }
        ],
        priority : [
          {
            required: true,
            trigger: "change",
            message: "Pricing Rule priority required",
          }
        ],
        journeyType: [
          {
            required: true,
            message: "Transfer type is required",
            trigger: "change"
          }
        ],
      }
    }
  },
  created() {
    if (this.allActivePlaces.length === 0) {
      // try re-initialising allActivePlaces
      console.log("allActivePlaces is empty, calling store method to reInit");
      this.$store.dispatch("places/initPlaces");
    }

    if (this.allRoutes.length === 0) {
      // try re-initialising allRoutes
      console.log("allRoutes is empty, calling store method to reInit");
      this.$store.dispatch("routes/initRoutes");
    }

    if (this.allPlaceGroups.length === 0) {
      this.$store.dispatch("placeGroups/initPlaceGroups");
    }
  },
  computed: {
    ...mapGetters("places", {
      allActivePlaces: "getAllActivePlaces"
    }),
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    }),
    ...mapGetters("routes", {
      allRoutes: "getAllRoutes"
    }),
    ...mapGetters("placeGroups", {
      allPlaceGroups: "getAllPlaceGroups"
    })
  },

  methods: {
    isValidForm() {
      this.$refs["pricingForm1"].validate(valid => {
        if (valid) {
          this.formValid = true;
        } else {
          this.formValid = false;
        }
      });
      return this.formValid;
    },
    handleCheckRouteIsViable() {

      if(this.form.isPlaceGroupFrom === true && this.form.isPlaceGroupTo === true) {
        if (
          !isFromAndToDifferentPlaces(this.form.fromPlaceGroupId, this.form.toPlaceGroupId)
        ) {
          this.$message({
            message: "Heads up! You can't set the from and to place groups the same.",
            type: "warning"
          });
        }
      }
      else if(this.form.isPlaceGroupFrom !== true && this.form.isPlaceGroupTo !== true) {

      if (
        !isFromAndToDifferentPlaces(this.form.fromPlaceId, this.form.toPlaceId)
      ) {
        this.$message({
          message: "Heads up! You can't set the from and to as the same place.",
          type: "warning"
        });
      } else {

        let matchedRoute = isFromAndToABookableRoute(
            this.form.fromPlaceId,
            this.form.toPlaceId,
            this.allActivePlaces,
            this.allRoutes
          );

        if (matchedRoute !== null) {
          this.$message({
            message:
              "Great! The chosen route is a valid route that can be booked by a client.",
            type: "success"
          });
        } else {
          this.$message({
            message:
              "Heads up! This route has not been defined as a route that clients can book.",
            type: "warning"
          });
        }
      }
      }
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
    findPlace(placeId) {
        if(placeId && placeId !== null && placeId !== '') {
          return this.allActivePlaces.find(place => place.id === placeId);
        }
        return null;
    },
    handleIsPlaceGroupFromChange() {
      if(this.form.isPlaceGroupFrom === true) {
        this.form.fromPlaceId = "";
      }
      else if(this.form.isPlaceGroupFrom === false) {
        this.form.fromPlaceGroupId = "";
      }
    },
    handleIsPlaceGroupToChange() {
      if(this.form.isPlaceGroupTo === true) {
        this.form.toPlaceId = "";
      }
      else if(this.form.isPlaceGroupTo === false) {
        this.form.toPlaceGroupId = "";
      }      
    }
  }
};
</script>

<style lang="scss" scoped>
.c74-block-select {
  display: block;
}
</style>
