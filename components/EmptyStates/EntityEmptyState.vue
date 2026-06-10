<template>
  <section class="empty-state">
    <h2>{{ message }}</h2>

    <img v-if="image === 'nothing-found'" src="~/assets/images/empty-states/nothing-found.png" />
    <img v-if="image === 'map-flying'" src="~/assets/images/empty-states/map-flying.png" />

    <p class="empty-state-inst">{{ instruction }}</p>
    <div class="create-button">
      <el-button
        v-if="buttonText"
        type="primary"
        @click.prevent="createNewEntity"
        icon="el-icon-circle-plus"
      >{{ buttonText }}</el-button>
    </div>
  </section>
</template>

<script>
export default {
  name: "EntityEmptyState",

  props: {
    message: {
      type: String,
      required: false,
    },

    instruction: {
      type: String,
      required: false,
    },

    buttonText: {
      type: String,
      required: false,
    },

    image: {
      type: String,
      required: false,
    },
  },

  methods: {
    createNewEntity() {
      this.$emit("create-new-entity");
    },
  },
};
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 50px;

  img {
    max-height: 500px;
  }

  h2 {
    color: #1f2f3d;
  }

  .empty-state-inst {
    margin-bottom: 48px;
  }
}
</style>
