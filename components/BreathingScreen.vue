<!-- Please remove this file from your project -->
<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>バルーンに従って呼吸してください</span>
      </div>

      <div class="text item">
        <div v-if="!hideAnime" class="breathing-animation">
          {{ guidanceText }}
        </div>
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

.breathing-animation {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 300px;
    height:300px;
    border-radius: 50%;
    background-color:black;

    font-size:36px;
    color:#fff;
    display:flex;
    justify-content:center;
    align-items:center;
    text-align:center;

    transform: scale(0);
    animation-name:inhale;
    animation-duration:10s;
    animation-fill-mode:forwards;
    animation-iteration-count: infinite;
}
@keyframes inhale{
  0%{
    transform: scale(0);
  }
  40%{
    transform: scale(1);
  }
  100%{
    transform: scale(0);
  }
}
.guidance-text{
  display: none;
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
      BREAK_DURATION_SEC: 10,
      guidanceText: '吸う',
      hideAnime: false
    }
  },
  created () {
    this.initiAnime()
  },
  methods: {
    async initiAnime () {
      this.guidanceText = '吸う'
      await new Promise(resolve => setTimeout(async () => {
        this.guidanceText = 'とめる'
        await new Promise(resolve => setTimeout(async () => {
          this.guidanceText = '吐く'
          await new Promise(resolve => setTimeout(() => {
            this.guidanceText = ''
            this.hideAnime = true
            this.checkDestination()
          }, 6 * 1000))
        }, 2 * 1000))
      }, 2 * 1000))
    },
    checkDestination () {
      const isSessionFinished = !(this.finishedQuestionCount < this.numQuestionPerSession)
      this.$emit('change-screen', isSessionFinished ? 'ScoreScreen' : 'WordScreen')
    }
  }

}
</script>
