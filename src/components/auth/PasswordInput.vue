<template>
  <el-form-item :prop="prop" :rules="rules">
    <div class="field-label">{{ label }}</div>
    <el-input 
      v-model="inputValue" 
      :type="showPassword ? 'text' : 'password'"
      :placeholder="placeholder" 
      class="auth-input"
      @input="handleInput"
      @blur="handleBlur"
    >
      <i slot="suffix" class="el-icon-view" @click="showPassword = !showPassword"></i>
    </el-input>
  </el-form-item>
</template>

<script>
export default {
  name: 'PasswordInput',
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
      default: ''
    },
    rules: {
      type: Array,
      default: () => []
    },
    prop: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      showPassword: false,
      inputValue: this.value
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
  methods: {
    handleInput() {
      this.$emit('input', this.inputValue)
    },
    handleBlur() {
      this.$emit('input', this.inputValue)
    }
  },
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

.auth-input {
  width: 280px;
  height: 32px;
}

.auth-input >>> .el-input__wrapper {
  border-radius: 2px;
  padding: 4px 12px;
  background-color: #FFFFFF;
  box-shadow: none;
  border: none;
  height: 32px;
  min-height: 32px;
}

.auth-input >>> .el-input__inner {
  font-size: 14px;
  height: 32px;
  line-height: 22px;
}

.auth-input >>> .el-input__inner::placeholder {
  color: #9AA2B0;
}

.el-icon-view {
  cursor: pointer;
  color: #717782;
}
</style>