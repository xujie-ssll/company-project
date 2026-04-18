<template>
  <div class="account-container">
    <div class="main-content-section">
      <h3 class="section-title">自行利用/处置设施</h3>
      
      <div class="account-tabs-bar">
        <el-tabs v-model="activeAccountTab" class="custom-account-tabs" @tab-click="handleTabClick">
          <el-tab-pane label="产生台账" name="production"></el-tab-pane>
          <el-tab-pane label="入库台账" name="inbound"></el-tab-pane>
          <el-tab-pane label="自行利用处置台账" name="self_use"></el-tab-pane>
          <el-tab-pane label="调整台账" name="adjust"></el-tab-pane>
          <el-tab-pane label="撤销台账" name="cancel"></el-tab-pane>
        </el-tabs>
      </div>

      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索"
          class="search-input"
          prefix-icon="el-icon-search"
          clearable
        />
      </div>

      <div class="table-container">
        <el-table 
          v-loading="loading"
          :data="paginatedData" 
          style="width: 100%" 
          class="custom-table" 
          height="100%"
        >
          <el-table-column prop="cstzbm" :label="batchColumnLabel" min-width="180" />
          <el-table-column prop="fwmc" label="危废名称" min-width="120" />
          <el-table-column prop="fwlx" label="危废类别" min-width="140" />
          <el-table-column prop="fwdm" label="危废代码" min-width="120" />
          <el-table-column prop="csl" label="产生量" min-width="100" />
          <el-table-column prop="jldw" label="计量单位" min-width="100" />
          <el-table-column prop="szsbm" label="数字识别码" min-width="240" />
          <template #empty>
            <div style="padding: 40px 0;">
              <el-empty description="请点击标签页获取数据" />
            </div>
          </template>
        </el-table>
      </div>

      <div class="pagination-container">
        <span class="total-text">共{{ totalCount }}条</span>
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="totalCount"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ledgerApi } from '@/api/index.js'

export default {
  name: 'AccountPage',
  data() {
    return {
      activeAccountTab: 'production', 
      searchKeyword: '',
      currentPage: 1,
      pageSize: 14,
      totalCount: 0,
      tableData: [],
      loading: false
    }
  },
  computed: {
    // 动态计算当前 Tab 应该显示的表格列标题
    batchColumnLabel() {
      const labelMap = {
        production: '产生批次编码',
        inbound: '入库批次编码',
        self_use: '自行利用/处置批次编码',
        adjust: '调整批次编码',
        cancel: '撤销批次编码'
      };
      return labelMap[this.activeAccountTab];
    },
    // 分页数据
    paginatedData() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.tableData.slice(startIndex, endIndex);
    }
  },
  methods: {
    handleTabClick() {
      this.currentPage = 1;
      this.fetchAccountData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    // 获取台账数据
    fetchAccountData() {
      this.loading = true;
      const params = {
        current: this.currentPage,
        size: this.pageSize,
        sorted: [
          { name: "createTime", type: "DESC" }
        ]
      };
      
      let apiMethod;
      switch (this.activeAccountTab) {
        case 'production':
          apiMethod = ledgerApi.productionData;
          break;
        case 'inbound':
          apiMethod = ledgerApi.storageData;
          break;
        case 'self_use':
          apiMethod = ledgerApi.disposeData;
          break;
        case 'adjust':
          apiMethod = ledgerApi.inventoryData;
          break;
        case 'cancel':
          apiMethod = ledgerApi.cancelData;
          break;
        default:
          apiMethod = ledgerApi.productionData;
      }
      
      apiMethod(params).then(res => {
        const data = res.result || res.data;
        if (data) {
          this.tableData = data.records || [];
          this.totalCount = data.total || 0;
        }
      }).catch(err => {
        console.error('获取台账数据失败', err);
      }).finally(() => {
        this.loading = false;
      });
    }
  },
  mounted() {
    // 页面加载时不自动获取数据，仅在点击标签页时获取
  }
}
</script>

<style scoped>
.account-container {
  height: calc(100vh - 62px); 
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 24px;
  box-sizing: border-box;
}

.section-title { font-size: 16px; font-weight: bold; color: #1D2129; margin-bottom: 20px; }
.account-tabs-bar { margin-bottom: 16px; }
.custom-account-tabs :deep(.el-tabs) {
  border-bottom: none !important;
  box-shadow: none !important;
}

.custom-account-tabs :deep(.el-tabs__header) {
  margin-bottom: 0 !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

.custom-account-tabs :deep(.el-tabs__nav-wrap) {
  border-bottom: none !important;
  box-shadow: none !important;
}

.custom-account-tabs :deep(.el-tabs__nav) {
  border-bottom: none !important;
  box-shadow: none !important;
}

.custom-account-tabs :deep(.el-tabs__item) {
  padding: 5px 16px !important;
  border-radius: 0 !important;
  margin-right: 10px !important;
  min-width: 74px !important;
  height: 32px !important;
  line-height: 22px !important;
  opacity: 1 !important;
  background: transparent !important;
  color: #606266 !important;
  transition: all 0.3s ease !important;
  border: none !important;
  box-shadow: none !important;
  text-align: center;
}

.custom-account-tabs :deep(.el-tabs__item.is-active) {
  padding: 5px 16px !important;
  border-radius: 100px !important;
  background: #F2F3F5 !important;
  color: #13B63A !important;
  font-weight: 500 !important;
  border: 1px solid #E4E7ED !important;
  box-shadow: none !important;
  text-align: center;
}

.custom-account-tabs :deep(.el-tabs__active-bar) {
  display: none !important;
}

.search-bar { margin-bottom: 20px; }
.search-input { width: 240px; }
.search-input :deep(.el-input__inner) { background-color: #F2F3F5; border: none; height: 32px; line-height: 32px; border-radius: 16px; }

.table-container { flex: 1; overflow: hidden; margin-bottom: 16px; }
.custom-table :deep(.el-table__header th) { background-color: #F2F3F5; color: #4E5969; font-weight: 500; height: 32px; padding: 0; }
.custom-table :deep(.el-table__row) { height: 32px; }
.custom-table :deep(.el-table__cell) { padding: 0 12px; font-size: 12px; }

.pagination-container { display: flex; justify-content: flex-end; align-items: center; }
.total-text { font-size: 14px; color: #4E5969; margin-right: 16px; }
</style>