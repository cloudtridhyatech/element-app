<template>
  <div>
    <div v-if="mixinCanEditPlacesAndRoutes(loggedInUser)">
      <PageHeader :breadCrumb="breadCrumb"> </PageHeader>
    </div>
    <div v-else>You do not have permission to view/edit places.</div>

    <PlaceForm />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { placeAndRoutePermissionsMixin } from "@/statics/auth/placeAndRoutePermissions.js";

import PageHeader from "@/components/Shared/PageHeader";
import PlaceForm from "@/components/Routes/PlaceForm";

export default {
  mixins: [placeAndRoutePermissionsMixin],

  components: {
    PlaceForm,
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
        routeName: "Create / Edit place",
        title: "Create / Edit place"
      }
    };
  }
};
</script>
