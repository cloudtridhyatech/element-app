<template>
  <section class="empty-state">
    <p>{{ message }}</p>

    <img
      v-if="image === 'nothing-found'"
      src="~/assets/images/empty-states/nothing-found.png"
    />
    <img
      v-if="image === 'map-flying'"
      src="~/assets/images/empty-states/map-flying.png"
    />

    <p class="empty-state-inst">{{ instruction }}</p>
  </section>
</template>

<script>
export default {
  name: "ResponsiveEmptyState",

  props: {
    message: {
      type: String,
      required: false
    },

    instruction: {
      type: String,
      required: false
    },

    image: {
      type: String,
      required: false
    }
  }
};
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  img {
    max-width: 80%;
  }

  p {
    color: $color-primary-text;
    text-align: center;
    font-weight: 600;
    max-width: 70%;
  }

  .empty-state-inst {
    margin-bottom: 48px;
  }
}
</style>
