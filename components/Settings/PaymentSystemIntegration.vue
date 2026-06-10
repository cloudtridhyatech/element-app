<template>
  <div>
    <section>
      <el-card>
        <div slot="header">
          <div>Payment Settings</div>
        </div>
        <section>
            <StripeSettings
            ref="stripeSettingsFormRef"
            :paymentSystemName="paymentSystemName"
            :settings="settings"
            v-on:update-payment-system-name="updateSystemName"
            v-on:save-or-update="saveOrUpdate"            
            />
        </section>
      </el-card>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Vue from "vue";
import { updateSettingsData } from "@/statics/settings/functions.js";
import { settingsPermissionsMixin } from "@/statics/auth/settingsPermissions.js";
import StripeSettings from "@/components/Settings/StripeSettings"


export default {
  created() {
  },
  mixins: [
    settingsPermissionsMixin,
  ],
  name: "PaymentSystemIntegration",
  components: {
    StripeSettings,
  },
  props: {
    settings: {},
    loading: true
  },
  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("companies", {
      companyKey: "getCompanyKey"
    }),
  },
  watch : {
    settings : function(value, oldValue) {
      if (this.settings.paymentSystemName && this.settings.paymentSystemName !== null && this.settings.paymentSystemName !== '') {
        this.setSystemName(this.settings.paymentSystemName);
      }
    },
  },
  created() {
    console.log('created PaymentSystemIntegration', this.companyId);
  },
  data() {
    return {
      paymentSystemName : ''
    };
  },
  methods: {
    setSystemName(systemName) {
      Vue.set(this, "paymentSystemName", systemName);
    },
    updateSystemName(selectedSystemName) {
      this.setSystemName(selectedSystemName);
      console.log('updateSystemName: this.paymentSystemName', this.paymentSystemName);
    },    
    async saveOrUpdate(formRef){

      let formSettings = await this.$refs[formRef].getSettings();

      if(formSettings !== null) {
        try {
            let updatedSettings = {
                paymentSystemName: this.paymentSystemName
            };
            updatedSettings[formSettings.name] = formSettings.settings;
            await updateSettingsData(this.companyId, updatedSettings);

          this.$message({
            message: formSettings.name + " payment settings updated.",
            type: "success",
            duration: 5000
          });
        } catch (error) {
          console.error("Unable to set payment settings in the data store", error);
          this.$message({
            message: "Oops, error saving payment settings data.",
            type: "error",
            duration: 5000
          });
        }
      }
    }
  }
};
</script>
