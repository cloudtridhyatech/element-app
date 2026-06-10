<template>
  <div class="grid grid-cols-12 gap-x-4 lg:gap-x-12">
    <div class="col-span-12 sm:col-span-6 md:col-span-3">
      You are making a payment of &euro;{{price}} to {{this.companyName}}.
      Your card issuer may charge a fee for this transaction.
      Your reference: {{this.booking.bookingRef}}
    </div>
    <div class="col-span-12 sm:col-span-6 md:col-span-3">
      <div>
        Please enter your card details:
      </div>
      <!-- TODO
      https://support.stripe.com/questions/where-to-find-logos-for-accepted-credit-card-types
      -->
      <div>
        <el-form id="payment-form" class="c74-card-form" :loading="loading">
          <div id="card-element" class="c74-card-element">
          </div>
          <p id="card-error" role="alert" class="c74-card-error"></p>
        </el-form>
      </div>
      <div class="">
        <el-button type="info" @click="handleCancel" id="cancelButton">
        Cancel
        </el-button>
        <el-button type="success" @click="submitPayment" id="payButton" :disabled="true">
        Pay
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { firebaseFunctions } from "@/plugins/firebase.js";
import { mapGetters } from "vuex";
import Vue from "vue";

const disabledStyle = "is-disabled";
const payButtonName = "payButton";
const cancelButtonName = "cancelButton";

export default {
  head: {
    script: [
      {
        src: "https://js.stripe.com/v3/"
      }
    ]
  },
  props: {
    companyId: {
      type: String,
      required: true
    },
    settings: {
      type: Object,
      required: true
    },
    price: {
        type: Number,
        required: true
    },
    companyName : {
      type: String,
      required: true
    },
    booking: {
      type: Object,
      required: true
    }
  },
  computed:{
  },
  data() {
    return {
      loading:true,
      formValid: false,
      stripe:null,
      card:null,
      intentResponse:null,
      isClickPayEnabled: false
    };
  },
  async created() {
  },
  async mounted() {
    //DOM avaiable, so init credit card placeholders
    await this.initForm();
  },
  methods :{
    async initForm() {

        try {
          const createPaymentIntent = firebaseFunctions.httpsCallable("paymentsStripe-createPaymentIntent");
          let request = {
            companyId : this.companyId,
            paymentDetails:{
                amount: this.price
            },
            booking: {
              email: this.booking.email,
              firstName: this.booking.firstName,
              lastName: this.booking.lastName,
              bookingRef: this.booking.bookingRef,
              bookingId: this.booking.bookingId
            }
          };
          let result = await createPaymentIntent(request);
          this.intentResponse = result.data;

          // A reference to Stripe.js initialized with your real test publishable API key.
          //https://stripe.com/docs/payments/integration-builder
          this.stripe = Stripe(this.settings.paymentSystem.stripe.pk);
          var style = {
                base: {
                  color: "#32325d",
                  fontFamily: 'Arial, sans-serif',
                  fontSmoothing: "antialiased",
                  fontSize: "16px",
                  "::placeholder": {
                    color: "#32325d"
                  }
                },
                invalid: {
                  fontFamily: 'Arial, sans-serif',
                  color: "#fa755a",
                  iconColor: "#fa755a"
                }
              };
          let elements = this.stripe.elements();
          this.card = elements.create("card", { style: style });
          // Stripe injects an iframe into the DOM
          this.card.mount("#card-element");

          this.card.on("change", function (event) {
            // Disable the Pay button if there are no card details in the Element
            var payButton = document.getElementById(payButtonName);

            if(event.complete === true) {
              payButton.disabled = false;
              payButton.classList.remove(disabledStyle);
            }
            else if(event.complete === false){
              payButton.disabled = true;
              payButton.classList.add(disabledStyle);
            }

            var cardError = document.getElementById("card-error");
            if(event.error) {
              cardError.textContent = event.error.message;
            }
            else {
              cardError.textContent = "";
            }
          });

          this.loading = false;
        } catch (error) {
          console.error('initForm error', error);
        }
    },
    submitPayment() {
      try {
        this.loading = true;

        this.disableButton(payButtonName);
        this.disableButton(cancelButtonName);

        this.stripe
          .confirmCardPayment(this.intentResponse.client_secret, {
            payment_method: {
              card: this.card
            }
          })
          .then((result) => {
            if (result.error) {
              console.error("Stripe payment failed", result.error.message);
              var cardError = document.getElementById("card-error");
              cardError.textContent = result.error.message;
              this.enableButton(payButtonName);
              this.enableButton(cancelButtonName);
            } else {
              this.$emit('payment-complete', {status: result.paymentIntent.status });
            }
            return null;
          }).catch((err) => {
            console.error("submitPayment promise error", err);
            this.enableButton(payButtonName);
            this.enableButton(cancelButtonName);
          })
          .finally(() => {
          });
      }
      catch(error) {
        console.error("submitPayment error", error);
      }finally{
        this.loading = false;
      }
    },
    handleCancel() {
        this.disableButton(payButtonName);
        this.disableButton(cancelButtonName);
        this.$emit('payment-cancel');
    },
    disableButton(name) {
        var button = document.getElementById(name);
        button.disabled = true;
        button.classList.add(disabledStyle);
    },
    enableButton(name) {
        var button = document.getElementById(name);
        button.disabled = false;
        button.classList.remove(disabledStyle);
    },
  }
}
</script>

<style lang="scss" scoped>
.c74-card-form {
  width: 30vw;
  min-width: 500px;
  align-self: center;
  box-shadow: 0px 0px 0px 0.5px rgba(50, 50, 93, 0.1),
    0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07);
  border-radius: 7px;
  padding: 40px;
}
.c74-card-element {
  border-radius: 4px 4px 0 0 ;
  padding: 12px;
  border: 1px solid rgba(50, 50, 93, 0.1);
  height: 44px;
  width: 100%;
  background: white;
}
.c74-card-error {
  color: rgb(105, 115, 134);
  text-align: left;
  font-size: 13px;
  line-height: 17px;
  margin-top: 12px;
}
</style>