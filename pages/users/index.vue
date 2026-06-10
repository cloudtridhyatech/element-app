<template>
  <div>
    <UserForm
      :userId="userId"
      :existingUser="existingUser"
      v-bind:shouldOpenDialog="shouldOpenDialog"
      v-on:close-form="onCloseForm"
      v-on:refresh-user-list="onRefreshUserList"
      v-on:open-form="onOpenForm"
    />
    <UserList
      v-on:load-existing-user="onLoadExistingUser"
      v-on:open-form="onOpenForm"
      ref="userList"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { fireDb } from "@/plugins/firebase.js";
import {
  getDocumentReferenceUser
} from "@/statics/user/functions.js";

import UserList from "@/components/User/UserList";
import UserForm from "@/components/User/UserForm";

export default {
  components: {
    UserList,
    UserForm
  },

  data() {
    return {
      userId: "",
      existingUser: null,
      shouldOpenDialog: false
    };
  },

  computed: {
    ...mapGetters("companies", {
      companyId: "getCompanyId"
    })
  },

  methods: {
    async onLoadExistingUser(id) {
      this.userId = "";

      const ref = getDocumentReferenceUser(this.companyId, id);

      try {
        const snapshot = await ref.get();

        this.userId = id;
        this.existingUser = snapshot.data();
      } catch (e) {
        console.error(e);
      }
    },
    onCloseForm() {
      this.existingUser = null;
      this.shouldOpenDialog = false;
    },
    onRefreshUserList() {
      this.$refs.userList.executeUserSearch();
    },
    onOpenForm() {
      // console.log("parent.onOpenForm");
      this.shouldOpenDialog = true;
    }
  }
};
</script>

<style lang="scss" scoped></style>
