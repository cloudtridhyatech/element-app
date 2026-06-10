import { fireAuth } from "~/plugins/firebase.js";

export default context => {
  const { store } = context;

  return new Promise((resolve, reject) => {
    fireAuth.onAuthStateChanged(user => {
      // here is you would want to build your user
      // object, but for now, we'll just take everything

      console.log("ON AUTH STATE CHANGED", user);

      if (user) {
        // https://stackoverflow.com/questions/38365075/vuex-vuejs-do-not-mutate-vuex-store-state-outside-mutation-handlers
        store.dispatch("auth/setUser", { email: user.email });
      } else {
        store.dispatch("auth/setUser", null);
      }

      resolve();
    });
  });
};
