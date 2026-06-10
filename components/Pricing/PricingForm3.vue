<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="24">
        <date-restriction-tip
          :availableDateRange="transientForm.availableDateRange"
          :availableTimeRange="transientForm.availableTimeRange"
          :availableDaysOfWeekSelected="mixinConvertArrayOfDayKeysToLabelsArray(availableDaysOfWeekSelected)"
        />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-6">
      <el-col :span="24">
        <el-form-item label="Valid between dates">
          <el-date-picker
            v-model="transientForm.availableDateRange"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            format="dd MMM"
          ></el-date-picker>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="Valid from and until">
          <el-time-picker
            is-range
            v-model="transientForm.availableTimeRange"
            range-separator="To"
            start-placeholder="Start time"
            end-placeholder="End time"
            format="HH:mm"
          ></el-time-picker>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="Days of the week">
          <el-checkbox-group
            v-model="availableDaysOfWeekSelected"
            @change="handleChangeCheckboxGroup"
          >
            <el-checkbox
              v-for="role in this.daysOfWeekOptions"
              :label="role.isoWeekday"
              :key="role.key"
              >{{ role.label }}</el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import DateRestrictionTip from "@/components/Pricing/DateRestrictionTip";
import { priceUtilsMixin } from "@/statics/pricing/functions.js";

export default {
  components: {
    DateRestrictionTip
  },
  mixins: [priceUtilsMixin],
  props: {
    form: {
      required: true
    },
    transientForm: {
      required: true
    }
  },

  watch: {
    form: function(value, oldValue) {
      if (value.availableDaysOfWeek) {
        this.availableDaysOfWeekSelected = value.availableDaysOfWeek;
      } else {
        this.availableDaysOfWeekSelected = [];
      }
    }
  },

  methods: {
    // having to jump through hoops because of a bug in element component https://element.eleme.io/#/en-US/component/checkbox
    // it cannot be supplied an array in the form userForm.roles, it must be a top level data element instead so using this as a workaround
    handleChangeCheckboxGroup() {
      this.$emit("update-days-of-week", this.availableDaysOfWeekSelected);
    }
  },

  data() {
    return {
      availableDaysOfWeekSelected: [],
      daysOfWeekOptions: process.env.daysOfWeekOptions
    };
  }
};
</script>

<style scoped>
.el-checkbox {
  margin-right: 8px;
}
</style>
