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
            @change="handleDateChange"
          />
        </div>
        <div class="query-item">
          <label>危险废物</label>
          <el-select v-model="wasteType" placeholder="全部" class="query-select" @change="handleMainWasteTypeChange" @visible-change="handleWasteDropdownVisible">
            <el-option label="全部" value="" />
            <el-option v-for="option in wasteOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </div>
        <div class="query-item">
          <label>申报状态</label>
          <el-select v-model="declarationStatus" placeholder="全部" class="query-select" @change="handleDeclarationStatusChange">
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
        <el-tabs v-model="activeFacilityTab" @tab-click="handleTabClick" class="facility-tabs">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane 
            v-for="tab in facilityTabs" 
            :key="tab.ssbm" 
            :label="tab.ssmc" 
            :name="tab.ssbm"
          ></el-tab-pane>
        </el-tabs>
        <div class="facility-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入产生批次码关键词"
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
        <el-table :data="paginatedData" style="width: 100%" class="production-table" v-loading="loading">
        <el-table-column prop="cstzbm" label="产生批次码" :min-width="104">
          <template slot-scope="scope">
            {{ scope.row.cstzbm || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="fwmc" label="危废名称" :min-width="124">
          <template slot-scope="scope">
            {{ scope.row.fwmc || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="fwdm" label="危废代码" :min-width="124">
          <template slot-scope="scope">
            {{ scope.row.fwdm || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="szsbm" label="数字识别码" :min-width="227">
          <template slot-scope="scope">
            {{ scope.row.szsbm || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="statusReport" label="状态" :min-width="97">
          <template slot-scope="scope">
            <div class="status-tag" :class="scope.row.statusReport === 1 ? 'declared' : 'undeclared'">
              <span class="status-dot"></span>
              <span class="status-text">{{ getStatusText(scope.row.statusReport) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" :min-width="148">
          <template slot-scope="scope">
            <div class="operation-buttons">
              <template v-if="scope.row.statusReport === 0">
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
              <template v-else-if="scope.row.statusReport === 1">
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
        :page-size="10"
        :current-page="currentPage"
        @current-change="handleCurrentChange"
      />
    </div>
    </div>

    <!-- 产生新的危废抽屉 -->
    <el-drawer
      :visible.sync="generateWasteDialogVisible"
      :title="isEditMode ? '修改危废' : '产生新的危废'"
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
            <el-select v-model="newWasteForm.wasteType" placeholder="请选择危废" class="full-width-select" @change="handleWasteTypeChange" @visible-change="handleDrawerWasteDropdownVisible">
              <el-option 
                v-for="option in wasteOptions" 
                :key="option.id || option.value" 
                :label="option.label" 
                :value="option.value" 
                :data-id="option.id"
                :data-fwdm="option.fwdm"
                :data-szsbm="option.szsbm"
                :data-cfxxtybh="option.cfxxtybh"
              />
            </el-select>
          </div>
          
          <!-- 填写信息 -->
          <div class="section">
            <h4>填写信息</h4>
            
            <div class="form-row">
              <div class="form-item">
                <span class="label">产生部门经办人</span>
                <el-select v-model="newWasteForm.department" placeholder="请选择" class="form-select">
                  <el-option 
                    v-for="option in departmentOptions" 
                    :key="option.value" 
                    :label="option.label" 
                    :value="option.value" 
                  />
                </el-select>
              </div>
              <div class="form-item">
                <span class="label">生产设施</span>
                <el-select v-model="newWasteForm.facility" placeholder="请选择生产设施" class="form-select" @click.native="handleFacilityDropdownClick" @change="handleFacilityChange">
                  <el-option 
                    v-for="option in relatedFacilityOptions" 
                    :key="option.value" 
                    :label="option.label" 
                    :value="option.value" 
                  />
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
                  <el-option label="个" value="个" />
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
                  <el-option 
                    v-for="option in containerTypeOptions" 
                    :key="option.value" 
                    :label="option.label" 
                    :value="option.value" 
                  />
                </el-select>
              </div>
              <div class="form-item">
                <span class="label">容器材质</span>
                <el-select v-model="newWasteForm.containerMaterial" placeholder="请选择" class="form-select">
                  <el-option 
                    v-for="option in containerMaterialOptions" 
                    :key="option.value" 
                    :label="option.label" 
                    :value="option.value" 
                  />
                </el-select>
              </div>
              <div class="form-item">
                <span class="label">容器容量</span>
                <el-select v-model="newWasteForm.containerCapacity" placeholder="请选择" class="form-select">
                  <el-option 
                    v-for="option in containerCapacityOptions" 
                    :key="option.value" 
                    :label="option.label" 
                    :value="option.value" 
                  />
                </el-select>
              </div>
            </div>
          </div>
        </div>
        
        <div class="drawer-footer">
          <el-button v-if="!isEditMode" class="save-button" @click="handleSave">保存</el-button>
          <el-button class="declare-button" type="primary" @click="handleConfirmGenerate">{{ isEditMode ? '修改并申报' : '确定申报' }}</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { generateApi, myApi } from '@/api/index'
import { Message } from 'element-ui'
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
      tableData: [],
      
      // 原始表格数据
      originalTableData: [],
      
      // 选项数据
      wasteOptions: [],
      facilityOptions: [],
      relatedFacilityOptions: [],
      departmentOptions: [],
      containerTypeOptions: [],
      
      // 加载状态
      loading: false,
      containerMaterialOptions: [],
      containerCapacityOptions: [],
      
      // 生产设施标签页数据
      facilityTabs: [],
      
      // 分页和选中状态
      currentPage: 1,
      totalCount: 0,
      
      // 弹窗状态
      generateWasteDialogVisible: false,
      isEditMode: false, // 是否为编辑模式
      currentEditId: null, // 当前编辑的数据ID
      
      // 新危废表单数据
      newWasteForm: {
        cfxxtybh: '',
        fwdm: '',
        wasteType: '',
        department: '',
        facility: '',
        quantity: '',
        unit1: '',
        productionTime: new Date(),
        containerType: '',
        containerMaterial: '',
        containerCapacity: ''
      },
    }
  },
  // 计算属性：分页数据
  computed: {
    paginatedData() {
      const pageSize = 10; 
      const startIndex = (this.currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return this.tableData.slice(startIndex, endIndex);
    }
  },
  mounted() {
    // 页面加载时获取表格数据
    this.fetchProductionData()
    // 获取危险废物下拉框数据
    this.fetchWasteOptions()
    // 获取生产设施标签页数据
    this.fetchFacilityTabs()
  },
  methods: {
    // 获取危险废物下拉框数据
    fetchWasteOptions() {
      myApi.wastePage({
      }).then(res => {
        const data = res.result || res.data
        if (data) {
          const wasteRecords = data.records || []
          
          const wasteMap = new Map()
          wasteRecords.forEach(item => {
            if (item.fwmc && item.cfxxtybh) {
              if (!wasteMap.has(item.fwmc)) {
                wasteMap.set(item.fwmc, item)
              }
            }
          })
          
          this.wasteOptions = Array.from(wasteMap.values()).map(item => ({
            label: item.fwmc,
            value: item.fwmc,
            fwdm: item.fwdm,
            cfxxtybh: item.cfxxtybh,
            jldw: item.jldw,
            rqlx: item.rqlx,
            rqcz: item.rqcz,
            rqrl: item.rqrl
          }))
        }
      }).catch(err => {
        console.error('获取危废数据失败', err)
      })
    },
    
    // 获取生产设施标签页数据
    fetchFacilityTabs() {
      myApi.productionPage({
      }).then(res => {
        const data = res.result || res.data
        if (data) {
          const records = data.records || []

          const facilityTabMap = new Map()
          records.forEach(item => {
            if (item.cfsstybh) {
              if (!facilityTabMap.has(item.cfsstybh)) {
                const match = item.cfsstybh.match(/[A-Z].*/)
                const facilityName = match ? match[0] : item.cfsstybh
                facilityTabMap.set(item.cfsstybh, {
                  ssbm: item.cfsstybh,
                  ssmc: facilityName
                })
              }
            }
          })
          this.facilityTabs = Array.from(facilityTabMap.values())
        }
      }).catch(err => {
        console.error('获取生产设施标签页数据失败', err)
      })
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 格式化日期时间
    formatDateTime(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    
    // 获取状态文本
    getStatusText(status) {
      if (status === 0) {
        return '未申报'
      } else if (status === 1) {
        return '已申报'
      } else {
        return '未知状态'
      }
    },
    
    // 获取产生数据
    fetchProductionData() {
      // 开始加载
      this.loading = true

      const params = {
        sorted: [
          { name: "statusReport", type: "ASC" },
          { name: "cstzbm", type: "DESC" }
        ]
      }

      // 如果不是全部标签页，添加scsstybh筛选条件
      if (this.activeFacilityTab !== 'all') {
        if (!params.filter) {
          params.filter = []
        }
        params.filter.push({
          name: "scsstybh",
          value: this.activeFacilityTab,
          type: "EQ"
        })
      }

      // 添加生产日期筛选
      if (this.productionDate) {
        params.cssj = this.formatDate(this.productionDate)
      }

      // 添加危废类型筛选
      if (this.wasteType) {
        params.fwmc = this.wasteType
      }

      // 添加申报状态筛选
      if (this.declarationStatus) {
        const statusValue = this.declarationStatus === '已申报' ? 1 : 0
        params.statusReport = statusValue
      }

      // 添加搜索关键词筛选
      if (this.searchKeyword) {
        if (!params.filter) {
          params.filter = []
        }
        params.filter.push({
          name: "cstzbm",
          value: this.searchKeyword,
          type: "LIKE"
        })
      }
      
      generateApi.productionPage(params).then(res => {
        const data = res.result || res.data
        if (data) {
          this.originalTableData = data.records || []
          
          // 应用前端筛选
          this.applyFilters()
          
          // 提取危险废物选项
          const wasteMap = new Map()
          const facilityMap = new Map()
          const departmentMap = new Map()
          const containerTypeMap = new Map()
          const containerMaterialMap = new Map()
          const containerCapacityMap = new Map()
          
          this.originalTableData.forEach(item => {
            if (item.fwmc && item.cfxxtybh) {
              // 只保存每个危废名称的第一个记录
              if (!wasteMap.has(item.fwmc)) {
                wasteMap.set(item.fwmc, item)
              }
            }
            if (item.scsstybh) {
              // 只保存每个生产设施的第一个记录
              if (!facilityMap.has(item.scsstybh)) {
                facilityMap.set(item.scsstybh, item)
              }
            }
            if (item.csbmjbr) {
              // 只保存每个部门经办人的第一个记录
              if (!departmentMap.has(item.csbmjbr)) {
                departmentMap.set(item.csbmjbr, item.csbmjbr)
              }
            }
            if (item.rqlx) {
              // 提取容器类型
              if (!containerTypeMap.has(item.rqlx)) {
                containerTypeMap.set(item.rqlx, item.rqlx)
              }
            }
            if (item.rqcz) {
              // 提取容器材质
              if (!containerMaterialMap.has(item.rqcz)) {
                containerMaterialMap.set(item.rqcz, item.rqcz)
              }
            }
            if (item.rqrl) {
              // 提取容器容量
              if (!containerCapacityMap.has(item.rqrl)) {
                containerCapacityMap.set(item.rqrl, item.rqrl)
              }
            }
          })
          this.wasteOptions = Array.from(wasteMap.values()).map(item => ({
            label: item.fwmc,
            value: item.fwmc,
            fwdm: item.fwdm,
            cfxxtybh: item.cfxxtybh
          }))
          
          // 提取生产设施选项
          this.facilityOptions = Array.from(facilityMap.values()).map(item => ({
            label: item.scsstybh,
            value: item.scsstybh,
            scsstybh: item.scsstybh
          }))
          
          // 提取部门经办人选项
          this.departmentOptions = Array.from(departmentMap.values()).map(item => ({
            label: item,
            value: item
          }))
          
          // 提取容器类型选项
          this.containerTypeOptions = Array.from(containerTypeMap.values()).map(type => ({
            label: type,
            value: type
          }))
          
          // 提取容器材质选项
          this.containerMaterialOptions = Array.from(containerMaterialMap.values()).map(material => ({
            label: material,
            value: material
          }))
          
          // 提取容器容量选项
          this.containerCapacityOptions = Array.from(containerCapacityMap.values()).map(capacity => ({
            label: capacity,
            value: capacity
          }))

        }
      }).catch(err => {
        console.error('获取产生数据失败', err)
        Message.error('获取数据失败，请重试')
      }).finally(() => {
        // 结束加载
        this.loading = false
      })
    },
    
    // 应用前端筛选
    applyFilters() {
      let filteredData = [...this.originalTableData]
      
      // 按标签页筛选生产设施
      if (this.activeFacilityTab !== 'all') {
        // 根据标签页的scsstybh筛选相应的生产设施
        filteredData = filteredData.filter(item => {
          return item.scsstybh === this.activeFacilityTab
        })
      }
      
      // 按危废名称筛选
      if (this.wasteType) {
        filteredData = filteredData.filter(item => item.fwmc === this.wasteType)
      }
      
      // 按产生日期筛选
      if (this.productionDate) {
        const dateStr = this.productionDate
        filteredData = filteredData.filter(item => {
          if (item.cssj) {
            const itemDate = new Date(item.cssj)
            const filterDate = new Date(dateStr)
            return itemDate.getFullYear() === filterDate.getFullYear() &&
                   itemDate.getMonth() === filterDate.getMonth() &&
                   itemDate.getDate() === filterDate.getDate()
          }
          return false
        })
      }
      
      // 按申报状态筛选
      if (this.declarationStatus) {
        const statusValue = this.declarationStatus === '已申报' ? 1 : 0
        filteredData = filteredData.filter(item => item.statusReport === statusValue)
      }
      
      // 应用排序：未申报排在已申报之前，产生批次码大的在前面
      filteredData.sort((a, b) => {
        // 首先按申报状态排序：0（未申报）在 1（已申报）前面（升序）
        const statusA = a.statusReport || 0
        const statusB = b.statusReport || 0
        if (statusA !== statusB) {
          return statusA - statusB
        }
        
        // 申报状态相同时，按产生批次码排序：大的在前（降序）
        const cstzbmA = a.cstzbm || ''
        const cstzbmB = b.cstzbm || ''
        return cstzbmB.localeCompare(cstzbmA)
      })
      
      // 应用搜索过滤
      this.tableData = filteredData
      this.applySearchFilter()
    },
    
    // 应用搜索过滤
    applySearchFilter() {
      const keyword = this.searchKeyword.trim()
      if (!keyword) {
        // 如果没有搜索关键词，保持当前的 tableData 不变
        this.totalCount = this.tableData.length
        // 不重置currentPage，保持当前分页状态
        return
      }
      
      // 有搜索关键词时，从当前 tableData 中过滤
      this.tableData = this.tableData.filter(item => {
        return (
          item.cstzbm && item.cstzbm.includes(keyword)
        )
      })
      this.totalCount = this.tableData.length
      this.currentPage = 1
    },
    
    // 查询方法
    handleQuery() {
      // 当使用其他筛选条件时，重置标签页为"全部"
      this.activeFacilityTab = 'all'
      this.currentPage = 1
      this.fetchProductionData()
    },
    
    // 重置方法
    handleReset() {
      this.productionDate = '';
      this.wasteType = '';
      this.declarationStatus = '';
      this.searchKeyword = '';
      this.activeFacilityTab = 'all';
      this.currentPage = 1;
      this.fetchProductionData()
    },
    
    // 产生日期变化处理
    handleDateChange() {
      // 当选择产生日期时，重置其他筛选条件
      this.wasteType = '' // 清空危废类型
      this.declarationStatus = '' // 清空申报状态
      this.activeFacilityTab = 'all' // 重置标签页为全部
    },
    
    // 危废下拉框可见性变化
    handleWasteDropdownVisible(visible) {
      if (visible) {
        this.fetchWasteOptions()
      }
    },
    
    // 主页面危废类型变化处理
    handleMainWasteTypeChange() {
      // 当选择危废类型时，重置其他筛选条件
      this.productionDate = '' // 清空产生日期
      this.declarationStatus = '' // 清空申报状态
      this.activeFacilityTab = 'all' // 重置标签页为全部
    },
    
    // 申报状态变化处理
    handleDeclarationStatusChange() {
      // 当选择申报状态时，重置其他筛选条件
      this.productionDate = '' // 清空产生日期
      this.wasteType = '' // 清空危废类型
      this.activeFacilityTab = 'all' // 重置标签页为全部
    },
    
    // 标签页点击事件处理
    handleTabClick(tab, event) {
      // 修正：Element UI 的 el-tabs 组件 @tab-click 事件的参数结构
      this.activeFacilityTab = tab.name || tab.props?.name
      // 当点击标签页时，重置其他筛选条件
      this.searchKeyword = '' // 清空搜索关键词
      this.productionDate = '' // 清空生产日期
      this.wasteType = '' // 清空危废类型
      this.declarationStatus = '' // 清空申报状态
      this.currentPage = 1 // 重置到第一页
      this.fetchProductionData() // 重新从接口获取数据
    },
    
    // 搜索功能
    handleSearch() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      
      this.searchTimer = setTimeout(() => {
        // 搜索时重置其他筛选条件
        this.productionDate = ''
        this.wasteType = ''
        this.declarationStatus = ''
        this.activeFacilityTab = 'all'
        this.currentPage = 1
        this.fetchProductionData()
      }, 300);
    },
    
    // 页码变化处理
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    
    // 产生新的危废
    handleGenerateWaste() {
      // 重置编辑模式
      this.isEditMode = false
      this.currentEditId = null
      
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
      
      // 清空选项
      this.wasteOptions = []
      this.relatedFacilityOptions = []
      this.departmentOptions = []
      
      // 显示加载中
      const loading = this.$loading({
        lock: true,
        text: '正在加载危废数据...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      // 并行获取危废类型和经办人列表数据
      Promise.all([
        myApi.wastePage({
        }),
        myApi.operatorPage({
          filter: [{name: "operatorType", value: "PRODUCE", type: "EQ"}]
        })
      ]).then(([wasteRes, operatorRes]) => {
        // 处理危废类型数据
        const wasteData = wasteRes.result || wasteRes.data
        if (wasteData) {
          const wasteRecords = wasteData.records || []
          
          // 提取危险废物选项
          const wasteMap = new Map()
          wasteRecords.forEach(item => {
            if (item.fwmc && item.cfxxtybh) {
              if (!wasteMap.has(item.fwmc)) {
                wasteMap.set(item.fwmc, item)
              }
            }
          })
          
          this.wasteOptions = Array.from(wasteMap.values()).map(item => ({
            label: item.fwmc,
            value: item.fwmc,
            fwdm: item.fwdm,
            cfxxtybh: item.cfxxtybh,
            jldw: item.jldw,
            rqlx: item.rqlx,
            rqcz: item.rqcz,
            rqrl: item.rqrl
          }))
        }
        
        // 处理经办人列表数据
        const operatorData = operatorRes.result || operatorRes.data
        if (operatorData) {
          const operatorRecords = operatorData.records || []
          
          // 提取经办人选项
          const departmentMap = new Map()
          operatorRecords.forEach(item => {
            if (item.operatorName) {
              if (!departmentMap.has(item.operatorName)) {
                departmentMap.set(item.operatorName, item)
              }
            }
          })
          
          this.departmentOptions = Array.from(departmentMap.values()).map(item => ({
            label: item.operatorName,
            value: item.operatorName
          }))
        }
        
      // 打开产生新的危废弹窗
      this.generateWasteDialogVisible = true;
      }).finally(() => {
        // 关闭加载
        loading.close()
      })
    },
    
    // 确认产生新的危废
    handleConfirmGenerate() {

      
      // 验证表单数据
      if (!this.newWasteForm.wasteType || !this.newWasteForm.department || !this.newWasteForm.facility || !this.newWasteForm.quantity || !this.newWasteForm.unit1 || !this.newWasteForm.containerType || !this.newWasteForm.containerMaterial || !this.newWasteForm.containerCapacity) {
        this.$message.warning('请填写完整的危废信息');
        return;
      }
      
      // 构建请求数据
      const productionData = {
        id: this.currentEditId, // 编辑模式下需要传递id
        cfxxtybh: this.newWasteForm.cfxxtybh,
        fwdm: this.newWasteForm.fwdm,
        fwmc: this.newWasteForm.wasteType,
        csbmjbr: this.newWasteForm.department,
        scsstybh: this.newWasteForm.facility,
        csl: this.newWasteForm.quantity,
        jldw: this.newWasteForm.unit1,
        cssj: this.formatDateTime(this.newWasteForm.productionTime),
        rqlx: this.newWasteForm.containerType,
        rqcz: this.newWasteForm.containerMaterial,
        rqrl: this.newWasteForm.containerCapacity || '25-50L',
        immediatelyReport: true
      }
      

      
      // 调用接口
      const apiMethod = this.isEditMode ? generateApi.editProduction : generateApi.addProduction
      apiMethod(productionData).then(res => {

        if (res.code === '0000' || res.success) {
          // 关闭弹窗
          this.generateWasteDialogVisible = false;
          
          // 重置表单
          this.newWasteForm = {
            cfxxtybh: '',
            fwdm: '',
            wasteType: '',
            department: '',
            facility: '',
            quantity: '',
            unit1: '',
            productionTime: new Date(),
            containerType: '',
            containerMaterial: '',
            containerCapacity: ''
          };
          
          // 重置编辑模式
          this.isEditMode = false
          this.currentEditId = null
          
          // 重新获取数据
          this.fetchProductionData();
          
          // 显示成功提示
          this.$message.success(this.isEditMode ? '修改危废成功' : '产生新的危废成功');
        } else {
          this.$message.error('操作失败：' + (res.message || '未知错误'));
        }
      }).catch(err => {
        console.error('产生新危废失败', err);
        console.error('产生新危废失败 - 详细信息', JSON.stringify(err, null, 2));
        this.$message.error('操作失败，请重试');
      });
    },
    
    // 保存操作
    handleSave() {
      // 验证表单数据
      if (!this.newWasteForm.wasteType || !this.newWasteForm.department || !this.newWasteForm.facility || !this.newWasteForm.quantity) {
        this.$message.warning('请填写完整的危废信息');
        return;
      }
      
      // 构建请求数据
      const productionData = {
        id: this.currentEditId, // 编辑模式下需要传递id
        cfxxtybh: this.newWasteForm.cfxxtybh,
        fwdm: this.newWasteForm.fwdm,
        fwmc: this.newWasteForm.wasteType,
        csbmjbr: this.newWasteForm.department,
        scsstybh: this.newWasteForm.facility,
        csl: this.newWasteForm.quantity,
        jldw: this.newWasteForm.unit1,
        cssj: this.formatDateTime(this.newWasteForm.productionTime),
        rqlx: this.newWasteForm.containerType,
        rqcz: this.newWasteForm.containerMaterial,
        rqrl: this.newWasteForm.containerCapacity || '25-50L',
        immediatelyReport: false
      }
      

      
      // 调用接口
      const apiMethod = this.isEditMode ? generateApi.editProduction : generateApi.addProduction
      apiMethod(productionData).then(res => {

        if (res.code === '0000' || res.success) {
      // 关闭弹窗
      this.generateWasteDialogVisible = false;
      
      // 重置表单
      this.newWasteForm = {
            cfxxtybh: '',
            fwdm: '',
        wasteType: '',
        department: '',
        facility: '',
        quantity: '',
        unit1: '',
            productionTime: new Date(),
        containerType: '',
        containerMaterial: '',
        containerCapacity: ''
      };
          
          // 重置编辑模式
          this.isEditMode = false
          this.currentEditId = null
          
          // 重新获取数据
          this.fetchProductionData();
      
      // 显示成功提示
          this.$message.success(this.isEditMode ? '修改危废成功' : '保存危废成功');
        } else {
          this.$message.error('操作失败：' + (res.message || '未知错误'));
        }
      }).catch(err => {
        console.error('保存危废失败', err);
        console.error('保存危废失败 - 详细信息', JSON.stringify(err, null, 2));
        this.$message.error('操作失败，请重试');
      });
    },
    
    // 抽屉中危废下拉框可见性变化
    handleDrawerWasteDropdownVisible(visible) {
      if (visible) {
        this.fetchWasteOptions()
      }
    },
    
    // 危废类型选择变化
    handleWasteTypeChange(value) {
      // 查找对应的危废选项
      const selectedOption = this.wasteOptions.find(option => option.value === value)
      if (selectedOption) {
        // 自动填充相关字段
        this.newWasteForm.fwdm = selectedOption.fwdm
        this.newWasteForm.cfxxtybh = selectedOption.cfxxtybh
        
        // 自动填充容器信息和计量单位
        if (selectedOption.jldw) {
          this.newWasteForm.unit1 = selectedOption.jldw
        }
        if (selectedOption.rqlx) {
          this.newWasteForm.containerType = selectedOption.rqlx
        }
        if (selectedOption.rqcz) {
          this.newWasteForm.containerMaterial = selectedOption.rqcz
        }
        if (selectedOption.rqrl) {
          this.newWasteForm.containerCapacity = selectedOption.rqrl
        }
        
        // 重置生产设施选择和选项
        this.newWasteForm.facility = ''
        this.relatedFacilityOptions = []
      }
    },
    
    // 生产设施下拉框点击事件
    handleFacilityDropdownClick() {
      // 只有当选择了危废且还没有生产设施数据时才获取
      if (this.newWasteForm.wasteType && this.relatedFacilityOptions.length === 0) {
        // 显示加载中
        const loading = this.$loading({
          lock: true,
          text: '正在加载生产设施数据...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        
        // 根据危废类型确定筛选条件
        let cfxxtybhValue = '';
        if (this.newWasteForm.wasteType === '废活性炭') {
          cfxxtybhValue = '44060780000000000001CF0002';
        } else if (this.newWasteForm.wasteType === '废抹布') {
          cfxxtybhValue = '44060780000000000001CF0001';
        }
        
        // 发送post请求获取生产设施数据
        const params = {
          page: 1,
          size: 100
        }
        
        // 如果有特定的cfxxtybh值，则添加筛选条件
        if (cfxxtybhValue) {
          params.filter = [{
            name: "cfxxtybh",
            value: cfxxtybhValue,
            type: "EQ"
          }];
        }
        
        myApi.productionPage(params).then(res => {
          const data = res.result || res.data
          if (data) {
            const records = data.records || []
            
            // 提取生产设施选项
            const facilityMap = new Map()
            records.forEach(item => {
              if (item.cfsstybh && item.ssbm) {
                if (!facilityMap.has(item.cfsstybh)) {
                  facilityMap.set(item.cfsstybh, item)
                }
              }
            })
            
            // 更新生产设施选项
            this.relatedFacilityOptions = Array.from(facilityMap.values()).map(item => ({
              label: item.ssbm, // 使用ssbm作为显示文本
              value: item.cfsstybh, // 使用cfsstybh作为值
              cfsstybh: item.cfsstybh
            }))
          }
        }).finally(() => {
          // 关闭加载
          loading.close()
        })
      }
    },
    
    // 生产设施选择变化
    handleFacilityChange(value) {
      // 查找对应的生产设施选项
      const selectedOption = this.relatedFacilityOptions.find(option => option.value === value)
      if (selectedOption) {
        // 自动填充相关字段
        this.newWasteForm.facility = selectedOption.cfsstybh
      }
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
          dangerouslyUseHTMLString: true, 
          showClose: false, // 隐藏右上角 X 号
          customClass: 'custom-delete-modal', // 注入全局自定义类名
          cancelButtonClass: 'custom-cancel-btn', // 注入取消按钮类名
          confirmButtonClass: 'custom-confirm-btn', // 注入确定按钮类名
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      ).then(() => {
        // 调用删除接口
        generateApi.delproduction(row.id).then(res => {
          if (res.code === '0000' || res.success) {
            // 重新获取数据
            this.fetchProductionData();
            this.$message.success('删除成功');
          } else {
            this.$message.error('删除失败：' + (res.message || '未知错误'));
          }
        }).catch(err => {
          console.error('删除失败', err);
          this.$message.error('删除失败，请重试');
        });
      }).catch(() => {
        // 取消删除
      });
    },
    
    // 修改操作
    handleModify(row) {

      
      // 进入编辑模式
      this.isEditMode = true
      this.currentEditId = row.id
      
      // 填充表单数据
      this.newWasteForm = {
        cfxxtybh: row.cfxxtybh || '',
        fwdm: row.fwdm || '',
        wasteType: row.fwmc || '',
        department: row.csbmjbr || '',
        facility: row.scsstybh || '',
        quantity: row.csl || '',
        unit1: row.jldw || '',
        productionTime: row.cssj ? new Date(row.cssj) : new Date(),
        containerType: row.rqlx || '',
        containerMaterial: row.rqcz || '',
        containerCapacity: row.rqrl || ''
      }
      
      // 并行获取危废类型和经办人列表数据
      Promise.all([
        myApi.wastePage({
          page: 1,
          size: 100
        }),
        myApi.operatorPage({
          page: 1,
          size: 100,
          filter: [{name: "operatorType", value: "PRODUCE", type: "EQ"}]
        })
      ]).then(([wasteRes, operatorRes]) => {
        // 处理危废类型数据
        const wasteData = wasteRes.result || wasteRes.data
        if (wasteData) {
          const wasteRecords = wasteData.records || []
          
          // 提取危险废物选项
          const wasteMap = new Map()
          wasteRecords.forEach(item => {
            if (item.fwmc && item.cfxxtybh) {
              if (!wasteMap.has(item.fwmc)) {
                wasteMap.set(item.fwmc, item)
              }
            }
          })
          
          this.wasteOptions = Array.from(wasteMap.values()).map(item => ({
            label: item.fwmc,
            value: item.fwmc,
            fwdm: item.fwdm,
            cfxxtybh: item.cfxxtybh,
            jldw: item.jldw,
            rqlx: item.rqlx,
            rqcz: item.rqcz,
            rqrl: item.rqrl
          }))
        }
        
        // 处理经办人列表数据
        const operatorData = operatorRes.result || operatorRes.data
        if (operatorData) {
          const operatorRecords = operatorData.records || []
          
          // 提取经办人选项
          const departmentMap = new Map()
          operatorRecords.forEach(item => {
            if (item.operatorName) {
              if (!departmentMap.has(item.operatorName)) {
                departmentMap.set(item.operatorName, item)
              }
            }
          })
          
          this.departmentOptions = Array.from(departmentMap.values()).map(item => ({
            label: item.operatorName,
            value: item.operatorName
          }))
        }
        
        // 打开产生新的危废弹窗
        this.generateWasteDialogVisible = true;
      }).catch(err => {
        console.error('获取数据失败', err)
        this.$message.error('获取数据失败，请重试')
      })
    },
    
    // 申报操作
    handleDeclare(row) {

      // 调用申报接口
      generateApi.reportdata(row.id).then(res => {

        if (res.code === '0000' || res.success) {
          // 重新获取数据
          this.fetchProductionData();
      this.$message.success('申报成功');
        } else {
          // 失败时也重新获取数据，确保状态更新
          this.fetchProductionData();
          // 特殊处理重复提交的错误
          if (res.message && res.message.includes('请勿重复提交')) {
            this.$message.warning('该数据已经申报过，请勿重复提交');
          } else {
            this.$message.error('申报失败：' + (res.message || '未知错误'));
          }
        }
      }).catch(err => {
        console.error('申报失败', err);
        console.error('申报失败 - 详细信息', JSON.stringify(err, null, 2));
        // 错误时也重新获取数据
        this.fetchProductionData();
        this.$message.error('申报失败，请重试');
      });
    },
    
    // 撤销操作
    handleCancel(row) {

      
      // 弹出填写备注的弹窗
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
        // 填写备注后，弹出确认撤销的弹窗
        this.$confirm('是否确定撤销？', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 调用撤销接口
          const cancelData = {
            relId: row.id,
            bz: value.trim()
          }
          
          generateApi.cancelData(cancelData).then(res => {
            if (res.code === '0000' || res.success) {
              // 重新获取数据
              this.fetchProductionData();
      this.$message.success('撤销成功');
            } else {
              this.$message.error('撤销失败：' + (res.message || '未知错误'));
            }
          }).catch(err => {
            console.error('撤销失败', err);
            console.error('撤销失败 - 详细信息', JSON.stringify(err, null, 2));
            this.$message.error('撤销失败，请重试');
          });
        }).catch(() => {
          // 取消撤销
          this.$message.info('已取消撤销');
        });
      }).catch(() => {
        // 取消填写备注
        this.$message.info('已取消填写备注');
      });
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
  gap: 0;
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
  gap: 0;
  padding: 0;
}

.facility-actions .el-button--success {
  background-color: #13B63A !important;
  border-color: #13B63A !important;
  color: white !important;
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

/* 表格整体高度约束 */
.production-table {
  height: 360px !important;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5; /* 防止底部边框丢失 */
}

/* 隐藏表格的滚动条 */
.production-table :deep(.el-table__body-wrapper) {
  overflow: hidden !important;
}
.production-table :deep(.el-table__header-wrapper) {
  overflow: hidden !important;
}

/* 统一控制表格行高：360px / 11行 = 32px */
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
  gap: 0;
  align-items: center;
  padding: 0;
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