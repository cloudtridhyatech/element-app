export default {
  ssr: false,

  vueMeta: {
    debounceWait: 250
  },
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || "",
    meta: [
      { charset: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1,user-scalable=no"
      },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || ""
      }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    script: [
      {
        type: "text/javascript",
        src: "/js/iframeResizer.contentWindow.min.js"
      }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },
  /*
   ** Global CSS
   */
  css: ["element-ui/lib/theme-chalk/index.css", "@/assets/scss/main.scss"],

  // Defaults options
  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
    configPath: "tailwind.config.js",
    exposeConfig: false,
    config: {}
  },

  /**
   * https://dev.to/ceppeu/using-sass-global-variables-in-nuxt-js-j0k
   */
  styleResources: {
    scss: ["./assets/scss/variables.scss"]
  },

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    "@/plugins/element-ui",
    "@/plugins/vuelidate.js",
    "@/plugins/firebase.js",
    "@/plugins/fireauth.js",
    "@/plugins/help-crunch.js"
  ],
  /*
   ** Nuxt.js dev-modules
   *
   * Notes on installing Moment
   * https://github.com/nuxt-community/moment-module
   */
  buildModules: [
    "@nuxt/typescript-build",
    "@nuxtjs/moment",
    "@nuxtjs/tailwindcss"
  ],

  moment: {
    defaultLocale: "en",
    locales: ["fr"]
  },
  /*
   ** Nuxt.js modules
   * https://dev.to/ceppeu/using-sass-global-variables-in-nuxt-js-j0k
   */
  modules: ["@nuxtjs/axios", "@nuxtjs/style-resources"],
  /*
   ** Build configuration
   */
  build: {
    transpile: [/^element-ui/],
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  },

  env: {

    localUrl: "localhost",
    devUrl: "development.myskitaxi.com",
    stagingUrl: "staging-app.element-transfers.com",
    productionUrl: "app.element-transfers.com",

    fbAPIKey: "AIzaSyAHQn-Z_7y5g4SFgokBsO5FuytDZ3TTq6o",
    gcpAPIKey: "AIzaSyC2ialUbhg46s-mMAzbTWXr8mlBud5813s", // https://console.cloud.google.com/apis/credentials?_ga=2.86445080.1668955969.1611729233-425187678.1611567823&project=element-app-development&folder=&organizationId=

    firebaseConfigDevelopment: {
      apiKey: "AIzaSyC2ialUbhg46s-mMAzbTWXr8mlBud5813s",
      authDomain: "element-app-development.firebaseapp.com",
      projectId: "element-app-development",
      storageBucket: "element-app-development.appspot.com",
      messagingSenderId: "415553513100",
      appId: "1:415553513100:web:0565df4957aaa0012c7da9"
    },

    firebaseConfigStaging: {
      apiKey: "AIzaSyARgbgfZDm3ArLzQCsefFlw3GjnRO6TJjs",
      authDomain: "element-app-staging.firebaseapp.com",
      databaseURL: "https://element-app-staging.firebaseio.com",
      projectId: "element-app-staging",
      storageBucket: "element-app-staging.appspot.com",
      messagingSenderId: "71364145274",
      appId: "1:71364145274:web:a3b337c739ea64267ccbc3"
    },

    firebaseConfigProduction: {
      apiKey: "AIzaSyChZTTtfvHodK-oIn7qnLkotCw3D719ioU",
      authDomain: "element-app-production.firebaseapp.com",
      databaseURL: "https://element-app-production.firebaseio.com",
      projectId: "element-app-production",
      storageBucket: "element-app-production.appspot.com",
      messagingSenderId: "1033089971848",
      appId: "1:1033089971848:web:475d647e1765b4dbc7113d"
    },

    userRoleOptions: [
      {
        label: "Accommodation Admin",
        key: "accommodation-admin",
        description: "Able to create, edit and disable accommodations."
      },
      {
        label: "Booking Admin",
        key: "booking-admin",
        description: "Able to create, edit and disable bookings."
      },
      {
        label: "Drivers",
        key: "driver-admin",
        description: "Able to view and update My Schedule. (User Type Driver also required)."
      },
      {
        label: "Journies Admin",
        key: "journey-admin",
        description:
          "Able to create, edit and disable journies (within bookings)."
      },
      {
        label: "Place and Route Admin",
        key: "place-and-route-admin",
        description: "Able to create, edit and disable places and routes."
      },
      {
        label: "Pricing Rules Admin",
        key: "pricing-rules-admin",
        description: "Able to create, edit and disable pricing rules."
      },
      {
        label: "Scheduler Admin",
        key: "scheduler-admin",
        description: "Able to create, edit and disable events in the schedule."
      },
      {
        label: "Tour Operator Admin",
        key: "tour-operator-admin",
        description: "Able to create, edit and disable tour operators."
      },
      {
        label: "User Admin",
        key: "user-admin",
        description: "Able to create, edit and disable users."
      },
      {
        label: "Vehicle Admin",
        key: "vehicle-admin",
        description: "Able to create, edit and disable vehicles."
      },
      {
        label: "Settings Admin",
        key: "settings-admin",
        description: "Able to edit site settings."
      },
      {
        label: "System Admin",
        key: "system-admin",
        description: "System Admin.",
        visible: false
      }
    ],

    userTypeOptions: [
      {
        value: "driver",
        label: "Driver",
        description:
          "A driver will only be given access to the 'driver application' to view his schedule.  A driver can also see the detail of each accommodation and is able to submit a photo of each accommodation for approval."
      },
      {
        value: "staff",
        label: "Staff",
        description: "A regular staff member"
      },
      {
        value: "tour-operator",
        label: "Tour Operator",
        description:
          "A tour operator that the company works with and delivers clients to and from."
      },
      {
        value: "customer",
        label: "Customer",
        description: "A customer that makes transfer bookings."
      }
    ],

    daysOfWeekOptions: [
      {
        label: "Mon",
        key: "monday",
        isoWeekday: 1,
      },
      {
        label: "Tue",
        key: "tuesday",
        isoWeekday: 2,
      },
      {
        label: "Wed",
        key: "wednesday",
        isoWeekday: 3,
      },
      {
        label: "Thu",
        key: "thursday",
        isoWeekday: 4,
      },
      {
        label: "Fri",
        key: "friday",
        isoWeekday: 5,
      },
      {
        label: "Sat",
        key: "saturday",
        isoWeekday: 6,
      },
      {
        label: "Sun",
        key: "sunday",
        isoWeekday: 7,
      }
    ],

    defaultVehicleSettings: {
      maxActiveVehicles: 3,
      maxActiveDrivers: 0,
      maxActivePlaces: 0,
      maxActiveRoutes: 0
    }
  }
};
