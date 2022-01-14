<!-- Please remove this file from your project -->
<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span v-if="!hideScore">Score: {{ correctAnswerCount }} out of {{ maxProblemsPerSession }}</span>
        <span v-else>1セッションが完了しました！</span>
      </div>
      <div class=" text item ">
        いい感じだね！この調子で学び続けていこう！
      </div>
      <div class="text item">
        <el-button type="primary" @click="checkDestination">
          次へ
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
    maxProblemsPerSession: {
      type: Number,
      required: true
    },
    correctAnswerCount: {
      type: Number,
      required: true
    },
    breathingGuidance: {
      type: Boolean,
      required: true
    },
    sessions: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      hideScore: true
    }
  },
  created () {
    // pass score to the parent (index.vue)
    this.$emit('on-score-available', this.correctAnswerCount)
  },
  methods: {
    // Checks which group for the next session: group A or group B?
    checkDestination () {
      // Reset count for a session (not a global level)
      this.$emit('reset-count')

      // If previous session was group A, then group B is next.
      // (The same is for true when the previous session was group B.)
      const nextProblemType = this.breathingGuidance ? 'GROUP_B' : 'GROUP_A'

      // checks if experiment is over
      if (this.sessions.finishedSessions + 1 < this.sessions.maxSessionsForEachGroup * 2) {
        // This event inclements count for sessons for an entire experiment.
        this.$emit('session-finished')
        this.$emit('set-problem-type', nextProblemType)
        this.$emit('change-screen', 'WordScreen')
      } else {
        // When the experiment is over, proceed to ThanksScreen.vue
        this.$emit('change-screen', 'ThanksScreen')
      }
    }

  }
}
</script>
