<template>
  <div v-loading="loading">
    <BookingSearchForm v-on:booking-search="handleSearch" />

    <div class="mt-6 flex flex-col">
      <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div
            class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
          >
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Booking Ref
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Updated
                  </th>

                  <th scope="col" class="relative px-6 py-3">
                    <div @click="handleRefresh" class="flex justify-end">
                      <i class="el-icon-refresh"></i>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="booking in bookings"
                  :key="booking.id"
                  class="hover:bg-gray-100"
                >
                  <td class="px-6 py-4 whitespace-no-wrap">
                    <div class="flex items-center">
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ booking.firstName }} {{ booking.lastName }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ booking.email }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ booking.mobile }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-no-wrap">
                    <div class="text-sm text-gray-500">
                      {{ booking.bookingRef }}
                    </div>
                  </td>
                  <td
                    class="px-6 py-4 whitespace-no-wrap text-sm text-gray-500"
                  >
                    {{
                      mixinFormatFirestoreDateAndTime(
                        booking.created,
                        "DD/MM/yyyy HH:mm"
                      )
                    }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-no-wrap text-sm text-gray-500"
                  >
                    {{
                      mixinFormatFirestoreDateAndTime(
                        booking.lastModified,
                        "DD/MM/yyyy HH:mm"
                      )
                    }}
                  </td>

                  <td
                    class="px-6 py-4 whitespace-no-wrap text-right text-sm font-medium"
                  >
                    <el-button
                      v-if="mixinCanEditBookings(loggedInUser)"
                      size="medium"
                      @click="handleEditBooking(booking.id)"
                      type="primary"
                      icon="el-icon-edit"
                    ></el-button>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="Resend booking confirmation email"
                      placement="right"
                    >
                      <el-popconfirm
                        title="The will resend the booking confirmation to the customer. Are you sure?"
                        confirmButtonText="YES"
                        cancelButtonText="No"
                        icon="el-icon-info"
                        iconColor="red"
                        @confirm="handleResendBookingEmail(booking.id)"
                      >
                        <el-button
                          slot="reference"
                          v-if="mixinCanEditBookings(loggedInUser)"
                          size="medium"
                          type="info"
                          icon="el-icon-message"
                        ></el-button>
                      </el-popconfirm>
                    </el-tooltip>
                  </td>
                </tr>

                <!-- More items... -->
              </tbody>
            </table>

            <div
              class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
            >
              <div
                class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
              >
                <Pager
                  :results="bookings"
                  :current-page="currentPage"
                  :current-page-size="currentPageSize"
                  :page-sizes="[5, 10, 15, 20]"
                  :no-more-results="noMoreResults"
                  v-on:handle-previous-click="handlePreviousClick"
                  v-on:handle-next-click="handleNextClick"
                  v-on:handle-change-results-per-page="
                    handleChangeResultsPerPage
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb, firebaseFunctions } from "@/plugins/firebase.js";

import Pager from "@/components/Pager/Pager";
import { bookingPermissionsMixin } from "@/statics/auth/bookingPermissions.js";
import { dateUtilsMixin } from "@/statics/utils/dateUtils.js";
import { sendBookingEmail } from "@/statics/booking/functions.js";

import BookingSearchForm from "@/components/Bookings/BookingSearchForm";

export default {
  mixins: [dateUtilsMixin, bookingPermissionsMixin],

  components: {
    Pager,
    BookingSearchForm
  },

  data() {
    return {
      loading: true,

      currentPageSize: 5,
      currentPage: 0,
      noMoreResults: false,

      bookings: [],
      firstBookingDisplayed: null,
      lastBookingDisplayed: null,
      searchForm: {
        searchBookingRef: "",
        searchFirstName: "",
        searchLastName: "",
        searchMobile: "",
        searchEmail: ""
      }
    };
  },

  created() {
    this.initBookings();
  },

  computed: {
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    }),
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("companies", {
      companyKey: "getCompanyKey"
    }),
    ...mapGetters("bookings", {
      lastBookingListCreatedRefeshTime: "getLastBookingListCreatedRefeshTime",
      lastBookingListUpdatedRefeshTime: "getLastBookingListUpdatedRefeshTime"
    })
  },
  watch: {
    lastBookingListCreatedRefeshTime: function(value, oldValue) {
      if (value > oldValue) {
        this.handleRefresh();
      }
    },
    lastBookingListUpdatedRefeshTime: function(value, oldValue) {
      if (value > oldValue) {
        this.executeBookingSearch();
      }
    }
  },

  methods: {
    handleRefresh() {
      this.searchForm = {
        searchBookingRef: "",
        searchFirstName: "",
        searchLastName: "",
        searchMobile: "",
        searchEmail: ""
      };
      this.currentPage = 0;
      this.executeBookingSearch();
    },

    async handleSearch(searchFormData) {
      this.searchForm = searchFormData;
      this.currentPage = 0;
      this.executeBookingSearch();
    },

    executeBookingSearch() {
      this.loading = true;

      this.bookings = [];

      const searchBookingRef = this.searchForm.searchBookingRef;
      const searchFirstName = this.searchForm.searchFirstName;
      const searchLastName = this.searchForm.searchLastName;
      const searchMobile = this.searchForm.searchMobile;
      const searchEmail = this.searchForm.searchEmail;

      console.log(
        "executeBookingSearchStart",
        searchBookingRef,
        searchFirstName,
        searchLastName,
        searchMobile,
        searchEmail
      );

      const executeFulltextSearch = firebaseFunctions.httpsCallable(
        "bookings-executeFulltextSearchOfBookings"
      );

      executeFulltextSearch({
        searchBookingRef: searchBookingRef,
        searchFirstName: searchFirstName,
        searchLastName: searchLastName,
        searchMobile: searchMobile,
        searchEmail: searchEmail,
        companyKey: this.companyKey,
        companyId: this.companyId,
        page: this.currentPage,
        hitsPerPage: this.currentPageSize
      })
        .then(result => {
          result.data.forEach(hit => {
            this.bookings.push({ ...hit });
          });

          this.loading = false;
        })
        .catch(error => {
          console.error(
            "Unable to pull journies names from the fulltext (Algolia) store. ",
            error
          );
        });

      console.log("executeBookingSearchComplete");
    },

    initBookings() {
      // execute search
      this.executeBookingSearch();
    },

    handleEditBooking(bookingId) {
      if (this.mixinCanEditBookings(this.loggedInUser)) {
        this.$root.$router.push({
          path: "/bookings/edit",
          query: { bookingId: bookingId }
        });
      }
    },

    setFirstAndLastBookingsDisplayed() {
      if (this.bookings[0]) {
        this.firstBookingDisplayed = this.bookings[0];
      }

      if (this.bookings[this.bookings.length - 1]) {
        this.lastBookingDisplayed = this.bookings[this.bookings.length - 1];
      }
    },

    pushBookingsToArray(snapshot) {
      this.bookings = [];

      for (const doc of snapshot.docs) {
        let booking = doc.data();
        booking.id = doc.id;
        this.bookings.push(booking);
      }

      console.log("READ ", this.bookings.length, " bookings documents.");
    },

    async handleNextClick() {
      console.log("handleNextClick");
      this.currentPage++;
      this.executeBookingSearch();
    },

    async handlePreviousClick() {
      console.log("handlePreviousClick");

      if (this.currentPage > 0) {
        this.currentPage--;
      }
      this.executeBookingSearch();
    },

    handleChangeResultsPerPage(currentPageSizeValue) {
      console.log("handleChangeResultsPerPage");
      this.currentPageSize = +currentPageSizeValue;
      // go back to page 0
      this.currentPage = 0;
      this.executeBookingSearch();
    },

    async handleResendBookingEmail(bookingId) {
      await sendBookingEmail(
        {
          companyId:this.companyId,
          companyKey:this.companyKey,
          bookingId: bookingId,
          isManualResend: true
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.c74-list-section {
  margin: 48px 0px;

  .c74-card-header {
    display: flex;
    justify-content: space-between;

    .c74-list-controls {
      display: flex;
      margin-right: 14px;

      div:not(:last-child) {
        margin-right: 24px;
      }
    }
  }
}
</style>
