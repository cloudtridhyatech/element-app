<template>
  <div class="pagination">
    <el-select
      v-model="pageSizeValue"
      placeholder="No. results per page"
      size="small"
      class="c74-page-select"
      @change="handleChangeResultsPerPage"
    >
      <el-option
        v-for="item in pageSizeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
      </el-option>
    </el-select>

    <el-button-group>
      <el-button
        @click="handlePreviousClick"
        type="info"
        size="small"
        icon="el-icon-arrow-left"
        :disabled="currentPage === 0"
        >Previous Page</el-button
      >

      <el-button
        @click="handleNextClick"
        size="small"
        type="info"
        :disabled="results.length < currentPageSize || noMoreResults"
        >Next Page<i class="el-icon-arrow-right"></i
      ></el-button>
    </el-button-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pageSizeOptions: [
        {
          value: "5",
          label: "5 / page"
        },
        {
          value: "10",
          label: "10 / page"
        }
      ],
      pageSizeValue: ""
    };
  },

  props: {
    results: {
      type: Array,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    },
    currentPageSize: {
      type: Number,
      required: true
    },
    pageSizes: {
      type: Array,
      required: false
    },
    noMoreResults: {
      type: Boolean,
      required: true
    }
  },

  created() {
    if (this.pageSizes) {
      // clear the defaults
      this.pageSizeOptions = [];

      for (const pageSize of this.pageSizes) {
        this.pageSizeOptions.push({
          value: pageSize,
          label: pageSize + " / page"
        });
      }
    }

    // load the select element with the current value
    this.pageSizeValue = this.currentPageSize;
  },

  methods: {
    handlePreviousClick() {
      this.$emit("handle-previous-click");
    },
    handleNextClick() {
      this.$emit("handle-next-click");
    },
    handleChangeResultsPerPage() {
      this.$emit("handle-change-results-per-page", this.pageSizeValue);
    }
  }
};
</script>

<style lang="scss" scoped>
.pagination {
  margin: 20px 0px;
  display: flex;
  justify-content: flex-end;

  .c74-page-select {
    margin-right: 10px;
  }
}
</style>
