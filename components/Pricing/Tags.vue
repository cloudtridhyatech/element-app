<template>
  <div>
    <div>
      <el-tag
        v-if="dynamicTags"
        :key="tag"
        v-for="tag in dynamicTags"
        closable
        :disable-transitions="false"
        @close="handleClose(tag)"
        >{{ tag }}</el-tag
      >
      <el-input
        class="input-new-tag"
        v-if="inputVisible"
        v-model="inputValue"
        ref="saveTagInput"
        size="mini"
        @keyup.enter.native="handleInputConfirm"
        @blur="handleInputConfirm"
      ></el-input>
      <el-button v-else class="button-new-tag" size="small" @click="showInput"
        >+ New Tag</el-button
      >
    </div>
  </div>
</template>

<script>
export default {
  props: {
    form: {
      required: true
    }
  },

  data() {
    return {
      inputVisible: false,
      inputValue: ""
    };
  },

  computed: {
    dynamicTags: function() {
      if (!this.form.tags) {
        console.log("this.form.tags = []");
        this.form.tags = [];
      }
      return this.form.tags;
    }
  },

  methods: {
    handleClose(tag) {
      // this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
      this.$emit("remove-tag", tag);
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        if (this.dynamicTags && this.dynamicTags.indexOf(inputValue) > -1) {
          this.$message({
            message: "This tag is already in the list of tags.",
            type: "error"
          });
        } else {
          this.dynamicTags.push(inputValue);
        }
      }
      this.inputVisible = false;
      this.inputValue = "";
    }
  }
};
</script>

<style lang="scss" scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
