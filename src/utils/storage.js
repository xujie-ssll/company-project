// 本地存储工具类
const StorageUtil = {
  // 获取项目
  getItem(key) {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('获取本地存储失败:', error)
      return null
    }
  },

  // 同步获取项目
  getItemSync(key) {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('获取本地存储失败:', error)
      return null
    }
  },

  // 设置项目
  setItem(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('设置本地存储失败:', error)
    }
  },

  // 移除项目
  removeItem(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('移除本地存储失败:', error)
    }
  },

  // 清空所有项目
  clear() {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('清空本地存储失败:', error)
    }
  }
}

export default StorageUtil
