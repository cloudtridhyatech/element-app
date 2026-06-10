<template>
  <div class="flex flex-col h-screen justify-between">
    <div class="h-24">
      <Navigation />
    </div>
    <div class="px-4 py-4 mx-auto container mb-auto">
      <nuxt />
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
