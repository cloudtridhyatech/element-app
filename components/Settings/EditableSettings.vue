<template>
  <div>
    <section>
      <div class="bg-gray-100 mt-6">
        <!-- TODO: We have forms inside of forms here so should correct it. -->
        <el-form
          ref="editableSettingsForm"
          label-position="top"
          :model="editableSettingsForm"
          :rules="rules"
          v-loading="loading"
          label-width="120px"
          size="medium"
        >
          <div
            class="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8 border border-1 rounded-lg"
          >
            <!-- EMAIL SETTINGS -->
            <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Email Settings
                    </h3>
                    <p class="mt-1 text-sm text-gray-600"></p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <EmailSettings
                      :editableSettingsForm="editableSettingsForm"
                      :loading="loading"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div>

            <!-- SEND GRID SETTINGS -->
            <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      SendGrid Settings
                    </h3>
                    <p class="mt-1 text-sm text-gray-600"></p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <SendGridSettings
                      :sgMail="editableSettingsForm.sgMail"
                      :loading="loading"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div>

            <!-- TVA SETTINGS -->
            <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      TVA Settings
                    </h3>
                    <p class="mt-1 text-sm text-gray-600"></p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <el-row>
                      <el-col>
                        <el-form-item
                          label="Primary TVA Rate %"
                          prop="primaryTVARate"
                        >
                          <el-tooltip
                            class="item"
                            effect="dark"
                            content="Usually the rate applicable to the all or the major part of the transfer e.g. FR"
                            placement="right"
                          >
                            <el-input-number
                              placeholder="e.g. 10"
                              v-model="editableSettingsForm.primaryTVARate"
                              :precision="2"
                              :step="0.1"
                              :max="98"
                            ></el-input-number>
                          </el-tooltip>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row>
                      <el-col>
                        <el-form-item
                          label="Secondary TVA Rate Enabled"
                          prop="secondaryTVARateEnabled"
                        >
                          <el-switch
                            v-model="
                              editableSettingsForm.secondaryTVARateEnabled
                            "
                            active-text="Yes"
                          ></el-switch>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <div v-if="editableSettingsForm.secondaryTVARateEnabled">
                      <el-row>
                        <el-col>
                          <el-form-item
                            label="Secondary TVA Rate %"
                            prop="secondaryTVARate"
                          >
                            <el-tooltip
                              class="item"
                              effect="dark"
                              content="Usually an optional rate applicable to the minor part of a split transfer rate e.g. CH"
                              placement="right"
                            >
                              <el-input-number
                                placeholder="e.g. 10"
                                v-model="editableSettingsForm.secondaryTVARate"
                                :precision="2"
                                :step="0.1"
                                :max="99"
                              ></el-input-number>
                            </el-tooltip>
                          </el-form-item>
                        </el-col>
                      </el-row>

                      <el-row>
                        <el-col>
                          <el-form-item
                            label="Secondary TVA Rate Invoice Description"
                            prop="secondaryTVARateDescription"
                          >
                            <el-tooltip
                              class="item"
                              effect="dark"
                              content="This text will be used as part of the invoice description"
                              placement="right"
                            >
                              <el-input
                                placeholder="Transfer section in another country"
                                v-model="
                                  editableSettingsForm.secondaryTVARateDescription
                                "
                              ></el-input>
                            </el-tooltip>
                          </el-form-item>
                        </el-col>
                      </el-row>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div>

            <!-- BOOKING SETTINGS -->
            <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Booking Settings
                    </h3>
                    <p class="mt-1 text-sm text-gray-600"></p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <el-row>
                      <el-col>
                        <el-form-item
                          label="Booking/Enquiry TandCs link"
                          prop="tandcLink"
                        >
                          <el-input
                            placeholder="e.g. http://mysite/terms.html"
                            v-model="editableSettingsForm.tandcLink"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col>
                        <el-form-item
                          label="Booking/Enquiry Contact Phone Number"
                          prop="contactPhoneNumber"
                        >
                          <el-input
                            placeholder="e.g. +33 6 00 00 00 00"
                            v-model="editableSettingsForm.contactPhoneNumber"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col>
                        <el-form-item
                          label="Booking/Enquiry Contact Email address"
                          prop="contactEmail"
                        >
                          <el-input
                            placeholder="e.g. contact@mytransfercompany.com"
                            v-model="editableSettingsForm.contactEmail"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div>

            <!-- PAYMENT SETTINGS (conditional) -->
            <div class="mt-10 sm:mt-0" v-show="showPayments === true">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Payment Settings
                    </h3>
                    <p class="mt-1 text-sm text-gray-600"></p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <el-row>
                      <el-col>
                        <el-form-item
                          label="Payment Page Company Display Name"
                          prop="paymentCompanyName"
                        >
                          <el-input
                            placeholder="e.g. Acme Transfers Savoie S.A.R.L"
                            v-model="editableSettingsForm.paymentCompanyName"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div>

            <!-- <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Basic Information
                    </h3>
                    <p class="mt-1 text-sm text-gray-600"></p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    Empty Form
                  </div>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div> -->

            <div class="flex justify-end">
              <div>
                <el-button
                  type="primary"
                  @click="saveOrUpdate()"
                  icon="el-icon-download"
                  >Save Editable Settings</el-button
                >
                <el-button @click="handleCancel()" icon="el-icon-close"
                  >Cancel</el-button
                >
              </div>
            </div>
          </div>
        </el-form>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb } from "@/plugins/firebase.js";
import { getEditableSettingsRef } from "@/statics/settings/functions.js";
import EmailSettings from "@/components/Settings/EmailSettings";
import SendGridSettings from "@/components/Settings/SendGridSettings";

export default {
  components: {
    EmailSettings,
    SendGridSettings
  },
  name: "EditableSettings",
  created() {
    console.log("EditableSettings");
  },
  props: {
    editableSettings: {},
    loading: true,
    showPayments: false
  },
  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    })
  },
  watch: {
    // TODO Why are we loading form data inside a watch?
    editableSettings: function(value, oldValue) {
      let form = this.editableSettingsForm;

      if (!this.editableSettings) {
        return;
      }

      let sgMailSettings = this.editableSettings.sgMail;

      form.emailFromAddress = this.getSettingsTextValue(
        this.editableSettings.emailFromAddress
      );
      form.emailPaymentLinkBaseUri = this.getSettingsTextValue(
        this.editableSettings.emailPaymentLinkBaseUri
      );

      form.emailTitleNewBooking = this.getSettingsTextValue(
        this.editableSettings.emailTitleNewBooking
      );
      form.emailCopyNewBooking = this.getSettingsTextValue(
        this.editableSettings.emailCopyNewBooking
      );

      form.emailTitleModifiedBooking = this.getSettingsTextValue(
        this.editableSettings.emailTitleModifiedBooking
      );
      form.emailCopyModifiedBooking = this.getSettingsTextValue(
        this.editableSettings.emailCopyModifiedBooking
      );

      form.emailTitleResendBooking = this.getSettingsTextValue(
        this.editableSettings.emailTitleResendBooking
      );
      form.emailCopyResendBooking = this.getSettingsTextValue(
        this.editableSettings.emailCopyResendBooking
      );

      form.emailTitleEnquiryBooking = this.getSettingsTextValue(
        this.editableSettings.emailTitleEnquiryBooking
      );
      form.emailCopyEnquiryBooking = this.getSettingsTextValue(
        this.editableSettings.emailCopyEnquiryBooking
      );

      form.emailTitlePaymentConfirmation = this.getSettingsTextValue(
        this.editableSettings.emailTitlePaymentConfirmation
      );
      form.emailCopyPaymentConfirmation = this.getSettingsTextValue(
        this.editableSettings.emailCopyPaymentConfirmation
      );

      form.emailTitlePaymentLink = this.getSettingsTextValue(
        this.editableSettings.emailTitlePaymentLink
      );
      form.emailCopyPaymentLink = this.getSettingsTextValue(
        this.editableSettings.emailCopyPaymentLink
      );

      if (sgMailSettings) {
        form.sgMail.sendmailApiKey = this.getSettingsTextValue(
          sgMailSettings.sendmailApiKey
        );
        form.sgMail.newBookingEmailTemplateId = this.getSettingsTextValue(
          sgMailSettings.newBookingEmailTemplateId
        );
        form.sgMail.modifiedBookingEmailTemplateId = this.getSettingsTextValue(
          sgMailSettings.modifiedBookingEmailTemplateId
        );
        form.sgMail.resendBookingEmailTemplateId = this.getSettingsTextValue(
          sgMailSettings.resendBookingEmailTemplateId
        );
        form.sgMail.enquiryBookingEmailTemplateId = this.getSettingsTextValue(
          sgMailSettings.enquiryBookingEmailTemplateId
        );
        form.sgMail.paymentConfirmationEmailTemplateId = this.getSettingsTextValue(
          sgMailSettings.paymentConfirmationEmailTemplateId
        );
        form.sgMail.paymentLinkEmailTemplateId = this.getSettingsTextValue(
          sgMailSettings.paymentLinkEmailTemplateId
        );
      }
      form.secondaryTVARateEnabled =
        this.editableSettings.secondaryTVARateEnabled === true;
      form.primaryTVARate = this.getSettingsNumericValue(
        this.editableSettings.primaryTVARate
      );
      form.secondaryTVARate = this.getSettingsNumericValue(
        this.editableSettings.secondaryTVARate
      );
      form.secondaryTVARateDescription = this.getSettingsTextValue(
        this.editableSettings.secondaryTVARateDescription
      );
      form.tandcLink = this.getSettingsTextValue(
        this.editableSettings.tandcLink
      );
      form.paymentCompanyName = this.getSettingsTextValue(
        this.editableSettings.paymentCompanyName
      );
      form.contactPhoneNumber = this.getSettingsTextValue(
        this.editableSettings.contactPhoneNumber
      );
      form.contactEmail = this.getSettingsTextValue(
        this.editableSettings.contactEmail
      );
    }
  },
  data() {
    return {
      activeFormPanels: [],
      activeFormPanelsEmail: [],

      editableSettingsForm: {
        emailFromAddress: "",
        emailPaymentLinkBaseUri: "",

        emailTitleNewBooking: "",
        emailCopyNewBooking: "",

        emailTitleModifiedBooking: "",
        emailCopyModifiedBooking: "",

        emailTitleResendBooking: "",
        emailCopyResendBooking: "",

        emailTitleEnquiryBooking: "",
        emailCopyEnquiryBooking: "",

        emailTitlePaymentConfirmation: "",
        emailCopyPaymentConfirmation: "",

        emailTitlePaymentLink: "",
        emailCopyPaymentLink: "",

        sgMail: {
          sendmailApiKey: "",
          newBookingEmailTemplateId: "",
          modifiedBookingEmailTemplateId: "",
          resendBookingEmailTemplateId: "",
          enquiryBookingEmailTemplateId: "",
          paymentConfirmationEmailTemplateId: "",
          paymentLinkEmailTemplateId: ""
        },
        primaryTVARate: null,
        secondaryTVARateEnabled: false,
        secondaryTVARate: null,
        secondaryTVARateDescription: null,
        tandcLink: null,
        paymentCompanyName: null,
        contactPhoneNumber: null,
        contactEmail: null
      },

      rules: {
        emailFromAddress: [
          {
            max: 50,
            message: "Email from must be less than 50",
            trigger: "change"
          },
          {
            type: "email",
            message: "Please enter correct email address",
            trigger: "change"
          }
        ],
        primaryTVARate: [
          {
            type: "number",
            message: "TVA Rate must be a number",
            trigger: "change"
          },
          {
            type: "number",
            min: 0,
            max: 100,
            message: "TVA Rate must be a between 0 and 100",
            trigger: "change"
          }
        ],
        secondaryTVARate: [
          {
            type: "number",
            message: "TVA Rate must be a number",
            trigger: "change"
          },
          {
            type: "number",
            min: 0,
            max: 100,
            message: "TVA Rate must be a between 0 and 100",
            trigger: "change"
          }
        ],
        contactEmail: [
          {
            max: 50,
            message: "Email from must be less than 50",
            trigger: "change"
          },
          {
            type: "email",
            message: "Please enter correct email address",
            trigger: "change"
          }
        ]
      }
    };
  },
  methods: {
    async saveOrUpdate() {
      console.log("saveOrUpdate");

      try {
        let editableSettingsRef = await getEditableSettingsRef(this.companyId);

        if (!this.editableSettingsForm.primaryTVARate) {
          this.editableSettingsForm.primaryTVARate = null;
        }
        if (!this.editableSettingsForm.secondaryTVARate) {
          this.editableSettingsForm.secondaryTVARate = null;
        }

        await editableSettingsRef.set(this.editableSettingsForm);

        this.$message({
          message: "Editable settings updated.",
          type: "success",
          duration: 5000
        });
      } catch (error) {
        console.error(
          "Unable to save --editableSettings-- to data store",
          error
        );
        this.$message({
          message: "Oops, error saving editable settings data.",
          type: "error",
          duration: 5000
        });
      }
    },
    getSettingsNumericValue(value) {
      if (
        typeof value !== "undefined" &&
        value !== null &&
        value !== "" &&
        value !== 0
      ) {
        return Number(value);
      }
      return null;
    },
    getSettingsTextValue(value) {
      if (typeof value !== "undefined" && value !== null && value !== "") {
        return value;
      }
      return null;
    }
  }
};
</script>
