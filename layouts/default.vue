<template>
  <div class="flex flex-col h-screen justify-between text-gray-700">
    <div class="h-24">
      <Navigation />
    </div>
    <div class="px-4 py-4 mx-auto container mb-auto text-gray-700">
      <nuxt />
    </div>
    <div class="px-4 py-4 mx-auto container h-64 text-gray-700">
      <TheFooter />
    </div>
  </div>
</template>

<script>
import Navigation from "~/components/Navigation/Navigation";
import TheFooter from "~/components/Navigation/TheFooter";
export default {
  middleware: ["check-auth", "auth"],
  components: {
    Navigation,
    TheFooter
  },

  created() {
    // HelpCrunch("showChatWidget");
  }
};
</script>

<style scoped></style>
