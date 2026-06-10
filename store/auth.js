import Vuex from "vuex";
import Vue from "vue";
import { fireAuth } from "~/plugins/firebase.js";

const getDefaultState = () => {
  return {
    user: ""
  };
};

export const state = () => getDefaultState();

export const mutations = {
  setUser(state, user) {
    console.log("mutations: companies/setUser");
    state.user = user;
  },

  resetState(state) {
    console.log("mutations: auth/resetState");
    Object.assign(state, getDefaultState());
  }
};

export const actions = {
  signInWithEmailAndPassword(vuexContext, { email, password }) {
    return fireAuth.signInWithEmailAndPassword(email, password);
  },

  initAuth(vuexContext) {
    const token = localStorage.getItem("token");
    const tokenExpiration = localStorage.getItem("tokenExpiration");
    const localId = localStorage.getItem("localId");

    // we expect to find the following in local storage
    const companyId = localStorage.getItem("companyId");
    const company = JSON.parse(localStorage.getItem("company"));

    const loggedInUserId = localStorage.getItem("loggedInUserId");
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    this.dispatch("companies/setCompanyId", companyId, { root: true });
    this.dispatch("companies/setCompany", company, { root: true });

    this.dispatch("users/setLoggedInUserId", loggedInUserId, { root: true });
    this.dispatch("users/setLoggedInUser", loggedInUser, { root: true });
  },

  signOut(vuexContext) {
    // clear the state within all vuex modules required
    vuexContext.commit("resetState");

    this.dispatch("accommodations/resetState", {}, { root: true });
    this.dispatch("companies/resetState", {}, { root: true });
    this.dispatch("drivers/resetState", {}, { root: true });
    this.dispatch("events/resetState", {}, { root: true });
    this.dispatch("journies/resetState", {}, { root: true });
    this.dispatch("placeGroups/resetState", {}, { root: true });
    this.dispatch("places/resetState", {}, { root: true });
    this.dispatch("pricingRules/resetState", {}, { root: true });
    this.dispatch("routes/resetState", {}, { root: true });
    this.dispatch("scheduler/resetState", {}, { root: true });
    this.dispatch("tags/resetState", {}, { root: true });
    this.dispatch("tourOperators/resetState", {}, { root: true });
    this.dispatch("transfers/resetState", {}, { root: true });
    this.dispatch("users/resetState", {}, { root: true });
    this.dispatch("vehicles/resetState", {}, { root: true });

    // clear absolutely everything from local storage
    localStorage.clear();

    return fireAuth.signOut();
  },

  setUser(vuexContext, user) {
    console.log("action setUser");
    vuexContext.commit("setUser", user);
  }
};

export const getters = {
  getUser(state) {
    return state.user;
  },

  isAuthenticated(state) {
    return !!state.user;
  }
};
