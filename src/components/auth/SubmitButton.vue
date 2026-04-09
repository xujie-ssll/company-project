<template>
  <el-button 
    class="submit-btn" 
    :loading="loading" 
    :disabled="disabled"
    @click="handleClick"
  >
    {{ text }}
  </el-button>
</template>

<script>
export default {
  name: 'SubmitButton',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.submit-btn {
  width: 100%;
  height: 40px;
  border-radius: 2px;
  background-color: #13B63A;
  border: none;
  font-size: 14px;
  color: white;
  margin-top: 16px;
  cursor: pointer;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0e9a2f;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>