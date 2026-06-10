<template>
  <div>
    <el-form ref="placingForm3" :model="placeForm" :rules="rules">    
    <el-row :gutter="64">
      <el-col :span="12">
        <el-switch v-model="placeForm.active" active-text="Active"></el-switch>
      </el-col>
    </el-row>
    <el-row :gutter="64" v-if="placeForm.active" style="margin-top: 36px">
      <el-col :span="12">
        <el-form-item label="Listing Order" prop="listingOrder">
          <el-input-number v-model="placeForm.listingOrder" :min="1" :max="10"></el-input-number>
        </el-form-item>
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
        listingOrder: [
          {
            required: true,
            message: "Lisitng order is required",
            trigger: "change"
          }
        ],        
      }
    }
  },
  methods:{
    isValidForm() {
      this.$refs["placingForm3"].validate(valid => {
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

<style lang="scss" scoped></style>
