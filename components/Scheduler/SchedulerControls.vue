<template>
  <div>
    <el-radio-group v-model="mode" size="small" @change="handleChangeMode">
      <el-radio-button label="Edit"></el-radio-button>
      <el-radio-button label="View"></el-radio-button>
    </el-radio-group>

    <el-radio-group
      v-model="daysDuration"
      size="small"
      @change="handleChangeDaysDuration"
    >
      <el-radio-button label="Day"></el-radio-button>
      <el-radio-button label="Week"></el-radio-button>
    </el-radio-group>

    <el-radio-group
      v-model="cellDuration"
      size="small"
      @change="handleChangeCellDuration"
    >
      <el-radio-button label="15"></el-radio-button>
      <el-radio-button label="30"></el-radio-button>
      <el-radio-button label="60"></el-radio-button>
    </el-radio-group>
  </div>
</template>

<script>
import { DayPilot } from "daypilot-pro-vue";

export default {
  data() {
    return {
      mode: "Edit",
      daysDuration: "Day",
      cellDuration: 15
    };
  },

  methods: {
    handleChangeMode() {
      this.$emit("change-mode", this.mode);
    },
    handleChangeCellDuration() {
      this.$emit("change-cell-duration", this.cellDuration);
    },
    handleChangeDaysDuration() {
      switch (this.daysDuration) {
        case "Day":
          this.$emit("change-days-duration", 1);
          break;
        case "Week":
          this.$emit("change-days-duration", 7);
          break;
        case "Month":
          this.$emit(
            "change-days-duration",
            DayPilot.Date.today().daysInMonth()
          );
          break;
        default:
          this.$emit("change-days-duration", 1);
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
