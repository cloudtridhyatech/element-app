import { checkAuthorisation } from "@/statics/auth/basePermissions.js";

const canReadBookings = user => {
  const allowed = ["driver", "booking-admin"];
  return checkAuthorisation(user, allowed);
};

const canEditBookings = user => {
  const allowed = ["driver", "booking-admin"];
  return checkAuthorisation(user, allowed);
};

const canArchiveBookings = user => {
  const allowed = ["booking-admin"];
  return checkAuthorisation(user, allowed);
};

export const bookingPermissionsMixin = {
  methods: {
    mixinCanReadBookings(users) {
      return canReadBookings(users);
    },
    mixinCanEditBookings(users) {
      return canEditBookings(users);
    },
    mixinCanArchiveBookings(users) {
      return canArchiveBookings(users);
    }
  }
};
