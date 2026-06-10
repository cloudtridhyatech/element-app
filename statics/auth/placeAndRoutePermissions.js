import { checkAuthorisation } from "@/statics/auth/basePermissions.js";

const canReadPlacesAndRoutes = user => {
  const allowed = ["place-and-route-admin"];
  return checkAuthorisation(user, allowed);
};

const canEditPlacesAndRoutes = user => {
  const allowed = ["place-and-route-admin"];
  return checkAuthorisation(user, allowed);
};

const canArchivePlacesAndRoutes = user => {
  const allowed = ["place-and-route-admin"];
  return checkAuthorisation(user, allowed);
};

export const placeAndRoutePermissionsMixin = {
  methods: {
    mixinCanReadPlacesAndRoutes(users) {
      return canReadPlacesAndRoutes(users);
    },
    mixinCanEditPlacesAndRoutes(users) {
      return canEditPlacesAndRoutes(users);
    },
    mixinCanArchivePlacesAndRoutes(users) {
      return canArchivePlacesAndRoutes(users);
    }
  }
};
