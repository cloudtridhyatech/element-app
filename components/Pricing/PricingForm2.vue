<template>
  <div>
    <el-form ref="pricingForm2" :model="form" :rules="rules">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Select pricing by group or by passenger">
              <el-radio-group v-model="form.pricingByGroupOrPerson">
                <el-radio-button label="Per Group"></el-radio-button>
                <el-radio-button label="Per Person"></el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="form.pricingByGroupOrPerson === 'Per Group'">
          <el-col :span="12">
            <el-form-item label="Price" prop="price">
              <el-input-number
                v-model="form.price"
                :min="0"
                :step="10"
              ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="For up to how many passengers?" prop="numPassengers">
              <el-input-number
                v-model="form.numPassengers"
                :min="1"
                :max="16"
              ></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row
          :gutter="20"
          v-if="form.pricingByGroupOrPerson === 'Per Person'"
        >
          <el-col :span="12">
            <div
              v-for="(applicant, counter) in form.pricesArray"
              v-bind:key="counter"
            >
              <PricingFormPerPersonPrice
              ref="pricingFormPerPersonPriceRefs"
              :counter="counter"
              :form="form.pricesArray[counter]"
              v-on:delete-cumulative-price="deleteCumulativePrice"
              />
            </div>
            <el-button
              @click="addCumulativePrice"
              icon="el-icon-circle-plus-outline"
              type="primary"
              plain
              style="margin-bottom: 24px"
              >Add price for additional passenger</el-button
            >
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    </el-form>
  </div>
</template>

<script>
import PricingFormPerPersonPrice from "@/components/Pricing/PricingFormPerPersonPrice";
export default {
  components: {
    PricingFormPerPersonPrice
  },  
  props: {
    form: {
      required: true
    }
  },
  data() {
    return {
      formValid :false,
      rules: {
        price: [
          {
            required: true,
            message: "Price is required",
            trigger: "change"
          }
        ],
        numPassengers: [
          {
            required: true,
            message: "Number of passengers is required",
            trigger: "change"
          }          
        ],
        perPersonPrice:[
          {
            required: true,
            message: "Price is required",
            trigger: "change"
          }          
        ]
      }
    }
  },  
  methods: {
    isValidForm() {

      let allValid = true;

      if(this.$refs.pricingFormPerPersonPriceRefs) {
        const allRefs = this.$refs.pricingFormPerPersonPriceRefs;
        
        if(allRefs) {
        allRefs.forEach(item => {
          if (!item.isValidForm()) {
            allValid = false;
          }
        });
        }
      }

      this.$refs["pricingForm2"].validate(valid => {
        if (valid && allValid) {
          this.formValid = true;
        } else {
          this.formValid = false;
        }
      });
      return this.formValid;
    },    
    addCumulativePrice() {
      this.form.pricesArray.push({});
    },
    deleteCumulativePrice(counter) {
      this.form.pricesArray.splice(counter, 1);
    }
  }
};
</script>

<style scoped></style>
