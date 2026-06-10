import { fireDb } from "@/plugins/firebase.js";

export const getEditableSettingsRef = (companyId) => {

    let editableSettingsRef = fireDb.collection("companies")
        .doc(companyId)
        .collection("settings")
        .doc("--editableSettings--");

    return editableSettingsRef;
};

export const getEditableSettingsData = async (companyId) => {

    let editableSettingsRef = getEditableSettingsRef(companyId);
    let snapshot = await editableSettingsRef.get();
    console.log('companyId', companyId);
    console.log('snapshot.data()', snapshot.data());
    return snapshot.data();
};

export const getSettingsRef = (companyId) => {

    let settingsRef = fireDb.collection("companies")
        .doc(companyId)
        .collection("settings")
        .doc("--settings--");

    return settingsRef;
};

export const getSettingsData = async (companyId) => {

    let settingsRef = getSettingsRef(companyId);
    let snapshot = await settingsRef.get();
    return snapshot.data();
};

export const updateSettingsData = async (companyId, data) => {

    const settingsRef = await getSettingsRef(companyId);

    await settingsRef.set(data, { merge: true });
};

export const getSettingsField = handleGetSettingsField;

async function handleGetSettingsField(companyId, fieldName) {

    let settingsData = await getSettingsData(companyId);

    if (!settingsData) {
        return null;
    }

    return settingsData[fieldName];
}

export const isSystemAllowed = async (companyId, name) => {

    let systemAllowed = await handleGetSettingsField(companyId, name);

    if (systemAllowed && systemAllowed === true) {
        return true;
    }
    return false;
};