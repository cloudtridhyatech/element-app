<template>
  <el-card>
    <div slot="header" class>Filter the journies</div>
    <el-date-picker
      v-model="dateValue"
      type="date"
      placeholder="On or after"
      format="dd MMM yyyy"
      :clearable="false"
      @change="handleDateChanged"
    ></el-date-picker>

    <el-select v-model="statusValue" placeholder="Status" clearable @change="handleStatusChanged()">
      <el-option
        v-for="item in statusOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      ></el-option>
    </el-select>

    <el-select
      v-model="journeyTypeValue"
      placeholder="Type"
      clearable
      @change="handleJourneyTypeChanged"
    >
      <el-option
        v-for="item in journeyTypeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      ></el-option>
    </el-select>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      statusOptions: [
        {
          value: "enquiry",
          label: "Enquiry",
        },
        {
          value: "confirmed",
          label: "Confirmed",
        },
        {
          value: "scheduled",
          label: "Scheduled",
        },
        {
          value: "cancelled",
          label: "Cancelled",
        },
      ],
      statusValue: "",

      journeyTypeOptions: [
        {
          value: "private",
          label: "Private",
        },
        {
          value: "shared",
          label: "Shared",
        },
      ],
      journeyTypeValue: "",

      dateValue: new Date(),
    };
  },

  methods: {
    handleDateChanged() {
      this.$emit("date-changed", this.dateValue);
    },
    handleStatusChanged() {
      this.$emit("status-changed", this.statusValue);
    },
    handleJourneyTypeChanged() {
      this.$emit("journey-type-changed", this.journeyTypeValue);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
