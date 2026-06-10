<template>
  <div class="mb-3 notes-list">
    <el-alert
      v-for="(note, index) in allNotes"
      :key="index"
      :type="note.type"
      :description="note.body"
      show-icon
      class="mb-2"
      @close="handleNoteClose(note)"
    >
      <span slot="title">
        <el-popover
          placement="top-start"
          trigger="hover">
          <p>Double click on note title to edit</p>
          <a
            href="javascript:void(0);"
            slot="reference"
            @dblclick="$emit('edit-note', note)"
          >
            {{note.title}}
          </a>
        </el-popover>
      </span>
    </el-alert>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "NotesList",
  props: {
    allNotes: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    handleNoteClose(note) {
      this.$store
        .dispatch("scheduler/markNoteAsSeen", {
          noteId: note.id,
          loggedInUserId: this.loggedInUserId,
        })
        .then(() => {
          this.$notify.success({
            title: "Success",
            message: "Note marked as seen",
            offset: 100,
          });
        })
        .catch((error) => {
          this.$notify.error({
            title: "Failed",
            message: "Saving failed",
            offset: 100,
          });
        })
        .finally(() => {});
    },
  },
  computed: {
    ...mapGetters("users", {
      loggedInUserId: "getLoggedInUserId",
    }),
  },
};
</script>

<style lang="scss" scoped>
.el-alert {
  margin-bottom: 10px;
}
.notes-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 0px 5px;
}
</style>