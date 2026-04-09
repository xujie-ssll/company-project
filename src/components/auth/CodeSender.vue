<template>
  <el-button 
    class="code-sender-btn" 
    :disabled="isSending" 
    @click="sendCode"
  >
    {{ buttonText }}
  </el-button>
</template>

<script>
export default {
  name: 'CodeSender',
  props: {
    phone: {
      type: String,
      required: true
    },
    countdown: {
      type: Number,
      default: 60
    }
  },
  data() {
    return {
      isSending: false,
      buttonText: '获取验证码',
      timer: null,
      remainingTime: 0
    }
  },
  methods: {
    sendCode() {
      if (!this.phone) {
        this.$message.warning('请先输入手机号')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(this.phone)) {
        this.$message.warning('请输入正确的手机号')
        return
      }
      
      this.isSending = true
      this.remainingTime = this.countdown
      this.updateButtonText()
      
      this.timer = setInterval(() => {
        this.remainingTime--
        if (this.remainingTime <= 0) {
          this.reset()
        } else {
          this.updateButtonText()
        }
      }, 1000)
      
      this.$emit('send')
      this.$message.success('验证码已发送')
    },
    updateButtonText() {
      this.buttonText = `${this.remainingTime}秒后重试`
    },
    reset() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.isSending = false
      this.buttonText = '获取验证码'
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style scoped>
.code-sender-btn {
  width: 96px;
  height: 32px;
  border-radius: 2px;
  background-color: transparent;
  border: 1px solid #13B63A;
  font-size: 14px;
  line-height: 22px;
  color: #13B63A;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 10px;
}

.code-sender-btn:hover:not(:disabled) {
  background-color: rgba(19, 182, 58, 0.1);
}

.code-sender-btn:disabled {
  background-color: #cccccc;
  border: 1px solid #cccccc;
  color: #666666;
  cursor: not-allowed;
}
</style>