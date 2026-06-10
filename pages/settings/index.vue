<template>
  <div v-if="mixinCanReadSettings(loggedInUser)">
    <PageHeader :breadCrumb="breadCrumb">
      <slot> </slot>
    </PageHeader>
    <section>
      <EditableSettings
        :editableSettings="editableSettings"
        :loading="loading"
        :showPayments="showPayments"
      />
    </section>
  </div>
  <div v-else>You do not have permission.</div>
</template>

<script>
import {
  getEditableSettingsData,
  getSettingsData,
  isSystemAllowed
} from "@/statics/settings/functions.js";
import { mapGetters } from "vuex";

import PageHeader from "@/components/Shared/PageHeader";
import EditableSettings from "@/components/Settings/EditableSettings";

import { settingsPermissionsMixin } from "@/statics/auth/settingsPermissions.js";

export default {
  mixins: [settingsPermissionsMixin],

  components: {
    PageHeader,
    EditableSettings
  },

  data() {
    return {
      breadCrumb: {
        routeName: "Settings",
        title: "General Settings"
      },
      loading: true,
      editableSettings: {},
      showPayments: false
    };
  },

  async mounted() {
    this.showPayments = await isSystemAllowed(
      this.companyId,
      "paymentSystemAllowed"
    );
    await this.loadEditableSettings();
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    })
  },

  methods: {
    async loadEditableSettings() {
      try {
        this.editableSettings = await getEditableSettingsData(this.companyId);
      } catch (error) {
        console.error(
          "Unable to retrieve --editableSettings-- from data store",
          error
        );
        this.$message({
          message: "Oops, error loading editable Settings data.",
          type: "error",
          duration: 5000
        });
      }

      console.log("settings", this.editableSettings);
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped></style>
