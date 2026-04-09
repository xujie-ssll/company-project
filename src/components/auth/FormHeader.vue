<template>
  <div class="form-header">
    <img 
      v-if="backUrl || $listeners.back" 
      src="@/assets/left.png" 
      alt="back" 
      class="back-icon" 
      @click="goBack"
    />
    <h2 class="form-title">{{ title }}</h2>
  </div>
</template>

<script>
export default {
  name: 'FormHeader',
  props: {
    title: {
      type: String,
      required: true
    },
    backUrl: {
      type: String,
      default: ''
    }
  },
  methods: {
    goBack() {
      if (this.$listeners.back) {
        this.$emit('back')
      } else if (this.backUrl) {
        this.$router.push(this.backUrl)
      }
    }
  }
}
</script>

<style scoped>
.form-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  min-height: 32px;
}

.back-icon {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  cursor: pointer;
}

.form-title {
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-weight: 400;
  font-size: 24px;
  line-height: 32px;
  color: #060606;
  margin: 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .form-title {
    font-size: 20px;
  }
}
</style>