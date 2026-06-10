<template>
  <div class="mt-6 flex flex-col">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div
          class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Places
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Active
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="placeGroup in placeGroups"
                :key="placeGroup.id"
                class="hover:bg-gray-100"
              >
                <td class="px-6 py-4 whitespace-no-wrap items-start">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ placeGroup.name }}
                      </div>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-for="id in placeGroup.places" :key="id">
                    {{ renderPlace(id) }}<br />
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full  text-green-800"
                    v-bind:class="[
                      placeGroup.active ? 'bg-green-200' : 'bg-red-200'
                    ]"
                  >
                    {{ placeGroup.active ? "active" : "disabled" }}
                  </span>
                </td>

                <td
                  class="px-6 py-4 whitespace-no-wrap text-right text-sm font-medium"
                >
                  <el-button
                    v-if="mixinCanEditPlacesAndRoutes(loggedInUser)"
                    size="medium"
                    @click="handleEditPlaceGroup(placeGroup.id)"
                    type="primary"
                    icon="el-icon-edit"
                  ></el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { placeAndRoutePermissionsMixin } from "@/statics/auth/placeAndRoutePermissions.js";

export default {
  mixins: [placeAndRoutePermissionsMixin],

  props: {
    placeGroups: {
      type: Array,
      required: true
    },
    allPlaces: {
      type: Array,
      required: true
    }
  },

  computed: {
    ...mapGetters("users", {
      loggedInUser: "getLoggedInUser"
    })
  },

  methods: {
    renderPlace(id) {
      let place = this.allPlaces.find(place => place.id === id);

      if (place) {
        return `${place.name} (${place.code})`;
      }
      return "error";
    },
    handleEditPlaceGroup(id) {
      this.$router.push({
        path: "/routes/editGroup",
        query: { placeGroupId: id }
      });
    }
  }
};
</script>
