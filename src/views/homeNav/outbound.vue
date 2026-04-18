<template>
  <div class="outbound-container">
    <div class="query-section">
      <h3 class="section-title">查询表格</h3>
      <div class="query-form">
        <div class="query-item">
          <label>出库日期</label>
          <el-date-picker
            v-model="outboundDate"
            type="date"
            placeholder="请选择日期"
            class="custom-date-picker"
            :editable="false"
            @change="handleDateChange"
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
          <el-tab-pane 
            v-for="tab in storageTabs" 
            :key="tab.zcsstybh" 
            :label="tab.zcssmc" 
            :name="tab.zcsstybh"
          ></el-tab-pane>
        </el-tabs>
        
        <div class="right-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入出库批次码关键词"
            class="search-input"
            prefix-icon="el-icon-search"
            clearable
            @keyup.enter.native="handleSearch"
            @blur="handleSearch"
          >
            <template slot="append">
              <el-button icon="el-icon-search" @click="handleSearch"></el-button>
            </template>
          </el-input>
          <el-button type="success" class="btn-add" @click="handleAddOutbound">
            添加危废出库单
          </el-button>
        </div>
      </div>

      <div class="table-container">
        <el-table :data="paginatedData" style="width: 100%" class="custom-table" v-loading="loading">
          <el-table-column prop="batchCode" label="出库批次编码" min-width="120" />
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
      :title="isDetailMode ? '出库详情' : '添加危废出库单'"
      :visible.sync="drawerVisible"
      size="900px"
      custom-class="add-outbound-drawer"
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
                <el-select v-model="addForm.storageNo" placeholder="请选择" class="drawer-select" :disabled="isDetailMode">
                  <el-option
                    v-for="option in storageOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </div>
              <div class="form-item">
                <label>贮存部门经办人</label>
                <el-select v-model="addForm.storageAgent" placeholder="请选择" class="drawer-select" :disabled="isDetailMode">
                  <el-option
                    v-for="option in storageAgentOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </div>
              <div class="form-item">
                <label>运送部门经办人</label>
                <el-select v-model="addForm.transportAgent" placeholder="请选择" class="drawer-select" :disabled="isDetailMode">
                  <el-option
                    v-for="option in transportAgentOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </div>
              <div class="form-item">
                <label>出库去向</label>
                <el-select v-model="addForm.qxValue" placeholder="请选择" class="drawer-select" :disabled="isDetailMode">
                  <el-option label="自行利用处置" value="self_use"></el-option>
                  <el-option label="利用处置" value="utilize"></el-option>
                  <el-option label="委外利用处置" value="external"></el-option>
                </el-select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>出库时间</label>
                <el-date-picker
                  v-model="addForm.cksj"
                  type="datetime"
                  placeholder="选择出库时间"
                  class="drawer-select"
                  :disabled="isDetailMode"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </div>
            </div>
          </div>

          <div class="associate-section">
            <div class="associate-header">
              <h4 class="section-subtitle">关联添加</h4>
              <el-button v-if="!isDetailMode" class="btn-scan" plain>
                <i class="el-icon-full-screen"></i> 扫码添加
              </el-button>
            </div>

            <el-table
              :data="associateData"
              style="width: 100%"
              class="associate-table"
              @selection-change="handleSelectionChange"
            >
              <el-table-column v-if="!isDetailMode" type="selection" width="55" align="center"></el-table-column>
              <el-table-column prop="prodNo" label="生产设施编号" min-width="110"></el-table-column>
              <el-table-column prop="wasteName" label="危废名称" min-width="100"></el-table-column>
              <el-table-column prop="wasteCode" label="危废代码" min-width="100"></el-table-column>
              <el-table-column prop="digitalId" label="数字识别码" min-width="220"></el-table-column>
              <el-table-column label="标签信息" min-width="80">
                <template slot-scope="scope">
                  <span class="text-success cursor-pointer" @click="viewLabel(scope.row)">查看标签</span>
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="产生量" min-width="80"></el-table-column>
            </el-table>

            <div class="drawer-pagination-wrapper">
              <div class="selected-info" v-if="!isDetailMode">
                已选{{ selectedRows.length }}条 <span class="gap">共{{ drawerTotal }}条</span>
              </div>
              <div class="selected-info" v-else>
                共{{ drawerTotal }}条
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

        <div class="drawer-footer" v-if="!isDetailMode">
          <el-button @click="handleDrawerSave" class="btn-drawer-save">保存</el-button>
          <el-button type="success" @click="handleDrawerSubmit" class="btn-drawer-submit">确定申报</el-button>
        </div>
        <div class="drawer-footer" v-else>
          <el-button @click="drawerVisible = false; isDetailMode = false; currentEditId = null;" class="btn-drawer-save">退出</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 图片预览弹窗 -->
    <el-dialog
      :visible.sync="previewVisible"
      width="400px"
      title="标签图片"
      :close-on-click-modal="true"
      append-to-body
    >
      <div style="text-align: center;">
        <img :src="previewImageUrl" style="max-width: 100%; max-height: 70vh;" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { outboundApi, myApi, dictionaryApi } from '@/api/index';
import request from '@/utils/request';
import { Message } from 'element-ui';

export default {
  name: 'OutboundPage',
  data() {
    return {
      outboundDate: '',
      cksj: '',
      activeTab: 'all', 
      searchKeyword: '',
      searchTimer: null,
      loading: false,
      
      // 标签页数据
      storageTabs: [],
      
      // 页面主表格分页相关
      currentPage: 1,
      pageSize: 10, // 表格高度360px，行高32px，可显示10行（减去表头32px后）
      totalCount: 0,
      tableData: [],
      // 原始数据
      originalTableData: [],

      // ================= 抽屉相关数据 =================
      drawerVisible: false,
      addForm: {
        storageNo: '',
        storageAgent: '',
        transportAgent: '',
        qxValue: '' // 出库去向字段
      },
      // 抽屉表格数据
      associateData: [],
      selectedRows: [], 
      drawerCurrentPage: 1,
      drawerPageSize: 10,
      drawerTotal: 0,
      // 抽屉选项数据
      storageOptions: [],
      storageAgentOptions: [],
      transportAgentOptions: [],
      
      // 详情模式
      isDetailMode: false,
      currentEditId: null,
      
      // 图片预览
      previewVisible: false,
      previewImageUrl: ''
    }
  },
  computed: {
    paginatedData() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.tableData.slice(startIndex, endIndex);
    }
  },
  methods: {
    // 获取出库数据
    fetchOutboundData() {
      this.loading = true;
      
      // 构建请求参数
      const params = {
        page: 1,
        size: 100,
        sorted: [
          { name: "statusReport", type: "ASC" },
          { name: "cksj", type: "DESC" }
        ],
        groupByFields: ["batchNo"]
      };
      
      if (this.activeTab !== 'all') {
        params.zcsstybh = this.activeTab;
      }
      
      // 添加出库日期筛选条件
      if (this.outboundDate) {
        // 直接使用字符串形式的日期，避免时区转换问题
        let dateStr = this.outboundDate;
        if (dateStr instanceof Date) {
          // 如果是Date对象，使用本地时间格式化
          const year = dateStr.getFullYear();
          const month = String(dateStr.getMonth() + 1).padStart(2, '0');
          const day = String(dateStr.getDate()).padStart(2, '0');
          dateStr = `${year}-${month}-${day}`;
        } else if (typeof dateStr === 'string') {
          // 如果是字符串，确保格式正确
          dateStr = dateStr.split('T')[0];
        }
        if (!params.filter) {
          params.filter = [];
        }
        params.filter.push({
          name: "cksj",
          value: dateStr,
          type: "LIKE"  // 根据后端API要求使用 LIKE 类型
        });
      }
      
      // 添加搜索关键词筛选条件
      if (this.searchKeyword) {
        if (!params.filter) {
          params.filter = [];
        }
        params.filter.push({
          name: "batchNo",  // 按批次号搜索，使用正确的字段名
          value: this.searchKeyword,  // 使用原始值，让后端处理匹配
          type: "LIKE"
        });
      }
      

      console.log('搜索请求参数:', params);
      outboundApi.outboundPage(params).then(res => {
        console.log('搜索响应结果:', res);
        const data = res.result || res.data;
        if (data) {
          this.originalTableData = (data.records || []).map(item => {
            const production = item.production || {};
            return {
              id: item.id,
              batchCode: (() => { const code = item.batchCode || item.batchNo; if (typeof code === 'string' && /^[A-Z]{2}_/.test(code)) { return code.split('_').slice(0, 2).join('_'); } return code; })() || '-',
              batchNo: item.batchNo || '-',
              wasteName: item.fwmc || production.wfmc || production.fwmc || production.wasteName || '-',
              wasteCode: item.fwdm || production.wfdm || production.fwdm || production.wasteCode || '-',
              digitalId: item.szsbm || production.szsbm || production.digitalId || '-',
              status: item.statusReport !== undefined ? (item.statusReport === 1 ? '已申报' : '未申报') : (item.status === 1 ? '已申报' : '未申报'),
              statusReport: item.statusReport !== undefined ? item.statusReport : (item.status || 0),
              zcsstybh: item.zcsstybh || '-',
              zcssmc: item.zcssmc || '-',
              cksj: item.cksj || item.ksj || '-',
              storageInfoId: item.storageInfoId || '',
              zcbmjbr: item.zcbmjbr || '',
              ysbmjbr: item.ysbmjbr || '',
              qxValue: item.qxValue || ''
            };
          });
          
          this.applyFilters();
          
          const storageTabMap = new Map();
          this.originalTableData.forEach(item => {
            if (item.zcsstybh && item.zcsstybh !== '-') {
              if (!storageTabMap.has(item.zcsstybh)) {
                let storageName = item.zcssmc;
                if (!storageName || storageName === '-') {
                  const match = item.zcsstybh.match(/[A-Z].*/);
                  storageName = match ? match[0] : item.zcsstybh;
                }
                storageTabMap.set(item.zcsstybh, {
                  zcsstybh: item.zcsstybh,
                  zcssmc: storageName
                });
              }
            }
          });
          this.storageTabs = Array.from(storageTabMap.values());
        }
      }).catch(err => {
        console.error('获取出库数据失败', err);
        Message.error('获取数据失败，请重试');
      }).finally(() => {
        this.loading = false;
      });
    },
    
    // 格式化日期为 YYYY-MM-DD
    formatDate(date) {
      if (!date) return '';
      
      if (typeof date === 'string') {
        return date;
      }
      
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    
    // 应用前端筛选
    applyFilters() {
      let filteredData = [...this.originalTableData];
      
      // 按标签页筛选贮存设施
      if (this.activeTab !== 'all') {
        filteredData = filteredData.filter(item => {
          return item.zcsstybh === this.activeTab;
        });
      }
      

      
      // 应用排序：未申报排在已申报之前
      filteredData.sort((a, b) => {
        const statusA = a.status === '未申报' ? 0 : 1;
        const statusB = b.status === '未申报' ? 0 : 1;
        if (statusA !== statusB) {
          return statusA - statusB;
        }
        
        const batchCodeA = a.batchCode || '';
        const batchCodeB = b.batchCode || '';
        return batchCodeB.localeCompare(batchCodeA);
      });
      
      this.tableData = filteredData;
      this.totalCount = this.tableData.length;
      
      // 如果有搜索关键词，应用搜索过滤
      if (this.searchKeyword.trim()) {
        this.applySearchFilter();
      }
    },
    
    // 应用搜索过滤
    applySearchFilter() {
      const keyword = this.searchKeyword.trim();
      if (!keyword) {
        this.totalCount = this.tableData.length;
        return;
      }
      
      // 有搜索关键词时，从原始数据中过滤
      let filteredData = [...this.originalTableData];
      
      // 先应用其他筛选条件
      if (this.activeTab !== 'all') {
        filteredData = filteredData.filter(item => {
          return item.zcsstybh === this.activeTab;
        });
      }
      

      
      // 再应用搜索过滤
      filteredData = filteredData.filter(item => {
        return (
          item.batchCode && item.batchCode.includes(keyword)
        );
      });
      
      this.tableData = filteredData;
      this.totalCount = this.tableData.length;
      this.currentPage = 1;
    },
    
    // 出库日期变化处理
    handleDateChange() {
      this.searchKeyword = '';
      this.activeTab = 'all';
      this.currentPage = 1;
      this.fetchOutboundData();
    },
    
    // 搜索关键词变化处理
    handleSearch() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      
      this.searchTimer = setTimeout(() => {
        // 搜索时重置其他筛选条件
        this.activeTab = 'all'; // 重置标签页为全部
        this.outboundDate = ''; // 重置出库日期筛选
        this.currentPage = 1; // 重置到第一页
        this.fetchOutboundData(); // 重新发起后端请求
      }, 300);
    },
    
    handleQuery() {
      this.activeTab = 'all';
      this.currentPage = 1;
      this.fetchOutboundData();
    },
    
    handleReset() {
      this.outboundDate = '';
      this.searchKeyword = '';
      this.activeTab = 'all';
      this.currentPage = 1;
      this.fetchOutboundData();
    },
    
    handleTabClick() {
      this.outboundDate = '';
      this.searchKeyword = '';
      this.currentPage = 1;
      this.fetchOutboundData();
    },
    
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    
    // 删除操作
    handleDelete(row) {
      this.$confirm(
        `<div class="delete-confirm-wrapper">
           <div class="delete-confirm-title">
             <i class="el-icon-warning custom-warning-icon"></i>
             <span>温馨提示</span>
           </div>
           <div class="delete-confirm-text">是否确定删除?</div>
         </div>`,
        '',
        {
          dangerouslyUseHTMLString: true,
          showClose: false,
          customClass: 'custom-delete-modal',
          cancelButtonClass: 'custom-cancel-btn',
          confirmButtonClass: 'custom-confirm-btn',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      ).then(() => {
        outboundApi.delOutbound(row.id).then(res => {
          if (res.code === '0000' || res.success) {
            this.fetchOutboundData();
            Message.success('删除成功');
          } else {
            Message.error('删除失败：' + (res.message || '未知错误'));
          }
        }).catch(err => {
          console.error('删除失败', err);
          Message.error('删除失败，请重试');
        });
      }).catch(() => {});
    },
    
    // 申报操作
    handleDeclare(row) {
      outboundApi.outreportdataByBatch(row.batchCode).then(res => {
        if (res.code === '0000' || res.success) {
          this.fetchOutboundData();
          Message.success('申报成功');
        } else {
          this.fetchOutboundData();
          if (res.message && res.message.includes('请勿重复提交')) {
            Message.warning('该数据已经申报过，请勿重复提交');
          } else {
            Message.error('申报失败：' + (res.message || '未知错误'));
          }
        }
      }).catch(err => {
        console.error('申报失败', err);
        this.fetchOutboundData();
        Message.error('申报失败，请重试');
      });
    },
    
    // 撤销操作
    handleCancel(row) {
      this.$prompt('请输入撤销备注', '填写撤销备注', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入',
        inputValidator: (value) => {
          if (!value || value.trim() === '') {
            return '请填写撤销备注';
          }
          return true;
        }
      }).then(({ value }) => {
        console.log('撤销请求参数:', {
          bz: value,
          relId: row.id
        });
        console.log('完整的row数据:', row);
        outboundApi.outCancelData({
          bz: value,
          relId: row.id
        }).then(res => {
          if (res.code === '0000' || res.success) {
            this.fetchOutboundData();
            Message.success('撤销成功');
          } else {
            Message.error('撤销失败：' + (res.message || '未知错误'));
          }
        }).catch(err => {
          console.error('撤销失败', err);
          console.error('错误详情:', err.response || err);
          Message.error('撤销失败：' + (err.message || '网络错误，请重试'));
        });
      }).catch(() => {});
    },
    
    // 查看详情
    handleDetail(row) {
      console.log('点击详情按钮，批次码：', row.batchNo);
      console.log('完整的行数据：', row);
      // 进入详情模式
      this.isDetailMode = true;
      this.currentEditId = row.batchNo; // 使用 batchNo 作为详情ID
      outboundApi.outbatchgDetails(row.batchNo).then(res => {
        console.log('获取详情接口响应：', res);
        const data = res.result || res.data || {};
        console.log('获取到的详情数据：', data);
        
        // 填充表单数据，优先使用接口返回的数据，其次使用行数据
        this.addForm = {
          storageNo: data.storageInfoId || row.storageInfoId || '',
          storageAgent: data.zcbmjbr || row.zcbmjbr || '',
          transportAgent: data.ysbmjbr || row.ysbmjbr || '',
          qxValue: data.qxValue || row.qxValue || '',
          cksj: data.cksj || row.cksj || '' // 出库时间
        };
        
        // 打开抽屉
        this.drawerVisible = true;
        console.log('抽屉打开状态：', this.drawerVisible);
        this.selectedRows = [];
        
        // 获取抽屉选项数据
        this.fetchDrawerOptions();
        
        // 获取关联数据
        this.fetchAssociateData();
      }).catch(err => {
        console.error('获取详情失败', err);
        Message.error('获取详情失败，请重试');
      });
    },

    // 打开抽屉
    handleAddOutbound() {
      this.drawerVisible = true;
      this.selectedRows = [];
      this.fetchDrawerOptions();
      this.fetchAssociateData();
    },
    
    // 获取抽屉选项数据（贮存设施、经办人）
    fetchDrawerOptions() {
      console.log('开始获取抽屉选项数据');
      // 并行获取贮存设施、贮存部门经办人和运送部门经办人列表
      Promise.all([
        myApi.storagePage({}),
        dictionaryApi.operatorInfoPage({ 
          filter: [{name: "operatorType", value: "STORAGE", type: "EQ"}]
        }),
        dictionaryApi.operatorInfoPage({ 
          filter: [{name: "operatorType", value: "TRANSPORT", type: "EQ"}]
        })
      ]).then(([storageRes, storageOperatorRes, transportOperatorRes]) => {
        console.log('获取抽屉选项数据成功', { storageRes, storageOperatorRes, transportOperatorRes });
        // 处理贮存设施数据
        const storageData = storageRes.result || storageRes.data;
        if (storageData) {
          this.storageOptions = (storageData.records || []).map(item => {
            // 使用正则表达式从第一个字母（A-Z）到结尾提取
            const zcsstybh = item.zcsstybh || item.zcmc || '-';
            const match = zcsstybh.match(/[A-Z].*/);
            const ssbm = match ? match[0] : zcsstybh;
            
            return {
              label: item.zcmc || ssbm,
              value: item.id,  // 使用ID作为value
              zcsstybh: zcsstybh  // 保存编号信息
            };
          });
        }
        
        // 处理贮存部门经办人数据
        const storageOperatorData = storageOperatorRes.result || storageOperatorRes.data;
        if (storageOperatorData) {
          const storageOperatorRecords = storageOperatorData.records || [];
          this.storageAgentOptions = storageOperatorRecords.map(item => ({
            label: item.operatorName,
            value: item.operatorName
          }));
        }
        
        // 处理运送部门经办人数据
        const transportOperatorData = transportOperatorRes.result || transportOperatorRes.data;
        if (transportOperatorData) {
          const transportOperatorRecords = transportOperatorData.records || [];
          this.transportAgentOptions = transportOperatorRecords.map(item => ({
            label: item.operatorName,
            value: item.operatorName
          }));
        }
      }).catch(err => {
        console.error('获取抽屉选项数据失败', err);
      });
    },
    
    // 获取关联数据
    fetchAssociateData() {
      this.loading = true;
      if (this.isDetailMode && this.currentEditId) {
        // 详情模式：获取该出库单关联的数据
        console.log('详情模式，currentEditId：', this.currentEditId);
        outboundApi.outbatchgDetails(this.currentEditId).then(res => {
          console.log('获取出库详情接口响应：', res);
          const data = res.result || res.data;
          console.log('获取到的详情数据：', data);
          
          if (data) {
            
            // 尝试从不同字段获取关联数据
            let associatedItems = [];
            
            console.log('检查数据结构：');
            console.log('data.items：', data.items);
            console.log('data.records：', data.records);
            console.log('data.productionList：', data.productionList);
            console.log('data.storageIdList：', data.storageIdList);
            console.log('data.storageId：', data.storageId);
            console.log('data.id：', data.id);
            
            if (data.items) {
              associatedItems = data.items;
            } else if (data.records) {
              associatedItems = data.records;
            } else if (data.productionList) {
              associatedItems = data.productionList;
            } else if (data.storageIdList) {
              // 通过storageIdList调用storagePage获取详细信息
              console.log('使用storageIdList获取关联数据：', data.storageIdList);
              const params = {
                filter: [
                  {
                    name: "id",
                    value: data.storageIdList.join(","),
                    type: "IN",
                    alias: "p"
                  }
                ]
              };
              
              myApi.storagePage(params).then(res => {
                const storageData = res.result || res.data;
                console.log('获取storagePage响应：', res);
                console.log('storageData：', storageData);
                if (storageData && storageData.records && storageData.records.length > 0) {
                  console.log('storageData.records.length：', storageData.records.length);
                  this.associateData = storageData.records.map(item => {
                    const production = item.production || {};
                    const label = production.label || {};
                    const uploadFileList = label.uploadFileList || [];
                    const uploadFile = uploadFileList[0] || {};
                    
                    return {
                      id: Number(item.id || production.id), // 确保 id 是数字类型
                      prodNo: item.zcsstybh || item.scsstybh || item.scksbh || item.id || '-',
                      wasteName: production.fwmc || '-',
                      wasteCode: production.fwdm || '-',
                      digitalId: production.szsbm || item.szsbm || '-',
                      amount: production.csl || item.csl || 0,
                      urlPath: uploadFile.urlPath || '',
                      urlHttp: uploadFile.urlHttp || ''
                    };
                  });
                  this.drawerTotal = this.associateData.length;
                  console.log('associateData.length：', this.associateData.length);
                } else {
                  console.log('storageData.records为空');
                  this.associateData = [];
                  this.drawerTotal = 0;
                }
              }).catch(err => {
                console.error('获取关联数据失败', err);
                this.associateData = [];
                this.drawerTotal = 0;
              }).finally(() => {
                this.loading = false;
              });
              return; // 提前返回，避免执行后续逻辑
            } else if (data.storageId) {
              // 通过storageId调用storagePage获取详细信息
              console.log('使用storageId获取关联数据：', data.storageId);
              const params = {
                filter: [
                  {
                    name: "id",
                    value: String(data.storageId),
                    type: "EQ",
                    alias: "p"
                  }
                ]
              };
              
              myApi.storagePage(params).then(res => {
                const storageData = res.result || res.data;
                console.log('获取storagePage响应：', res);
                console.log('storageData：', storageData);
                if (storageData && storageData.records && storageData.records.length > 0) {
                  console.log('storageData.records.length：', storageData.records.length);
                  this.associateData = storageData.records.map(item => {
                    const production = item.production || {};
                    const label = production.label || {};
                    const uploadFileList = label.uploadFileList || [];
                    const uploadFile = uploadFileList[0] || {};
                    
                    return {
                      id: Number(item.id || production.id), // 确保 id 是数字类型
                      prodNo: item.zcsstybh || item.scsstybh || item.scksbh || item.id || '-',
                      wasteName: production.fwmc || '-',
                      wasteCode: production.fwdm || '-',
                      digitalId: production.szsbm || item.szsbm || '-',
                      amount: production.csl || item.csl || 0,
                      urlPath: uploadFile.urlPath || '',
                      urlHttp: uploadFile.urlHttp || ''
                    };
                  });
                  this.drawerTotal = this.associateData.length;
                  console.log('associateData.length：', this.associateData.length);
                } else {
                  console.log('storageData.records为空');
                  this.associateData = [];
                  this.drawerTotal = 0;
                }
              }).catch(err => {
                console.error('获取关联数据失败', err);
                this.associateData = [];
                this.drawerTotal = 0;
              }).finally(() => {
                this.loading = false;
              });
              return; // 提前返回，避免执行后续逻辑
            }
            
            if (associatedItems.length > 0) {
              console.log('associatedItems.length：', associatedItems.length);
              // 处理关联数据
              this.associateData = associatedItems.map((item, index) => {
                const production = item.production || item; // 如果是直接的生产数据，使用item本身
                const label = production.label || {};
                const uploadFileList = label.uploadFileList || [];
                const uploadFile = uploadFileList[0] || {};
                
                return {
                  id: Number(item.id || production.id), // 确保 id 是数字类型
                  prodNo: item.zcsstybh || item.scsstybh || item.scksbh || production.scsstybh || item.id || '-',
                  wasteName: production.fwmc || item.fwmc || '-',
                  wasteCode: production.fwdm || item.fwdm || '-',
                  digitalId: production.szsbm || item.szsbm || '-',
                  amount: production.csl || item.csl || 0,
                  urlPath: uploadFile.urlPath || '',
                  urlHttp: uploadFile.urlHttp || ''
                };
              });
              this.drawerTotal = this.associateData.length;
              console.log('associateData.length：', this.associateData.length);
            } else {
              console.log('associatedItems为空');
              // 尝试直接调用storagePage获取数据
              console.log('尝试直接调用storagePage获取数据');
              const params = {
                filter: [
                  {
                    name: "status",
                    value: "2",
                    type: "EQ",
                    alias: "p"
                  }
                ]
              };
              
              myApi.storagePage(params).then(res => {
                const storageData = res.result || res.data;
                console.log('获取storagePage响应：', res);
                console.log('storageData：', storageData);
                if (storageData && storageData.records && storageData.records.length > 0) {
                  console.log('storageData.records.length：', storageData.records.length);
                  this.associateData = storageData.records.map(item => {
                    const production = item.production || {};
                    const label = production.label || {};
                    const uploadFileList = label.uploadFileList || [];
                    const uploadFile = uploadFileList[0] || {};
                    
                    return {
                      id: Number(item.id || production.id), // 确保 id 是数字类型
                      prodNo: item.zcsstybh || item.scsstybh || item.scksbh || item.id || '-',
                      wasteName: production.fwmc || '-',
                      wasteCode: production.fwdm || '-',
                      digitalId: production.szsbm || item.szsbm || '-',
                      amount: production.csl || item.csl || 0,
                      urlPath: uploadFile.urlPath || '',
                      urlHttp: uploadFile.urlHttp || ''
                    };
                  });
                  this.drawerTotal = this.associateData.length;
                  console.log('associateData.length：', this.associateData.length);
                } else {
                  console.log('storageData.records为空');
                  this.associateData = [];
                  this.drawerTotal = 0;
                }
              }).catch(err => {
                console.error('获取关联数据失败', err);
                this.associateData = [];
                this.drawerTotal = 0;
              }).finally(() => {
                this.loading = false;
              });
              return; // 提前返回，避免执行后续逻辑
            }
          } else {
            console.log('data为空，尝试直接调用storagePage获取数据');
            // 尝试直接调用storagePage获取数据
            const params = {
              filter: [
                {
                  name: "status",
                  value: "2",
                  type: "EQ",
                  alias: "p"
                }
              ]
            };
            
            myApi.storagePage(params).then(res => {
              const storageData = res.result || res.data;
              console.log('获取storagePage响应：', res);
              console.log('storageData：', storageData);
              if (storageData && storageData.records && storageData.records.length > 0) {
                console.log('storageData.records.length：', storageData.records.length);
                this.associateData = storageData.records.map(item => {
                  const production = item.production || {};
                  const label = production.label || {};
                  const uploadFileList = label.uploadFileList || [];
                  const uploadFile = uploadFileList[0] || {};
                  
                  return {
                    id: Number(item.id || production.id), // 确保 id 是数字类型
                    prodNo: item.zcsstybh || item.scsstybh || item.scksbh || item.id || '-',
                    wasteName: production.fwmc || '-',
                    wasteCode: production.fwdm || '-',
                    digitalId: production.szsbm || item.szsbm || '-',
                    amount: production.csl || item.csl || 0,
                    urlPath: uploadFile.urlPath || '',
                    urlHttp: uploadFile.urlHttp || ''
                  };
                });
                this.drawerTotal = this.associateData.length;
                console.log('associateData.length：', this.associateData.length);
              } else {
                console.log('storageData.records为空');
                this.associateData = [];
                this.drawerTotal = 0;
              }
            }).catch(err => {
              console.error('获取关联数据失败', err);
              this.associateData = [];
              this.drawerTotal = 0;
            }).finally(() => {
              this.loading = false;
            });
            return; // 提前返回，避免执行后续逻辑
          }
          this.loading = false;
        }).catch(err => {
          console.error('获取关联数据失败', err);
          // 尝试直接调用storagePage获取数据
          console.log('接口调用失败，尝试直接调用storagePage获取数据');
          const params = {
            filter: [
              {
                name: "status",
                value: "2",
                type: "EQ",
                alias: "p"
              }
            ]
          };
          
          myApi.storagePage(params).then(res => {
            const storageData = res.result || res.data;
            console.log('获取storagePage响应：', res);
            console.log('storageData：', storageData);
            if (storageData && storageData.records && storageData.records.length > 0) {
              console.log('storageData.records.length：', storageData.records.length);
              this.associateData = storageData.records.map(item => {
                const production = item.production || {};
                const label = production.label || {};
                const uploadFileList = label.uploadFileList || [];
                const uploadFile = uploadFileList[0] || {};
                
                return {
                  id: Number(item.id || production.id), // 确保 id 是数字类型
                  prodNo: item.zcsstybh || item.scsstybh || item.scksbh || item.id || '-',
                  wasteName: production.fwmc || '-',
                  wasteCode: production.fwdm || '-',
                  digitalId: production.szsbm || item.szsbm || '-',
                  amount: production.csl || item.csl || 0,
                  urlPath: uploadFile.urlPath || '',
                  urlHttp: uploadFile.urlHttp || ''
                };
              });
              this.drawerTotal = this.associateData.length;
              console.log('associateData.length：', this.associateData.length);
            } else {
              console.log('storageData.records为空');
              this.associateData = [];
              this.drawerTotal = 0;
            }
          }).catch(err => {
            console.error('获取关联数据失败', err);
            this.associateData = [];
            this.drawerTotal = 0;
          }).finally(() => {
            this.loading = false;
          });
        });
      } else {
        // 编辑或新增模式：获取未出库的危废
        const params = {
          filter: [
            {
              name: "status",
              value: "2",
              type: "EQ",
              alias: "p"
            }
          ],
          sorted: [
            {
              name: "rksj",
              type: "DESC"
            }
          ]
        };
        
        // 调用获取关联数据的API
        request.post('/program/storage/page', params).then(res => {
          const data = res.result || res.data;
          if (data) {
            this.associateData = (data.records || []).map(item => {
              const production = item.production || {};
              const label = production.label || {};
              const uploadFileList = label.uploadFileList || [];
              const uploadFile = uploadFileList[0] || {};
              
              return {
                id: Number(item.id || production.id), // 确保 id 是数字类型
                prodNo: item.zcsstybh || item.scsstybh || item.scksbh || item.id || '-',
                wasteName: production.fwmc || '-',
                wasteCode: production.fwdm || '-',
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
          this.associateData = [];
          this.drawerTotal = 0;
        }).finally(() => {
          this.loading = false;
        });
      }
    },
    
    // 监听抽屉内表格复选框变化
    handleSelectionChange(val) {
      this.selectedRows = val;
    },
    
    // 查看标签
    viewLabel(row) {
      const urlPath = row.urlPath ? row.urlPath.trim() : '';
      const urlHttp = row.urlHttp ? row.urlHttp.trim() : '';
      
      if (urlPath && urlHttp) {
        let domain = urlPath;
        if (!domain.startsWith('http')) {
          domain = 'http://' + domain;
        }
        domain = domain.replace(/\/+$/, '');
        
        let path = urlHttp;
        if (!path.startsWith('/')) {
          path = '/' + path;
        }
        
        this.previewImageUrl = domain + path;
        this.previewVisible = true;
      } else {
        Message.warning('标签信息不完整');
      }
    },
    
    // 抽屉分页切换
    handleDrawerCurrentChange(val) {
      this.drawerCurrentPage = val;
    },
    
    // 抽屉保存逻辑（保存为草稿状态）
    handleDrawerSave() {
      if (this.selectedRows.length === 0) {
        Message.warning('请至少选择一条关联的危废记录');
        return;
      }
      
      // 根据storageNo(ID)找到对应的zcsstybh(编号)
      const selectedStorage = this.storageOptions.find(option => option.value === this.addForm.storageNo);
      const zcsstybh = selectedStorage ? selectedStorage.zcsstybh : '';
      
      const submitData = {
        storageInfoId: Number(this.addForm.storageNo),
        zcsstybh: zcsstybh,
        zcbmjbr: this.addForm.storageAgent,
        ysbmjbr: this.addForm.transportAgent,
        storageIdList: this.selectedRows.map(item => String(item.id)),
        qx: this.addForm.qxValue ,
        qxValue: this.addForm.qxValue,
        batchReport: false,
        cksj: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      
      console.log('提交数据:', submitData);
      outboundApi.addoutbound(submitData).then(res => {
        console.log('保存API返回:', res);
        if (res.code === '0000' || res.success) {
          this.fetchOutboundData();
          this.drawerVisible = false;
          Message.success(`成功保存出库单草稿，已新增 ${this.selectedRows.length} 条记录`);
          
          // 重置表单
          this.addForm = {
            storageNo: '',
            storageAgent: '',
            transportAgent: '',
            qxValue: ''
          };
        } else {
          console.error('保存失败原因:', res.message);
          Message.error('保存失败：' + (res.message || '未知错误'));
        }
      }).catch(err => {
        console.error('保存失败', err);
        Message.error('保存失败，请重试');
      });
    },
    
    // 抽屉确定申报逻辑（提交申报状态）
    handleDrawerSubmit() {
      if (this.selectedRows.length === 0) {
        Message.warning('请至少选择一条关联的危废记录');
        return;
      }
      
      // 根据storageNo(ID)找到对应的zcsstybh(编号)
      const selectedStorage = this.storageOptions.find(option => option.value === this.addForm.storageNo);
      const zcsstybh = selectedStorage ? selectedStorage.zcsstybh : '';
      
      const submitData = {
        storageInfoId: Number(this.addForm.storageNo),
        zcsstybh: zcsstybh,
        zcbmjbr: this.addForm.storageAgent,
        ysbmjbr: this.addForm.transportAgent,
        storageIdList: this.selectedRows.map(item => String(item.id)),
        qx: this.addForm.qxValue || "zxlycz", // 使用用户选择的出库去向
        qxValue: this.addForm.qxValue,
        batchReport: true, // 1 表示申报状态
        cksj: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      
      console.log('提交数据:', submitData);
      outboundApi.addoutbound(submitData).then(res => {
        console.log('申报API返回:', res);
        if (res.code === '0000' || res.success) {
          this.fetchOutboundData();
          this.drawerVisible = false;
          Message.success(`成功添加出库单，已新增 ${this.selectedRows.length} 条记录`);
          
          // 重置表单
          this.addForm = {
            storageNo: '',
            storageAgent: '',
            transportAgent: '',
            qxValue: ''
          };
        } else {
          console.error('申报失败原因:', res.message);
          Message.error('添加失败：' + (res.message || '未知错误'));
        }
      }).catch(err => {
        console.error('添加失败', err);
        Message.error('添加失败，请重试');
      });
    }
  },
  mounted() {
    this.fetchOutboundData();
  }
}
</script>

<style scoped>
.outbound-container {
  height:100vh; 
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
.custom-date-picker { width: 240px !important;height: 24px !important; }
.custom-date-picker :deep(.el-input__inner) { 
  background-color: #F2F3F5 !important;
  border: 1px solid transparent !important;
  height: 24px !important; 
  line-height: 20px !important;
  font-size: 12px !important;
  color: #1D2129 !important;
  padding-left: 30px !important;
  padding-right: 15px !important;
}
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
.query-buttons { display: flex; gap: 12px; }
.btn-search { background-color: #13B63A !important; border-color: #13B63A !important; height: 32px; padding: 0 16px; }
.btn-reset { background-color: #F2F3F5 !important; border-color: transparent !important; color: #4E5969 !important; height: 32px; padding: 0 16px; }
.main-content-section { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
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
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  padding: 5px 16px !important;
  border-radius: 100px !important;
  background: #F2F3F5 !important;
  color: #13B63A !important;
  font-weight: 500 !important;
  border: 1px solid #E4E7ED !important;
  box-shadow: none !important;
}

.custom-tabs :deep(.el-tabs__active-bar) {
  display: none !important;
}

.custom-tabs :deep(.el-tabs__content) {
  border-top: none !important;
  box-shadow: none !important;
}


.custom-tabs :deep(.el-tabs__nav-container) {
  border-bottom: none !important;
  box-shadow: none !important;
}

.custom-tabs :deep(.el-tabs__header.is-top) {
  border-bottom: none !important;
  box-shadow: none !important;
}
.right-actions { display: flex; align-items: center; gap: 16px; }
.search-input { width: 200px; }
.search-input :deep(.el-input__inner) { background-color: #F2F3F5; border: none; height: 32px; line-height: 32px; border-radius: 16px; }
.btn-add { background-color: #13B63A !important; border-color: #13B63A !important; height: 32px; padding: 0 16px; border-radius: 4px; }
.table-container {
  flex: 1;
  overflow: hidden;
  margin-bottom: 20px;
}

/* 表格整体高度约束 */
.custom-table {
  height: 360px !important;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5; /* 防止底部边框丢失 */
}

/* 隐藏表格的滚动条 */
.custom-table :deep(.el-table__body-wrapper) {
  overflow: hidden !important;
}
.custom-table :deep(.el-table__header-wrapper) {
  overflow: hidden !important;
}

/* 统一控制表格行高：360px / 11行 = 32px */
.custom-table :deep(.el-table__row) {
  height: 32px !important;
}

.custom-table :deep(.el-table__cell) {
  height: 32px !important;
  line-height: 32px !important;
  padding: 0 12px !important; /* 取消默认的上下 padding 防止撑开高度 */
  font-family: Microsoft YaHei;
  font-weight: 400;
  font-style: normal;
  font-size: 12px;
  letter-spacing: 0%;
}
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

/* ================= 抽屉专属样式 ================= */

/* 覆盖 Element UI 默认的抽屉 Header 样式 */
:deep(.add-outbound-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #F2F3F5;
  color: #1D2129;
  font-weight: bold;
  font-size: 16px;
}

:deep(.add-outbound-drawer .el-drawer__body) {
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
  gap: 16px; /* 调整间距使得 4 个输入框更好摆放 */
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
  height: 32px;
  line-height: 32px;
}
.associate-table :deep(.el-table__row) {
  height: 32px;
  line-height: 32px;
}
/* 将复选框勾选颜色改为主题绿 */
.associate-table :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #13B63A;
  border-color: #13B63A;
}

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