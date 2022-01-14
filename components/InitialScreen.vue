<!-- Please remove this file from your project -->
<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>クロアチア語クイズ</span>
      </div>
      <span>英単語とクロアチア語単語のペアを学びましょう。</span>
      <div class="text item">
        <el-button type="primary" @click="startLearning('GROUP_A')">
          A
        </el-button>
        <el-button type="primary" @click="startLearning('GROUP_B')">
          B
        </el-button>
        <el-button type="primary" @click="logout">
          ログアウト
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style>

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.box-card {
  width: 480px;
}
</style>

<script>
export default {
  props: {
    firstProblemType: {
      type: String,
      required: true
    }
  },
  methods: {
    startLearning (problemType) {
      this.$emit('set-problem-type', problemType)
      // If problemType set twice, do not proceed to WordScreen since it is undefined behavior.
      if (!this.firstProblemType) {
        this.$emit('change-screen', 'WordScreen')
      }
    },
    logout () {
      this.$emit('logout')
    }
  }
}
</script>
