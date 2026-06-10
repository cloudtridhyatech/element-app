<template>
  <section v-if="companyId" class="embed-form">
    <div class="px-2 py-12" v-if="isStepVisible(stepEnum.form1Only)">
      <div
        class="max-w-7xl mx-auto py-4 px-4 md:py-24 lg:px-8 border border-1 rounded"
      >
        <div
          v-for="(transferForm, index) in booking.transfersArray"
          :key="index"
        >
          <EmbedBookingForm1
            ref="journeyFormRefs"
            :index="index"
            :numTransfers="booking.transfersArray.length"
            :form="{
              journey: booking.journiesArray[index],
              transfer: transferForm
            }"
            :companyId="companyId"
            :allActivePlaces="allActivePlaces"
            :allActiveRoutes="allActiveRoutes"
            :loading="loading"
            v-on:delete-transfer="handleDeleteTransfer"
            v-on:reset-quote="handleResetQuote"
          />

          <div>
            <div class="py-4">
              <div class="border-t border-gray-200"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-y-4 sm:flex-row justify-between">
          <div>
            <el-button
              class="w-full sm:w-auto"
              type="primary"
              plain
              :loading="loading"
              @click="handleAddTransfer"
              >Add another transfer</el-button
            >
          </div>
          <div>
            <el-button
              class="w-full sm:w-auto"
              type="primary"
              :loading="loading"
              @click="handleQuotePrice"
              >Get Quote</el-button
            >
          </div>
        </div>
      </div>
    </div>
    <div class="px-2 mt-6" v-if="isStepVisible(stepEnum.quotesAndDetails)">
      <div
        class="max-w-7xl mx-auto py-4 px-4 md:py-8 lg:px-8 border border-1 rounded"
      >
        <div>
          <EmbedBookingFormQuotes
            ref="embedBookingFormQuotes"
            :companyId="companyId"
            :form="{ quotes: quotes, transfers: booking.transfersArray }"
            :totalQuote="totalQuote"
          />
        </div>
      </div>
    </div>
    <div class="px-2 mt-6" v-if="isStepVisible(stepEnum.quotesAndDetails)">
      <div
        class="max-w-7xl mx-auto py-4 px-4 md:py-8 lg:px-8 border border-1 rounded"
      >
        <div>
          <div class="text-lg font-semibold">Contact Details</div>
          <EmbedContactDetails
            ref="embedContactDetails"
            :form="{ booking: booking }"
            :companyId="companyId"
          />
        </div>
        <div class="flex justify-between"></div>
      </div>
    </div>
    <div class="px-2 mt-6" v-if="isStepVisible(stepEnum.quotesAndDetails)">
      <div
        class="max-w-7xl mx-auto py-4 px-4 md:py-8 lg:px-8 border border-1 rounded"
      >
        <div>
          <div
            v-for="(transferForm, index) in booking.transfersArray"
            :key="index"
          >
            <EmbedTransferInfoForm
              :index="index"
              ref="embedBookingForm2"
              :form="{
                journey: booking.journiesArray[index],
                transfer: transferForm
              }"
              :companyId="companyId"
              :companyKey="companyKey"
              :allActivePlaces="allActivePlaces"
              :class="index > 0 ? 'mt-8' : ''"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="px-2 mt-6" v-if="isStepVisible(stepEnum.quotesAndDetails)">
      <div
        class="max-w-7xl mx-auto py-4 px-4 md:py-8 lg:px-8 border border-1 rounded"
      >
        <div>
          <el-form ref="formFinal" :model="formFinal" :rules="rules">
            <el-row>
              <el-col :span="24">
                <el-form-item label="Other requirements">
                  <el-input
                    v-model="formFinal.booking.customerNotes"
                    placeholder="Please enter any additional details/special requirements (multiple flights, directions, key collection etc)."
                    type="textarea"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item prop="allCorrect">
                  <el-checkbox v-model="formFinal.allCorrect"
                    >I have double checked to ensure the above details are all
                    accurate.</el-checkbox
                  >
                </el-form-item>
              </el-col>
              <el-col
                :span="12"
                v-show="
                  settings.tandcLink &&
                    settings.tandcLink !== null &&
                    settings.tandcLink !== ''
                "
              >
                <el-form-item prop="tandcAgreed">
                  <el-checkbox v-model="formFinal.tandcAgreed"
                    >I have read and understood the
                    <a v-bind:href="settings.tandcLink" target="_new"
                      >terms and conditions</a
                    >.</el-checkbox
                  >
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div class="flex justify-between">
          <el-row>
            <el-col :span="24">
              <el-button
                type="success"
                @click="handleNextStep"
                :loading="loading"
                >{{ proceedOption }}</el-button
              >
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <div class="px-2 mt-6" v-if="isStepVisible(stepEnum.pleaseWait)">
      Please wait
    </div>
    <div class="px-2 mt-6" v-if="isStepVisible(stepEnum.endEnquiryOnly)">
      <!-- No payment process - just show enquiry confirmed -->
      <EmbedBookingEnd
        :settings="settings"
        :isEnquiryBooking="true"
        :bookingRef="booking.bookingRef"
      />
    </div>
    <div class="px-2 mt-6" v-if="isStepVisible(stepEnum.payment)">
      <!-- the payment page -->
      <div
        class="max-w-7xl mx-auto py-4 px-4 md:py-8 lg:px-8 border border-1 rounded"
      >
        <div>
          <StripePayment
            v-show="showPayment('stripe')"
            :companyId="companyId"
            :companyName="settings.paymentCompanyName"
            :settings="settings"
            :price="totalQuote"
            :booking="booking"
            v-on:payment-complete="handlePaymentComplete"
            v-on:payment-cancel="handlePaymentCancel"
          />
        </div>
      </div>
    </div>
    <div class="px-2 mt-6" v-if="isStepVisible(stepEnum.endPayment)">
      <!-- the payment complete page -->
      <EmbedBookingEnd
        :settings="settings"
        :isPaymentSuccess="true"
        :isConfirmed="true"
        :bookingRef="booking.bookingRef"
      />
    </div>
    <div class="px-2 mt-6" v-if="isStepVisible(stepEnum.endCancelPayment)">
      <!-- the payment cancelled page -->
      <EmbedBookingEnd
        :settings="settings"
        :isPaymentCancel="true"
        :isEnquiryBooking="true"
        :bookingRef="booking.bookingRef"
      />
    </div>
    <div class="px-2 mt-6" v-if="isStepVisible(stepEnum.endPaymentLinkExpired)">
      <!-- the payment expired page -->
      <EmbedBookingEnd
        :settings="settings"
        :isConfirmed="true"
        :bookingRef="booking.bookingRef"
      />
    </div>
    <div class="px-2 mt-6" v-if="isStepVisible(stepEnum.error)">
      <EmbedBookingEnd
        :settings="settings"
        :isError="true"
        :bookingRef="booking.bookingRef"
      />
    </div>
  </section>
</template>

<script>
import { firebaseFunctions } from "@/plugins/firebase.js";
import { mapGetters } from "vuex";
import Vue from "vue";
import { bookingMixin } from "@/statics/booking/functions.js";
import { getPricingRules } from "@/statics/pricing/functions.js";
import { getSettings } from "@/statics/embed/functions.js";
import { quotesMixin } from "@/statics/pricing/quotes.js";

import EmbedBookingForm1 from "@/components/Embed/EmbedBookingForm1";
import EmbedTransferInfoForm from "@/components/Embed/EmbedTransferInfoForm";
import EmbedContactDetails from "@/components/Embed/EmbedContactDetails";
import EmbedBookingFormQuotes from "@/components/Embed/EmbedBookingFormQuotes";
import StripePayment from "@/components/Embed/EmbedStripePayment";
import EmbedBookingEnd from "@/components/Embed/EmbedBookingEnd";

const proceedOptionPayment = "Proceed to payment";
const proceedOptionEnquiry = "Send enquiry";
const journeyTypePrivate = "private";
const journeyTypeShared = "shared";

export default {
  mixins: [quotesMixin,bookingMixin],
  head: {
    script: [
      {
        src: "https://js.stripe.com/v3/"
      }
    ]
  },
  components: {
    EmbedBookingForm1,
    EmbedTransferInfoForm,
    EmbedContactDetails,
    EmbedBookingFormQuotes,
    StripePayment,
    EmbedBookingEnd
  },
  props: {
    companyId: {
      type: String,
      required: true
    }
  },
  data() {
    var validateIsTrue = (rule, value, callback) => {
      console.log(rule, value);

      if (!value || value === false) {
        callback(new Error(rule.message));
      } else {
        callback();
      }
    };
    return {
      stepEnum: Object.freeze({
        form1Only: 0,
        quotesAndDetails: 1,
        pleaseWait: 2,
        endEnquiryOnly: 3,
        payment: 4,
        endPayment: 5,
        endCancelPayment: 6,
        endPaymentLinkExpired: 7,
        error: 404
      }),
      formValid: false,

      // keeping track of async activities
      loading: true,
      isPaymentOnly: false,
      paymentQuote: 0,
      // populated with the pricing rules that are cached within a single document to greatly reduce the amount
      // of reads from the firestore
      pricingRulesCache: [],
      booking: {
        transfersArray: [],
        journiesArray: []
      },
      formFinal: {
        allCorrect: false,
        tandcAgreed: false,
        booking: {}
      },
      quotes: [],
      allTransfersHaveAQuote: false,
      step: -1,
      settings: {},
      rules: {
        allCorrect: [
          {
            required: true,
            message:
              "You must validate that you believe all details to be accurate.",
            trigger: "change",
            validator: validateIsTrue
          }
        ],
        tandcAgreed: [
          {
            required: true,
            message: "You must accept the Terms and Conditions.",
            trigger: "change",
            validator: validateIsTrue
          }
        ]
      }
    };
  },

  computed: {
    ...mapGetters("places", {
      allActivePlaces: "getAllActivePlaces"
    }),
    ...mapGetters("routes", {
      allActiveRoutes: "getAllActiveRoutes"
    }),
    ...mapGetters("companies", {
      companyKey: "getCompanyKey"
    }),
    proceedOption: function() {
      //!!! This is used for both button label and logic. Be wary of changing the "Payment" and "Enquiry" options
      if (this.settings.paymentsEnabled !== true) {
        return proceedOptionEnquiry;
      }

      return this.allTransfersHaveAQuote === true &&
        this.quotes.every(
          q =>
            q.selected &&
            q.selected !== "" &&
            ((q.selected === journeyTypePrivate &&
              q.private.pricingRule.instantPaymentAllowed === true) ||
              (q.selected === journeyTypeShared &&
                q.shared.pricingRule.instantPaymentAllowed === true))
        )
        ? proceedOptionPayment
        : proceedOptionEnquiry;
    },
    totalQuote: function() {
      if (this.isPaymentOnly === true) {
        return this.paymentQuote;
      }

      let transfersWithAQuoteSelected = this.quotes.filter(function(item) {
        return item.selected !== "";
      });

      let tq = transfersWithAQuoteSelected.reduce((acc, cv) => {
        let selectedQuotePrice = 0;
        if (cv.selected === journeyTypePrivate) {
          selectedQuotePrice = cv.private.price;
        } else if (cv.selected === journeyTypeShared) {
          selectedQuotePrice = cv.shared.price;
        }

        return acc + selectedQuotePrice;
      }, 0);
      return tq;
    }
  },

  async created() {
    this.step = this.stepEnum.pleaseWait;
    if (this.allActivePlaces.length === 0) {
      console.log("getting allActivePlaces", this.companyId);
      this.$store.dispatch("places/initPlaces");
    }
    if (this.allActiveRoutes.length === 0) {
      console.log("getting allActiveRoutes", this.companyId);
      this.$store.dispatch("routes/initRoutes");
    }
    //init form needs settings, so must go first
    this.settings = await this.getSettings();

    this.initForm();

    this.pricingRulesCache = await getPricingRules(this.companyId);

    let nextStep = this.stepEnum.form1Only;

    let routeBookingRef = this.$route.query.ref;

    if (
      this.settings.paymentsEnabled === true &&
      routeBookingRef &&
      routeBookingRef !== null &&
      routeBookingRef !== ""
    ) {
      //try to load the booking and go straight to payment
      nextStep = await this.loadBookingForPayment(routeBookingRef);
    }

    this.loading = false;
    this.gotoStep(nextStep); // Everything loaded, go back to step 1
  },
  methods: {
    initForm() {
      this.booking = this.mixinCreateEmptyBookingObject();
      this.booking.companyId = this.companyId;
      this.booking.isOnlineBooking = true;
      this.booking.transfersArray.push(this.getDefaultEmptyTransfer());
      this.booking.journiesArray.push(this.mixinCreateEmptyJourneyObject());
      this.formFinal.booking = this.booking;

      if (
        !this.settings.tandcLink ||
        this.settings.tandcLink === null ||
        this.settings.tandcLink === ""
      ) {
        this.formFinal.tandcAgreed = true;
      }
    },
    getDefaultEmptyTransfer() {
      let transfer = this.mixinCreateEmptyTransferObject();
      return transfer;
    },
    handleAddTransfer() {
      Vue.set(
        this.booking.transfersArray,
        this.booking.transfersArray.length,
        this.getDefaultEmptyTransfer()
      );
      Vue.set(
        this.booking.journiesArray,
        this.booking.journiesArray.length,
        this.mixinCreateEmptyJourneyObject()
      );

      this.resetQuote();
    },

    handleDeleteTransfer(index) {
      this.$delete(this.booking.transfersArray, index);
      this.$delete(this.booking.journiesArray, index);
      this.$delete(this.quotes, index);

      this.resetQuote();
    },
    handleResetQuote() {
      this.resetQuote();
    },
    resetQuote() {
      this.allTransfersHaveAQuote = false;
      this.gotoStep(this.stepEnum.form1Only); // hide the rest of the forms as the user is amending quotes in some way

      this.quotes.forEach(item => {
        item.selected = "";
      });
    },
    areAllJourneyFormsValid() {
      const journeyFormRefs = this.$refs.journeyFormRefs;
      let allJourneyFormsAreValid = true;
      journeyFormRefs.forEach(journeyForm => {
        if (!journeyForm.isValidForm()) {
          allJourneyFormsAreValid = false;
        }
      });
      return allJourneyFormsAreValid;
    },
    handleQuotePrice() {
      if (!this.areAllJourneyFormsValid()) return;

      this.loading = true;

      this.resetQuote();
      this.quotes = [];

      let quoteFound = [];
      for (let i = 0; i < this.booking.transfersArray.length; i++) {
        let journey = this.booking.journiesArray[i];
        let transfer = this.booking.transfersArray[i];

        transfer.price = 0;
        transfer.pricingRuleUsed = null;
        let hasAQuoteBeenFound = false;

        let quote = {
          selected: ""
        };

        let quoteRequest = {
          pricingRulesList: this.pricingRulesCache,
          fromPlaceId: transfer.fromPlaceId,
          toPlaceId: transfer.toPlaceId,
          numPassengers: journey.numPassengers,
          pickUpDateTime: journey.pickUpDateTime
        };
        quoteRequest.journeyType = journeyTypePrivate;
        let matchedPricingRulesPrivate = this.mixinGetPricingListMatches(
          quoteRequest
        );

        quoteRequest.journeyType = journeyTypeShared;
        let matchedPricingRulesShared = this.mixinGetPricingListMatches(
          quoteRequest
        );

        //user the first shared and private transfers prices that match
        let privatePriceDetails = this.getPricingRuleDetails(
          matchedPricingRulesPrivate,
          journey.numPassengers
        );
        if (privatePriceDetails !== null) {
          quote.private = this.mapPricingRuleDetails(privatePriceDetails);
          hasAQuoteBeenFound = true;
        }

        let sharedPriceDetails = this.getPricingRuleDetails(
          matchedPricingRulesShared,
          journey.numPassengers
        );
        if (sharedPriceDetails !== null) {
          quote.shared = this.mapPricingRuleDetails(sharedPriceDetails);
          hasAQuoteBeenFound = true;
        }

        this.quotes.push(quote);
        quoteFound.push(hasAQuoteBeenFound);
      }

      this.allTransfersHaveAQuote = !(
        quoteFound.findIndex(x => x === false) > -1
      );

      if (this.allTransfersHaveAQuote === false) {
        this.$message({
          message:
            "Sorry, we can't quote you a price for all the selections you have made.",
          type: "warning"
        });
      } else {
        if (this.step === this.stepEnum.form1Only) {
          this.gotoStep(this.stepEnum.quotesAndDetails);
        }
      }
      this.loading = false;
    },
    getPricingRuleDetails(matchedPricingRules, numPassengers) {
      let details = null;
      if (
        matchedPricingRules &&
        numPassengers &&
        matchedPricingRules.length > 0
      ) {
        let pricingRule = matchedPricingRules[0];

        if (pricingRule && pricingRule !== null) {
          let response = this.mixinGetPriceFromPricingRule(pricingRule, numPassengers);
          if (response.price !== null) {
            details = {
              pricingRule: pricingRule,
              price: response.price,
              isPricedPerPerson: response.isPricedPerPerson,
              pricePerPerson: response.pricePerPerson
            };
          }
        }
      }
      return details;
    },
    mapPricingRuleDetails(details) {
      return {
        pricingRule: details.pricingRule,
        price: details.price,
        isPricedPerPerson: details.isPricedPerPerson,
        pricePerPerson: details.pricePerPerson
      };
    },
    isStepVisible(value) {
      if (
        this.step === this.stepEnum.form1Only &&
        value === this.stepEnum.form1Only
      ) {
        return true;
      } else if (
        this.step === this.stepEnum.quotesAndDetails &&
        value <= this.stepEnum.quotesAndDetails
      ) {
        return true;
      } else if (
        this.step > this.stepEnum.quotesAndDetails &&
        this.step === value
      ) {
        return true;
      } else if (
        this.step === this.stepEnum.error &&
        value === this.stepEnum.error
      ) {
        //reserved for error
        return true;
      }

      return false;
    },
    gotoStep(step) {
      this.step = step;
    },
    async handleNextStep() {
      this.loading = true;

      let allJourneyFormsAreValid = this.areAllJourneyFormsValid();

      let formRefs = this.$refs.embedBookingForm2;
      let otherTransferDetailsValid = true;
      formRefs.forEach(form => {
        if (!form.isValidForm()) {
          otherTransferDetailsValid = false;
        }
      });

      let detailsValid = this.$refs.embedContactDetails.isValidForm();

      let quotesSelected =
        this.allTransfersHaveAQuote === true &&
        this.$refs.embedBookingFormQuotes.isValidForm();

      let formFinalValid = false;
      this.$refs.formFinal.validate(valid => {
        formFinalValid = valid;
      });

      if (
        allJourneyFormsAreValid === true &&
        detailsValid === true &&
        otherTransferDetailsValid === true &&
        quotesSelected === true &&
        formFinalValid === true
      ) {
        this.gotoStep(this.stepEnum.pleaseWait);
        let gotoPayment = this.proceedOption === proceedOptionPayment;

        //create booking as unconfimred
        this.booking.isConfirmed = false;

        //Assign the quote selection before saving
        for (let i = 0; i < this.booking.transfersArray.length; i++) {
          let transfer = this.booking.transfersArray[i];
          let journey = this.booking.journiesArray[i];
          let quote = this.quotes[i];
          switch (quote.selected) {
            case journeyTypePrivate:
              transfer.pricingRuleUsed = quote.private.pricingRule;
              transfer.price = quote.private.price;
              transfer.journeyType = journeyTypePrivate;
              break;
            case journeyTypeShared:
              transfer.pricingRuleUsed = quote.shared.pricingRule;
              transfer.price = quote.shared.price;
              transfer.journeyType = journeyTypeShared;
              break;
          }
        }

        try {
          const createBooking = firebaseFunctions.httpsCallable(
            "bookings-createBooking"
          );

          let result = await createBooking(this.booking);
          let response = result.data;
          this.booking.bookingId = response.bookingId;
          this.booking.bookingRef = response.bookingRef;

          if (gotoPayment === true) {
            this.gotoStep(this.stepEnum.payment);
          } else {
            this.gotoStep(this.stepEnum.endEnquiryOnly);
          }
        } catch (error) {
          this.gotoStep(this.stepEnum.error);
        }
      } else {
        let message = "Oops, there are errors to correct:";
        if (quotesSelected === false) {
          message += "<br/>Please check a quote for each transfer is selected";
        }
        if (
          allJourneyFormsAreValid === false ||
          detailsValid === false ||
          otherTransferDetailsValid === false
        ) {
          message += "<br/>Please check each data field is complete.";
        }

        this.$message({
          message: message,
          type: "error",
          duration: 5000,
          dangerouslyUseHTMLString: true
        });
      }
      this.loading = false;
    },
    async handlePaymentComplete(data) {
      await this.finaliseEmbedBooking(true, this.stepEnum.endPayment, data);
    },
    async handlePaymentCancel() {
      await this.finaliseEmbedBooking(
        false,
        this.stepEnum.endCancelPayment,
        null
      );
    },
    async finaliseEmbedBooking(isPaymentComplete, nextStep, data) {
      try {
        this.loading = true;

        this.gotoStep(this.stepEnum.pleaseWait);

        const finaliseEmbedBooking = firebaseFunctions.httpsCallable(
          "bookings-finaliseEmbedBooking"
        );

        let request = {
          companyId: this.companyId,
          id: this.booking.bookingId,
          isPaymentComplete: isPaymentComplete
        };
        if (data && data !== null && data.status) {
          request.status = data.status;
        }

        let result = await finaliseEmbedBooking(request);
        let response = result.data;

        this.gotoStep(nextStep);
      } catch (error) {
        this.gotoStep(this.stepEnum.error);
      } finally {
        this.loading = false;
      }
    },
    async loadBookingForPayment(bookingId) {
      let nextStep = this.stepEnum.error;
      const getBooking = firebaseFunctions.httpsCallable(
        "bookings-getBookingForPayment"
      );

      try {
        let result = await getBooking({
          bookingId: bookingId,
          companyId: this.companyId
        });

        if (result && result.data && result.data !== null) {
          let bookingDetails = { ...result.data };

          if (bookingDetails.hasAlreadyPaid === true) {
            //show message payment link expired
            this.$message({
              message: "The payment link has expired.",
              type: "warning",
              duration: 10000
            });
            this.booking.bookingRef = bookingDetails.bookingRef;
            nextStep = this.stepEnum.endPaymentLinkExpired;
          } else {
            //Transfer and journey data not required for payment
            this.booking.email = bookingDetails.email;
            (this.booking.firstName = bookingDetails.firstName),
              (this.booking.lastName = bookingDetails.lastName);
            this.booking.bookingRef = bookingDetails.bookingRef;
            this.booking.bookingId = bookingDetails.bookingId;
            this.booking.companyId = bookingDetails.companyId;
            this.booking.isOnlineBooking = false;
            this.paymentQuote += bookingDetails.totalDue;

            this.isPaymentOnly = true;
            nextStep = this.stepEnum.payment;
          }
        }
      } catch (error) {
        console.error(`onLoadExistingBooking ${bookingId} error:`, error);
      }
      return nextStep;
    },
    async getSettings() {
      let settings = {};

      try {
        settings = await getSettings(this.companyId);
      } catch (error) {
        console.error("Unable to retrieve --settings-- from data store", error);
        settings = null;
      } finally {
        if (!settings || settings === null) {
          settings = {
            paymentSystemName: "",
            tandcLink: "",
            paymentsEnabled: false,
            paymentCompanyName: "",
            contactPhoneNumber: "",
            contactEmail: "",
            paymentSystem: {}
          };
        }
      }
      return settings;
    },
    showPayment(name) {
      return (
        this.settings.paymentsEnabled === true &&
        this.settings.paymentSystemName === name
      );
    }
  }
};
</script>
