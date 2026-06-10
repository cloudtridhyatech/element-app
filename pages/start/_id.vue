<template>
  <embed-booking-form
    v-if="company"
    :companyId="companyId"
  ></embed-booking-form>
</template>

<script>
import { fireDb } from "@/plugins/firebase.js";
import EmbedBookingForm from "~/components/Embed/EmbedBookingForm.vue";

export default {
  components: { EmbedBookingForm },
  layout: "embed",

  data() {
    return {
      companyId: String,
      company: null
    };
  },

  created() {
    this.getCompanyById();
  },

  methods: {
    async getCompanyById() {
      this.companyId = this.$route.params.id;

      const ref = fireDb.collection("companies").doc(this.companyId);

      try {
        const snapshot = await ref.get();

        const company = snapshot.data();

        if (company) {
          this.$store.dispatch("companies/setCompanyId", snapshot.id, {
            root: true
          });

          this.$store.dispatch("companies/setCompany", company, {
            root: true
          });
        }

        this.company = company;
      } catch (e) {
        console.error(e);
      }
    }
  }
};
</script>

<style scoped></style>
