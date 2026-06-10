import Vuex from "vuex";
import { fireDb, firestoreNameSpace } from "@/plugins/firebase.js";
import {
  getDocumentReferenceUser
} from "@/statics/user/functions.js";
import { getSettingsData } from "@/statics/settings/functions.js";

const getDefaultState = () => {
  return {
    loggedInUserId: "",
    loggedInUser: null,
    driverSettings: { maxActiveDrivers: 0 }
  };
};

export const state = () => getDefaultState();

export const mutations = {
  resetState(state) {
    console.log("mutations: users/resetState");
    Object.assign(state, getDefaultState());
  },

  setLoggedInUserId(state, loggedInUserId) {
    console.log("mutations: users/setLoggedInUserId");
    state.loggedInUserId = loggedInUserId;
  },

  setLoggedInUser(state, loggedInUser) {
    console.log("mutations: users/setLoggedInUser");
    state.loggedInUser = loggedInUser;
  },

  setDriverSettings(state, driverSettings) {
    console.log("mutations setDriverSettings(state, driverSettings)", driverSettings);
    state.driverSettings = driverSettings;
  },
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  setLoggedInUserId(vuexContext, loggedInUserId) {
    vuexContext.commit("setLoggedInUserId", loggedInUserId);

    // add the loggedInUserId variable so it is available after a page referesh
    localStorage.setItem("loggedInUserId", loggedInUserId);
  },

  setLoggedInUser(vuexContext, loggedInUser) {
    vuexContext.commit("setLoggedInUser", loggedInUser);

    // add the company variable so it is available after a page referesh
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
  },

  editUser(vuexContext, editedUser) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    // remove the id from the object as firebase already has this id as the document id
    const editedUserWithoutId = { ...editedUser };
    delete editedUserWithoutId.authUid;
    delete editedUserWithoutId.id;
    editedUserWithoutId.lastModified = firestoreNameSpace.FieldValue.serverTimestamp();

    return getDocumentReferenceUser(companyId, editedUser.id)
      .update(editedUserWithoutId)
      .then(() => {
        // do nothing
        if (editedUser.id === this.state.users.loggedInUserId) {
          console.log("Updating logged in user.");
          vuexContext.commit("setLoggedInUser", editedUser);
        }
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  async getDriverSettings({ commit }) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    const commitName = "setDriverSettings";

    try {
      let allSettings = await getSettingsData(companyId);

      if (allSettings && allSettings.maxActiveDrivers) {
        commit(commitName, { maxActiveDrivers: Number(allSettings.maxActiveDrivers) });
      } else {
        // in case of no collection / no data env values will be used
        const { maxActiveDrivers } = process.env.defaultVehicleSettings;
        commit(commitName, { maxActiveDrivers: maxActiveDrivers });
      }
    } catch (error) {
      console.error("Unable to pull driver eSettings from the data store", error);
      // default env values will be used
      const { maxActiveDrivers } = process.env.defaultVehicleSettings;
      commit(commitName, { maxActiveDrivers: maxActiveDrivers });
    }
  }  
};

export const getters = {
  getLoggedInUser: state => {
    return state.loggedInUser;
  },
  getLoggedInUserId: state => {
    return state.loggedInUserId;
  },
  getUserRoleOptions(state) {
    let roleOptions = [];
    for (let i = 0; i < process.env.userRoleOptions.length; i++) {
      let option = process.env.userRoleOptions[i];
      if (option.visible !== false) {
        roleOptions.push(option);
      }
    }
    return roleOptions;
  },
  getDriverSettings: state => {
    return state.driverSettings;
  },
};
