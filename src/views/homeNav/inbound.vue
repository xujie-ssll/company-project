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
            :max="currentDate"
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
            placeholder="请输入入库批次码关键词"
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
          <el-button type="success" class="btn-add" @click="handleAddInbound">
            添加危废入库单
          </el-button>
        </div>
      </div>

      <!-- 调试区域 -->
      <div v-if="false" class="debug-area">
        <h3>调试信息</h3>
        <pre>{{ JSON.stringify(tableData, null, 2) }}</pre>
      </div>

      <div class="table-container">
        <el-table :data="paginatedData" style="width: 100%" class="custom-table" v-loading="loading"
          :row-style="{ height: '32px' }"
          :cell-style="{ 
            padding: '0 12px',
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            lineHeight: '32px',
            verticalAlign: 'middle'
          }">
          <el-table-column prop="rktzbm" label="入库批次编码" min-width="120" />
          <el-table-column prop="wfmc" label="危废名称" min-width="120" />
          
          <el-table-column prop="wfdm" label="危废代码" min-width="120" />
          <el-table-column prop="szsbm" label="数字识别码" min-width="240" />
          <el-table-column prop="statusReport" label="状态" min-width="100">
            <template slot-scope="scope">
              <div class="status-cell">
                <span :class="['status-dot', scope.row.statusReport === 1 ? 'dot-success' : 'dot-danger']"></span>
                <span>{{ scope.row.statusReport === 1 ? '已申报' : '未申报' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="160" align="right">
            <template slot-scope="scope">
              <div class="action-links">
                <template v-if="scope.row.statusReport === 0">
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
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>入库时间</label>
                <el-date-picker
                  v-model="addForm.rksj"
                  type="datetime"
                  placeholder="选择入库时间"
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
              <el-button class="btn-scan" plain v-if="!isDetailMode">
                <i class="el-icon-full-screen"></i> 扫码添加
              </el-button>
            </div>

            <el-table
              :data="drawerPaginatedData"
              style="width: 100%;"
              class="associate-table"
              @selection-change="handleSelectionChange"
              @select-all="handleSelectAll"
              :row-style="{ height: '32px' }"
              :cell-style="{ 
                padding: '0 12px', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                lineHeight: '32px',
                verticalAlign: 'middle'
              }"
            >
              <el-table-column type="selection" width="55" align="center" v-if="!isDetailMode"></el-table-column>
              <el-table-column prop="scksbh" label="生产设施编号" min-width="110"></el-table-column>
              <el-table-column prop="fwmc" label="危废名称" min-width="100"></el-table-column>
              <el-table-column prop="fwdm" label="危废代码" min-width="100"></el-table-column>
              <el-table-column prop="szsbm" label="数字识别码" min-width="220"></el-table-column>
              <el-table-column label="标签信息" min-width="80">
                <template>
                  <span class="text-success cursor-pointer">查看标签</span>
                </template>
              </el-table-column>
              <el-table-column prop="csl" label="产生量" min-width="80"></el-table-column>
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
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDrawerSave" class="btn-drawer-save">保存</el-button>
          <el-button type="success" @click="handleDrawerSubmit" class="btn-drawer-submit">确定申报</el-button>
        </div>
        <div class="drawer-footer" v-else>
          <el-button @click="handleDrawerClose" class="btn-drawer-save">退出</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { warehousingApi, generateApi, myApi, dictionaryApi } from '@/api/index'
import { Message } from 'element-ui'

export default {
  name: 'InboundPage',
  data() {
    return {
      inboundDate: '',
      activeTab: 'all', 
      searchKeyword: '',
      searchTimer: null,
      
      // 页面主表格分页相关
      currentPage: 1,
      pageSize: 10, // 表格高度360px，行高32px，可显示10行（减去表头32px后）
      totalCount: 0,
      tableData: [],
      originalTableData: [],
      
      // 标签页数据
      storageTabs: [],
      loading: false,

      // ================= 抽屉相关数据 =================
      drawerVisible: false,
      addForm: {
        storageNo: '',
        storageAgent: '',
        transportAgent: '',
        rksj: ''
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
    }
  },
  computed: {
    // 根据当前页码和每页条数，动态切割要展示的数据
    paginatedData() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.tableData.slice(startIndex, endIndex);
    },
    // 抽屉表格分页数据
    drawerPaginatedData() {
      const startIndex = (this.drawerCurrentPage - 1) * this.drawerPageSize;
      const endIndex = startIndex + this.drawerPageSize;
      return this.associateData.slice(startIndex, endIndex);
    },
    // 获取当前日期，用于限制日期选择器的最大值
    currentDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  },
  methods: {
    // 获取入库列表数据
    fetchInboundData() {
      this.loading = true;
      
      const params = {
        page: 1,
        size: 100,
        sorted: [{name: "statusReport", type: "ASC"}, {name: "rksj", type: "DESC"}],
        groupByFields: ["batchNo"]
      };
      
      if (this.inboundDate) {
        params.rksj = this.formatDate(this.inboundDate);
      }
      
      if (this.activeTab !== 'all') {
        params.zcsstybh = this.activeTab;
      }
      
      // 添加搜索关键词筛选
      if (this.searchKeyword) {
        if (!params.filter) {
          params.filter = [];
        }
        params.filter.push({
          name: "batchNo",
          value: this.searchKeyword,
          type: "LIKE"
        });
      }
      
      warehousingApi.warehousingPage(params).then(res => {
        const data = res.result || res.data;
        if (data) {
          this.originalTableData = (data.records || []).map(item => {
            const production = item.production || {};
            return {
              id: item.id,
              rktzbm: item.rktzbm || item.batchCode || '-',
              wfmc: item.wfmc || item.fwmc || production.wfmc || production.fwmc || production.wasteName || '-',
              wfdm: item.wfdm || item.fwdm || production.wfdm || production.fwdm || production.wasteCode || '-',
              szsbm: item.szsbm || item.digitalId || production.szsbm || production.digitalId || '-',
              statusReport: item.statusReport !== undefined ? item.statusReport : (item.status || 0),
              status: item.status || 0,
              zcsstybh: item.zcsstybh || '-',
              zcssmc: item.zcssmc || '-',
              rksj: item.rksj || '-'
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
        console.error('获取入库数据失败', err);
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
    
    // 格式化日期时间为 YYYY-MM-DD HH:mm:ss
    formatDateTime(date) {
      if (!date) return '';
      
      if (typeof date === 'string') {
        return date;
      }
      
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
      
      // 按入库日期筛选
      if (this.inboundDate) {
        const dateStr = this.inboundDate;
        filteredData = filteredData.filter(item => {
          if (item.rksj) {
            const itemDate = new Date(item.rksj);
            const filterDate = new Date(dateStr);
            return itemDate.getFullYear() === filterDate.getFullYear() &&
                   itemDate.getMonth() === filterDate.getMonth() &&
                   itemDate.getDate() === filterDate.getDate();
          }
          return false;
        });
      }
      
      // 应用排序：未申报排在已申报之前，入库批次码大的在前面
      filteredData.sort((a, b) => {
        const statusA = a.statusReport || 0
        const statusB = b.statusReport || 0
        if (statusA !== statusB) {
          return statusA - statusB
        }
        
        const rktzbmA = a.rktzbm || ''
        const rktzbmB = b.rktzbm || ''
        return rktzbmB.localeCompare(rktzbmA)
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
        // 如果没有搜索关键词，保持当前的 tableData 不变
        this.totalCount = this.tableData.length;
        // 不重置currentPage，保持当前分页状态
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
      
      if (this.inboundDate) {
        const dateStr = this.inboundDate;
        filteredData = filteredData.filter(item => {
          if (item.rksj) {
            const itemDate = new Date(item.rksj);
            const filterDate = new Date(dateStr);
            return itemDate.getFullYear() === filterDate.getFullYear() &&
                   itemDate.getMonth() === filterDate.getMonth() &&
                   itemDate.getDate() === filterDate.getDate();
          }
          return false;
        });
      }
      
      // 再应用搜索过滤
      filteredData = filteredData.filter(item => {
        return (
          item.rktzbm && item.rktzbm.includes(keyword)
        );
      });
      
      // 应用排序
      filteredData.sort((a, b) => {
        const statusA = a.statusReport || 0
        const statusB = b.statusReport || 0
        if (statusA !== statusB) {
          return statusA - statusB
        }
        
        const rktzbmA = a.rktzbm || ''
        const rktzbmB = b.rktzbm || ''
        return rktzbmB.localeCompare(rktzbmA)
      });
      
      this.tableData = filteredData;
      this.totalCount = this.tableData.length;
      this.currentPage = 1;
    },
    
    // 入库日期变化处理
    handleDateChange() {
      // 当选择入库日期时，重置其他筛选条件
      this.searchKeyword = ''; // 清空搜索关键词
      this.activeTab = 'all'; // 重置标签页为全部
      this.currentPage = 1; // 重置页码
      this.fetchInboundData(); // 重新获取数据
    },
    
    // 搜索关键词变化处理
    handleSearch() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      
      this.searchTimer = setTimeout(() => {
        // 搜索时重置其他筛选条件
        this.inboundDate = '';
        this.activeTab = 'all';
        this.currentPage = 1;
        this.fetchInboundData();
      }, 300);
    },
    
    handleQuery() {
      this.activeTab = 'all';
      this.currentPage = 1;
      this.fetchInboundData();
    },
    
    handleReset() {
      this.inboundDate = '';
      this.searchKeyword = '';
      this.activeTab = 'all';
      this.currentPage = 1;
      this.fetchInboundData();
    },
    handleTabClick() {
      // 当点击标签页时，重置其他筛选条件
      this.inboundDate = '';
      this.searchKeyword = '';
      this.currentPage = 1;
      this.fetchInboundData();
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
        // 调用删除接口
        warehousingApi.delWarehousing(row.id).then(res => {
          if (res.code === '0000' || res.success) {
            // 重新获取数据
            this.fetchInboundData();
            Message.success('删除成功');
          } else {
            Message.error('删除失败：' + (res.message || '未知错误'));
          }
        }).catch(err => {
          console.error('删除失败', err);
          Message.error('删除失败，请重试');
        });
      }).catch(() => {
        // 取消删除
      });
    },
    handleDeclare(row) {
      warehousingApi.warehousingReport(row.id).then(res => {
        if (res.code === '0000' || res.success) {
          this.fetchInboundData();
          Message.success('申报成功');
        } else {
          this.fetchInboundData();
          if (res.message && res.message.includes('请勿重复提交')) {
            Message.warning('该数据已经申报过，请勿重复提交');
          } else {
            Message.error('申报失败：' + (res.message || '未知错误'));
          }
        }
      }).catch(err => {
        console.error('申报失败', err);
        this.fetchInboundData();
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
        this.$confirm(
          `<div class="delete-confirm-wrapper">
             <div class="delete-confirm-title">
               <i class="el-icon-warning custom-warning-icon"></i>
               <span>温馨提示</span>
             </div>
             <div class="delete-confirm-text">是否确定撤销？</div>
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
          const cancelData = {
            relId: row.id,
            bz: value.trim()
          };
          warehousingApi.warehousingCancelData(cancelData).then(res => {
            if (res.code === '0000' || res.success) {
              this.fetchInboundData();
              Message.success('撤销成功');
            } else {
              Message.error('撤销失败：' + (res.message || '未知错误'));
            }
          }).catch(err => {
            console.error('撤销失败', err);
            Message.error('撤销失败，请重试');
          });
        }).catch(() => {
          Message.info('已取消撤销');
        });
      }).catch(() => {
        Message.info('已取消填写备注');
      });
    },
    // 详情操作
    handleDetail(row) {
      // 进入详情模式
      this.isDetailMode = true;
      this.currentEditId = row.id;
      
      // 获取当前记录的详细信息
      warehousingApi.warehousingDetails(row.id).then(res => {
        const data = res.result || res.data;
        if (data) {
          // 填充表单数据
          this.addForm = {
            storageNo: data.storageInfoId || '',
            storageAgent: data.zcbmjbr || '',
            transportAgent: data.ysbmjbr || '',
            rksj: data.rksj || '' // 入库时间
          };
          
          // 打开抽屉
          this.drawerVisible = true;
          this.selectedRows = []; // 清空勾选
          
          // 获取抽屉选项数据
          this.fetchDrawerOptions();
          
          // 获取关联数据（详情模式下需要显示）
          this.fetchAssociateData();
        }
      }).catch(err => {
        console.error('获取详情失败', err);
        Message.error('获取详情失败，请重试');
      });
    },

    // ================= 抽屉新加方法 =================
    // 关闭抽屉
    handleDrawerClose() {
      this.drawerVisible = false;
      // 重置模式状态
      this.isDetailMode = false;
      // 重置表单
      this.addForm = {
        storageNo: '',
        storageAgent: '',
        transportAgent: '',
        rksj: ''
      };
    },
    
    // 获取抽屉选项数据（贮存设施、经办人）
    fetchDrawerOptions() {
      // 并行获取贮存设施、贮存部门经办人和运送部门经办人列表
      Promise.all([
        myApi.storagePage({}),
        dictionaryApi.operatorInfoPage({ 
          page: 1, 
          size: 100,
          filter: [{name: "operatorType", value: "STORAGE", type: "EQ"}]
        }),
        dictionaryApi.operatorInfoPage({ 
          page: 1, 
          size: 100,
          filter: [{name: "operatorType", value: "TRANSPORT", type: "EQ"}]
        })
      ]).then(([storageRes, storageOperatorRes, transportOperatorRes]) => {
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
    
    // 获取关联数据（未入库的危废）
    fetchAssociateData() {
      if (this.isDetailMode && this.currentEditId) {
        // 详情模式：获取该入库单关联的数据
        warehousingApi.warehousingDetails(this.currentEditId).then(res => {
          const data = res.result || res.data;
          if (data) {
            
            // 尝试从不同字段获取关联数据
            let associatedItems = [];
            
            if (data.items) {
              associatedItems = data.items;
            } else if (data.production) {
              associatedItems = [data.production];
            } else if (data.productionList) {
              associatedItems = data.productionList;
            } else if (data.records) {
              associatedItems = data.records;
            } else if (data.productionId) {
              // 通过productionId调用生产记录接口获取详细信息
              const params = {
                page:1,
                size:1,
                filter: [
                  {name: "id", value: String(data.productionId), type: "EQ"}
                ]
              };
              
              generateApi.productionPage(params).then(res => {
                const prodData = res.result || res.data;
                if (prodData && prodData.records && prodData.records.length > 0) {
                  const production = prodData.records[0];
                  
                  // 处理生产设施编号，只取字母开头一直到结束
                  let scksbh = production.scsstybh || production.scksbh || production.id || '-';
                  const match = scksbh.match(/[A-Za-z].*/);
                  if (match) {
                    scksbh = match[0];
                  }
                  
                  this.associateData = [{
                    id: production.id || '-',
                    scksbh: scksbh,
                    fwmc: production.fwmc || production.wfmc || production.wasteName || '-',
                    fwdm: production.fwdm || production.wfdm || production.wasteCode || '-',
                    szsbm: production.szsbm || production.digitalId || '-',
                    csl: production.csl || production.quantity || '-',
                    storageInfoId: production.storageInfoId || production.czjlid || production.weighingId || '-'  // 称重计量单位ID
                  }];
                  this.drawerTotal = this.associateData.length;
                } else {
                  this.associateData = [];
                  this.drawerTotal = 0;
                }
              }).catch(err => {
                console.error('获取生产记录失败', err);
                this.associateData = [];
                this.drawerTotal = 0;
              });
              return; // 提前返回，避免执行后续逻辑
            } else {

            }
            
            if (associatedItems.length > 0) {
              // 处理关联数据
            this.associateData = associatedItems.map((item, index) => {
                // 处理生产设施编号，只取字母开头一直到结束
                let scksbh = item.scsstybh || item.scksbh || item.productionId || item.id || '-';
                const match = scksbh.match(/[A-Za-z].*/);
                if (match) {
                  scksbh = match[0];
                }
                
                return {
                  id: item.productionId || item.id || '-',
                  scksbh: scksbh,
                  fwmc: item.wasteName || item.fwmc || item.wfmc || '-',
                  fwdm: item.wasteCode || item.fwdm || item.wfdm || '-',
                  szsbm: item.szsbm || item.digitalId || '-',
                  csl: item.quantity || item.csl || item.amount || '-',
                  storageInfoId: item.storageInfoId || item.czjlid || item.weighingId || '-'  // 称重计量单位ID
                };
              });
              this.drawerTotal = this.associateData.length;
            } else {
              this.associateData = [];
              this.drawerTotal = 0;
            }
          }
        }).catch(err => {
          console.error('获取关联数据失败', err);
          Message.error('获取数据失败，请重试');
        });
      } else {
        // 编辑模式或新增模式：获取未入库的危废

        const params = {
          page: 1,  // 固定第一页
          size: 100,  // 足够大的数量获取全量数据
          sorted: [{name: "cstzbm", type: "DESC"}],
          filter: [
            {name: "statusReport", value: "1", type: "EQ"},
            {name: "status", value: "1", type: "EQ"}
          ]
        };
        
        generateApi.productionPage(params).then(res => {
          const data = res.result || res.data;
          if (data) {
            // 处理数据，确保字段名正确
            this.associateData = (data.records || []).map(item => {
              // 处理生产设施编号，只取字母开头一直到结束
              let scksbh = item.scsstybh || item.scksbh || '-';
              const match = scksbh.match(/[A-Za-z].*/);
              if (match) {
                scksbh = match[0];
              }
              
              return {
                id: item.id,
                scksbh: scksbh,
                fwmc: item.fwmc || item.wfmc || '-',
                fwdm: item.fwdm || item.wfdm || '-',
                szsbm: item.szsbm || item.digitalId || '-',
                csl: item.csl || item.quantity || '-',
                storageInfoId: item.storageInfoId || item.czjlid || item.weighingId || '-'  // 称重计量单位ID
              };
            });
            this.drawerTotal = this.associateData.length; // 使用实际数据长度

          }
        }).catch(err => {
          console.error('获取关联数据失败', err);
          Message.error('获取数据失败，请重试');
        });
      }
    },
    
    // 监听抽屉内表格复选框变化
    handleSelectionChange(val) {
      this.selectedRows = val;
    },
    
    // 处理全选事件
    handleSelectAll(selection) {
      if (selection.length > 0) {
        // 全选：选择所有数据
        this.selectedRows = [...this.associateData];
      } else {
        // 取消全选：清空选择
        this.selectedRows = [];
      }
    },
    
    // 抽屉分页切换
    handleDrawerCurrentChange(val) {
      this.drawerCurrentPage = val;
      // 前端分页，不需要重新请求数据
    },
    
    // 抽屉确定申报逻辑
    handleDrawerSubmit() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一条关联的危废记录');
        return;
      }

      // 构建请求数据
      // 根据storageNo(ID)找到对应的zcsstybh(编号)
      const selectedStorage = this.storageOptions.find(option => option.value === this.addForm.storageNo);
      const zcsstybh = selectedStorage ? selectedStorage.zcsstybh : '';
      
      const batchData = {
        storageInfoId: this.addForm.storageNo,  // 生产设施编号的ID
        zcsstybh: zcsstybh,  // 生产设施编号
        zcbmjbr: this.addForm.storageAgent,
        ysbmjbr: this.addForm.transportAgent,
        rksj: this.addForm.rksj ? this.addForm.rksj : this.formatDateTime(new Date()),
        productionIdList: this.selectedRows.map(item => String(item.id)),
        batchReport: true
      };

      warehousingApi.addSavebatch(batchData).then(res => {
        if (res.code === '0000' || res.success) {
          // 关闭抽屉
          this.drawerVisible = false;
          
          // 重新获取数据
          this.fetchInboundData();
          
          // 显示成功提示
          this.$message.success(`成功添加入库单，已新增 ${this.selectedRows.length} 条记录`);
          
          // 重置表单，方便下次打开
          this.addForm = {
            storageNo: '',
            storageAgent: '',
            transportAgent: ''
          };
        } else {
          this.$message.error('操作失败：' + (res.message || '未知错误'));
        }
      }).catch(err => {
        console.error('添加入库单失败', err);
        this.$message.error('操作失败，请重试');
      });
    },
    
    // 抽屉保存逻辑（保存为未申报状态）
    handleDrawerSave() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一条关联的危废记录');
        return;
      }

      // 构建请求数据
      // 根据storageNo(ID)找到对应的zcsstybh(编号)
      const selectedStorage = this.storageOptions.find(option => option.value === this.addForm.storageNo);
      const zcsstybh = selectedStorage ? selectedStorage.zcsstybh : '';
      
      const batchData = {
        storageInfoId: this.addForm.storageNo,  // 生产设施编号的ID
        zcsstybh: zcsstybh,  // 生产设施编号
        zcbmjbr: this.addForm.storageAgent,
        ysbmjbr: this.addForm.transportAgent,
        rksj: this.addForm.rksj ? this.addForm.rksj : this.formatDateTime(new Date()),
        productionIdList: this.selectedRows.map(item => String(item.id)),
        batchReport: false
      };

      warehousingApi.addSavebatch(batchData).then(res => {
        if (res.code === '0000' || res.success) {
          // 关闭抽屉
          this.drawerVisible = false;
          
          // 重新获取数据
          this.fetchInboundData();
          
          // 显示成功提示
          this.$message.success(`成功保存入库单，已新增 ${this.selectedRows.length} 条记录`);
          
          // 重置表单，方便下次打开
          this.addForm = {
            storageNo: '',
            storageAgent: '',
            transportAgent: ''
          };
        } else {
          this.$message.error('操作失败：' + (res.message || '未知错误'));
        }
      }).catch(err => {
        console.error('保存入库单失败', err);
        this.$message.error('操作失败，请重试');
      });
    },
    // 添加危废入库单
    handleAddInbound() {
      // 重置表单
      this.addForm = {
        storageNo: '',
        storageAgent: '',
        transportAgent: '',
        rksj: this.formatDateTime(new Date())
      };
      
      // 重置详情模式
      this.isDetailMode = false;
      
      // 清空选中
      this.selectedRows = [];
      
      // 打开抽屉
      this.drawerVisible = true;
      
      // 获取抽屉选项数据
      this.fetchDrawerOptions();
      
      // 获取关联数据
      this.fetchAssociateData();
    },
  },
  mounted() {
    // 初始化时获取入库列表数据
    this.fetchInboundData();
  },
}
</script>

<style scoped>
.inbound-container {
  height: 100%; 
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

/* 确保所有可能的线条都被移除 */
.custom-tabs :deep(.el-tabs__nav-container) {
  border-bottom: none !important;
  box-shadow: none !important;
}

/* 删除确认对话框样式 */
.delete-confirm-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.delete-confirm-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.custom-warning-icon {
  font-size: 24px;
  color: #FAAD14;
  margin-right: 8px;
}

.delete-confirm-text {
  font-size: 14px;
  color: #4E5969;
  text-align: center;
}

.custom-delete-modal {
  width: 360px !important;
}

.custom-cancel-btn {
  background-color: #F2F3F5 !important;
  border-color: #E4E7ED !important;
  color: #4E5969 !important;
}

.custom-confirm-btn {
  background-color: #13B63A !important;
  border-color: #13B63A !important;
  color: #FFFFFF !important;
}

.custom-tabs :deep(.el-tabs__header.is-top) {
  border-bottom: none !important;
  box-shadow: none !important;
}
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
  height: 32px !important;
  line-height: 32px !important;
  padding: 0 12px !important;
}

/* 统一控制关联表格行高 */
.associate-table :deep(.el-table__row) {
  height: 32px !important;
}

.associate-table :deep(.el-table__cell) {
  height: 32px !important;
  line-height: 32px !important;
  padding: 0 12px !important;
  font-family: Microsoft YaHei;
  font-weight: 400;
  font-style: normal;
  font-size: 12px;
  letter-spacing: 0%;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
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

/* 表格区域样式 */
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

/* 抽屉输入框样式 */
.drawer-select {
  width: 224px;
  height: 32px;
  border-radius: 2px;
}

.drawer-select .el-input__inner {
  height: 32px;
  line-height: 32px;
  padding: 4px 12px;
  border-radius: 2px;
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
</style>