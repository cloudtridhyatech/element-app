import Vuex from "vuex";
import Vue from "vue";
import { fireDb, firestoreNameSpace } from "@/plugins/firebase.js";
import { convertFromMillisToFirestoreTimestampIfRequired } from "@/statics/utils/dateUtils.js";

const getDefaultState = () => {
    return {
        transfersMap: new Map(),
    };
};

export const state = () => getDefaultState();

function getCollectionReference(companyId) {
    return `companies/${companyId}/transfers`
}

function getDocumentReference(companyId, id) {
    return `${getCollectionReference(companyId)}/${id}`
}

function getFireDbCollection(companyId) {
    return fireDb.collection(getCollectionReference(companyId))
}

function sanitizeTransferDatesBeforeCreateOrUpdate(transfer) {

    if (transfer.flightArrivesDateTime) {
        transfer.flightArrivesDateTime = convertFromMillisToFirestoreTimestampIfRequired(
            transfer.flightArrivesDateTime
        );
    }

    if (transfer.flightDepartsDateTime) {
        transfer.flightDepartsDateTime = convertFromMillisToFirestoreTimestampIfRequired(
            transfer.flightDepartsDateTime
        );
    }
}

export const mutations = {
    resetState(state) {
        console.log("mutations: transfers/resetState");
        Object.assign(state, getDefaultState());
    },
    setTransfersMap(state, transfersMap) {

        console.log("mutations: transfers/setTransfersMap", transfersMap.size);

        state.transfersMap.clear();
        transfersMap.forEach(item => {
            state.transfersMap.set(item.id, item);
        });
    },
    addTransfer(state, newTransfer) {
        state.transfersMap.set(newTransfer.id, newTransfer);
    },
    editTransfer(state, editedTransfer) {
        let transferId = editedTransfer.id;
        let oldTransferData = state.transfersMap.get(transferId);
        state.transfersMap.set(transferId, editedTransfer);
        console.log("mutations: transfers/editedTransfer", transferId, oldTransferData, editedTransfer);
    },
};

export const actions = {
    resetState(vuexContext) {
        vuexContext.commit("resetState");
    },
    setTransfersMap(vuexContext, transfersMap) {
        vuexContext.commit("setTransfersMap", transfersMap);
    },
    addTransfer(vuexContext, newTransfer) {
        // access state value in another module
        const companyId = this.state.companies.companyId;

        // all dates keep in the store and sent to firestore MUST be firestore Timestamps
        sanitizeTransferDatesBeforeCreateOrUpdate(newTransfer);

        // ensure that any id is removed
        delete newTransfer.id;

        const created = firestoreNameSpace.FieldValue.serverTimestamp();
        newTransfer.created = created;
        newTransfer.lastModified = created;

        return getFireDbCollection(companyId)
            .add(newTransfer)
            .then(docRef => {

                newTransfer.id = docRef.id;
                vuexContext.commit("addTransfer", newTransfer);
                return docRef.id;
            })
            .catch(error => {
                console.error(error);
                // throw the error so that it can be responded to in the calling component
                throw error;
            })
            .finally(() => { });
    },
    editTransfer(vuexContext, editedTransfer) {
        // access state value in another module
        const companyId = this.state.companies.companyId;
        let transferId = editedTransfer.id;
    
        // all dates keep in the store and sent to firestore MUST be firestore Timestamps
        sanitizeTransferDatesBeforeCreateOrUpdate(editedTransfer);
    
        // remove the id from the object as firebase already has this id as the document id
        const editedTransferWithoutId = { ...editedTransfer };
        delete editedTransferWithoutId.id;
        delete editedTransferWithoutId.created;
    
        editedTransferWithoutId.lastModified = firestoreNameSpace.FieldValue.serverTimestamp();
    
        fireDb.doc(getDocumentReference(companyId, transferId))
            .update(editedTransferWithoutId)
            .then(() => {
                console.log("editTransfer sending to firebase companyId:", companyId, ", transferId:", transferId);
                vuexContext.commit("editTransfer", editedTransfer);
            })
            .catch(error => {
                console.error(error);
                // throw the error so that it can be responded to in the calling component
                throw error;
            })
            .finally(() => { });
    },
};

export const getters = {
   
    getTransfersMap: state => {
        return state.transfersMap;
    },
    getTransferById: state => id => {

        let result = null;
        if (id) {
            result = state.transfersMap.get(id);
            console.log('store getTransferById', id, result);
        }
        return result;
    },
};