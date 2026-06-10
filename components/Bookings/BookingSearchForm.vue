<template>
  <el-card class="c74-horizontal-form">
    <div slot="header" class>Filter the bookings</div>
      <el-form ref="form" :model="form">
        <div>               
          <el-input
              placeholder="Booking Ref"
              v-model="form.searchBookingRef"
          >
          </el-input>
          <el-input
              placeholder="Last Name"
              v-model="form.searchLastName"
          >
          </el-input>
          <el-input
              placeholder="First Name"
              v-model="form.searchFirstName"
          >
          </el-input>
          <el-input
              placeholder="Mobile"
              v-model="form.searchMobile"
          >
          </el-input>             
          <el-input
              placeholder="Email"
              v-model="form.searchEmail"
          >
          </el-input> 
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="handleSearch"              
          ></el-button>                                    
        </div>
      </el-form>    
  </el-card>
</template>    

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      form : {
        searchBookingRef: "",
        searchFirstName: "",
        searchLastName: "",
        searchMobile: "",
        searchEmail: ""
      }
    };
  },
  methods : {
    async handleSearch() {
      if (!this.form.searchBookingRef && !this.form.searchFirstName && !this.form.searchLastName && !this.form.searchMobile && !this.form.searchEmail) {
        //At leats one field should be populated
        return;
      }
      this.$emit("booking-search", this.form);      
    }
  },
  computed: {
    ...mapGetters("bookings", {
      lastBookingListCreatedRefeshTime: "getLastBookingListCreatedRefeshTime",
    })
  },
  watch : {
    lastBookingListCreatedRefeshTime : function(value, oldValue) {
      if(value > oldValue){
        this.form.searchFirstName = "";
        this.form.searchFirstName = "";
        this.form.searchLastName = "";
        this.form.searchMobile = "";
        this.form.searchEmail = "";
      }
    },
  },  
}
</script>
<style lang="scss" scoped>

.c74-horizontal-form {
  .el-input {
    width: 200px;
  }
}
</style>