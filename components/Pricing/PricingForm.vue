<template>
  <div>
    <section>
      <div class="bg-gray-100 mt-6">
        <el-form
          ref="form"
          :label-position="labelPosition"
          :model="form"
          :rules="rules"
          label-width="120px"
          size="medium"
        >
          <div
            class="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8 border border-1 rounded-lg"
          >
            <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Basic Information
                    </h3>
                    <p class="mt-1 text-sm text-gray-600">
                    </p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <PricingForm1 :form="form" ref="pricingForm1" :isEditing="isEditing"/>
                  </div>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div>

            <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Pricing Information
                    </h3>
                    <p class="mt-1 text-sm text-gray-600">
                    </p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <PricingForm2 :form="form" ref="pricingForm2" />
                  </div>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div>

            <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Pricing Availability
                    </h3>
                    <p class="mt-1 text-sm text-gray-600">
                    </p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <PricingForm3
                      :form="form"
                      :transientForm="transientForm"
                      v-on:update-days-of-week="updateAvailableDaysOfWeek"
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

            <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Quote Availablity
                    </h3>
                    <p class="mt-1 text-sm text-gray-600">
                    </p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <PricingForm4 :form="form" />
                  </div>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div>
<!--
            <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Basic Information
                    </h3>
                    <p class="mt-1 text-sm text-gray-600">
                    </p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <PricingForm5 :form="form" />
                  </div>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div>
-->
            <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Tags
                    </h3>
                    <p class="mt-1 text-sm text-gray-600">
                    </p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <PricingForm6 :form="form" />
                  </div>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div>

            <div class="flex justify-end">
              <div>
                <el-button
                  :type="buttonType"
                  :disabled="false"
                  @click.prevent="saveOrUpdatePrice"
                  :loading="loading"
                  icon="el-icon-download"
                >
                  {{ isEditing ? "Update Pricing Rule" : "Save Pricing Rule" }}
                </el-button>
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

import {
  copyTransientDatesToForm,
  copyAndConvertDatesToTransientForm,
  getDocumentReferencePricingRule
} from "@/statics/pricing/functions.js";

import PricingForm1 from "@/components/Pricing/PricingForm1";
import PricingForm2 from "@/components/Pricing/PricingForm2";
import PricingForm3 from "@/components/Pricing/PricingForm3";
import PricingForm4 from "@/components/Pricing/PricingForm4";
import PricingForm5 from "@/components/Pricing/PricingForm5";
import PricingForm6 from "@/components/Pricing/PricingForm6";

export default {
  components: {
    PricingForm1,
    PricingForm2,
    PricingForm3,
    PricingForm4,
    PricingForm5,
    PricingForm6
  },
  props: {
    // an array that will be populated with existing pricing and availability entries
    // existingPrice: Object,
    // priceId: String,
    // shouldOpenDialog: Boolean
  },

  data() {
    return {
      buttonType: "primary",

      editScheduledDialogFormVisible: false,

      isCreating: false,

      isEditing: false,

      // keeping track of the submit button status
      loading: false,

      activeFormPanels: ["1"],

      // position of labels in the display of form, valid values are 'top', 'left', 'right'
      labelPosition: "top",

      transientForm: {
        availableDateRange: "",
        availableTimeRange: ""
      },

      // our form data
      form: {},

      rules: {},
      priceId:""
    };
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    })
  },

  async created() {
    if (this.$route.query.priceId) {
      // Set flag inidicating that we're editing an existing pricing rule.
      this.isEditing = true;

      try {
        await this.onLoadExistingPrice(this.$route.query.priceId);
        copyAndConvertDatesToTransientForm(this.form, this.transientForm);
      } catch (error) {
        this.$message({
          message: `Oops, error loading existing pricing rule. ${error}`,
          type: "error",
          duration: 5000
        });
      }
    } else {
      this.initForm();
    }
  },

  methods: {
    async onLoadExistingPrice(id) {
      this.priceId = "";

      const ref =getDocumentReferencePricingRule(this.companyId, id);

      try {
        const snapshot = await ref.get();

        this.priceId = id;

        // let's merge the object properties using the spread operator
        // this will ensure we keep all of our original form properties even
        // if they are not part of the existing object
        this.form = { ...snapshot.data() };
      } catch (e) {
        console.error(e);
      }
    },

    // having to jump through hoops because of a bug in element component https://element.eleme.io/#/en-US/component/checkbox
    // it cannot be supplied an array in the form form.availableDaysOfWeek, it must be a top level data element instead so using this as a workaround
    updateAvailableDaysOfWeek(updatedAvailableDaysOfWeek) {
      this.form.availableDaysOfWeek = updatedAvailableDaysOfWeek;
    },

    async saveOrUpdatePrice() {
      this.loading = true;
      copyTransientDatesToForm(this.form, this.transientForm);
      console.log(this.form);

      let allFromsValid = this.$refs["pricingForm2"].isValidForm() && this.$refs["pricingForm1"].isValidForm();

      if(allFromsValid === true) {
        if (this.isEditing) {
          this.updatePricingRule();
        } else {
          this.createPricingRule();
        }
      }else {
        this.$message({
          message:
            "Oops, there are errors to correct.<br/>Please check each mandatory field has a value.",
          type: "error",
          duration: 5000,
          dangerouslyUseHTMLString: true
        });
        this.loading = false;
      }
    },

    createPricingRule() {
      const pricingRule = {
        active: true,
        ...this.form
      };

      this.$store
        .dispatch("pricingRules/addPricingRule", pricingRule)
        .then(() => {
          this.$notify.success({
            title: "Success",
            message: "The pricing rule was saved",
            offset: 100
          });

          this.$router.push({ path: "/pricing" });
        })
        .catch(error => {
          this.$notify.error({
            title: "Failed",
            message: "Saving failed",
            offset: 100
          });
        })
        .finally(() => {
          this.loading = false;
          this.isCreating = false;
        });
    },

    updatePricingRule() {
      const editedPricingRule = {
        id: this.priceId,
        active: true,
        ...this.form
      };

      this.$store
        .dispatch("pricingRules/editPricingRule", editedPricingRule)
        .then(() => {
          this.$notify.success({
            title: "Success",
            message: "The pricing rule was updated",
            offset: 100
          });

          this.$router.push({ path: "/pricing" });
        })
        .catch(error => {
          this.$notify.error({
            title: "Failed",
            message: "The updated failed",
            offset: 100
          });
        })
        .finally(() => {
          this.loading = false;
          this.isEditing = false;
        });
    },

    initForm() {
      this.form = {
        name : "",
        journeyType: "",
        fromPlaceId: "",
        toPlaceId: "",
        isPlaceGroupFrom: false,
        isPlaceGroupTo: false,
        fromPlaceGroupId: "",
        toPlaceGroupId: "",
        bidirectional : true,
        pricingByGroupOrPerson: "Per Group",
        price: 0,
        numPassengers: "8",

        pricesArray: [
          {
            cumulativePrice: ""
          }
        ],

        availableDateFrom: "",
        availableDateTo: "",
        availableTimeFrom: "",
        availableTimeTo: "",
        availableDaysOfWeek: [],

        quoteDateTimeFrom: "",
        quoteDateTimeTo: "",

        instantPaymentAllowed: false,
        displayNoticeUponQuoteDelivery: false,
        noticeUponQuoteDelivery: "",

        displayTnCUponQuoteDelivery: false,
        termsAndConditions: "",

        // not administered in the form but forms part of the data we track
        numUses: 0
      };

      this.transientForm = {
        availableDateRange: "",
        availableTimeRange: ""
      };
    },

    handleCancel() {
      this.isEditing = false;
      this.isCreating = false;
      this.$router.push({ path: "/pricing" });
    }
  }
};
</script>

<style scoped>
.create-button {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
.form-submission {
  margin: 24px 0px 48px 0px;
}
</style>
