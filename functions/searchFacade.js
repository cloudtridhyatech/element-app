const functions = require("firebase-functions");
const settingsFunctions = require("./settings");

const algoliaProxy = require('./search/algoliaProxy');

const getSearchProxy = (async (elementAppCompanyId) => {
    let systemName = "algolia";

    //There is only one search at the moment so it's hard coded
    //If a different search was introduced uncomment the section below and add the
    //searchSystemName to --settings
    /*
    try {
        let settings = await settingsFunctions.getSettingsData(elementAppCompanyId);

        if (settings && settings.searchSystemName && settings.searchSystemName !== null) {
            systemName = settings.searchSystemName;
        }
    } catch (error) {
        console.error("Unable to pull search setting from the data store", error);
        throw new functions.https.HttpsError(
            "internal",
            "Unable to pull search setting from the data store"
        );
    }
    */

    return createSearchProxy(systemName);
});

const createSearchProxy = (systemName) => {

    let proxy;

    let systemNameLowerCase = "";
    if (systemName && systemName !== null && systemName !== "") {
        systemNameLowerCase = systemName.toLowerCase();
    }

    switch (systemNameLowerCase) {
        case 'algolia':
            proxy = new algoliaProxy.AlgoliaProxy();
            break;
        default:
            break;
    }

    return proxy;
};

exports.addAccommodation = (async (elementAppCompanyId, id, data) => {
    const method = "addAccommodation";
    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!data) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} data is not a valid argument`
        );
    }

    if (!id) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} id is not a valid argument`
        );
    }

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            await system.addAccommodation(elementAppCompanyId, id, data);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
    }
    return null;
});

exports.updateAccommodation = (async (elementAppCompanyId, id, data) => {
    const method = "updateAccommodation";
    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!data) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} data is not a valid argument`
        );
    }

    if (!id) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} id is not a valid argument`
        );
    }

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            await system.updateAccommodation(elementAppCompanyId, id, data);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
    }
    return null;
});

exports.deleteAccommodation = (async (elementAppCompanyId, id) => {

    const method = "deleteAccommodation";

    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!id) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} id is not a valid argument`
        );
    }

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            await system.deleteAccommodation(elementAppCompanyId, id);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
    }
    return null;
});

exports.searchAccommodationByText = (async (elementAppCompanyId, data) => {
    const method = "searchAccommodationByText";
    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!data.query) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "searchAccommodationByText query is not a valid argument"
        );
    }

    let searchResults = [];

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            searchResults = await system.searchAccommodationByText(elementAppCompanyId, data);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
        searchResults = [];
    }

    return searchResults;
});

exports.searchAccommodationById = (async (elementAppCompanyId, data) => {

    const method = "searchAccommodationById";
    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!data.accommodationId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} accommodationId is not a valid argument`
        );
    }

    let searchResults = [];

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            searchResults = await system.searchAccommodationById(elementAppCompanyId, data);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
        searchResults = [];
    }

    return searchResults;
});

exports.searchJournies = (async (elementAppCompanyId, data) => {

    const method = "searchJournies";
    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if ((!data.ignorefromDate || data.ignorefromDate === false) && !data.fromDateUnixTimestamp) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} fromDateUnixTimestamp is not a valid argument`
        );
    }

    let searchResults = [];

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            searchResults = await system.searchJournies(elementAppCompanyId, data);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
        searchResults = [];
    }

    return searchResults;
});

exports.addJourney = (async (elementAppCompanyId, id, data) => {

    const method = "addJourney";
    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!data) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} data is not a valid argument`
        );
    }

    if (!id) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} id is not a valid argument`
        );
    }

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            await system.addJourney(elementAppCompanyId, id, data);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
    }
    return null;
});

exports.updateJourney = (async (elementAppCompanyId, id, data) => {

    const method = "updateJourney";

    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!data) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} data is not a valid argument`
        );
    }

    if (!id) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} id is not a valid argument`
        );
    }

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            await system.updateJourney(elementAppCompanyId, id, data);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
    }
    return null;
});

exports.deleteJourney = (async (elementAppCompanyId, id) => {

    const method = "deleteJourney";

    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!id) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} id is not a valid argument`
        );
    }

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            await system.deleteJourney(elementAppCompanyId, id);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
    }
    return null;
});

exports.searchBookings = (async (elementAppCompanyId, data) => {

    const method = "searchBookings";
    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!data) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} fromDateUnixTimestamp is not a valid argument`
        );
    }

    let searchResults = [];

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            searchResults = await system.searchBookings(elementAppCompanyId, data);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
        searchResults = [];
    }

    return searchResults;
});

exports.addBooking = (async (elementAppCompanyId, id, data) => {
    const method = "addBooking";
    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!data) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} data is not a valid argument`
        );
    }

    if (!id) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} id is not a valid argument`
        );
    }

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            await system.addBooking(elementAppCompanyId, id, data);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
    }
    return null;
});

exports.updateBooking = (async (elementAppCompanyId, id, data) => {
    const method = "updateBooking";
    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!data) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} data is not a valid argument`
        );
    }

    if (!id) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} id is not a valid argument`
        );
    }

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            await system.updateBooking(elementAppCompanyId, id, data);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
    }
    return null;
});

exports.deleteBooking = (async (elementAppCompanyId, id) => {

    const method = "deleteBooking";

    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!id) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} id is not a valid argument`
        );
    }

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            await system.deleteBooking(elementAppCompanyId, id);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
    }
    return null;
});


exports.searchUsers = (async (elementAppCompanyId, data) => {

    const method = "searchUsers";
    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!data) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} data is not a valid argument`
        );
    }

    let searchResults = [];

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            searchResults = await system.searchUsers(elementAppCompanyId, data);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
        searchResults = [];
    }

    return searchResults;
});

exports.addUser = (async (elementAppCompanyId, id, data) => {
    const method = "addUser";
    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!data) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} data is not a valid argument`
        );
    }

    if (!id) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} id is not a valid argument`
        );
    }

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            await system.addUser(elementAppCompanyId, id, data);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
    }
    return null;
});

exports.updateUser = (async (elementAppCompanyId, id, data) => {
    const method = "updateUser";
    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!data) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} data is not a valid argument`
        );
    }

    if (!id) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} id is not a valid argument`
        );
    }

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            await system.updateUser(elementAppCompanyId, id, data);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
    }
    return null;
});

exports.deleteUser = (async (elementAppCompanyId, id) => {

    const method = "deleteUser";

    console.log(`searchFacade ${method}`, elementAppCompanyId);

    if (!id) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            `${method} id is not a valid argument`
        );
    }

    try {
        const system = await getSearchProxy(elementAppCompanyId);

        if (system && system.can(method)) {
            await system.deleteUser(elementAppCompanyId, id);
        }
        else {
            console.log(`${method} not supported`);
        }
    } catch (error) {
        console.error(`${method} ${elementAppCompanyId} error:`, error);
    }
    return null;
});