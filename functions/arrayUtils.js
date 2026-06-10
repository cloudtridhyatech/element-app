// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require("firebase-admin");
const fireDb = firebaseAdmin.firestore();

/* flat() function not always supported so using custom version*/
Object.defineProperty(Array.prototype, 'arrayAppend', {
    value: function () {
        return this.reduce(function (items, toAppend) {
            return items.concat(toAppend);
        }, []);
    }
});

exports.mapRefDocsToArray = ((refs) => {
    return handleMapRefDocsToArray(refs);
})

function handleMapRefDocsToArray(refs) {

    let items = [];

    try {

        refs.docs.forEach(doc => {
            let item = doc.data();
            item.id = doc.id;
            items.push(item);
        });
    }
    catch (error) {
        items = [];
        console.log('mapDocsToArray error', error);
    }

    return items;
}

exports.queryByIds = (async (collection, idArray) => {

    console.log(
        "queryByIds ",
        collection,
        idArray
    );

    let results = [];

    try {

        /* Non promise version */
        /*
        if (idArray && idArray.length > 0) {

            while (idArray.length) {
                // firestore limits batches to 10
                const batch = idArray.splice(0, 10);

                const query = fireDb.collection(collection).where(firebaseAdmin.firestore.FieldPath.documentId(), "in", [...batch]);
                const refs = await query.get();
                let batchResults = handleMapRefDocsToArray(refs);
                batchResults.forEach(doc => {
                    results.push(doc);
                });
            }
        }
        */
        let batchLoadPromise = new Promise((res) => {

            let batches = [];
            if (idArray && idArray.length > 0) {

                while (idArray.length) {
                    // firestore limits batches to 10
                    const batch = idArray.splice(0, 10);

                    // add the batch request to to a queue
                    batches.push(
                        new Promise(response => {
                            fireDb.collection(collection).where(firebaseAdmin.firestore.FieldPath.documentId(), "in", [...batch])
                                .get()
                                .then(refs => {
                                    response(handleMapRefDocsToArray(refs));
                                    return null;
                                }).catch((error) => {
                                    console.error("queryByIds Error ", error);
                                });
                        })
                    );
                }

                Promise.all(batches)
                    .then(content => {
                    res(content.arrayAppend());
                    return null;
                }).catch((error) => {
                    console.error("Promise.all queryByIds Error ", error);
                });
            }
            else {
                return res([]);
            }
        });

        results = await batchLoadPromise;

        console.log(
            "queryByIds READ ",
            results.length,
            "documents."
        );
    }
    catch (error) {
        console.error(
            `queryByIds Unable to pull ${collection} from the data store:  ${idArray}`,
            error
        );
        results = [];
    }

    return results;
})