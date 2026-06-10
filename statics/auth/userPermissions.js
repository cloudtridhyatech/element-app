import { checkAuthorisation } from "@/statics/auth/basePermissions.js";

const canReadUsers = user => {
  const allowed = ["user-admin"];
  return checkAuthorisation(user, allowed);
};

const canEditUsers = user => {
  const allowed = ["user-admin"];
  return checkAuthorisation(user, allowed);
};

const canArchiveUsers = user => {
  const allowed = ["user-admin"];
  return checkAuthorisation(user, allowed);
};

export const userPermissionsMixin = {
  methods: {
    mixinCanReadUsers(users) {
      return canReadUsers(users);
    },
    mixinCanEditUsers(users) {
      return canEditUsers(users);
    },
    mixinCanArchiveUsers(users) {
      return canArchiveUsers(users);
    }
  }
};
