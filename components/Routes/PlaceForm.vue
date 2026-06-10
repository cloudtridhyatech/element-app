<template>
  <div>
    <section>
      <div class="bg-gray-100 mt-6">
        <el-form
          ref="placeForm"
          label-position="top"
          :model="placeForm"
          :rules="rules"
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
                      Basic Information
                    </h3>
                    <p class="mt-1 text-sm text-gray-600">
                      Enter the name of the place and a unique code.

                      <br /><br />Color and text color are optional but will be
                      used in the scheduler to help identify places at a glance.
                    </p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <PlaceForm1 :placeForm="placeForm" />
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
                      Transit Point
                    </h3>
                    <p class="mt-1 text-sm text-gray-600">
                      Enable if this place is an aiport, train station, bus
                      station etc.
                    </p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <PlaceForm2 :placeForm="placeForm"  ref="placingForm2" />
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
                      Active / Listing Order
                    </h3>
                    <p class="mt-1 text-sm text-gray-600">
                      Enable or disable this place as well as set the priority
                      of the listing order.
                    </p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <PlaceForm3 :placeForm="placeForm" ref="placingForm3"/>
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
                  {{ isEditing ? "Update Place" : "Save Place" }}
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
import PlaceForm1 from "@/components/Routes/PlaceForm1";
import PlaceForm2 from "@/components/Routes/PlaceForm2";
import PlaceForm3 from "@/components/Routes/PlaceForm3";
import {
  getCollectionPlaces,
} from "@/statics/routes/functions.js";


export default {
  components: {
    PlaceForm1,
    PlaceForm2,
    PlaceForm3
  },

  computed: {
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    }),

    ...mapGetters("places", {
      getPlaceById: "getPlaceById"
    }),
    ...mapGetters("places", {
      placesSettings: "getPlacesSettings",
    }),
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),    
  },

  data() {
    var checkUniquePlaceCode = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("Please input place code"));
      }
      setTimeout(() => {
        let filteredPlaces = this.allPlaces;
        if (this.existingPlace) {
          // we are editing, so remove current place from uniqueness check ...
          filteredPlaces = this.allPlaces.filter(
            place => place.id != this.existingPlace.id
          );
        }
        const otherPlaceWithSameCode = filteredPlaces.find(p => {
          return p.code.toLowerCase() === value.toLowerCase();
        });
        if (otherPlaceWithSameCode) {
          return callback(new Error("Please input unique place code"));
        } else {
          callback();
        }
      }, 0);
    };

    return {
      isCreating: false,
      isEditing: false,
      isFormValidated: true,
      // keeping track of the submit button status
      loading: false,

      placeForm: {},
      previousActiveStatus: false,
      rules: {
        name: [
          {
            required: true,
            message: "Please input place name",
            trigger: "change"
          },
          {
            required: true,
            min: 2,
            message: "Name should have at least 2 characters"
          }
        ],
        code: [
          {
            required: true,
            validator: checkUniquePlaceCode,
            trigger: "change"
          }
        ]
      }
    };
  },

  async created() {
    this.initForm();
    await this.$store.dispatch("places/getPlacesSettings");

    if (this.$route.query.placeId) {
      this.isEditing = true;
      this.existingPlace = this.getPlaceById(this.$route.query.placeId);

      this.placeForm = {
        ...this.placeForm,
        ...this.existingPlace
      };

      this.previousActiveStatus = this.existingPlace.active;
    } else {
      this.isCreating = true;
    }
  },

  methods: {
    initForm() {
      this.placeForm = {
        name: "",
        code: "",
        isTransitPoint: false,
        transitPointPickUpDelay: 0,
        transitPointCheckInTime: 0,
        active: true,
        listingOrder: 1,
        color: "",
        fontColor: ""
      };
    },
    async getActivePlacesCount(){
      let activePlaceCount = null;

      //search for the number of active places
      try {
        let ref = await getCollectionPlaces(this.companyId)
                      .where("active", "==", true);            

        let snapshot = await ref.get();
        activePlaceCount = snapshot.docs.length;
      } catch (error) {
        console.error("Unable to pull active places from the data store");
        activePlaceCount = 0;
      }
      return activePlaceCount;
    },
    async saveOrUpdate() {
      console.log("saveOrUpdate");

      let placeLimitReached = false;
      let maxActivePlaces = this.placesSettings.maxActivePlaces;
      let activePlacesCount = await this.getActivePlacesCount();      

      let isMaxExceeded = (activePlacesCount+1) > maxActivePlaces;

      if(this.isCreating === true && this.isEditing === false) {
        let isActive = this.placeForm.active === true;

        if(isActive && isMaxExceeded) {
          placeLimitReached = true;
        }
      }
      else if(this.isCreating === false && this.isEditing === true)
      {
         //for edits, only check if the actice status has been changed and/or a change in active status
         let isNowActive = this.placeForm.active === true && this.previousActiveStatus === false;    
         if((isNowActive) && isMaxExceeded) {
          placeLimitReached = true;           
         }
      }

      if(placeLimitReached === true) {
        this.$notify.warning({
          title: "Max active places allowed limit reached",
          message: `Your account is limited to ${maxActivePlaces} places.  Please contact us to upgrade your account so that you can add more places.`,
          offset: 100,
        });
      }
      else{

      let allFromsValid = this.$refs["placingForm2"].isValidForm() && this.$refs["placingForm3"].isValidForm();

      this.$refs["placeForm"].validate(valid => {
        this.isFormValidated = valid;
        if (valid && allFromsValid) {
          if (this.isEditing) {
            this.updatePlace();
          } else {
            this.createPlace();
          }
        } else {
          return false;
        }
      });
      }
    },

    createPlace() {
      this.loading = true;

      const place = {
        active: true,
        ...this.placeForm
      };

      this.$store
        .dispatch("places/addPlace", place)
        .then(() => {
          this.$message({
            message: `Created place successfully`,
            type: "success",
            duration: 5000
          });

          this.$router.push({ path: "/routes" });
        })
        .catch(error => {
          this.$message({
            message: `Failed to create place: ${error.message}`,
            type: "error",
            duration: 5000
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    updatePlace() {
      this.loading = true;

      const editedPlace = {
        id: this.placeId,
        active: true,
        ...this.placeForm
      };

      this.$store
        .dispatch("places/editPlace", editedPlace)
        .then(() => {
          this.$message({
            message: `Updated place successfully`,
            type: "success",
            duration: 5000
          });

          this.$router.push({ path: "/routes" });
        })
        .catch(error => {
          this.$message({
            message: `Failed to update place: ${error.message}`,
            type: "error",
            duration: 5000
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    createNewPlace() {
      this.isCreating = true;
      this.initForm();
    },

    handleCancel() {
      this.$router.push({ path: "/routes" });
    }
  }
};
</script>
