<template>
  <div>
    <section>
      <div class="bg-gray-100 mt-6">
        <el-form
          ref="routeForm"
          label-position="top"
          :model="routeForm"
          label-width="180px"
          size="medium"
        >
          <div
            class="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8 border border-1 rounded-lg"
          >
            <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Route Information
                    </h3>
                    <p class="mt-1 text-sm text-gray-600">
                      {{ fromPointName }} to {{ toPointName }}
                    </p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <div>
                      <RouteForm1 :routeForm="routeForm" ref="routeForm1"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div>

            <div class="mt-10 sm:mt-0">
              <div class="md:grid md:grid-cols-3 md:gap-6">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-gray-900">
                      Additional Taxable Zone
                    </h3>
                    <p class="mt-1 text-sm text-gray-600">
                      If part of this journey is performed in an additional
                      taxable zone/country, use this to specify the distance
                      covered in that second zone/country.
                    </p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <div>
                      <RouteFormTax :routeForm="routeForm" ref="routeFormTax" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="hidden sm:block" aria-hidden="true">
              <div class="py-12">
                <div class="border-t border-gray-200"></div>
              </div>
            </div>

            <div class="flex justify-end">
              <div>
                <el-button
                  type="primary"
                  :disabled="false"
                  @click.prevent="saveOrUpdate"
                  :loading="loading"
                  icon="el-icon-download"
                >
                  {{ isEditing ? "Update Route" : "Save Route" }}
                </el-button>
                <el-button @click="handleCancel()" icon="el-icon-close"
                  >Cancel</el-button
                >
              </div>
            </div>
          </div>
        </el-form>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import RouteForm1 from "@/components/Routes/RouteForm1";
import RouteFormTax from "@/components/Routes/RouteFormTax";
import {
  getCollectionRoutes,
} from "@/statics/routes/functions.js";


export default {
  components: {
    RouteForm1,
    RouteFormTax
  },

  computed: {
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    }),      
    ...mapGetters("routes", {
      getRouteById: "getRouteById"
    }),
    ...mapGetters("routes", {
      routesSettings: "getRoutesSettings",
    }),
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),     

    fromPointName: function() {
      if (this.routeForm.fromCode) {
        return this.allPlaces.find(
          place => place.code === this.routeForm.fromCode
        ).name;
      }
    },

    toPointName: function() {
      if (this.routeForm.toCode) {
        return this.allPlaces.find(
          place => place.code === this.routeForm.toCode
        ).name;
      }
    }
  },

  data() {
    return {
      isCreating: false,
      isEditing: false,

      existingRoute: Object,

      // keeping track of the submit button status
      loading: false,

      // our form data
      routeForm: {},
      previousActiveStatus: false,      
    };
  },

  async created() {
    await this.$store.dispatch("routes/getRoutesSettings");
    this.initForm();

    if (this.$route.query.routeId) {
      // Set flag inidicating that we're editing an existing pricing rule.
      this.isEditing = true;

      this.existingRoute = this.getRouteById(this.$route.query.routeId);

      this.routeForm = {
        ...this.routeForm,
        ...this.existingRoute
      };
      this.previousActiveStatus = this.existingRoute.active;
    } else {
      this.isCreating = true;

      // we are expecting fromCode and toCode in the Vue route
      this.routeForm.fromCode = this.$route.query.fromCode;
      this.routeForm.toCode = this.$route.query.toCode;
    }
  },

  methods: {
    initForm() {
      this.routeForm = {
        fromCode: "",
        toCode: "",

        distance: null,
        time: null,

        active: false,
        bookable: false,
        secondaryTVARateApplies: false,
        secondaryTVARateAllocation: 0
      };
    },
    async getActiveRoutesCount(){
      let activeRoutesCount = null;

      //search for the number of active routes
      try {
        let ref = await getCollectionRoutes(this.companyId)
                        .where("active", "==", true);            

        let snapshot = await ref.get();
        activeRoutesCount = snapshot.docs.length;
      } catch (error) {
        console.error("Unable to pull active routes from the data store");
        activeRoutesCount = 0;
      }
      return activeRoutesCount;
    },
    async saveOrUpdate() {
      this.loading = true;

      let routeLimitReached = false;
      let maxActiveRoutes = this.routesSettings.maxActiveRoutes;
      let activeRoutesCount = await this.getActiveRoutesCount();

      let isMaxExceeded = (activeRoutesCount+1) > maxActiveRoutes;

      if(this.isCreating === true && this.isEditing === false) {
        let isActive = this.routeForm.active === true;

        if(isActive && isMaxExceeded) {
          routeLimitReached = true;
        }
      }
      else if(this.isCreating === false && this.isEditing === true)
      {
         //for edits, only check if the actice status has been changed and/or a change in active status
         let isNowActive = this.routeForm.active === true && this.previousActiveStatus === false;    
         if(isNowActive && isMaxExceeded) {
          routeLimitReached = true;           
         }
      }

      if(routeLimitReached === true) {
        this.$notify.warning({
          title: "Max active route allowed limit reached",
          message: `Your account is limited to ${maxActiveRoutes} routes.  Please contact us to upgrade your account so that you can add more routes.`,
          offset: 100,
        });
      }
      else{
        let allFromsValid = this.$refs["routeForm1"].isValidForm() && this.$refs["routeFormTax"].isValidForm();

        this.$refs["routeForm"].validate(valid => {
          if (valid && allFromsValid) {
            if (this.isEditing) {
              this.updateRoute();
            } else {
              this.createRoute();
            }
            return true;
          } else {
            this.loading = false;
            return false;
          }          
        });
      }
    },

    createRoute() {
      const route = {
        ...this.routeForm
      };
      this.$store
        .dispatch("routes/addRoute", route)
        .then(() => {
          this.$message({
            message: "The route was created",
            type: "success",
            duration: 5000
          });

          this.$router.push({ path: "/routes" });
        })
        .catch(error => {
          this.$message({
            message: "The route could not be created",
            type: "error",
            duration: 5000
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    updateRoute() {
      const editedRoute = {
        id: this.routeId,
        ...this.routeForm
      };

      console.log("editedRoute", editedRoute);

      this.$store
        .dispatch("routes/editRoute", editedRoute)
        .then(() => {
          this.$message({
            message: "The route was updated",
            type: "success",
            duration: 5000
          });

          this.$router.push({ path: "/routes" });
        })
        .catch(error => {
          this.$message({
            message: "The route could not be updated",
            type: "error",
            duration: 5000
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    handleCancel() {
      this.$router.push({ path: "/routes" });
    }
  }
};
</script>
