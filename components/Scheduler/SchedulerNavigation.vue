<template>
  <div>
    <el-date-picker
      v-model="selectedDate"
      type="date"
      placeholder="Pick a day"
      size="small"
      format="dd MMM yyyy"
      value-format="yyyy-MM-dd"
      @change="handleDateChange"
    >
    </el-date-picker>
    <el-button type="primary" @click="onMoveToToday" size="small"
      >Today</el-button
    >
    <el-button-group>
      <el-button
        type="primary"
        @click="onMoveToPreviousDay"
        icon="el-icon-arrow-left"
        size="small"
      ></el-button>
      <el-button
        type="primary"
        @click="onMoveToNextDay"
        icon="el-icon-arrow-right"
        size="small"
      ></el-button>
    </el-button-group>
  </div>
</template>

<script>
export default {
  props: {
    currentDate: ""
  },

  data() {
    return {
      selectedDate: ""
    };
  },

  watch: {
    currentDate: function(val) {
      this.selectedDate = this.currentDate;
    }
  },

  methods: {
    handleDateChange() {
      console.log(this.selectedDate);
      this.$emit("date-changed", this.selectedDate);
    },
    onMoveToToday() {
      this.$emit("date-moved", "TODAY");
    },
    onMoveToPreviousDay() {
      this.$emit("date-moved", "PREVIOUS");
    },
    onMoveToNextDay() {
      this.$emit("date-moved", "NEXT");
    }
  }
};
</script>

<style lang="scss" scoped></style>
