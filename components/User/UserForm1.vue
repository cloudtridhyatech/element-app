<template>
  <div>
    <el-row :gutter="64">
      <el-col :span="12" v-if="!isEditing">
        <el-form-item label="Email" prop="email">
          <el-input placeholder="Enter email address" v-model="userForm.email"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input placeholder="Enter password" v-model="userForm.password"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="First Name" prop="firstName">
          <el-input placeholder="Enter first name" v-model="userForm.firstName"></el-input>
        </el-form-item>
        <el-form-item label="Last Name" prop="lastName">
          <el-input placeholder="Enter last name" v-model="userForm.lastName"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="64">
      <el-col :span="24">
        <p>Marking the user as inactive will not affect existing bookings but will prevent clients finding the accommodation when making a new booking.</p>

        <el-switch v-model="userForm.active" active-text="Active"></el-switch>
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
    isEditing: {
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped></style>
