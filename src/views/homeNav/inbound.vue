<template>
  <div class="inbound-container">
    <div class="query-section">
      <h3 class="section-title">查询表格</h3>
      <div class="query-form">
        <div class="query-item">
          <label>入库日期</label>
          <el-date-picker
            v-model="inboundDate"
            type="date"
            placeholder="请选择日期"
            class="custom-date-picker"
            :editable="false"
          />
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
      <h3 class="section-title">贮存设施</h3>
      
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
          <el-button type="success" class="btn-add" @click="handleAddInbound">
            添加危废入库单
          </el-button>
        </div>
      </div>

      <div class="table-container">
        <el-table :data="paginatedData" style="width: 100%" class="custom-table" height="100%">
          <el-table-column prop="batchCode" label="入库批次编码" min-width="120" />
          <el-table-column prop="wasteName" label="危废名称" min-width="120" />
          <el-table-column prop="wasteCode" label="危废代码" min-width="120" />
          <el-table-column prop="digitalId" label="数字识别码" min-width="240" />
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
      title="添加危废入库单"
      :visible.sync="drawerVisible"
      size="900px"
      custom-class="add-inbound-drawer"
      :wrapper-closable="false"
      append-to-body
    >
      <div class="drawer-container">
        <div class="drawer-content">
          <div class="form-section">
            <h4 class="section-subtitle">填写信息</h4>
            <div class="form-row">
              <div class="form-item">
                <label>贮存设施编号</label>
                <el-select v-model="addForm.storageNo" placeholder="请选择" class="drawer-select">
                  <el-option label="设施A" value="A"></el-option>
                  <el-option label="设施B" value="B"></el-option>
                </el-select>
              </div>
              <div class="form-item">
                <label>贮存部门经办人</label>
                <el-select v-model="addForm.storageAgent" placeholder="请选择" class="drawer-select">
                  <el-option label="张三" value="zhangsan"></el-option>
                  <el-option label="李四" value="lisi"></el-option>
                </el-select>
              </div>
              <div class="form-item">
                <label>运送部门经办人</label>
                <el-select v-model="addForm.transportAgent" placeholder="请选择" class="drawer-select">
                  <el-option label="王五" value="wangwu"></el-option>
                  <el-option label="赵六" value="zhaoliu"></el-option>
                </el-select>
              </div>
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
  name: 'InboundPage',
  data() {
    return {
      inboundDate: '',
      activeTab: 'area', 
      searchKeyword: '',
      
      // 页面主表格分页相关
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      tableData: [
        { id: 1, batchCode: '-', wasteName: '废抹布', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报' },
        { id: 2, batchCode: '-', wasteName: '活性炭', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报' },
        { id: 3, batchCode: '-', wasteName: '废油漆桶', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报' },
        { id: 7, batchCode: '001', wasteName: '废油漆桶', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '已申报' }
      ],

      // ================= 抽屉相关数据 =================
      drawerVisible: false,
      addForm: {
        storageNo: '',
        storageAgent: '',
        transportAgent: ''
      },
      // 抽屉表格数据
      associateData: [
        { id: 1, prodNo: '001', wasteName: '废抹布', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', amount: 4 },
        { id: 2, prodNo: '001', wasteName: '活性炭', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', amount: 76 },
        { id: 3, prodNo: '001', wasteName: '废油漆桶', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', amount: 76 },
        { id: 4, prodNo: '001', wasteName: '废油漆桶', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', amount: 76 },
        { id: 5, prodNo: '001', wasteName: '废油漆桶', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', amount: 76 },
        { id: 6, prodNo: '001', wasteName: '废油漆桶', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', amount: 7 },
        { id: 7, prodNo: '001', wasteName: '废油漆桶', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', amount: 4 },
        { id: 8, prodNo: '001', wasteName: '废油漆桶', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', amount: 4 },
        { id: 9, prodNo: '001', wasteName: '废油漆桶', wasteCode: '7631-99-4', digitalId: '9999999999999999A90004149001', amount: 4 }
      ],
      selectedRows: [], 
      drawerCurrentPage: 1,
      drawerPageSize: 10,
      drawerTotal: 0
    }
  },
  computed: {
    // 根据当前页码和每页条数，动态切割要展示的数据
    paginatedData() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.tableData.slice(startIndex, endIndex);
    }
  },
  methods: {
    // 页面原有方法
    handleQuery() { this.$message.success('执行查询操作'); },
    handleReset() {
      this.inboundDate = '';
      this.searchKeyword = '';
      this.currentPage = 1;
    },
    handleTabClick() {},
    handleCurrentChange(val) { this.currentPage = val; },
    handleDelete(row) {
      this.$confirm('确定要删除该条记录吗?', '提示', { type: 'warning' }).then(() => {
        const index = this.tableData.findIndex(item => item.id === row.id);
        if (index > -1) {
          this.tableData.splice(index, 1);
          this.totalCount = this.tableData.length;
        }
        this.$message.success('删除成功');
      }).catch(() => {});
    },
    handleModify(row) { this.$message.warning(`修改记录 ID: ${row.id}`); },
    handleDeclare(row) {
      row.status = '已申报';
      row.batchCode = '001';
      this.$message.success('申报成功');
    },
    handleCancel(row) {
      row.status = '未申报';
      row.batchCode = '-';
      this.$message.info('已撤销申报');
    },
    handleDetail(row) { this.$message.success(`查看详情ID: ${row.id}`); },

    // ================= 抽屉新加方法 =================
    // 打开抽屉
    handleAddInbound() {
      this.drawerVisible = true;
      this.selectedRows = []; // 每次打开清空勾选
    },
    // 监听抽屉内表格复选框变化
    handleSelectionChange(val) {
      this.selectedRows = val;
    },
    // 抽屉分页切换
    handleDrawerCurrentChange(val) {
      this.drawerCurrentPage = val;
    },
    // 抽屉确定申报逻辑
    handleDrawerSubmit() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一条关联的危废记录');
        return;
      }

      // 1. 遍历抽屉中勾选的数据，转换为外层主表格所需的格式
      const newItems = this.selectedRows.map((item, index) => {
        return {
          id: Date.now() + index, // 用时间戳模拟生成一个纯前端的唯一 ID
          batchCode: '-',         // 刚入库，还没正式申报生成批次码，所以是 '-'
          wasteName: item.wasteName,
          wasteCode: item.wasteCode,
          digitalId: item.digitalId,
          status: '未申报'         // 默认状态为未申报
        };
      });

      // 2. 将新数据塞到外层主表格的数据最前面 (unshift)
      this.tableData.unshift(...newItems);

      // 3. 同步更新分页器所需的"总条数"
      this.totalCount = this.tableData.length;

      // 4. 强制跳转到第 1 页，方便用户立刻看到刚添加的数据
      this.currentPage = 1;

      // 5. 关闭抽屉并提示成功
      this.drawerVisible = false;
      this.$message.success(`成功添加入库单，已新增 ${this.selectedRows.length} 条记录`);

      // 6. 重置表单，方便下次打开
      this.addForm = {
        storageNo: '',
        storageAgent: '',
        transportAgent: ''
      };
    }
  },
  mounted() {
    // 初始化总条数，根据表格实际数据计算
    this.totalCount = this.tableData.length;
    this.drawerTotal = this.associateData.length;
  }
}
</script>

<style scoped>
.inbound-container {
  height: calc(100vh - 62px); 
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
  padding: 24px;
  box-sizing: border-box;
}

/* --- 页面公共样式 --- */
.section-title { font-size: 16px; font-weight: bold; color: #1D2129; margin: 0 0 16px 0; }
.query-section { border-bottom: 1px solid #F2F3F5; padding-bottom: 20px; margin-bottom: 20px; }
.query-form { display: flex; align-items: center; gap: 24px; }
.query-item { display: flex; align-items: center; gap: 12px; }
.query-item label { font-size: 14px; color: #4E5969; }
.custom-date-picker { width: 240px !important; height: 24px !important;}
.custom-date-picker :deep(.el-input__inner) { background-color: #F2F3F5; border: 1px solid transparent !important; height: 24px !important; line-height: 24px !important;font-size: 12px !important;color: #1D2129 !important;padding-left: 30px !important;padding-right: 15px !important; }
.query-buttons { display: flex; gap: 12px; }
.btn-search { background-color: #13B63A !important; border-color: #13B63A !important; height: 32px; padding: 0 16px; }
.btn-reset { background-color: #F2F3F5 !important; border-color: transparent !important; color: #4E5969 !important; height: 32px; padding: 0 16px; }
.main-content-section { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.custom-tabs :deep(.el-tabs__header) { margin: 0; border-bottom: none; }
.custom-tabs :deep(.el-tabs__nav-wrap::after) { display: none; }
.custom-tabs :deep(.el-tabs__active-bar) { display: none; }
.custom-tabs :deep(.el-tabs__item) { font-size: 14px; color: #4E5969; padding: 0 16px; height: 32px; line-height: 32px; }
.custom-tabs :deep(.el-tabs__item.is-active) { color: #13B63A; background-color: #F2F3F5; border-radius: 16px; font-weight: bold; }
.right-actions { display: flex; align-items: center; gap: 16px; }
.search-input { width: 200px; }
.search-input :deep(.el-input__inner) { background-color: #F2F3F5; border: none; height: 32px; line-height: 32px; border-radius: 16px; }
.btn-add { background-color: #13B63A !important; border-color: #13B63A !important; height: 32px; padding: 0 16px; border-radius: 4px; }
.table-container { flex: 1; overflow: hidden; margin-bottom: 16px; }
.custom-table :deep(.el-table__header th) { background-color: #F2F3F5; color: #4E5969; font-weight: 500; height: 40px; padding: 0; }
.custom-table :deep(.el-table__row) { height: 44px; }
.status-cell { display: flex; align-items: center; gap: 6px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.dot-danger { background-color: #F53F3F; }
.dot-success { background-color: #13B63A; }
.action-links { display: flex; gap: 12px; justify-content: flex-end; }
.action-links .el-button { padding: 0; font-size: 14px; }
.text-danger { color: #F53F3F !important; }
.text-warning { color: #FF8D28 !important; }
.text-success { color: #13B63A !important; }
.cursor-pointer { cursor: pointer; }
.pagination-container { display: flex; justify-content: flex-end; align-items: center; }
.total-text { font-size: 14px; color: #4E5969; margin-right: 16px; }

/* 聚焦效果 */
.custom-date-picker :deep(.el-input__inner:focus) {
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
/* ================= 抽屉专属样式 ================= */

/* 覆盖 Element UI 默认的抽屉 Header 样式 */
:deep(.add-inbound-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #F2F3F5;
  color: #1D2129;
  font-weight: bold;
  font-size: 16px;
}

/* 将 body 高度设为 0，让内部的 scroll 容器生效 */
:deep(.add-inbound-drawer .el-drawer__body) {
  height: 0; 
}

/* 抽屉内部 Flex 布局：上部滚动，底部固定 */
.drawer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.drawer-footer {
  padding: 16px 24px;
  border-top: 1px solid #F2F3F5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #fff;
}

/* 填写信息区 */
.form-section {
  margin-bottom: 24px;
}
.section-subtitle {
  font-size: 14px;
  font-weight: bold;
  color: #1D2129;
  margin: 0 0 16px 0;
}
.form-row {
  display: flex;
  gap: 24px;
}
.form-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-item label {
  font-size: 12px;
  color: #4E5969;
}
.drawer-select :deep(.el-input__inner) {
  background-color: #F2F3F5;
  border: none;
  height: 36px;
  line-height: 36px;
  border-radius: 4px;
}

/* 关联添加区域 */
.associate-section {
  display: flex;
  flex-direction: column;
}
.associate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

/* 扫码添加按钮 (绿框绿字) */
.btn-scan {
  border-color: #13B63A;
  color: #13B63A;
  height: 32px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.btn-scan:hover {
  background-color: #E8F8EC;
  color: #13B63A;
  border-color: #13B63A;
}

/* 抽屉表格样式覆盖 */
.associate-table {
  border-top: 1px solid #F2F3F5;
}
.associate-table :deep(.el-table__header th) {
  background-color: #F9FAFB !important;
  color: #4E5969;
}
/* 将复选框勾选颜色改为主题绿 */
.associate-table :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #13B63A;
  border-color: #13B63A;
}

/* 抽屉内的独立分页栏 */
.drawer-pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}
.selected-info {
  font-size: 14px;
  color: #4E5969;
}
.selected-info .gap {
  margin-left: 12px;
}

/* 底部按钮颜色 */
.btn-drawer-save {
  background-color: #F2F3F5 !important;
  border: none !important;
  color: #4E5969 !important;
}
.btn-drawer-submit {
  background-color: #13B63A !important;
  border-color: #13B63A !important;
}
</style>