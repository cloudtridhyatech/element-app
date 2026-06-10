<template>
  <div>
    <el-row :gutter="64">
      <el-col :span="12">
        <el-form-item label="Location" prop="placeId">
          <el-select v-model="vehicleForm.placeId" clearable placeholder="select location">
            <el-option
              v-for="place in allPlaces"
              :key="place.id"
              :label="place.name"
              :value="place.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Vehicle Name" prop="name">
          <el-input placeholder="Enter vehicle name e.g. Renault Traffic" v-model="vehicleForm.name"></el-input>
        </el-form-item>

        <el-form-item label="Capacity" prop="capacity">
          <el-input-number v-model="vehicleForm.capacity" :min="1" :max="100"></el-input-number>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="64">
      <el-col :span="12">
        <p>Marking the vehicle as archived will not affect any existing schedules but it will stop it being scheduled in the future.</p>
        <el-switch v-model="vehicleForm.active" active-text="Active" inactive-text="Archived"></el-switch>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: {
    vehicleForm: {
      required: true,
    },
  },

  computed: {
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    }),     
  },

  created() {
    if (this.allPlaces.length === 0) {
      // try re-initialising allAcitvePlace
      console.log("allPlaces is empty, calling store method to reInit");
      this.$store.dispatch("places/initPlaces");
    }
  },
};
</script>

<style lang="scss" scoped></style>
