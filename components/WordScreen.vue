<!-- Please remove this file from your project -->
<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{ vocabularyToLearn }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="skipProblem"
        >
          わからないのでスキップ
        </el-button>
      </div>
      <div class="text item">
        <el-button
          v-for=" candidate in candidates"
          :key=" candidate "
          @click="checkAnswer(candidate)"
        >
          {{ candidate }}
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
import ed from 'edit-distance'
import distractors from '~/assets/distractors'

export default {
  props: {
    problems: {
      type: Array,
      required: true
    },
    finishedQuestionCount: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
    }
  },
  computed: {
    candidates () {
      const mergedCandidates = [...this.distracters]
      mergedCandidates.push(this.correctAnswer)
      // This shuffling is just a quick implementation.
      // If you need more random result, use different ways.
      mergedCandidates.sort(() => Math.random() - 0.5)
      return mergedCandidates
    },
    currentProblem () {
      return this.problems[this.finishedQuestionCount]
    },
    vocabularyToLearn () {
      this.$emit('set-current-vocabulary', this.currentProblem.word)
      return this.currentProblem.word
    },
    correctAnswer () {
      this.$emit('set-correct-answer', this.currentProblem.meaning)
      return this.currentProblem.meaning
    },
    distracters () {
      // in: distractors.distractors (Croatian)
      // in: this.currentProblem.word
      // out: ['dist1', 'dist2', 'dist3']

      // Define cost functions.
      const insert = node => 1
      const remove = insert
      const update = (stringA, stringB) => stringA !== stringB ? 1 : 0

      const currentVocab = this.currentProblem.meaning
      // Make sure distractors are unique.
      const distractorsLocal = distractors.distractors.filter((value, index, self) => {
        return (self.indexOf(value) === index)
      })

      const distractorsWithEditedDistance = distractorsLocal.map((distractor) => {
        // Compute edit distance
        const lev = ed.levenshtein(currentVocab, distractor, insert, remove, update)
        // out [{distracor: 'bar', distance: 777}, {...}]
        return {
          distractor, distance: lev.distance
        }
      }).filter((distractorObj) => {
        // Remove elm s.g. its distance == 0, which means exactly the same as currentVocab.
        // out [{distracor: 'bar', distance: 777}, {...}]
        return (distractorObj.distance > 0)
      })

      if (distractorsWithEditedDistance.length < 3) { throw new Error('Failed to sort distractors by edited distance') }

      // Sort out by edited distances to get similar distractors
      const sortedDistractorsByDistance = distractorsWithEditedDistance.sort((a, b) => a.distance - b.distance)

      // Choose three distractors and return as ['dist1', 'dist2', 'dist3']
      const threeDistractors = sortedDistractorsByDistance.slice(0, 3).map(distractor => distractor.distractor)
      console.log(distractorsWithEditedDistance)
      return threeDistractors
    }
  },
  created () {
    console.log(`problem is set to '${this.problems}'`)
    console.log(`finishedQuestionCount is set to '${this.finishedQuestionCount}'`)
  },
  methods: {
    checkAnswer (selectedCandidate) {
      this.$emit('user-selected-candidate', selectedCandidate)
      const isAnswerCorrect = this.correctAnswer === selectedCandidate
      this.$emit('inclement-finished-question-count', isAnswerCorrect)
      console.log(isAnswerCorrect ? 'Answer is correct.' : 'Answer is wrong.')
      this.$emit('set-answer-correctness', isAnswerCorrect)
      // In the future, we may need more args to pass to the $emit.
      this.$emit('change-screen', 'FeedbackScreen')
    },
    skipProblem () {
      const isAnswerCorrect = false
      this.$emit('inclement-finished-question-count', isAnswerCorrect)
      this.$emit('set-answer-correctness', isAnswerCorrect)
      this.$emit('skip-problem')
      this.$emit('change-screen', 'FeedbackScreen')
    }
  }
}
</script>
