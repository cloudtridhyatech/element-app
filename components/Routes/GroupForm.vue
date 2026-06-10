<template>
  <div>
    <section>
      <div class="bg-gray-100 mt-6">
        <el-form
          ref="groupForm"
          label-position="top"
          :model="groupForm"
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
                      Group Information
                    </h3>
                    <p class="mt-1 text-sm text-gray-600">
                      Group 2 or more places together.

                      <br /><br />Grouping places together allows you to avoid
                      duplicating pricing rules for places that are close
                      together and subject to the same price.
                    </p>
                  </div>
                </div>
                <div class="mt-5 md:mt-0 md:col-span-2">
                  <div
                    class="shadow overflow-hidden p-10 sm:rounded-md bg-white"
                  >
                    <GroupForm1 :groupForm="groupForm" :allPlaces="allPlaces" />
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
                  {{ isEditing ? "Update Group" : "Save Group" }}
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
import GroupForm1 from "@/components/Routes/GroupForm1";

export default {
  components: {
    GroupForm1
  },

  computed: {
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    }),
    ...mapGetters("placeGroups", {
      getPlaceGroupById: "getPlaceGroupById"
    })
  },

  data() {
    return {
      isCreating: false,
      isEditing: false,
      isFormValidated: true,
      // keeping track of the submit button status
      loading: false,

      groupForm: {},

      placeGroupId: "",
      placeIdsInGroup: [], // this will be in the format: ["7vo3x4ggWQ2M7jLp5vwc", "9VmENLiy3sEnHEOONA4v"]

      existingGroup: Object,

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
        ]
      }
    };
  },

  created() {
    if (this.$route.query.placeGroupId) {
      this.isEditing = true;
      this.placeGroupId = this.$route.query.placeGroupId;

      this.existingGroup = this.getPlaceGroupById(this.placeGroupId);
      this.placeIdsInGroup = this.existingGroup.places;

      // for each place code already in the group, move it's index into the indexesInGroup[] array.
      // this will move this place from the left list to the right list in the form
      const indexesInGroup = [];
      this.allPlaces.forEach((place, index) => {
        this.placeIdsInGroup.forEach(id => {
          if (place.id === id) {
            indexesInGroup.push(index);
          }
        });
      });

      this.groupForm = {
        ...this.existingGroup,
        indexesInGroup: indexesInGroup
      };
    } else {
      this.initForm();
      this.isCreating = true;
    }
  },

  methods: {
    initForm() {
      this.groupForm = {
        name: "",
        indexesInGroup: []
      };
    },

    async saveOrUpdate() {
      this.$refs["groupForm"].validate(valid => {
        this.isFormValidated = valid;
        if (valid) {
          if (this.groupForm.indexesInGroup.length > 0) {
            this.placeIdsInGroup = [];

            this.groupForm.indexesInGroup.forEach(index => {
              this.placeIdsInGroup.push(this.allPlaces[index].id);
            });

            if (this.isEditing) {
              this.updateGroup();
            } else {
              this.createGroup();
            }
          } else {
            this.$message({
              message: `There must be 1 or more places in the group`,
              type: "error",
              duration: 5000
            });
          }
        }
      });
    },

    createGroup() {
      this.loading = true;

      const group = {
        name: this.groupForm.name,
        places: this.placeIdsInGroup,
        active: true
      };

      this.$store
        .dispatch("placeGroups/addPlaceGroup", group)
        .then(() => {
          this.$message({
            message: `Created group successfully`,
            type: "success",
            duration: 5000
          });

          this.$router.push({ path: "/routes" });
        })
        .catch(error => {
          this.$message({
            message: `Failed to create group: ${error.message}`,
            type: "error",
            duration: 5000
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    updateGroup() {
      this.loading = true;

      const editedGroup = {
        id: this.placeGroupId,
        name: this.groupForm.name,
        places: this.placeIdsInGroup,
        active: true
      };

      this.$store
        .dispatch("placeGroups/editPlaceGroup", editedGroup)
        .then(() => {
          this.$message({
            message: `Updated group successfully`,
            type: "success",
            duration: 5000
          });

          this.$router.push({ path: "/routes" });
        })
        .catch(error => {
          this.$message({
            message: `Failed to update group: ${error.message}`,
            type: "error",
            duration: 5000
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    createNewGroup() {
      this.isCreating = true;
      this.groupForm = this.initForm();
    },

    handleCancel() {
      this.$router.push({ path: "/routes" });
    }
  }
};
</script>
