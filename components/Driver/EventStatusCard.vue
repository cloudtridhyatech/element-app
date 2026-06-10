<template>
  <el-card class="box-card c74-extra-rounded" style="margin-top:24px;">
    <div class="c74-card-inner">


      <el-form label-position="top" label-width="100px" style="width: 100%">
        <el-form-item label="">
          <el-select
            v-model="form.eventStatus"
            placeholder="Set Status"
            style="width: 100%"
          >
            <el-option
              v-for="(value, name) in eventStatus"
              :key="name"
              :label="value"
              :value="value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="" v-if="form.eventStatus === 'picking-up-passengers' || form.eventStatus === 'dropping-off-passengers'">
          <el-select
            v-model="form.selectedUser"
            placeholder="Select User"
            style="width: 100%"
          >
            <el-option
              v-for="(value, i) in journies"
              :key="i"
              :label="formatUserName(value.transferObject)"
              :value="value.bookingId"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="">
          <el-date-picker
            v-model="form.eventStatusTime"
            type="datetime"
            placeholder="Change Time"
            style="width: 100%"
            format="HH:mm"
            value-format="timestamp"
            :editable=false
            :picker-options="{
              format: 'HH:mm'
            }"
          >
          </el-date-picker>
          </el-date-picker>
        </el-form-item>

        <el-button type="primary" @click="recordStatusUpdate"
          >Update Status</el-button
        >
        <el-button type="default" @click="$emit('cancel'), resetForm()">Cancel</el-button>
      </el-form>
    </div>
  </el-card>
</template>

<script>
import { convertFromMillisToFirestoreTimestampIfRequired } from "@/statics/utils/dateUtils.js";
import { EVENT_STATUS } from "@/statics/shared/functions.js";

import cloneDeep from "lodash.clonedeep";

export default {
  name: "event-status-card",

  props: {
    event: {
      type: Object,
      required: true
    },

    journies: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {

      activeName: "",

      eventStatus: null,

      form: {
        eventStatus: "",
        eventStatusTime:new Date().getTime(),
        selectedUser: "",
      }
    };
  },

  created() {
    this.eventStatus = EVENT_STATUS;
    console.log('eventStatus', this.eventStatus);
/*     EVENT_STATUS.forEach((value, name) => {
      console.log(value, name);
    }) */
  },

  methods: {
    async recordStatusUpdate() {
      // [vuex] do not mutate vuex store state outside mutation handlers.
      const editedEvent = cloneDeep(this.event);

      // initialise the eventStatuses array if it's not already present
      if (!editedEvent.eventStatuses) {
        editedEvent.eventStatuses = [];
      }

      let status = {
        status: this.form.eventStatus,
        startDateTime: convertFromMillisToFirestoreTimestampIfRequired(this.form.eventStatusTime)
      }

      if (this.form.eventStatus === 'picking-up-passengers' || this.form.eventStatus === 'dropping-off-passengers') {
        status["journey"] = this.journies.find(j => j.bookingId === this.form.selectedUser)
      }

      if (editedEvent.eventStatuses.length === 0) {
        // there is no previous status entry so we cannot close off the endDateTime
      } else {

        // update the previous status entry
        const lastStatusRecorded = editedEvent.eventStatuses[editedEvent.eventStatuses.length - 1];
        lastStatusRecorded.endDateTime = convertFromMillisToFirestoreTimestampIfRequired(this.form.eventStatusTime);

      }

      editedEvent.complete = 75;
      editedEvent.eventStatuses.push(status);

      console.log('editedEvent', editedEvent);
      console.log('this.event', this.event);

      this.$store.dispatch("events/editEvent", editedEvent).then(() => {
        this.$message({
          message: 'Thank you, status update recorded.',
          type: 'success'
        });
        this.$emit('close');
        this.resetForm();
      });

    },

    formatUserName(value) {
      let userFullName = ""
      if (value) {
        userFullName = value.ref.firstName + " " + value.ref.lastName
      }
      return userFullName
    },

    resetForm () {
      this.form.eventStatus = "";
      this.form.eventStatusTime = new Date().getTime();
      this.form.selectedUser = "";
    }
  }
};
</script>

<style lang="scss" scoped></style>
