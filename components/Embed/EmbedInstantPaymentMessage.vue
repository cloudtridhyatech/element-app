<template>
  <div class="mt-4">
    <div
      v-show="
        quote.private.pricingRule.instantPaymentAllowed &&
          quote.selected == 'private'
      "
    >
      Instant booking and payment available.
    </div>
    <div
      v-show="
        !quote.private.pricingRule.instantPaymentAllowed &&
          quote.selected == 'private'
      "
    >
      Confirmation of availability by email within 24 hours
    </div>
    <div
      v-show="
        quote.shared.pricingRule.instantPaymentAllowed &&
          quote.selected == 'shared'
      "
    >
      Instant booking and payment available.
    </div>
    <div
      v-show="
        !quote.shared.pricingRule.instantPaymentAllowed &&
          quote.selected == 'shared'
      "
    >
      Confirmation of availability by email within 24 hours
    </div>
  </div>
</template>

<script>
export default {
  props: {
    quote: Object,
    required: true
  }
};
</script>

<style lang="scss" scoped></style>
