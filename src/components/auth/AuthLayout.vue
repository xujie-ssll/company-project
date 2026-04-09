<!-- AuthLayout.vue -->
<template>
  <div class="login-container">
    <div class="bg-layer"></div>
    
    <!-- 移除 content-wrapper 的缩放，改为让整体容器缩放 -->
    <div class="content-wrapper">
      <!-- 左侧区域 -->
      <div class="left-area">
        <div class="company-icon">
          <img src="@/assets/logo.png" alt="logo" />
        </div>
        <div class="company-name">优特危废全国系统</div>
        <div class="center-image">
          <img src="@/assets/weifei 1.png" alt="illustration" />
        </div>
        <div class="slogan">优特科保  智享未来</div>
      </div>

      <!-- 右侧区域 -->
      <div class="right-area">
        <slot name="right"></slot>
      </div>
    </div>
    
    <DisableZoom />
  </div>
</template>

<script>
import DisableZoom from '@/components/DisableZoom.vue'

export default {
  name: 'AuthLayout',
  components: {
    DisableZoom
  },
  props: {
    scale: {
      type: Number,
      default: 1
    }
  },
  computed: {
    wrapperStyle() {
      return {
        transform: `scale(${this.scale})`,
        transformOrigin: 'center center'
      }
    }
  }
}
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  width: 100vw;
  height: 100vh;
  background: #1E253D;
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  overflow: hidden;
  margin: 0;
  padding: 0;
  /* 关键：将缩放应用到整个容器 */
  transform: scale(var(--scale, 1));
  transform-origin: center center;
}

.bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/backImg.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 0;
}

.content-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  max-width: none;
}

.left-area {
  flex: 1;
  min-width: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  pointer-events: none;
}

.right-area {
  flex: 0 0 37.5%;
  background: rgba(255, 255, 255, 0.5);
  border-left: 1px solid #FFFFFF;
  backdrop-filter: blur(2px);
  padding: 40px 32px;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  min-width: 300px;
}

/* 当浏览器窗口较宽时，限制右侧区域最大宽度 */
@media (min-width: 1400px) {
  .right-area {
    max-width: 500px;
  }
}

/* 当浏览器窗口较窄时，让右侧区域占更多比例 */
@media (max-width: 900px) {
  .right-area {
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .right-area {
    max-width: 100%;
    min-width: auto;
  }
}

.company-icon {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 124px;
  height: 35px;
  z-index: 2;
}
.company-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.company-name {
  position: absolute;
  top: 60px;
  left: 20px;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 22px;
  letter-spacing: 0.35em;
  color: #1E253D;
  white-space: nowrap;
  z-index: 2;
}

.center-image {
  width: 100%;
  max-width: 640px;
  max-height: 414px;
  z-index: 1;
}
.center-image img {
  width: 100%;
  height: auto;
  max-height: 100%;
  object-fit: contain;
}

.slogan {
  margin-top: 20px;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  letter-spacing: 0.35em;
  text-align: center;
  color: #1E253D;
  white-space: nowrap;
  z-index: 2;
}

/* 移除之前对 .login-container 的媒体查询缩放，因为现在用 JS 控制 scale */
</style>