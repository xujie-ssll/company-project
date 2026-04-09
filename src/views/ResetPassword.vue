<template>
  <AuthLayout :scale="scale">
    <template #right>
      <div class="reset-form form-container">
        <FormHeader title="重设密码" backUrl="/login" />
        
        <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" label-position="top">
          <LabeledInput 
            label="账号" 
            v-model="resetForm.username" 
            :rules="resetRules.username" 
            prop="username"
            placeholder="请输入"
          />
          <LabeledInput 
            label="统一社会信用代码" 
            v-model="resetForm.creditCode" 
            :rules="resetRules.creditCode" 
            prop="creditCode"
            placeholder="请输入"
          />
          <LabeledInput 
            label="注册手机号" 
            v-model="resetForm.phone" 
            :rules="resetRules.phone" 
            prop="phone"
            placeholder="请输入"
          />
          <VerifyCodeInput 
            label="验证码" 
            v-model="resetForm.verifyCode" 
            :rules="resetRules.verifyCode" 
            prop="verifyCode"
            :phone="resetForm.phone"
            @send="sendCode"
          />
          
          <SubmitButton 
            :loading="loading" 
            text="下一步" 
            @click="handleNext" 
          />
        </el-form>
      </div>
    </template>
  </AuthLayout>
</template>

<script>
import { AuthLayout, FormHeader, LabeledInput, VerifyCodeInput, SubmitButton } from '@/components/auth'
import { validationRules } from '@/components/auth/validationRules'

export default {
  name: 'ResetPasswordPage',
  components: {
    AuthLayout,
    FormHeader,
    LabeledInput,
    VerifyCodeInput,
    SubmitButton
  },
  data() {
    return {
      loading: false,
      countdown: 0,
      resetForm: {
        username: '',
        creditCode: '',
        phone: '',
        verifyCode: ''
      },
      resetRules: {
        username: validationRules.username,
        creditCode: validationRules.creditCode,
        phone: validationRules.phone,
        verifyCode: validationRules.verifyCode
      },
      scale: 1
    }
  },
  mounted() {
    // 初始化缩放
    this.calculateScale()
    // 监听窗口大小变化
    window.addEventListener('resize', this.calculateScale)
  },
  beforeDestroy() {
    // 移除窗口大小变化监听
    window.removeEventListener('resize', this.calculateScale)
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    calculateScale() {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const designWidth = 1408 // 1024 + 384 = 1408
      const designHeight = 768
      
      // 计算宽度和高度的缩放比例
      let scaleX = windowWidth / designWidth
      let scaleY = windowHeight / designHeight
      
      // 取较小的缩放比例，确保内容完全显示
      let scale = Math.min(scaleX, scaleY)
      
      // 限制最大缩放为1，最小为0.5
      scale = Math.min(Math.max(scale, 0.5), 1)
      
      this.scale = scale
    },
    goBack() {
      this.$router.push('/login')
    },
    sendCode() {
      if (!this.resetForm.phone) {
        this.$message.warning('请先输入手机号')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(this.resetForm.phone)) {
        this.$message.warning('请输入正确的手机号')
        return
      }
      
      this.codeSending = true
      let count = 60
      this.codeText = `${count}秒后重试`
      
      this.timer = setInterval(() => {
        count--
        if (count <= 0) {
          clearInterval(this.timer)
          this.codeSending = false
          this.codeText = '获取验证码'
        } else {
          this.codeText = `${count}秒后重试`
        }
      }, 1000)
      
      this.$message.success('验证码已发送')
    },
    handleNext() {
      this.$refs.resetFormRef.validate((valid) => {
        if (!valid) return
        this.loading = true
        setTimeout(() => {
          this.$message.success('验证通过')
          this.$router.push('/set-new-password')
          this.loading = false
        }, 1000)
      })
    }
  }
}
</script>

<style scoped>
/* 导入公共样式 */
@import '@/styles/auth-styles.scss';

/* 页面特定样式 */
.content-wrapper {
  transition: transform 0.2s ease;
}
</style>