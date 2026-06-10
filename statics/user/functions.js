import { fireDb } from "@/plugins/firebase.js";

export const getCollectionReferenceUsers = (companyId) => {
    return `companies/${companyId}/users`;
};

export const getDocumentReferenceUsers = (companyId, id) => {
    return `${getCollectionReferenceUsers(companyId)}/${id}`;
};

export const getCollectionUsers = (companyId) => {
    return fireDb.collection(getCollectionReferenceUsers(companyId));
};

export const getDocumentReferenceUser = (companyId, id) => {
    return fireDb.doc(getDocumentReferenceUsers(companyId, id));
};

