import { checkAuthorisation } from "@/statics/auth/basePermissions.js";

const canReadPricingRules = user => {
  const allowed = ["pricing-rules-admin"];
  return checkAuthorisation(user, allowed);
};

const canEditPricingRules = user => {
  const allowed = ["pricing-rules-admin"];
  return checkAuthorisation(user, allowed);
};

const canArchivePricingRules = user => {
  const allowed = ["pricing-rules-admin"];
  return checkAuthorisation(user, allowed);
};

export const pricingRulesPermissionsMixin = {
  methods: {
    mixinCanReadPricingRules(users) {
      return canReadPricingRules(users);
    },
    mixinCanEditPricingRules(users) {
      return canEditPricingRules(users);
    },
    mixinCanArchivePricingRules(users) {
      return canArchivePricingRules(users);
    }
  }
};
