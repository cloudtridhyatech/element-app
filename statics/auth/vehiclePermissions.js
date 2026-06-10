import { checkAuthorisation } from "@/statics/auth/basePermissions.js";

const canReadVehicles = user => {
  const allowed = ["vehicle-admin"];
  return checkAuthorisation(user, allowed);
};

const canEditVehicles = user => {
  const allowed = ["vehicle-admin"];
  return checkAuthorisation(user, allowed);
};

const canArchiveVehicles = user => {
  const allowed = ["vehicle-admin"];
  return checkAuthorisation(user, allowed);
};

export const vehiclePermissionsMixin = {
  methods: {
    mixinCanReadVehicles(users) {
      return canReadVehicles(users);
    },
    mixinCanEditVehicles(users) {
      return canEditVehicles(users);
    },
    mixinCanArchiveVehicles(users) {
      return canArchiveVehicles(users);
    }
  }
};
