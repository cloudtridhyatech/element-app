<template>
  <div v-if="mixinCanReadSettings(loggedInUser)">
    <PageHeader :breadCrumb="breadCrumb">
      <slot> All Other Settings </slot>
    </PageHeader>

    <section v-if="showPayments" class="mt-10">
      <PaymentSystemIntegration :settings="settings" :loading="loading" />
    </section>
    <section v-if="showInvoicing" class="mt-10">
      <InvoiceSystemIntegration :settings="settings" :loading="loading" />
    </section>
    <section v-show="mixinSystemAdmin(loggedInUser)" class="mt-10">
      <SystemAdminSettings />
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
import PaymentSystemIntegration from "@/components/Settings/PaymentSystemIntegration";
import InvoiceSystemIntegration from "@/components/Settings/InvoiceSystemIntegration";
import SystemAdminSettings from "@/components/Settings/SystemAdminSettings";
import { settingsPermissionsMixin } from "@/statics/auth/settingsPermissions.js";

export default {
  mixins: [settingsPermissionsMixin],

  components: {
    PageHeader,
    InvoiceSystemIntegration,
    SystemAdminSettings,
    PaymentSystemIntegration
  },

  data() {
    return {
      breadCrumb: {
        routeName: "Settings",
        title: "Site Settings"
      },
      loading: true,
      settings: {},
      showInvoicing: false,
      showPayments: false
    };
  },

  async mounted() {
    this.showInvoicing = await isSystemAllowed(
      this.companyId,
      "accountingSystemAllowed"
    );
    this.showPayments = await isSystemAllowed(
      this.companyId,
      "paymentSystemAllowed"
    );
    await this.loadSettings();
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
    onCloseForm() {},
    onOpenForm() {},
    async loadSettings() {
      console.log("index loadsettings");

      try {
        this.settings = await getSettingsData(this.companyId);
      } catch (error) {
        console.error("Unable to retrieve --settings-- from data store", error);
        this.$message({
          message: "Oops, error loading settings data.",
          type: "error",
          duration: 5000
        });
      }

      console.log("settings", this.settings);
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped></style>
