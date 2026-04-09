<template>
  <div></div>
</template>

<script>
export default {
  name: 'DisableZoom',
  methods: {
    // 处理鼠标滚轮
    handleWheel(e) {
      e.preventDefault()
    },
    // 处理触摸开始
    handleTouchStart(e) {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    },
    // 处理触摸移动
    handleTouchMove(e) {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    },
    // 处理键盘事件
    handleKeyDown(e) {
      // 阻止 Ctrl/Cmd +  +/- 缩放
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault()
      }
    },
    // 禁止缩放
    disableZoom() {
      // 阻止鼠标滚轮缩放
      window.addEventListener('wheel', this.handleWheel, { passive: false })
      // 阻止触摸缩放
      window.addEventListener('touchstart', this.handleTouchStart, { passive: false })
      window.addEventListener('touchmove', this.handleTouchMove, { passive: false })
      // 阻止键盘缩放
      window.addEventListener('keydown', this.handleKeyDown, { passive: false })
    },
    // 启用缩放
    enableZoom() {
      window.removeEventListener('wheel', this.handleWheel)
      window.removeEventListener('touchstart', this.handleTouchStart)
      window.removeEventListener('touchmove', this.handleTouchMove)
      window.removeEventListener('keydown', this.handleKeyDown)
    }
  },
  mounted() {
    this.disableZoom()
  },
  beforeDestroy() {
    this.enableZoom()
  }
}
</script>

<style scoped>
</style>