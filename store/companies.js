import Vuex from "vuex";
import Vue from "vue";

import { fireDb } from "@/plugins/firebase.js";

const getDefaultState = () => {
  return {
    companyId: null,
    company: null
  };
};

export const state = () => getDefaultState();

export const mutations = {
  resetState(state) {
    console.log("mutations: companies/resetState");
    Object.assign(state, getDefaultState());
  },

  setCompanyId(state, companyId) {
    console.log("mutations: companies/setCompanyId");
    state.companyId = companyId;
  },
  setCompany(state, company) {
    console.log("mutations: companies/setCompany");
    state.company = company;
  }
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  /* getCompany(vuexContext, userData) {
    const userDocRef = fireDb.collection("users").doc(userData.localId);

    userDocRef
      .get()
      .then(doc => {
        if (doc.exists) {
          const companyDocId = doc.data().companyDocId;

          // add the companyId to the vuex store
          vuexContext.commit("setCompanyId", doc.data().companyDocId);

          // add the companyId variable so it is available after a page referesh)
          localStorage.setItem("companyId", doc.data().companyDocId);

          const companyDocRef = fireDb
            .collection("companies")
            .doc(companyDocId);

          // the below query is primarily executed as a check to see if the companyDocId has been correctly specified
          // in the user document and that it represent a doc within the companies collection.
          companyDocRef
            .get()
            .then(doc => {
              if (doc.exists) {
                const company = doc.data();

                // add the company to the vuex store
                vuexContext.commit("setCompany", company);

                // add the companyId variable so it is available after a page referesh)
                localStorage.setItem("company", JSON.stringify(company));
              } else {
                console.error(
                  "The company referenced in firestore the user document does not exist"
                );
              }
            })
            .catch(function(error) {
              console.log("Error getting company document:", error);
            });
        } else {
          // doc.data() will be undefined in this case
          console.log("No such user document!");
        }
      })
      .catch(function(error) {
        console.log("Error getting document:", error);
      });
  },

  getCompanyByCompanyKey(vuexContext, authData) {
    // Create a reference to the companies collection
    const companiesRef = fireDb.collection("companies");

    // Create a query against the collection.
    const query = companiesRef.where("companyKey", "==", authData.companyKey);

    query
      .get()
      .then(querySnapshot => {
        if (querySnapshot.empty) {
          console.error(
            "Company not found using supplied key :",
            authData.companyKey
          );
        } else {
          const companyId = querySnapshot.docs[0].id;
          const company = querySnapshot.docs[0].data();

          console.log("Found company : ", querySnapshot.docs[0].data());

          // add the companyId to the vuex store
          vuexContext.commit("setCompanyId", companyId);

          // add the companyId variable so it is available after a page referesh)
          localStorage.setItem("companyId", companyId);

          // add the company to the vuex store
          vuexContext.commit("setCompany", company);

          // add the companyId variable so it is available after a page referesh)
          localStorage.setItem("company", JSON.stringify(company));
        }
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });
  }, */

  setCompanyId(vuexContext, companyId) {
    vuexContext.commit("setCompanyId", companyId);

    // add the companyId variable so it is available after a page referesh
    localStorage.setItem("companyId", companyId);
  },

  setCompany(vuexContext, company) {
    vuexContext.commit("setCompany", company);

    // add the company variable so it is available after a page referesh
    localStorage.setItem("company", JSON.stringify(company));
  }
};

export const getters = {
  getCompanyId(state) {
    return state.companyId;
  },
  getCompanyKey(state) {
    return state.company.companyKey;
  },
  getCompany(state) {
    return state.company;
  }
};
