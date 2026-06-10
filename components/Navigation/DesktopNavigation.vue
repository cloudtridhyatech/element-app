<template>
  <div class="max-w-7xl mx-auto px-4 ">
    <div
      class="flex justify-between items-center border-b-2 border-gray-100 py-6 lg:justify-start lg:space-x-10"
    >
      <div class="flex justify-start ">
        <a href="#">
          <span class="sr-only">Workflow</span>
          <img
            class="h-8 w-auto sm:h-10"
            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
            alt=""
          />
        </a>
      </div>
      <div class="-mr-2 -my-2 lg:hidden">
        <button
          @click="$emit('toggleMobileMenu')"
          type="button"
          class="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        >
          <span class="sr-only">Open menu</span>
          <!-- Heroicon name: menu -->
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      <nav class="hidden lg:flex space-x-10">
        <nuxt-link
          v-show="mixinCanSeeHome(this.loggedInUser)"
          no-prefetch
          to="/"
          class="text-base font-medium text-gray-500 hover:text-gray-900"
          >Home</nuxt-link
        >
        <nuxt-link
          v-show="mixinCanSeeMySchedule(this.loggedInUser)"
          no-prefetch
          to="/driver"
          class="text-base font-medium text-gray-500 hover:text-gray-900"
          >My Schedule</nuxt-link
        >
        <nuxt-link
          v-show="mixinCanReadBookings(loggedInUser)"
          no-prefetch
          to="/bookings"
          class="text-base font-medium text-gray-500 hover:text-gray-900"
          >Bookings</nuxt-link
        >
        <!-- <nuxt-link
          v-show="mixinCanReadBookings(loggedInUser)"
          no-prefetch
          to="/journies"
          class="text-base font-medium text-gray-500 hover:text-gray-900"
          >Journies</nuxt-link
        > -->
        <nuxt-link
          v-show="mixinCanReadBookings(loggedInUser)"
          no-prefetch
          to="/scheduler"
          class="text-base font-medium text-gray-500 hover:text-gray-900"
          >Scheduler</nuxt-link
        >
        <nuxt-link
          v-show="mixinCanReadUsers(loggedInUser)"
          no-prefetch
          to="/users"
          class="text-base font-medium text-gray-500 hover:text-gray-900"
          >Users</nuxt-link
        >

        <div
          class="relative"
          v-show="
            mixinCanReadTourOperators(loggedInUser) ||
              mixinCanReadAccommodations(loggedInUser)
          "
        >
          <!-- Item active: "text-gray-900", Item inactive: "text-gray-500" -->
          <button
            @click="toggleSubMenu(tourOpAndAccommMenuIndex)"
            type="button"
            class="group bg-white rounded-md text-gray-500 inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span>Tour Ops &amp; Accomm</span>
            <!--
                Heroicon name: chevron-down
                Item active: "text-gray-600", Item inactive: "text-gray-400"
              -->
            <svg
              class="ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewbox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- https://tailwindui.com/components/marketing/elements/headers -->
          <transition
            enter-active-class="transition ease-out duration-200"
            leave-active-class="transition ease-in duration-150"
            enter-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-show="showSubMenu[tourOpAndAccommMenuIndex]"
              class="absolute z-10 left-1/2 transform -translate-x-1/2 mt-3 px-2 w-screen max-w-md sm:px-0"
            >
              <div
                class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
              >
                <div class="grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                  <nuxt-link
                    v-show="mixinCanReadTourOperators(loggedInUser)"
                    @click.native="initSubMenuArray()"
                    to="/tourOperator"
                    class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
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
                        d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div class="ml-4">
                      <p class="text-base font-medium text-gray-900">
                        Tour Operators
                      </p>
                      <p class="mt-1 text-sm text-gray-500">
                        Create and maintain tour operators.
                      </p>
                    </div>
                  </nuxt-link>

                  <nuxt-link
                    v-show="mixinCanReadAccommodations(loggedInUser)"
                    @click.native="initSubMenuArray()"
                    to="/accommodation"
                    class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div class="ml-4">
                      <p class="text-base font-medium text-gray-900">
                        Accommodation
                      </p>
                      <p class="mt-1 text-sm text-gray-500">
                        Tour operator accommodation you can transfer to and
                        from.
                      </p>
                    </div>
                  </nuxt-link>
                </div>
                <!--
                <div class="bg-white px-5 py-5 bg-gray-50 sm:px-8 sm:py-8">
                  <div>
                    <h3
                      class="text-sm tracking-wide font-medium text-gray-500 uppercase"
                    >
                      Recent Posts
                    </h3>
                    <ul class="mt-4 space-y-4">
                      <li class="text-base truncate">
                        <a
                          href="#"
                          class="font-medium text-gray-900 hover:text-gray-700"
                        >
                          Boost your conversion rate
                        </a>
                      </li>

                      <li class="text-base truncate">
                        <a
                          href="#"
                          class="font-medium text-gray-900 hover:text-gray-700"
                        >
                          How to use search engine optimization to drive traffic
                          to your site
                        </a>
                      </li>

                      <li class="text-base truncate">
                        <a
                          href="#"
                          class="font-medium text-gray-900 hover:text-gray-700"
                        >
                          Improve your customer experience
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div class="mt-5 text-sm">
                    <a
                      href="#"
                      class="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View all posts
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
                -->
              </div>
            </div>
          </transition>
        </div>

        <div
          class="relative"
          v-show="
            mixinCanReadPlacesAndRoutes(loggedInUser) ||
              mixinCanReadPricingRules(loggedInUser) ||
              mixinCanReadVehicles(loggedInUser)
          "
        >
          <button
            @click="toggleSubMenu(otherMenuIndex)"
            type="button"
            class="group bg-white rounded-md text-gray-500 inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span>Other</span>
            <svg
              class="ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewbox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- https://tailwindui.com/components/marketing/elements/headers -->
          <transition
            enter-active-class="transition ease-out duration-200"
            leave-active-class="transition ease-in duration-150"
            enter-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-show="showSubMenu[otherMenuIndex]"
              class="absolute z-10 left-1/2 transform -translate-x-1/2 mt-3 px-2 w-screen max-w-md sm:px-0"
            >
              <div
                class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
              >
                <div class="grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                  <nuxt-link
                    v-show="mixinCanReadPlacesAndRoutes(loggedInUser)"
                    @click.native="initSubMenuArray()"
                    no-prefetch
                    to="/routes"
                    class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
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
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <div class="ml-4">
                      <p class="text-base font-medium text-gray-900">
                        Routes
                      </p>
                      <p class="mt-1 text-sm text-gray-500">
                        Create and maintain the places you serve and the routes
                        you can supply.
                      </p>
                    </div>
                  </nuxt-link>

                  <nuxt-link
                    v-show="mixinCanReadPricingRules(loggedInUser)"
                    @click.native="initSubMenuArray()"
                    to="/pricing"
                    class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <div class="ml-4">
                      <p class="text-base font-medium text-gray-900">
                        Pricing
                      </p>
                      <p class="mt-1 text-sm text-gray-500">
                        Route pricing rules.
                      </p>
                    </div>
                  </nuxt-link>

                  <nuxt-link
                    v-show="mixinCanReadVehicles(loggedInUser)"
                    @click.native="initSubMenuArray()"
                    to="/vehicles"
                    class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <div class="ml-4">
                      <p class="text-base font-medium text-gray-900">
                        Vehicles
                      </p>
                      <p class="mt-1 text-sm text-gray-500">
                        Create and maintain vehicles your fleet of vehicles.
                      </p>
                    </div>
                  </nuxt-link>
                  <nuxt-link
                    v-show="mixinCanReadSettings(loggedInUser)"
                    @click.native="initSubMenuArray()"
                    to="/settings"
                    class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <div class="ml-4">
                      <p class="text-base font-medium text-gray-900">
                        Settings
                      </p>
                      <p class="mt-1 text-sm text-gray-500">
                        Edit site settings.
                      </p>
                    </div>
                  </nuxt-link>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <div class="relative" v-show="mixinCanReadSettings(loggedInUser)">
          <button
            @click="toggleSubMenu(settingsMenuIndex)"
            type="button"
            class="group bg-white rounded-md text-gray-500 inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span>Settings</span>
            <svg
              class="ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewbox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- https://tailwindui.com/components/marketing/elements/headers -->
          <transition
            enter-active-class="transition ease-out duration-200"
            leave-active-class="transition ease-in duration-150"
            enter-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-show="showSubMenu[settingsMenuIndex]"
              class="absolute z-10 left-1/2 transform -translate-x-1/2 mt-3 px-2 w-screen max-w-md sm:px-0"
            >
              <div
                class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
              >
                <div class="grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                  <nuxt-link
                    v-show="mixinCanReadSettings(loggedInUser)"
                    @click.native="initSubMenuArray()"
                    to="/settings"
                    class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <div class="ml-4">
                      <p class="text-base font-medium text-gray-900">
                        Settings
                      </p>
                      <p class="mt-1 text-sm text-gray-500">
                        Edit general settings.
                      </p>
                    </div>
                  </nuxt-link>

                  <nuxt-link
                    v-show="mixinCanReadSettings(loggedInUser)"
                    @click.native="initSubMenuArray()"
                    to="/settings/otherSettings"
                    class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <div class="ml-4">
                      <p class="text-base font-medium text-gray-900">
                        Other Settings
                      </p>
                      <p class="mt-1 text-sm text-gray-500">
                        Edit other settings.
                      </p>
                    </div>
                  </nuxt-link>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </nav>
      <div class="hidden lg:flex items-center justify-end md:flex-1 lg:w-0">
        <el-button plain type="primary" @click.prevent="handleLogout"
          >Sign Out</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapGetters } from "vuex";

import { accommodationPermissionsMixin } from "@/statics/auth/accommodationPermissions.js";
import { userPermissionsMixin } from "@/statics/auth/userPermissions.js";
import { placeAndRoutePermissionsMixin } from "@/statics/auth/placeAndRoutePermissions.js";
import { vehiclePermissionsMixin } from "@/statics/auth/vehiclePermissions.js";
import { tourOperatorPermissionsMixin } from "@/statics/auth/tourOperatorPermissions.js";
import { pricingRulesPermissionsMixin } from "@/statics/auth/pricingRulesPermissions.js";
import { bookingPermissionsMixin } from "@/statics/auth/bookingPermissions.js";
import { settingsPermissionsMixin } from "@/statics/auth/settingsPermissions.js";
import { navigationPermissionsMixin } from "@/statics/auth/navigationPermissions.js";

export default {
  name: "desktop-navigation",
  props: {
    showMobileNav: {
      type: Boolean,
      required: true
    }
  },

  mixins: [
    accommodationPermissionsMixin,
    userPermissionsMixin,
    placeAndRoutePermissionsMixin,
    vehiclePermissionsMixin,
    tourOperatorPermissionsMixin,
    pricingRulesPermissionsMixin,
    bookingPermissionsMixin,
    settingsPermissionsMixin,
    navigationPermissionsMixin
  ],

  data() {
    return {
      showSubMenu: [],
      tourOpAndAccommMenuIndex: 0,
      otherMenuIndex: 1,
      settingsMenuIndex: 2,
      menuSubNavs: ["tourOpAndAccomm", "other", "settings"],

      activeLink: null,
      url: "@/assets/images/original.jpg"
    };
  },

  computed: {
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    })
  },

  created() {
    this.initSubMenuArray();
  },

  // https://gist.github.com/languanghao/5f74ca361f22192ba774941a69fd275b
  mounted() {
    this.activeLink = this.$route.path;
    // Attach event listener to the document
    document.addEventListener("click", this.onClick);
  },

  beforeDestroy() {
    document.removeEventListener("click", this.onClick);
  },
  watch: {
    $route(newVal, oldVal) {
      this.activeLink = newVal.path;
      // console.log("watching menu: ", this.activeLink);
    }
  },

  methods: {
    initSubMenuArray() {
      this.menuSubNavs.forEach((element, index) => {
        // https://vuejs.org/v2/guide/reactivity.html
        Vue.set(this.showSubMenu, index, false);
      });
    },

    // if we detect a click anywhere on the document and it's not inside the menu system, assume
    // the user wants to close any visible sub menus.
    onClick: function(e) {
      if (!this.$el.contains(e.target)) {
        this.initSubMenuArray();
        Vue.set(this.showSubMenu, 0, false); // force Vue reactivity on any element in the array
      }
    },

    toggleSubMenu(index) {
      // close any other sub menus in case anything is open
      this.menuSubNavs.forEach((element, menuSubNavsIndex) => {
        if (index != menuSubNavsIndex) {
          this.showSubMenu[menuSubNavsIndex] = false;
        }
      });
      // https://vuejs.org/v2/guide/reactivity.html
      Vue.set(this.showSubMenu, index, !this.showSubMenu[index]);
    },

    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    handleLogout() {
      this.$store.dispatch("auth/signOut");
      this.$router.push("auth");
    }
  }
};
</script>

<style lang="scss" scoped></style>
