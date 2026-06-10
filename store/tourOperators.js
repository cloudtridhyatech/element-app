import Vuex from "vuex";
import Vue from "vue";
import { fireDb } from "@/plugins/firebase.js";

const getDefaultState = () => {
  return {
    tourOperators: []
  };
};

export const state = () => getDefaultState();

export const mutations = {
  resetState(state) {
    console.log("mutations: tourOperator/resetState");
    Object.assign(state, getDefaultState());
  },

  setTourOperators(state, tourOperators) {
    console.log("mutations setTourOperators(state, drivers) ");
    state.tourOperators = tourOperators;
  },

  addTourOperator(state, tourOperator) {
    state.tourOperators.push(tourOperator);
  },

  editTourOperator(state, editedTourOperator) {
    const tourOperatorIndex = state.tourOperators.findIndex(
      tourOperator => tourOperator.id === editedTourOperator.id
    );
    // https://vuejs.org/v2/guide/reactivity.html
    // using Vue.set to ensure reactivity when replacing element of an array
    Vue.set(state.tourOperators, tourOperatorIndex, editedTourOperator);
  }
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  async initTourOperators({ state, commit }) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    const ref = fireDb
      .collection("companies")
      .doc(companyId)
      .collection("tourOperators");

    const tourOperators = [];
    let snapshot;

    try {
      snapshot = await ref.get();

      for (const doc of snapshot.docs) {
        let tourOperator = doc.data();
        tourOperator.id = doc.id;
        tourOperators.push(tourOperator);
        console.log(tourOperator);
      }

      console.log("READ ", tourOperators.length, " tourOperators documents.");

      commit("setTourOperators", tourOperators);
    } catch (error) {
      console.error("Unable to pull tourOperators from the data store");
      commit("setTourOperators", []);
    }
  },

  setTourOperators(vuexContext, drivers) {
    console.log("actions setTourOperators(vuexContext, tourOperators) ");
    vuexContext.commit("setTourOperators", tourOperators);
  },

  addTourOperator(vuexContext, tourOperator) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    return fireDb
      .collection("companies")
      .doc(companyId)
      .collection("tourOperators")
      .add(tourOperator)
      .then(function(docRef) {
        tourOperator.id = docRef.id;
        vuexContext.commit("addTourOperator", tourOperator);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  editTourOperator(vuexContext, editedTourOperator) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    // remove the id from the object as firebase already has this id as the document id
    const editedTourOperatorWithoutId = { ...editedTourOperator };
    delete editedTourOperatorWithoutId.id;

    return fireDb
      .collection("companies")
      .doc(companyId)
      .collection("tourOperators")
      .doc(editedTourOperator.id)
      .update(editedTourOperatorWithoutId)
      .then(() => {
        vuexContext.commit("editTourOperator", editedTourOperator);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  }
};

export const getters = {
  getAllTourOperators: state => {
    return state.tourOperators;
  },
  getAllActiveTourOperators: state => {
    return state.tourOperators.filter(
      tourOperator => tourOperator.active === true
    );
  },
  getAllArchivedTourOperators: state => {
    return state.tourOperators.filter(
      tourOperator => tourOperator.active === false
    );
  }
};
