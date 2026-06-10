<template>
  <div>
    <PageHeader :breadCrumb="breadCrumb">
      <slot>
        <section>
          <el-button
            type="primary"
            @click="createNewPricingRule"
            icon="el-icon-circle-plus"
            >Create New Pricing Rule</el-button
          >
        </section>
      </slot>
    </PageHeader>

    <PricingList v-on:copy-existing-price="onCopyExistingPrice" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import PageHeader from "@/components/Shared/PageHeader";
import PricingList from "@/components/Pricing/PricingList";
import PricingForm from "@/components/Pricing/PricingForm";

export default {
  components: {
    PricingList,
    PricingForm,
    PageHeader
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("pricingRules", {
      allActivePricingRules: "getAllActivePricingRules"
    })
  },

  data() {
    return {
      breadCrumb: {
        routeName: "Pricing",
        title: "Pricing"
      },
      priceId: "",
      existingPrice: null,

      // an array that will be populated with existing pricing and availability entries
      // existingPrices: [],

      shouldOpenDialog: false
    };
  },

  methods: {
    createNewPricingRule() {
      this.$router.push({ path: "pricing/edit" });
    },

    async onCopyExistingPrice(id) {
      this.priceId = "";

      const pricingRuleToCopy = this.allActivePricingRules.find(
        pricingRule => pricingRule.id === id
      );

      // delete the id that firestore uses as we're about to have a new one created.
      const newPricingRule = { ...pricingRuleToCopy };
      delete newPricingRule.id;
      newPricingRule.name = newPricingRule.name.concat(" (copy)");
      newPricingRule.numUses = 0;
      newPricingRule.numQuotes = 0;
      console.log("pricingRuleToCopy: ", newPricingRule);

      this.$store
        .dispatch("pricingRules/addPricingRule", newPricingRule)
        .then(() => {
          this.$notify.success({
            title: "Success",
            message: "The pricing rule was copied",
            offset: 100
          });
        })
        .catch(error => {
          this.$notify.error({
            title: "Failed",
            message: "Copying failed",
            offset: 100
          });
        })
        .finally(() => {});
    }
  }
};
</script>

<style scoped>
.form-submission {
  margin-top: 24px;
}
</style>
