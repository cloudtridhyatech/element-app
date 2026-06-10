import Vuex from "vuex";
import Vue from "vue";
import { fireDb, firestoreNameSpace } from "@/plugins/firebase.js";
import { dateUtilsMixin } from "@/statics/utils/dateUtils.js";

const getDefaultState = () => {
  return {
    events: [],
    highlightedEventId: "",
    eventsNeedingRedraw: []
  };
};

export const state = () => getDefaultState();

function getCollectionReference(companyId) {
  return `companies/${companyId}/events`;
}

function getDocumentReference(companyId, id) {
  return `${getCollectionReference(companyId)}/${id}`;
}

function getFireDbCollection(companyId) {
  return fireDb.collection(getCollectionReference(companyId));
}

const getDocumentReferenceJourney = (companyId, id) => {
  return fireDb.doc(getDocumentReference(companyId, id));
};


export const mutations = {
  resetState(state) {
    console.log("mutations: events/resetState");
    Object.assign(state, getDefaultState());
  },

  editEvent(state, editedEvent) {
    console.log("editEvent(state, editedEvent) ");
    const eventIndex = state.events.findIndex(
      event => event.id === editedEvent.id
    );
    // https://vuejs.org/v2/guide/reactivity.html
    // using Vue.set to ensure reactivity when replacing element of an array
    Vue.set(state.events, eventIndex, editedEvent);
  },

  deleteEvent(state, existingEvent) {
    state.events = state.events.filter(e => e.id !== existingEvent.id);
  },

  addEvent(state, newEvent) {
    state.events.push(newEvent);
  },

  setEvents(state, events) {
    state.events = events;
    console.log("mutations setEvents(state, events) ", state.events);
  },

  setHighlightedEventId(state, id) {
    state.highlightedEventId = id;
  },

  setEventsNeedingRedraw(state, ids) {
    state.eventsNeedingRedraw = ids;
  }
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  setupFirestoreEventListenerForDate(vuexContext, payload) {
    // access state value in another module
    const companyId = this.state.companies.companyId;
    console.log(
      "setupFirestoreEventListenerForDate: companies/",
      companyId,
      "/events",
      payload.dateWithFormat,
      payload.userId
    );

    const ref = fireDb
      .collection("companies")
      .doc(companyId)
      .collection("events");

    // each event has an attribute eventDate used or easy querying of events for a particular day.
    let query;

    if (payload.userId) {
      console.log("EXECUTING COMPOUND QUERY FOR EVENTS");
      query = ref
        .where("eventDate", "==", payload.dateWithFormat)
        .where("userId", "==", payload.userId)
        .orderBy("startDateTime", "asc");
    } else {
      console.log("EXECUTING NORMAL QUERY FOR EVENTS");
      query = ref
        .where("eventDate", "==", payload.dateWithFormat)
        .orderBy("startDateTime", "asc");
    }

    try {
      this.unsubscribe = query.onSnapshot(function(querySnapshot) {
        const events = [];

        querySnapshot.forEach(function(doc) {
          let event = doc.data();
          event.id = doc.id;
          events.push(event);
          console.log("EVENT SNAPSHOT READ: ", event);
        });

        querySnapshot.docChanges().forEach(function(change) {
          if (change.type === "added") {
            console.log("New event: ", change.doc.data());
          }
          if (change.type === "modified") {
            console.log("Changed event: ", change.doc.data());
            // vuexContext.commit("setHighlightedEventId", change.doc.id);
          }
          if (change.type === "removed") {
            console.log("Removed event: ", change.doc.data());
          }
        });
        // console.log("READ ", events.length, " event documents.");

        vuexContext.commit("setEvents", events);
      });
    } catch (error) {
      console.error(
        "Unable to pull events from the data store for date:",
        payload.dateWithFormat,
        error
      );
      vuexContext.commit("setEvents", []);
    }
  },

  // https://firebase.google.com/docs/firestore/query-data/listen
  detachFirestoreEventListener() {
    // Stop listening to changes
    if (this.unsubscribe) {
      console.log("DETACHING LISTENER");
      this.unsubscribe();
    }
  },

  editEvent(vuexContext, editedEvent) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    // remove the id from the object as firebase already has this id as the document id
    const editedEventWithoutId = { ...editedEvent };
    delete editedEventWithoutId.id;

    editedEventWithoutId.lastModified = firestoreNameSpace.FieldValue.serverTimestamp();;

    return fireDb
      .collection("companies")
      .doc(companyId)
      .collection("events")
      .doc(editedEvent.id)
      .update(editedEventWithoutId)
      .then(() => {
        // we no longer want to update the vuexStore here as the firestore listener will
        // fire on the original query and the update to the vuex store will be fired by that
        // vuexContext.commit("editEvent", editedEvent);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  addEvent(vuexContext, newEvent) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    // ensure that any id is removed
    delete newEvent.id;

    const created = firestoreNameSpace.FieldValue.serverTimestamp();
    newEvent.created = created;
    newEvent.lastModified = created;

    let eventDate = dateUtilsMixin.methods.mixinFormatDateTimeUTC(newEvent.startDateTime, "YYYY-MM-DD");
    newEvent.eventDate = eventDate;

    return getFireDbCollection(companyId)
      .add(newEvent)
      .then(docRef => {
        // we no longer want to update the vuexStore here as the firestore listener will
        // fire on the original query and the update to the vuex store will be fired by that
        // vuexContext.commit("addEvent", newEvent);

        newEvent.id = docRef.id;
        return docRef;
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  deleteEvent(vuexContext, existingEvent) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    return fireDb
      .collection("companies")
      .doc(companyId)
      .collection("events")
      .doc(existingEvent.id)
      .delete()
      .then(() => {
        // we no longer want to update the vuexStore here as the firestore listener will
        // fire on the original query and the update to the vuex store will be fired by that
        // vuexContext.commit("deleteEvent", existingEvent);
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  setHighlightedEventId(vuexContext, id) {
    vuexContext.commit("setHighlightedEventId", id);
  },

  setEventsNeedingRedraw(vuexContext, ids) {
    vuexContext.commit("setEventsNeedingRedraw", ids);
  },

  setEvents(vuexContext, events) {
    console.log("actions setEvents(vuexContext, events) ");
    vuexContext.commit("setEvents", events);
  }
};

export const getters = {
  getAllEventsForSetDate: state => {
    return state.events;
  },
  getHighlightedEventId: state => {
    return state.highlightedEventId;
  },
  getEventsNeedingRedraw: state => {
    return state.eventsNeedingRedraw;
  },
  getEventById: state => id => {
    return state.events.find(e => e.id === id);
  },
  getAllEventsForSetDateAssignedToVehicleId: state => vehicleId => {
    return state.events.filter(e => e.vehicleId === vehicleId);
  }
};
