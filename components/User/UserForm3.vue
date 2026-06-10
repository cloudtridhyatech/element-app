<template>
  <div>
    <el-row :gutter="64">
      <el-col :span="12">
        <el-form-item label="User Type" prop="type">
          <el-select v-model="userForm.userType" placeholder="Select">
            <el-option
              v-for="item in userTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="What does the user type mean?">
          <div v-if="userForm.userType">
            <div class="c74-type-title">{{ selectedType.label }}</div>
            <div class="c74-role-description">
              <p>{{selectedType.description}}</p>
            </div>
          </div>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props: {
    userForm: {
      required: true,
    },
  },
  computed: {
    selectedType: function () {
      if (this.userForm.userType) {
        return this.userTypeOptions.find(
          (userType) => userType.value === this.userForm.userType
        );
      }
    },
  },
  data() {
    return {
      userTypeOptions: process.env.userTypeOptions,
    };
  },
};
</script>

<style lang="scss" scoped>
.c74-type-title {
  font-weight: 700;
}

.c74-type-title,
.c74-type-description {
  line-height: 1.75rem;
}
</style>
