import Vuex from "vuex";
import Vue from "vue";
import {
  getDocumentReferencePlaceGroup,
  getCollectionPlaceGroups,
} from "@/statics/routes/functions.js";

const getDefaultState = () => {
  return {
    placeGroups: []
  };
};

export const state = () => getDefaultState();

export const mutations = {
  resetState(state) {
    console.log("mutations: placeGroups/resetState");
    Object.assign(state, getDefaultState());
  },

  setPlaceGroups(state, placeGroups) {
    state.placeGroups = placeGroups;
  },
  addPlaceGroup(state, placeGroup) {
    state.placeGroups.push(placeGroup);
  },
  editPlaceGroup(state, editedPlaceGroup) {
    const placeGroupIndex = state.placeGroups.findIndex(
      placeGroup => placeGroup.id === editedPlaceGroup.id
    );
    // https://vuejs.org/v2/guide/reactivity.html
    // using Vue.set to ensure reactivity when replacing element of an array
    Vue.set(state.placeGroups, placeGroupIndex, editedPlaceGroup);
  }
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  async initPlaceGroups(vuexContext) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    const ref = getCollectionPlaceGroups(companyId);

    const placeGroups = [];
    let snapshot;
    try {
      snapshot = await ref.get();

      for (const doc of snapshot.docs) {
        let placeGroup = doc.data();
        placeGroup.id = doc.id;
        placeGroups.push(placeGroup);
      }

      console.log("READ ", placeGroups.length, " placeGroups documents.");

      vuexContext.commit("setPlaceGroups", placeGroups);
    } catch (error) {
      console.error("Unable to pull placeGroups from the data store");
      vuexContext.commit("setPlaceGroups", []);
    }
  },

  setPlaces(vuexContext, placeGroups) {
    vuexContext.commit("setPlaceGroups", placeGroups);
  },

  addPlaceGroup(vuexContext, placeGroup) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    return getCollectionPlaceGroups(companyId)
      .add(placeGroup)
      .then(function(docRef) {
        placeGroup.id = docRef.id;
        vuexContext.commit("addPlaceGroup", placeGroup);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  editPlaceGroup(vuexContext, editedPlaceGroup) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    // remove the id from the object as firebase already has this id as the document id
    const editedPlaceGroupWithoutId = { ...editedPlaceGroup };
    delete editedPlaceGroupWithoutId.id;

    return getDocumentReferencePlaceGroup(companyId, editedPlaceGroup.id)
      .update(editedPlaceGroupWithoutId)
      .then(() => {
        vuexContext.commit("editPlaceGroup", editedPlaceGroup);
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
  getAllPlaceGroups: state => {
    return state.placeGroups;
  },
  getAllActivePlaceGroups: state => {
    return state.placeGroups.filter(place => place.active === true);
  },
  getPlaceGroupById: state => id => {
    return state.placeGroups.find(p => p.id === id);
  }
};
