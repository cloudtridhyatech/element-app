export default function(context) {
  // the function called from here uses the localStorage which is not available on the server
  // although the application is running as SPA, this is belts and braces.
  if (process.client) {
    console.log("[MIDDLEWARE initAuth]");
    context.store.dispatch("auth/initAuth");
  }
}
