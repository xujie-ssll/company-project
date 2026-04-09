<template>
  <el-form-item :prop="prop" :rules="rules">
    <div class="field-label">{{ label }}</div>
    <div class="code-row">
      <el-input 
        v-model="inputValue" 
        :placeholder="placeholder" 
        class="code-input"
        @input="handleInput"
      />
      <el-button 
        class="get-code-btn" 
        :disabled="codeSending" 
        @click="sendCode"
      >
        {{ codeText }}
      </el-button>
    </div>
  </el-form-item>
</template>

<script>
export default {
  name: 'VerifyCodeInput',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入验证码'
    },
    rules: {
      type: Array,
      default: () => []
    },
    prop: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      codeSending: false,
      codeText: '获取验证码',
      timer: null,
      inputValue: this.value
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
      this.$emit('send')
    },
    handleInput() {
      this.$emit('input', this.inputValue)
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.inputValue = newVal
      },
      immediate: true
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
.field-label {
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #1E253D;
  margin-bottom: 4px;
  text-align: left;
}

.code-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.code-input {
  width: 158px;
  height: 32px;
}

.code-input >>> .el-input__wrapper {
  border-radius: 2px;
  padding: 4px 12px;
  background-color: #FFFFFF;
  box-shadow: none;
  border: none;
  height: 32px;
  min-height: 32px;
}

.code-input >>> .el-input__inner {
  font-size: 14px;
  height: 32px;
  line-height: 22px;
}

.get-code-btn {
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

.get-code-btn:hover:not(:disabled) {
  background-color: rgba(19, 182, 58, 0.1);
}

.get-code-btn:disabled {
  background-color: #cccccc;
  border: 1px solid #cccccc;
  color: #666666;
  cursor: not-allowed;
}
</style>