<template>
  <div
    class="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
  >
    <dt>
      <div class="absolute rounded-md p-3" :class="bgClass">
        <slot name="icon"></slot>
      </div>
      <p class="ml-16 text-sm font-medium text-gray-700 truncate">
        {{ title }}
      </p>
    </dt>
    <dd class="ml-16 pb-6 flex items-baseline sm:pb-7">
      <p class="text-2xl font-semibold text-gray-900">
        {{ amount }}
      </p>
      <p class="ml-4 flex items-baseline text-sm text-gray-500">
        <slot name="secondaryStat"></slot>
      </p>
      <div class="absolute bottom-0 inset-x-0 bg-gray-100 px-4 py-4 sm:px-6">
        <div class="text-sm">
          <slot name="link"></slot>
        </div>
      </div>
    </dd>
  </div>
</template>

<script>
export default {
  props: {
    bgClass: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    amount: {
      type: [String, Number],
      default: 0
    }
  }
};
</script>

<style lang="scss" scoped></style>
