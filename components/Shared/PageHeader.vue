<template>
  <div class="flex flex-col justify-between md:flex-row md:items-center mt-3">
    <div class="flex flex-col space-y-3">
      <div class="flex flex-row items-center">
        <nuxt-link to="/">Home</nuxt-link>
        <svg
          class="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <nuxt-link to="/">{{ breadCrumb.routeName }}</nuxt-link>
      </div>
      <div class="text-3xl font-extrabold">{{ breadCrumb.title }}</div>
    </div>
    <div class="mt-6 md:mt-0">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "PageHeader",

  props: {
    breadCrumb: {
      type: Object,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped></style>
