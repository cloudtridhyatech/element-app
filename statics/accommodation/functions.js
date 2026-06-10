import { firebaseFunctions } from "@/plugins/firebase.js";

export const queryAccommodation = async (query, companyId) => {
    let searchResultOptions = [];

    if (query !== "") {
        console.log("queryAccommodation", query);

        try {
            const executeFulltextSearch = firebaseFunctions.httpsCallable(
                "accommodations-executeFulltextSearchOfAccommodations"
            );
            let result = await executeFulltextSearch({ query: query, companyId: companyId })
            console.log("queryAccommodation result", result.data.length);
            result.data.forEach(hit => {
                searchResultOptions.push({
                    id: hit.id,
                    accommodationName: hit.accommodationName
                });
            });
        }
        catch (error) {
            console.error("queryAccommodation error:", error);
            searchResultOptions = [];
        }
    }

    return searchResultOptions;
}

//avoid 'Duplicate keys detected' error
export const mergeAccommodationLists = (source, target) => {

    if (source && source.length > 0) {
        source.forEach((hit) => {

            const found = target.find(p => p.value === hit.id);

            if (!found) {
                target.push({
                    value: hit.id,
                    label: hit.accommodationName
                });
            }
        });
    }
    return target;
}