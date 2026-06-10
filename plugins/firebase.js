import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/functions";
import "firebase/auth";

if (!firebase.apps.length) {
  // pick up the config from nuxt.config.js

  console.log('location.hostname', location.hostname);

  if (location.hostname === process.env.devUrl) {
    // pick up the config from nuxt.config.js 
    firebase.initializeApp(process.env.firebaseConfigDevelopment);
    console.log('firebase development loading');
  } else if (location.hostname === process.env.stagingUrl) {
    firebase.initializeApp(process.env.firebaseConfigStaging);
    console.log('firebase staging loading');
  } else if (location.hostname === process.env.productionUrl) {
    firebase.initializeApp(process.env.firebaseConfigProduction);
    console.log('firebase production loading');
  } else if (location.hostname === process.env.localUrl) {

    firebase.initializeApp(process.env.firebaseConfigProduction);

    // Instrument the app to talk to the Firestore emulator
    console.log("USING LOCAL FIRESTORE DATABASE");
    var db = firebase.firestore();
    db.settings({
      host: "localhost:8080",
      ssl: false
    });

    // Instrument your app to talk to the Authentication emulator
    console.log("USING LOCAL FIRESTORE AUTH");
    firebase.auth().useEmulator("http://localhost:9099/");

    // Instrument your app to talk to the Functions emulator
    console.log("USING LOCAL FIRESTORE FUNCTIONS");
    firebase.functions().useFunctionsEmulator("http://localhost:5001");
  } else {
    console.error("Unable to determine the environment and CANNOT initialise firebase environment")
  }
}

const fireDb = firebase.firestore();
const firebaseFunctions = firebase.functions();
const fireAuth = firebase.auth();
const firestoreNameSpace = firebase.firestore;

export { fireDb, firebaseFunctions, fireAuth, firestoreNameSpace };
