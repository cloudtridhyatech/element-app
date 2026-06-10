import Vuex from "vuex";
import { fireDb } from "@/plugins/firebase.js";

import {
  getCollectionUsers
} from "@/statics/user/functions.js";

const getDefaultState = () => {
  return {
    drivers: []
  };
};

export const state = () => getDefaultState();

export const mutations = {
  resetState(state) {
    console.log("mutations: drivers/resetState");
    Object.assign(state, getDefaultState());
  },

  setDrivers(state, drivers) {
    console.log("mutations setDrivers(state, drivers) ");
    state.drivers = drivers;
  }
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  async initDrivers(vuexContext) {
    // access state value in another module
    const companyId = this.state.companies.companyId;
    console.log("initDrivers: companies/", companyId, "/drivers");

    const ref = getCollectionUsers(companyId)
      .where("userType", "==", "driver");
    const drivers = [];
    let snapshot;
    try {
      snapshot = await ref.get();

      for (const doc of snapshot.docs) {
        let driver = doc.data();
        driver.id = doc.id;
        drivers.push(driver);
      }

      console.log("READ ", drivers.length, " drivers documents.");

      vuexContext.commit("setDrivers", drivers);
    } catch (error) {
      console.error("Unable to pull drivers from the data store");
      vuexContext.commit("setDrivers", []);
    }
  },
  setDrivers(vuexContext, drivers) {
    console.log("actions setDrivers(vuexContext, drivers) ");
    vuexContext.commit("setDrivers", drivers);
  }
};

export const getters = {
  getAllDrivers: state => {
    return state.drivers;
  },
  getAllActiveDrivers: state => {
    return state.drivers.filter(driver => driver.active === true);
  },
  getAllArchivedDrivers: state => {
    return state.drivers.filter(driver => driver.active === false);
  }
};
