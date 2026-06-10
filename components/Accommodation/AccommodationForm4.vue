<template>
  <el-row :gutter="64">
    <el-col :span="12">
      <el-form-item label="Internal Notes">
        <el-input
          type="textarea"
          v-model="accommodationForm.internalNotes"
          :autosize="{ minRows: 2, maxRows: 6}"
        ></el-input>
      </el-form-item>
    </el-col>
    <el-col :span="12">
      <el-form-item label="Client Notes">
        <el-input
          type="textarea"
          v-model="accommodationForm.clientNotes"
          :autosize="{ minRows: 2, maxRows: 6}"
        ></el-input>
      </el-form-item>
    </el-col>
  </el-row>
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
