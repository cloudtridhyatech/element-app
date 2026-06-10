<template>
  <div v-loading="loading">
    <div v-if="mixinCanReadBookings(loggedInUser)">
      <EntityEmptyState
        v-if="!oneOrMoreJourniesExist"
        message="No journies have been taken or created ..."
        instruction="You can create a new journey by creating a new booking"
        buttonText
        image="nothing-found"
      />
      <PageHeader :breadCrumb="breadCrumb"></PageHeader>

      <section v-if="oneOrMoreJourniesExist" class="mt-6">
        <JourneyList />
      </section>
    </div>
    <div v-else>
      You do not have permission to view/edit bookings and journies.
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb, firebaseFunctions } from "@/plugins/firebase.js";

import { bookingPermissionsMixin } from "@/statics/auth/bookingPermissions.js";

import PageHeader from "@/components/Shared/PageHeader";
import EntityEmptyState from "@/components/EmptyStates/EntityEmptyState";
import JourneyList from "@/components/Journey/JourneyList";

export default {
  mixins: [bookingPermissionsMixin],

  components: {
    JourneyList,
    EntityEmptyState,
    PageHeader,
  },

  data() {
    return {
      breadCrumb: {
        routeName: "Journies",
        title: "Existing Journies",
      },
      loading: true,
      bookingId: "",
      existingBooking: null,
      shouldOpenDialog: false,

      oneOrMoreJourniesExist: false,
    };
  },

  created() {
    this.checkOneOrMoreJourniesExist();
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId",
    }),
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser",
    }),
  },

  methods: {
    async checkOneOrMoreJourniesExist() {
      const ref = fireDb
        .collection("companies")
        .doc(this.companyId)
        .collection("journies")
        .limit(1); // limit to 1 as only performing a check here for 1 or more.

      try {
        const snapshot = await ref.get();

        if (snapshot.docs.length > 0) {
          console.log("READ ", snapshot.docs.length, " journey documents.");
          this.oneOrMoreJourniesExist = true;
        } else {
          console.log("No bookings exists");
          this.oneOrMoreJourniesExist = false;
        }

        this.loading = false;

        // console.log(this.existingBooking);
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
