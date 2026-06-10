<template>
  <div>
    <section>
      <el-card>
        <div slot="header" class="flex flex-row justify-between">
          <div>Stripe Settings</div>
          <div>
            <el-switch  :disabled="!mixinSystemAdmin(loggedInUser)" v-model="active" active-text="Active" inactive-text="Off" @change="handleActiveChange"></el-switch>
          </div>
        </div>
        <div>
          <div>
            <el-form
              ref="settingsForm"
              :model="settingsForm"
              v-loading="loading"
              :rules="rules"
            >
              <el-collapse v-model="activeFormPanels" accordion>
                <el-collapse-item title="API Keys" name="1">
                  <el-row>
                    <el-col :span="4" class="c74-el-col"
                      >Publishable key</el-col
                    >
                    <el-col :span="12">
                      <el-form-item prop="publishableKey">
                        <el-input
                          placeholder="e.g. pk_test_1234ABCD......"
                          v-model="settingsForm.stripe.publishableKey"
                        ></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="4" class="c74-el-col"
                      >Secret key</el-col
                    >
                    <el-col :span="12">
                      <el-form-item prop="secretKey">
                        <el-input
                          placeholder="e.g. pk_test_1234ABCD......"
                          v-model="settingsForm.stripe.secretKey"
                        ></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-collapse-item>
                <el-collapse-item title="Booking Link Settings" name="2">
                  <el-row>
                    <el-col :span="4" class="c74-el-col"
                      >Stripe Deep Link Base Uri</el-col
                    >
                    <el-col :span="12">
                      <el-form-item prop="deepLinkBaseUri">
                        <el-input
                          placeholder="Stripe Deep Link Base Uri"
                          v-model="settingsForm.stripe.deepLinkBaseUri"
                        ></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-collapse-item>
              </el-collapse>
            </el-form>
          </div>
          <div>
            <el-row>
              <el-col :span="16">&nbsp;</el-col>
              <el-col :span="4">
                <el-button
                  type="primary"
                  @click="saveOrUpdate()"
                  icon="el-icon-download"
                  >Save Stripe Setting</el-button>
              </el-col>
              <el-col :span="12"/>
            </el-row>
          </div>
        </div>

      </el-card>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { settingsPermissionsMixin } from "@/statics/auth/settingsPermissions.js";

export default {
  mixins: [
    settingsPermissionsMixin,
  ],
  name: "StripeSettings",
  props: {
    paymentSystemName: '',
    loading: true,
    settings : {},
  },
  created() {
    this.active = this.paymentSystemName === this.name;
    console.log('this.active', this.active);
  },
  watch : {
    paymentSystemName : function(value, oldValue) {
      console.log('watch paymentSystemName', value, oldValue);
      this.active = value === this.name;
    },
    settings : function(value, oldValue) {
      if (this.settings.stripe) {
        this.settingsForm.stripe = this.settings.stripe;
      }
    },
  },
  computed: {
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    })
  },
  data() {
    return {
      name : 'stripe',
      activeFormPanels: [],
      settingsForm: {
        stripe:{
          currency: "eur",
          publishableKey: "",
          secretKey:"",
          deepLinkBaseUri:""
        }
      },
      active: false,
      rules: {
      }
    };
  },
  methods: {
    async handleActiveChange(value){
      this.$emit("update-payment-system-name", (this.active === true) ? this.name : '');
    },
    saveOrUpdate() {

      console.log('saveOrUpdate');
      this.$emit("save-or-update", 'stripeSettingsFormRef');
    },
    async getSettings() {
      return {
        "name" : this.name,
        "settings": this.settingsForm.stripe
      };
    },
  },
};
</script>


<style lang="scss" scoped>
.c74-el-row {
  margin-bottom: 10px;
}
.c74-el-col {
  padding-top: 5px;
}
</style>
