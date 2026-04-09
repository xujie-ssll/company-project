<template>
  <AuthLayout :scale="scale">
    <template #right>
      <div v-if="isLogin" class="login-form form-container">
        <div class="title-container">
          <h1 class="welcome-title">欢迎登录</h1>
          <p class="subtitle">优特危废管理平台</p>
        </div>

        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-position="top">
          <LabeledInput
            label="账号"
            v-model="loginForm.username"
            :rules="loginRules.username"
            prop="username"
          />
          <PasswordInput
            label="密码"
            v-model="loginForm.password"
            :rules="loginRules.password"
            prop="password"
          />

          <div class="forgot-password">
            <el-link type="primary" :underline="false" @click="goToResetPassword">忘记密码？</el-link>
          </div>

          <SubmitButton
            :loading="loading"
            text="登录"
            @click="handleLogin"
          />
          <div class="register-link">
            <el-link type="primary" :underline="false" @click="switchToRegister">注册账号</el-link>
          </div>
        </el-form>
      </div>

      <div v-else class="register-form form-container">
        <FormHeader title="新用户注册" :backUrl="''" @back="switchToLogin" />

        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-position="top">
          <LabeledInput
            label="账号"
            v-model="registerForm.username"
            :rules="registerRules.username"
            prop="username"
            placeholder="仅支持大小英文+数字；字符限制20位"
          />
          <PasswordInput
            label="密码"
            v-model="registerForm.password"
            :rules="registerRules.password"
            prop="password"
            placeholder="仅支持大小英文+数字；字符限制20位"
          />
          <PasswordInput
            label="再次确认密码"
            v-model="registerForm.confirmPassword"
            :rules="registerRules.confirmPassword"
            prop="confirmPassword"
            placeholder="仅支持大小英文+数字；字符限制20位"
          />
          <LabeledInput
            label="联系人/经办人"
            v-model="registerForm.contact"
            :rules="registerRules.contact"
            prop="contact"
            placeholder="请输入"
          />
          <LabeledInput
            label="手机号"
            v-model="registerForm.phone"
            :rules="registerRules.phone"
            prop="phone"
            placeholder="请输入"
          />
          <LabeledInput
            label="统一社会信用代码"
            v-model="registerForm.creditCode"
            :rules="registerRules.creditCode"
            prop="creditCode"
            placeholder="请输入"
          />

          <SubmitButton
            :loading="registerLoading"
            text="注册"
            @click="handleRegister"
          />
        </el-form>
      </div>
    </template>
  </AuthLayout>
</template>

<script>
import { AuthLayout, FormHeader, LabeledInput, PasswordInput, SubmitButton } from '@/components/auth'
import { validationRules } from '@/components/auth/validationRules'
import { userApi } from '@/api/index'
import JSEncrypt from 'jsencrypt'
import StorageUtil from '@/utils/storage'
import { setTokenCache } from '@/utils/request'

export default {
  name: 'LoginPage',
  components: {
    AuthLayout,
    FormHeader,
    LabeledInput,
    PasswordInput,
    SubmitButton
  },
  data() {
    return {
      isLogin: true,
      loading: false,
      registerLoading: false,
      publicKey: '',
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        password: '',
        confirmPassword: '',
        contact: '',
        phone: '',
        creditCode: ''
      },
      loginRules: {
        username: validationRules.username,
        password: validationRules.password
      },
      registerRules: {
        username: validationRules.username,
        password: validationRules.password,
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.registerForm.password) {
                callback(new Error('两次输入的密码不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        contact: validationRules.contact,
        phone: validationRules.phone,
        creditCode: validationRules.creditCode
      },
      scale: 1
    }
  },
  computed: {
    wrapperStyle() {
      return {
        transform: `scale(${this.scale})`,
        transformOrigin: 'center center'
      }
    }
  },
  created() {
    // 页面创建时获取RSA公钥
    this.getRsaPublicKey()
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
    switchToRegister() {
      this.isLogin = false
    },
    switchToLogin() {
      this.isLogin = true
    },
    goToResetPassword() {
      this.$router.push('/reset-password')
    },

    // 获取RSA公钥
    async getRsaPublicKey() {
      try {
        const res = await userApi.getPublicKey()
        if (res.data && res.data.publicKey) {
          this.publicKey = `-----BEGIN PUBLIC KEY-----\n${res.data.publicKey}\n-----END PUBLIC KEY-----`
        } else {
          this.$message.warning('获取加密公钥失败，请刷新页面重试')
        }
      } catch (error) {
        console.error('获取公钥异常：', error)
        this.$message.error('网络异常，无法获取加密信息')
      }
    },

    // RSA加密
    rsaEncrypt(text) {
      if (!this.publicKey) {
        this.$message.warning('加密公钥未就绪，请刷新页面重试')
        return null
      }
      const encryptor = new JSEncrypt()
      encryptor.setPublicKey(this.publicKey)
      const encryptedText = encryptor.encrypt(text)
      if (!encryptedText) {
        this.$message.error('密码加密失败，请检查公钥格式')
        return null
      }
      return encryptedText
    },

    // 处理登录
    handleLogin() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return

        if (!this.publicKey) {
          this.$message.warning('加密公钥未就绪，请稍候重试')
          return
        }

        this.loading = true
        try {
          // 加密密码
          const encryptedPassword = this.rsaEncrypt(this.loginForm.password)
          if (!encryptedPassword) {
            this.loading = false
            return
          }

          // 调用登录接口
          const res = await userApi.login({
            account: this.loginForm.username,
            password: encryptedPassword
          })

          if (res.code === 200 || res.code === '0000') {
            // 1. 核心：先同步更新内存token（立即生效）
            const token = res.data?.token || res.token
            setTokenCache(token)
            window.tokenCache = token

            // 2. 存储用户信息
            try {
              await StorageUtil.setItem('token', token)
              await StorageUtil.setItem('user', JSON.stringify(res.data))
            } catch (e) {
              console.error('Token存储失败：', e)
            }

            this.$message.success('登录成功!')

            // 3. 延迟跳转，确保WebView处理完内存token
            setTimeout(() => {
              this.$router.replace('/dashboard')
            }, 500)
          } else {
            this.$message.error(res.msg || res.message || '登录失败')
          }
        } catch (error) {
          console.error('登录请求异常：', error)
          this.$message.error(error.msg || error.message || '登录失败，请检查网络')
        } finally {
          this.loading = false
        }
      })
    },

    // 处理注册
    async handleRegister() {
      this.$refs.registerFormRef.validate(async (valid) => {
        if (!valid) return

        if (!this.publicKey) {
          this.$message.warning('加密公钥未就绪，请稍候重试')
          return
        }

        this.registerLoading = true
        try {
          // 调用注册接口
          const res = await userApi.register({
            account: this.registerForm.username,
            password: this.registerForm.password,
            passwordAgain: this.registerForm.confirmPassword,
            userName: this.registerForm.contact,
            mobileNo: this.registerForm.phone,
            officeCode: this.registerForm.creditCode
          })

          if (res.code === 200 || res.code === '0000') {
            this.$message.success('注册成功')

            // 注册成功后自动登录
            const encryptedPassword = this.rsaEncrypt(this.registerForm.password)
            if (!encryptedPassword) {
              this.registerLoading = false
              this.switchToLogin()
              return
            }

            const loginRes = await userApi.login({
              account: this.registerForm.username,
              password: encryptedPassword
            })

            if (loginRes.code === 200 || loginRes.code === '0000') {
              // 登录成功，处理token
              const token = loginRes.data?.token || loginRes.token
              setTokenCache(token)
              window.tokenCache = token

              try {
                await StorageUtil.setItem('token', token)
                await StorageUtil.setItem('user', JSON.stringify(loginRes.data))
              } catch (e) {
                console.error('Token存储失败：', e)
              }

              this.$message.success('登录成功!')

              // 清空注册表单
              Object.keys(this.registerForm).forEach(key => {
                this.registerForm[key] = ''
              })

              // 延迟跳转
              setTimeout(() => {
                this.$router.replace('/dashboard')
              }, 500)
            } else {
              this.$message.error(loginRes.msg || '自动登录失败，请手动登录')
              this.switchToLogin()
            }
          } else {
            this.$message.error(res.msg || res.message || '注册失败')
          }
        } catch (error) {
          console.error('注册失败：', error)
          this.$message.error(error.msg || error.message || '注册失败，请检查网络')
        } finally {
          this.registerLoading = false
        }
      })
    },

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
      scale = Math.min(Math.max(scale, 0.6), 1)
      this.scale = scale
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
