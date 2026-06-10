<template>
  <div>
    <el-row :gutter="64">
      <el-col :span="24">
        <Tags :form="form" v-on:remove-tag="handleRemoveTag" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import Tags from "@/components/Pricing/Tags";

export default {
  components: {
    Tags,
  },
  props: {
    form: {
      required: true,
    },
  },

  methods: {
    handleRemoveTag(tag) {
      this.form.tags.splice(this.form.tags.indexOf(tag), 1);
    },
  },
};
</script>

<style scoped></style>
