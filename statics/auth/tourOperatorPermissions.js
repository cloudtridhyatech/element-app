import { checkAuthorisation } from "@/statics/auth/basePermissions.js";

const canReadTourOperators = user => {
  const allowed = ["tour-operator-admin"];
  return checkAuthorisation(user, allowed);
};

const canEditTourOperators = user => {
  const allowed = ["tour-operator-admin"];
  return checkAuthorisation(user, allowed);
};

const canArchiveTourOperators = user => {
  const allowed = ["tour-operator-admin"];
  return checkAuthorisation(user, allowed);
};

export const tourOperatorPermissionsMixin = {
  methods: {
    mixinCanReadTourOperators(users) {
      return canReadTourOperators(users);
    },
    mixinCanEditTourOperators(users) {
      return canEditTourOperators(users);
    },
    mixinCanArchiveTourOperators(users) {
      return canArchiveTourOperators(users);
    }
  }
};
