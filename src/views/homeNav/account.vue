<template>
  <div class="account-container">
    <div class="main-content-section">
      <h3 class="section-title">自行利用/处置设施</h3>
      
      <div class="account-tabs-bar">
        <el-tabs v-model="activeAccountTab" class="custom-account-tabs" @tab-click="handleTabClick">
          <el-tab-pane label="产生台账" name="production"></el-tab-pane>
          <el-tab-pane label="入库台账" name="inbound"></el-tab-pane>
          <el-tab-pane label="自行利用处置台账" name="self_use"></el-tab-pane>
          <el-tab-pane label="委外利用处置台账" name="external"></el-tab-pane>
          <el-tab-pane label="自行处置利用台账" name="self_dispose"></el-tab-pane>
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
          :data="paginatedData" 
          style="width: 100%" 
          class="custom-table" 
          height="100%"
        >
          <el-table-column prop="batchCode" :label="batchColumnLabel" min-width="180" />
          <el-table-column prop="wasteName" label="危废名称" min-width="120" />
          <el-table-column prop="wasteCategory" label="危废类别" min-width="140" />
          <el-table-column prop="wasteCode" label="危废代码" min-width="120" />
          <el-table-column prop="amount" label="产生量" min-width="100" />
          <el-table-column prop="unit" label="计量单位" min-width="100" />
          <el-table-column prop="digitalId" label="数字识别码" min-width="240" />
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
export default {
  name: 'AccountPage',
  data() {
    return {
      activeAccountTab: 'production', 
      searchKeyword: '',
      currentPage: 1,
      pageSize: 14,
      totalCount: 0,
      
      // 模拟各台账基础数据
      commonList: [
        { wasteName: '废抹布', wasteCategory: 'HW49 其他废物', wasteCode: '7631-99-4', amount: 4, unit: '吨', digitalId: '9999999999999999A900...' },
        { wasteName: '活性炭', wasteCategory: 'HW49 其他废物', wasteCode: '7631-99-4', amount: 76, unit: '吨', digitalId: '9999999999999999A900...' },
        { wasteName: '废油漆桶', wasteCategory: 'HW49 其他废物', wasteCode: '7631-99-4', amount: 76, unit: '吨', digitalId: '9999999999999999A900...' },
        { wasteName: '废油漆桶', wasteCategory: 'HW49 其他废物', wasteCode: '7631-99-4', amount: 76, unit: '吨', digitalId: '9999999999999999A900...' },
        { wasteName: '废油漆桶', wasteCategory: 'HW49 其他废物', wasteCode: '7631-99-4', amount: 76, unit: '吨', digitalId: '9999999999999999A900...' },
        { wasteName: '废油漆桶', wasteCategory: 'HW49 其他废物', wasteCode: '7631-99-4', amount: 7, unit: '吨', digitalId: '9999999999999999A900...' },
        { wasteName: '废油漆桶', wasteCategory: 'HW49 其他废物', wasteCode: '7631-99-4', amount: 4, unit: '吨', digitalId: '9999999999999999A900...' },
        { wasteName: '废油漆桶', wasteCategory: 'HW49 其他废物', wasteCode: '7631-99-4', amount: 4, unit: '吨', digitalId: '9999999999999999A900...' }
      ]
    }
  },
  computed: {
    // 动态计算当前 Tab 应该显示的表格列标题
    batchColumnLabel() {
      const labelMap = {
        production: '产生批次编码',
        inbound: '入库批次编码',
        self_use: '自行利用/处置批次编码',
        external: '委外利用处置批次编码',
        self_dispose: '自行处置利用批次编码',
        adjust: '调整批次编码',
        cancel: '撤销批次编码'
      };
      return labelMap[this.activeAccountTab];
    },
    // 动态生成带前缀的模拟数据
    currentTableData() {
      const prefixMap = {
        production: 'CS',
        inbound: 'RK',
        self_use: 'LY',
        external: 'WW',
        self_dispose: 'CZ',
        adjust: 'TZ',
        cancel: 'CX'
      };
      const prefix = prefixMap[this.activeAccountTab];
      return this.commonList.map(item => ({
        ...item,
        batchCode: `${prefix}20260106000001`
      }));
    },
    // 分页数据
    paginatedData() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.currentTableData.slice(startIndex, endIndex);
    }
  },
  methods: {
    handleTabClick() {
      this.currentPage = 1;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    }
  },
  mounted() {
    // 初始化总条数，根据表格实际数据计算
    this.totalCount = this.commonList.length;
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
.custom-account-tabs :deep(.el-tabs__header) { margin: 0; border-bottom: none; }
.custom-account-tabs :deep(.el-tabs__nav-wrap::after) { display: none; }
.custom-account-tabs :deep(.el-tabs__active-bar) { display: none; }
.custom-account-tabs :deep(.el-tabs__item) { font-size: 14px; color: #4E5969; padding: 0 20px; height: 32px; line-height: 32px; }
.custom-account-tabs :deep(.el-tabs__item.is-active) { color: #13B63A; background-color: #F2F3F5; border-radius: 16px; font-weight: bold; }

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