<template>
  <div>
    <el-row :gutter="64">
      <el-col :span="16">
        <el-form-item label="Name" prop="name">
          <el-input
            placeholder="Enter group name"
            v-model="groupForm.name"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="64">
      <el-col :span="24">
        <el-transfer
          filterable
          :filter-method="filterMethod"
          @change="handleChange"
          filter-placeholder="Search"
          v-model="value"
          :data="data"
          :titles="['Places', 'Group']"
        >
        </el-transfer>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props: {
    groupForm: {
      required: true
    },
    allPlaces: { type: Array, required: true }
  },
  data() {
    const generateData = _ => {
      const data = [];

      this.allPlaces.forEach((place, index) => {
        data.push({
          label: place.name,
          key: index,
          id: place.id
        });
      });
      return data;
    };

    return {
      data: generateData(),
      value: this.groupForm.indexesInGroup,
      filterMethod(query, item) {
        return item.label.toLowerCase().indexOf(query.toLowerCase()) > -1;
      }
    };
  },

  methods: {
    handleChange(value, direction, movedKeys) {
      console.log(value);
      this.groupForm.indexesInGroup = this.value.slice(0); // this will take a copy of this.value array
    }
  }
};
</script>
