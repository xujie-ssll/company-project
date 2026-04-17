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
            <el-option v-for="option in disposeTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
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
          <el-tab-pane v-for="tab in tabs" :key="tab.value" :label="tab.label" :name="tab.value"></el-tab-pane>
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
        <el-table v-loading="loading" :data="tableData" style="width: 100%" class="custom-table">
          <el-table-column prop="batchCode" label="自行利用/处置批次编码" min-width="180" />
          <el-table-column prop="facility" label="自行利用/处置设施" min-width="150" />
          <el-table-column prop="typeValue" label="自行利用/处置类型" min-width="130" />
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
        <span class="total-text">共{{ total }}条</span>
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="total"
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
                  <el-option v-for="option in disposeTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
                </el-select>
              </div>
              <div class="form-item">
                <label>自行利用/处置类型设施</label>
                <el-select v-model="addForm.facility" placeholder="请选择" class="drawer-select" @change="handleFacilityChange">
                  <el-option v-for="option in facilityOptions" :key="option.id" :label="option.label" :value="option.value" :data-id="option.id" />
                </el-select>
              </div>
              <div class="form-item">
                <label>自行利用/处置部门经办人</label>
                <el-select v-model="addForm.disposeAgent" placeholder="请选择" class="drawer-select">
                  <el-option v-for="option in operatorOptions" :key="option.value" :label="option.label" :value="option.value" />
                </el-select>
              </div>
            </div>
            <div class="form-row mt-16">
              <div class="form-item max-w-33">
                <label>出库部门经办人</label>
                <el-select v-model="addForm.outAgent" placeholder="请选择" class="drawer-select">
                  <el-option v-for="option in outOperatorOptions" :key="option.value" :label="option.label" :value="option.value" />
                </el-select>
              </div>
              <div class="form-item max-w-33">
                <label>运送部门经办人</label>
                <el-select v-model="addForm.transportAgent" placeholder="请选择" class="drawer-select">
                  <el-option v-for="option in transportOperatorOptions" :key="option.value" :label="option.label" :value="option.value" />
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
              v-loading="drawerLoading"
              :data="associateData"
              style="width: 100%"
              class="associate-table"
              @selection-change="handleSelectionChange"
              @select-all="handleSelectAll"
            >
              <el-table-column type="selection" width="55" align="center"></el-table-column>
              <el-table-column prop="prodNo" label="产生批次码" min-width="110"></el-table-column>
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
          <el-button @click="handleDrawerSave" class="btn-drawer-save">保存</el-button>
          <el-button type="success" @click="handleDrawerSubmit" class="btn-drawer-submit">确定申报</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { selfUseApi, myApi, dictionaryApi } from '@/api';
import request from '@/utils/request';

export default {
  name: 'SelfUsePage',
  data() {
    return {
      queryDate: '',
      disposeType: '',
      activeTab: 'all',
      tabs: [],
      searchKeyword: '',
      
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      tableData: [],
      originalTableData: [],

      drawerVisible: false,
      addForm: {
        type: '',
        facility: '',
        id: '',
        disposeAgent: '',
        outAgent: '',
        transportAgent: ''
      },
      associateData: [],
      selectedRows: [],
      drawerCurrentPage: 1,
      drawerPageSize: 30,
      drawerTotal: 0,
      
      // 设施选项
      facilityOptions: [],
      // 经办人选项
      operatorOptions: [],
      // 出库部门经办人选项
      outOperatorOptions: [],
      // 运送部门经办人选项
      transportOperatorOptions: [],
      // 加载状态
      loading: false,
      drawerLoading: false,
      // 处置类型选项
      disposeTypeOptions: []
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
    // 初始化数据
    this.fetchSelfUseData();
    this.fetchFacilityOptions();
    this.fetchOperatorOptions();
    this.fetchOutOperatorOptions();
    this.fetchTransportOperatorOptions();
    this.fetchDisposeTypeOptions();
  },
  methods: {
    // 获取自行利用处置数据
    fetchSelfUseData() {
      this.loading = true;
      
      // 构建请求参数，包含page、size和filter字段
      const params = {
        page: this.currentPage,
        size: this.pageSize,
        filter: []
      };
      
      // 添加设施筛选条件
      if (this.activeTab !== 'all') {
        params.filter.push({
          name: "zxlyczsstybh",
          value: this.activeTab,
          type: "EQ"
        });
      }
      
      // 添加日期筛选条件
      if (this.queryDate) {
        let dateStr = this.queryDate;
        if (dateStr instanceof Date) {
          const year = dateStr.getFullYear();
          const month = String(dateStr.getMonth() + 1).padStart(2, '0');
          const day = String(dateStr.getDate()).padStart(2, '0');
          dateStr = `${year}-${month}-${day}`;
        } else if (typeof dateStr === 'string') {
          dateStr = dateStr.split('T')[0];
        }
        params.filter.push({
          name: "createTime",
          value: dateStr,
          type: "LIKE"
        });
      }
      
      // 添加处置类型筛选条件
      if (this.disposeType) {
        params.filter.push({
          name: "zxlyczlx",
          value: this.disposeType,
          type: "EQ"
        });
      }
      
      // 添加搜索关键词筛选条件
      if (this.searchKeyword) {
        params.filter.push({
          name: "batchNo",
          value: this.searchKeyword,
          type: "LIKE"
        });
      }
      
      console.log('自行利用查询请求参数:', params);
      selfUseApi.selfUsepage(params).then(res => {
        console.log('自行利用查询响应结果:', res);
        const data = res.result || res.data;
        if (data) {
          this.tableData = (data.records || []).map(item => {
            // 处理批次编码
            let batchCode = item.batchNo || '-';
            if (batchCode !== '-') {
              const batchCodeMatch = batchCode.match(/^[A-Z]{2}_\d{14}/);
              if (batchCodeMatch) {
                batchCode = batchCodeMatch[0];
              }
            }
            
            // 处理设施编码
            let facility = item.zxlyczsstybh || '-';
            if (facility !== '-') {
              const facilityMatch = facility.match(/TS\d+$/);
              if (facilityMatch) {
                facility = facilityMatch[0];
              }
            }
            
            return {
              id: item.id,
              batchCode: batchCode,
              facility: facility,
              outAgent: item.ckbmjbr || '-',
              disposeAgent: item.zxlyczbmjbr || '-',
              transportAgent: item.ysbmjbr || '-',
              type: item.zxlyczlx || '',
              typeValue: item.zxlyczlxValue || '',
              status: item.statusReport !== undefined ? (item.statusReport === 1 ? '已申报' : '未申报') : (item.status === 1 ? '已申报' : '未申报'),
              statusReport: item.statusReport !== undefined ? item.statusReport : (item.status || 0),
              createTime: item.createdTime || ''
            };
          });
          
          this.total = data.total || 0;
        }
      }).catch(err => {
        console.error('获取自行利用处置数据失败', err);
        this.$message.error('获取数据失败，请重试');
      }).finally(() => {
        this.loading = false;
      });
    },
    
    // 获取设施选项
    fetchFacilityOptions() {
      // 使用正确的接口获取设施选项数据，payload为空对象
      myApi.dispositionPage({}).then(res => {
        console.log('获取设施选项响应:', res);
        const data = res.result || res.data;
        if (data) {
          console.log('设施数据:', data.records);
          // 从后端获取设施选项
          this.facilityOptions = (data.records || []).map(item => ({
            label: item.ssbm,
            value: item.zxlyczsstybh,
            id: item.id
          }));
          
          // 将设施选项转换为标签页数据
          this.tabs = (data.records || []).map(item => ({
            label: item.ssbm,
            value: item.zxlyczsstybh
          }));
          console.log('标签页数据:', this.tabs);
        }
      }).catch(err => {
        console.error('获取设施选项失败', err);
      });
    },
    
    // 处理设施选择变化
    handleFacilityChange(value) {
      // 查找选中的设施选项
      const selectedFacility = this.facilityOptions.find(option => option.value === value);
      if (selectedFacility) {
        this.addForm.id = selectedFacility.id;
      } else {
        this.addForm.id = '';
      }
      // 调用原有的fetchAssociateData方法
      this.fetchAssociateData();
    },
    
    // 获取经办人选项
    fetchOperatorOptions() {
      // 使用正确的接口获取自行利用/处置部门经办人数据
      dictionaryApi.operatorInfoPage({ 
        filter: [{
          name: "operatorType",
          value: "DISPOSAL",
          type: "EQ"
        }]
      }).then(res => {
        console.log('获取经办人选项响应:', res);
        const data = res.result || res.data;
        if (data) {
          console.log('经办人数据:', data.records);
          this.operatorOptions = (data.records || []).map(item => ({
            label: item.operatorName,
            value: item.operatorName
          }));
          console.log('经办人选项:', this.operatorOptions);
        }
      }).catch(err => {
        console.error('获取经办人选项失败', err);
      });
    },
    
    // 获取出库部门经办人选项
    fetchOutOperatorOptions() {
      // 使用正确的接口获取出库部门经办人数据
      dictionaryApi.operatorInfoPage({ 
        filter: [{
          name: "operatorType",
          value: "ATTEND",
          type: "EQ"
        }]
      }).then(res => {
        console.log('获取出库部门经办人选项响应:', res);
        const data = res.result || res.data;
        if (data) {
          console.log('出库部门经办人数据:', data.records);
          this.outOperatorOptions = (data.records || []).map(item => ({
            label: item.operatorName,
            value: item.operatorName
          }));
          console.log('出库部门经办人选项:', this.outOperatorOptions);
        }
      }).catch(err => {
        console.error('获取出库部门经办人选项失败', err);
      });
    },
    
    // 获取运送部门经办人选项
    fetchTransportOperatorOptions() {
      // 使用正确的接口获取运送部门经办人数据
      dictionaryApi.operatorInfoPage({ 
        filter: [{
          name: "operatorType",
          value: "TRANSPORT",
          type: "EQ"
        }]
      }).then(res => {
        console.log('获取运送部门经办人选项响应:', res);
        const data = res.result || res.data;
        if (data) {
          console.log('运送部门经办人数据:', data.records);
          this.transportOperatorOptions = (data.records || []).map(item => ({
            label: item.operatorName,
            value: item.operatorName
          }));
          console.log('运送部门经办人选项:', this.transportOperatorOptions);
        }
      }).catch(err => {
        console.error('获取运送部门经办人选项失败', err);
      });
    },
    
    // 获取处置类型选项
    fetchDisposeTypeOptions() {
      // 使用正确的接口获取处置类型选项数据
      dictionaryApi.dictionaryItemPage({ 
        filter: [{
          name: "groupId",
          value: 1021,
          type: "EQ"
        }]
      }).then(res => {
        console.log('获取处置类型选项响应:', res);
        const data = res.result || res.data;
        if (data) {
          console.log('处置类型数据:', data.records);
          // 从后端获取处置类型选项
          this.disposeTypeOptions = (data.records || []).map(item => ({
            label: item.zdxz,
            value: item.zdxbm
          }));
          console.log('处置类型选项:', this.disposeTypeOptions);
        }
      }).catch(err => {
        console.error('获取处置类型选项失败', err);
      });
    },
    
    // 获取关联数据
    fetchAssociateData() {
      this.drawerLoading = true;
      
      // 构建请求参数，使用正确的接口格式
      const params = {
        page: this.drawerCurrentPage,
        size: this.drawerPageSize,
        sorted: [
          { name: "cssj", type: "DESC" }
        ],
        filter: [
          {
            name: "cssj",
            value: ["0000-00-00 00:00:00", new Date().toISOString().slice(0, 19).replace('T', ' ') + " 00:00:00"],
            type: "BETWEEN"
          },
          {
            name: "statusReport",
            value: "1",
            type: "EQ"
          }
        ]
      };
      
      // 如果选择了设施，添加设施筛选条件
      if (this.addForm.facility) {
        params.filter.push({
          name: "zxlyczsstybh",
          value: this.addForm.facility,
          type: "EQ"
        });
      }
      
      console.log('关联添加查询请求参数:', params);
      request.post('/program/production/page', params).then(res => {
        console.log('关联添加查询响应结果:', res);
        const data = res.result || res.data;
        if (data) {
          this.associateData = (data.records || []).map(item => {
            const production = item.production || {};
            const label = production.label || {};
            const uploadFileList = label.uploadFileList || [];
            const uploadFile = uploadFileList[0] || {};
            
            return {
              id: Number(item.id || production.id),
              dispositionInfoId: item.dispositionInfoId || production.dispositionInfoId || '',
              prodNo: item.cstzbm || item.zcsstybh || item.scsstybh || item.scksbh || production.scsstybh || item.id || '-',
              wasteName: production.fwmc || item.fwmc || '-',
              wasteCode: production.fwdm || item.fwdm || '-',
              digitalId: production.szsbm || item.szsbm || '-',
              amount: production.csl || item.csl || 0,
              urlPath: uploadFile.urlPath || '',
              urlHttp: uploadFile.urlHttp || ''
            };
          });
          this.drawerTotal = data.total || 0;
        }
      }).catch(err => {
        console.error('获取关联数据失败', err);
        this.$message.error('获取关联数据失败，请重试');
      }).finally(() => {
        this.drawerLoading = false;
      });
    },
    
    // 查询
    handleQuery() {
      this.currentPage = 1;
      this.fetchSelfUseData();
    },
    
    // 重置
    handleReset() {
      this.queryDate = '';
      this.disposeType = '';
      this.searchKeyword = '';
      this.currentPage = 1;
      this.fetchSelfUseData();
    },
    
    // 标签页切换
    handleTabClick() {
      this.currentPage = 1;
      this.fetchSelfUseData();
    },
    
    // 分页切换
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchSelfUseData();
    },
    
    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除吗?', '提示', { type: 'warning' }).then(() => {
        selfUseApi.delSelfUse(row.id).then(res => {
          if (res.success) {
            this.$message.success('删除成功');
            this.fetchSelfUseData();
          } else {
            this.$message.error(res.message || '删除失败');
          }
        }).catch(err => {
          console.error('删除失败', err);
          this.$message.error('删除失败，请重试');
        });
      });
    },
    
    // 修改
    handleModify(row) {
      this.$message.warning('修改功能开发中');
    },
    
    // 申报
    handleDeclare(row) {
      selfUseApi.selfUsereportdata(row.id).then(res => {
        if (res.success) {
          this.$message.success('申报成功');
          this.fetchSelfUseData();
        } else {
          this.$message.error(res.message || '申报失败');
        }
      }).catch(err => {
        console.error('申报失败', err);
        this.$message.error('申报失败，请重试');
      });
    },
    
    // 撤销
    handleCancel(row) {
      selfUseApi.selfCancelData({ id: row.id }).then(res => {
        if (res.success) {
          this.$message.success('撤销成功');
          this.fetchSelfUseData();
        } else {
          this.$message.error(res.message || '撤销失败');
        }
      }).catch(err => {
        console.error('撤销失败', err);
        this.$message.error('撤销失败，请重试');
      });
    },
    
    // 详情
    handleDetail(row) {
      selfUseApi.selfDetails(row.id).then(res => {
        const data = res.result || res.data;
        if (data) {
          this.$message.info(`详情ID: ${row.id}`);
          // 这里可以添加详情抽屉逻辑
        }
      }).catch(err => {
        console.error('获取详情失败', err);
        this.$message.error('获取详情失败，请重试');
      });
    },

    // 打开添加抽屉
    handleAddDispose() {
      // 重置表单
      this.addForm = {
        type: '',
        facility: '',
        disposeAgent: '',
        outAgent: '',
        transportAgent: ''
      };
      this.selectedRows = [];
      this.drawerCurrentPage = 1;
      
      // 在打开抽屉时获取所有需要的数据
      this.fetchDisposeTypeOptions();
      this.fetchFacilityOptions();
      this.fetchOperatorOptions();
      this.fetchOutOperatorOptions();
      this.fetchTransportOperatorOptions();
      
      // 先打开抽屉，等用户选择设施后再获取关联数据
      this.drawerVisible = true;
    },
    
    // 选择关联数据
    handleSelectionChange(val) {
      this.selectedRows = val;
    },
    
    // 全选所有数据
    handleSelectAll(selection) {
      if (selection.length > 0) {
        // 全选操作：获取所有数据的ID
        this.drawerLoading = true;
        
        // 构建请求参数，获取所有数据
        const params = {
          sorted: [
            { name: "cssj", type: "DESC" }
          ],
          filter: [
            {
              name: "cssj",
              value: ["0000-00-00 00:00:00", new Date().toISOString().slice(0, 19).replace('T', ' ') + " 00:00:00"],
              type: "BETWEEN"
            },
            {
              name: "statusReport",
              value: "1",
              type: "EQ"
            }
          ]
        };
        
        // 如果选择了设施，添加设施筛选条件
        if (this.addForm.facility) {
          params.filter.push({
            name: "zxlyczsstybh",
            value: this.addForm.facility,
            type: "EQ"
          });
        }
        
        request.post('/program/production/page', params).then(res => {
          const data = res.result || res.data;
          if (data) {
            this.selectedRows = (data.records || []).map(item => {
              const production = item.production || {};
              return {
                id: Number(item.id || production.id),
                prodNo: item.cstzbm || item.zcsstybh || item.scsstybh || item.scksbh || production.scsstybh || item.id || '-',
                wasteName: production.fwmc || item.fwmc || '-',
                wasteCode: production.fwdm || item.fwdm || '-',
                digitalId: production.szsbm || item.szsbm || '-',
                amount: production.csl || item.csl || 0
              };
            });
          }
        }).catch(err => {
          console.error('获取所有数据失败', err);
          this.$message.error('获取所有数据失败，请重试');
        }).finally(() => {
          this.drawerLoading = false;
        });
      } else {
        // 取消全选操作
        this.selectedRows = [];
      }
    },
    
    // 关联数据分页切换
    handleDrawerCurrentChange(val) {
      this.drawerCurrentPage = val;
      this.fetchAssociateData();
    },
    
    // 分页切换
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchSelfUseData();
    },
    
    // 保存添加（未申报状态）
    handleDrawerSave() {
      if (this.selectedRows.length === 0) return this.$message.warning('请选择关联项');
      
      const data = {
        zxlyczlx: this.addForm.type,
        zxlyczsstybh: this.addForm.facility,
        zxlyczbmjbr: this.addForm.disposeAgent,
        ckbmjbr: this.addForm.outAgent,
        ysbmjbr: this.addForm.transportAgent,
        relIdList: this.selectedRows.map(item => String(item.id)),
        dispositionInfoId: this.addForm.id, // 使用id
        batchReport: false,
        zxlyczsj: this.formatDateTime(new Date())
      };
      
      selfUseApi.addselfUse(data).then(res => {
        if (res.success) {
          this.$message.success('保存处置单成功');
          this.drawerVisible = false;
          this.fetchSelfUseData();
        } else {
          this.$message.error(res.message || '保存失败');
        }
      }).catch(err => {
        console.error('保存失败', err);
        this.$message.error('保存失败，请重试');
      });
    },
    
    // 提交添加（已申报状态）
    handleDrawerSubmit() {
      if (this.selectedRows.length === 0) return this.$message.warning('请选择关联项');
      
      const data = {
        zxlyczlx: this.addForm.type,
        zxlyczsstybh: this.addForm.facility,
        zxlyczbmjbr: this.addForm.disposeAgent,
        ckbmjbr: this.addForm.outAgent,
        ysbmjbr: this.addForm.transportAgent,
        relIdList: this.selectedRows.map(item => String(item.id)),
        dispositionInfoId: this.addForm.id, // 使用id
        batchReport: true,
        zxlyczsj: this.formatDateTime(new Date())
      };
      
      selfUseApi.addselfUse(data).then(res => {
        if (res.success) {
          this.$message.success('新增处置单成功');
          this.drawerVisible = false;
          this.fetchSelfUseData();
        } else {
          this.$message.error(res.message || '新增失败');
        }
      }).catch(err => {
        console.error('新增失败', err);
        this.$message.error('新增失败，请重试');
      });
    },
    
    // 格式化日期时间
    formatDateTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    
    // 应用前端筛选
    applyFilters() {
      let filteredData = [...this.originalTableData];
      
      // 按标签页筛选
      if (this.activeTab !== 'all') {
        // 这里可以根据实际需求添加标签页筛选逻辑
      }
      
      // 应用排序：未申报排在已申报之前
      filteredData.sort((a, b) => {
        const statusA = a.status === '未申报' ? 0 : 1;
        const statusB = b.status === '未申报' ? 0 : 1;
        if (statusA !== statusB) {
          return statusA - statusB;
        }
        // 状态相同时按创建时间降序排列
        return new Date(b.createTime || 0) - new Date(a.createTime || 0);
      });
      
      this.tableData = filteredData;
      this.totalCount = this.tableData.length;
    }
  }
}
</script>

<style scoped>
.self-use-container {
  height: 100vh;
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
.custom-date-picker :deep(.el-input__suffix),
.custom-select :deep(.el-input__suffix),
.drawer-select :deep(.el-input__suffix) {
  display: flex !important;
  align-items: center !important; 
  height: 24px !important; 
  top: 0 !important;
}

.custom-date-picker :deep(.el-input__icon),
.custom-select :deep(.el-input__icon),
.drawer-select :deep(.el-input__icon) {
  line-height: normal !important; 
  height: auto !important;
  width: 25px !important; 
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 日期选择器的输入内容需要给左边留出日历图标的位置 */
.custom-date-picker :deep(.el-input__inner) {
  padding-left: 30px !important; /* 避免文字和日历图标重叠 */
  padding-right: 15px !important;
}

/* 下拉框图标缩放 */
.custom-select :deep(.el-select__caret),
.drawer-select :deep(.el-select__caret) {
  transform: scale(0.85);
}

/* 抽屉下拉框样式 */
.drawer-select {
  width: 100% !important;
  height: 24px !important;
}

.drawer-select :deep(.el-input__inner) {
  background-color: #F2F3F5 !important;
  border: 1px solid transparent !important;
  height: 24px !important; 
  line-height: 20px !important;
  font-size: 12px !important;
  color: #1D2129 !important;
}

.drawer-select :deep(.el-input__inner:focus) {
  background-color: #FFFFFF !important;
  border-color: #13B63A !important;
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

.btn-search { background-color: #13B63A !important; border-color: #13B63A !important; height: 24px; }
.btn-reset { background-color: #F2F3F5 !important; border: none; color: #4E5969; height: 24px; }

.action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.custom-tabs :deep(.el-tabs) {
  border-bottom: none !important;
  box-shadow: none !important;
}

.custom-tabs :deep(.el-tabs__header) {
  margin: 0;
  border-bottom: none !important;
  box-shadow: none !important;
}

.custom-tabs :deep(.el-tabs__nav-wrap) {
  border-bottom: none !important;
  box-shadow: none !important;
}

.custom-tabs :deep(.el-tabs__nav) {
  border-bottom: none !important;
  box-shadow: none !important;
}

.custom-tabs :deep(.el-tabs__item) {
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
  text-align: center !important;
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  padding: 5px 16px !important;
  border-radius: 100px !important;
  background: #F2F3F5 !important;
  color: #13B63A !important;
  font-weight: 500 !important;
  border: 1px solid #E4E7ED !important;
  box-shadow: none !important;
  text-align: center !important;
}

.custom-tabs :deep(.el-tabs__active-bar) {
  display: none !important;
}

.custom-tabs :deep(.el-tabs__content) {
  border-top: none !important;
  box-shadow: none !important;
}

/* 确保所有可能的线条都被移除 */
.custom-tabs :deep(.el-tabs__nav-container) {
  border-bottom: none !important;
  box-shadow: none !important;
}

.search-input { width: 220px; }
.search-input :deep(.el-input__inner) { border-radius: 16px; }
.btn-add { background-color: #13B63A !important; border: none; height: 32px; }

.table-container { margin-bottom: 16px; }
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