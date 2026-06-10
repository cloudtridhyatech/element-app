<template>
  <div>
    <section>
      <el-card>
        <div slot="header" class="flex flex-row justify-between">
          <div>Xero Settings</div>
          <div>
            <el-switch
              :disabled="!mixinSystemAdmin(loggedInUser)"
              v-model="active"
              active-text="Active"
              inactive-text="Off"
              @change="handleActiveChange"
            ></el-switch>
          </div>
        </div>
        <div>
          <div v-show="mixinSystemAdmin(loggedInUser)">
            <el-form
              ref="settingsForm"
              :model="accountSettingsForm"
              v-loading="loading"
              :rules="rules"
            >
              <el-collapse v-model="activeFormPanels" accordion>
              <el-collapse-item title="Connection Settings" name="1">

              <el-row>
                <el-col :span="4" class="c74-el-col"
                  >Xero Organisation Name</el-col
                >
                <el-col :span="12">
                  <el-form-item prop="organisationName">
                    <el-input
                      placeholder="Xero Organisation Name"
                      v-model="accountSettingsForm.organisationName"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="4" class="c74-el-col">Xero Client Id</el-col>
                <el-col :span="12">
                  <el-form-item prop="clientId">
                    <el-input
                      placeholder="Xero Client Id"
                      v-model="accountSettingsForm.clientId"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="4" class="c74-el-col">Xero Client Secret</el-col>
                <el-col :span="12">
                  <el-form-item prop="clientSecret">
                    <el-input
                      placeholder="Xero Client Secret"
                      v-model="accountSettingsForm.clientSecret"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="4" class="c74-el-col"
                  >Account Link Redirect Uri</el-col
                >
                <el-col :span="12">
                  <el-form-item prop="redirectUri">
                    <el-input
                      placeholder="Account Link Redirect Uri"
                      v-model="accountSettingsForm.redirectUri"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="accountSettingsForm.organisationShortCode">
                <el-col :span="4" class="c74-el-col"
                  >Organisation Short Code</el-col
                >
                <el-col :span="12">
                  <el-form-item prop="organisationShortCode">
                    <el-input
                      placeholder="Organisation Short Code"
                      v-model="accountSettingsForm.organisationShortCode"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              </el-collapse-item>
              <el-collapse-item title="Booking Link Settings" name="2">
              <el-row>
                <el-col :span="4" class="c74-el-col"
                  >Xero Deep Link Base Uri</el-col
                >
                <el-col :span="12">
                  <el-form-item prop="deepLinkBaseUri">
                    <el-input
                      placeholder="Xero Deep Link Base Uri"
                      v-model="accountSettingsForm.deepLinkBaseUri"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="4" class="c74-el-col"
                  >Xero Invoice Redirect Uri</el-col
                >
                <el-col :span="12">
                  <el-form-item prop="invoiceRedirectUri">
                    <el-input
                      placeholder="Xero Invoice Redirect Uri"
                      v-model="accountSettingsForm.invoiceRedirectUri"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              </el-collapse-item>
              <el-collapse-item title="TVA Settings" name="3">
              <el-row>
                <el-col :span="4" class="c74-el-col"
                  >Primary Tax Rate Name</el-col
                >
                <el-col :span="12">
                  <el-form-item prop="primaryTaxRateName">
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="A Xero Tax Rate Name from 'Advanced accounting>Taxes Rates'"
                      placement="right"
                    >
                      <el-input
                        placeholder="Xero Tax Rate Display Name"
                        v-model="accountSettingsForm.primaryTaxRateName"
                      ></el-input>
                    </el-tooltip>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="4" class="c74-el-col"
                  >Primary Tax Rate Item Code</el-col
                >
                <el-col :span="12">
                  <el-form-item prop="primaryTaxRateItemCode">
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="A Xero Item Code from 'Business>Products and services'"
                      placement="right"
                    >
                      <el-input
                        placeholder="Item Code"
                        v-model="accountSettingsForm.primaryTaxRateItemCode"
                      ></el-input>
                    </el-tooltip>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="4" class="c74-el-col"
                  >Secondary Tax Rate Name</el-col
                >
                <el-col :span="12">
                  <el-form-item prop="secondaryTaxRateName">
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="A Xero Tax Rate Name from 'Advanced accounting>Taxes Rates'"
                      placement="right"
                    >
                      <el-input
                        placeholder="Xero Tax Rate Display Name"
                        v-model="accountSettingsForm.secondaryTaxRateName"
                      ></el-input>
                    </el-tooltip>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="4" class="c74-el-col"
                  >Secondary Tax Rate Item Code</el-col
                >
                <el-col :span="12">
                  <el-form-item prop="secondaryTaxRateItemCode">
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="A Xero Item Code from 'Business>Products and services'"
                      placement="right"
                    >
                      <el-input
                        placeholder="Item Code"
                        v-model="accountSettingsForm.secondaryTaxRateItemCode"
                      ></el-input>
                    </el-tooltip>
                  </el-form-item>
                </el-col>
              </el-row>
              </el-collapse-item>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="A Xero Account from 'Advanced accounting>Chart of accounts'"
                  placement="right"
                >
                  <el-collapse-item title="Account Codes" name="4">
                    <el-row>
                      <el-col :span="4" class="c74-el-col"
                        >Booking - Offline</el-col
                      >
                      <el-col :span="12">
                        <el-form-item prop="accountCodeBookingOffline">
                          <el-input
                            placeholder="e.g. 200"
                            v-model="accountSettingsForm.accountCodeBookingOffline"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="4" class="c74-el-col"
                        >Bookings - Online</el-col
                      >
                      <el-col :span="12">
                        <el-form-item prop="accountCodeBookingOnline">
                          <el-input
                            placeholder="e.g. 200"
                            v-model="accountSettingsForm.accountCodeBookingOnline"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="4" class="c74-el-col"
                        >Payment - Online</el-col
                      >
                      <el-col :span="12">
                        <el-form-item prop="accountCodePaymentOnline">
                          <el-input
                            placeholder="e.g. 200"
                            v-model="accountSettingsForm.accountCodePaymentOnline"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-collapse-item>
                </el-tooltip>
              </el-collapse>
            </el-form>
          </div>
          <div>
            <el-row class="c74-el-row" v-show="mixinSystemAdmin(loggedInUser)">
              <el-col :span="16">&nbsp;</el-col>
              <el-col :span="4" class="c74-el-col">
                <el-button
                  type="primary"
                  @click="saveOrUpdate()"
                  icon="el-icon-download"
                  >Save Xero Setting</el-button
                >
              </el-col>
              <el-col :span="12" />
            </el-row>
            <el-row class="c74-el-row">
              <el-col :span="4" class="c74-el-col"
                >Xero Connection Status</el-col
              >
              <el-col
                :class="this.connectedStyle"
                :span="12"
                v-loading="connectionStatusLoading"
              >
                <i :class="this.connectedIcon" />
              </el-col>
              <el-col :span="8">
                <el-button
                  type="info"
                  icon="el-icon-refresh"
                  @click="getConnectionStatus()"
                  >Refresh Status</el-button>
                <el-popconfirm
                  title="This will attempt to link to Xero Accounting.  Are you sure?"
                  confirmButtonText="YES"
                  cancelButtonText="No"
                  icon="el-icon-info"
                  iconColor="red"
                  @confirm="linkXero()"
                >
                  <el-button
                    slot="reference"
                    type="danger"
                    icon="el-icon-circle-plus"
                    :loading="linkToXeroLoading"
                    >Link Xero</el-button
                  >
                </el-popconfirm>
              </el-col>
            </el-row>
            <a
              ref="connectXeroAnchor"
              target="_blank"
              :href="connectXeroLink"
              v-show="false"
            ></a>
          </div>
        </div>
      </el-card>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { firebaseFunctions } from "@/plugins/firebase.js";
import { settingsPermissionsMixin } from "@/statics/auth/settingsPermissions.js";

export default {
  mixins: [settingsPermissionsMixin],
  name: "XeroSettings",
  props: {
    accountingSystemName: "",
    loading: true,
    settings: {}
  },
  created() {},
  watch: {
    accountingSystemName: function(value, oldValue) {
      console.log("watch accountingSystemName", value, oldValue);
      this.active = value === this.name;
      if (this.active === true) {
        this.getConnectionStatus();
      }
    },
    settings: function(value, oldValue) {
      if (typeof this.settings.xero !== "undefined") {

        let xeroSettings = this.settings.xero;
        let form = this.accountSettingsForm;

        form.organisationName = xeroSettings.organisationName;
        form.clientId = xeroSettings.clientId;
        form.clientSecret = xeroSettings.clientSecret;
        form.redirectUri =
          xeroSettings.redirectUris.length > 0
            ? xeroSettings.redirectUris[0]
            : "";
        form.organisationShortCode = this.getSettingsTextValue(
          xeroSettings.organisationShortCode
        );
        form.deepLinkBaseUri = xeroSettings.deepLinkBaseUri;
        form.invoiceRedirectUri = xeroSettings.invoiceRedirectUri;
        form.primaryTaxRateName = this.getSettingsTextValue(
          xeroSettings.primaryTaxRateName
        );
        form.secondaryTaxRateName = this.getSettingsTextValue(
          xeroSettings.secondaryTaxRateName
        );
        form.primaryTaxRateItemCode = this.getSettingsTextValue(
         xeroSettings.primaryTaxRateItemCode
        );
        form.secondaryTaxRateItemCode = this.getSettingsTextValue(
          xeroSettings.secondaryTaxRateItemCode
        );
        form.accountCodeBookingOffline = this.getSettingsTextValue(
          xeroSettings.accountCodeBookingOffline
        );
        form.accountCodeBookingOffline = this.getSettingsTextValue(
          xeroSettings.accountCodeBookingOffline
        );
        form.accountCodeBookingOnline = this.getSettingsTextValue(
          xeroSettings.accountCodeBookingOnline
        );
        form.accountCodePaymentOnline = this.getSettingsTextValue(
          xeroSettings.accountCodePaymentOnline
        );                        
      }
    }
  },
  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    })
  },
  data() {
    return {
      activeFormPanels: [],
      name: "xero",
      connectionStatusLoading: false,
      connected: false,
      connectedStyle: "c74-el-col-icon-unknown",
      connectedIcon: "el-icon-question",
      linkToXeroLoading: false,
      connectXeroLink: null,
      accountSettingsForm: {
        organisationName: "",
        clientId: "",
        clientSecret: "",
        redirectUri: "",
        organisationShortCode: null,
        deepLinkBaseUri: "",
        invoiceRedirectUri: "",
        primaryTaxRateName: "",
        secondaryTaxRateName: "",
        primaryTaxRateItemCode: "",
        secondaryTaxRateItemCode: "",
        accountCodeBookingOffline: "",
        accountCodeBookingOnline: "",
        accountCodePaymentOnline: "",
      },
      active: false,
      rules: {
        organisationName: [
          {
            required: true,
            message: "Xero Organisation name is required",
            trigger: "change"
          }
        ],
        clientId: [
          {
            required: true,
            message: "Client Id is required",
            trigger: "change"
          }
        ],
        clientSecret: [
          {
            required: true,
            message: "client Secret is required",
            trigger: "change"
          }
        ],
        redirectUri: [
          {
            required: true,
            message: "Redirect Uri is required",
            trigger: "change"
          }
        ],
        deepLinkBaseUri: [
          {
            required: true,
            message: "Deep Link base Uri is required",
            trigger: "change"
          }
        ],
        invoiceRedirectUri: [
          {
            required: true,
            message: "invoice Redirect Uri is required",
            trigger: "change"
          }
        ]
      }
    };
  },
  methods: {
    async handleActiveChange(value) {
      this.$emit(
        "update-accounting-system-name",
        this.active === true ? this.name : ""
      );

      this.$message({
        message: "Remember to click 'Save Xero Settings' to save the change to the Active status",
        type: "info",
        duration: 5000
      });
    },
    saveOrUpdate() {
      console.log("saveOrUpdate");

      if (this.active === true) {
        //only validate if setting active
        this.$refs["settingsForm"].validate(valid => {
          if (valid) {
            this.$emit("save-or-update", "xeroSettingsFormRef");
          } else {
            console.log("this.formValid = false;");
          }
        });
      } else {
        this.$emit("save-or-update", "xeroSettingsFormRef");
      }
    },
    async getSettings() {

      let form = this.accountSettingsForm;

      let primaryTaxRateType = "";
      let secondaryTaxRateType = "";
      let accountCodeBookingOfflineId = "";
      let accountCodeBookingOnlineId = "";
      let accountCodePaymentOnlineId = "";

      let taxRateNamesToVerify = [];
      if(form.primaryTaxRateName !== null && form.primaryTaxRateName !== "") {
        taxRateNamesToVerify.push(form.primaryTaxRateName);
      }
      if(form.secondaryTaxRateName !== null && form.secondaryTaxRateName !== "") {
        taxRateNamesToVerify.push(form.secondaryTaxRateName);
      }

      let itemCodesToVerify = [];
      if(form.primaryTaxRateItemCode !== null && form.primaryTaxRateItemCode !== "") {
        itemCodesToVerify.push(form.primaryTaxRateItemCode);
      }
      if(form.secondaryTaxRateItemCode !== null && form.secondaryTaxRateItemCode !== "") {
        itemCodesToVerify.push(form.secondaryTaxRateItemCode);
      }

      let accountsToVerify = [];

      if(form.accountCodeBookingOffline !== null && form.accountCodeBookingOffline !== "") {
        accountsToVerify.push({name:form.accountCodeBookingOffline});
      }
      if(form.accountCodeBookingOnline !== null && form.accountCodeBookingOnline !== "") {
        accountsToVerify.push({name:form.accountCodeBookingOnline});
      }
      if(form.accountCodePaymentOnline !== null && form.accountCodePaymentOnline !== "") {
        accountsToVerify.push({name:form.accountCodePaymentOnline,verifyPaymentAllowed:true});
      }      

      if(this.active === true && (taxRateNamesToVerify.length > 0 || itemCodesToVerify.length > 0 || accountsToVerify.length > 0)) {

        const verifiyXeroData = firebaseFunctions.httpsCallable(
          "invoicingXero-verifiyXeroData"
        );

        try {
          let result = await verifiyXeroData({
            companyId: this.companyId,
            taxRateNamesToVerify: taxRateNamesToVerify,
            itemCodesToVerify: itemCodesToVerify,
            accountsToVerify : accountsToVerify
          });

          if (result.data.errors.length > 0) {
            let errorSummary = "";
            result.data.errors.forEach(err => {
              errorSummary += err;
            });

            this.$message({
              message: `Xero data invalid. Settings not updated: ${errorSummary}`,
              type: "error",
              duration: 5000
            });
            return null;
          }

          //retrieve the taxType(s) and save with the xero settings
          if (
            form.primaryTaxRateName !== null &&
            form.primaryTaxRateName !== ""
          ) {
            primaryTaxRateType = result.data.taxRateLookup[form.primaryTaxRateName];
          }
          if (
            form.secondaryTaxRateName !== null &&
            form.secondaryTaxRateName !== ""
          ) {
            secondaryTaxRateType = result.data.taxRateLookup[form.secondaryTaxRateName];
          }

          if(form.accountCodeBookingOffline !== null && form.accountCodeBookingOffline !== "") {
            accountCodeBookingOfflineId = result.data.accountsLookup[form.accountCodeBookingOffline].accountID;
          }
          if(form.accountCodeBookingOnline !== null && form.accountCodeBookingOnline !== "") {
            accountCodeBookingOnlineId = result.data.accountsLookup[form.accountCodeBookingOnline].accountID;
          }
          if(form.accountCodePaymentOnline !== null && form.accountCodePaymentOnline !== "") {
            accountCodePaymentOnlineId = result.data.accountsLookup[form.accountCodePaymentOnline].accountID;
          }               

        } catch (error) {
          console.log("Verifying to Xero data error", error);
          this.$message({
            message: "Oops, an error occured verifying to Xero data.",
            type: "error",
            duration: 5000
          });
          return null;
        }
      }
      else {
        console.log('Xero data verifcation skipped.');
      }

      let settings = {
          organisationName: form.organisationName,
          clientId: form.clientId,
          clientSecret: form.clientSecret,
          redirectUris: [form.redirectUri],
          deepLinkBaseUri: form.deepLinkBaseUri,
          invoiceRedirectUri: form.invoiceRedirectUri,
          primaryTaxRateName: form.primaryTaxRateName,
          secondaryTaxRateName: form.secondaryTaxRateName,
          primaryTaxRateType: primaryTaxRateType,
          secondaryTaxRateType: secondaryTaxRateType,
          primaryTaxRateItemCode: form.primaryTaxRateItemCode,
          secondaryTaxRateItemCode: form.secondaryTaxRateItemCode,
          accountCodeBookingOffline : form.accountCodeBookingOffline,
          accountCodeBookingOfflineId : accountCodeBookingOfflineId,
          accountCodeBookingOnline : form.accountCodeBookingOnline,
          accountCodeBookingOnlineId : accountCodeBookingOnlineId,
          accountCodePaymentOnline : form.accountCodePaymentOnline,
          accountCodePaymentOnlineId : accountCodePaymentOnlineId,
        };

      //don't set unless it has a value - don't want to overwrite any value in the db written during link process
      if(form.organisationShortCode && form.organisationShortCode !== null && form.organisationShortCode !== ''){
          settings.organisationShortCode = form.organisationShortCode;      
      }

      return {
        name: this.name,
        settings: settings
      };
    },
    getSettingsTextValue(value) {
      if (typeof value !== "undefined" && value !== null && value !== "") {
        return value;
      }
      return null;
    },
    getConnectionStatus() {
      this.connectionStatusLoading = true;
      const getSystemConnectionStatus = firebaseFunctions.httpsCallable(
        "invoicing-systemConnectionStatus"
      );

      getSystemConnectionStatus({
        system: this.name,
        companyId: this.companyId
      })
        .then(result => {
          console.log("RESULT", result.data);
          this.connected = result.data.status;
        })
        .catch(error => {
          console.error(error);
          this.connected = false;

          let message = "Unable to determine Xero link status";

          if (typeof error.message !== "undefined") {
            message += `: ${error.message}`;
          }

          this.$message({
            message: message,
            type: "error",
            duration: 5000
          });
        })
        .finally(() => {
          this.connectedStyle = this.getConnectedStyleClass(this.connected);
          this.connectedIcon = this.getConnectedIconClass(this.connected);
          this.connectionStatusLoading = false;
        });
    },
    getConnectedStyleClass(connected) {
      switch (connected) {
        case true:
          return "c74-el-col-icon-yes";
        case false:
          return "c74-el-col-icon-no";
        default:
          return "c74-el-col-icon-unknown";
      }
    },
    getConnectedIconClass(connected) {
      switch (connected) {
        case true:
          return "el-icon-success";
        case false:
          return "el-icon-error";
        default:
          return "el-icon-question";
      }
    },
    linkXero() {
      console.log("Link Xero");
      this.linkToXeroLoading = true;

      const xeroLink = firebaseFunctions.httpsCallable(
        "invoicingXero-xeroLink"
      );

      xeroLink({
        companyId: this.companyId
      })
        .then(result => {
          if (
            typeof result !== "undefined" &&
            result !== null &&
            result.data !== null
          ) {
            console.log(
              "invoicingXero-xeroLink result.data.url:",
              result.data.url
            );

            this.connectXeroLink = result.data.url;
            setTimeout(() => {
              // redirect user to a new tab for xero account login & connect
              this.$refs.connectXeroAnchor.click();
            }, 0);

            this.$message({
              message:
                "Remember to refresh this Page to update this status at the end of the link process",
              type: "info",
              duration: 10000
            });
          } else {
            console.log("invoicingXero-xeroLink no result");
          }
        })
        .catch(error => {
          console.error("invoicingXero-xeroLink error:", error);
          this.$message({
            message: "Oops, an error occured linking to Xero system.",
            type: "error",
            duration: 5000
          });
        });

      this.linkToXeroLoading = false;
    },
    userCanEditSettings() {
      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
.c74-el-row {
  margin-bottom: 10px;
}
.c74-el-col {
  padding-top: 5px;
}
.c74-el-col-icon-yes {
  font-size: 26px;
  color: green;
}
.c74-el-col-icon-no {
  font-size: 26px;
  color: red;
}
.c74-el-col-icon-unknown {
  font-size: 26px;
  color: orange;
}
</style>
