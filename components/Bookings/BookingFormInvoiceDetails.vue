<template>
  <div>
    <el-row class="c74-el-row">
      <el-col :span="8">Invoiced</el-col>
      <el-col v-if="this.invoiceForm.invoiced" class="c74-el-col-icon-yes" :span="12">
        <i class="el-icon-success"/>
      </el-col>
      <el-col v-if="!this.invoiceForm.invoiced" class="c74-el-col-icon-no" :span="12">
        <i class="el-icon-error"/>
      </el-col>          
    </el-row>
    <el-row v-if="this.invoiceForm.invoiced" class="c74-el-row">
      <el-col :span="8">Invoice Number ({{this.invoiceForm.system}})</el-col><el-col :span="12">{{ this.invoiceForm.number }}</el-col>
    </el-row>
    <el-row v-if="this.invoiceForm.invoiced && hasDeepLink()" class="c74-el-row">
      <el-col :span="8">External Invoice Link</el-col>
      <el-col  v-if="hasDeepLink()" :span="12">
        <el-link icon="el-icon-link" target="_blank" :href="this.invoiceForm.deepLink">Open {{this.invoiceForm.system}}</el-link>
      </el-col>
    </el-row>
    <el-row class="c74-el-row" v-if="!invoiceForm.invoiced">
      <el-col class="c74-el-col" :span="8">Create Invoice</el-col>
      <el-col :span="12">
        <el-checkbox v-model="createInvoice" label="Create" border size="medium" @change="createInvoiceChange"></el-checkbox>
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
  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
  },  
  async created() {

    if(typeof(this.bookingForm.invoiceSummary) !== 'undefined') {
        this.invoiceForm.number = this.bookingForm.invoiceSummary.number;
        this.invoiceForm.system = this.bookingForm.invoiceSummary.system;
        this.invoiceForm.id = this.bookingForm.invoiceSummary.id;
        this.invoiceForm.invoiced = true;
        this.invoiceForm.deepLink = this.bookingForm.invoiceSummary.deepLink;        
    }
  },
  data() {
    return {
        createInvoice: false,
        invoiceForm:
        {
            invoiced : false,
            number:"n/a",
            system:"n/a",
            id:'',
            deepLink:null
        },
    };
  },
  methods : {
    createInvoiceChange(){

      if(this.createInvoice === true) {
          this.$message({
            message: "Remember to click 'Update Booking' to create the invoice",
            type: "info"
          });
      }

      this.bookingForm.createInvoice = this.createInvoice;
    },
    hasDeepLink() {
      return this.invoiceForm.deepLink !== null && this.invoiceForm.deepLink !== '';
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
.c74-el-col-icon-yes {
   font-size: 18px;
   color: green;
}
.c74-el-col-icon-no {
   font-size: 18px;
   color: red;
}
</style>