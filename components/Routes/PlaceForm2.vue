<template>
  <div>
    <el-form ref="placingForm2" :model="placeForm" :rules="rules">
    <el-row :gutter="64">
      <el-col :span="12">
        <el-switch
          v-model="placeForm.isTransitPoint"
          active-text="Transit Point (Plane, bus, train etc)."
        ></el-switch>
      </el-col>
    </el-row>
    <el-row
      :gutter="64"
      v-if="placeForm.isTransitPoint"
      style="margin-top: 36px"
    >
      <el-col :span="12">
        <el-form-item label="Pickup delay arrival time (minutes)" prop="transitPointPickUpDelay">
          <el-input-number
            placeholder="Enter expected delay for picking up on arrival"
            v-model="placeForm.transitPointPickUpDelay"
            :step="15"
            :min="0"
          ></el-input-number>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-tooltip
          class="item"
          effect="dark"
          content="This duration + Route transit time = Suggested pick up time (minutes)"
          placement="right"
        >  
          <el-form-item label="Check in duration prior to departure time (minutes)" prop="transitPointCheckInTime">
          
            <el-input-number
              placeholder="Enter minimum check in duration (minutes)"
              v-model="placeForm.transitPointCheckInTime"
              :step="15"
              :min="0"
            ></el-input-number>
          </el-form-item>
        </el-tooltip>        
      </el-col>
    </el-row>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    placeForm: {
      required: true
    }
  },
  data() {
    return {
      formValid :false,
      rules: {
        transitPointPickUpDelay: [
          {
            required: true,
            message: "Transit point pick up delay is required",
            trigger: "change"
          }
        ],
        transitPointCheckInTime : [
          {
            required: true,
            trigger: "change",
            message: "Transit point check in time is required",
          }
        ],        
      }
    }
  },
  methods:{
    isValidForm() {
      this.$refs["placingForm2"].validate(valid => {
        if (valid) {
          this.formValid = true;
        } else {
          this.formValid = false;
        }
      });
      return this.formValid;
    }
  }  
};
</script>
