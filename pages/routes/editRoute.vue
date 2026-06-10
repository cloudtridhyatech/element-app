<template>
  <div>
    <div v-if="mixinCanEditPlacesAndRoutes(loggedInUser)">
      <PageHeader :breadCrumb="breadCrumb"> </PageHeader>
    </div>
    <div v-else>You do not have permission to view/edit routes.</div>

    <RouteForm />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { placeAndRoutePermissionsMixin } from "@/statics/auth/placeAndRoutePermissions.js";

import PageHeader from "@/components/Shared/PageHeader";
import RouteForm from "@/components/Routes/RouteForm";

export default {
  mixins: [placeAndRoutePermissionsMixin],

  components: {
    RouteForm,
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
        routeName: "Create / Edit route",
        title: "Create / Edit route"
      }
    };
  }
};
</script>
