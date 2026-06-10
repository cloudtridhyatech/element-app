<template>
  <el-row :gutter="12" class="c74-row">
    <el-col :span="8" class="c74-avatar">
      <el-button
        :type="selectedButton === 'yesterday' ? 'primary' : ''"
        @click="onMoveToPreviousDay"
        size="medium"
        >Yesterday</el-button
      >
    </el-col>
    <el-col :span="8" class="c74-avatar">
      <el-button
        :type="selectedButton === 'today' ? 'primary' : ''"
        @click="onMoveToToday"
        size="medium"
        >Today</el-button
      >
    </el-col>
    <el-col :span="8" class="c74-avatar">
      <el-button
        :type="selectedButton === 'tomorrow' ? 'primary' : ''"
        @click="onMoveToNextDay"
        size="medium"
        >Tomorrow</el-button
      >
    </el-col>
  </el-row>
</template>

<script>
export default {
  props: {
    currentDate: ""
  },

  data() {
    return {
      selectedDate: "",
      selectedButton: "today"
    };
  },

  methods: {
    onMoveToToday() {
      this.selectedButton = "today";
      this.$emit("date-moved", "TODAY");
    },
    onMoveToPreviousDay() {
      this.selectedButton = "yesterday";
      this.$emit("date-moved", "PREVIOUS");
    },
    onMoveToNextDay() {
      this.selectedButton = "tomorrow";
      this.$emit("date-moved", "NEXT");
    }
  }
};
</script>

<style lang="scss" scoped>
.c74-row {
  margin: 16px 0px;
}
.el-button {
  text-transform: uppercase;
  width: 100%;
  font-size: 0.7rem;
}

.driver-ui-radio-group {
  text-transform: uppercase;
}
</style>
