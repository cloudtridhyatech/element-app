import { fireDb } from "@/plugins/firebase.js";

const getCollectionReference = (companyId, name) => {
    return `companies/${companyId}/${name}`;
};

export const getCollectionReferencePlaces = (companyId) => {
    return getCollectionReference(companyId, "places");
};

export const getDocumentReferencePlaces = (companyId, id) => {
    return `${getCollectionReferencePlaces(companyId)}/${id}`;
};

export const getCollectionPlaces = (companyId) => {
    return fireDb.collection(getCollectionReferencePlaces(companyId));
};

export const getDocumentReferencePlace = (companyId, id) => {
    return fireDb.doc(getDocumentReferencePlaces(companyId, id));
};

export const getCollectionReferenceRoutes = (companyId) => {
    return getCollectionReference(companyId, "routes");
};

export const getDocumentReferenceRoutes = (companyId, id) => {
    return `${getCollectionReferenceRoutes(companyId)}/${id}`;
};

export const getCollectionRoutes = (companyId) => {
    return fireDb.collection(getCollectionReferenceRoutes(companyId));
};

export const getDocumentReferenceRoute = (companyId, id) => {
    return fireDb.doc(getDocumentReferenceRoutes(companyId, id));
};


export const getCollectionReferencePlaceGroups = (companyId) => {
    return getCollectionReference(companyId, "placeGroups");
};

export const getDocumentReferencePlaceGroups = (companyId, id) => {
    return `${getCollectionReferencePlaceGroups(companyId)}/${id}`;
};

export const getCollectionPlaceGroups = (companyId) => {
    return fireDb.collection(getCollectionReferencePlaceGroups(companyId));
};

export const getDocumentReferencePlaceGroup = (companyId, id) => {
    return fireDb.doc(getDocumentReferencePlaceGroups(companyId, id));
};

