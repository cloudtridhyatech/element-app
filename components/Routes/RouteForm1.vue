<template>
  <div>
    <el-form ref="routeForm1" :model="routeForm" :rules="rules">    
    <el-row :gutter="64">
      <el-col :span="12">
        <el-form-item label="From" prop="fromCode">
          <el-input v-model="routeForm.fromCode" disabled></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="To" prop="toCode">
          <el-input v-model="routeForm.toCode" disabled></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="64">
      <el-col :span="12">
        <el-form-item label="Distance" prop="distance">
          <el-input-number
            placeholder="Enter distance"
            :min="1"
            v-model="routeForm.distance"
          ></el-input-number>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Time" prop="time">
          <el-input-number
            placeholder="Enter time"
            :min="1"
            v-model="routeForm.time"
          ></el-input-number>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="64">
      <el-col :span="12">
        <p class="text-sm">
          Active
        </p>
        <el-switch v-model="routeForm.active" active-text="Active"></el-switch>
        <p class="mt-4 text-sm">
          Marking the route as active will allow clients to select this route.
        </p>
      </el-col>
      <el-col :span="12">
        <p class="text-sm">
          Bookable
        </p>
        <el-switch
          v-model="routeForm.bookable"
          active-text="Bookable"
        ></el-switch>
        <p class="mt-4 text-sm">
          Marking the route as bookable will allow clients to book this route.
          Disabling it will let clients know that they're unable to book this
          route.
        </p>
      </el-col>
    </el-row>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    routeForm: {
      required: true
    }
  },
  data() {
    return {
      formValid :false,
      rules: {
        distance: [
          {
            required: true,
            message: "Distance is required",
            trigger: "change"
          }
        ],
        time: [
          {
            required: true,
            message: "Time is required",
            trigger: "change"
          }
        ],          
      }
    }
  },
  methods:{
    isValidForm() {
      this.$refs["routeForm1"].validate(valid => {
        if (valid) {
          this.formValid = true;
        } else {
          this.formValid = false;
        }
      });
      return this.formValid;
    }
  }   
};
</script>
