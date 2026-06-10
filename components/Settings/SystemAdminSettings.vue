<template>
  <div>
    <section>
      <el-card>
        <div slot="header">
          <div>System Admin Settings</div>
        </div>
        <section>
          <div>
            <section>
              <el-card>
                <el-popconfirm title="This will delete Booking and Journey data in Algolia.  Are you sure?"
                confirmButtonText="YES"
                cancelButtonText="No"
                icon="el-icon-info"
                iconColor="red"
                @confirm="syncFirestoreAlgolia()">
                    <el-button slot="reference" v-if="isLocalhost()"
                    type="danger"
                    icon="el-icon-circle-plus"
                    >Sync Firestore/Algolia</el-button
                    >
                </el-popconfirm>                  
              </el-card>
            </section>
          </div>
        </section>
      </el-card>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb, firebaseFunctions } from "@/plugins/firebase.js";


export default {
  created() {
  },
  props: {
  },
  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    }),
    ...mapGetters("companies", {
      companyKey: "getCompanyKey"
    }),
  },
  watch: {

  },
  data() {
    return {

    };
  },
  methods: {
    isLocalhost() {
      return location.hostname === "localhost";
    },      
    syncFirestoreAlgolia() {
      console.log('syncFirestoreAlgolia:', this.companyKey, this.companyId);

      const executeSyncFirestoreAlgolia = firebaseFunctions.httpsCallable("settings-syncFirestoreAlgolia");

      executeSyncFirestoreAlgolia({
        companyKey : this.companyKey,
        companyId : this.companyId        
      })
      .then(result => {
        this.$message({
          message: "Sync Running.",
          type: "info",
          duration: 5000
        });          
      })
      .catch(error => {
        console.error(
          "syncFirestoreAlgolia exception. ",
          error
        );
        this.$message({
          message: "Sync Error:" + error,
          type: "error",
          duration: 5000
        });        
      });
    }

  }
};
</script>
