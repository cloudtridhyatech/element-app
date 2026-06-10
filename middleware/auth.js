export default function(context) {

  console.log("[MIDDLEWARE isAuthenticated]");
  if (context.route.name === 'start-id') {
    console.log('allowing');
  } else {
    if (!context.store.getters["auth/isAuthenticated"]) {
      // if the user is not authenticated, redirected to login
      context.redirect("/auth");
    }
  }


  console.log('Nuxt route', );


}
