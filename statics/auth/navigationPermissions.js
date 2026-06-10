const driverAdminRole = "driver-admin";
const driverUserType = "driver";

// if user type is driver and their one and only role is driver admin - don't show home menu
const canSeeHome = (user) => {

    if (!user) return false;
    if (!user.roles) return false;

    if (user.roles.length == 0) {
        return false;
    }
    else if (user.userType === driverUserType && user.roles.length == 1 && user.roles.includes(driverAdminRole)) {
        return false;
    }

    return true;
};

//if they are driver and have role of driver admin, yes show it
const canSeeMySchedule = (user) => {

    if (!user) return false;
    if (!user.roles) return false;

    if (user.userType === driverUserType && user.roles.includes(driverAdminRole)) {
        return true;
    }

    return false;
};

const canSeeHealthCheck = (user) => {
    //at the moment, this is just the same rule as the ability to see home
    return canSeeHome(user);
};

export const navigationPermissionsMixin = {
    methods: {
        mixinCanSeeHome(user) {
            return canSeeHome(user);
        },
        mixinCanSeeMySchedule(user) {
            return canSeeMySchedule(user);
        },
        mixinCanSeeHealthCheck(user) {
            return canSeeHealthCheck(user);
        },
    }
};