<template>
  <section class="mt-6">
    <el-card>
      <div slot="header" class>Filter the accommodations</div>
      <el-form ref="form" :model="form">
        <div>
          <el-select
            v-model="form.searchValue"
            clearable
            filterable
            remote
            placeholder="Search accommodation by name, tour operator or place"
            :remote-method="handleSearchAccommodation"
            :loading="form.accommodationSearchLoading"
            @change="handleSearchChange"
            class="c74-block-select"
          >
            <el-option
              v-for="item in form.searchResultOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
      </el-form>
    </el-card>
  </section>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb, firebaseFunctions } from "@/plugins/firebase.js";
import {
  queryAccommodation,
  mergeAccommodationLists
} from "@/statics/accommodation/functions.js";

export default {
  data() {
    return {
      form: {
        searchValue: "",
        accommodationSearchLoading: false,
        searchResultOptions: []
      }
    };
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("companies", {
      companyKey: "getCompanyKey"
    })
  },

  methods: {
    async handleSearchChange(value) {
      // clear the previous search results if the select was cleared
      if (!value) {
        this.form.searchResultOptions = [];
        this.$emit("clear-search-results");
      } else {
        const docRef = fireDb
          .collection("companies")
          .doc(this.companyId)
          .collection("accommodations")
          .doc(this.form.searchValue);

        try {
          const doc = await docRef.get();
          if (doc.exists) {
            let accommodation = doc.data();
            accommodation.id = doc.id;

            this.$emit("show-search-result", accommodation);
          }
        } catch (error) {
          console.error(
            "Unable to pull accommodations from the data store. ",
            error
          );
        }
      }
    },

    async handleSearchAccommodation(query) {
      if (!query) {
        return;
      }

      this.form.accommodationSearchLoading = true;
      this.form.searchResultOptions = [];

      let results = await queryAccommodation(query, this.companyId);

      this.form.searchResultOptions = mergeAccommodationLists(
        results,
        this.form.searchResultOptions
      );

      this.form.accommodationSearchLoading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.c74-block-select {
  display: block;
}
</style>
