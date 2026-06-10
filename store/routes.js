import Vuex from "vuex";
import Vue from "vue";
import { fireDb } from "@/plugins/firebase.js";
import { getSettingsData } from "@/statics/settings/functions.js";
import {
  getDocumentReferenceRoute,
  getCollectionRoutes,
} from "@/statics/routes/functions.js";


const getDefaultState = () => {
  return {
    routes: [],
    routesSettings: { maxActiveRoutes: 0 }
  };
};

export const state = () => getDefaultState();

export const mutations = {
  resetState(state) {
    console.log("mutations: routes/resetState");
    Object.assign(state, getDefaultState());
  },

  setRoutes(state, routes) {
    state.routes = routes;
  },
  addRoute(state, route) {
    state.routes.push(route);
  },
  editRoute(state, editedRoute) {
    const routeIndex = state.routes.findIndex(
      route =>
        route.id === editedRoute.id &&
        route.fromCode === editedRoute.fromCode &&
        route.toCode === editedRoute.toCode
    );
    // https://vuejs.org/v2/guide/reactivity.html
    // using Vue.set to ensure reactivity when replacing element of an array
    Vue.set(state.routes, routeIndex, editedRoute);
  },
  setRoutesSettings(state, routesSettings) {
    console.log("mutations setRoutesSettings(state, routesSettings)", routesSettings);
    state.routesSettings = routesSettings;
  },
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  async initRoutes(vuexContext) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    const ref = getCollectionRoutes(companyId);

    const routes = [];
    let snapshot;
    try {
      snapshot = await ref.get();

      for (const doc of snapshot.docs) {
        let route = doc.data();
        route.id = doc.id;
        routes.push(route);

        // make the inverse route also
        const inverseRoute = { ...route };
        inverseRoute.fromCode = route.toCode;
        inverseRoute.toCode = route.fromCode;
        routes.push(inverseRoute);
      }

      console.log("READ ", routes.length / 2, " routes documents.");

      vuexContext.commit("setRoutes", routes);
    } catch (error) {
      console.error("Unable to pull routes from the data store", error);
      vuexContext.commit("setRoutes", []);
    }
  },

  setRoutes(vuexContext, routes) {
    vuexContext.commit("setRoutes", routes);
  },

  addRoute(vuexContext, route) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    return getCollectionRoutes(companyId)
      .add(route)
      .then(function(docRef) {
        route.id = docRef.id;
        vuexContext.commit("addRoute", route);

        const inverseRoute = { ...route };
        inverseRoute.fromCode = route.toCode;
        inverseRoute.toCode = route.fromCode;
        vuexContext.commit("addRoute", inverseRoute);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  editRoute(vuexContext, editedRoute) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    // remove the id from the object as firebase already has this id as the document id
    const editedRouteWithoutId = { ...editedRoute };
    delete editedRouteWithoutId.id;

    return getDocumentReferenceRoute(companyId, editedRoute.id)
      .update(editedRouteWithoutId)
      .then(() => {
        vuexContext.commit("editRoute", editedRoute);

        const inverseRoute = { ...editedRoute };
        inverseRoute.fromCode = editedRoute.toCode;
        inverseRoute.toCode = editedRoute.fromCode;
        vuexContext.commit("editRoute", inverseRoute);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  createInverseRoute(vuexContext, route) {
    const inverseRoute = { ...route };
    inverseRoute.fromCode = route.toCode;
    inverseRoute.toCode = route.fromCode;

    vuexContext.commit("addRoute", route);
  },

  addOrReplaceInverseRoute(vuexContext, route) {
    const inverseRoute = { ...route };
    inverseRoute.fromCode = route.toCode;
    inverseRoute.toCode = route.fromCode;

    vuexContext.commit("addRoute", inverseRoute);
  },

  async getRoutesSettings({ commit }) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    const commitName = "setRoutesSettings";

    try {
      let allSettings = await getSettingsData(companyId);

      if (allSettings && allSettings.maxActiveRoutes) {
        commit(commitName, { maxActiveRoutes: Number(allSettings.maxActiveRoutes) });
      } else {
        // in case of no collection / no data env values will be used
        const { maxActiveRoutes } = process.env.defaultVehicleSettings;
        commit(commitName, { maxActiveRoutes: maxActiveRoutes });
      }
    } catch (error) {
      console.error("Unable to pull routes Settings from the data store", error);
      // default env values will be used
      const { maxActiveRoutes } = process.env.defaultVehicleSettings;
      commit(commitName, { maxActiveRoutes: maxActiveRoutes });
    }
  }   
};

export const getters = {
  getAllRoutes: state => {
    return state.routes;
  },
  getAllActiveRoutes: state => {
    return state.routes.filter(route => route.active === true);
  },
  getAllArchivedRoutes: state => {
    return state.routes.filter(route => route.active === false);
  },
  getRouteById: state => id => {
    return state.routes.find(r => r.id === id);
  },
  /*
  getRouteByFromAndToIds: (state) => (fromId, toId) => {
    return state.routes.find(route => todo.id === id)
  } */
  getRoutesSettings: state => {
    return state.routesSettings;
  },
};
