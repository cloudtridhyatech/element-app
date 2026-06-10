<template>
  <div class="header-container" v-if="currentRouteName === 'driver'">
    <div>
      <!-- <i class="el-icon-timer" @click="handleTimerClick()"></i> -->
      &nbsp;
    </div>
    <div>Schedule</div>
    <div>
      <nuxt-link
        no-prefetch
        :to="{
          name: 'driver-settings'
        }"
      >
        <i class="el-icon-s-operation" type="info"></i>
      </nuxt-link>
    </div>
  </div>

  <div
    class="header-container"
    v-else-if="currentRouteName === 'driver-detail'"
  >
    <div>
      <el-button type="info" @click="$router.go(-1)"><i class="el-icon-back"/>Back</el-button>
    </div>
    <div>Trip Details</div>
    <div>
      &nbsp;
    </div>
  </div>

  <div
    class="header-container"
    v-else-if="currentRouteName === 'driver-settings'"
  >
    <div>
      <el-button type="info" @click="$router.go(-1)"><i class="el-icon-back"/>Back</el-button>
    </div>
    <div>Settings</div>
    <div>&nbsp;</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "1",
      activeIndex2: "1",
      url: "@/assets/images/original.jpg"
    };
  },
  computed: {
    currentRouteName() {
      return this.$route.name;
    }
  },
  methods: {
    handleTimerClick() {
      alert("This button does nothing for the moment.");
    },
    handleSettingsClick() {
      alert("This button does nothing for the moment.");
    }
  }
};
</script>

<style lang="scss" scoped>
.header-container {
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: uppercase;
  height: 60px;
  padding: 0px 12px;
  background-color: $color-background-driver-app;

  border-bottom: 1px solid #dcdfe6;

  i {
    font-size: 1.5em;
  }

  .el-menu--horizontal {
    border-bottom: none;
  }
}

.el-message-box {
  width: 220px;
}
a,
a:hover {
  text-decoration: none;
}
</style>
