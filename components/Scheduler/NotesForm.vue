<template>
  <div>
    <section>
      <el-dialog
        :visible.sync="editFormVisible"
        width="1140px"
        top="6vh"
        v-on:closed="handleDialogClosed"
      >
        <span slot="title" class="dialog-header">
          <el-button
            type="primary"
            :disabled="false"
            @click.prevent="saveOrUpdate('notesForm')"
            :loading="loading"
            icon="el-icon-download"
            size="mini"
            >{{ isEditing ? "Update" : "Save" }}</el-button
          >
        </span>
        <h2 class="create-text">
          {{ isEditing ? "Edit Existing Note" : `Create New Note for ${date}` }}
        </h2>
        <el-form
          ref="notesForm"
          :label-position="labelPosition"
          :model="notesForm"
          :rules="rules"
          label-width="180px"
          size="medium"
        >
          <el-row :gutter="90">
            <el-col :span="12">
              <el-form-item label="Note Title" prop="title">
                <el-input placeholder="" v-model="notesForm.title"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <p class="preview-text">Preview</p>
              <el-alert
                :title="notesForm.title"
                :type="notesForm.type"
                :closable="false"
                :show-icon="true"
              >
                {{ notesForm.body }}
              </el-alert>
            </el-col>
          </el-row>
          <el-row :gutter="90">
            <el-col :span="12">
              <el-form-item label="Note Body" prop="body">
                <el-input placeholder="" v-model="notesForm.body"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="90">
            <el-col :span="12">
              <el-form-item label="Importance" prop="type">
                <el-select
                  v-model="notesForm.type"
                  placeholder="Select importance"
                >
                  <el-option
                    v-for="item in importanceOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button
            :type="buttonType"
            @click="saveOrUpdate('notesForm')"
            :loading="loading"
            icon="el-icon-download"
            >{{ isEditing ? "Update" : "Save" }}</el-button
          >
          <el-button @click="handleCancel()" icon="el-icon-close"
            >Cancel</el-button
          >
        </span>
      </el-dialog>
    </section>
  </div>
</template>

<script>
import { fireDb } from "@/plugins/firebase.js";
import moment from "moment";
export default {
  props: {
    existingNote: Object,
    noteDate: String
  },
  data() {
    return {
      buttonType: "primary",
      editFormVisible: false,
      isCreating: false,
      isEditing: false,
      loading: false,
      // position of labels in the display of form, valid values are 'top', 'left', 'right'
      labelPosition: "top",
      date: "",
      notesForm: {
        title: "",
        body: "",
        type: "success"
      },
      importanceOptions: [
        {
          value: "success",
          label: "All Good"
        },
        {
          value: "info",
          label: "Low"
        },
        {
          value: "warning",
          label: "Medium"
        },
        {
          value: "error",
          label: "High"
        }
      ],
      rules: {
        title: [
          {
            required: true,
            message: "Please enter title",
            trigger: "blur"
          },
          {
            min: 3,
            max: 50,
            message: "Length should be 3 to 50 characters",
            trigger: "blur"
          }
        ],
        body: [
          {
            required: true,
            message: "Please enter body",
            trigger: "blur"
          },
          {
            min: 3,
            message: "Min 3 characters are required",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    open() {
      this.editFormVisible = true;
      this.setDefault();
    },
    close() {
      this.editFormVisible = false;
      this.$emit('close')
      this.resetForm("notesForm");
    },
    setDefault() {
      // set default note Date
      if (!this.$props.noteDate) {
        this.date = moment(new Date()).format("dddd, MMMM Do YYYY");
      } else {
        this.date = moment(this.$props.noteDate, "YYYY-MM-DD").format(
          "dddd, MMMM Do YYYY"
        );
      }

      // if existing note is there set modal for editing
      const isEditingAllowed = !!Object.keys(this.existingNote).length
      if (isEditingAllowed) {
        this.isEditing = true;
        this.notesForm = {
          ...this.existingNote
        };
      } else {
        this.isEditing = false;
      }
    },
    async saveOrUpdate(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.isEditing) {
            this.updateNote();
          } else {
            this.createNote();
          }
        } else {
          return false;
        }
      });
    },
    createNote() {
      const note = {
        seenByUsers: [], // will contain userId who has seen / closed the note
        noteDate: this.$props.noteDate, // eg:- 2021-01-19
        ...this.notesForm
      };
      this.$store
        .dispatch("scheduler/addNote", note)
        .then(() => {
          this.$notify.success({
            title: "Success",
            message: "Note has been saved",
            offset: 100
          });
          this.close();
        })
        .catch(error => {
          this.$notify.error({
            title: "Failed",
            message: "Note saving failed",
            offset: 100
          });
        })
        .finally(() => {
          this.loading = false;
          this.isCreating = false;
        });
    },
    updateNote() {
      const note = {
        noteDate: this.$props.noteDate, // eg:- 2021-01-19
        ...this.notesForm
      };
      
      this.$store
        .dispatch("scheduler/editNote", note)
        .then(() => {
          this.$notify.success({
            title: "Success",
            message: "Note has been edited",
            offset: 100
          });
          this.close();
        })
        .catch(error => {
          this.$notify.error({
            title: "Failed",
            message: "Note editing failed",
            offset: 100
          });
        })
        .finally(() => {
          this.loading = false;
          this.isCreating = false;
        });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    handleDialogClosed() {
      this.close();
    },
    handleCancel() {
      this.isEditing = false;
      this.isCreating = false;
      this.close();
    }
  }
};
</script>

<style lang="scss" scoped>
.preview-text {
  margin-top: 12px;
  margin-bottom: 8px;
}
.create-text {
  padding-bottom: 12px;
  padding-top: 12px;
}
.el-alert {
  max-width: 355px;
}
.el-select {
  width: 505px;
}
</style>
