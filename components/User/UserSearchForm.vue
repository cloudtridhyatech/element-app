<template>
  <el-card class="mt-6">
    <div slot="header" class>Filter the users</div>
    <el-input placeholder="First name" v-model="debounceFname"></el-input>
    <el-input placeholder="Last name" v-model="debounceLname"></el-input>
    <el-select
      v-model="userTypeValue"
      placeholder="Type"
      clearable
      @change="handleUserTypeChanged"
    >
      <el-option
        v-for="item in userTypeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      ></el-option>
    </el-select>
    <el-select
      v-model="active"
      placeholder="Active/non-active"
      clearable
      @change="handleUserActiveChanged"
    >
      <el-option
        v-for="item in activeNonActiveOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      ></el-option>
    </el-select>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      firstName: "",
      lastName: "",
      userTypeValue: "",
      active: "",
      userTypeOptions: process.env.userTypeOptions,
      activeNonActiveOptions: [
        {
          value: "true",
          label: "Active",
        },
        {
          value: "false",
          label: "Non-active",
        },
      ],
      timeoutfname: null,
      timeoutlname: null,
    };
  },

  methods: {
    handleUserFirstNameChanged() {
      this.$emit("firstname-changed", this.firstName);
    },

    handleUserLastNameChanged() {
      this.$emit("lastname-changed", this.lastName);
    },

    handleUserTypeChanged() {
      this.$emit("user-type-changed", this.userTypeValue);
    },

    handleUserActiveChanged() {
      this.$emit("active-changed", this.active);
    },

    // being called from parent component <UserList>
    resetForm() {
      (this.firstName = ""),
        (this.lastName = ""),
        (this.userTypeValue = ""),
        (this.active = "");
    },
  },
  computed: {
    debounceFname: {
      get() {
        return this.firstName;
      },
      set(val) {
        this.firstName = val; //value is set already change function will be called after 700
        if (this.timeoutfname) clearTimeout(this.timeoutfname);
        this.timeoutfname = setTimeout(() => {
          this.handleUserFirstNameChanged();
        }, 700);
      },
    },

    debounceLname: {
      get() {
        return this.lastName;
      },
      set(val) {
        this.lastName = val; //value is set already change function will be called after 700
        if (this.timeoutlname) clearTimeout(this.timeoutlname);
        this.timeoutlname = setTimeout(() => {
          this.handleUserLastNameChanged();
        }, 700);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.el-select,
.el-input {
  width: 225px;
}
</style>
