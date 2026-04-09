<template>
  <div class="production-container">
    <!-- 查询表格区域 -->
    <div class="query-section">
      <h3 class="page-title">查询表格</h3>
      <div class="query-form">
        <div class="query-item">
          <label>产生日期</label>
          <el-date-picker
            v-model="productionDate"
            type="date"
            placeholder="请选择日期"
            class="custom-date-picker"
            :editable="false"
            placement="bottom-start"
            popper-append-to-body
          />
        </div>
        <div class="query-item">
          <label>危险废物</label>
          <el-select v-model="wasteType" placeholder="全部" class="query-select">
            <el-option label="全部" value="" />
            <el-option label="工业污泥及格栅垃圾" value="工业污泥及格栅垃圾" />
            <el-option label="感染性废物" value="感染性废物" />
            <el-option label="废液体催化剂" value="废液体催化剂" />
            <el-option label="经鉴别确定为HW36石棉废物" value="经鉴别确定为HW36石棉废物" />
            <el-option label="药物性废物" value="药物性废物" />
            <el-option label="化学性废物" value="化学性废物" />
            <el-option label="损伤性废物" value="损伤性废物" />
          </el-select>
        </div>
        <div class="query-item">
          <label>申报状态</label>
          <el-select v-model="declarationStatus" placeholder="全部" class="query-select">
            <el-option label="全部" value="" />
            <el-option label="未申报" value="未申报" />
            <el-option label="已申报" value="已申报" />
          </el-select>
        </div>
        <div class="query-buttons">
          <el-button type="primary" @click="handleQuery">
            <i class="el-icon-search"></i> 查询
          </el-button>
          <el-button @click="handleReset">
            <i class="el-icon-refresh"></i> 重置
          </el-button>
        </div>
      </div>
    </div>
    <hr>
    <!-- 生产设施区域 -->
    <div class="facility-section">
      <h3 class="page-title">生产设施</h3>
      <div class="facility-tabs">
        <el-tabs v-model="activeFacilityTab">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane label="存储罐" name="storage"></el-tab-pane>
          <el-tab-pane label="危废库" name="waste库"></el-tab-pane>
          <el-tab-pane label="危废区" name="wasteArea"></el-tab-pane>
        </el-tabs>
        <div class="facility-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索"
            class="search-input"
            prefix-icon="el-icon-search"
            @keyup.enter.native="handleSearch"
            @blur="handleSearch"
          >
            <template slot="append">
              <el-button icon="el-icon-search" @click="handleSearch"></el-button>
            </template>
          </el-input>
          <el-button type="success" @click="handleGenerateWaste">
            产生新的危废
          </el-button>
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <div class="table-container">
        <el-table :data="paginatedData" style="width: 100%" class="production-table">
        <el-table-column prop="batchCode" label="产生批次码" :min-width="104"></el-table-column>
        <el-table-column prop="name" label="危废名称" :min-width="124"></el-table-column>
        <el-table-column prop="code" label="危废代码" :min-width="124"></el-table-column>
        <el-table-column prop="digitalId" label="数字识别码" :min-width="227"></el-table-column>
        <el-table-column prop="status" label="状态" :min-width="97">
          <template slot-scope="scope">
            <div class="status-tag" :class="scope.row.status === '已申报' ? 'declared' : 'undeclared'">
              <span class="status-dot"></span>
              <span class="status-text">{{ scope.row.status }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" :min-width="148">
          <template slot-scope="scope">
            <div class="operation-buttons">
              <template v-if="scope.row.status === '未申报'">
                <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                  删除
                </el-button>
                <el-button type="warning" size="small" @click="handleModify(scope.row)">
                  修改
                </el-button>
                <el-button type="primary" size="small" @click="handleDeclare(scope.row)">
                  申报
                </el-button>
              </template>
              <template v-else>
                <el-button type="info" size="small" @click="handleCancel(scope.row)">
                  撤销
                </el-button>
                <el-button type="success" size="small" @click="handlePrint(scope.row)">
                  打印
                </el-button>
              </template>
            </div>
          </template>
        </el-table-column>
        </el-table>
      </div>

      <!-- 分页器 -->
      <div class="pagination">
      <span>共{{ totalCount }}条</span>
      <el-pagination
        background
        layout="prev, pager, next, jumper"
        :total="totalCount"
        :page-size="14"
        :current-page="currentPage"
        @current-change="handleCurrentChange"
      />
    </div>
    </div>

    <!-- 产生新的危废抽屉 -->
    <el-drawer
      :visible.sync="generateWasteDialogVisible"
      title="产生新的危废"
      size="812px"
      :wrapper-closable="false"
      append-to-body
      custom-class="generate-waste-drawer"
    >
      <div class="drawer-container">
        <div class="drawer-content">
          <!-- 选择危废 -->
          <div class="section">
            <h4>选择危废</h4>
            <el-select v-model="newWasteForm.wasteType" placeholder="请选择危废" class="full-width-select">
              <el-option label="废油漆桶" value="废油漆桶" />
              <el-option label="废油" value="废油" />
              <el-option label="废电池" value="废电池" />
            </el-select>
          </div>
          
          <!-- 填写信息 -->
          <div class="section">
            <h4>填写信息</h4>
            
            <div class="form-row">
              <div class="form-item">
                <span class="label">产生部门经办人</span>
                <el-select v-model="newWasteForm.department" placeholder="请选择" class="form-select">
                  <el-option label="张三" value="张三" />
                  <el-option label="李四" value="李四" />
                </el-select>
              </div>
              <div class="form-item">
                <span class="label">生产设施</span>
                <el-select v-model="newWasteForm.facility" placeholder="请选择" class="form-select">
                  <el-option label="设备A" value="设备A" />
                  <el-option label="设备B" value="设备B" />
                </el-select>
              </div>
              <div class="form-item">
                <span class="label">产生量</span>
                <div class="input-group">
                  <el-input v-model="newWasteForm.quantity" class="form-input" />
                  <el-button type="primary" class="get-data-btn">获取地磅数据</el-button>
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-item">
                <span class="label">计量单位</span>
                <el-select v-model="newWasteForm.unit1" placeholder="请选择" class="form-select">
                  <el-option label="吨" value="吨" />
                  <el-option label="千克" value="千克" />
                </el-select>
              </div>
              <div class="form-item">
                <span class="label">计量单位</span>
                <el-select v-model="newWasteForm.unit2" placeholder="请选择" class="form-select">
                  <el-option label="吨" value="吨" />
                  <el-option label="千克" value="千克" />
                </el-select>
              </div>
              <div class="form-item">
                <span class="label">产生时间</span>
                <el-date-picker
                  v-model="newWasteForm.productionTime"
                  type="datetime"
                  placeholder="选择日期时间"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-item">
                <span class="label">容器类型</span>
                <el-select v-model="newWasteForm.containerType" placeholder="请选择" class="form-select">
                  <el-option label="桶" value="桶" />
                  <el-option label="箱" value="箱" />
                </el-select>
              </div>
              <div class="form-item">
                <span class="label">容器材质</span>
                <el-select v-model="newWasteForm.containerMaterial" placeholder="请选择" class="form-select">
                  <el-option label="塑料" value="塑料" />
                  <el-option label="金属" value="金属" />
                </el-select>
              </div>
              <div class="form-item">
                <span class="label">容器容量</span>
                <el-select v-model="newWasteForm.containerCapacity" placeholder="请选择" class="form-select">
                  <el-option label="10L" value="10L" />
                  <el-option label="20L" value="20L" />
                </el-select>
              </div>
            </div>
          </div>
        </div>
        
        <div class="drawer-footer">
          <el-button class="save-button" @click="handleSave">保存</el-button>
          <el-button class="declare-button" type="primary" @click="handleConfirmGenerate">确定申报</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'ProductionPage',
  data() {
    return {
      // 查询条件
      productionDate: '',
      wasteType: '',
      declarationStatus: '',
      searchKeyword: '',
      searchTimer: null,
      activeFacilityTab: 'all',
      
      // 表格数据
      tableData: [
        { batchCode: '-', name: '废抹布', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报', id: '1' },
        { batchCode: '-', name: '活性炭', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报', id: '2' },
        { batchCode: '-', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报', id: '3' },
        { batchCode: '-', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报', id: '4' },
        { batchCode: '-', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报', id: '5' },
        { batchCode: '-', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报', id: '6' },
        { batchCode: '001', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '已申报', id: '7' },
        { batchCode: '001', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '已申报', id: '8' },
        { batchCode: '001', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '已申报', id: '9' },
        { batchCode: '001', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '已申报', id: '10' }
      ],
      
      // 原始表格数据
      originalTableData: [
        { batchCode: '-', name: '废抹布', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报', id: '1' },
        { batchCode: '-', name: '活性炭', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报', id: '2' },
        { batchCode: '-', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报', id: '3' },
        { batchCode: '-', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报', id: '4' },
        { batchCode: '-', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报', id: '5' },
        { batchCode: '-', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '未申报', id: '6' },
        { batchCode: '001', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '已申报', id: '7' },
        { batchCode: '001', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '已申报', id: '8' },
        { batchCode: '001', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '已申报', id: '9' },
        { batchCode: '001', name: '废油漆桶', code: '7631-99-4', digitalId: '9999999999999999A90004149001', status: '已申报', id: '10' }
      ],
      
      // 分页和选中状态
      currentPage: 1,
      totalCount: 10,
      
      // 弹窗状态
      generateWasteDialogVisible: false,
      
      // 新危废表单数据
      newWasteForm: {
        wasteType: '',
        department: '',
        facility: '',
        quantity: '',
        unit1: '',
        unit2: '',
        productionTime: '2022-02-14 16:00:00',
        containerType: '',
        containerMaterial: '',
        containerCapacity: ''
      }
    }
  },
  // 计算属性：分页数据
  computed: {
    paginatedData() {
      // 每页显示14条数据
      const startIndex = (this.currentPage - 1) * 14;
      const endIndex = startIndex + 14;
      return this.tableData.slice(startIndex, endIndex);
    }
  },
  mounted() {
    // 初始化数据
    this.totalCount = this.tableData.length;
  },
  methods: {
    // 查询方法
    handleQuery() {
      const productionDate = this.productionDate;
      const wasteType = this.wasteType;
      const declarationStatus = this.declarationStatus;
      
      if (!productionDate && !wasteType && !declarationStatus) {
        this.tableData = [...this.originalTableData];
        this.totalCount = this.tableData.length;
        return;
      }
      
      // 根据条件过滤数据
      this.tableData = this.originalTableData.filter(item => {
        let match = true;
        
        if (wasteType && item.name !== wasteType) {
          match = false;
        }
        
        if (declarationStatus && item.status !== declarationStatus) {
          match = false;
        }
        
        return match;
      });
      
      this.totalCount = this.tableData.length;
      this.currentPage = 1;
    },
    
    // 重置方法
    handleReset() {
      this.productionDate = '';
      this.wasteType = '';
      this.declarationStatus = '';
      this.searchKeyword = '';
      this.activeFacilityTab = 'all';
      this.tableData = [...this.originalTableData];
      this.totalCount = this.tableData.length;
      this.currentPage = 1;
    },
    
    // 搜索功能
    handleSearch() {
      const keyword = this.searchKeyword.trim();
      
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      
      this.searchTimer = setTimeout(() => {
        if (!keyword) {
          this.tableData = [...this.originalTableData];
        } else {
          this.tableData = this.originalTableData.filter(item => {
            return (
              item.batchCode.includes(keyword) ||
              item.name.includes(keyword) ||
              item.code.includes(keyword) ||
              item.digitalId.includes(keyword) ||
              item.status.includes(keyword)
            );
          });
        }
        
        this.totalCount = this.tableData.length;
        this.currentPage = 1;
      }, 300);
    },
    
    // 页码变化处理
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    
    // 产生新的危废
    handleGenerateWaste() {
      // 重置表单，并将时间设置为当前实时时间
      this.newWasteForm = {
        wasteType: '',
        department: '',
        facility: '',
        quantity: '',
        unit1: '',
        unit2: '',
        productionTime: new Date(), // 动态获取当前时间
        containerType: '',
        containerMaterial: '',
        containerCapacity: ''
      };
      
      // 打开产生新的危废弹窗
      this.generateWasteDialogVisible = true;
    },
    
    // 确认产生新的危废
    handleConfirmGenerate() {
      // 验证表单数据
      if (!this.newWasteForm.wasteType || !this.newWasteForm.department || !this.newWasteForm.facility || !this.newWasteForm.quantity) {
        this.$message.warning('请填写完整的危废信息');
        return;
      }
      
      // 使用时间戳生成绝对唯一的纯前端 ID，防止重复
      const uniqueId = Date.now().toString();
      
      // 生成新的危废记录
      const newWaste = {
        id: uniqueId,
        batchCode: '00' + (this.totalCount + 1),
        name: this.newWasteForm.wasteType,
        code: '7631-99-4', // 假设默认危废代码
        digitalId: '9999999999999999A900041490' + uniqueId.slice(-2), // 截取时间戳后两位模拟不同ID
        status: '未申报',
        quantity: this.newWasteForm.quantity,
        unit: this.newWasteForm.unit1
      };
      
      // 添加到表格数据中 (两份数据都要加)
      this.tableData.unshift(newWaste);
      this.originalTableData.unshift(newWaste);
      this.totalCount = this.tableData.length;
      
      // 强制跳回第一页看最新数据
      this.currentPage = 1;
      
      // 关闭弹窗
      this.generateWasteDialogVisible = false;
      
      // 重置表单
      this.newWasteForm = {
        wasteType: '',
        department: '',
        facility: '',
        quantity: '',
        unit1: '',
        unit2: '',
        productionTime: new Date(), // 动态获取当前时间
        containerType: '',
        containerMaterial: '',
        containerCapacity: ''
      };
      
      // 显示成功提示
      this.$message.success('产生新的危废成功');
    },
    
    // 保存操作
    handleSave() {
      // 这里可以添加保存的逻辑
      this.$message.success('保存功能待实现');
    },
    
    // 删除操作
    handleDelete(row) {
      this.$confirm(
        // 利用 HTML 重构弹窗内部的结构（图标 + 标题 + 文字）
        `<div class="delete-confirm-wrapper">
           <div class="delete-confirm-title">
             <i class="el-icon-warning custom-warning-icon"></i>
             <span>温馨提示</span>
           </div>
           <div class="delete-confirm-text">是否确定删除?</div>
         </div>`,
        '', // 标题留空，隐藏默认 Header
        {
          dangerouslyUseHTMLString: true, // 开启 HTML 解析
          showClose: false, // 隐藏右上角 X 号
          customClass: 'custom-delete-modal', // 注入全局自定义类名
          cancelButtonClass: 'custom-cancel-btn', // 注入取消按钮类名
          confirmButtonClass: 'custom-confirm-btn', // 注入确定按钮类名
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      ).then(() => {
        // 1. 从当前搜索/展示结果中删除
        const index = this.tableData.findIndex(item => item.id === row.id);
        if (index > -1) {
          this.tableData.splice(index, 1);
        }
        
        // 2. 从原始数据源中删除
        const originalIndex = this.originalTableData.findIndex(item => item.id === row.id);
        if (originalIndex > -1) {
          this.originalTableData.splice(originalIndex, 1);
        }
        
        this.totalCount = this.tableData.length;
        
        // 3. 处理分页边界
        const maxPage = Math.ceil(this.totalCount / 14); // 从 10 改为 14
        if (this.currentPage > maxPage && maxPage > 0) {
          this.currentPage = maxPage;
        }
        
        this.$message.success('删除成功');
      }).catch(() => {
        // 取消删除
      });
    },
    
    // 修改操作
    handleModify() {
      // 这里可以添加修改危废的逻辑
      this.$message.info('修改功能待实现');
    },
    
    // 申报操作
    handleDeclare(row) {
      // 这里可以添加申报危废的逻辑
      row.status = '已申报';
      this.$message.success('申报成功');
    },
    
    // 撤销操作
    handleCancel(row) {
      // 这里可以添加撤销申报的逻辑
      row.status = '未申报';
      this.$message.success('撤销成功');
    },
    
    // 打印操作
    handlePrint() {
      // 这里可以添加打印危废的逻辑
      this.$message.info('打印功能待实现');
    }
  }
}
</script>

<style scoped>
.production-container {
  height: 100vh;
  width: 100%;
  padding: 0;
  margin: 0;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #1D2129;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  margin-bottom: 15px;
}

/* 查询区域样式 */
.query-section {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 0;
  margin-bottom: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 0 0 auto;
}

.query-form {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.query-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.query-item label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.custom-date-picker {
  width: 140px !important;
  height: 24px !important;
}

.query-select {
  width: 140px !important;
  height: 24px !important;
}


.custom-date-picker :deep(.el-input__inner),
.query-select :deep(.el-input__inner) {
  font-size: 12px !important;
  line-height: 20px !important;
  height: 24px !important;
  background-color: #F2F3F5 !important;  /* 新增背景色 */
  border: 1px solid transparent !important;  /* 新增透明边框 */
  color: #1D2129 !important;
}



.custom-date-picker :deep(.el-input__prefix),
.custom-date-picker :deep(.el-input__suffix),
.query-select :deep(.el-input__suffix) {
  display: flex !important;
  align-items: center !important; 
  height: 24px !important; 
  top: 0 !important;
}

.custom-date-picker :deep(.el-input__icon),
.query-select :deep(.el-input__icon) {
  line-height: normal !important; 
  height: auto !important;
  width: 25px !important; 
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 3. 日期选择器的输入内容需要给左边留出日历图标的位置 */
.custom-date-picker :deep(.el-input__inner) {
  padding-left: 30px !important; /* 避免文字和日历图标重叠 */
  padding-right: 15px !important;
}

/* 4. 下拉框，可以用 scale 等比缩小 */
.query-select :deep(.el-select__caret) {
  transform: scale(0.85);
}

.query-buttons {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.query-buttons .el-button--primary {
  background-color: #13B63A !important;
  border-color: #13B63A !important;
  color: white !important;
  height: 24px !important;
  line-height: 24px !important;
  padding: 0 15px !important;
}

.query-buttons .el-button {
  height: 24px !important;
  line-height: 24px !important;
  padding: 0 15px !important;
}

/* 生产设施区域样式 */
.facility-section {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 0;
  margin-bottom: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 0 0 auto;
}

.facility-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.facility-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  width: 200px;
}

/* 导航栏选中效果 */
.facility-section :deep(.el-tabs) {
  border-bottom: none !important;
  box-shadow: none !important;
}

.facility-section :deep(.el-tabs__header) {
  margin-bottom: 0 !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

.facility-section :deep(.el-tabs__nav-wrap) {
  border-bottom: none !important;
  box-shadow: none !important;
}

.facility-section :deep(.el-tabs__nav) {
  border-bottom: none !important;
  box-shadow: none !important;
}

.facility-section :deep(.el-tabs__item) {
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
}

.facility-section :deep(.el-tabs__item.is-active) {
  padding: 5px 16px !important;
  border-radius: 100px !important;
  background: #F2F3F5 !important;
  color: #13B63A !important;
  font-weight: 500 !important;
  border: 1px solid #E4E7ED !important;
  box-shadow: none !important;
}

.facility-section :deep(.el-tabs__active-bar) {
  display: none !important;
}

.facility-section :deep(.el-tabs__content) {
  border-top: none !important;
  box-shadow: none !important;
}

/* 确保所有可能的线条都被移除 */
.facility-section :deep(.el-tabs__nav-container) {
  border-bottom: none !important;
  box-shadow: none !important;
}

.facility-section :deep(.el-tabs__header.is-top) {
  border-bottom: none !important;
  box-shadow: none !important;
}

/* 表格区域样式 */
.table-section {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 表格容器 */
.table-container {
  flex: 1;
  overflow: hidden;
  margin-bottom: 20px;
}

/* 表格整体高度约束及滚动条隐藏 */
.production-table {
  height: 480px !important;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5; /* 防止底部边框丢失 */
}

/* 强制隐藏表格的纵向和横向滚动条 */
.production-table :deep(.el-table__body-wrapper) {
  overflow: hidden !important;
}
.production-table :deep(.el-table__header-wrapper) {
  overflow: hidden !important;
}

/* 统一控制表格行高：480px / 15行 = 32px */
.production-table :deep(.el-table__row) {
  height: 32px !important;
}

.production-table :deep(.el-table__cell) {
  height: 32px !important;
  line-height: 32px !important;
  padding: 0 12px !important; /* 取消默认的上下 padding 防止撑开高度 */
  font-family: Microsoft YaHei;
  font-weight: 400;
  font-style: normal;
  font-size: 12px;
  letter-spacing: 0%;
}

/* 表头高度同样设置为 32px */
.production-table :deep(.el-table__header-wrapper .el-table__header th) {
  height: 32px !important;
  padding: 0 12px !important;
  background-color: #E5E6EB !important;
  color: #1D2129 !important;
  font-family: Microsoft YaHei;
  font-weight: 400;
  font-style: normal;
  font-size: 12px;
}

.production-table :deep(.el-table__header-wrapper .el-table__header th .cell) {
  color: #1D2129 !important;
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
}

.operation-buttons .el-button {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.operation-buttons .el-button--danger {
  color: #F53F3F !important;
}

.operation-buttons .el-button--warning {
  color: #FF8D28 !important;
}

.operation-buttons .el-button--primary {
  color: #13B63A !important;
}

.operation-buttons .el-button--info {
  color: #F53F3F !important;
}

.operation-buttons .el-button--success {
  color: #13B63A !important;
}

/* 状态标签样式 */
.status-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: transparent !important;
  border: none !important;
  padding: 0 !important;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-tag.declared .status-dot {
  background-color: #13B63A;
}

.status-tag.undeclared .status-dot {
  background-color: #F53F3F;
}

.status-text {
  font-size: 12px;
  color: #606266;
}

/* 产生新的危废弹窗样式 */
.generate-waste-dialog {
  width: 812px !important;
  z-index: 9999 !important;
  position: fixed !important;
  right: 0 !important;
  left: auto !important;
  margin: 0 !important;
  top: 0 !important;
  height: 100vh !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  overflow: visible !important;
}

/* 确保弹窗内的日期选择器能正常显示 */
.generate-waste-dialog .el-date-picker__popper {
  z-index: 10000 !important;
}

.generate-waste-dialog .el-select__popper {
  z-index: 10000 !important;
}

.generate-waste-dialog .el-dialog__header {
  padding: 16px 20px !important;
  border-bottom: 1px solid #ebeef5 !important;
}

.generate-waste-dialog .el-dialog__body {
  padding: 20px !important;
  margin: 0 !important;
  height: auto !important;
  max-height: calc(100vh - 140px) !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

/* 弹窗内容样式 */
.dialog-content {
  font-size: 14px;
  line-height: 1.5;
}

.section {
  margin-bottom: 24px;
  flex: 0 0 auto;
}

.section:last-child {
  margin-bottom: 0;
}

/* 确保表单行占满宽度 */
.form-row {
  display: flex;
  margin-bottom: 16px;
  gap: 16px;
  flex: 0 0 auto;
}

/* 确保表单项占满空间 */
.form-item {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
}

.section {
  margin-bottom: 24px;
}

.section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.full-width-select {
  width: 100%;
}

.form-row {
  display: flex;
  margin-bottom: 16px;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
}

.form-item .label {
  color: #606266;
  font-size: 14px;
}

.form-select,
.form-input {
  width: 100%;
}

.input-group {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.get-data-btn {
  white-space: nowrap;
  height: 32px;
}

/* 弹窗底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px !important;
  border-top: 1px solid #ebeef5 !important;
  margin: 0 !important;
}

/* 保存按钮样式 */
.save-button {
  width: 60px !important;
  height: 32px !important;
  border-radius: 2px !important;
  opacity: 1 !important;
  padding: 5px 16px !important;
  gap: 8px !important;
  background-color: #F2F3F5 !important;
  border: none !important;
  box-shadow: none !important;
}

.save-button span {
  width: 28px !important;
  height: 22px !important;
  opacity: 1 !important;
  font-family: Microsoft YaHei !important;
  font-weight: 400 !important;
  font-size: 14px !important;
  line-height: 22px !important;
  letter-spacing: 0% !important;
  vertical-align: middle !important;
  color: #4E5969 !important;
}

/* 确定申报按钮样式 */
.declare-button {
  width: 88px !important;
  height: 32px !important;
  border-radius: 2px !important;
  opacity: 1 !important;
  padding: 5px 16px !important;
  gap: 8px !important;
  background-color: #13B63A !important;
  border-color: #13B63A !important;
  box-shadow: none !important;
}

.declare-button span {
  width: 56px !important;
  height: 22px !important;
  opacity: 1 !important;
  font-family: Microsoft YaHei !important;
  font-weight: 400 !important;
  font-size: 14px !important;
  line-height: 22px !important;
  letter-spacing: 0% !important;
  vertical-align: middle !important;
  color: #FFFFFF !important;
}

/* 分页器样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.pagination span {
  font-size: 14px;
  color: #606266;
}

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .query-form {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .query-buttons {
    margin-left: 0;
    margin-top: 10px;
  }
  
  .facility-tabs {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .facility-actions {
    width: 100%;
  }
  
  .search-input {
    flex: 1;
  }
}
</style>

<style>
/* 抽屉样式 */
.generate-waste-drawer .el-drawer__body {
  height: 0; 
}

.drawer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* ================= 删除确认弹窗自定义样式 ================= */
/* 弹窗主体容器 */
.custom-delete-modal {
  width: 244px !important;
  height: 182px;
  padding: 30px 20px 24px 20px !important;
  border-radius: 4px !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

/* 隐藏默认 Header（因为我们传了空标题） */
.custom-delete-modal .el-message-box__header {
  display: none !important;
}

/* 取消默认内容区的 padding */
.custom-delete-modal .el-message-box__content {
  padding: 0 0 24px 0 !important;
}

/* 我们自定义的 HTML 结构排版 */
.delete-confirm-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* 标题行布局 */
.delete-confirm-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #1D2129;
  font-weight: 500;
}

/* 橙色警告图标 */
.custom-warning-icon {
  color: #FF7D00;
  font-size: 20px;
}

/* 提示文字 */
.delete-confirm-text {
  font-size: 14px;
  color: #4E5969;
}

/* 底部按钮区域居中 */
.custom-delete-modal .el-message-box__btns {
  display: flex !important;
  justify-content: center !important;
  gap: 16px !important;
  padding: 0 !important;
}

/* 取消按钮样式 (灰色) */
.custom-delete-modal .custom-cancel-btn {
  background-color: #F2F3F5 !important;
  border-color: #F2F3F5 !important;
  color: #4E5969 !important;
  width: 88px !important;
  height: 32px !important;
  border-radius: 2px !important;
  margin: 0 !important;
  font-size: 14px !important;
}

.custom-delete-modal .custom-cancel-btn:hover {
  background-color: #E5E6EB !important;
  border-color: #E5E6EB !important;
}

/* 确定按钮样式 (红色) */
.custom-delete-modal .custom-confirm-btn {
  background-color: #F53F3F !important;
  border-color: #F53F3F !important;
  color: #FFFFFF !important;
  width: 88px !important;
  height: 32px !important;
  border-radius: 2px !important;
  margin: 0 !important;
  font-size: 14px !important;
}

.custom-delete-modal .custom-confirm-btn:hover {
  background-color: #D93636 !important;
  border-color: #D93636 !important;
}

/* 表单样式 */
.section {
  margin-bottom: 24px;
}

.section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.full-width-select {
  width: 100%;
}

.form-row {
  display: flex;
  margin-bottom: 16px;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
}

.form-item .label {
  color: #606266;
}

.form-select {
  width: 100%;
}

.form-input {
  width: 100%;
}

.input-group {
  display: flex;
  gap: 8px;
}

.input-group .form-input {
  flex: 1;
}

.get-data-btn {
  white-space: nowrap;
  background-color: transparent !important;
  border: 1px solid #13B63A !important;
  color: #13B63A !important;
}

.save-button {
  margin-right: 12px;
}

.declare-button {
  background-color: #13B63A;
  border-color: #13B63A;
}

.declare-button:hover {
  background-color: #10a333;
  border-color: #10a333;
}

/* 统一设置抽屉内部的输入框背景色 */
.generate-waste-drawer .el-input__inner {
  background-color: #F2F3F5 !important;
  border: 1px solid transparent !important;
  color: #1D2129 !important;
  height: 32px !important;
  line-height: 32px !important;
  font-size: 12px !important;
  padding: 0 12px !important;
}

/* 当输入框聚焦时，背景变白并显示主题色边框 */
.generate-waste-drawer .el-input.is-active .el-input__inner,
.generate-waste-drawer .el-input__inner:focus {
  background-color: #FFFFFF !important;
  border-color: #13B63A !important;
}

/* 针对禁用状态的输入框背景 */
.generate-waste-drawer .el-input.is-disabled .el-input__inner {
  background-color: #E5E6EB !important;
  color: #86909C !important;
}
</style>