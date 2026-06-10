<template>
  <div v-loading="loading">
    <div v-if="mixinCanReadPricingRules(loggedInUser)">
      <PageHeader :breadCrumb="breadCrumb"> </PageHeader>
    </div>
    <div v-else>You do not have permission to view/edit bookings.</div>

    <PricingForm />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { pricingRulesPermissionsMixin } from "@/statics/auth/pricingRulesPermissions.js";

import PageHeader from "@/components/Shared/PageHeader";
import PricingForm from "@/components/Pricing/PricingForm";

export default {
  mixins: [pricingRulesPermissionsMixin],

  components: {
    PricingForm,
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
        routeName: "Create / Edit pricing rule",
        title: "Create / Edit pricing rule"
      },
      loading: false
    };
  }
};
</script>

<style lang="scss" scoped></style>
