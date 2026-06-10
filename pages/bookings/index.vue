<template>
  <div v-loading="loading">
    <div v-if="mixinCanReadBookings(loggedInUser)">
      <EntityEmptyState
        v-if="!oneOrMoreBookingsExist"
        v-on:create-new-entity="createNewBooking"
        message="No bookings have been taken or created ..."
        instruction="You can create a new booking on behalf of a client"
        buttonText="Create New Booking!"
        image="nothing-found"
      />

      <PageHeader :breadCrumb="breadCrumb">
        <slot>
          <section>
            <el-button
              type="primary"
              @click="createNewBooking"
              icon="el-icon-circle-plus"
              >Create New Booking</el-button
            >
          </section>
        </slot>
      </PageHeader>

      <section v-if="oneOrMoreBookingsExist" class="mt-6">
        <BookingList />
      </section>
    </div>
    <div v-else>You do not have permission to view/edit bookings.</div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb, firebaseFunctions } from "@/plugins/firebase.js";

import { bookingPermissionsMixin } from "@/statics/auth/bookingPermissions.js";

import EntityEmptyState from "@/components/EmptyStates/EntityEmptyState";
import PageHeader from "@/components/Shared/PageHeader";
import BookingList from "@/components/Bookings/BookingList";

export default {
  mixins: [bookingPermissionsMixin],

  components: {
    BookingList,
    EntityEmptyState,
    PageHeader
  },

  data() {
    return {
      breadCrumb: {
        routeName: "Existing Bookings",
        title: "Existing Bookings"
      },
      loading: true,

      oneOrMoreBookingsExist: false
    };
  },

  created() {
    this.checkOneOrMoreBookingsExist();
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("companies", {
      companyKey: "getCompanyKey"
    }),
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    })
  },

  methods: {
    createNewBooking() {
      this.$router.push({ path: "bookings/edit" });
    },

    async checkOneOrMoreBookingsExist() {
      const ref = fireDb
        .collection("companies")
        .doc(this.companyId)
        .collection("bookings")
        .limit(1); // avoid reading lots of documents as we are only running a check for 1 or more here

      try {
        const snapshot = await ref.get();

        if (snapshot.docs.length > 0) {
          console.log("READ ", snapshot.docs.length, " booking documents.");
          this.oneOrMoreBookingsExist = true;
        } else {
          console.log("No bookings exists");
          this.oneOrMoreBookingsExist = false;
        }

        this.loading = false;

        // console.log(this.existingBooking);
      } catch (e) {
        console.error(e);
      }
    },
  }
};
</script>

<style lang="scss" scoped></style>
