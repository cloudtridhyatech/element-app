<template>
  <!-- https://tailwindui.com/components/marketing/elements/headers -->
  <transition
    enter-active-class="transition ease-out duration-200"
    leave-active-class="transition ease-in duration-100"
    enter-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="showMobileNav"
      class="absolute z-10 top-0 inset-x-0 p-2 transition transform origin-top-right lg:hidden"
    >
      <div
        class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50"
      >
        <div class="pt-5 pb-6 px-5">
          <div class="flex items-center justify-between">
            <div>
              <nuxt-link
                no-prefetch
                to="/"
                class="text-base font-medium text-gray-500 hover:text-gray-900"
                ><img
                  class="h-8 w-auto"
                  src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                  alt="Workflow"
              /></nuxt-link>
            </div>
            <div class="-mr-2">
              <button
                @click="$emit('toggleMobileMenu')"
                type="button"
                class="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span class="sr-only">Close menu</span>
                <!-- Heroicon name: x -->
                <svg
                  class="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewbox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="mt-6">
            <nav class="grid gap-y-8">
              <nuxt-link
                v-show="mixinCanSeeHome(loggedInUser)"
                no-prefetch
                to="/"
                class="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
              >
                <!-- Heroicon name: chart-bar -->
                <svg
                  class="flex-shrink-0 h-6 w-6 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewbox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span class="ml-3 text-base font-medium text-gray-900">
                  Home
                </span>
              </nuxt-link>
              <nuxt-link
                v-show="mixinCanSeeMySchedule(loggedInUser)"
                no-prefetch
                to="/driver"
                class="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
              >
                <svg
                  class="flex-shrink-0 h-6 w-6 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewbox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                <span class="ml-3 text-base font-medium text-gray-900">
                  My Schedule
                </span>
              </nuxt-link>
            </nav>
          </div>
        </div>
        <!--
        <div class="py-6 px-5 space-y-6">
          <div class="grid grid-cols-2 gap-y-4 gap-x-8">
            <a
              href="#"
              class="text-base font-medium text-gray-900 hover:text-gray-700"
            >
              Example Link
            </a>

            <a
              href="#"
              class="text-base font-medium text-gray-900 hover:text-gray-700"
            >
              Example Link
            </a>

            <a
              href="#"
              class="text-base font-medium text-gray-900 hover:text-gray-700"
            >
              Example Link
            </a>

            <a
              href="#"
              class="text-base font-medium text-gray-900 hover:text-gray-700"
            >
              Example Link
            </a>
          </div>
          -->
          <div>
            <el-button
              plain
              type="primary"
              @click.prevent="handleLogout"
              style="width: 100%"
              >Sign Out</el-button
            >
            <!--             <p class="mt-6 text-center text-base font-medium text-gray-500">
              Existing customer?
              <a href="#" class="text-indigo-600 hover:text-indigo-500">
                Sign in
              </a>
            </p> -->
          </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";
import { navigationPermissionsMixin } from "@/statics/auth/navigationPermissions.js";

export default {
  name: "mobile-navigation",
  mixins: [navigationPermissionsMixin],
  props: {
    showMobileNav: {
      type: Boolean,
      required: true
    }
  },

  computed: {
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    })
  },

  methods: {
    handleLogout() {
      this.$store.dispatch("auth/signOut");
      this.$router.push("auth");
    }
  }
};
</script>

<style lang="scss" scoped></style>
