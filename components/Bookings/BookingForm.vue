<template>
  <div>
    <section v-loading="loading">
      <div v-show="!loading && isEditing && !bookingFound" class="mt-6">
        <el-alert title="Unable to find booking" type="error" :closable="false">
        </el-alert>
        <p class="mt-6">
          This normally happens in dev or staging if the booking is in Algolia
          but not in the dev or staging firebase stores
        </p>
      </div>
      <div
        class="bg-gray-100 mt-6"
        v-if="(isEditing && bookingFound) || isCreating"
      >
        <div
          class="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8 border border-1 rounded-lg"
        >
          <!-- <h2 class="text-2xl font-extrabold mb-6">
            {{ isEditing ? "Edit Existing Booking" : "Create New Booking" }}
          </h2> -->
          <div class="mt-10 sm:mt-0">
            <div class="md:grid md:grid-cols-3 md:gap-6">
              <div class="md:col-span-1">
                <div class="px-4 sm:px-0">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">
                    Customer Information
                  </h3>
                  <p
                    class="mt-1 text-sm text-gray-600"
                    v-show="isEditing === true"
                  >
                    Booking reference: {{ bookingForm.bookingRef }}
                  </p>
                  <p class="mt-1 text-sm text-gray-600">
                    Use a permanent email address where you can receive mail.
                  </p>
                </div>
              </div>
              <div class="mt-5 md:mt-0 md:col-span-2">
                <form action="#" method="POST">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <BookingForm1
                      ref="customerInformationFormRef"
                      :bookingForm="bookingForm"
                      :isEditing="isEditing"
                      :showBookingChoice="showBookingChoice"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="hidden sm:block" aria-hidden="true">
            <div class="py-12">
              <div class="border-t border-gray-200"></div>
            </div>
          </div>

          <div class="mt-10 sm:mt-0" v-if="showInvoicing()">
            <div class="md:grid md:grid-cols-3 md:gap-6">
              <div class="md:col-span-1">
                <div class="px-4 sm:px-0">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">
                    Invoice Details
                  </h3>
                  <p class="mt-1 text-sm text-gray-600">
                    A summary of the Invoice status of the booking.
                  </p>
                </div>
              </div>
              <div class="mt-5 md:mt-0 md:col-span-2">
                <form action="#" method="POST">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <BookingFormInvoiceDetails
                      :bookingForm="bookingForm"
                      ref="invoiceFormRefs"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div
            class="hidden sm:block"
            aria-hidden="true"
            v-if="showInvoicing()"
          >
            <div class="py-12">
              <div class="border-t border-gray-200"></div>
            </div>
          </div>

          <div class="mt-10 sm:mt-0" v-if="showPayment()">
            <div class="md:grid md:grid-cols-3 md:gap-6">
              <div class="md:col-span-1">
                <div class="px-4 sm:px-0">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">
                    Payment Details
                  </h3>
                  <p class="mt-1 text-sm text-gray-600">
                    A summary of the booking payment details.
                  </p>
                </div>
              </div>
              <div class="mt-5 md:mt-0 md:col-span-2">
                <div class="shadow overflow-hidden p-10 sm:rounded-md bg-white">
                  <BookingFormPaymentDetails
                    :bookingForm="bookingForm"
                    ref="paymentFormRefs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="hidden sm:block" aria-hidden="true" v-if="showPayment()">
            <div class="py-12">
              <div class="border-t border-gray-200"></div>
            </div>
          </div>

          <div
            v-for="(journey, counter) in activeJournies"
            v-bind:key="counter"
          >
            <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Journey # {{ counter + 1 }}
                    </h3>
                    <p
                      v-show="isEditing === true && journey.id"
                      class="mt-1 text-sm text-gray-600"
                    >
                      Status: {{ journey.status }}
                    </p>
                    <p
                      class="mt-1 text-sm text-gray-600"
                      v-if="showInfo(journey)"
                    >
                      <i class="el-icon-info">
                        {{
                          isSplitTransfer(journey)
                            ? "This is part of a split Journey. "
                            : ""
                        }}
                        {{
                          isScheduled(journey)
                            ? "This Journey is scheduled. "
                            : ""
                        }}
                      </i>
                    </p>
                    <el-popconfirm
                      title="Are you sure you want to delete this journey?"
                      confirmButtonText="OK"
                      cancelButtonText="No, Thanks"
                      icon="el-icon-info"
                      iconColor="red"
                      @confirm="handleDeleteJourney(journey, journey.id)"
                    >
                      <el-link
                        slot="reference"
                        type="danger"
                        v-show="canDeleteJourney(journey)"
                        >Delete this journey
                      </el-link>
                    </el-popconfirm>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <form action="#" method="POST">
                    <div
                      class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                    >
                      <BookingForm2
                        v-if="
                          canDisplay(journey.transferObject.id, journey.id) ===
                            true
                        "
                        ref="journeyFormRefs"
                        :journeyIndex="counter"
                        :pricingRulesCache="pricingRulesCache"
                        :hasInvoicedPayments="hasInvoicedPayments()"
                        :journeyForm="getBookingForm2Data(journey)"
                        :isEditing="isEditing"
                        v-on:update-journey-pricing="handleUpdateJourneyPricing"
                      />
                      <BookingFormSplitDetails
                        v-if="
                          canDisplay(journey.transferObject.id, journey.id) ===
                            false
                        "
                        :journey="journey"
                        :transferObject="journey.transferObject"
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div>
          </div>
          <div class="flex justify-between">
            <div>
              <el-button
                type="default"
                icon="el-icon-plus"
                plain
                @click="handleAddEmptyJourney()"
                v-if="canAddNewJourney()"
                >Add New Journey</el-button
              >
            </div>

            <div>
              <div>
                <el-button
                  :type="buttonType"
                  @click="saveOrUpdate('bookingForm')"
                  :loading="loading"
                  icon="el-icon-download"
                  >{{
                    isEditing ? "Update Booking" : "Save Booking"
                  }}</el-button
                >
                <el-button @click="handleCancel()" icon="el-icon-close"
                  >Cancel</el-button
                >
              </div>
              <div class="py-6" v-if="this.isEditing">
                <div>
                  Resend email?
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="Resend the Booking email on 'Update Booking' click?"
                    placement="right"
                  >
                    <el-switch
                      v-model="resendBookingEmail"
                      active-text="Yes"
                      inactive-text="No"
                    ></el-switch
                  ></el-tooltip>
                </div>
                <div class="py-2" v-if="canSendPaymentLink()">
                  Send Payment Link Email?
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="Send the customer an email with a payment link"
                    placement="right"
                  >
                    <el-switch
                      v-model="sendPaymentLinkEmail"
                      active-text="Yes"
                      inactive-text="No"
                      @change="handleCanSendPaymentLinkChange()"
                    ></el-switch>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Vue from "vue";
import { fireDb, firebaseFunctions } from "@/plugins/firebase.js";
import {
  getInvoiceSystemAvailability,
  getPaymentSystemAvailability
} from "@/statics/settings/externalSystems.js";
import { getEditableSettingsData } from "@/statics/settings/functions.js";
import { bookingMixin } from "@/statics/booking/functions.js";
import { getPricingRules } from "@/statics/pricing/functions.js";
import BookingForm1 from "@/components/Bookings/BookingForm1";
import BookingForm2 from "@/components/Bookings/BookingForm2";
import BookingFormInvoiceDetails from "@/components/Bookings/BookingFormInvoiceDetails";
import BookingFormPaymentDetails from "@/components/Bookings/BookingFormPaymentDetails";
import BookingFormSplitDetails from "@/components/Bookings/BookingFormSplitDetails";

const journeyStatusEnquiry = "enquiry";
const journeyStatsusConfirmed = "confirmed";

export default {
  mixins: [bookingMixin],
  components: {
    BookingForm1,
    BookingForm2,
    BookingFormInvoiceDetails,
    BookingFormSplitDetails,
    BookingFormPaymentDetails
  },

  props: {
    shouldOpenDialog: Boolean,
    displayAddBookingButton: Boolean
  },

  data() {
    return {
      buttonType: "primary",
      formValid: false,
      isCreating: false,
      isEditing: false,
      bookingFound: false,

      // keeping track of async activities
      loading: false,

      // populated with the pricing rules that are cached within a single document to greatly reduce the amount
      // of reads from the firestore
      pricingRulesCache: [],

      bookingForm: {},
      isInvoiceSystemAvailable: false,
      isPaymentSystemAvailable: false,
      //Fixed time to compare if a journey is in the past
      dateTimeNow: new Date().getTime(),
      resendBookingEmail: false,
      sendPaymentLinkEmail: false,
      hasAnySplitTransfer: false,
      hasAnyScheduledTransfer: false,
      splitJourneyIdsByTransferIdMap: new Map(),
      showBookingChoice: false,

      formChanged: false
    };
  },

  watch: {
    bookingForm: {
      handler: function(val, oldVal) {
        if (this.formChanged == false) {
          this.formChanged = true;
        } else {
          this.$emit("something-changed");
        }
      },
      deep: true
    }
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("companies", {
      companyKey: "getCompanyKey"
    }),
    activeJournies: function() {
      return this.bookingForm.journiesArray.filter(function(journey) {
        if (typeof journey.active === "undefined") {
          return true;
        }
        return journey.active;
      });
    }
  },
  async created() {
    if (this.$route.query.bookingId) {
      // Set flag inidicating that we're editing an existing booking.
      this.isEditing = true;

      try {
        await this.onLoadExistingBooking(this.$route.query.bookingId);
      } catch (error) {
        this.$message({
          message: "Oops, error loading existing booking.",
          type: "error",
          duration: 5000
        });
      }
    } else {
      this.isCreating = true;
      this.initForm();
    }

    try {
      await this.initPricingRules();
    } catch (error) {
      this.$message({
        message: "Oops, error loading pricing data.",
        type: "error",
        duration: 5000
      });
    }

    this.isInvoiceSystemAvailable = await getInvoiceSystemAvailability(
      this.companyId
    );
    this.isPaymentSystemAvailable = await getPaymentSystemAvailability(
      this.companyId
    );
  },

  methods: {
    async onLoadExistingBooking(bookingId) {
      const getBooking = firebaseFunctions.httpsCallable("bookings-getBooking");
      this.bookingId = null;
      this.loading = true;

      getBooking({
        bookingId: bookingId,
        companyId: this.companyId
      })
        .then(result => {
          this.bookingFound = true;
          this.bookingId = result.data.id;
          let resultData = result.data;
          let enquiryCount = 0;
          let confirmedCount = 0;

          //The temporary assignment of the transfer object must be done here rather than in the functions
          //so the journies share the same transfer object instance
          let transfers =
            resultData.transfersArray && resultData.transfersArray.length > 0
              ? resultData.transfersArray
              : [];
          resultData.journiesArray.forEach(journey => {
            if (journey.isSplit === true) {
              this.hasAnySplitTransfer = true;
              this.addOrUpdateSplitJourneyIdsByTransferIdMap(
                journey.transferId,
                journey.id
              );
            }
            if (this.isScheduled(journey)) {
              this.hasAnyScheduledTransfer = true;
            }
            journey.transferObject = {};
            let transfer = this.findTransferByTransferId(
              transfers,
              journey.transferId
            );
            if (transfer && transfer !== null) {
              transfer.flightArrivesDateTimeLocal = this.mininConvertMillisToDateTimeInValueFormat(
                transfer.flightArrivesDateTime
              );
              transfer.flightDepartsDateTimeLocal = this.mininConvertMillisToDateTimeInValueFormat(
                transfer.flightDepartsDateTime
              );
              journey.transferObject = transfer;
            }
            journey.pickUpDateTimeLocal = this.mininConvertMillisToDateTimeInValueFormat(
              journey.pickUpDateTime
            );

            //Only give the option to change the booking status if all status are still the same
            //otherwise booking will get messey
            if (journey.status) {
              if (journey.status === journeyStatsusConfirmed) {
                confirmedCount++;
              } else if (journey.status === journeyStatusEnquiry) {
                enquiryCount++;
              }
            }
          });

          //copy to form after any post loading processing is complete
          this.bookingForm = { ...result.data };

          //Only give the option to change the booking status if all status are still the same
          //otherwise booking will get messey
          if (enquiryCount === this.bookingForm.journiesArray.length) {
            this.showBookingChoice = true;
            Vue.set(this.bookingForm, "isConfirmed", false);
          } else if (confirmedCount === this.bookingForm.journiesArray.length) {
            this.showBookingChoice = true;
            Vue.set(this.bookingForm, "isConfirmed", true);
          }

          let initialDisplayMessages = [];
          let isEditingRestricted = false;

          if (this.hasInvoicedPayments() === true) {
            initialDisplayMessages.push(
              "Payment(s) recorded in the invoice system"
            );
            isEditingRestricted = true;
          }
          if (this.hasAnySplitTransfer === true) {
            initialDisplayMessages.push("At least one split journey");
            isEditingRestricted = true;
          }
          if (this.hasAnyScheduledTransfer === true) {
            initialDisplayMessages.push("At least one scheduled journey");
            isEditingRestricted = true;
          }
          if (this.hasInvoiceLoadError() === true) {
            initialDisplayMessages.push(
              "An issue loading the invoice details so any booking updates may not be correctly mirrored to the Invoice system"
            );
          }

          if (initialDisplayMessages.length > 0) {
            let message = `This booking has: ${initialDisplayMessages.join(
              "/"
            )}.`;
            message +=
              isEditingRestricted === true ? `Editing is restricted.` : ``;
            this.$message({
              message: message,
              type: "info",
              duration: 10000
            });
          }
        })
        .catch(error => {
          // we'll present something on screen using isEditing && bookingFound v-if
          console.error(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    async initPricingRules() {
      this.pricingRulesCache = await getPricingRules(this.companyId);
    },
    handleUpdateJourneyPricing(...args) {
      const data = args[0];

      const journeyIndex = data.journeyIndex;
      const pricingRuleUsed = data.pricingRule;
      const price = data.price;

      let journey = this.activeJournies[journeyIndex];
      if (journey.transferObject) {
        if (price && price !== null) {
          Vue.set(journey.transferObject, "price", price);
        }
        journey.transferObject.pricingRuleUsed = pricingRuleUsed;
      }
    },
    initForm() {
      this.bookingForm = this.mixinCreateEmptyBookingObject();
      Vue.set(this.bookingForm, "isConfirmed", false);
      this.showBookingChoice = true;

      if (this.isCreating) {
        this.handleAddEmptyJourney();
      }
    },

    saveOrUpdate(formName) {
      let customerInformationFormValid = false;

      // validate the booking form containing the firstName, lastNme etc.
      customerInformationFormValid = this.$refs.customerInformationFormRef.isValidForm();

      const journeyFormRefs = this.$refs.journeyFormRefs;
      let allJourneyFormsAreValid = true;
      journeyFormRefs.forEach(journeyForm => {
        if (!journeyForm.isValidForm()) {
          allJourneyFormsAreValid = false;
        }
      });

      if (customerInformationFormValid && allJourneyFormsAreValid) {
        this.loading = true;
        this.$emit("ignore-something-changed");
        if (this.isEditing) {
          this.updateBooking();
        } else {
          this.createBooking();
        }
      } else {
        this.$message({
          message:
            "Oops, there are errors to correct.<br/>Please check each journey form and the customer information form.",
          type: "error",
          duration: 5000,
          dangerouslyUseHTMLString: true
        });
        return false;
      }
    },

    createBooking() {
      this.bookingForm.journiesArray.forEach(journey => {
        journey.status = this.bookingForm.isConfirmed
          ? journeyStatsusConfirmed
          : journeyStatusEnquiry;
      });

      const booking = {
        ...this.bookingForm
      };
      // add the companyId into the booking got the callable function to use
      booking.companyId = this.companyId;

      const createBooking = firebaseFunctions.httpsCallable(
        "bookings-createBooking"
      );
      createBooking(booking)
        .then(result => {
          console.log("result", result);
          booking.id = result.data.bookingId;

          if (result.data && result.data.invoiceCallSuccess === false) {
            this.$message({
              message:
                "The booking was saved with an Invoice system error: " +
                result.data.invoiceCallErrorMessage,
              type: "error",
              duration: 7000
            });
          } else {
            this.$message({
              message: "The booking was saved",
              type: "success",
              duration: 5000
            });
          }

          // this.$store.dispatch("bookings/refreshBookingListCreated");
          this.$router.push({ path: "/bookings" });
        })
        .catch(error => {
          console.error(error);
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

    updateBooking() {
      if (this.showBookingChoice === true) {
        //Safeguard to only update active and non scheduld journies
        this.activeJournies.forEach(journey => {
          if (
            journey.status === journeyStatsusConfirmed ||
            journey.status === journeyStatusEnquiry
          ) {
            journey.status = this.bookingForm.isConfirmed
              ? journeyStatsusConfirmed
              : journeyStatusEnquiry;
          }
        });
      }

      const editedBooking = {
        ...this.bookingForm,
        id: this.bookingId,
        // add the companyId into the booking got the callable function to use
        companyId: this.companyId
      };
      // this.convertAllDatesToMilliseconds(editedBooking);
      // the callable function will remove the id from the form data for us.
      const updateBooking = firebaseFunctions.httpsCallable(
        "bookings-updateBooking"
      );
      updateBooking(editedBooking)
        .then(response => {
          if (response.data && response.data.invoiceCallSuccess === false) {
            this.$message({
              message:
                "The booking was update with an Invoice system error: " +
                response.data.invoiceCallErrorMessage,
              type: "error",
              duration: 7000
            });
          } else {
            this.$message({
              message: "The booking was updated",
              type: "success",
              duration: 5000
            });
          }

          if (
            this.resendBookingEmail === true ||
            this.sendPaymentLinkEmail === true
          ) {
            let data = {
              bookingId: this.bookingId,
              companyId: this.companyId
            };
            if (this.resendBookingEmail === true) {
              data.isUpdateResend = true;
            }
            if (this.sendPaymentLinkEmail === true) {
              data.isSendPaymentLink = true;
            }

            this.$emit("send-booking-email", data);
          }

          // this.$store.dispatch("bookings/refreshBookingListUpdated");
          this.$router.push({ path: "/bookings" });
        })
        .catch(error => {
          console.error(error);
          this.$message({
            message: "Saving failed: " + error,
            type: "error",
            duration: 7000
          });
        })
        .finally(() => {
          this.loading = false;
          this.isCreating = false;
        });
    },

    handleCancel() {
      this.isEditing = false;
      this.isCreating = false;
      this.$router.push({ path: "/bookings" });
    },
    handleAddEmptyJourney() {
      this.bookingForm.journiesArray.push(
        this.handleCreateEmptyJourneyObject()
      );
    },
    handleAddEmptyTransfer() {
      let transferObject = this.mixinCreateEmptyTransferObject();
      this.bookingForm.transfersArray.push(transferObject);
      return transferObject;
    },
    handleCreateEmptyJourneyObject() {
      let transferObject = this.handleAddEmptyTransfer();
      let journey = this.mixinCreateEmptyJourneyObject();
      journey.transferObject = transferObject;
      return journey;
    },
    canAddNewJourney() {
      return this.hasInvoicedPayments() === false;
    },
    hasInvoice() {
      return (typeof this.bookingForm.invoiceSummary !== "undefined") === true;
    },
    hasCardPayment() {
      return (typeof this.bookingForm.paymentSummary !== "undefined") === true;
    },
    hasInvoicedPayments() {
      return (
        this.hasInvoice() &&
        this.bookingForm.invoiceSummary.hasPayments === true
      );
    },
    showInfo(journey) {
      return this.isSplitTransfer(journey) || this.isScheduled(journey);
    },
    getBookingForm2Data(journey) {
      let transfer = journey.transferObject;

      return {
        journey: journey,
        transferObject: transfer,
        isScheduled: this.isScheduled(journey),
        isSplit: this.isSplitTransfer(journey),
        canEditPrice: this.hasInvoicedPayments() === false
      };
    },
    isSplitTransfer(journey) {
      if (journey.isSplit) {
        return journey.isSplit === true;
      }
      return false;
    },
    isScheduled(journey) {
      if (
        journey.status &&
        !(
          journey.status === journeyStatsusConfirmed ||
          journey.status === journeyStatusEnquiry
        )
      ) {
        return true;
      }
      return false;
    },
    canDeleteJourney(journey) {
      //Only allow confirmed/enquiry journies to be deleted
      if (this.isScheduled(journey) === true) {
        return false;
      }

      //Don't allow past commited journies to be deleted
      if (
        typeof journey.id !== "undefined" &&
        journey.id.length > 0 &&
        journey.pickUpDateTime < this.dateTimeNow
      ) {
        return false;
      }

      if (this.hasInvoicedPayments() === true) {
        return false;
      }

      //Only allow journey delete if there is more than one journey
      return this.activeJournies.length > 1;
    },
    handleDeleteJourney(journey, journeyId) {
      if (typeof journeyId !== "undefined") {
        console.log("Deleting journey", journeyId);
        var journeyIndex = this.findJourneyIndexByJourneyId(journeyId);
        Vue.set(this.bookingForm.journiesArray[journeyIndex], "active", false);
        //delete from map so primary redraws
        this.deleteFromSplitJourneyIdsByTransferIdMap(
          journey.transferId,
          journeyId
        );
      } else {
        //New journey - just delete it from the array
        var journeyIndex = this.bookingForm.journiesArray.indexOf(journey);
        console.log("Removing new journey Index: ", journeyIndex);
        if (journeyIndex !== -1) {
          this.bookingForm.journiesArray.splice(journeyIndex, 1);
        }
        let transferObject = journey.transferObject;
        var transferIndex = this.bookingForm.transfersArray.indexOf(
          transferObject
        );
        console.log("Removing new transfer Index: ", transferIndex);
        if (transferIndex !== -1) {
          this.bookingForm.transfersArray.splice(transferIndex, 1);
        }
      }
    },
    findJourneyIndexByJourneyId: function(journeyId) {
      return this.bookingForm.journiesArray.findIndex(
        item => item.id === journeyId
      );
    },
    findTransferByTransferId: function(transfers, transferId) {
      let transfer = null;
      let index = transfers.findIndex(item => item.id === transferId);
      if (index !== -1) {
        transfer = transfers[index];
      }
      return transfer;
    },
    showInvoicing() {
      if (!this.isEditing) {
        return false;
      }

      if (this.isInvoiceSystemAvailable === true || this.hasInvoice()) {
        return true;
      }
      return false;
    },
    showPayment() {
      if (!this.isEditing) {
        return false;
      }

      if (this.isPaymentSystemAvailable === true && this.hasCardPayment()) {
        return true;
      }
      return false;
    },
    hasInvoiceLoadError() {
      return (
        this.hasInvoice() &&
        this.bookingForm.invoiceSummary.hasLoadError === true
      );
    },
    canSendPaymentLink() {
      let hasCompletedCardPayment =
        this.hasCardPayment() &&
        this.bookingForm.paymentSummary.hasCompletedCardPayment === true;
      return (
        this.isPaymentSystemAvailable === true &&
        this.isEditing === true &&
        (this.hasCardPayment() === false || hasCompletedCardPayment === false)
      );
    },
    handleCanSendPaymentLinkChange() {
      if (this.sendPaymentLinkEmail === true) {
        this.$message({
          message:
            "Remember to click 'Update Booking' to send the payment link to the customer",
          type: "info",
          duration: 5000
        });
      }
    },
    addOrUpdateSplitJourneyIdsByTransferIdMap(transferId, journeyId) {
      if (this.splitJourneyIdsByTransferIdMap.has(transferId)) {
        let journies = this.splitJourneyIdsByTransferIdMap.get(transferId);
        if (!journies.find(x => x === journeyId)) {
          journies.push(journeyId);
        }
      } else {
        this.splitJourneyIdsByTransferIdMap.set(transferId, [journeyId]);
      }
    },
    deleteFromSplitJourneyIdsByTransferIdMap(transferId, journeyId) {
      if (this.splitJourneyIdsByTransferIdMap.has(transferId)) {
        let journies = this.splitJourneyIdsByTransferIdMap.get(transferId);
        let index = journies.indexOf(journeyId);
        if (index > -1) {
          let spliced = journies.splice(index, 1);
        }
      }
    },
    canDisplay(transferId, journeyId) {
      if (!journeyId || !transferId) {
        //new booking
        return true;
      }
      if (this.splitJourneyIdsByTransferIdMap.has(transferId) === false) {
        return true;
      }
      let journies = this.splitJourneyIdsByTransferIdMap.get(transferId);
      if (journies.length === 1) {
        //if in map but journey items lenght = 1 - Display - could have been split in the past and then one section archived
        return true;
      }
      let index = journies.indexOf(journeyId);
      if (index < 1) {
        //not found OR first item display
        return true;
      }

      return false;
    }
  }
};
</script>

<style lang="scss" scoped></style>
