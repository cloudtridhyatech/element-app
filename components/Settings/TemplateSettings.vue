<template>
  <div>
    <section>
      <el-card>
        <div slot="header" class="flex flex-row justify-between">
          <div>Template Settings</div>
          <div>
            <el-switch  :disabled="!mixinSystemAdmin(loggedInUser)" v-model="active" active-text="Active" inactive-text="Off" @change="handleActiveChange"></el-switch>
          </div>
        </div>        
        <div>
          <div>
            <el-form
              ref="settingsForm"
              :model="accountSettingsForm"
              v-loading="loading"
              :rules="rules"
            >
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
                  >Save Template Setting</el-button>
              </el-col>
              <el-col :span="12"/>
            </el-row>
          </div>
        </div>

      </el-card>
    </section>

    <section>

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
  name: "TemplateSettings",
  props: {
    accountingSystemName: '',
    loading: true,
    settings : {},
  },
  created() {
    this.active = this.accountingSystemName === this.name;
    console.log('this.active', this.active);
  },
  watch : {
    accountingSystemName : function(value, oldValue) {
      console.log('watch accountingSystemName', value, oldValue);
      this.active = value === this.name;
    },
    settings : function(value, oldValue) {
    },
  },
  computed: {
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    })
  },
  data() {
    return {
      name : 'template',
      accountSettingsForm: {

      },
      active: false,
      rules: {

      }

    };
  },
  methods: {
    async handleActiveChange(value){
      this.$emit("update-accounting-system-name", (this.active === true) ? this.name : '');
    },
    saveOrUpdate() {

      console.log('saveOrUpdate');
      this.$emit("save-or-update", 'templateSettingsFormRef');
    },
    async getSettings() {
      return {
        "name" : this.name,
        "settings":{
        }
      };
    },
  },
};
</script>