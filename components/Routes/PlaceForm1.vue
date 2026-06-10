<template>
  <div>
    <el-row :gutter="64">
      <el-col :span="8">
        <el-form-item label="Name" prop="name">
          <el-input
            placeholder="Enter place name"
            v-model="placeForm.name"
          ></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Code" prop="code">
          <el-input
            placeholder="Enter code"
            v-model="placeForm.code"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="64">
      <el-col :span="8">
        <el-form-item label="Color" prop="color">
          <el-color-picker
            v-model="placeForm.color"
            :predefine="predefineBgColors"
          >
          </el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Text Color" prop="fontColor">
          <el-color-picker
            v-model="placeForm.fontColor"
            :predefine="predefineFontColors"
          >
          </el-color-picker>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props: {
    placeForm: {
      required: true
    }
  },
  data() {
    return {
      predefineBgColors: [
        "#706fd3",
        "#f7f1e3",
        "#34ace0",
        "#33d9b2",
        "#2c2c54",
        "#aaa69d",
        "#ff793f",
        "#ffda79"
      ],
      predefineFontColors: ["#ffffff", "#f7f1e3", "#aaa69d", "#84817a"]
    };
  }
};
</script>
