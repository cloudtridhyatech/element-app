<template>
  <div>
    <el-row v-if="this.form.payment" class="c74-el-row">
      <el-col :span="8">Payment ID ({{this.form.system}})</el-col><el-col :span="12">{{ this.form.id }}</el-col>
    </el-row>
    <el-row v-if="this.form.status" class="c74-el-row">
      <el-col :span="8">Status ({{this.form.system}})</el-col><el-col :span="12">{{ this.form.status }}</el-col>
    </el-row>
    <el-row v-if="this.form.payment && hasDeepLink()" class="c74-el-row">
      <el-col :span="8">External Payment Link</el-col>
      <el-col  v-if="hasDeepLink()" :span="12">
        <el-link icon="el-icon-link" target="_blank" :href="this.form.deepLink">Open {{this.form.system}}</el-link>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: {
    bookingForm: {
    }
  },
  async created() {

    if(typeof(this.bookingForm.paymentSummary) !== 'undefined') {
        let paymentSummary = this.bookingForm.paymentSummary;

        this.form.system = paymentSummary.system;
        this.form.id = paymentSummary.id;
        this.form.payment = true;
        this.form.deepLink = paymentSummary.deepLink;
        this.form.status = paymentSummary.status;
    }
  },
  data() {
    return {
        form:
        {
            payment : false,
            system:"n/a",
            id:'',
            deepLink:null,
            status: 'Unknown'
        },
    };
  },
  methods : {
    hasDeepLink() {
      return this.form.deepLink !== null && this.form.deepLink !== '';
    }
  }
}
</script>

<style lang="scss" scoped>
.c74-el-row {
  margin-bottom: 10px;
}
.c74-el-col {
  padding-top: 5px;
}
</style>