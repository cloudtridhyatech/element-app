import Vuex from "vuex";
import Vue from "vue";
import { fireDb } from "@/plugins/firebase.js";

const getDefaultState = () => {
    return {
        lastBookingCreatedListRefeshTime: new Date().getTime(),
        lastBookingUpdatedListRefeshTime: new Date().getTime(),        
    };
};

export const state = () => getDefaultState();

export const mutations = {
    refreshBookingListCreated(state) {
        console.log("mutations: refreshBookingList");
        state.lastBookingCreatedListRefeshTime = new Date().getTime();
    },
    refreshBookingListUpdated(state) {
        console.log("mutations: refreshBookingListUpdated");
        state.lastBookingUpdatedListRefeshTime = new Date().getTime();
    },    
};

export const actions = {
    refreshBookingListCreated(vuexContext) {
        console.log("actions: refreshBookingListCreated");
        vuexContext.commit("refreshBookingListCreated");
    },
    refreshBookingListUpdated(vuexContext) {
        console.log("actions: refreshBookingListUpdated");
        vuexContext.commit("refreshBookingListUpdated");
    },    
};

export const getters = {
    getLastBookingListCreatedRefeshTime: state => {
        return state.lastBookingCreatedListRefeshTime;
    },
    getLastBookingListUpdatedRefeshTime: state => {
        return state.lastBookingUpdatedListRefeshTime;
    }
};
