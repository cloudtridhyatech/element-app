const functions = require("firebase-functions");
const algoliaSearch = require("algoliasearch");
const dateUtilsFunctions = require("../dateUtils");
const companyFunctions = require("../company");
const placeFunctions = require("../places");
const transferFunctions = require("../transfers");
const tourOperatorFunctions = require("../tourOperators");

const Name = 'Algolia';

const ALGOLIA_APP_ID = functions.config().algolia.application_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_api_key;
const ALGOLIA_SEARCH_ONLY_API_KEY = functions.config().algolia
    .search_only_api_key;

const indexSuffixAccommodations = "accommodations";
const indexSuffixJournies = "journies";
const indexSuffixBookings = "bookings";
const indexSuffixUsers = "users";

class AlgoliaProxy {
    constructor() {

    }
    async addAccommodation(elementAppCompanyId, id, data) {
        await this.addOrUpdateAccommodationInAlgoliaIndex(elementAppCompanyId, id, data);
    }
    async updateAccommodation(elementAppCompanyId, id, data) {
        await this.addOrUpdateAccommodationInAlgoliaIndex(elementAppCompanyId, id, data);
    }
    async deleteAccommodation(elementAppCompanyId, id) {
        let algoliaIndex = await getAlgoliaIndexAdminAccommodations(elementAppCompanyId);
        await this.deleteItem(algoliaIndex, id, 'Accommodation');
        return null;
    }
    async searchAccommodationByText(elementAppCompanyId, data) {
        console.log('searchAccommodationByText', Name);

        let searchResults = [];

        try {
            let algoliaIndex = await getAlgoliaIndexSearchAccommodations(elementAppCompanyId);

            let includeInActiveInSearchResults = false;
            if (typeof (data.includeInActiveInSearchResults) !== 'undefined') {
                includeInActiveInSearchResults = data.includeInActiveInSearchResults;
            }

            const result = await algoliaIndex.search(data.query, {
                attributesToRetrieve: this.attributesToRetrieveAccommodation(),
                hitsPerPage: 50
            });

            if (result.hits) {
                result.hits.forEach(hit => {
                    if (hit.active === true || includeInActiveInSearchResults === true) {
                        searchResults.push(this.mapAccommodationResult(hit));
                    }
                });
            }
        } catch (error) {
            console.error(`searchAccommodationByText elementAppCompanyId: ${elementAppCompanyId} error:`, error);
        }

        return searchResults;
    }
    async searchAccommodationById(elementAppCompanyId, data) {
        console.log('searchAccommodationById', Name);
        let accommodationData = null;

        try {

            let algoliaIndex = await getAlgoliaIndexSearchAccommodations(elementAppCompanyId);

            let hit = await algoliaIndex.getObject(data.accommodationId, {
                attributesToRetrieve: this.attributesToRetrieveAccommodation()
            });
            if (hit) {
                accommodationData = this.mapAccommodationResult(hit);
            }
        } catch (error) {
            console.error(`searchAccommodationById elementAppCompanyId: ${elementAppCompanyId} error:`, error);
        }

        return accommodationData;
    }
    async addJourney(elementAppCompanyId, id, data) {
        await this.addOrUpdateJourneyInAlgoliaIndex(elementAppCompanyId, id, data);
    }
    async updateJourney(elementAppCompanyId, id, data) {
        await this.addOrUpdateJourneyInAlgoliaIndex(elementAppCompanyId, id, data);
    }
    async deleteJourney(elementAppCompanyId, id) {
        let algoliaIndex = await getAlgoliaIndexAdminJournies(elementAppCompanyId);
        await this.deleteItem(algoliaIndex, id, 'Journey');
        return null;
    }
    async searchJournies(elementAppCompanyId, data) {
        console.log('searchJournies', Name);

        let searchResults = [];

        try {

            // https://www.algolia.com/doc/api-reference/api-parameters/page/
            // Page-numbering is based on the value of hitsPerPage. If hitsPerPage=20, then page=0 will
            // display the hits from 1 to 20, page=2 will display the hits from 41 to 60.
            let page = 0;
            let hitsPerPage = 10;
            if (data.page) {
                page = data.page;
            }
            if (data.hitsPerPage) {
                hitsPerPage = data.hitsPerPage;
            }
            console.log(`searchJournies page: ${page}, hitsPerPage: ${hitsPerPage}`);

            const query = "";
            const fromDateUnixTimestamp = data.fromDateUnixTimestamp;
            const status = data.status;
            const journeyType = data.journeyType;

            let filters = "";

            filters = this.appendFilter(filters, "status", status);
            filters = this.appendFilter(filters, "journeyType", journeyType);

            if (fromDateUnixTimestamp) {
                filters = (filters.length > 0 ? `${filters} AND ` : ``) + `pickUpDateTime >= ${fromDateUnixTimestamp}`;
            }
            console.log(`searchJournies filters ${elementAppCompanyId}`, filters);

            // use the index relevant for this company
            let algoliaIndex = await getAlgoliaIndexAdminJournies(elementAppCompanyId);

            await algoliaIndex.setSettings({
                ranking: ["asc(pickUpDateTime)", "attribute"],
                attributesForFaceting: ["status", "journeyType"], // https://www.algolia.com/doc/guides/managing-results/refine-results/filtering/how-to/filter-by-string/
                searchableAttributes: ["journeyType"]
            });

            const result = await algoliaIndex.search(query, {
                filters: filters,
                attributesToRetrieve: [
                    "bookingId",
                    "journeyType",
                    "fromPlaceId",
                    "toPlaceId",
                    "pickUpDateTime",
                    "pickUpDateTimeUnixTimestamp",
                    "status"
                ],
                page: page,
                hitsPerPage: hitsPerPage
            });

            searchResults = this.mapResults(result.hits);
        } catch (error) {
            console.error(`searchJournies elementAppCompanyId: ${elementAppCompanyId} error:`, error);
            searchResults = [];
        }

        return searchResults;
    }
    async addBooking(elementAppCompanyId, id, data) {
        await this.addOrUpdateBookingInAlgoliaIndex(elementAppCompanyId, id, data);
    }
    async updateBooking(elementAppCompanyId, id, data) {
        await this.addOrUpdateBookingInAlgoliaIndex(elementAppCompanyId, id, data);
    }
    async deleteBooking(elementAppCompanyId, id) {
        let algoliaIndex = await getAlgoliaIndexAdminBookings(elementAppCompanyId);
        await this.deleteItem(algoliaIndex, id, 'Booking');
        return null;
    }
    async searchBookings(elementAppCompanyId, data) {
        console.log('searchBookings', Name);

        let searchResults = [];

        try {

            let page = 0;
            let hitsPerPage = 10;
            if (data.page) {
                page = data.page;
            }
            if (data.hitsPerPage) {
                hitsPerPage = data.hitsPerPage;
            }
            console.log(`searchBookings page: ${page}, hitsPerPage: ${hitsPerPage}`);

            const query = "";

            const searchBookingRef = data.searchBookingRef;
            const searchFirstName = data.searchFirstName;
            const searchLastName = data.searchLastName;
            const searchEmail = data.searchEmail;
            let searchMobile = "";
            if (data.searchMobile) {
                searchMobile = data.searchMobile.replace(/\D/g, "");
            }

            let filters = "";

            filters = this.appendFilter(filters, "lastName", searchLastName);
            filters = this.appendFilter(filters, "firstName", searchFirstName);
            filters = this.appendFilter(filters, "bookingRef", searchBookingRef);
            filters = this.appendFilter(filters, "email", searchEmail);
            filters = this.appendFilter(filters, "mobileSearchable", searchMobile);

            console.log("filters", filters);

            let algoliaIndex = await getAlgoliaIndexAdminBookings(elementAppCompanyId);

            // https://www.algolia.com/doc/guides/managing-results/refine-results/filtering/how-to/filter-by-string/
            await algoliaIndex.setSettings({
                ranking: ["desc(created)", "attribute"],
                attributesForFaceting: [
                    "bookingRef",
                    "mobileSearchable",
                    "firstName",
                    "lastName",
                    "email"
                ]
            });

            const result = await algoliaIndex.search(query, {
                filters: filters,
                attributesToRetrieve: [
                    "bookingRef",
                    "firstName",
                    "lastName",
                    "email",
                    "mobile",
                    "created",
                    "lastModified"
                ],
                page: page,
                hitsPerPage: hitsPerPage
            });

            console.log("result.hits", result.hits.length);
            searchResults = this.mapResults(result.hits);
        } catch (error) {
            console.error(`searchBookings elementAppCompanyId: ${elementAppCompanyId} error:`, error);
            searchResults = [];
        }

        return searchResults;
    }
    async addUser(elementAppCompanyId, id, data) {
        await this.addOrUpdateUserInAlgoliaIndex(elementAppCompanyId, id, data);
    }
    async updateUser(elementAppCompanyId, id, data) {
        await this.addOrUpdateUserInAlgoliaIndex(elementAppCompanyId, id, data);
    }
    async deleteUser(elementAppCompanyId, id) {
        let algoliaIndex = await getAlgoliaIndexAdminUser(elementAppCompanyId);
        await this.deleteItem(algoliaIndex, id, 'User');
        return null;
    }
    async searchUsers(elementAppCompanyId, data) {
        console.log('searchUsers', Name);

        let searchResults = [];

        try {

            let page = 0;
            let hitsPerPage = 10;
            if (data.page) {
                page = data.page;
            }
            if (data.hitsPerPage) {
                hitsPerPage = data.hitsPerPage;
            }

            let query = "";
            const firstName = data.firstName;
            const lastName = data.lastName;
            const userType = data.userType;
            const active = data.active;

            let filters = "";

            filters = this.appendFilter(filters, "firstName", firstName);
            filters = this.appendFilter(filters, "lastName", lastName);
            filters = this.appendFilter(filters, "userType", userType);

            if (active) {
                filters = this.appendFilter(filters, "active", `${active}`);
            }

            // use query in case when only 1 name facets value is there in filters            
            if ((firstName || lastName) && filters.includes("AND") === false) {

                query = filters.split(":")[1] || "";

                // if query exists filters should be null
                if (query) {
                    filters = null;
                }
            }

            console.log('searchUsers filters:', filters, ', query:', query);

            // use the index relevant for this company
            let algoliaIndex = await getAlgoliaIndexAdminUser(elementAppCompanyId);

            await algoliaIndex.setSettings({
                ranking: ["proximity", "attribute"],
                attributesForFaceting: ["firstName", "lastName", "userType", "active"], // https://www.algolia.com/doc/guides/managing-results/refine-results/filtering/how-to/filter-by-string/
                searchableAttributes: ["firstName", "lastName", "userType", "active"]
            });

            let params = {
                attributesToRetrieve: [
                    "firstName",
                    "lastName",
                    "email",
                    "roles",
                    "active",
                    "userType",
                    "id"
                ],
                page: page,
                hitsPerPage: hitsPerPage
            };

            // add filters to params in case no query
            if (filters && !query) {
                params["filters"] = filters;
            }

            const result = await algoliaIndex.search(String(query).trim(), params);
            searchResults = this.mapResults(result.hits);
        } catch (error) {
            console.error(`searchUsers elementAppCompanyId: ${elementAppCompanyId} error:`, error);
            searchResults = [];
        }

        return searchResults;
    }

    /*private functions */
    async deleteItem(algoliaIndex, id, name) {
        algoliaIndex.deleteObject(id).then(() => {
            console.log(`Deleted ${name} in Algolia:`, id);
            return null;
        }).catch(error => {
            console.error(`Unable to Deleted ${name} in Algolia.`, error);
        });
        return null;
    }
    appendFilter(currentFilter, name, value) {
        var filters = currentFilter;

        if (value) {
            filters =
                (currentFilter.length > 0 ? `${currentFilter} AND ` : ``) +
                `${name}:${value}`;
        }
        return filters;
    }
    mapResults(hits) {

        let searchResults = [];

        if (hits) {
            hits.forEach(hit => {
                hit.id = hit.objectID;
                searchResults.push({ ...hit });
            });
        }

        return searchResults;
    }
    mapAccommodationResult(hit) {
        return {
            id: hit.objectID,
            accommodationName: this.formatAccommodationLabel(hit)
        };
    }
    formatAccommodationLabel(hit) {
        const tourOperatorName = hit.tourOperatorName ? hit.tourOperatorName : "-";
        const placeName = hit.placeName ? hit.placeName : "-";
        return `${hit.accommodationName} / ${tourOperatorName} / ${placeName}`;
    }
    attributesToRetrieveAccommodation() {
        return [
            "accommodationName",
            "tourOperatorName",
            "placeName",
            "active"
        ];
    }
    async sanitiseDataAccommodation(elementAppCompanyId, data) {

        let placeName = '';
        let place = await placeFunctions.getPlaceById(elementAppCompanyId, data.placeId);
        if (place && place !== null && place.name) {
            placeName = place.name;
        }

        let tourOperatorName = '';
        let tourOperator = await tourOperatorFunctions.getTourOperatorById(elementAppCompanyId, data.tourOperatorId);
        if (tourOperator && tourOperator !== null && tourOperator.name) {
            tourOperatorName = tourOperator.name;
        }

        let response = {
            accommodationName: data.accommodationName,
            active: data.active,
            placeName: placeName,
            tourOperatorName: tourOperatorName
        };

        if (data.geoPoint) {
            response.latitude = data.geoPoint.latitude;
            response.longitude = data.geoPoint.longitude;
        }

        return response;
    }
    async sanitiseDataJourney(elementAppCompanyId, data) {

        let transferObject = await transferFunctions.getTransferByTransferId(elementAppCompanyId, data.transferId);

        let algoliaJourney = {
            bookingId: data.bookingId,
            toPlaceId: transferObject.toPlaceId,
            fromPlaceId: transferObject.fromPlaceId,
            journeyType: transferObject.journeyType,
            numPassengers: data.numPassengers,
            status: data.status,
            pickUpDate: data.pickUpDate,
            firstName: transferObject.ref.firstName,
            lastName: transferObject.ref.lastName,
            created: dateUtilsFunctions.convertDateOfUnknownTypeToUnixTimestamp("created", data.created),
            lastModified: dateUtilsFunctions.convertDateOfUnknownTypeToUnixTimestamp("lastModified", data.lastModified)
        };

        // deal with any date objects, we always want unix timestamp
        if (transferObject.flightDepartsDateTime) {
            algoliaJourney.flightDepartsDateTime = dateUtilsFunctions.convertDateOfUnknownTypeToUnixTimestamp(
                "flightDepartsDateTime",
                transferObject.flightDepartsDateTime
            );
        }

        if (transferObject.flightArrivesDateTime) {
            algoliaJourney.flightArrivesDateTime = dateUtilsFunctions.convertDateOfUnknownTypeToUnixTimestamp(
                "flightArrivesDateTime",
                transferObject.flightArrivesDateTime
            );
        }

        if (data.pickUpDateTime) {
            algoliaJourney.pickUpDateTime = dateUtilsFunctions.convertDateOfUnknownTypeToUnixTimestamp(
                "pickUpDateTime",
                data.pickUpDateTime
            );
        }

        if (typeof data.active !== 'undefined') {
            algoliaJourney.active = data.active;
        }

        return algoliaJourney;
    }
    sanitiseDataBooking(data) {
        // a utility function to remove any sensitive/private data before mirroring to Algolia
        let booking = {
            bookingRef: data.bookingRef,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            mobile: data.mobile,
            mobileSearchable: data.mobile.replace(/\D/g, ""),
            secondaryMobile: data.secondaryMobile,
            secondaryMobileSearchable: data.secondaryMobile.replace(/\D/g, ""),
            created: dateUtilsFunctions.convertDateOfUnknownTypeToUnixTimestamp("created", data.created),
            lastModified: dateUtilsFunctions.convertDateOfUnknownTypeToUnixTimestamp("lastModified", data.lastModified)
        };

        return booking;
    }
    // a utility function to remove any sensitive/private data before mirroring to Algolia
    sanitiseDataUser(data) {
        let user = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            roles: data.roles,
            active: data.active,
            userType: data.userType
        };
        return user;
    }

    async addOrUpdateJourneyInAlgoliaIndex(elementAppCompanyId, id, data) {
        try {
            let algoliaIndex = await getAlgoliaIndexAdminJournies(elementAppCompanyId);
            const sanitisedData = await this.sanitiseDataJourney(elementAppCompanyId, data);

            return this.addOrUpdateInAlgoliaIndex(algoliaIndex, id, sanitisedData);
        } catch (error) {
            console.error(`addOrUpdateJourneyInAlgoliaIndex elementAppCompanyId ${elementAppCompanyId}, id:${id}, error:`, error);
        }
        return null;
    }

    async addOrUpdateAccommodationInAlgoliaIndex(elementAppCompanyId, id, data) {
        try {
            let algoliaIndex = await getAlgoliaIndexAdminAccommodations(elementAppCompanyId);
            const sanitisedData = await this.sanitiseDataAccommodation(elementAppCompanyId, data);

            return this.addOrUpdateInAlgoliaIndex(algoliaIndex, id, sanitisedData);
        } catch (error) {
            console.error(`addOrUpdateAccommodationInAlgoliaIndex elementAppCompanyId ${elementAppCompanyId}, id:${id}, error:`, error);
        }
        return null;
    }

    async addOrUpdateBookingInAlgoliaIndex(elementAppCompanyId, id, data) {
        try {
            let algoliaIndex = await getAlgoliaIndexAdminBookings(elementAppCompanyId);
            const sanitisedData = this.sanitiseDataBooking(data);

            return this.addOrUpdateInAlgoliaIndex(algoliaIndex, id, sanitisedData);
        } catch (error) {
            console.error(`addOrUpdateBookingInAlgoliaIndex elementAppCompanyId ${elementAppCompanyId}, id:${id}, error:`, error);
        }
        return null;
    }

    async addOrUpdateUserInAlgoliaIndex(elementAppCompanyId, id, data) {
        try {
            let algoliaIndex = await getAlgoliaIndexAdminUser(elementAppCompanyId);
            const sanitisedData = this.sanitiseDataUser(data);

            return this.addOrUpdateInAlgoliaIndex(algoliaIndex, id, sanitisedData);
        } catch (error) {
            console.error(`addOrUpdateUserInAlgoliaIndex elementAppCompanyId ${elementAppCompanyId}, id:${id}, error:`, error);
        }
        return null;
    }

    async addOrUpdateInAlgoliaIndex(algoliaIndex, id, sanitisedData) {
        try {
            // connect the objects together on the two platforms by using the firestore doc id as the id for each record on algolia
            const algoliaObjectId = id;

            return algoliaIndex.saveObject({
                ...sanitisedData,
                objectID: algoliaObjectId
            });
        } catch (error) {
            throw (error);
        }
    }
}

exports.AlgoliaProxy = AlgoliaProxy;


/* Private functions*/

const getAlgoliaIndexSearchAccommodations = (async (elementAppCompanyId) => {
    return await getAlgoliaIndexSearch(elementAppCompanyId, indexSuffixAccommodations);
});

const getAlgoliaIndexAdminAccommodations = (async (elementAppCompanyId) => {
    return await getAlgoliaIndexAdmin(elementAppCompanyId, indexSuffixAccommodations);
});

const getAlgoliaIndexAdminJournies = (async (elementAppCompanyId) => {
    return await getAlgoliaIndexAdmin(elementAppCompanyId, indexSuffixJournies);
});

const getAlgoliaIndexAdminBookings = (async (elementAppCompanyId) => {
    return await getAlgoliaIndexAdmin(elementAppCompanyId, indexSuffixBookings);
});

const getAlgoliaIndexAdminUser = (async (elementAppCompanyId) => {
    return await getAlgoliaIndexAdmin(elementAppCompanyId, indexSuffixUsers);
});

const getAlgoliaIndexSearch = (async (elementAppCompanyId, indexSuffix) => {

    const algoliaClient = getAlgoliaClientSearch();

    let companyData = await companyFunctions.getCompanyData(elementAppCompanyId);
    const companyKey = companyData.companyKey;

    return algoliaClient.initIndex(`${getEnv()}_${companyKey}_${indexSuffix}`);
});

const getAlgoliaIndexAdmin = (async (elementAppCompanyId, indexSuffix) => {

    const algoliaClient = getAlgoliaClientAdmin();

    let companyData = await companyFunctions.getCompanyData(elementAppCompanyId);
    const companyKey = companyData.companyKey;

    return algoliaClient.initIndex(`${getEnv()}_${companyKey}_${indexSuffix}`);
});

const getAlgoliaClientSearch = () => {
    return algoliaSearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_ONLY_API_KEY);
};

const getAlgoliaClientAdmin = () => {
    return algoliaSearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
};

const getEnv = () => {

    let config = functions.config();

    let env = config.hosting.environment
        ? config.hosting.environment
        : "dev";

    if (config.algolia.env) {
        env = config.algolia.env;
    }

    return env;
};