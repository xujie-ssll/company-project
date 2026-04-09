<template>
  <div class="self-use-container">
    <div class="query-section">
      <h3 class="section-title">查询表格</h3>
      <div class="query-form">
        <div class="query-item">
          <label>日期</label>
          <el-date-picker
            v-model="queryDate"
            type="date"
            placeholder="请选择日期"
            class="custom-date-picker"
            :editable="false"
          />
        </div>
        <div class="query-item">
          <label>处置类型</label>
          <el-select v-model="disposeType" placeholder="全部" class="custom-select">
            <el-option label="全部" value="" />
            <el-option label="自行利用" value="self_use" />
            <el-option label="自行处置" value="self_dispose" />
          </el-select>
        </div>
        <div class="query-buttons">
          <el-button type="primary" class="btn-search" @click="handleQuery">
            <i class="el-icon-search"></i> 查询
          </el-button>
          <el-button class="btn-reset" @click="handleReset">
            <i class="el-icon-refresh"></i> 重置
          </el-button>
        </div>
      </div>
    </div>

    <div class="main-content-section">
      <h3 class="section-title">自行利用/处置设施</h3>
      
      <div class="action-bar">
        <el-tabs v-model="activeTab" class="custom-tabs" @tab-click="handleTabClick">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane label="储存罐" name="tank"></el-tab-pane>
          <el-tab-pane label="危废库" name="library"></el-tab-pane>
          <el-tab-pane label="危废区" name="area"></el-tab-pane>
        </el-tabs>
        
        <div class="right-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索"
            class="search-input"
            prefix-icon="el-icon-search"
            clearable
          />
          <el-button type="success" class="btn-add" @click="handleAddDispose">
            添加危废处置单
          </el-button>
        </div>
      </div>

      <div class="table-container">
        <el-table :data="paginatedData" style="width: 100%" class="custom-table" height="100%">
          <el-table-column prop="batchCode" label="自行利用/处置批次编码" min-width="180" />
          <el-table-column prop="facility" label="自行利用/处置设施" min-width="150" />
          <el-table-column prop="outAgent" label="出库部门经办人" min-width="130" />
          <el-table-column prop="disposeAgent" label="自行利用/处置部门经办人" min-width="180" />
          <el-table-column prop="transportAgent" label="运送部门经办人" min-width="130" />
          <el-table-column prop="status" label="状态" min-width="100">
            <template slot-scope="scope">
              <div class="status-cell">
                <span :class="['status-dot', scope.row.status === '已申报' ? 'dot-success' : 'dot-danger']"></span>
                <span>{{ scope.row.status }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="160" align="right">
            <template slot-scope="scope">
              <div class="action-links">
                <template v-if="scope.row.status === '未申报'">
                  <el-button type="text" class="text-danger" @click="handleDelete(scope.row)">删除</el-button>
                  <el-button type="text" class="text-warning" @click="handleModify(scope.row)">修改</el-button>
                  <el-button type="text" class="text-success" @click="handleDeclare(scope.row)">申报</el-button>
                </template>
                <template v-else>
                  <el-button type="text" class="text-danger" @click="handleCancel(scope.row)">撤销</el-button>
                  <el-button type="text" class="text-success" @click="handleDetail(scope.row)">详情</el-button>
                </template>
              </div>
            </template>
          </el-table-column>
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

    <el-drawer
      title="添加危废处置单"
      :visible.sync="drawerVisible"
      size="900px"
      custom-class="add-dispose-drawer"
      :wrapper-closable="false"
      append-to-body
    >
      <div class="drawer-container">
        <div class="drawer-content">
          <div class="form-section">
            <h4 class="section-subtitle">填写信息</h4>
            <div class="form-row">
              <div class="form-item">
                <label>自行利用/处置类型</label>
                <el-select v-model="addForm.type" placeholder="请选择" class="drawer-select">
                  <el-option label="类型A" value="A" />
                </el-select>
              </div>
              <div class="form-item">
                <label>自行利用/处置类型设施</label>
                <el-select v-model="addForm.facility" placeholder="请选择" class="drawer-select">
                  <el-option label="设施01" value="01" />
                </el-select>
              </div>
              <div class="form-item">
                <label>自行利用/处置部门经办人</label>
                <el-select v-model="addForm.disposeAgent" placeholder="请选择" class="drawer-select">
                  <el-option label="经办人A" value="A" />
                </el-select>
              </div>
            </div>
            <div class="form-row mt-16">
              <div class="form-item max-w-33">
                <label>出库部门经办人</label>
                <el-select v-model="addForm.outAgent" placeholder="请选择" class="drawer-select">
                  <el-option label="经办人B" value="B" />
                </el-select>
              </div>
              <div class="form-item max-w-33">
                <label>运送部门经办人</label>
                <el-select v-model="addForm.transportAgent" placeholder="请选择" class="drawer-select">
                  <el-option label="经办人C" value="C" />
                </el-select>
              </div>
              <div class="form-item"></div>
            </div>
          </div>

          <div class="associate-section">
            <div class="associate-header">
              <h4 class="section-subtitle">关联添加</h4>
              <el-button class="btn-scan" plain>
                <i class="el-icon-full-screen"></i> 扫码添加
              </el-button>
            </div>

            <el-table
              :data="associateData"
              style="width: 100%"
              class="associate-table"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55" align="center"></el-table-column>
              <el-table-column prop="prodNo" label="生产设施编号" min-width="110"></el-table-column>
              <el-table-column prop="wasteName" label="危废名称" min-width="100"></el-table-column>
              <el-table-column prop="wasteCode" label="危废代码" min-width="100"></el-table-column>
              <el-table-column prop="digitalId" label="数字识别码" min-width="220"></el-table-column>
              <el-table-column label="标签信息" min-width="80">
                <template>
                  <span class="text-success cursor-pointer">查看标签</span>
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="产生量" min-width="80"></el-table-column>
            </el-table>

            <div class="drawer-pagination-wrapper">
              <div class="selected-info">
                已选{{ selectedRows.length }}条 <span class="gap">共{{ drawerTotal }}条</span>
              </div>
              <el-pagination
                background
                layout="total, prev, pager, next, jumper"
                :total="drawerTotal"
                :page-size="drawerPageSize"
                :current-page="drawerCurrentPage"
                @current-change="handleDrawerCurrentChange"
              />
            </div>
          </div>
        </div>

        <div class="drawer-footer">
          <el-button @click="drawerVisible = false" class="btn-drawer-save">保存</el-button>
          <el-button type="success" @click="handleDrawerSubmit" class="btn-drawer-submit">确定申报</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'SelfUsePage',
  data() {
    return {
      queryDate: '',
      disposeType: '',
      activeTab: 'area',
      searchKeyword: '',
      
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      tableData: [
        { id: 1, batchCode: '-', facility: '90999', outAgent: '张某', disposeAgent: '李某', transportAgent: '王某', status: '未申报' },
        { id: 2, batchCode: '-', facility: '90999', outAgent: '张某', disposeAgent: '李某', transportAgent: '王某', status: '未申报' },
        { id: 3, batchCode: 'ZX20260106000001', facility: '90999', outAgent: '张某', disposeAgent: '李某', transportAgent: '王某', status: '已申报' },
        { id: 4, batchCode: 'ZX20260106000001', facility: '90999', outAgent: '张某', disposeAgent: '李某', transportAgent: '王某', status: '已申报' }
      ],

      drawerVisible: false,
      addForm: {
        type: '',
        facility: '',
        disposeAgent: '',
        outAgent: '',
        transportAgent: ''
      },
      associateData: [
        { id: 1, prodNo: '001', wasteName: '废抹布', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', amount: 4 },
        { id: 2, prodNo: '001', wasteName: '活性炭', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', amount: 76 }
      ],
      selectedRows: [],
      drawerCurrentPage: 1,
      drawerPageSize: 10,
      drawerTotal: 0
    }
  },
  computed: {
    paginatedData() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.tableData.slice(startIndex, endIndex);
    }
  },
  mounted() {
    // 初始化总条数，根据表格实际数据计算
    this.totalCount = this.tableData.length;
    this.drawerTotal = this.associateData.length;
  },
  methods: {
    handleQuery() { this.$message.success('查询成功'); },
    handleReset() {
      this.queryDate = '';
      this.disposeType = '';
      this.searchKeyword = '';
    },
    handleTabClick() {},
    handleCurrentChange(val) { this.currentPage = val; },
    handleDelete(row) {
      this.$confirm('确定要删除吗?', '提示', { type: 'warning' }).then(() => {
        const index = this.tableData.findIndex(item => item.id === row.id);
        this.tableData.splice(index, 1);
        this.totalCount = this.tableData.length;
        this.$message.success('删除成功');
      });
    },
    handleModify() { this.$message.warning('修改功能开发中'); },
    handleDeclare(row) {
      row.status = '已申报';
      row.batchCode = 'ZX' + Date.now();
      this.$message.success('申报成功');
    },
    handleCancel(row) {
      row.status = '未申报';
      row.batchCode = '-';
    },
    handleDetail(row) { this.$message.info(`详情ID: ${row.id}`); },

    handleAddDispose() { this.drawerVisible = true; },
    handleSelectionChange(val) { this.selectedRows = val; },
    handleDrawerCurrentChange(val) { this.drawerCurrentPage = val; },
    handleDrawerSubmit() {
      if (this.selectedRows.length === 0) return this.$message.warning('请选择关联项');
      
      const newEntry = {
        id: Date.now(),
        batchCode: '-',
        facility: '90999',
        outAgent: '当前经办人',
        disposeAgent: '处置经办人',
        transportAgent: '运送经办人',
        status: '未申报'
      };
      this.tableData.unshift(newEntry);
      this.totalCount = this.tableData.length;
      this.drawerVisible = false;
      this.$message.success('新增处置单成功');
    }
  }
}
</script>

<style scoped>
.self-use-container {
  height: calc(100vh - 62px); 
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 24px;
  box-sizing: border-box;
}

.section-title { font-size: 16px; font-weight: bold; color: #1D2129; margin: 0 0 16px 0; }
.query-section { border-bottom: 1px solid #F2F3F5; padding-bottom: 20px; margin-bottom: 20px; }
.query-form { display: flex; align-items: center; gap: 24px; }
.query-item { display: flex; align-items: center; gap: 12px; }
.query-item label { font-size: 14px; color: #4E5969; }

.custom-date-picker, .custom-select { width: 200px !important;height: 24px !important; }
:deep(.el-input__inner)  { 
  background-color: #F2F3F5 !important;
  border: 1px solid transparent !important;
  height: 24px !important; 
  line-height: 20px !important;
  font-size: 12px !important;
  color: #1D2129 !important;
}

.custom-date-picker :deep(.el-input__inner) {
  padding-left: 30px !important;
  padding-right: 15px !important;
}

.custom-date-picker :deep(.el-input__inner:focus),
.custom-select :deep(.el-input__inner:focus) {
  background-color: #FFFFFF !important;
  border-color: #13B63A !important;
}

/* 图标样式调整 */
.custom-date-picker :deep(.el-input__prefix),
.custom-date-picker :deep(.el-input__suffix) {
  display: flex !important;
  align-items: center !important; 
  height: 24px !important; 
  top: 0 !important;
}

.custom-date-picker :deep(.el-input__icon) {
  line-height: normal !important; 
  height: auto !important;
  width: 25px !important; 
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 下拉框图标缩放 */
.custom-select :deep(.el-select__caret) {
  transform: scale(0.85);
}

.btn-search { background-color: #13B63A !important; border-color: #13B63A !important; height: 32px; }
.btn-reset { background-color: #F2F3F5 !important; border: none; color: #4E5969; height: 32px; }

.action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.custom-tabs :deep(.el-tabs__header) { margin: 0; border-bottom: none; }
.custom-tabs :deep(.el-tabs__item.is-active) { color: #13B63A; background-color: #F2F3F5; border-radius: 16px; font-weight: bold; }
.custom-tabs :deep(.el-tabs__active-bar), .custom-tabs :deep(.el-tabs__nav-wrap::after) { display: none; }

.search-input { width: 220px; }
.search-input :deep(.el-input__inner) { border-radius: 16px; }
.btn-add { background-color: #13B63A !important; border: none; height: 32px; }

.table-container { flex: 1; overflow: hidden; margin-bottom: 16px; }
.custom-table :deep(.el-table__header th) { background-color: #F2F3F5; color: #4E5969; height: 40px; }

.status-cell { display: flex; align-items: center; gap: 6px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; }
.dot-danger { background-color: #F53F3F; }
.dot-success { background-color: #13B63A; }

.action-links .el-button { padding: 0; font-size: 14px; }
.text-danger { color: #F53F3F !important; }
.text-warning { color: #FF8D28 !important; }
.text-success { color: #13B63A !important; }

.pagination-container { display: flex; justify-content: flex-end; align-items: center; }
.total-text { font-size: 14px; color: #4E5969; margin-right: 16px; }

/* 抽屉样式 */
:deep(.add-dispose-drawer .el-drawer__header) { padding: 20px 24px; border-bottom: 1px solid #F2F3F5; font-weight: bold; color: #1D2129; margin-bottom: 0; }
:deep(.add-dispose-drawer .el-drawer__body) { height: 0; }
.drawer-container { display: flex; flex-direction: column; height: 100%; }
.drawer-content { flex: 1; overflow-y: auto; padding: 24px; }
.drawer-footer { padding: 16px 24px; border-top: 1px solid #F2F3F5; display: flex; justify-content: flex-end; gap: 12px; }

.form-section { margin-bottom: 24px; }
.form-row { display: flex; gap: 20px; }
.mt-16 { margin-top: 16px; }
.max-w-33 { flex: 0 0 31%; }
.form-item { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.form-item label { font-size: 12px; color: #4E5969; }
.drawer-select :deep(.el-input__inner) { border-radius: 4px; }

.associate-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.btn-scan { border-color: #13B63A; color: #13B63A; }
.associate-table :deep(.el-table__header th) { background-color: #F9FAFB; }
.drawer-pagination-wrapper { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }

.btn-drawer-save { background-color: #F2F3F5 !important; border: none; color: #4E5969; }
</style>