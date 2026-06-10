import { fireDb, firestoreNameSpace } from "@/plugins/firebase.js";

/* flat() function not always supported so using custom version*/
Object.defineProperty(Array.prototype, 'arrayAppend', {
  value: function () {
    return this.reduce(function (items, toAppend) {
      return items.concat(toAppend);
    }, []);
  }
});

const moveElementInArray = (array, index, delta) => {
  //ref: https://gist.github.com/albertein/4496103
  console.log("move", array, index, delta);

  const newIndex = index + delta;
  if (newIndex < 0 || newIndex == array.length) return; //Already at the top or bottom.

  var indexes = [index, newIndex].sort((a, b) => a - b); //Sort the indixes (fixed)

  if (Array.isArray(array)) {
    array.splice(indexes[0], 2, array[indexes[1]], array[indexes[0]]); //Replace from lowest index, two elements, reverting the order
  } else {
    console.error("You must pass an array");
  }
};

export const moveElementUp = (index, array) => {
  moveElementInArray(array, index, -1);
};
export const moveElementDown = (index, array) => {
  moveElementInArray(array, index, 1);
};

/**
 * https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
 * @param {*} key
 * @param {*} order
 */
export const sortByObjectKey = (key, order = "asc") => {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    const varA = typeof a[key] === "string" ? a[key].toUpperCase() : a[key];
    const varB = typeof b[key] === "string" ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return order === "desc" ? comparison * -1 : comparison;
  };
};

export const mapRefDocsToArray = (refs, callback = null) => {

  return handleMapRefDocsToArray(refs, callback);
};

function handleMapRefDocsToArray(refs, callback = null) {

  let items = [];

  try {

    refs.docs.forEach(doc => {
      let item = doc.data();
      item.id = doc.id;

      if (callback !== null) {
        if (callback(item) === true) {
          items.push(item);
        }
      }
      else {
        items.push(item);
      }
    });
  }
  catch (error) {
    items = [];
    console.log('mapDocsToArray error', error);
  }

  return items;
};

export const queryByIds = async (collection, idArray) => {

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

        const query = fireDb.collection(collection).where(firestoreNameSpace.FieldPath.documentId(), "in", [...batch]);
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
              fireDb.collection(collection).where(firestoreNameSpace.FieldPath.documentId(), "in", [...batch])
                .get()
                .then(refs => response(
                  handleMapRefDocsToArray(refs)
                ));
            })
          );
        }
  
        Promise.all(batches).then(content => {
          res(content.arrayAppend());
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
      `queryByIds Unable to pull ${collection} from the data store: ${idArray}`,
      error
    );
    results = [];
  }


  return results;
};