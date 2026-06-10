<template>
  <div class="c74-current-date">{{ date }}</div>
</template>

<script>
export default {
  name: "current-date",

  props: {
    date: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
.c74-current-date {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
  color: #909399;
}
</style>
