import Vuex from "vuex";
import Vue from "vue";
import { fireDb } from "@/plugins/firebase.js";
import { getSettingsData } from "@/statics/settings/functions.js";
import {
  getDocumentReferencePlace,
  getCollectionPlaces,
} from "@/statics/routes/functions.js";

const getDefaultState = () => {
  return {
    places: [],
    placesSettings: { maxActivePlaces: 0 }
  };
};

export const state = () => getDefaultState();

export const mutations = {
  resetState(state) {
    console.log("mutations: places/resetState");
    Object.assign(state, getDefaultState());
  },

  setPlaces(state, places) {
    state.places = places;
  },
  addPlace(state, place) {
    state.places.push(place);
  },
  editPlace(state, editedPlace) {
    const placeIndex = state.places.findIndex(
      place => place.id === editedPlace.id
    );
    // https://vuejs.org/v2/guide/reactivity.html
    // using Vue.set to ensure reactivity when replacing element of an array
    Vue.set(state.places, placeIndex, editedPlace);
  },
  setPlacesSettings(state, placesSettings) {
    console.log("mutations setPlacesSettings(state, placesSettings)", placesSettings);
    state.placesSettings = placesSettings;
  },
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  async initPlaces(vuexContext) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    const ref = getCollectionPlaces(companyId);
    const places = [];
    let snapshot;
    try {
      snapshot = await ref.get();

      for (const doc of snapshot.docs) {
        let place = doc.data();
        place.id = doc.id;
        places.push(place);
      }

      console.log("READ ", places.length, " places documents.");

      vuexContext.commit("setPlaces", places);
    } catch (error) {
      console.error("Unable to pull places from the data store");
      vuexContext.commit("setPlaces", []);
    }
  },

  setPlaces(vuexContext, places) {
    vuexContext.commit("setPlaces", places);
  },

  addPlace(vuexContext, place) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    console.log('HEHERE addPlace');

    return getCollectionPlaces(companyId)
      .add(place)
      .then(function(docRef) {
        place.id = docRef.id;
        vuexContext.commit("addPlace", place);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  editPlace(vuexContext, editedPlace) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    // remove the id from the object as firebase already has this id as the document id
    const editedPlaceWithoutId = { ...editedPlace };
    delete editedPlaceWithoutId.id;

    return getDocumentReferencePlace(companyId, editedPlace.id)
      .update(editedPlaceWithoutId)
      .then(() => {
        vuexContext.commit("editPlace", editedPlace);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  async getPlacesSettings({ commit }) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    const commitName = "setPlacesSettings";

    try {
      let allSettings = await getSettingsData(companyId);

      if (allSettings && allSettings.maxActivePlaces) {
        commit(commitName, { maxActivePlaces: Number(allSettings.maxActivePlaces) });
      } else {
        // in case of no collection / no data env values will be used
        const { maxActivePlaces } = process.env.defaultVehicleSettings;
        commit(commitName, { maxActivePlaces: maxActivePlaces });
      }
    } catch (error) {
      console.error("Unable to pull places Settings from the data store", error);
      // default env values will be used
      const { maxActivePlaces } = process.env.defaultVehicleSettings;
      commit(commitName, { maxActivePlaces: maxActivePlaces });
    }
  }   
};

export const getters = {
  getAllPlaces: state => {
    return state.places;
  },
  getAllActivePlaces: state => {
    return state.places.filter(place => place.active === true);
  },
  getAllArchivedPlaces: state => {
    return state.places.filter(place => place.active === false);
  },
  getPlaceById: state => id => {
    return state.places.find(p => p.id === id);
  },
  getPlacesSettings: state => {
    return state.placesSettings;
  },
};
