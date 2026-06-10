<template>
  <div>
    <el-row :gutter="64">
      <el-col :span="24">
        <el-switch
          v-model="form.displayNoticeUponQuoteDelivery"
          active-text="Display Notice Upon Quote Delivery"
          inactive-text="No Notice"
        ></el-switch>

        <el-form-item
          label="Notice upon quote delivery"
          v-if="form.displayNoticeUponQuoteDelivery"
        >
          <el-input
            type="textarea"
            v-model="form.noticeUponQuoteDeliveryns"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row class="mt-6">
      <el-col :span="24">
        <el-switch
          v-model="form.displayTnCUponQuoteDelivery"
          active-text="Display Terms Upon Quote Delivery"
          inactive-text="No Terms"
        ></el-switch>

        <el-form-item
          label="Terms and conditions upon quote delivery"
          v-if="form.displayTnCUponQuoteDelivery"
        >
          <el-input
            type="textarea"
            v-model="form.termsAndConditions"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props: {
    form: {
      required: true
    }
  }
};
</script>

<style scoped></style>
