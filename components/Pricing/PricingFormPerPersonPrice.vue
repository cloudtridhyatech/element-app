<template>
    <el-form ref="pricingFormPerPersonPrice" :model="form" :rules="rules">
        <el-form-item prop="cumulativePrice"
        :label="counter + 1 + ' Passenger(s)'"
        class="horizontal-items"
        >
        <el-input-number
            v-model="form.cumulativePrice"
            :min="0"
            :step="10"
        ></el-input-number>
        <el-button
            @click="deleteCumulativePrice(counter)"
            type="danger"
            icon="el-icon-delete"
        ></el-button>
        </el-form-item>

    </el-form>
</template>
<script>

export default {
  props: {
    form: {
      required: true
    },
    counter: {
        Type: Number,
      required: true
    }    
  },
  data() {
    return {
      formValid :false,
      rules: {
        cumulativePrice: [
          {
            required: true,
            message: "Price is required",
            trigger: "change"
          }          
        ]
      }
    }
  },
  methods:{
    isValidForm() {
      this.$refs["pricingFormPerPersonPrice"].validate(valid => {
        if (valid) {
          this.formValid = true;
        } else {
          this.formValid = false;
        }
      });
      return this.formValid;
    },      
    deleteCumulativePrice(counter) {
      this.$emit("delete-cumulative-price", counter);      
    }
  }
}
</script>

<style scoped></style>