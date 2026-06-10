<template>
    <div class="max-w-7xl mx-auto py-4 px-4 md:py-8 lg:px-8 border border-1 rounded" >
      <div v-if="isError">      
        Sorry, a serious error occured during the booking process. {{bookingReferenceText}}
      </div> 
      <div v-else>      
          <p>{{isPaymentSuccess ? "Payment successfully charged to your card. ":""}}
              {{isPaymentCancel ? "Payment cancelled. No charge was made to your card. " : ""}}
              Thank you for your booking{{ isEnquiryBooking ? " enquiry" : ""}}.
              {{ bookingReferenceText }}</p>
      </div>  
      <div v-if="showContactDetails">
        If you with to contact us regarding a booking, we can be contacted by:
        <p v-if="isPhoneContactAvailable">Phone: {{settings.contactPhoneNumber}}</p>
        <p v-if="isEmailContactAvailable">Email: {{settings.contactEmail}}</p>
      </div>
    </div>
</template>
<script>
import Vue from 'vue'

export default {

  props: {
    isEnquiryBooking: {
      type: Boolean,
      default: () => { return false; }
    },
    isConfirmed: {
      type: Boolean,
      default: () => { return false; }
    },    
    bookingRef: {
      type: String,
      default: () => { return "false"; }
    },
    settings: {
      type: Object,
      required: true
    },
    isPaymentSuccess: {
      type: Boolean,
      default: () => { return false; }
    },    
    isPaymentCancel: {
      type: Boolean,
      default: () => { return false; }
    },
    isError: {
      type: Boolean,
      default: () => { return false; }
    },      
  },
  computed: {
    showContactDetails: function() {
      if(!this.settings.contactPhoneNumber && !this.settings.contactEmail) {
        return false;
      }
      return true;
    },
    isPhoneContactAvailable: function() {
      if(this.settings.contactPhoneNumber && this.settings.contactPhoneNumber !== null && this.settings.contactPhoneNumber !== '') {
        return true;
      }
      return false;
    },
    isEmailContactAvailable: function() {
      if(this.settings.contactEmail && this.settings.contactEmail !== null && this.settings.contactEmail !== '') {
        return true;
      }
      return false;        
    },
    bookingReferenceText: function() {

      if(this.bookingRef && this.bookingRef !== null && this.bookingRef !== "") {

        let status = this.isConfirmed? "confirmed" :"unconfirmed";

        return "Your " + status + " booking reference is: " + this.bookingRef;
      } 
      return "";
    },
  }
}

</script>