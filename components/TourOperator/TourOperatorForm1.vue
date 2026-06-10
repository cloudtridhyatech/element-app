<template>
  <div>
    <el-row :gutter="64">
      <el-col :span="12">
        <el-form-item label="Tour Operator Name" prop="name">
          <el-input placeholder="Enter tour operator name" v-model="tourOperatorForm.name"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="64">
      <el-col :span="12">
        <p>Marking the tour operator as archived will hide it from the active list of tour operators but will not affect the behaviour or appearance of any active accommodations assigned to it.</p>
        <el-switch v-model="tourOperatorForm.active" active-text="Active" inactive-text="Archived"></el-switch>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props: {
    tourOperatorForm: {
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped></style>
