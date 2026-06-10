<template>
  <div>
    <section>
      <el-card class="c74-list-section">
        <div slot="header" class="clearfix c74-card-header">
          <div>Routes</div>
        </div>

        <div class="c74-chart">
          <div class="c74-column">
            <div
              v-for="(place, index) in allPlaces"
              :key="index"
              class="c74-name-box"
            >
              <el-link @click.prevent="handleEditPlace(place.id)">{{
                place.name
              }}</el-link>
            </div>
          </div>
          <div class="c74-column">
            <div v-for="(outerPlace, outerIndex) in allPlaces" v-bind:key="outerIndex">
              <div class="c74-row">
                <div v-for="(innerPlace, innerIndex) in allPlaces" v-bind:key="innerIndex">
                  <RouteCell
                    :outerPlace="outerPlace"
                    :innerPlace="innerPlace"
                    :outerIndex="outerIndex"
                    :innerIndex="innerIndex"
                    v-on:route-clicked="handleRouteClicked"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="c74-row">
          <div class="c74-name-box">
            <!-- spacer -->
          </div>
          <div
            v-for="(place, index) in allPlaces"
            class="c74-name-box-vert"
            v-bind:key="index"            
          >
            <el-link @click.prevent="handleEditPlace(place.id)">{{
              place.name
            }}</el-link>
          </div>
        </div>
      </el-card>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import RouteCell from "@/components/Routes/RouteCell";
import RouteForm from "@/components/Routes/RouteForm";

export default {
  name: "Routes",
  components: {
    RouteCell,
    RouteForm
  },
  created() {
    if (this.allRoutes.length === 0) {
      this.$store.dispatch("routes/initRoutes").then(() => {
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  },

  computed: {
    ...mapGetters("places", {
      allPlaces: "getAllPlaces"
    }),    
    ...mapGetters("routes", {
      allRoutes: "getAllRoutes"
    })
  },

  data() {
    return {
      loading: true,

      // https://stackoverflow.com/questions/47810218/set-data-type-in-vue-data-object-with-typescript
      routes: [],

      routeId: "",
      existingRoute: null,
      shouldOpenDialog: false
    };
  },

  methods: {
    async onLoadExistingRoute(id) {
      this.routeId = "";

      const ref = fireDb
        .collection("companies")
        .doc(this.companyId)
        .collection("routes")
        .doc(id);

      try {
        const snapshot = await ref.get();

        this.routeId = id;
        this.existingRoute = snapshot.data();
      } catch (e) {
        console.error(e);
      }
    },
    onCloseForm() {
      this.existingRoute = null;
      this.shouldOpenDialog = false;
    },
    onOpenForm() {
      // console.log("parent.onOpenForm");
      this.shouldOpenDialog = true;
    },
    handleRouteClicked(outerPlace, innerPlace) {
      console.log("handleRouteClicked", outerPlace, innerPlace);
      this.existingRoute = this.allRoutes.find(
        route =>
          route.fromCode === outerPlace.code && route.toCode === innerPlace.code
      );
      if (!this.existingRoute) {
        // we need to pass from and to at least
        this.$router.push({
          path: "/routes/editRoute",
          query: { fromCode: outerPlace.code, toCode: innerPlace.code }
        });
      } else {
        this.$router.push({
          path: "/routes/editRoute",
          query: { routeId: this.existingRoute.id }
        });
      }
    },

    handleEditPlace(id) {
      this.$root.$router.push({
        path: "/routes/editPlace",
        query: { placeId: id }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.c74-chart {
  margin-top: 64px;
  display: flex;
}

.c74-name-box {
  width: 150px;
  height: 60px;
  display: flex;
  align-items: center;
  padding-left: 5px;
  border: 1px solid #fff;
}

.c74-name-box-vert {
  width: 60px;
  height: 150px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  display: flex;
  align-items: center;
  padding-top: 16px;
  border: 1px solid #fff;
}

.c74-column {
  display: flex;
  flex-direction: column;
}

.c74-row {
  display: flex;
  flex-direction: row;
}

.c74-list-section {
  margin: 48px 0px;
}
</style>
