<template>
  <div>
    <!-- <pre>{{ form }}</pre> -->
    <div>
      <el-form
        ref="formQuotes"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <div v-for="(transferForm, index) in form.transfers" :key="index">
          <div class="text-lg font-semibold" :class="index > 0 ? 'mt-6' : ''">
            Quote -
            {{ getFormattedDate(transferForm) }} (Transfer #{{ index + 1 }})
          </div>
          <div v-if="transferHasQuote(index)">
            <el-radio-group v-model="form.quotes[index].selected">
              <div class="mt-6 flex flex-col md:flex-row gap-y-2 md:gap-x-2">
                <el-radio
                  v-if="isQuoteVisible(form.quotes[index].private.pricingRule)"
                  label="private"
                  border
                  >Private {{ getPriceText(form.quotes[index].private) }}
                </el-radio>
                <el-radio
                  v-if="isQuoteVisible(form.quotes[index].shared.pricingRule)"
                  label="shared"
                  border
                  >Shared {{ getPriceText(form.quotes[index].shared) }}
                </el-radio>
              </div>
            </el-radio-group>
            <EmbedInstantPaymentMessage :quote="form.quotes[index]" />
          </div>
          <div class="" v-else>
            <div class="">
              Please click get quote to get a price for this transfer
            </div>
          </div>
        </div>
      </el-form>
    </div>
    <div class="mt-6">
      <div class="">Your Total Quote: &#x20AC;&nbsp;{{ totalQuote }}</div>
    </div>
  </div>
</template>

<script>
import { getFormattedDate } from "@/statics/embed/functions.js";
import EmbedInstantPaymentMessage from "@/components/Embed/EmbedInstantPaymentMessage";

export default {
  components: {
    EmbedInstantPaymentMessage
  },
  props: {
    companyId: {
      type: String,
      required: true
    },
    form: {
      type: Object,
      required: true,
      default: () => {
        return { quotes: [], transfers: [] };
      }
    },
    totalQuote: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      formValid: false,
      rules: {}
    };
  },
  created() {},
  computed: {
    transfersWithQuote: function() {
      let transfersWithQuote = [];
      for (let i = 0; i < this.form.quotes.length; i++) {
        transfersWithQuote.push(this.form.transfers[i]);
      }
      return transfersWithQuote;
    }
  },
  methods: {
    isValidForm() {
      this.$refs["formQuotes"].validate(valid => {
        let allQuotesSelected = this.form.quotes.every(x => x.selected !== "");

        if (valid && allQuotesSelected === true) {
          this.formValid = true;
        } else {
          this.formValid = false;
        }
      });
      return this.formValid;
    },
    isQuoteVisible(quote) {
      if (quote) return true;
      return false;
    },
    transferHasQuote(index) {
      if (this.form.quotes[index]) {
        return true;
      }

      return false;
    },
    getFormattedDate(transfer) {
      return getFormattedDate(transfer);
    },
    getPriceText(quote) {
      let priceText = "€" + String(quote.price) + " total";
      if (quote.isPricedPerPerson === true) {
        priceText += " (€" + quote.pricePerPerson + "/person)";
      }
      return priceText;
    }
  }
};
</script>
