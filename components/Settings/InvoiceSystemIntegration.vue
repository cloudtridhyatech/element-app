<template>
  <div>
    <section>
      <el-card>
        <div slot="header">
          <div>Invoice System Integration</div>
        </div>
        <section>
         <XeroSettings
            ref="xeroSettingsFormRef"
            :accountingSystemName="accountingSystemName"
            :settings="settings"
            v-on:update-accounting-system-name="updateAccountingSystemName"
            v-on:save-or-update="saveOrUpdate"
          />
        </section>
        <!-- example for future alternative account system forms??-->
        <!-- <section>
          <TemplateSettings
            ref="templateSettingsFormRef"
            :accountingSystemName="accountingSystemName"
            :settings="settings"
            v-on:update-accounting-system-name="updateAccountingSystemName"
            v-on:save-or-update="saveOrUpdate"
          />
        </section> -->
      </el-card>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Vue from "vue";
import { fireDb } from "@/plugins/firebase.js";
import { updateSettingsData } from "@/statics/settings/functions.js";
import { settingsPermissionsMixin } from "@/statics/auth/settingsPermissions.js";

//import TemplateSettings from "@/components/Settings/TemplateSettings"
import XeroSettings from "@/components/Settings/XeroSettings"

export default {
  mixins: [
    settingsPermissionsMixin,
  ],  
  name: "InvoiceSystemIntegration",
  components: {
    //TemplateSettings,
    XeroSettings,
  },
  props: {
    settings: {},
    loading: true,
  },
  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    }),    
  },
  watch : {
    settings : function(value, oldValue) {
      if (typeof (this.settings.accountingSystemName) !== 'undefined') {
        this.setAccountingSystemName(this.settings.accountingSystemName);
      }
    },
  },
  created() {
    console.log('created InvoiceSystemIntegration', this.companyId);
  },
  data() {
    return {
      accountingSystemName : ''
    };
  },
  methods: {
    setAccountingSystemName(accountingSystemName) {
      Vue.set(this, "accountingSystemName", accountingSystemName);
    },
    updateAccountingSystemName(selectedAccountingSystemName) {
      this.setAccountingSystemName(selectedAccountingSystemName);
      console.log('updateAccountingSystemName: this.accountingSystemName', this.accountingSystemName);
    },
    async saveOrUpdate(formRef){

      let formSettings = await this.$refs[formRef].getSettings();

      if(formSettings !== null) {
        try {
            let updatedSettings = {
                accountingSystemName: this.accountingSystemName
            };
            updatedSettings[formSettings.name] = formSettings.settings;
            await updateSettingsData(this.companyId, updatedSettings);

          this.$message({
            message: formSettings.name + " accounting settings updated.",
            type: "success",
            duration: 5000
          });
        } catch (error) {
          console.error("Unable to set accounting settings in the data store", error);
          this.$message({
            message: "Oops, error saving accounting settings data.",
            type: "error",
            duration: 5000
          });
        }
      }
    }
  },
};
</script>