import { checkAuthorisation } from "@/statics/auth/basePermissions.js";

const canReadAccommodations = user => {
  const allowed = ["driver", "accommodation-admin"];
  return checkAuthorisation(user, allowed);
};

const canEditAccommodations = user => {
  const allowed = ["driver", "accommodation-admin"];
  return checkAuthorisation(user, allowed);
};

const canArchiveAccommodations = user => {
  const allowed = ["accommodation-admin"];
  return checkAuthorisation(user, allowed);
};

export const accommodationPermissionsMixin = {
  methods: {
    mixinCanReadAccommodations(users) {
      return canReadAccommodations(users);
    },
    mixinCanEditAccommodations(users) {
      return canEditAccommodations(users);
    },
    mixinCanArchiveAccommodations(users) {
      return canArchiveAccommodations(users);
    }
  }
};
