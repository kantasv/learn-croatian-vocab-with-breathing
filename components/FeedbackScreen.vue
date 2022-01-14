<!-- Please remove this file from your project -->
<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span> {{ feedbackTitle }}</span>
      </div>
      <div class="text item">
        {{ feedbackMessage }}
      </div>
      <el-button v-if="isAnswerCorrect" type="primary" @click="nextScreen">
        次へ
      </el-button>
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
    userSelectedAnswer: {
      type: String,
      required: true
    },
    vocabularyToLearn: {
      type: String,
      required: true
    },
    vocabularyMeaningToLearn: {
      type: String,
      required: true
    },
    isBreathingGuidanceEnabled: {
      type: Boolean,
      required: true
    },
    isAnswerCorrect: {
      type: Boolean,
      required: true
    },
    hasSkippedProblem: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      FEEDBACK_MESSAGE_CORRECT: '正解！',
      FEEDBACK_MESSAGE_WRONG: '不正解',
      FEEDBACK_MESSAGE_NEW_VOCAB: '意味を確認しよう'
    }
  },
  computed: {
    feedbackMessage () {
      if (this.isAnswerCorrect) {
        return `さすが！ "${this.vocabularyToLearn}" はクロアチア語で "${this.vocabularyMeaningToLearn}" に対応。`
      } else if (!this.hasSkippedProblem) {
        return `"${this.vocabularyToLearn}" はクロアチア語で "${this.vocabularyMeaningToLearn}"に対応します。（あなたの解答："${this.userSelectedAnswer}" ）`
      } else {
        return `"${this.vocabularyToLearn}" はクロアチア語で "${this.vocabularyMeaningToLearn}"に対応します。`
      }
    },
    feedbackTitle () {
      if (this.isAnswerCorrect) {
        return this.FEEDBACK_MESSAGE_CORRECT
      } else if (!this.hasSkippedProblem) {
        return this.FEEDBACK_MESSAGE_WRONG
      } else {
        return this.FEEDBACK_MESSAGE_NEW_VOCAB
      }
    }
  },
  created () {
    // automatically proceed to next screen
    //  with 5 sec for correct answer (also skippable with "Got it" button shown in this case)
    //  with 10 sec for wrong answer, or unanswered
    const WAIT_DURATION_SEC = this.isAnswerCorrect ? 5 : 10
    return new Promise(resolve => setTimeout(() => {
      this.nextScreen()
    }, WAIT_DURATION_SEC * 1000))
  },
  methods: {
    nextScreen () {
      this.$emit('reset-skip-listener')
      const dstScreen = this.isBreathingGuidanceEnabled ? 'BreathingScreen' : 'BreakScreen'
      this.$emit('change-screen', dstScreen)
    }
  }
}
</script>
