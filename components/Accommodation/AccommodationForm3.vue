<template>
  <el-row :gutter="64">
    <el-col :span="12"
      ><el-form-item label="Telephone Number">
        <el-input
          placeholder="Enter telephone number"
          v-model="accommodationForm.telNum"
        ></el-input>
      </el-form-item>
      <el-form-item label="Mobile Number">
        <el-input
          placeholder="Enter telephone number"
          v-model="accommodationForm.mobileNum"
        ></el-input> </el-form-item
    ></el-col>
    <el-col :span="12"
      ><el-form-item label="Email Address">
        <el-input
          placeholder="Enter email address"
          v-model="accommodationForm.email"
        ></el-input> </el-form-item></el-col
  ></el-row>
</template>

<script>
export default {
  props: {
    accommodationForm: {
      required: true
    }
  }
};
</script>

<style lang="scss" scoped></style>
