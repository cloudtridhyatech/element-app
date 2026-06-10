<template>
  <div>
    <el-row :gutter="64">
      <el-col :span="12">
        <el-form-item label="Permissions" prop="roles">
          <el-checkbox-group v-model="rolesSelected" @change="handleChangeCheckboxGroup">
            <el-checkbox
              v-for="role in this.roleOptions"
              :label="role.key"
              :key="role.label"
            >{{role.key}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="What do the permissions allow?">
          <div v-for="role in roleOptions" :key="role.key">
            <div v-if="isRoleSelected(role)">
              <div class="c74-role-title">{{role.label}}</div>
              <div class="c74-role-description">{{role.description}}</div>
            </div>
          </div>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: {
    userForm: {
      required: true,
    },
  },
  watch: {
    userForm: function (value, oldValue) {
      if (value.roles) {
        this.rolesSelected = value.roles;
      } else {
        this.rolesSelected = [];
      }
    },
  },
  computed: {
    ...mapGetters("users", {
      userRoleOptions: "getUserRoleOptions"
    })
  },  
  data() {
    return {
      roleOptions: [],
      rolesSelected: [],
    };
  },
  mounted() {
    this.roleOptions = this.userRoleOptions;
  },
  methods: {
    // having to jump through hoops because of a bug in element component https://element.eleme.io/#/en-US/component/checkbox
    // it cannot be supplied an array in the form userForm.roles, it must be a top level data element instead so using this as a workaround
    handleChangeCheckboxGroup() {
      this.$emit("update-roles", this.rolesSelected);
    },

    isRoleSelected(role) {
      return this.rolesSelected.find(
        (selectedRole) => selectedRole === role.key
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.el-checkbox-group {
  display: flex;
  flex-direction: column;
}

.c74-role-title {
  font-weight: 700;
}

.c74-role-title,
.c74-role-description {
  line-height: 1.75rem;
}
</style>
