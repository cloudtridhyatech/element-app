<template>
  <el-form
    ref="editableSettingsForm"
    v-loading="loading"
    label-position="top"
    :model="editableSettingsForm"
  >
    <el-row :gutter="20">
      <el-col>
        <el-form-item label="Email From Address" prop="emailFromAddress">
          <el-input
            placeholder="Enter email"
            v-model="editableSettingsForm.emailFromAddress"
          ></el-input>
          <p class="text-xs text-gray-600  mt-2 leading-snug">
            The email address should match the verified email address in
            SendGrid.
          </p>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <el-form-item
          label="Email Payment Link base Uri"
          prop="emailPaymentLinkBaseUri"
        >
          <el-input
            placeholder="e.g. https://mytransferwebsite.com/start"
            v-model="editableSettingsForm.emailPaymentLinkBaseUri"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col class="mt-6">
        <el-divider content-position="left">Booking Enquiry</el-divider>
        <p class="text-sm font-semibold mb-4">
          These values are used when an email is sent for a new booking that is
          an enquiry (cannot be paid in advance).
        </p>
        <el-form-item label="Email Subject" prop="emailTitleEnquiryBooking">
          <el-input
            placeholder="Transfer Booking Enquiry Received"
            v-model="editableSettingsForm.emailTitleEnquiryBooking"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <el-form-item label="Email Copy" prop="emailCopyEnquiryBooking">
          <el-input
            type="textarea"
            placeholder="Thank you for your transfer booking enquiry.  We shall respond to your enquiry in the next 48 hours."
            rows="3"
            v-model="editableSettingsForm.emailCopyEnquiryBooking"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col class="mt-6">
        <el-divider content-position="left"
          >Booking Confirmed with Payment</el-divider
        >
        <p class="text-sm font-semibold mb-4">
          These values are used when an email is sent for a new booking that has
          been paid online.
        </p>
        <el-form-item label="Email Subject" prop="emailTitleNewBooking">
          <el-input
            placeholder="Transfer Booking Confirmed"
            v-model="editableSettingsForm.emailTitleNewBooking"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <el-form-item label="Email Copy" prop="emailCopyNewBooking">
          <el-input
            type="textarea"
            placeholder="We confirm that your transfer booking has been received."
            rows="3"
            v-model="editableSettingsForm.emailCopyNewBooking"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col class="mt-6">
        <el-divider content-position="left">Booking Modified</el-divider>
        <p class="text-sm font-semibold mb-4">
          These values are used when an email is sent as a result of a booking
          modification.
        </p>
        <el-form-item label="Email Subject" prop="emailTitleModifiedBooking">
          <el-input
            placeholder="Transfer Booking Updated"
            v-model="editableSettingsForm.emailTitleModifiedBooking"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <el-form-item label="Email Copy" prop="emailCopyModifiedBooking">
          <el-input
            type="textarea"
            placeholder="Your transfer booking has been recently updated and the new details are shown directly below."
            rows="3"
            v-model="editableSettingsForm.emailCopyModifiedBooking"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col class="mt-6">
        <el-divider content-position="left">Resend Booking</el-divider>
        <p class="text-sm font-semibold mb-4">
          These values are used when a booking confirmation is resent.
        </p>
        <el-form-item label="Email Subject" prop="emailTitleResendBooking">
          <el-input
            placeholder="Transfer Booking Confirmation (Duplicate)"
            v-model="editableSettingsForm.emailTitleResendBooking"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <el-form-item label="Email Copy" prop="emailCopyResendBooking">
          <el-input
            type="textarea"
            placeholder="Please find below a copy of your transfer booking with us.  You may be receiving this having recently requested a copy."
            rows="3"
            v-model="editableSettingsForm.emailCopyResendBooking"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col class="mt-6">
        <el-divider content-position="left">Payment Link</el-divider>
        <p class="text-sm font-semibold mb-4">
          These values are used when a payment link is sent via email.
        </p>
        <el-form-item label="Email Subject" prop="emailTitlePaymentLink">
          <el-input
            placeholder="Transfer Booking Payment Link"
            v-model="editableSettingsForm.emailTitlePaymentLink"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <el-form-item label="Email Copy" prop="emailCopyPaymentLink">
          <el-input
            type="textarea"
            placeholder="Your transfer(s) has now been scheduled.  Please use the payment link below to complete the payment."
            rows="3"
            v-model="editableSettingsForm.emailCopyPaymentLink"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col class="mt-6">
        <el-divider content-position="left">Payment Confirmation</el-divider>
        <p class="text-sm font-semibold mb-4">
          These values are used when a payment confirmation is sent by email
          (which may be sent in addition to other emails).
        </p>
        <el-form-item
          label="Email Subject"
          prop="emailTitlePaymentConfirmation"
        >
          <el-input
            placeholder="Transfer Booking Paid"
            v-model="editableSettingsForm.emailTitlePaymentConfirmation"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <el-form-item label="Email Copy" prop="emailCopyPaymentConfirmation">
          <el-input
            type="textarea"
            placeholder="Thank you for paying for your recent transfer booking.  The full details of your scheduled transfers are below."
            rows="3"
            v-model="editableSettingsForm.emailCopyPaymentConfirmation"
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
    editableSettingsForm: {
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
