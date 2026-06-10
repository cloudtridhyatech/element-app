<template>
  <!-- This example requires Tailwind CSS v2.0+ -->
  <div class="relative bg-white">
    <DesktopNavigation
      :showMobileNav="showMobileNav"
      @toggleMobileMenu="showMobileNav = !showMobileNav"
      class="container"
    ></DesktopNavigation>

    <MobileNavigation
      :showMobileNav="showMobileNav"
      @toggleMobileMenu="showMobileNav = !showMobileNav"
    ></MobileNavigation>
  </div>
</template>

<script>
import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";

export default {
  name: "navigation",
  components: {
    DesktopNavigation,
    MobileNavigation
  },
  data() {
    return {
      showMobileNav: false
    };
  },
  created() {},
  methods: {}
};
</script>

<style scoped></style>
