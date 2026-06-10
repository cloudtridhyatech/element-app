<template>
  <div>
    <el-row :gutter="20">
      <el-form
        ref="journeyForm"
        :model="journeyForm"
        :label-position="labelPosition"
        :disabled="true"
      >
        <el-col :span="24">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="From">
                <el-input
                  v-model="journeyForm.fromPlaceName"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="To">
                <el-input
                  v-model="journeyForm.toPlaceName"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Num Passengers">
                <el-input-number
                  v-model="journeyForm.journey.numPassengers"
                  :min="1"
                  :max="30"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Pick up time">
                <el-date-picker
                  v-model="journeyForm.journey.pickUpDateTimeLocal"
                  type="datetime"
                  placeholder="pick up time"
                  format="dd MMM yyyy HH:mm"
                  :value-format=mixinDateTimeValueFormat
                ></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-form>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: {
    journey: {
      required: true
    },
    transferObject: {
      required: true
    }
  },
  computed: {
    ...mapGetters("places", {
      allActivePlaces: "getAllActivePlaces"
    }),
  },  
  async created() {
    this.journeyForm.journey = this.journey;
    this.journeyForm.transferObject = this.transferObject;

    if (this.allActivePlaces.length === 0) {
      this.$store.dispatch("places/initPlaces").then(() => {
          this.setTransitPoints();
      });
    }else {
        this.setTransitPoints();
    }
  },
  data() {
    return {
      journeyForm: {
        journey:{},
        transferObject:{},
        fromPlaceName: "",
        toPlaceName: ""
      },
      // position of labels in the display of form, valid values are 'top', 'left', 'right'
      labelPosition: "top",
    };
  },
  methods : {
      setTransitPoints(){
          let transferObject = this.transferObject;

          const foundFromPlace = this.allActivePlaces.find(place => place.id === transferObject.fromPlaceId);
          if(foundFromPlace) {
            this.journeyForm.fromPlaceName = foundFromPlace.name;
          }
          const foundToPlace = this.allActivePlaces.find(place => place.id === transferObject.toPlaceId);
          if(foundToPlace) {
            this.journeyForm.toPlaceName = foundToPlace.name;
          }

      }
  }
}
</script>

<style lang="scss" scoped>

</style>