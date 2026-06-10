<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="24">
        <QuoteDateRestrictionTip
          :quoteDateTimeFrom="form.quoteDateTimeFrom"
          :quoteDateTimeTo="form.quoteDateTimeTo"
        />
      </el-col>
    </el-row>
    <el-row :gutter="20" class="mt-6">
      <el-col :span="24">
        <el-form-item label="Start date & time">
          <el-date-picker
            v-model="form.quoteDateTimeFrom"
            type="datetime"
            placeholder="from"
            format="dd MMM yyyy HH:mm"
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="End date & time">
          <el-date-picker
            v-model="form.quoteDateTimeTo"
            type="datetime"
            placeholder="from"
            format="dd MMM yyyy HH:mm"
            value-format="timestamp"
          ></el-date-picker>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import QuoteDateRestrictionTip from "@/components/Pricing/QuoteDateRestrictionTip";

export default {
  components: {
    QuoteDateRestrictionTip
  },
  props: {
    form: {
      required: true
    }
  }
};
</script>

<style scoped></style>
