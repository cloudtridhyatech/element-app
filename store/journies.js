import Vuex from "vuex";
import Vue from "vue";
import { fireDb, firestoreNameSpace } from "@/plugins/firebase.js";
import { sortByObjectKey, mapRefDocsToArray, queryByIds } from "@/statics/array-utils.js";
import { convertFromMillisToFirestoreTimestampIfRequired } from "@/statics/utils/dateUtils.js";
import { getMapTransfersByTransferIds } from "@/statics/transfer/functions.js";

const getDefaultState = () => {
  return {
    journies: [],
    journeyIdsByTransferIdMap: new Map(),
  };
};

export const state = () => getDefaultState();

function getCollectionReference(companyId) {
  return `companies/${companyId}/journies`;
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

function commitJournies(vuexContext, journies) {
  console.log("actions setJournies(vuexContext, journies)");
  vuexContext.commit("setJournies", journies);
}

async function setTransfers(companyId, journies, vuexStore) {
  let transferIds = [];
  if (journies && journies.length > 0) {
    journies.forEach((item) => {
      if (item.transferId) {
        if (transferIds.includes(item.transferId) === false) {
          transferIds.push(item.transferId);
        }
      }
    });
  }
  let transfersMap = await getMapTransfersByTransferIds(companyId, transferIds);

  //store the transfers map for later use in quick edit + split
  await vuexStore.dispatch("transfers/setTransfersMap", transfersMap);

  let journeyIdsByTransferIdMap = vuexStore.state.journies.journeyIdsByTransferIdMap;

  if (journies && journies.length > 0) {
    journies.forEach((item) => {
      let transferId = item.transferId;
      let journeyId = item.id;
      let transfer = transfersMap.get(transferId);
      item.transferObject = transfer;

      addOrUpdateJourneyIdsByTransferIdMap(journeyIdsByTransferIdMap, journeyId, transferId);
    });
  }
}

function getTransfer(vuexContext, transferId) {
  return vuexContext.rootGetters["transfers/getTransferById"](transferId);
}

function addOrUpdateJourneyIdsByTransferIdMap(journeyIdsByTransferIdMap, journeyId, transferId) {

  console.log('addOrUpdateJourneyIdsByTransferIdMap', journeyIdsByTransferIdMap.size, journeyId, transferId);

  if (journeyIdsByTransferIdMap.has(transferId)) {
    let journies = journeyIdsByTransferIdMap.get(transferId);
    if (!(journies.find(x => x === journeyId))) {
      journies.push(journeyId);
    }
  } else {
    journeyIdsByTransferIdMap.set(transferId, [journeyId]);
  }
}

export const mutations = {
  resetState(state) {
    console.log("mutations: journies/resetState");
    Object.assign(state, getDefaultState());
  },

  editJourney(state, editedJourney) {
    const journeyIndex = state.journies.findIndex(
      journey => journey.id === editedJourney.id
    );
    // https://vuejs.org/v2/guide/reactivity.html
    // using Vue.set to ensure reactivity when replacing element of an array
    Vue.set(state.journies, journeyIndex, editedJourney);
  },

  addJourney(state, newJourney) {
    state.journies.push(newJourney);
    addOrUpdateJourneyIdsByTransferIdMap(state.journeyIdsByTransferIdMap, newJourney.id, newJourney.transferId);

    // https://vuejs.org/v2/guide/reactivity.html
    // using Vue.set to ensure reactivity when replacing element of an array
    //Vue.set(state.journies, state.journies[journies.length - 1], newJourney);
  },

  setJournies(state, journies) {
    console.log("mutations setJournies(state, journies) ");
    state.journies = journies;
  }
};

export const actions = {
  resetState(vuexContext) {
    vuexContext.commit("resetState");
  },

  async initJourniesForDate(vuexContext, dateWithFormat) {
    // access state value in another module
    const companyId = this.state.companies.companyId;
    console.log(
      "initJournies: companies/",
      companyId,
      "/journies",
      dateWithFormat
    );

    const ref = getFireDbCollection(companyId);

    // each journey has an attribute pickUpDate used or easy querying of transfers for a particular day.
    const query = ref
      .where("pickUpDate", "==", dateWithFormat)
      .orderBy("pickUpDateTime", "asc");

    let journies = [];
    let snapshot;
    try {
      snapshot = await query.get();
     
      journies = mapRefDocsToArray(snapshot, (journey) => journey.active !== false);

      await setTransfers(companyId, journies, this);

      console.log("READ ", journies.length, " journey documents.");
    } catch (error) {
      console.error(
        "Unable to pull journies from the data store for date:",
        dateWithFormat,
        error
      );
      journies = [];
    }
    finally {
      commitJournies(vuexContext, journies);
    }
  },

  /**
   * https://medium.com/@cambaughn/firestore-use-promise-all-instead-of-getall-on-the-web-301f4678bd05
   *
   * @param {*} vuexContext
   * @param {*} payload
   */
  async getJourniesForDateByIds(vuexContext, payload) {
    // access state value in another module
    const companyId = this.state.companies.companyId;
    console.log(
      "getJourniesForDateByIds: companies/",
      companyId,
      "/journies",
      payload.journeyIdArray
    );

    let journies = [];

    try {
      let idArray = payload.journeyIdArray;
      if (idArray && idArray.length > 0) {

        journies = await queryByIds(getCollectionReference(companyId), idArray);

        await setTransfers(companyId, journies, this);
      }
      console.log("READ ", journies.length, " journey documents.");
    }
    catch (error) {
      console.error(
        "Unable to pull journies from the data store:",
        error
      );
      journies = [];
    }
    finally {
      commitJournies(vuexContext, journies);
    }
  },

  /*   setupFirestoreJourneyListenerForDate(vuexContext, payload) {
    // access state value in another module
    const companyId = this.state.companies.companyId;
    console.log(
      "setupFirestoreJourneyListenerForDate: companies/",
      companyId,
      "/journies",
      payload.journeyIdArray
    );

    const ref = fireDb
      .collection("companies")
      .doc(companyId)
      .collection("journies");

    // each event has an attribute eventDate used or easy querying of events for a particular day.
    const query = ref
      .where("eventId", "in", payload.journeyIdArray)
      .orderBy("pickUpDateTime", "asc");

    try {
      this.unsubscribe = query.onSnapshot(function(querySnapshot) {
        const journies = [];

        querySnapshot.forEach(function(doc) {
          let journey = doc.data();
          journey.id = journey.id;
          journies.push(journey);
          console.log("JOURNEY SNAPSHOT READ: ", journey);
        });

        querySnapshot.docChanges().forEach(function(change) {
          if (change.type === "added") {
            console.log("New journey: ", change.doc.data());
          }
          if (change.type === "modified") {
            console.log("Changed journey: ", change.doc.data());
            // vuexContext.commit("setHighlightedEventId", change.doc.id);
          }
          if (change.type === "removed") {
            console.log("Removed journey: ", change.doc.data());
          }
        });
        // console.log("READ ", events.length, " event documents.");

        setJournies(vuexContext, journies);
      });
    } catch (error) {
      console.error(
        "Unable to pull journies from the data store",
        dateWithFormat,
        error
      );
      vuexContext.commit("setEvents", []);
    }
  }, */

  // https://firebase.google.com/docs/firestore/query-data/listen
  /*   detachFirestoreEventListener() {
    // Stop listening to changes
    this.unsubscribe();
  }, */

  async addJourney(vuexContext, newJourney) {
    // access state value in another module
    const companyId = this.state.companies.companyId;

    let transferId = '';
    if (newJourney.transferId && newJourney.transferId !== null && newJourney.transferId !== '') {
      //this path should be used by transfer split
      transferId = newJourney.transferId;
    }
    else if (newJourney.transferObject) {
      console.log(`Adding New Transfer ${companyId}`);
      transferId = await this.dispatch("transfers/addTransfer", newJourney.transferObject);
      newJourney.transferId = transferId;
    }

    delete newJourney.transferObject;

    // ensure that any id is removed
    delete newJourney.id;

    const created = firestoreNameSpace.FieldValue.serverTimestamp();
    newJourney.created = created;
    newJourney.lastModified = created;

    getFireDbCollection(companyId)
      .add(newJourney)
      .then(docRef => {

        if (transferId && transferId !== '') {
          let transferObject = getTransfer(vuexContext, transferId);

          if (transferObject) {
            newJourney.transferObject = transferObject;
          }
        }
        newJourney.id = docRef.id;
        vuexContext.commit("addJourney", newJourney);
        return docRef;
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  editJourneyStatus(vuexContext, editedJourney) {

    const companyId = this.state.companies.companyId;

    let lastModified = firestoreNameSpace.FieldValue.serverTimestamp();
    let savedRef = getDocumentReferenceJourney(companyId, editedJourney.id);

    savedRef.set({ status: editedJourney.status, lastModified: lastModified }, { merge: true })
      .then(() => {
        console.log("editJourneyStatus sending to firebase companyId & saving in vuex:", companyId, ", editedJourney:", editedJourney);
        vuexContext.commit("editJourney", editedJourney);
      })
      .catch(error => {
        console.error('editJourneyStatus error', error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => { });
  },
  editJourney(vuexContext, editedJourney) {
    // access state value in another module
    const companyId = this.state.companies.companyId;
    let transferId = editedJourney.transferId;
    let editedJourneyId = editedJourney.id;

    // all dates kep in the store and sent to firestore MUST be firestore Timestamps
    convertAllJourneyDateAttributesToFirestoreTimestamp(editedJourney);

    // remove the id from the object as firebase already has this id as the document id
    const editedJourneyWithoutId = { ...editedJourney };
    delete editedJourneyWithoutId.id;
    delete editedJourneyWithoutId.created;
    delete editedJourneyWithoutId.transferObject;
    delete editedJourney.transferObject;

    editedJourneyWithoutId.lastModified = firestoreNameSpace.FieldValue.serverTimestamp();

    fireDb.doc(getDocumentReference(companyId, editedJourneyId))
      .update(editedJourneyWithoutId)
      .then(() => {
        //get latest transfer object from map and reassign before vue set        
        let transferObject = getTransfer(vuexContext, transferId);
        if (transferObject) {
          editedJourney.transferObject = transferObject;
        }

        console.log("editJourney sending to firebase companyId & saving in vuex:", companyId, ", editedJourney:", editedJourney);
        vuexContext.commit("editJourney", editedJourney);

        //assign the same new transfer object to other journies with the same transfer instance  
        if (transferObject) {

          //if journey has been split, we must update the reference to the transfer to the same updated instance
          let allJourniesForTransfer = vuexContext.getters.getJourneyIdsByTransferIdFromMap(transferId);
          allJourniesForTransfer.forEach(journeyId => {
            if (journeyId !== editedJourneyId) {

              let otherJourney = vuexContext.getters.getJourneyById(journeyId);
              const otherJourneyCopy = { ...otherJourney };
              otherJourneyCopy.transferObject = transferObject;
              console.log("otherJourneyCopy sending to firebase companyId & saving in vuex:", companyId, ", otherJourneyCopy:", otherJourneyCopy);
              vuexContext.commit("editJourney", otherJourneyCopy);
            }
          });
        }
      })
      .catch(error => {
        console.error(error);
        // throw the error so that it can be responded to in the calling component
        throw error;
      })
      .finally(() => {});
  },

  resetJournies(vuexContext) {
    console.log("action: resetJournies/", this.state.companies.companyId);

    vuexContext.getters.getJourneyIdsByTransferIdMap.clear();

    commitJournies(vuexContext, []);
  }
};

export const getters = {
  getAllJourniesForSetDate: state => {
    return state.journies;
  },

  getAllEnquiryJourniesForSetDate: state => {
    return state.journies
      .filter(journey => journey.status === "enquiry")
      .sort(sortByObjectKey("pickUpDateTime"));
  },

  getAllConfirmedJourniesForSetDate: state => {
    return state.journies
      .filter(journey => journey.status === "confirmed")
      .sort(sortByObjectKey("pickUpDateTime"));
  },

  getAllScheduledJourniesForSetDate: state => {
    return state.journies
      .filter(journey => journey.status === "scheduled")
      .sort(sortByObjectKey("pickUpDateTime"));
  },

  getAllCancelledJourniesForSetDate: state => {
    return state.journies
      .filter(journey => journey.status === "cancelled")
      .sort(sortByObjectKey("pickUpDateTime"));
  },

  getAllDeadJourniesForSetDate: state => {
    return state.journies
      .filter(journey => journey.status === "dead")
      .sort(sortByObjectKey("pickUpDateTime"));
  },

  getJourneyById: state => id => {
    return state.journies.find(j => j.id === id);
  },

  getJourniesByEventId: state => eventId => {
    return state.journies.filter(j => j.eventId === eventId);
  },

  getJourneyIdsByTransferIdMap: state => {
    return state.journeyIdsByTransferIdMap;
  },

  getJourneyIdsByTransferIdFromMap: state => transferId => {

    let allJourniesForTransfer = [];

    if (state.journeyIdsByTransferIdMap.has(transferId)) {
      allJourniesForTransfer = state.journeyIdsByTransferIdMap.get(transferId);
    }

    return allJourniesForTransfer;
  },
};

/**
 * If a datetime field exists, we may need to convert milliseconds values back to firestore Timestamps
 */
const convertAllJourneyDateAttributesToFirestoreTimestamp = journey => {
  if (journey.pickUpDateTime) {
    journey.pickUpDateTime = convertFromMillisToFirestoreTimestampIfRequired(
      journey.pickUpDateTime
    );
  }
};
