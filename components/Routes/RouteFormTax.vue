<template>
  <div>
    <el-form ref="routeFormTax" :model="routeForm" :rules="rules">
    <el-row :gutter="64">
      <el-col :span="12">
        <el-form-item
          label="Additional taxable zone/country?"
          prop="secondaryTVARateApplies"
        >
          <el-switch
            v-model="routeForm.secondaryTVARateApplies"
            active-text="Yes"
          ></el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          label="Distance in km"
          prop="secondaryTVARateAllocation"
          v-if="routeForm.secondaryTVARateApplies"
        >
          <el-input-number
            placeholder="distance (km)"
            :min="1"
            v-model="routeForm.secondaryTVARateAllocation"
          ></el-input-number>
          <p class="mt-4 text-sm leading-6 text-gray-600">
            Enter the number of kilometres covered in the second country.
          </p>
        </el-form-item>
      </el-col>
    </el-row>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    routeForm: {
      required: true
    }
  },
  data() {
    return {
      formValid :false,
      rules: {
        secondaryTVARateAllocation: [
          {
            required: true,
            message: "TVA Rate Allocation is required",
            trigger: "change"
          }
        ],        
      }
    }
  },
  methods:{
    isValidForm() {
      this.$refs["routeFormTax"].validate(valid => {
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
