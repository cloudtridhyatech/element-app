import { fireDb, firestoreNameSpace } from "@/plugins/firebase.js";
import { mapRefDocsToArray, queryByIds } from "@/statics/array-utils.js";

function getCollectionReference(companyId) {
    return `companies/${companyId}/transfers`
}

export const getMapTransfersByTransferIds = async (companyId, transferIds) => {

    console.log(`getMapTransfersByTransferIds. companyId ${companyId} transfers`, transferIds);

    let transfersMap = new Map();

    try {

        let idArray = transferIds;
        if (idArray && idArray.length > 0) {

            let batchResults = await queryByIds(getCollectionReference(companyId), idArray);
            batchResults.forEach(item => {
                transfersMap.set(item.id, item);
            });
        }
        console.log("READ ", transfersMap.size, " transfer documents.");
    }
    catch (error) {
        console.error(
            "Unable to pull transfers from the data store",
            error
        );
        transfersMap.clear();
    }
    finally {
    }
    return transfersMap;
};
