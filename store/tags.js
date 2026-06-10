import Vuex from "vuex";
import { fireDb } from "@/plugins/firebase.js";

const getDefaultState = () => {
  return {
    tags: []
  };
};

export const state = () => getDefaultState();

export const mutations = {
  resetState(state) {
    console.log("mutations: tags/resetState");
    Object.assign(state, getDefaultState());
  },

  setTags(state, tags) {
    console.log("mutations setTags(state, tags) ");
    state.tags = tags;
  }
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  async initTags(vuexContext) {
    // access state value in another module
    const companyId = this.state.companies.companyId;
    console.log("initDrivers: companies/", companyId, "/tags");

    const ref = fireDb
      .collection("companies")
      .doc(companyId)
      .collection("tags");
    const tags = [];
    let snapshot;

    try {
      snapshot = await ref.get();

      for (const doc of snapshot.docs) {
        let tagArray = doc.data();
        tagArray.id = doc.id;
        tags.push(tagArray);
      }

      console.log("READ ", tags.length, " tags documents.");

      vuexContext.commit("setTags", tags);
    } catch (error) {
      console.error("Unable to pull tags from the data store", error);
      vuexContext.commit("setTags", []);
    }
  },

  setTags(vuexContext, tags) {
    console.log("actions setTags(vuexContext, tags) ");
    vuexContext.commit("setTags", tags);
  }
};

export const getters = {
  getAllTags: state => {
    return state.tags;
  },
  getAllPricingRuleTags: state => {
    const tags = state.tags.filter(tags => tags.id === "pricing-rule-tags");
    return tags[0] ? tags[0].tags : [];
  }
};
