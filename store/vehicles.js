import Vuex from "vuex";
import Vue from "vue";
import { fireDb } from "@/plugins/firebase.js";
import { getSettingsData } from "@/statics/settings/functions.js";

const getDefaultState = () => {
  return {
    vehicles: [],
    vehicleSettings: {}
  };
};

export const state = () => getDefaultState();

export const mutations = {
  resetState(state) {
    console.log("mutations: vehicles/resetState");
    Object.assign(state, getDefaultState());
  },

  setVehicles(state, vehicles) {
    console.log("mutations setVehicles(state, drivers) ");
    state.vehicles = vehicles;
  },

  addVehicle(state, vehicle) {
    state.vehicles.push(vehicle);
  },

  editVehicle(state, editedVehicle) {
    const vehicleIndex = state.vehicles.findIndex(
      vehicle => vehicle.id === editedVehicle.id
    );
    // https://vuejs.org/v2/guide/reactivity.html
    // using Vue.set to ensure reactivity when replacing element of an array
    Vue.set(state.vehicles, vehicleIndex, editedVehicle);
  },

  setVehicleSettings(state, vehicleSettings) {
    console.log("mutations setVehicleSettings(state, vehicleSettings)", vehicleSettings);
    state.vehicleSettings = vehicleSettings;
  },
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  async initVehicles({ state, commit, dispatch }) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    const ref = fireDb
      .collection("companies")
      .doc(companyId)
      .collection("vehicles");

    const vehicles = [];
    let snapshot;

    try {
      snapshot = await ref.get();

      for (const doc of snapshot.docs) {
        let vehicle = doc.data();
        vehicle.id = doc.id;
        vehicles.push(vehicle);
      }

      console.log("READ ", vehicles.length, " vehicles documents.");

      commit("setVehicles", vehicles);
      dispatch("getVehicleSettings");
    } catch (error) {
      console.error("Unable to pull vehicles from the data store");
      commit("setVehicles", []);
    }
  },

  setVehicles(vuexContext, drivers) {
    console.log("actions setVehicles(vuexContext, vehicles) ");
    vuexContext.commit("setVehicles", vehicles);
  },

  addVehicle(vuexContext, vehicle) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    return fireDb
      .collection("companies")
      .doc(companyId)
      .collection("vehicles")
      .add(vehicle)
      .then(function(docRef) {
        vehicle.id = docRef.id;
        vuexContext.commit("addVehicle", vehicle);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  editVehicle(vuexContext, editedVehicle) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    // remove the id from the object as firebase already has this id as the document id
    const editedVehicleWithoutId = { ...editedVehicle };
    delete editedVehicleWithoutId.id;

    return fireDb
      .collection("companies")
      .doc(companyId)
      .collection("vehicles")
      .doc(editedVehicle.id)
      .update(editedVehicleWithoutId)
      .then(() => {
        vuexContext.commit("editVehicle", editedVehicle);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  async getVehicleSettings({ commit }) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    try {
      let allSettings = await getSettingsData(companyId);

      let vehicleSettings = allSettings;

      console.log("READ ", vehicleSettings, " vehicleSettings documents.");
      if (vehicleSettings && vehicleSettings.maxActiveVehicles) {
        commit("setVehicleSettings", { maxActiveVehicles: Number(vehicleSettings.maxActiveVehicles) });
      } else {
        // in case of no collection / no data env values will be used
        const { maxActiveVehicles } = process.env.defaultVehicleSettings;
        commit("setVehicleSettings", { maxActiveVehicles: Number(maxActiveVehicles) });
      }
    } catch (error) {
      console.error("Unable to pull vehicleSettings from the data store", error);
      // default env values will be used
      const { maxActiveVehicles } = process.env.defaultVehicleSettings;
      commit("setVehicleSettings", { maxActiveVehicles: Number(maxActiveVehicles) });
    }
  }
};

export const getters = {
  getAllVehicles: state => {
    return state.vehicles;
  },

  getAllActiveVehicles: state => {
    return state.vehicles.filter(vehicle => vehicle.active === true);
  },

  getAllArchivedVehicles: state => {
    return state.vehicles.filter(vehicle => vehicle.active === false);
  },

  getVehicleById: state => id => {
    return state.vehicles.find(j => j.id === id);
  },

  getAllVehicleSettings: state => {
    return state.vehicleSettings;
  },
};
