<template>
  <div>
    <div v-if="mixinCanEditPlacesAndRoutes(loggedInUser)">
      <PageHeader :breadCrumb="breadCrumb"> </PageHeader>
    </div>
    <div v-else>You do not have permission to view/edit groups of places.</div>

    <GroupForm />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { placeAndRoutePermissionsMixin } from "@/statics/auth/placeAndRoutePermissions.js";

import PageHeader from "@/components/Shared/PageHeader";
import GroupForm from "@/components/Routes/GroupForm";

export default {
  mixins: [placeAndRoutePermissionsMixin],

  components: {
    GroupForm,
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
        routeName: "Create / Edit group",
        title: "Create / Edit group"
      }
    };
  }
};
</script>
