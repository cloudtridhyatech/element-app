<template>
  <div>
    <div v-if="mixinCanReadBookings(loggedInUser)">
      <PageHeader :breadCrumb="breadCrumb"> </PageHeader>
    </div>
    <div v-else>You do not have permission to view/edit bookings.</div>

    <BookingForm
      v-on:send-booking-email="editBookingSendEmail"
      v-on:something-changed="setUnsavedChanges(true)"
      v-on:ignore-something-changed="setUnsavedChanges(false)"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { bookingPermissionsMixin } from "@/statics/auth/bookingPermissions.js";
import { sendBookingEmail } from "@/statics/booking/functions.js";

import PageHeader from "@/components/Shared/PageHeader";
import BookingForm from "@/components/Bookings/BookingForm";

export default {
  mixins: [bookingPermissionsMixin],

  components: {
    BookingForm,
    PageHeader
  },

  computed: {
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    })
  },

  data() {
    return {
      breadCrumb: {
        routeName: "Create / Edit booking",
        title: "Create / Edit booking"
      },

      unsavedChanges: false
    };
  },

  beforeRouteLeave(to, from, next) {
    if (this.unsavedChanges) {
      const answer = window.confirm(
        "Do you really want to leave? You have unsaved changes!"
      );
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },

  methods: {
    async editBookingSendEmail(data) {
      await sendBookingEmail(data);
    },

    setUnsavedChanges(value) {
      console.log("setUnsavedChanges");
      this.unsavedChanges = value;
    }
  }
};
</script>

<style lang="scss" scoped></style>
