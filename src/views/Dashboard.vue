<template>
  <div class="dashboard-container">
    <!-- 背景图片层 -->
    <div class="bg-layer"></div>
    
    <!-- 内容容器 -->
    <div class="content-wrapper">
      <!-- 左侧导航栏 -->
      <div class="sidebar">

        
        <div class="nav-menu">
          <div 
            v-for="item in menuList" 
            :key="item.key" 
            class="nav-item" 
            :class="{ active: activeMenu === item.key }"
            @click="handleMenuClick(item.key)"
          >
            <img :src="item.icon" :alt="item.name" class="nav-icon" />
            <span class="nav-text">{{ item.name }}</span>
          </div>
        </div>
      </div>
      
      <!-- 右侧内容区域 -->
      <div class="right-content">
        <!-- 仪表盘视图 -->
        <div v-if="currentView === 'dashboard'">
          <!-- 右上响应区域 - 包含标题、卡片和图片 -->
          <div class="responsive-top-area">
            <!-- 标题放在右侧内容区域顶部 -->
            <div class="title-row">
              <span class="title-text">{{ defaultData.factoryName }}</span>
            </div>
            
            <!-- 卡片和图片区域（同一水平线，垂直居中） -->
            <div class="cards-image-container">
              <div class="cards-container">
                <div class="stat-card">
                  <div class="stat-value">{{ defaultData.storageVolume }}</div>
                  <div class="stat-label">存储量 (t)</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value total">{{ defaultData.totalStorageVolume }}</div>
                  <div class="stat-label">总贮存量 (t)</div>
                </div>
              </div>
              <div class="image-area">
                <img src="@/assets/weifei 1.png" alt="illustration" class="illustration" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- 个人中心视图 -->
        <div v-else-if="currentView === 'personal'" class="personal-view">
          <Personal />
        </div>
        
        <!-- 库存菜单视图 -->
        <div v-else-if="currentView === 'inventory'" class="inventory-view">
          <!-- 内容区域（最上层） -->
          <div class="bottom-section">
            <InventoryPage />
          </div>
        </div>
        
        <!-- 其他菜单视图 -->
        <div v-else-if="currentView === 'production' || currentView === 'inbound' || currentView === 'outbound' || currentView === 'selfuse' || currentView === 'linkorder' || currentView === 'account'">
          <!-- 下半部分 -->
          <div class="bottom-section">
            <!-- 产生菜单视图 -->
            <ProductionPage v-if="currentView === 'production'" />
            <!-- 入库菜单视图 -->
            <InboundPage v-else-if="currentView === 'inbound'" />
            <!-- 出库菜单视图 -->
            <OutboundPage v-else-if="currentView === 'outbound'" />
            <!-- 自行利用菜单视图 -->
            <SelfusePage v-else-if="currentView === 'selfuse'" />
            <!-- 联单菜单视图 -->
            <LinkorderPage v-else-if="currentView === 'linkorder'" />
            <!-- 台账菜单视图 -->
            <AccountPage v-else-if="currentView === 'account'" />
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="400px">
      <div class="dialog-content">
        <p>当前操作：{{ dialogTitle }}</p>
        <p>数据名称：{{ currentItem?.name || '数据' }}</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAction">确认</el-button>
      </span>
    </el-dialog>
    
    <!-- 禁止缩放组件 -->
    <DisableZoom />
  </div>
</template>

<script>
import { Message } from 'element-ui'
import DisableZoom from '@/components/DisableZoom.vue'
import Personal from './homeNav/personal.vue'
import InventoryPage from './homeNav/inventory.vue'
import ProductionPage from './homeNav/production.vue'
import InboundPage from './homeNav/inbound.vue'
import OutboundPage from './homeNav/outbound.vue'
import SelfusePage from './homeNav/selfuse.vue'
import LinkorderPage from './homeNav/linkorder.vue'
import AccountPage from './homeNav/account.vue'

export default {
  name: 'DashboardPage',
  components: {
    DisableZoom,
    Personal,
    InventoryPage,
    ProductionPage,
    InboundPage,
    OutboundPage,
    SelfusePage,
    LinkorderPage,
    AccountPage
  },
  data() {
    return {
      activeMenu: 'personal',
    currentView: 'personal', // dashboard or personal
      currentTab: 'basic', // basic, unit, business, agent, iot
      dialogVisible: false,
      dialogTitle: '',
      currentItem: null,
      productionDate: '',
      inboundDate: '',
      selectedCount: 2,
      totalCount: 50,
      defaultData: {
        factoryName: '东川污水处理厂',
        storageVolume: '23.6',
        totalStorageVolume: '100.4'
      },
      menuList: [
        { key: 'personal', name: '个人中心', icon: require('@/assets/avatar.png') },
        { key: 'inventory', name: '库存', icon: require('@/assets/inventory.png') },
        { key: 'production', name: '产生', icon: require('@/assets/production.png') },
        { key: 'inbound', name: '入库', icon: require('@/assets/inbound.png') },
        { key: 'outbound', name: '出库', icon: require('@/assets/outbound.png') },
        { key: 'selfuse', name: '自行利用', icon: require('@/assets/selfuse.png') },
        { key: 'linkorder', name: '联单', icon: require('@/assets/linkorder.png') },
        { key: 'account', name: '台账', icon: require('@/assets/account.png') }
      ],
      tableData: [
        { name: '废抹布', code: '7531-99-4', id: '99999999999999990044149001', amount: 5, unit: '吨' },
        { name: '活性炭', code: '7531-99-4', id: '99999999999999990044149001', amount: 100, unit: '吨' },
        { name: '废油桶', code: '7531-99-4', id: '99999999999999990044149001', amount: 4, unit: '吨' },
        { name: '废油桶', code: '7531-99-4', id: '99999999999999990044149001', amount: 4, unit: '吨' },
        { name: '废油桶', code: '7531-99-4', id: '99999999999999990044149001', amount: 3, unit: '吨' },
        { name: '废油桶', code: '7531-99-4', id: '99999999999999990044149001', amount: 12, unit: '吨' }
      ]
    }
  },
  methods: {
    handleMenuClick(menuKey) {
      this.activeMenu = menuKey
      if (menuKey === 'personal') {
        this.currentView = 'personal' // 点击个人中心时，显示个人中心页面
      } else if (menuKey === 'inventory') {
        this.currentView = 'inventory' // 点击库存菜单时，显示库存菜单页面
      } else if (menuKey === 'production') {
        this.currentView = 'production' // 点击产生菜单时，显示产生菜单页面
      } else if (menuKey === 'inbound') {
        this.currentView = 'inbound' // 点击入库菜单时，显示入库菜单页面
      } else if (menuKey === 'outbound') {
        this.currentView = 'outbound' // 点击出库菜单时，显示出库菜单页面
      } else if (menuKey === 'selfuse') {
        this.currentView = 'selfuse' // 点击自行利用菜单时，显示自行利用菜单页面
      } else if (menuKey === 'linkorder') {
        this.currentView = 'linkorder' // 点击联单菜单时，显示联单菜单页面
      } else if (menuKey === 'account') {
        this.currentView = 'account' // 点击台账菜单时，显示台账菜单页面
      } else {
        this.currentView = 'dashboard' // 点击其他导航栏时，恢复到仪表盘视图
      }
    },
    handleTag(item) {
      this.currentItem = item
      this.dialogTitle = '标签操作'
      this.dialogVisible = true
    },
    handleAdjust(item) {
      this.currentItem = item
      this.dialogTitle = '调整操作'
      this.dialogVisible = true
    },
    handlePrint(item) {
      this.currentItem = item
      this.dialogTitle = '打印操作'
      this.dialogVisible = true
    },
    confirmAction() {
      Message.success(`${this.dialogTitle}成功：${this.currentItem?.name || '数据'}`)
      this.dialogVisible = false
    },

    handleTabClick(tab) {
      this.currentTab = tab
    },
    openDatePicker(e) {
      // 创建一个临时的日期输入元素
      const tempInput = document.createElement('input')
      tempInput.type = 'date'
      tempInput.style.position = 'absolute'
      tempInput.style.left = '-9999px'
      document.body.appendChild(tempInput)
      
      // 触发日期选择器
      tempInput.focus()
      
      // 监听日期变化
      tempInput.addEventListener('change', (event) => {
        e.target.value = event.target.value
        document.body.removeChild(tempInput)
      })
      
      // 监听点击外部关闭
      tempInput.addEventListener('blur', () => {
        setTimeout(() => {
          if (document.body.contains(tempInput)) {
            document.body.removeChild(tempInput)
          }
        }, 200)
      })
      
      // 触发点击事件以显示日期选择器
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
      tempInput.dispatchEvent(event)
    },
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: #1E253D;
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
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
  overflow: hidden;
}

/* ========== 左侧导航栏 ========== */
.sidebar {
  width: 128px;
  height: 100%;
  background: #13B63A;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  margin: 16px 0 16px 16px;
  flex-shrink: 0;
  overflow: visible;
}



.nav-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 0;
  flex: 1;
  justify-content: space-evenly;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 128px;
  height: 80px;
  padding: 0;
  border-radius: 0;
  transition: all 0.2s;
  margin: 0;
}

.nav-item.active {
  background: #0EA231;
  border-radius: 20px;
  opacity: 1;
}

.nav-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.nav-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-top: 6px;
  text-align: center;
}

.nav-item.active .nav-text {
  color: #FFFFFF;
  font-weight: 500;
}

/* ========== 右侧内容区域 ========== */
.right-content {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 15px 5px;
  gap: 20px;
  overflow: hidden;
  background: transparent;
  border-radius: 24px;
  margin: 16px 16px 16px 0;
  min-width: 0;
}

.inventory-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-height: 0;
  position: relative;
}

.personal-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  position: relative;
  width: 100%;
  flex: 1;
}

/* 右上响应区域 - 包含标题、卡片和图片 */
.responsive-top-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 1;
  min-height: 0;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* 标题行 - 在右侧内容区域顶部 */
.title-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  width: 100%;
  justify-content: flex-start;
}

.title-text {
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
  color: #1E253D;
}

.switch-icon {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* 卡片和图片区域 - 同一水平线，垂直居中 */
.cards-image-container {
  position: relative;
  width: 100%;
  height: 353px;
  background: transparent;
  flex-shrink: 0;
  flex-direction: column;
  align-items: flex-start;
}

.cards-container {
  position: absolute;
  width: 799px;
  height: 416px;
  top: -112px;
  left: -9px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: transparent;
  padding: 8px 16px;
}

.stat-value {
  font-family: 'DingTalk JinBuTi', 'Microsoft YaHei', sans-serif;
  font-weight: 400;
  font-size: 24px;
  line-height: 24px;
  color: #13B63A;
  margin-bottom: 4px;
}

.stat-value.total {
  color: #34C759;
}

.stat-label {
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #717782;
}

.image-area {
  position: absolute;
  width: 531px;
  height: 353px;
  top: -8px;
  left: 412px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.illustration {
  width: 100%;
  height: 100%;
  object-fit: contain;
}


.query-bar {
  flex-shrink: 0;
  background: white;
  border-radius: 16px 16px 0 0;
  padding: 16px 20px;
  position: relative;
}

.query-table-title {
  font-family: Microsoft YaHei;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  letter-spacing: 0%;
  background: transparent;
  color: #1D2129;
  padding: 0 8px;
  margin-bottom: 16px;
  display: inline-block;
}

.query-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  width: 100%;
  justify-content: space-between;
}

.query-buttons {
  margin-left: auto;
}

.query-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.query-item label {
  font-family: Microsoft YaHei;
  font-weight: 400;
  font-size: 12px;
  line-height: 22px;
  color: #717782;
  margin: 0;
  white-space: nowrap;
}

.custom-date-input {
  width: 116px !important;
  height: 20px !important;
  opacity: 1 !important;
  display: inline-flex !important;
  align-items: center !important;
    position: relative;
  display: inline-block;
}

.date-input-custom {
  width: 120px;
  height: 24px;
  padding: 2px 32px 2px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 2px;
  font-size: 12px;
  background: #F2F3F5;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.calendar-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  pointer-events: none;
  z-index: 2;
}

/* 自定义日期选择器样式 */
.custom-date-picker {
  width: 150px !important;
  height: 24px !important;
  opacity: 1 !important;
}

.custom-date-picker .el-input__wrapper {
  padding: 0 4px 0 8px;
  display: inline-flex;
  align-items: center;
}
.custom-date-picker .el-input {
  display: inline-flex;
  align-items: center;
}

/* 日期选择器输入框样式 */
.custom-date-picker .el-input__inner {
  height: 24px !important;
  line-height: 24px !important;
  padding: 0 32px 0 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  vertical-align: middle !important;
}

/* 日期选择器弹出框样式 */
.el-picker-panel {
  width: 280px !important;
  height: 356px !important;
  border-radius: 4px !important;
  border: 1px solid #E5E7EB !important;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1) !important;
  opacity: 1 !important;
}

/* 隐藏默认日期选择器图标，只显示自定义图标 */
.date-input-custom::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 3;
}

.query-select {
  width: 120px;
  height: 24px;
  padding: 2px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 2px;
  font-size: 12px;
  background: #F2F3F5;
  vertical-align: middle;
}

.query-buttons {
  display: flex;
  gap: 18px;
  align-items: center;
}

.query-btn, .reset-btn {
  height: 24px;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
}

.query-btn {
  background: #13B63A;
  color: white;
  border: none;
}

.reset-btn {
  background: #F2F3F5;
  color: #717782;
  border: 1px solid #E5E7EB;
}

.btn-icon, .reset-btn-icon {
  width: 10px;
  height: 10px;
}

.batch-search-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.batch-print-btn {
  width: 88px;
  height: 28px;
  border-radius: 2px;
  font-size: 14px;
  color: white;
  background: #13B63A;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.search-box {
  display: flex;
  align-items: center;
}

.search-input {
  width: 180px;
  height: 28px;
  padding: 0 12px;
  border: 1px solid #E5E7EB;
  border-right: none;
  border-radius: 2px 0 0 2px;
  font-size: 12px;
  background: white;
}

.search-icon-btn {
  width: 32px;
  height: 28px;
  border: 1px solid #E5E7EB;
  border-left: none;
  border-radius: 0 2px 2px 0;
  background: #F3F4F6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn-icon {
  width: 10px;
  height: 10px;
}

.content-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  background: white;
  border-radius: 0 0 16px 16px;
  margin-top: -16px;
}

.content-scroll-area::-webkit-scrollbar {
  width: 6px;
}

.content-scroll-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.content-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.content-panel {
  background: white;
  padding: 20px;
}

/* 库存表格样式 */
.inventory-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.inventory-table th,
.inventory-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #E5E7EB;
}

.inventory-table th {
  background-color: #F9FAFB;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #1D2129;
}

.inventory-table td {
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-size: 14px;
  color: #1D2129;
}

.inventory-table input[type="checkbox"] {
  margin: 0;
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  gap: 8px;
}

.operation-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 2px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.operation-btn:hover {
  background: #F3F4F6;
}

.tag-btn {
  color: #13B63A;
  border-color: #13B63A;
}

.adjust-btn {
  color: #3B82F6;
  border-color: #3B82F6;
}

.print-btn {
  color: #F59E0B;
  border-color: #F59E0B;
}

/* 分页样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-size: 14px;
  color: #717782;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 2px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover {
  background: #F3F4F6;
}

.page-btn.active {
  background: #13B63A;
  color: white;
  border-color: #13B63A;
}

.page-input {
  width: 40px;
  height: 24px;
  padding: 0 8px;
  border: 1px solid #E5E7EB;
  border-radius: 2px;
  font-size: 12px;
  text-align: center;
}

/* 个人中心样式 */
.personal-center {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  border-radius: 24px;
  overflow: hidden;
  min-height: 0;
}

.user-info-header,
.tab-container {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}



.personal-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 用户信息头部 */
.user-info-header {
  display: flex;
  align-items: flex-start;
  background: #F9FAFB;
  padding: 30px;
  border-radius: 24px;
  margin-bottom: 20px;
  gap: 20px;
  height: 140px;
  box-sizing: border-box;
}

.auth-info {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  text-align: right;
  max-width: 300px;
  flex-shrink: 1;
  overflow: hidden;
}

/* 标签页导航和内容容器 */
.tab-container {
  height: 568px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 24px;
  color: #717782;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-name, .user-job {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-size: 14px;
  flex-wrap: wrap;
}

.user-company {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-size: 14px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.company-name {
  color: #1D2129;
  font-weight: 500;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-name span:first-child,
.user-job span:first-child,
.user-company span:first-child {
  color: #717782;
}

.user-name span:last-child,
.user-job span:last-child {
  color: #1D2129;
  font-weight: 500;
}

.company-name {
  color: #1D2129;
  font-weight: 500;
}

.verified {
  color: #13B63A;
  font-size: 12px;
  padding: 2px 8px;
  border: 1px solid #13B63A;
  border-radius: 10px;
  margin-left: 8px;
}

.system-authorization {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-size: 14px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.system-authorization span:first-child {
  color: #717782;
}

.auth-status {
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-size: 14px;
  color: #F56C6C;
}

.auth-status.completed {
  color: #13B63A;
}

.auth-btn {
  padding: 4px 12px;
  font-size: 12px;
  color: #13B63A;
  background: none;
  border: 1px solid #13B63A;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-btn:hover {
  background: #13B63A;
  color: white;
}

/* 标签页导航 */
.tab-navigation {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 20px;
}

.tab-item {
  padding: 12px 20px;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-size: 14px;
  color: #717782;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-item:hover {
  color: #13B63A;
}

.tab-item.active {
  color: #13B63A;
  border-bottom-color: #13B63A;
  font-weight: 500;
}

/* 标签页内容 */
.tab-content {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 20px;
  min-height: 300px;
}

.tab-content .info-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #F0F2F5;
}

.tab-content .info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.tab-content .info-item label {
  width: 100px;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-size: 14px;
  color: #717782;
  flex-shrink: 0;
}

.tab-content .info-item span {
  flex: 1;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  font-size: 14px;
  color: #1D2129;
  margin-right: 16px;
}

.modify-btn {
  padding: 4px 12px;
  font-size: 12px;
  color: #13B63A;
  background: none;
  border: 1px solid #13B63A;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.modify-btn:hover {
  background: #13B63A;
  color: white;
}

/* 响应式 */
@media (max-width: 768px) {
  .sidebar {
    width: 100px;
  }
  .nav-item {
    width: 100px;
    height: 70px;
  }
  .right-content {
    padding: 12px 16px;
  }
  .image-area {
    width: 100%;
    height: auto;
  }
  .user-profile {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-avatar {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-item label {
    width: 100%;
    margin-bottom: 4px;
  }
}
</style>