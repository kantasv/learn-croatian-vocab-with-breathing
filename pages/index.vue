<template>
  <div class="interface-wrapper">
    <break-screen
      v-if="currentScreen === 'BreakScreen'"
      :finished-question-count="finishedQuestionCount"
      :num-question-per-session="maxProblemsPerSession"
      @change-screen="changeScreen"
    />
    <breathing-screen
      v-if="currentScreen === 'BreathingScreen'"
      :finished-question-count="finishedQuestionCount"
      :num-question-per-session="maxProblemsPerSession"
      @change-screen="changeScreen"
    />
    <feedback-screen
      v-if="currentScreen === 'FeedbackScreen'"
      :user-selected-answer="userSelectedCandidate"
      :vocabulary-to-learn="currentVocabulary"
      :vocabulary-meaning-to-learn="correctAnswer"
      :is-breathing-guidance-enabled="breathingGuidance"
      :is-answer-correct="isAnswerCorrect"
      :has-skipped-problem="hasSkippedProblem"
      @change-screen="changeScreen"
      @reset-skip-listener="resetSkipListener"
    />
    <initial-screen
      v-if="currentScreen === 'InitialScreen'"
      :first-problem-type="firstProblemType"
      @set-problem-type="setProblemType"
      @change-screen="changeScreen"
      @logout="logout"
    />
    <score-screen
      v-if="currentScreen === 'ScoreScreen'"
      :max-problems-per-session="maxProblemsPerSession"
      :finished-question-count="finishedQuestionCount"
      :correct-answer-count="correctAnswerCount"
      :breathing-guidance="breathingGuidance"
      :sessions="sessions"
      @change-screen="changeScreen"
      @reset-count="resetCount"
      @on-score-available="pushScoreToFirestore"
      @set-problem-type="setProblemType"
      @session-finished="incrementFinishedSessions"
    />
    <word-screen
      v-if="currentScreen === 'WordScreen'"
      :problems="problemsShuffled"
      :finished-question-count="finishedQuestionCount"
      @inclement-finished-question-count="inclementFinishedQuestionCount"
      @change-screen="changeScreen"
      @set-answer-correctness="setAnswerCorrectness"
      @set-current-vocabulary="setCurrentVocabulary"
      @set-correct-answer="setCorrectAnswer"
      @user-selected-candidate="setUserSelectedCandidate"
      @skip-problem="skipProblem"
    />
    <login-screen
      v-if="currentScreen === 'LoginScreen'"
      @on-login-trial="signInToAuth"
    />
    <thanks-screen
      v-if="currentScreen === 'ThanksScreen'"
    />
  </div>
</template>

<script>

// Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore, addDoc, collection, serverTimestamp } from 'firebase/firestore/lite'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import PROBLEMS from '@/assets/problems.js'
import firebaseConfig from '~/assets/firebase-config'

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default {
  data () {
    return {
      sessions: {
        finishedSessions: 0,
        maxSessionsForEachGroup: 3
      },
      breathingGuidance: true,
      screenNames: ['BreakScreen', 'BreathingScreen', 'FeedbackScreen', 'InitialScreen', 'ScoreScreen', 'WordScreen', 'LoginScreen', 'ThanksScreen'],
      currentScreen: 'LoginScreen',
      finishedQuestionCount: 0,
      correctAnswerCount: 0,
      maxProblemsPerSession: 35,
      problemsShuffled: [],
      croatianWordsUserGotRight: [],
      isAnswerCorrect: false,
      currentVocabulary: '',
      correctAnswer: '',
      userSelectedCandidate: '',
      hasSkippedProblem: false,
      firstProblemType: '',
      uid: ''
    }
  },
  created () {
    // If already logged in, proceed to InitialScreen
    getAuth().onAuthStateChanged((user) => {
      if (user) {
        console.log('Already logged-in.')
        this.changeScreen('InitialScreen')
        this.uid = user.uid
      }
    })
  },
  methods: {
    changeScreen (screenName) {
      this.currentScreen = screenName
      console.log(`currentScreen is set to '${screenName}'`)
    },
    signInToAuth (loginFormObj) {
    // Check if a user is logged in or not
      const email = loginFormObj.email
      const password = loginFormObj.password
      console.log('loginFormObj', loginFormObj)

      if (!(email && password)) {
        this.$message.error('認証情報が不正です。')
        return
      }

      const auth = getAuth()
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        // Signed in
          const user = userCredential.user
          console.log(user)
          this.$message({
            message: 'サインインしました。',
            type: 'message'
          })
          this.uid = user.uid
          this.changeScreen('InitialScreen')
        })
        .catch((error) => {
          const errorCode = error.code
          const errorMessage = error.message
          this.$message.error(`サインインに失敗しました: ${errorCode}: ${errorMessage}`)
        })
    },
    logout () {
      // logout
      const auth = getAuth()
      signOut(auth).then(() => {
        // Sign-out successful.
        this.$message({
          message: 'Signed out.',
          type: 'message'
        })
        // Back to login form
        this.changeScreen('LoginScreen')
      }).catch((error) => {
        this.$message.error(`Failed to sign out. ${error}`)
      })
    },
    incrementFinishedSessions () {
      this.sessions.finishedSessions++
    },
    setProblemType (problemType) {
      // Record the very first group.
      if (!this.firstProblemType) {
        this.firstProblemType = problemType
      }

      let problems = []
      if (problemType === 'GROUP_A') {
        problems = PROBLEMS.GROUP_A
        this.breathingGuidance = true
      } else if (problemType === 'GROUP_B') {
        problems = PROBLEMS.GROUP_B
        this.breathingGuidance = false
      }

      this.initProblems(problems)
    },
    // Could be called every after breathing guidance is enabled/disabled.
    initProblems (problems) {
      // Reset arrays
      this.problemsShuffled = []
      this.croatianWordsUserGotRight = []
      this.problemsFetchedfromFirestore = []
      // Re-assign problems
      this.problemsFetchedfromFirestore = problems
      // This shuffling is just a quick implementation.
      // If you need more random result, use different ways.
      this.problemsShuffled = [...this.problemsFetchedfromFirestore.sort(() => Math.random() - 0.5)]
    },
    popProblem () {
      return this.problemsShuffled.pop()
    },
    inclementFinishedQuestionCount (isAnswerCorrect) {
      this.finishedQuestionCount++
      if (isAnswerCorrect) {
        this.correctAnswerCount++
        // Saves correct ones
        this.croatianWordsUserGotRight.push(this.userSelectedCandidate)
      }
    },
    resetCount () {
      this.finishedQuestionCount = 0
      this.correctAnswerCount = 0
      this.croatianWordsUserGotRight = []
    },
    setAnswerCorrectness (isAnswerCorrect) {
      this.isAnswerCorrect = isAnswerCorrect
    },
    setCurrentVocabulary (word) {
      this.currentVocabulary = word
    },
    setCorrectAnswer (meaning) {
      this.correctAnswer = meaning
    },
    setUserSelectedCandidate (selectedCandidate) {
      this.userSelectedCandidate = selectedCandidate
    },
    skipProblem () {
      this.hasSkippedProblem = true
    },
    resetSkipListener () {
      this.hasSkippedProblem = false
      this.userSelectedCandidate = ''
    },
    async pushScoreToFirestore (score) {
      try {
        // collection name should be dynamically choosen.
        if (!this.uid) { throw new Error('uid is invalid') }
        await addDoc(collection(db, this.uid), {
          score,
          breathingGuidance: this.breathingGuidance,
          problems: this.problemsShuffled,
          croatianWordsUserGotRight: this.croatianWordsUserGotRight,
          timestamp: serverTimestamp()
        })
        this.$message({
          message: 'スコアをクラウドに保存しました。'
        })
      } catch (e) {
        this.$message.error('スコアのクラウドへの保存時に問題が発生しました。実験担当者を呼び出してください。')
      }
    }
  }
}
</script>
