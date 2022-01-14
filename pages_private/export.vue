<template>
  <div class="interface-wrapper">
    <div
      v-if="currentScreen === 'InitialScreen'"
    >
      <el-button type="primary" @click="exportFromDB">
        export
      </el-button>
    </div>
    <login-screen
      v-if="currentScreen === 'LoginScreen'"
      @on-login-trial="signInToAuth"
    />
  </div>
</template>

<script>

// Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore/'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import firebaseConfig from '~/assets/firebase-config'

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default {
  data () {
    return {
      breathingGuidance: true,
      screenNames: ['InitialScreen', 'LoginScreen'],
      currentScreen: 'LoginScreen'
    }
  },
  created () {
    // If already logged in, proceed to InitialScreen
    getAuth().onAuthStateChanged((user) => {
      if (user) {
        console.log('Already logged-in.')
        this.changeScreen('InitialScreen')
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
    async exportFromDB () {
      const uids = [
        'A1fczhh1uoc8QagB3SVzAhHLpsg2',
        'QjBKifyWjsgdrSDn4f4Vv9j2CEr2',
        '29fQmgT6GDcJSJSq9PaY14alrn93',
        'nrNNyvgkIuSXarufasQiNUSB1DC3',
        'Cg2RnL58YGS0bGcZSPnhkaIVBSk2',
        '8ZJBKi5SNIP2iHfcCyOW0VbfGR43',
        'kMAs4950kpV56n2BTGgkcWOF8K52',
        'pMOyfX9lxDf21YzVMRNwTX3T11j2',
        'zYy8WMrEVoVJwFvuHmYYZ6woFnd2',
        'mvotsKmq8DQX8c5dLdYAPqzLSfc2'
      ]

      const pids = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      // [[], [],...]
      const exportedArr = await this.getAllCollections(uids)
      const exportedObj = exportedArr.map((arr, idx) => {
        return {
          pid: pids[idx],
          data: arr,
          uid: uids[idx]
        }
      })
      console.log(exportedObj)
      // export to json
      function downloadTextFile (text, name) {
        const a = document.createElement('a')
        const type = name.split('.').pop()
        a.href = URL.createObjectURL(new Blob([text], { type: `text/${type === 'txt' ? 'plain' : type}` }))
        a.download = name
        a.click()
      }

      downloadTextFile(JSON.stringify(exportedObj), 'exported_score.json')
    },
    async getAllCollections (uids) {
      const result = await uids.map(async (uid) => {
        const q = query(collection(db, uid), orderBy('timestamp'))
        const querySnapshot = await getDocs(q)

        return await querySnapshot.docs.map(doc => doc.data())
      })
      const values = await Promise.all(result)
      return values
    }
  }
}
</script>
