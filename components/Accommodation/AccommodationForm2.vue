<template>
  <el-row :gutter="64">
    <el-col :span="12">
      <el-form-item label="Address">
        <el-input
          type="textarea"
          v-model="accommodationForm.address"
          :autosize="{ minRows: 2, maxRows: 6}"
        ></el-input>
      </el-form-item>
    </el-col>
    <el-col :span="12">
      <el-form-item label="Directions">
        <el-input
          type="textarea"
          v-model="accommodationForm.directions"
          :autosize="{ minRows: 2, maxRows: 6}"
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
