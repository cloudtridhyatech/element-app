<template>
  <el-form ref="sgMailSettingsForm" v-loading="loading" :model="sgMail">
    <el-row>
      <el-col>
        <el-form-item label="API Key" prop="sendmailApiKey">
          <el-input
            placeholder="API Key"
            v-model="sgMail.sendmailApiKey"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <el-form-item
          label="New Booking Email template Id"
          prop="newBookingEmailTemplateId"
        >
          <el-input
            placeholder="Template Id"
            v-model="sgMail.newBookingEmailTemplateId"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <el-form-item
          label="Booking Enquiry Email template Id"
          prop="enquiryBookingEmailTemplateId"
        >
          <el-input
            placeholder="Template Id"
            v-model="sgMail.enquiryBookingEmailTemplateId"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <el-form-item
          label="Modified Booking Email template Id"
          prop="modifiedBookingEmailTemplateId"
        >
          <el-input
            placeholder="Template Id"
            v-model="sgMail.modifiedBookingEmailTemplateId"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <el-form-item
          label="Resend Booking Email template Id"
          prop="resendBookingEmailTemplateId"
        >
          <el-input
            placeholder="Template Id"
            v-model="sgMail.resendBookingEmailTemplateId"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <el-form-item
          label="Payment Link Email template Id"
          prop="paymentLinkEmailTemplateId"
        >
          <el-input
            placeholder="Template Id"
            v-model="sgMail.paymentLinkEmailTemplateId"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <el-form-item
          label="Payment Confirmation Email template Id"
          prop="paymentConfirmationEmailTemplateId"
        >
          <el-input
            placeholder="Template Id"
            v-model="sgMail.paymentConfirmationEmailTemplateId"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
export default {
  created() {},
  props: {
    sgMail: {
      type: Object,
      required: true
    },
    loading: true
  },
  data() {
    return {};
  }
};
</script>
