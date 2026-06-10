import { checkAuthorisation } from "@/statics/auth/basePermissions.js";

const canReadSettings = user => {
    const allowed = ["settings-admin"];
    return checkAuthorisation(user, allowed);
};

const canEditSettings = user => {
    const allowed = ["settings-admin"];
    return checkAuthorisation(user, allowed);
};

const canSystemAdmin = user => {
    const allowed = ["system-admin"];
    return checkAuthorisation(user, allowed);
};

export const settingsPermissionsMixin = {
    methods: {
        mixinCanReadSettings(users) {
            return canReadSettings(users);
        },
        mixinCanEditSettings(users) {
            return canEditSettings(users);
        },
        mixinSystemAdmin(users) {
            return canSystemAdmin(users);
        }        
    }
};
