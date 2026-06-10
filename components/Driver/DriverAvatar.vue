<template>
  <div>
    <el-row>
      <el-col :span="24" class="c74-avatar">
        <el-avatar :size="100" :src="url">{{ user.firstName }} {{ user.lastName }}</el-avatar>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="c74-avatar-info">
        <div class="c74-name">{{ user.firstName }} {{ user.lastName }}</div>
        <div class="c74-since">Driver since {{mixinFormatFirestoreDateAndTime(user.created,"DD/MM/yyyy")}}</div>                    
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { dateUtilsMixin } from "@/statics/utils/dateUtils.js";

export default {
  mixins: [dateUtilsMixin],  
  props: {
    user: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      url: "https://randomuser.me/api/portraits/men/28.jpg"
    };
  }
};
</script>

<style lang="scss" scoped>
.c74-avatar {
  display: flex;
  justify-content: center;
}

.c74-avatar-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;

  .c74-name {
    color: $color-primary-text;
    margin-top: 24px;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .c74-since {
    color: $color-secondary-text;
    margin: 8px 0px;
    font-size: 0.9rem;
  }
}
</style>
