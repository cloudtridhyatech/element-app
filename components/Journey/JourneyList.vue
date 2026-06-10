<template>
  <div v-loading="loading">
    <section>
      <JourneySearchForm
        v-on:date-changed="handleDateChanged"
        v-on:status-changed="handleStatusChanged"
        v-on:journey-type-changed="handleJourneyTypeChanged"
      />
    </section>

    <section v-if="mixinCanReadBookings(loggedInUser)" class="mt-12">
      <el-card>
        <div slot="header" class="flex flex-row justify-between">
          <div>Journies</div>
          <div @click="handleRefresh">
            <i class="el-icon-refresh"></i>
          </div>
        </div>

        <el-table :data="journies" style="width: 100%">
          <el-table-column label="Route">
            <template slot-scope="scope"
              >{{ getPlaceNameFromId(scope.row.fromPlaceId) }} -
              {{ getPlaceNameFromId(scope.row.toPlaceId) }}</template
            >
          </el-table-column>
          <el-table-column label="Type" prop="journeyType"></el-table-column>
          <el-table-column label="Pick Up" prop="pickUpDateTime" sortable>
            <template slot-scope="scope">{{
              mixinFormatFirestoreDateAndTime(
                scope.row.pickUpDateTime,
                "MMMM Do YYYY HH:mm"
              )
            }}</template>
          </el-table-column>

          <el-table-column label="Status" prop="status"></el-table-column>
        </el-table>

        <Pager
          :results="journies"
          :current-page="currentPage"
          :current-page-size="currentPageSize"
          :page-sizes="[5, 10, 15, 20]"
          :no-more-results="noMoreResults"
          v-on:handle-previous-click="handlePreviousClick"
          v-on:handle-next-click="handleNextClick"
          v-on:handle-change-results-per-page="handleChangeResultsPerPage"
        />
      </el-card>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb, firebaseFunctions } from "@/plugins/firebase.js";
import moment from "moment";

import Pager from "@/components/Pager/Pager";
import { bookingPermissionsMixin } from "@/statics/auth/bookingPermissions.js";

import JourneySearchForm from "@/components/Journey/JourneySearchForm";
import { dateUtilsMixin } from "@/statics/utils/dateUtils.js";

export default {
  mixins: [dateUtilsMixin, bookingPermissionsMixin],

  components: {
    Pager,
    JourneySearchForm
  },

  data() {
    return {
      search: "",
      loading: true,

      currentPageSize: 5,
      currentPage: 0,
      noMoreResults: false,

      journies: [],
      firstJourneyDisplayed: null,
      lastJourneyDisplayed: null,

      form: {
        fromDate: "",
        status: "",
        journeyType: ""
      }
    };
  },

  created() {
    if (this.allPlaces.length === 0) {
      this.$store.dispatch("places/initPlaces").then(() => {});
    }

    this.initJournies();
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
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    })
  },

  methods: {
    handleDateChanged(value) {
      this.form.fromDate = value;
      this.currentPage = 0;
      this.executeJourneySearch();
    },

    handleStatusChanged(value) {
      console.log("handleStatusChanged", value);
      this.currentPage = 0;
      this.form.status = value;
      this.executeJourneySearch();
    },
    handleJourneyTypeChanged(value) {
      this.form.journeyType = value;
      this.currentPage = 0;
      this.executeJourneySearch();
    },

    handleRefresh() {
      this.loading = true;
      this.initJournies();
    },

    initJournies() {
      let now = moment();

      // remove the time of day from the date as this will affect results.
      now
        .hours(0)
        .minutes(0)
        .seconds(0);

      this.form.fromDate = now.toDate();

      // execute search
      this.executeJourneySearch();
    },

    executeJourneySearch() {
      this.loading = true;
      this.journies = [];

      console.log(
        "executeJourneySearch",
        this.form.fromDate,
        this.form.status,
        this.form.journeyType
      );
      const executeFulltextSearch = firebaseFunctions.httpsCallable(
        "journies-executeFulltextSearchOfJournies"
      );

      executeFulltextSearch({
        fromDateUnixTimestamp: this.form.fromDate.getTime(),
        status: this.form.status,
        journeyType: this.form.journeyType,
        companyKey: this.companyKey,
        companyId : this.companyId,
        page: this.currentPage,
        hitsPerPage: this.currentPageSize
      })
        .then(result => {
          result.data.forEach(hit => {
            this.journies.push({ ...hit });
          });

          this.loading = false;
        })
        .catch(error => {
          console.error(
            "Unable to pull journies names from the fulltext (Algolia) store. ",
            error
          );
        });
    },

    setFirstAndLastJourniesDisplayed() {
      if (this.bookings[0]) {
        this.firstJourneyDisplayed = this.bookings[0];
      }

      if (this.bookings[this.bookings.length - 1]) {
        this.lastJourneyDisplayed = this.bookings[this.bookings.length - 1];
      }
    },

    getPlaceNameFromId(id) {
      const place = this.allPlaces.find(place => place.id === id);
      if (place) {
        return place.name;
      }
      return "";
    },

    handlePreviousClick() {
      if (this.currentPage > 0) {
        this.currentPage--;
      }
      this.executeJourneySearch();
    },

    handleNextClick() {
      this.currentPage++;
      this.executeJourneySearch();
    },

    handleChangeResultsPerPage(currentPageSizeValue) {
      this.currentPageSize = +currentPageSizeValue;
      // go back to page 0
      this.currentPage = 0;
      this.executeJourneySearch();
    }
  }
};
</script>

<style lang="scss" scoped>
.c74-horizontal-form {
  display: flex;
  justify-content: flex-end;

  form {
    width: 500px;
  }

  .el-select {
    width: 135px;
  }
  .c74-input-with-select .el-input-group__prepend {
    background-color: #fff;
  }

  .c74-input-with-select {
    input {
      width: 250px;
    }
  }
}
</style>
