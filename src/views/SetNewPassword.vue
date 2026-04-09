<template>
  <AuthLayout :scale="scale">
    <template #right>
      <div class="set-password-form form-container">
        <FormHeader title="设置新密码" backUrl="/reset-password" />
        
        <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top">
          <PasswordInput 
            label="新密码" 
            v-model="formData.newPassword" 
            :rules="formRules.newPassword" 
            prop="newPassword"
            placeholder="仅支持大小英文+数字；字符限制20位"
          />
          <PasswordInput 
            label="再次确认密码" 
            v-model="formData.confirmPassword" 
            :rules="formRules.confirmPassword" 
            prop="confirmPassword"
            placeholder="仅支持大小英文+数字；字符限制20位"
          />
          
          <SubmitButton 
            :loading="loading" 
            text="保存" 
            @click="handleSave" 
          />
        </el-form>
      </div>
    </template>
  </AuthLayout>
</template>

<script>
import { AuthLayout, FormHeader, PasswordInput, SubmitButton } from '@/components/auth'
import { validationRules } from '@/components/auth/validationRules'

export default {
  name: 'SetNewPasswordPage',
  components: {
    AuthLayout,
    FormHeader,
    PasswordInput,
    SubmitButton
  },
  data() {
    return {
      loading: false,
      scale: 1,
      formData: {
        newPassword: '',
        confirmPassword: ''
      },
      formRules: {
        newPassword: validationRules.password,
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { 
            validator: (rule, value, callback) => {
              if (value !== this.formData.newPassword) {
                callback(new Error('两次输入的密码不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
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
      this.$router.push('/reset-password')
    },
    handleSave() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return
        this.loading = true
        setTimeout(() => {
          this.$message.success('密码修改成功，请重新登录')
          this.$router.push('/login')
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