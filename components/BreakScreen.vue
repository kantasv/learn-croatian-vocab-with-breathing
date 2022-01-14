<!-- Please remove this file from your project -->
<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>休憩タイム</span>
      </div>
      <div class="text item">
        少しの間、お待ちください。休憩中は座ったままお過ごしください。
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
    finishedQuestionCount: {
      type: Number,
      required: true
    },
    numQuestionPerSession: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      BREAK_DURATION_SEC: 10
    }
  },
  created () {
    return new Promise(resolve => setTimeout(() => {
      this.checkDestination()
    }, this.BREAK_DURATION_SEC * 1000))
  },
  methods: {
    checkDestination () {
      const isSessionFinished = !(this.finishedQuestionCount < this.numQuestionPerSession)
      this.$emit('change-screen', isSessionFinished ? 'ScoreScreen' : 'WordScreen')
    }
  }

}
</script>
