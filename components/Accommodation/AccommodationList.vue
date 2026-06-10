<template>
  <div v-loading="loading">
    <section class="">
      <AccommodationSearchForm
        v-on:clear-search-results="clearSearchResults"
        v-on:show-search-result="showSearchResult"
      />
    </section>

    <section v-if="mixinCanReadAccommodations(loggedInUser)">
      <el-card class="c74-list-section">
        <div slot="header" class="flex flex-row justify-between">
          <div>Accommodations</div>
          <div @click="handleRefresh">
            <i class="el-icon-refresh"></i>
          </div>
        </div>        

        <el-table
          :data="accommodations"
          style="width: 100%"
          :default-sort="{ prop: 'accommodationName', order: 'ascending' }"
        >
          <el-table-column label="Tour Operator">
            <template slot-scope="scope">
              <span v-if="scope.row.tourOperatorId">
                {{ getTourOperatorName(scope.row.tourOperatorId) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Location">
            <template slot-scope="scope">
              <span v-if="scope.row.placeId">
                {{ getPlaceName(scope.row.placeId) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="Name"
            prop="accommodationName"
            sortable
          ></el-table-column>

          <el-table-column align="right">
            <template slot-scope="scope">
              <el-button
                v-if="mixinCanEditAccommodations(loggedInUser)"
                size="medium"
                @click="handleEdit(scope.$index, scope.row)"
                type="primary"
                icon="el-icon-edit"
              ></el-button>
              <el-popconfirm
                v-if="mixinCanArchiveAccommodations(loggedInUser)"
                confirmButtonText="OK"
                cancelButtonText="No, Thanks"
                icon="el-icon-info"
                iconColor="red"
                title="Are you sure to archive this accommodation?"
                @confirm="handleArchive(scope.$index, scope.row)"
              >
                <el-button
                  slot="reference"
                  size="medium"
                  type="danger"
                  icon="el-icon-document-remove"
                ></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <Pager
          :results="accommodations"
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
import { fireDb } from "@/plugins/firebase.js";

import Pager from "@/components/Pager/Pager";
import { accommodationPermissionsMixin } from "@/statics/auth/accommodationPermissions.js";

import AccommodationSearchForm from "@/components/Accommodation/AccommodationSearchForm";

export default {
  mixins: [accommodationPermissionsMixin],

  components: {
    Pager,
    AccommodationSearchForm
  },

  props: {
    allActiveTourOperators: { type: Array, required: true },
    allPlaces: { type: Array, required: true }
  },

  data() {
    return {
      loading: true,

      currentPageSize: 10,
      currentPage: 1,
      noMoreResults: false,

      accommodations: [],
      firstAccommodationDisplayed: null,
      lastAccommodationDisplayed: null
    };
  },
  created() {
    this.initAccommodations();
  },
  computed: {
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    }),

    ...mapGetters("companies", {
      companyId: "getCompanyId"
    })
  },

  methods: {
    clearSearchResults() {
      this.initAccommodations();
    },

    showSearchResult(accommodation) {
      this.accommodations = [];
      this.accommodations.push(accommodation);
    },

    async initAccommodations() {
      this.accommodations = [];

      const field = "created";
      const ref = fireDb
        .collection("companies")
        .doc(this.companyId)
        .collection("accommodations");

      // const query = ref.orderBy(field, "desc").limit(this.currentPageSize);
      const query = ref.orderBy(field, "desc").limit(this.currentPageSize);
      let snapshot;

      try {
        snapshot = await query.get();

        this.pushAccommodationsToArray(snapshot);

        this.setFirstAndLastAccommodationsDisplayed();

        this.loading = false;
      } catch (error) {
        console.error(
          "Unable to pull accommodations from the data store. ",
          error
        );
        this.loading = false;
      }
    },

    setFirstAndLastAccommodationsDisplayed() {
      if (this.accommodations[0]) {
        this.firstAccommodationDisplayed = this.accommodations[0];
      }

      if (this.accommodations[this.accommodations.length - 1]) {
        this.lastAccommodationDisplayed = this.accommodations[
          this.accommodations.length - 1
        ];
      }
    },

    pushAccommodationsToArray(snapshot) {
      this.accommodations = [];

      for (const doc of snapshot.docs) {
        let accommodation = doc.data();
        accommodation.id = doc.id;
        this.accommodations.push(accommodation);
      }

      console.log(
        "READ ",
        this.accommodations.length,
        " accommodation documents."
      );
    },

    async handleNextClick() {
      console.log("handleNextClick");

      this.loading = true;
      const field = "created";

      const ref = fireDb
        .collection("companies")
        .doc(this.companyId)
        .collection("accommodations");

      const query = ref
        .orderBy(field, "desc")
        .startAfter(this.lastAccommodationDisplayed[field])
        .limit(this.currentPageSize);

      let snapshot;

      try {
        snapshot = await query.get();

        if (snapshot.docs.length > 0) {
          this.currentPage++;
          this.pushAccommodationsToArray(snapshot);

          this.setFirstAndLastAccommodationsDisplayed();
        } else {
          this.noMoreResults = true;

          this.$notify.warning({
            title: "No More Results",
            message: "No more accommodations to view.",
            offset: 100
          });
        }

        this.loading = false;
      } catch (error) {
        console.error(
          "Unable to pull accommodations from the data store",
          error
        );
      }
    },

    async handlePreviousClick() {
      console.log("handlePreviousClick");

      this.loading = true;
      this.currentPage--;
      this.noMoreResults = false;
      const field = "created";

      const ref = fireDb
        .collection("companies")
        .doc(this.companyId)
        .collection("accommodations");

      const query = ref
        .orderBy(field, "desc")
        .endBefore(this.firstAccommodationDisplayed[field])
        .limitToLast(this.currentPageSize);

      let snapshot;

      try {
        snapshot = await query.get();

        this.pushAccommodationsToArray(snapshot);

        this.setFirstAndLastAccommodationsDisplayed();

        this.loading = false;
      } catch (error) {
        console.error(
          "Unable to pull accommodations from the data store",
          error
        );
      }
    },

    handleChangeResultsPerPage(currentPageSizeValue) {
      console.log("handleChangeResultsPerPage");
      this.currentPageSize = +currentPageSizeValue;
      this.initAccommodations();
    },

    getTourOperatorName(tourOperatorId) {
      if (tourOperatorId) {
        const tourOperatorFound = this.allActiveTourOperators.find(
          tourOp => tourOp.id === tourOperatorId
        );
        if (tourOperatorFound) {
          return tourOperatorFound.name;
        }
      }
    },

    getPlaceName(placeId) {
      console.log("placeId", placeId);
      if (placeId) {
        const placeFound = this.allPlaces.find(
          place => place.id === placeId
        );
        if (placeFound) {
          return placeFound.name;
        }
      }
    },

    handleEdit(index, row) {
      if (this.mixinCanEditAccommodations(this.loggedInUser)) {
        this.$emit("load-existing-accommodation", row.id);
        this.$emit("open-form");
      }
    },
    handleArchive(index, row) {
      if (this.mixinCanArchiveAccommodations(this.loggedInUser)) {
        // make a copy of the vuex object as we shouldn't directly mutate the vuex object
        const archivedAccommodation = {
          ...row
        };
        // change the active status on the copied object
        archivedAccommodation.active = false;

        this.$store
          .dispatch("accommodations/editAccommodation", archivedAccommodation)
          .then(() => {
            this.$notify.success({
              title: "Success",
              message: "The accommodation was archived",
              offset: 100
            });
          });
      }
    },
    handleRefresh() {
      this.initAccommodations();
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
