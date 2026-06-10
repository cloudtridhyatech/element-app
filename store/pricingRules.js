import Vuex from "vuex";
import Vue from "vue";
import { firestoreNameSpace } from "@/plugins/firebase.js";

import {
  getCollectionPricingRules,
  getDocumentReferencePricingRule
} from "@/statics/pricing/functions.js";


const getDefaultState = () => {
  return {
    pricingRules: []
  };
};

export const state = () => getDefaultState();

export const mutations = {
  resetState(state) {
    console.log("mutations: pricingRules/resetState");
    Object.assign(state, getDefaultState());
  },

  setPricingRules(state, pricingRules) {
    state.pricingRules = pricingRules;
  },
  addPricingRule(state, pricingRule) {
    state.pricingRules.push(pricingRule);
  },
  editPricingRule(state, editedPricingRule) {
    const pricingRuleIndex = state.pricingRules.findIndex(
      pricingRule => pricingRule.id === editedPricingRule.id
    );
    // https://vuejs.org/v2/guide/reactivity.html
    // using Vue.set to ensure reactivity when replacing element of an array
    Vue.set(state.pricingRules, pricingRuleIndex, editedPricingRule);
  }
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  async initPricingRules(vuexContext) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    const ref = getCollectionPricingRules(companyId)
                .orderBy("priority", "desc");
    const pricingRules = [];
    let snapshot;
    try {
      snapshot = await ref.get();

      for (const doc of snapshot.docs) {
        let pricingRule = doc.data();
        pricingRule.id = doc.id;
        pricingRules.push(pricingRule);
      }

      console.log("READ ", pricingRules.length, " pricingRules documents.");

      vuexContext.commit("setPricingRules", pricingRules);
    } catch (error) {
      console.error("Unable to pull pricing rules from the data store");
      vuexContext.commit("setPricingRules", []);
    }
  },

  setPricingRules(vuexContext, pricingRules) {
    vuexContext.commit("setPricingRules", pricingRules);
  },

  addPricingRule(vuexContext, pricingRule) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    const created = firestoreNameSpace.FieldValue.serverTimestamp();
    pricingRule.created = created;
    pricingRule.lastModified = created;

    return getCollectionPricingRules(companyId)
      .add(pricingRule)
      .then(function(docRef) {
        pricingRule.id = docRef.id;
        vuexContext.commit("addPricingRule", pricingRule);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  editPricingRule(vuexContext, editedPricingRule) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    // remove the id from the object as firebase already has this id as the document id
    const editedPricingRuleWithoutId = { ...editedPricingRule };
    delete editedPricingRuleWithoutId.id;

    const modified = firestoreNameSpace.FieldValue.serverTimestamp();
    editedPricingRuleWithoutId.lastModified = modified;

    console.log("editedPricingRule", editedPricingRule);

    return getDocumentReferencePricingRule(companyId, editedPricingRule.id)
      .update(editedPricingRuleWithoutId)
      .then(() => {
        vuexContext.commit("editPricingRule", editedPricingRule);
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
  getAllPricingRules: state => {
    return state.pricingRules;
  },

  getAllActivePricingRules: state => {
    return state.pricingRules.filter(
      pricingRule => pricingRule.active === true
    );
  },

  getAllArchivedPricingRules: state => {
    return state.pricingRules.filter(
      pricingRule => pricingRule.active === false
    );
  }
};
