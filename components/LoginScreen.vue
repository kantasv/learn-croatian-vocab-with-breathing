<!-- Please remove this file from your project -->
<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>認証が必要です</span>
      </div>

      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="Email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="form.password" />
        </el-form-item>
      </el-form>

      <el-button type="primary" @click="login">
        サインイン
      </el-button>
      <div class="text item" />
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
  data () {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    login () {
      this.$emit('on-login-trial', { email: this.form.email, password: this.form.password })
    }
  }
}
</script>
