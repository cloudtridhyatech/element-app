import Vuex from "vuex";
import Vue from "vue";
import { fireDb, firestoreNameSpace } from "@/plugins/firebase.js";
import { mapRefDocsToArray, queryByIds } from "@/statics/array-utils.js";

const getDefaultState = () => {
  return {
    accommodations: []
  };
};

export const state = () => getDefaultState();

function getCollectionReference(companyId) {
  return `companies/${companyId}/accommodations`
}

function getDocumentReference(companyId, id) {
  return `${getCollectionReference(companyId)}/${id}`
}

export const mutations = {
  resetState(state) {
    console.log("mutations: accommodations/resetState");
    Object.assign(state, getDefaultState());
  },

  setAccommodations(state, accommodations) {
    state.accommodations = accommodations;
  },
  addAccommodation(state, accommodation) {
    state.accommodations.push(accommodation);
  },
  editAccommodation(state, editedAccommodation) {
    const accommodationIndex = state.accommodations.findIndex(
      accomm => accomm.id === editedAccommodation.id
    );
    // https://vuejs.org/v2/guide/reactivity.html
    // using Vue.set to ensure reactivity when replacing element of an array
    Vue.set(state.accommodations, accommodationIndex, editedAccommodation);
  }
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  async initAccommodations(vuexContext) {
    // access state value in another module
    try {
      const companyId = this.state.companies.companyId;

      const ref = fireDb.collection(getCollectionReference(companyId));
  
      let snapshot = await ref.get();

      const accommodations = mapRefDocsToArray(snapshot);

      console.log("initAccommodations READ ", accommodations.length, " accommodation documents.");

      vuexContext.commit("setAccommodations", accommodations);
    } catch (error) {
      console.error("Unable to pull accommodations from the data store");
      vuexContext.commit("setAccommodations", []);
    }
  },

  setAccommodations(vuexContext, accommodations) {
    vuexContext.commit("setAccommodations", accommodations);
  },

  addAccommodation(vuexContext, accommodation) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    const created = firestoreNameSpace.FieldValue.serverTimestamp();
    accommodation.created = created;
    accommodation.lastModified = created;

    console.log("addAccommodation", accommodation);

    return fireDb.collection(getCollectionReference(companyId))
      .add(accommodation)
      .then(function(docRef) {
        accommodation.id = docRef.id;
        vuexContext.commit("addAccommodation", accommodation);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  editAccommodation(vuexContext, editedAccommodation) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    // remove the id from the object as firebase already has this id as the document id
    const editedAccommWithoutId = { ...editedAccommodation };
    delete editedAccommWithoutId.id;
    editedAccommWithoutId.lastModified = firestoreNameSpace.FieldValue.serverTimestamp();

    console.log("editedAccommodation", editedAccommodation);

    return fireDb.doc(getDocumentReference(companyId, editedAccommodation.id))
      .update(editedAccommWithoutId)
      .then(() => {
        vuexContext.commit("editAccommodation", editedAccommodation);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  /**
   * https://medium.com/@cambaughn/firestore-use-promise-all-instead-of-getall-on-the-web-301f4678bd05
   *
   * @param {*} vuexContext
   * @param {*} payload
   */
  async getAccommodationsByIds(vuexContext, payload) {
    // access state value in another module
    const companyId = this.state.companies.companyId;
    console.log(
      "getAccommodationsByIds: companies/",
      companyId,
      "/accommodations",
      payload.accommodationIdArray
    );

    let accommodations = [];

    try {
      let idArray = payload.accommodationIdArray;
      if (idArray && idArray.length > 0) {
        accommodations = await queryByIds(getCollectionReference(companyId), idArray);
      }
      console.log(
        "READ ",
        accommodations.length,
        " accommodation documents."
      );
    }
    catch (error) {
      console.error(
        "Unable to pull journies from the data store:",
        error
      );
      accommodations = [];
    }
    finally {
      vuexContext.commit("setAccommodations", accommodations);
    }
  }
};

export const getters = {
  getAllAccommodations: state => {
    return state.accommodations;
  },
  getAllActiveAccommodations: state => {
    return state.accommodations.filter(
      accommodation => accommodation.active === true
    );
  },
  getAllArchivedAccommodations: state => {
    return state.accommodations.filter(
      accommodation => accommodation.active === false
    );
  },
  getAccommodationById: state => id => {
    return state.accommodations.find(a => a.id === id);
  }
};
