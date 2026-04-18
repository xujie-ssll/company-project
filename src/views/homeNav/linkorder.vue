<template>
  <div class="linkorder-container">
    <div class="tabs-header">
      <div 
        v-for="tab in tabs" 
        :key="tab.key" 
        class="tab-nav-item" 
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.name }}
      </div>
    </div>

    <div v-show="['transfer', 'approve'].includes(activeTab)" class="query-section">
      <h3 class="page-title">查询表格</h3>
      <div class="query-form">
        <div class="query-item">
          <label>日期</label>
          <el-date-picker
            v-model="queryParams.date"
            type="date"
            placeholder="请选择日期"
            class="custom-date-picker"
          />
        </div>
        <div class="query-item">
          <label>接收单位</label>
          <el-select v-model="queryParams.receiver" placeholder="全部" class="query-select">
            <el-option label="全部" value="" />
            <el-option
              v-for="item in receiverList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </div>
        <div class="query-item">
          <label>运输单位</label>
          <el-select v-model="queryParams.transporter" placeholder="全部" class="query-select">
            <el-option label="全部" value="" />
            <el-option
              v-for="item in transporterList"
              :key="item"
              :label="item"
              :value="item"
            />
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

    <div v-show="activeTab === 'transfer'" class="table-section">
      <div class="action-bar">
        <el-button type="primary" size="mini" class="add-linkorder-btn" @click="openDrawer">新增联单</el-button>
        <div class="search-box">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索" 
            size="mini" 
            suffix-icon="el-icon-search"
            style="width: 200px"
            @keyup.enter.native="handleSearch"
          />
        </div>
      </div>

      <el-table :data="paginatedData" style="width: 100%" size="small" height="100%">
        <el-table-column prop="orderNo" label="联单号" min-width="120" />
        <el-table-column prop="amount" label="总转移量" width="100" />
        <el-table-column prop="receiverName" label="接收单位名称" min-width="180" />
        <el-table-column prop="transporterName" label="运输单位名称" min-width="180" />
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <span :class="['status-dot', scope.row.status === 'done' ? 'success' : 'warning']"></span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template>
            <el-button type="text" size="mini" class="btn-delete">删除</el-button>
            <el-button type="text" size="mini" class="btn-edit">修改</el-button>
            <el-button type="text" size="mini" class="btn-detail">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <span class="total-text">共{{ totalCount }}条</span>
        <el-pagination
          small
          background
          layout="prev, pager, next, jumper"
          :total="totalCount"
          :page-size="pageSize"
          :current-page="currentPage"
          :pager-count="5"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <div v-show="activeTab === 'approve'" class="table-section">
      <div class="action-bar">
        <el-button type="primary" size="mini" class="add-linkorder-btn" @click="openApproveDrawer">新增联单</el-button>
        <div class="search-box">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索" 
            size="mini" 
            suffix-icon="el-icon-search"
            style="width: 200px"
          />
        </div>
      </div>

      <el-table :data="paginatedApproveTableData" style="width: 100%" size="small" height="100%">
        <el-table-column prop="orderNo" label="联单号" min-width="140" />
        <el-table-column prop="amount" label="总转移量" width="100" />
        <el-table-column prop="receiverName" label="接收单位名称" min-width="200" />
        <el-table-column prop="transporterName" label="运输单位名称" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <span :class="['status-dot', scope.row.status === 'pending' ? 'danger' : 'success']"></span>
            <span style="margin-left: 5px; font-size: 13px;">{{ scope.row.status === 'pending' ? '待复核' : '已复核' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.status === 'pending'">
              <el-button type="text" size="mini" class="btn-edit-warning">修改</el-button>
              <el-button type="text" size="mini" class="btn-confirm-success" @click="handleApproveConfirm(scope.row)">确认</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <span class="total-text">共{{ approveTotalCount }}条</span>
        <el-pagination
          small
          background
          layout="prev, pager, next, jumper"
          :total="approveTotalCount"
          :page-size="approvePageSize"
          :current-page="approveCurrentPage"
          :pager-count="5"
          @current-change="handleApproveCurrentChange"
        />
      </div>
    </div>
    
    <div v-show="activeTab === 'inbound'" class="query-section">
      <h3 class="page-title">查询表格</h3>
      <div class="query-form">
        <div class="query-item">
          <label>日期</label>
          <el-date-picker
            v-model="inboundQueryParams.date"
            type="date"
            placeholder="请选择日期"
            class="custom-date-picker"
          />
        </div>
        <div class="query-item">
          <label>贮存设施</label>
          <el-select v-model="inboundQueryParams.storage" placeholder="全部" class="query-select">
            <el-option label="全部" value="" />
          </el-select>
        </div>
        <div class="query-buttons">
          <el-button type="primary">
            <i class="el-icon-search"></i> 查询
          </el-button>
          <el-button>
            <i class="el-icon-refresh"></i> 重置
          </el-button>
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'inbound'" class="table-section">
      <div class="action-bar">
        <el-button type="primary" size="mini" class="btn-update-order" @click="openInboundUpdateDialog">更新联单信息</el-button>
        <div class="search-box">
          <el-input 
            v-model="inboundSearchKeyword" 
            placeholder="搜索" 
            size="mini" 
            suffix-icon="el-icon-search"
            style="width: 200px"
          />
        </div>
      </div>

      <el-table :data="paginatedInboundTableData" style="width: 100%" size="small" height="100%">
        <el-table-column prop="orderNo" label="联单号" min-width="140" />
        <el-table-column prop="amount" label="预入库总量" width="100" />
        <el-table-column prop="unit" label="计量单位" width="80" />
        <el-table-column prop="inboundMethod" label="接收入库方式" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <span :class="['status-text', scope.row.status === 'pending' ? 'danger' : 'success']">
              {{ scope.row.status === 'pending' ? '待接收入库' : '已接收入库' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="transporter" label="运送部门经办人" min-width="150" />
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" class="btn-detail">详情</el-button>
            <template v-if="scope.row.status === 'pending'">
              <el-button type="text" size="mini" class="btn-inbound-success" @click="handleInbound(scope.row)">接收入库</el-button>
            </template>
            <template v-else>
              <el-button type="text" size="mini" class="btn-delete" @click="handleInboundDelete(scope.row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <span class="total-text">共{{ inboundTotalCount }}条</span>
        <el-pagination
          small
          background
          layout="prev, pager, next, jumper"
          :total="inboundTotalCount"
          :page-size="inboundPageSize"
          :current-page="inboundCurrentPage"
          :pager-count="5"
          @current-change="handleInboundCurrentChange"
        />
      </div>
    </div>

<!-- 更新联单信息弹窗 -->
    <el-dialog
      :visible.sync="inboundUpdateDialogVisible"
      width="328px"
      append-to-body
      center
      custom-class="update-linkorder-dialog"
    >
      <div class="update-dialog-header">
        <span class="update-dialog-title">更新联单信息</span>
        <i class="el-icon-close update-dialog-close" @click="inboundUpdateDialogVisible = false"></i>
      </div>
      <div class="update-dialog-content">
        <el-input
          v-model="inboundUpdateOrderNo"
          placeholder="请输入联单编号"
          prefix-icon="el-icon-document"
          size="medium"
        ></el-input>
        <div class="update-dialog-buttons">
          <el-button @click="handleInboundUpdate('precision')" class="btn-update-precision">
            精准更新
          </el-button>
          <el-button @click="handleInboundUpdate('scan')" class="btn-update-scan">
            <i class="el-icon-full-screen"></i> 扫码更新
          </el-button>
        </div>
      </div>
    </el-dialog>


    <el-dialog 
      title="关联标签" 
      :visible.sync="linkTagDialogVisible" 
      width="670px"
      :modal="false"
      append-to-body
      :close-on-click-modal="false"
      custom-class="link-tag-dialog"
    >
      <el-table 
        :data="linkTagList" 
        size="small" 
        @selection-change="handleTagSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="wasteName" label="危废名称" min-width="100" />
        <el-table-column prop="wasteCode" label="危废代码" min-width="100" />
        <el-table-column prop="weight" label="重量" min-width="60" align="center" />
        <el-table-column prop="unit" label="计量单位" min-width="60" align="center" />
        <el-table-column prop="idCode" label="数字识别码" min-width="180" />
      </el-table>
      
      <div class="link-tag-pagination">
        <span class="total-text">共{{ linkTagTotal }}条</span>
        <el-pagination
          small
          background
          layout="prev, pager, next, jumper"
          :total="linkTagTotal"
          :page-size="linkTagPageSize"
          :current-page="linkTagCurrentPage"
          @current-change="handleLinkTagPageChange"
        />
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button type="success" @click="confirmLinkTag" size="small" class="btn-confirm">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog 
      title="标签信息查看" 
      :visible.sync="viewTagDialogVisible" 
      width="800px"
      append-to-body
      center
      custom-class="view-tag-dialog"
    >
      <el-table :data="viewTagList" size="small" style="width: 100%;">
        <el-table-column prop="wasteName" label="危废名称" min-width="100" />
        <el-table-column prop="wasteCode" label="危废代码" min-width="120" />
        <el-table-column prop="weight" label="重量" min-width="80" />
        <el-table-column prop="unit" label="计量单位" min-width="80" />
        <el-table-column prop="idCode" label="数字识别码" min-width="240" />
      </el-table>
      
      <div class="view-tag-pagination-wrap">
        <span class="total-text">共{{ viewTagTotal }}条</span>
        <el-pagination
          small
          background
          layout="prev, pager, next, jumper"
          :total="viewTagTotal"
          :page-size="viewTagPageSize"
          :current-page="viewTagCurrentPage"
          @current-change="handleViewTagPageChange"
        />
      </div>
    </el-dialog>

    <el-dialog
      title="运输单位"
      :visible.sync="transporterDialogVisible"
      width="400px"
      :modal="false"
      append-to-body
      custom-class="transporter-dialog"
    >
      <div class="transporter-search-box">
        <el-input 
          v-model="transporterSearch" 
          placeholder="请输入运输单位关键字" 
          prefix-icon="el-icon-search" 
          size="small" 
          clearable>
        </el-input>
      </div>
      <ul class="transporter-list">
        <li v-for="(item, index) in transporterSearchResults" :key="index" @click="selectTransporterFromDialog(item)">
          <span class="transporter-name"><i class="el-icon-search"></i> {{ item.name }}</span>
          <span class="btn-set-common" @click.stop="setCommon(item)">设为常用</span>
        </li>
      </ul>
    </el-dialog>

    <el-drawer 
      :title="drawerTitle" 
      :visible.sync="drawerVisible" 
      size="900px" 
      custom-class="add-order-drawer"
      :wrapper-closable="false"
      append-to-body
      @closed="resetDrawer"
    >
      <div class="drawer-container">
        <div class="drawer-content">
          <div class="step-indicator" v-if="drawerStep === 1 || drawerStep === 2">
            <div class="step-item" :class="{ active: drawerStep >= 1 }">
              <div class="step-circle">1</div>
              <span>选择转移企业</span>
            </div>
            <div class="step-line"></div>
            <div class="step-item" :class="{ active: drawerStep >= 2 }">
              <div class="step-circle">2</div>
              <span>危废信息添加</span>
            </div>
          </div>

          <div v-if="drawerStep === 1" class="step-content-inner">
            <div class="dialog-action-bar">
              <span>选择接收单位</span>
              <el-input 
                v-model="drawerSearch" 
                placeholder="请输入接收单位名称" 
                size="mini" 
                suffix-icon="el-icon-search"
                style="width: 200px"
              />
            </div>
            <el-table :data="companyList" size="small" border @row-click="goToStep2" style="cursor: pointer;">
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="name" label="接收单位名称" min-width="200" />
              <el-table-column prop="type" label="计划类型" width="120" />
              <el-table-column prop="license" label="许可证编号" min-width="180" />
              <el-table-column label="操作" width="100" align="center">
                <template>
                  <span class="text-danger">撤销常用</span>
                </template>
              </el-table-column>
            </el-table>
            <div class="dialog-pagination">
              <el-pagination small layout="total, prev, pager, next, jumper" :total="companyTotal" />
            </div>
          </div>

          <div v-if="drawerStep === 2" class="step-content-inner">
            <div class="dialog-title-text">添加危废</div>
            <el-table :data="wasteList" size="small" border>
              <el-table-column type="selection" width="50" align="center" />
              <el-table-column prop="name" label="危废名称" width="120" />
              <el-table-column prop="code" label="危废代码" width="120" />
              <el-table-column prop="idCode" label="数字识别码" min-width="200" />
              <el-table-column prop="pack" label="包装方式" width="100" />
            </el-table>
            <div class="dialog-pagination flex-between">
              <el-pagination small layout="total, prev, pager, next, jumper" :total="wasteTotal" />
              <div class="dialog-btns">
                <el-button size="small" @click="goToStep3">从产生点转移</el-button>
                <el-button type="success" size="small" @click="goToStep3">从出库点转移</el-button>
              </div>
            </div>
          </div>

          <div v-if="drawerStep === 3" class="step-content-inner">
            <div class="form-section">
              <div class="section-title">填写信息</div>
              <el-row :gutter="20" class="form-row">
                <el-col :span="8">
                  <div class="form-item-vertical">
                    <label>联单号</label>
                    <el-input value="完成申报后自动产生联单号" disabled size="small" />
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="form-item-vertical">
                    <label>运送部门经办人</label>
                    <el-select v-model="formData.transporter" placeholder="请选择" size="small" class="full-width">
                      <el-option label="张三" value="zhangsan" />
                    </el-select>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="form-item-vertical">
                    <label>出库部门经办人</label>
                    <el-select v-model="formData.outbounder" placeholder="请选择" size="small" class="full-width">
                      <el-option label="李四" value="lisi" />
                    </el-select>
                  </div>
                </el-col>
              </el-row>
              <el-row :gutter="20" class="form-row">
                <el-col :span="8">
                  <div class="form-item-vertical">
                    <label>移出单位联系人</label>
                    <el-input v-model="formData.contactName" size="small" />
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="form-item-vertical">
                    <label>移出单位联系人手机</label>
                    <el-input v-model="formData.contactPhone" size="small" />
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="form-item-vertical">
                    <label>应急联系电话</label>
                    <el-input v-model="formData.emergencyPhone" size="small" />
                  </div>
                </el-col>
              </el-row>
            </div>

            <div class="form-section">
              <div class="section-title">接收信息</div>
              <div class="inner-tabs">
                <span :class="{ active: innerTab === 'receive' }" @click="innerTab = 'receive'">接收信息</span>
                <span :class="{ active: innerTab === 'waste' }" @click="innerTab = 'waste'">危废信息</span>
                <span :class="{ active: innerTab === 'transport' }" @click="innerTab = 'transport'">运输信息</span>
              </div>

              <div v-if="innerTab === 'receive'" class="tab-pane-content">
                <el-row :gutter="20" class="form-row">
                  <el-col :span="8">
                    <div class="form-item-vertical">
                      <label>移出单位联系人</label>
                      <div class="read-only-text">奉</div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="form-item-vertical">
                      <label>移出单位联系人手机</label>
                      <div class="read-only-text">19176509640</div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="form-item-vertical">
                      <label>接收单位许可证编号</label>
                      <div class="read-only-text">Y13205830068267</div>
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="20" class="form-row">
                  <el-col :span="8">
                    <div class="form-item-vertical">
                      <label>接收单位行政区划</label>
                      <div class="read-only-text">佛山南海</div>
                    </div>
                  </el-col>
                  <el-col :span="16">
                    <div class="form-item-vertical">
                      <label>接收单位地址</label>
                      <div class="read-only-text">佛山市南海区狮山镇狮城路11号腾大时代广场B座1207号</div>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <div v-if="innerTab === 'waste'" class="tab-pane-content">
                <el-table :data="selectedWasteList" size="small">
                  <el-table-column prop="name" label="危废名称" />
                  <el-table-column prop="code" label="危废代码" />
                  <el-table-column prop="pack" label="包装方式">
                    <template slot-scope="scope">
                      <el-select v-model="scope.row.pack" size="mini" style="width: 80px">
                        <el-option label="袋装" value="袋装"></el-option>
                        <el-option label="桶装" value="桶装"></el-option>
                        <el-option label="箱装" value="箱装"></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="计划转移总量">
                    <template slot-scope="scope">
                      <div class="edit-cell">
                        <span>{{ scope.row.weight || '2' }}</span>
                        <i class="el-icon-edit"></i>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="unit" label="计量单位" />
                  <el-table-column label="操作" width="150" align="center">
                    <template slot-scope="scope">
                      <el-button type="text" size="mini" class="text-gray" @click="openViewTagDialog">标签查看</el-button>
                      <el-button type="text" size="mini" class="text-green" @click="openLinkTagDialog(scope.$index)">关联添加</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <div class="dialog-pagination">
                  <el-pagination small layout="total, prev, pager, next" :total="selectedWasteList.length" />
                </div>
              </div>

              <div v-if="innerTab === 'transport'" class="tab-pane-content">
                <div v-for="(item, index) in transportList" :key="index" class="transport-card">
                  <div class="transport-card-title">
                    <span class="vertical-line"></span>运输单位信息(第{{ getCarrierName(index) }}承运人)
                  </div>
                  <el-row :gutter="20" class="form-row">
                    <el-col :span="8">
                      <div class="form-item-vertical">
                        <label>运输类型</label>
                        <el-select v-model="item.type" placeholder="请选择" size="small" class="full-width">
                          <el-option label="公路运输" value="road" />
                          <el-option label="水路运输" value="water" />
                        </el-select>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="form-item-vertical">
                        <label>运输方式</label>
                        <el-select v-model="item.method" placeholder="请选择" size="small" class="full-width">
                          <el-option label="普通货车" value="truck" />
                        </el-select>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="form-item-vertical">
                        <label>运输单位</label>
                        <el-select 
                          v-model="item.unitName" 
                          placeholder="请选择" 
                          size="small" 
                          class="full-width"
                          popper-class="transporter-select-popper"
                          @change="(val) => handleTransporterSelect(val, index)"
                        >
                          <div class="popper-group-title">常用</div>
                          <el-option
                            v-for="(unit, uIdx) in commonTransporters"
                            :key="uIdx"
                            :label="unit.name"
                            :value="unit.name"
                            class="transporter-option"
                          >
                            <span class="unit-name">{{ unit.name }}</span>
                            <span class="remove-common" @click.stop="removeCommon(uIdx)">撤销常用</span>
                          </el-option>
                          <div class="popper-footer" @click="openTransporterSearch(index)">
                            <i class="el-icon-search"></i> 搜索添加
                          </div>
                        </el-select>
                      </div>
                    </el-col>
                  </el-row>
                  <div v-if="item.details" class="transport-detail-section">
                    <div class="transport-card-title">
                      <span class="vertical-line"></span>运输单位信息
                    </div>
                    <el-row :gutter="20">
                      <el-col :span="8"><div class="d-item"><span class="d-label">企业id</span><span class="d-value">{{ item.details.id }}</span></div></el-col>
                      <el-col :span="8"><div class="d-item"><span class="d-label">行政区划</span><span class="d-value">{{ item.details.region }}</span></div></el-col>
                      <el-col :span="8"><div class="d-item"><span class="d-label">联系人</span><span class="d-value">{{ item.details.contact }}</span></div></el-col>
                    </el-row>
                    <el-row :gutter="20" style="margin-top: 10px;">
                      <el-col :span="8"><div class="d-item"><span class="d-label">联系人手机</span><span class="d-value">{{ item.details.phone }}</span></div></el-col>
                      <el-col :span="8"><div class="d-item"><span class="d-label">统一社会信用代码</span><span class="d-value">{{ item.details.creditCode }}</span></div></el-col>
                      <el-col :span="8"><div class="d-item"><span class="d-label">企业地址</span><span class="d-value">{{ item.details.address }}</span></div></el-col>
                    </el-row>
                  </div>
                </div>
                <el-button plain class="btn-add-transport" @click="addTransportUnit">添加运输单位</el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="drawer-footer" v-if="drawerStep === 3">
          <el-button @click="drawerVisible = false" class="btn-drawer-save">保存</el-button>
          <el-button type="success" @click="handleConfirm" class="btn-drawer-submit">确认</el-button>
        </div>
      </div>
    </el-drawer>

    <el-drawer
      title="联单信息"
      :visible.sync="approveDrawerVisible"
      size="900px"
      :wrapper-closable="false"
      append-to-body
      custom-class="add-order-drawer"
    >
      <div class="drawer-container">
        <div class="drawer-content" style="padding-top: 10px;">
          <div class="form-section">
            <div class="section-title">填写信息</div>
            <el-row :gutter="20" class="form-row">
              <el-col :span="8">
                <div class="form-item-vertical">
                  <label>联单号</label>
                  <el-input value="90807878329398" disabled size="small" class="bg-gray-input" />
                </div>
              </el-col>
              <el-col :span="8">
                <div class="form-item-vertical">
                  <label>运送部门经办人</label>
                  <el-select v-model="approveFormData.transporter" placeholder="请选择" size="small" class="full-width">
                    <el-option label="奉" value="feng" />
                  </el-select>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="form-item-vertical">
                  <label>出库部门经办人</label>
                  <el-select v-model="approveFormData.outbounder" placeholder="请选择" size="small" class="full-width">
                    <el-option label="奉" value="feng" />
                  </el-select>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20" class="form-row" style="margin-top: 8px;">
              <el-col :span="8">
                <div class="form-item-vertical">
                  <label>移出单位联系人</label>
                  <el-input v-model="approveFormData.contactName" size="small" />
                </div>
              </el-col>
              <el-col :span="8">
                <div class="form-item-vertical">
                  <label>移出单位联系人手机</label>
                  <el-input v-model="approveFormData.contactPhone" size="small" />
                </div>
              </el-col>
              <el-col :span="8">
                <div class="form-item-vertical">
                  <label>应急联系电话</label>
                  <el-input v-model="approveFormData.emergencyPhone" size="small" />
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="form-section" style="margin-top: 15px;">
            <div class="section-title">接收信息</div>
            <div class="inner-tabs">
              <span :class="{ active: approveInnerTab === 'receive' }" @click="approveInnerTab = 'receive'">接收信息</span>
              <span :class="{ active: approveInnerTab === 'waste' }" @click="approveInnerTab = 'waste'">危废信息</span>
              <span :class="{ active: approveInnerTab === 'transport' }" @click="approveInnerTab = 'transport'">运输信息</span>
            </div>

            <div v-if="approveInnerTab === 'receive'" class="tab-pane-content">
              <div v-if="approveStep === 1">
                <el-row :gutter="20" class="form-row">
                  <el-col :span="8">
                    <div class="form-item-vertical">
                      <label>移出单位联系人</label>
                      <el-input v-model="approveFormData.receiverContact" size="small" />
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="form-item-vertical">
                      <label>移出单位联系人手机</label>
                      <el-input v-model="approveFormData.receiverPhone" size="small" />
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="form-item-vertical">
                      <label>接收单位许可证编号</label>
                      <el-input v-model="approveFormData.receiverLicense" size="small" />
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="20" class="form-row" style="margin-top: 8px;">
                  <el-col :span="8">
                    <div class="form-item-vertical">
                      <label>接收单位行政区划</label>
                      <el-input v-model="approveFormData.receiverRegion" size="small" />
                    </div>
                  </el-col>
                  <el-col :span="16">
                    <div class="form-item-vertical">
                      <label>接收单位地址</label>
                      <el-input v-model="approveFormData.receiverAddress" size="small" />
                    </div>
                  </el-col>
                </el-row>
              </div>
              
              <div v-else class="waste-cards-wrapper">
                <div v-for="(item, index) in approveWasteList" :key="index" class="waste-card-box">
                  <div class="w-card-name">{{ item.name }}</div>
                  <div class="w-card-code">{{ item.code }}</div>
                  
                  <el-row class="w-card-row">
                    <el-col :span="12">
                      <span class="w-card-label">包装方式</span>
                      <span>{{ item.pack }}</span>
                    </el-col>
                    <el-col :span="12">
                      <span class="w-card-label">计量单位</span>
                      <span>{{ item.unit }}</span>
                    </el-col>
                  </el-row>
                  
                  <el-row class="w-card-row" style="align-items: center;">
                    <el-col :span="12">
                      <span class="w-card-label">计划转移重量</span>
                      <span>{{ item.weight }}</span>
                    </el-col>
                    <el-col :span="12" class="actual-weight-wrap">
                      <span class="req-star">*</span>
                      <span class="w-card-label">实际转移总量</span>
                      <el-input v-model="item.actualWeight" size="mini" class="actual-weight-input">
                        <i slot="suffix" class="el-input__icon el-icon-edit"></i>
                      </el-input>
                    </el-col>
                  </el-row>
                  
                  <div class="w-card-footer">
                    <el-button type="success" size="small" class="btn-tag-view" @click="openViewTagDialog">
                      标签查看
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="approveInnerTab === 'waste'" class="tab-pane-content">
              <el-table :data="selectedWasteList" size="small">
                <el-table-column prop="name" label="危废名称" />
                <el-table-column prop="code" label="危废代码" />
                <el-table-column prop="pack" label="包装方式">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.pack" size="mini" style="width: 80px">
                      <el-option label="袋装" value="袋装"></el-option>
                      <el-option label="桶装" value="桶装"></el-option>
                      <el-option label="箱装" value="箱装"></el-option>
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="计划转移总量">
                  <template slot-scope="scope">
                    <div class="edit-cell">
                      <span>{{ scope.row.weight || '2' }}</span>
                      <i class="el-icon-edit"></i>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="unit" label="计量单位" />
                <el-table-column label="操作" width="150" align="center">
                  <template slot-scope="scope">
                    <el-button type="text" size="mini" class="text-gray" @click="openViewTagDialog">标签查看</el-button>
                    <el-button type="text" size="mini" class="text-green" @click="openLinkTagDialog(scope.$index)">关联添加</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="dialog-pagination">
                <el-pagination small layout="total, prev, pager, next" :total="selectedWasteList.length" />
              </div>
            </div>

            <div v-if="approveInnerTab === 'transport'" class="tab-pane-content">
              <div v-for="(item, index) in transportList" :key="index" class="transport-card">
                <div class="transport-card-title">
                  <span class="vertical-line"></span>运输单位信息(第{{ getCarrierName(index) }}承运人)
                </div>
                <el-row :gutter="20" class="form-row">
                  <el-col :span="8">
                    <div class="form-item-vertical">
                      <label>运输类型</label>
                      <el-select v-model="item.type" placeholder="请选择" size="small" class="full-width">
                        <el-option label="公路运输" value="road" />
                        <el-option label="水路运输" value="water" />
                      </el-select>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="form-item-vertical">
                      <label>运输方式</label>
                      <el-select v-model="item.method" placeholder="请选择" size="small" class="full-width">
                        <el-option label="普通货车" value="truck" />
                      </el-select>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="form-item-vertical">
                      <label>运输单位</label>
                      <el-select 
                        v-model="item.unitName" 
                        placeholder="请选择" 
                        size="small" 
                        class="full-width"
                        popper-class="transporter-select-popper"
                        @change="(val) => handleTransporterSelect(val, index)"
                      >
                        <div class="popper-group-title">常用</div>
                        <el-option
                          v-for="(unit, uIdx) in commonTransporters"
                          :key="uIdx"
                          :label="unit.name"
                          :value="unit.name"
                          class="transporter-option"
                        >
                          <span class="unit-name">{{ unit.name }}</span>
                          <span class="remove-common" @click.stop="removeCommon(uIdx)">撤销常用</span>
                        </el-option>
                        <div class="popper-footer" @click="openTransporterSearch(index)">
                          <i class="el-icon-search"></i> 搜索添加
                        </div>
                      </el-select>
                    </div>
                  </el-col>
                </el-row>

                <div v-if="item.details" class="transport-detail-section">
                  <div class="transport-card-title">
                    <span class="vertical-line"></span>运输单位信息
                  </div>
                  <el-row :gutter="20">
                    <el-col :span="8"><div class="d-item"><span class="d-label">企业id</span><span class="d-value">{{ item.details.id }}</span></div></el-col>
                    <el-col :span="8"><div class="d-item"><span class="d-label">行政区划</span><span class="d-value">{{ item.details.region }}</span></div></el-col>
                    <el-col :span="8"><div class="d-item"><span class="d-label">联系人</span><span class="d-value">{{ item.details.contact }}</span></div></el-col>
                  </el-row>
                  <el-row :gutter="20" style="margin-top: 10px;">
                    <el-col :span="8"><div class="d-item"><span class="d-label">联系人手机</span><span class="d-value">{{ item.details.phone }}</span></div></el-col>
                    <el-col :span="8"><div class="d-item"><span class="d-label">统一社会信用代码</span><span class="d-value">{{ item.details.creditCode }}</span></div></el-col>
                    <el-col :span="8"><div class="d-item"><span class="d-label">企业地址</span><span class="d-value">{{ item.details.address }}</span></div></el-col>
                  </el-row>
                </div>
              </div>
              <el-button plain class="btn-add-transport" @click="addTransportUnit">添加运输单位</el-button>
            </div>
          </div>
        </div>

        <div class="drawer-footer">
          <el-button @click="approveDrawerVisible = false" size="small" class="btn-drawer-save">保存</el-button>
          <el-button type="success" size="small" class="btn-drawer-submit" @click="handleApproveNext">
            {{ approveInnerTab === 'transport' ? '确认' : '下一步' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

  </div>
</template>

<script>
export default {
  name: 'LinkorderPage',
  data() {
    return {
      activeTab: 'approve', // 默认展示联单核准
      tabs: [
        { key: 'transfer', name: '转移联单' },
        { key: 'approve', name: '联单核准' },
        { key: 'inbound', name: '联单接入库' }
      ],
      // 查询参数
      queryParams: {
        date: '',
        receiver: '',
        transporter: ''
      },
      // 接收单位和运输单位列表（用于查询下拉框）
      receiverList: [],
      transporterList: [],
      // 转移联单
      searchKeyword: '',
      
      // 转移联单分页
      currentPage: 1,
      pageSize: 9,
      totalCount: 0,
      originalTableData: Array(10).fill({
        orderNo: 'LD20260106000001',
        amount: '10吨',
        receiverName: '佛山市优特环境科技有限公司',
        transporterName: '佛山市旭朗环境科技有限公司',
        status: 'warning'
      }),
      tableData: [],
      
      // ★ 联单核准表格数据及分页 ★
      approveTableData: [],
      approveCurrentPage: 1,
      approvePageSize: 9,
      approveTotalCount: 0,
      
      // ★ 联单接入库表格数据及分页 ★
      inboundQueryParams: {
        date: '',
        storage: ''
      },
      inboundSearchKeyword: '',
      inboundTableData: [],
      inboundCurrentPage: 1,
      inboundPageSize: 9,
      inboundTotalCount: 0,

      // 转移联单抽屉
      drawerVisible: false,
      drawerStep: 1,
      drawerSearch: '',
      innerTab: 'receive', 
      formData: {
        transporter: '',
        outbounder: '',
        contactName: '奉',
        contactPhone: '19176509640',
        emergencyPhone: '19176509640'
      },

      // ★ 联单核准抽屉数据 ★
      approveDrawerVisible: false,
      approveInnerTab: 'receive', // 默认页签：接收信息
      approveStep: 1,             // 步骤控制：1=填信息表单，2=展示卡片视图
      approveFormData: {
        transporter: 'feng',
        outbounder: 'feng',
        contactName: '奉',
        contactPhone: '19176509640',
        emergencyPhone: '19176509640',
        receiverContact: '奉',
        receiverPhone: '19176509640',
        receiverLicense: 'Y13205830068267',
        receiverRegion: '佛山南海',
        receiverAddress: '佛山市南海区狮山镇狮城路11号腾大时代广场B座1207号'
      },
      
      // 接收信息中第2步展示的废抹布卡片数据
      approveWasteList: [
        { name: '废抹布', code: '900-041-49', pack: '袋装', unit: '吨', weight: 5, actualWeight: 1 },
        { name: '废抹布', code: '900-041-49', pack: '袋装', unit: '吨', weight: 5, actualWeight: 1 }
      ],

      companyList: Array(10).fill({
        name: '佛山市优特环境科技有限公司',
        type: '省内转移',
        license: '91440605324808890A'
      }),
      companyTotal: 0,
      wasteList: [
        { name: '废抹布', code: '7631-99-4', idCode: '9999999999999999A90004149001', pack: '袋装' },
        { name: '活性炭', code: '7631-99-4', idCode: '9999999999999999A90004149001', pack: '桶装' },
        { name: '废油漆桶', code: '7631-99-4', idCode: '9999999999999999A90004149001', pack: '桶装' }
      ],
      wasteTotal: 0,
      selectedWasteList: Array(8).fill({
        name: '废抹布',
        code: '7631-99-4',
        unit: '吨'
      }),
      
      // 关联标签弹窗数据
      linkTagDialogVisible: false,
      linkTagCurrentPage: 1,
      linkTagPageSize: 6, // 缩小条数防滚动条
      linkTagTotal: 0,
      allLinkTagList: [], 
      linkTagList: [],    
      selectedTagList: [],  
      currentWasteIndex: -1,
      
      // ★ 标签信息查看弹窗数据 (纯展示，无勾选框) ★
      viewTagDialogVisible: false,
      viewTagCurrentPage: 1,
      viewTagPageSize: 10, 
      viewTagTotal: 50,
      allViewTagList: [],
      viewTagList: [],
      
      transportList: [
        {
          type: '',
          method: '',
          unitName: '佛山优特环境科技有限公司',
          details: {
            id: '1234556788',
            region: '佛山南海',
            contact: '奉',
            phone: '19176509640',
            creditCode: 'Y13205830068267',
            address: '佛山市南海区狮山镇狮城路11号腾大时代广场B座1207号'
          }
        }
      ],
      commonTransporters: [
        { name: '佛山市优特环境科技有限公司' },
        { name: '佛山市旭朗环境科技有限公司' }
      ],
      transporterDialogVisible: false,
      transporterSearch: '佛山',
      transporterSearchResults: [
        { name: '佛山市优特环境科技有限公司' },
        { name: '佛山市旭朗环境科技有限公司' }
      ],
      currentTransportIndex: -1,
      inboundUpdateDialogVisible: false,
      inboundUpdateKeyword: '',

    }
  
  },
  computed: {
    drawerTitle() {
      if (this.drawerStep === 3) return '新增联单 / 联单填报'
      return '新增联单'
    },
    paginatedApproveTableData() {
      const start = (this.approveCurrentPage - 1) * this.approvePageSize;
      const end = start + this.approvePageSize;
      return this.approveTableData.slice(start, end);
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.tableData.slice(start, end);
    },
    paginatedInboundTableData() {
      const start = (this.inboundCurrentPage - 1) * this.inboundPageSize;
      const end = start + this.inboundPageSize;
      return this.inboundTableData.slice(start, end);
    }
  },
  mounted() {
    this.tableData = [...this.originalTableData];
    this.totalCount = this.tableData.length;
    this.companyTotal = this.companyList.length;
    this.wasteTotal = this.wasteList.length;
    this.initAllLinkTagList();
    this.initAllViewTagList(); // 初始化查看弹窗数据
    this.initApproveTableData();
    this.initInboundTableData();
    this.initQueryOptions(); // 初始化查询下拉框选项
  },
  methods: {
    // 初始化查询下拉框选项
    initQueryOptions() {
      const receiverSet = new Set();
      const transporterSet = new Set();
      
      this.originalTableData.forEach(item => {
        if (item.receiverName) {
          receiverSet.add(item.receiverName);
        }
        if (item.transporterName) {
          transporterSet.add(item.transporterName);
        }
      });
      
      this.receiverList = Array.from(receiverSet);
      this.transporterList = Array.from(transporterSet);
    },
    
    // 查询功能
    handleQuery() {
      const { date, receiver, transporter } = this.queryParams;
      
      if (!date && !receiver && !transporter) {
        this.$message.warning('请选择查询条件');
        return;
      }
      
      this.tableData = this.originalTableData.filter(item => {
        let match = true;
        
        // 日期筛选：如果选择了日期，则联单号必须包含日期
        if (date) {
          const dateStr = date.replace(/-/g, '');
          if (!item.orderNo.includes(dateStr)) {
            match = false;
          }
        }
        
        // 接收单位筛选：如果选择了具体接收单位（非空），则必须完全匹配
        if (receiver) {
          if (item.receiverName !== receiver) {
            match = false;
          }
        }
        
        // 运输单位筛选：如果选择了具体运输单位（非空），则必须完全匹配
        if (transporter) {
          if (item.transporterName !== transporter) {
            match = false;
          }
        }
        
        return match;
      });
      
      this.totalCount = this.tableData.length;
      this.currentPage = 1;
    },
    
    // 重置功能
    handleReset() {
      this.queryParams = {
        date: '',
        receiver: '',
        transporter: ''
      };
      this.searchKeyword = '';
      this.tableData = [...this.originalTableData];
      this.totalCount = this.tableData.length;
      this.currentPage = 1;
    },
    
    // 搜索功能
    handleSearch() {
      const keyword = this.searchKeyword.trim();
      
      if (!keyword) {
        this.tableData = [...this.originalTableData];
      } else {
        this.tableData = this.originalTableData.filter(item => {
          return (
            item.orderNo.includes(keyword) ||
            item.amount.includes(keyword) ||
            item.receiverName.includes(keyword) ||
            item.transporterName.includes(keyword)
          );
        });
      }
      
      this.totalCount = this.tableData.length;
      this.currentPage = 1;
    },
    // 初始化联单核准的主表格数据
    initApproveTableData() {
      this.approveTableData = Array(50).fill(null).map((_, index) => {
        return {
          orderNo: 'LD20260106000001',
          amount: '10吨',
          receiverName: '佛山优特环境科技有限公司',
          transporterName: '佛山市铂朗环境科技有限公司',
          status: index < 6 ? 'pending' : 'done'
        };
      });
      this.approveTotalCount = this.approveTableData.length;
    },
    handleApproveCurrentChange(val) {
      this.approveCurrentPage = val;
    },
    
    // 初始化联单接入库的主表格数据
    initInboundTableData() {
      this.inboundTableData = Array(50).fill(null).map((_, index) => {
        return {
          orderNo: 'LD20260106000001',
          amount: '10',
          unit: '吨',
          inboundMethod: '联单入库',
          status: index < 6 ? 'pending' : 'done',
          transporter: '奉' // 运送部门经办人
        };
      });
      this.inboundTotalCount = this.inboundTableData.length;
    },
    handleInboundCurrentChange(val) {
      this.inboundCurrentPage = val;
    },
    
    // ★ 联单核准：打开抽屉，初始化流程 ★
    openApproveDrawer() {
      this.approveDrawerVisible = true;
      this.approveInnerTab = 'receive'; // 初始为接收信息页签
      this.approveStep = 1;             // 初始为填写表单步骤
    },
    
    // ★ 联单核准：动态下一步与确认逻辑 ★
    handleApproveNext() {
      if (this.approveInnerTab === 'receive') {
        if (this.approveStep === 1) {
          // 第一步(表单)填完后，点击下一步变为废抹布卡片(步骤2)
          this.approveStep = 2;
        } else {
          // 卡片看完后，进入下一页签(危废信息)
          this.approveInnerTab = 'waste';
        }
      } else if (this.approveInnerTab === 'waste') {
        // 危废信息完毕后，进入运输信息
        this.approveInnerTab = 'transport';
      } else if (this.approveInnerTab === 'transport') {
        // 最后一步点击确认，推入【联单核准表格】中
        const newOrder = {
          orderNo: 'LD' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '000' + (this.approveTableData.length + 1),
          amount: '10吨',
          receiverName: this.approveFormData.receiverContact || '佛山优特环境科技有限公司',
          transporterName: this.transportList[0]?.unitName || '佛山市铂朗环境科技有限公司',
          status: 'pending' 
        };
        
        // ★ 将新数据添加到核准表格的最前面 ★
        this.approveTableData.unshift(newOrder);
        this.approveTotalCount = this.approveTableData.length;
        
        // 关闭抽屉并提示
        this.approveDrawerVisible = false;
        this.$message.success('联单核准添加成功');
      }
    },

    handleCurrentChange(val) {
      this.currentPage = val;
    },
    openDrawer() {
      this.drawerStep = 1
      this.drawerVisible = true
    },
    goToStep2() {
      this.drawerStep = 2
    },
    goToStep3() {
      this.drawerStep = 3
      this.innerTab = 'receive'
    },
    resetDrawer() {
      this.drawerStep = 1
      this.innerTab = 'receive'
    },
    handleConfirm() {
      const newOrder = {
        orderNo: 'LD' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '0000' + (this.tableData.length + 1),
        amount: this.selectedWasteList.length + '吨',
        receiverName: '佛山市优特环境科技有限公司',
        transporterName: this.transportList[0]?.unitName || '未选择',
        status: 'warning' 
      };
      this.tableData.unshift(newOrder);
      this.totalCount = this.tableData.length;
      this.drawerVisible = false;
      this.$message.success('联单添加成功');
    },
    
    // 接收入库处理
    handleInbound(row) {
      row.status = 'done';
      this.$message.success('接收入库成功');
    },
    
    // 删除入库记录
    handleInboundDelete(row) {
      const index = this.inboundTableData.findIndex(item => item.orderNo === row.orderNo);
      if (index > -1) {
        this.inboundTableData.splice(index, 1);
        this.inboundTotalCount = this.inboundTableData.length;
        this.$message.success('删除成功');
      }
    },
    
    // 确认复核处理
    handleApproveConfirm(row) {
      row.status = 'done';
      this.$message.success('确认复核成功');
    },
    
    // 关联标签弹窗逻辑
    openLinkTagDialog(index) {
      this.currentWasteIndex = index;
      this.linkTagDialogVisible = true;
      this.linkTagCurrentPage = 1;
      this.updateLinkTagPageData(); 
    },
    initAllLinkTagList() {
      this.allLinkTagList = Array(25).fill(null).map((_, index) => ({
        id: index + 1,
        wasteName: '活性炭',
        wasteCode: '7631-99-4',
        weight: [4, 76, 76, 76, 76, 76, 76, 7, 4, 4][index % 10],
        unit: '吨',
        idCode: `9999999999999999A90004149${String(index + 1).padStart(3, '0')}`
      }));
      this.linkTagTotal = this.allLinkTagList.length; 
    },
    updateLinkTagPageData() {
      const start = (this.linkTagCurrentPage - 1) * this.linkTagPageSize;
      const end = start + this.linkTagPageSize;
      this.linkTagList = this.allLinkTagList.slice(start, end);
    },
    handleLinkTagPageChange(page) {
      this.linkTagCurrentPage = page;
      this.updateLinkTagPageData(); 
    },
    handleTagSelectionChange(selection) {
      this.selectedTagList = selection;
    },
    confirmLinkTag() {
      if (this.selectedTagList.length === 0) {
        this.$message.warning('请选择要关联的标签');
        return;
      }
      this.selectedTagList.forEach(tag => {
        this.selectedWasteList.push({
          name: tag.wasteName,
          code: tag.wasteCode,
          pack: '袋装',
          weight: tag.weight,
          unit: tag.unit,
          idCode: tag.idCode
        });
      });
      this.$message.success(`成功关联 ${this.selectedTagList.length} 个标签`);
      this.linkTagDialogVisible = false;
      this.selectedTagList = [];
    },

    // ★ 标签查看弹窗逻辑 (一屏完美显示) ★
    initAllViewTagList() {
      this.allViewTagList = Array(50).fill(null).map((_, index) => ({
        wasteName: ['废抹布', '活性炭', '废油漆桶'][index % 3],
        wasteCode: '7631-99-4',
        weight: [4, 76, 7][index % 3],
        unit: '吨',
        idCode: `9999999999999999A90004149001`
      }));
      this.viewTagTotal = this.allViewTagList.length;
    },
    openViewTagDialog() { 
      this.viewTagDialogVisible = true;
      this.viewTagCurrentPage = 1;
      this.updateViewTagList();
    },
    updateViewTagList() {
      const start = (this.viewTagCurrentPage - 1) * this.viewTagPageSize;
      const end = start + this.viewTagPageSize;
      this.viewTagList = this.allViewTagList.slice(start, end);
    },

    // 更新联单信息弹窗
    openInboundUpdateDialog() {
      this.inboundUpdateOrderNo = '';
      this.inboundUpdateDialogVisible = true;
    },
    handleInboundUpdate(type) {
      if (type === 'precision') {
        if (!this.inboundUpdateOrderNo.trim()) {
          this.$message.warning('请输入联单编号');
          return;
        }
        this.$message.success(`正在更新联单 ${this.inboundUpdateOrderNo} 的信息`);
        this.inboundUpdateDialogVisible = false;
      } else if (type === 'scan') {
        this.$message.info('请调用摄像头扫描联单二维码');
      }
    },

    handleViewTagPageChange(page) {
      this.viewTagCurrentPage = page;
      this.updateViewTagList();
    },

    getCarrierName(index) {
      const numMap = ['一', '二', '三', '四', '五', '六'];
      return numMap[index] || index + 1;
    },
    handleTransporterSelect(val, index) {
      this.transportList[index].details = {
        id: '1234556788',
        region: '佛山南海',
        contact: '奉',
        phone: '19176509640',
        creditCode: 'Y13205830068267',
        address: '佛山市南海区狮山镇狮城路11号腾大时代广场B座1207号'
      };
    },
    openTransporterSearch(index) {
      this.currentTransportIndex = index;
      this.transporterDialogVisible = true;
    },
    addTransportUnit() {
      this.currentTransportIndex = 0; 
      this.transporterDialogVisible = true;
    },
    removeCommon(index) {
      this.commonTransporters.splice(index, 1);
    },
    setCommon(item) {
      this.$message.success('已设为常用');
      const exists = this.commonTransporters.some(u => u.name === item.name);
      if (!exists) {
        this.commonTransporters.push({ name: item.name });
      }
    },
    selectTransporterFromDialog(item) {
      const mockDetails = {
        id: '1234556788',
        region: '佛山南海',
        contact: '奉',
        phone: '19176509640',
        creditCode: 'Y13205830068267',
        address: '佛山市南海区狮山镇狮城路11号腾大时代广场B座1207号'
      };

      if (this.currentTransportIndex === -1) {
        this.transportList.push({
          type: '',
          method: '',
          unitName: item.name,
          details: mockDetails
        });
      } else {
        this.transportList[this.currentTransportIndex].unitName = item.name;
        this.transportList[this.currentTransportIndex].details = mockDetails;
      }
      this.queryParams.transporter = item.name;
      this.transporterDialogVisible = false;
    }
  }
}
</script>

<style scoped>
/* 原有的页面核心结构样式 */
.linkorder-container {
  height: 100vh;
  width: 100%;
  background: white;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden; /* 防止整个页面出现滚动条 */
  box-sizing: border-box;
}

.tabs-header {
  display: flex;
  gap: 30px;
  padding: 15px 25px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.tab-nav-item {
  font-size: 14px;
  color: #717782;
  cursor: pointer;
  position: relative;
  padding-bottom: 5px;
}

.tab-nav-item.active {
  color: #13B63A;
  font-weight: bold;
}

.tab-nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #13B63A;
}

.query-section {
  padding: 15px 25px;
  flex-shrink: 0;
  border-bottom: 1px solid #F2F3F5;
}

.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #1D2129;
  font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;
  margin: 0 0 15px 0;
}

.query-form {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: nowrap;
}

.query-item {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.query-item label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.custom-date-picker { width: 140px !important; height: 24px !important; }
.query-select { width: 140px !important; height: 24px !important; }

.custom-date-picker :deep(.el-input__inner),
.query-select :deep(.el-input__inner) {
  font-size: 12px !important;
  line-height: 20px !important;
  height: 24px !important;
  background-color: #F2F3F5 !important;
  border: 1px solid transparent !important;
  color: #1D2129 !important;
}

.custom-date-picker :deep(.el-input__inner:focus),
.query-select :deep(.el-input__inner:focus) {
  background-color: #FFFFFF !important;
  border-color: #13B63A !important;
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

.custom-date-picker :deep(.el-input__inner) {
  padding-left: 30px !important;
  padding-right: 15px !important;
}

.query-select :deep(.el-select__caret) { transform: scale(0.85); }

.query-buttons {
  display: flex;
  gap: 10px;
  margin-left: auto;
  white-space: nowrap;
}

.query-buttons .el-button--primary {
  background-color: #13B63A !important;
  border-color: #13B63A !important;
  color: white !important;
  height: 24px !important;
  line-height: 24px !important;
  padding: 0 15px !important;
  font-size: 12px;
}

.query-buttons .el-button {
  height: 24px !important;
  line-height: 24px !important;
  padding: 0 15px !important;
  font-size: 12px;
  background-color: #F2F3F5 !important;
  border-color: transparent !important;
  color: #4E5969 !important;
}

.table-section {
  flex: 1; 
  padding: 0 25px 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;  /* 防止表格区外部滚动 */
  min-height: 0; 
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.add-linkorder-btn {
  background-color: #13B63A !important;
  border-color: #13B63A !important;
  color: white !important;
}

.table-section :deep(.el-table) { flex: 1; }
.table-section :deep(.el-table__body-wrapper) { overflow-y: auto; } /* 仅允许表格内部滚动 */

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.status-dot.danger { background: #ff4d4f; }
.status-dot.warning { background: #FAAD14; }
.status-dot.success { background: #52c41a; }

.btn-delete { color: #ff4d4f !important; }
.btn-edit { color: #ff9c6e !important; }
.btn-detail { color: #13B63A !important; }
.btn-edit-warning { color: #FAAD14 !important; font-weight: normal; }
.btn-confirm-success { color: #13B63A !important; font-weight: normal; }

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.total-text { font-size: 14px; color: #606266; }

/* ★ 抽屉公共样式优化 (去除滚动条) ★ */
:deep(.add-order-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: 12px 24px; /* 减小头部内边距 */
  border-bottom: 1px solid #F2F3F5;
  color: #1D2129;
  font-weight: bold;
  font-size: 16px;
}

:deep(.add-order-drawer .el-drawer__body) { height: 0; }

.drawer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-content {
  flex: 1;
  overflow-y: auto; /* 保留内部自适应 */
  padding: 0px 24px;
}

.drawer-footer {
  padding: 10px 24px;
  border-top: 1px solid #F2F3F5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #fff;
  flex-shrink: 0;
}

.btn-drawer-save { background-color: #F2F3F5 !important; border: none !important; color: #4E5969 !important; }
.btn-drawer-submit { background-color: #13B63A !important; border-color: #13B63A !important; }

.step-indicator { display: flex; align-items: center; justify-content: center; margin-bottom: 15px; flex-shrink: 0; }
.step-item { display: flex; align-items: center; gap: 8px; color: #C9CDD4; }
.step-item.active { color: #1D2129; }
.step-item.active .step-circle { background: #13B63A; color: white; border-color: #13B63A; }
.step-circle { width: 24px; height: 24px; border-radius: 50%; border: 1px solid #C9CDD4; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.step-line { width: 150px; height: 1px; background: #E5E6EB; margin: 0 15px; }

.dialog-action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 14px; color: #1D2129; }
.dialog-title-text { font-size: 14px; color: #1D2129; margin-bottom: 10px; }
.text-danger { color: #F53F3F; }
.text-gray { color: #86909C; }
.text-green { color: #13B63A; }
.dialog-pagination { margin-top: 15px; display: flex; justify-content: flex-end; }
.flex-between { justify-content: space-between; align-items: center; }

/* ★ 表单结构极限压紧防滚动 ★ */
.form-section { margin-bottom: 10px; }
.section-title { font-size: 14px; font-weight: bold; color: #1D2129; margin-bottom: 10px; }
.form-row { margin-bottom: 0px; }
.form-item-vertical { display: flex; flex-direction: column; gap: 4px; }
.form-item-vertical label { font-size: 12px; color: #86909C; }
.full-width { width: 100%; }
.read-only-text { height: 32px; line-height: 32px; background-color: #F7F8FA; padding: 0 10px; border-radius: 4px; color: #1D2129; font-size: 13px; }

.bg-gray-input :deep(.el-input__inner) { background-color: #F7F8FA !important; border: none; color: #86909C; }

.inner-tabs { display: flex; gap: 20px; margin-bottom: 0%; }
.inner-tabs span { padding: 5px 15px; font-size: 14px; color: #86909C; cursor: pointer; border-radius: 15px; }
.inner-tabs span.active { background-color: #E8F7ED; color: #13B63A; }
.tab-pane-content { padding-top: 10px; padding-bottom: 10px; }
.edit-cell { display: flex; align-items: center; gap: 5px; cursor: pointer; }
.edit-cell i { color: #86909C; }

.add-order-drawer :deep(.el-input__inner) { background-color: #fff; border: 1px solid #DCDFE6; }
.add-order-drawer :deep(.el-table th) { background-color: #F7F8FA; padding: 4px 0; }
.add-order-drawer :deep(.el-table td) { padding: 4px 0; }

.empty-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 40px;
}
.empty-content { text-align: center; }

/* ★★★ 危废卡片样式 (精简排版版) ★★★ */
.waste-cards-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding-top: 10px;
}
.waste-card-box {
  width: calc(50% - 7.5px);
  border: 1px solid #E5E6EB;
  border-radius: 4px;
  padding: 10px 16px;
  box-sizing: border-box;
}
.w-card-name {
  font-size: 14px;
  font-weight: bold;
  color: #1D2129;
  margin-bottom: 2px;
}
.w-card-code {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 10px;
}
.w-card-row {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #4E5969;
  margin-bottom: 8px;
}
.w-card-label { color: #86909C; margin-right: 6px; }
.actual-weight-wrap { display: flex; align-items: center; }
.actual-weight-input { width: 70px; margin-left: 6px; }
.actual-weight-input :deep(.el-input__inner) {
  background-color: #F7F8FA;
  border: none;
  padding-right: 25px;
  height: 24px;
  line-height: 24px;
}
.actual-weight-input :deep(.el-input__suffix) {
  display: flex;
  align-items: center;
  color: #86909C;
}
.req-star { color: #F53F3F; margin-right: 2px; }
.w-card-footer { display: flex; justify-content: flex-end; margin-top: 5px; }
.btn-tag-view { background-color: #13B63A !important; border-color: #13B63A !important; color: white !important; padding: 6px 15px !important; }


:deep(.link-tag-dialog) {
  border-radius: 8px;
  margin-top: 6vh !important; 
}
:deep(.link-tag-dialog .el-dialog__header) { padding: 15px 24px; border-bottom: 1px solid #F2F3F5; }
:deep(.link-tag-dialog .el-dialog__title) { font-size: 16px; font-weight: bold; color: #1D2129; }
:deep(.link-tag-dialog .el-dialog__body) { padding: 10px 24px; }
:deep(.link-tag-dialog .el-dialog__footer) { padding: 10px 24px; border-top: 1px solid #F2F3F5; }
:deep(.link-tag-dialog .el-table th), :deep(.link-tag-dialog .el-table td) { padding: 4px 0; }
.link-tag-pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.link-tag-pagination .total-text { font-size: 14px; color: #606266; }
.dialog-footer { display: flex; justify-content: flex-end; }
.btn-confirm { background-color: #13B63A !important; border-color: #13B63A !important; color: white !important; padding: 8px 25px !important; font-size: 13px !important; }

/* 纯展示版标签查看弹窗，极致防超长 */
:deep(.view-tag-dialog) {
  border-radius: 8px;
  margin-top: 5vh !important;
}
:deep(.view-tag-dialog .el-dialog__header) { padding: 15px 24px; border-bottom: 1px solid #F2F3F5; text-align: center; }
:deep(.view-tag-dialog .el-dialog__title) { font-size: 16px; font-weight: bold; color: #1D2129; }
:deep(.view-tag-dialog .el-dialog__body) { padding: 10px 24px 15px; }
:deep(.view-tag-dialog .el-dialog__headerbtn) { top: 15px; right: 20px; }
:deep(.view-tag-dialog .el-table) { border: 1px solid #ebeef5; border-bottom: none; }
:deep(.view-tag-dialog .el-table th) { background-color: #f7f8fa; color: #1D2129; font-weight: normal; }
:deep(.view-tag-dialog .el-table th), :deep(.view-tag-dialog .el-table td) { padding: 4px 0; } /* 极限压实表格 */
.view-tag-pagination-wrap { display: flex; justify-content: center; align-items: center; margin-top: 15px; position: relative; }
.view-tag-pagination-wrap .total-text { font-size: 13px; color: #606266; margin-right: 15px; }

:deep(.link-tag-dialog .el-checkbox__input.is-checked .el-checkbox__inner), :deep(.link-tag-dialog .el-checkbox__input.is-indeterminate .el-checkbox__inner) { background-color: #13B63A; border-color: #13B63A; }
:deep(.el-pagination.is-background .el-pager li:not(.disabled).active) { background-color: #13B63A !important; }

/* ★ 运输信息卡片紧凑排版 ★ */
.transport-card { border: 1px solid #E5E6EB; border-radius: 4px; padding: 10px 16px; margin-bottom: 10px; }
.transport-card-title { font-size: 14px; color: #1D2129; font-weight: 500; margin-bottom: 5px; display: flex; align-items: center; }
.vertical-line { width: 3px; height: 14px; background-color: #13B63A; display: inline-block; margin-right: 8px; }
.transport-detail-section { margin-top: 8px; }
.d-item { display: flex; align-items: flex-start; font-size: 12px; margin-bottom: 4px; }
.d-label { color: #86909C; width: 120px; flex-shrink: 0; }
.d-value { color: #1D2129; flex: 1; word-break: break-all; }
.btn-add-transport { border-color: #13B63A !important; color: #13B63A !important; padding: 8px 20px !important; font-size: 13px; }

/* 运输单位下拉选项定制 */
.transporter-select-popper .popper-group-title { padding: 5px 20px 10px; color: #86909C; font-size: 12px; }
.transporter-select-popper .transporter-option { display: flex; justify-content: space-between; align-items: center; }
.transporter-select-popper .remove-common { color: #F53F3F; font-size: 13px; cursor: pointer; }
.transporter-select-popper .popper-footer { border-top: 1px solid #E5E6EB; padding: 10px 0; text-align: center; color: #13B63A; cursor: pointer; font-size: 13px; margin-top: 5px; }

/* 运输单位搜索弹窗样式 */
:deep(.transporter-dialog) { border-radius: 8px; margin-top: 15vh !important; }
:deep(.transporter-dialog .el-dialog__header) { padding: 15px 20px; border-bottom: 1px solid #E5E6EB; }
:deep(.transporter-dialog .el-dialog__title) { font-size: 15px; font-weight: bold; color: #1D2129; }
:deep(.transporter-dialog .el-dialog__body) { padding: 15px 20px; }
.transporter-search-box { margin-bottom: 15px; }
.transporter-search-box :deep(.el-input__inner) { background-color: #F2F3F5; border: none; border-radius: 4px; }
.transporter-list { list-style: none; padding: 0; margin: 0; max-height: 250px; overflow-y: auto; }
.transporter-list li { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F2F3F5; cursor: pointer; }
.transporter-list li:last-child { border-bottom: none; }
.transporter-list li:hover { background-color: #F7F8FA; }
.transporter-name { color: #1D2129; font-size: 13px; }
.transporter-name i { color: #86909C; margin-right: 8px; }
.btn-set-common { color: #13B63A; font-size: 13px; cursor: pointer; }

/* 状态文本样式 */
.status-text {
  font-size: 13px;
}

.status-text.danger {
  color: #F53F3F;
}

.status-text.success {
  color: #13B63A;
}

/* 操作按钮样式 */
.btn-inbound-success {
  color: #13B63A;
}

/* 更新联单信息按钮样式 */
.btn-update-order {
  background-color: #13B63A !important;
  border-color: #13B63A !important;
  color: white !important;
}

/* 更新联单信息弹窗样式 */
:deep(.update-linkorder-dialog) {
  border-radius: 8px;
  padding: 0;
  overflow: hidden;
  width: 328px !important;
  height: 218px !important;
  margin: 0 auto !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

:deep(.update-linkorder-dialog .el-dialog__header) {
  display: none;
}

.update-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #F2F3F5;
  height: 44px;
  flex-shrink: 0;
}

.update-dialog-title {
  font-size: 16px;
  font-weight: 500;
  color: #1D2129;
  text-align: center;
  flex: 1;
}

.update-dialog-close {
  font-size: 20px;
  color: #86909C;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.update-dialog-close:hover {
  color: #1D2129;
}

.update-dialog-content {
  padding: 16px;
  height: calc(218px - 44px - 76px); /* 总高度 - 标题栏 - 按钮区域 */
  display: flex;
  flex-direction: column;
}

.update-dialog-content :deep(.el-input__inner) {
  background-color: #F2F3F5;
  border: 1px solid transparent;
  border-radius: 4px;
  height: 32px;
  font-size: 14px;
}

.update-dialog-content :deep(.el-input__inner:focus) {
  background-color: #FFFFFF;
  border-color: #13B63A;
}

.update-dialog-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  align-items: center;
}

/* 精准更新按钮 - 绿色背景白色字体 */
.btn-update-precision {
  width: 88px !important;
  height: 32px !important;
  padding: 0 !important;
  font-size: 13px;
  background: var(--theme-color, #13B63A) !important;
  background-color: #13B63A !important;
  border-color: #13B63A !important;
  color: #FFFFFF !important;
  border-radius: 4px;
}

.btn-update-precision:hover {
  background-color: #10a332 !important;
  border-color: #10a332 !important;
  color: #FFFFFF !important;
}

/* 扫码更新按钮 - 透明无边框绿色字体 */
.btn-update-scan {
  width: 88px !important;
  height: 32px !important;
  padding: 0 !important;
  font-size: 13px;
  background: transparent !important;
  border: none !important;
  color: var(--theme-color, #13B63A) !important;
  color: #13B63A !important;
  border-radius: 4px;
}

.btn-update-scan:hover {
  background: rgba(19, 182, 58, 0.1) !important;
  color: #13B63A !important;
}

/* 移除扫码按钮的默认边框和阴影 */
.btn-update-scan:focus,
.btn-update-scan:active {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}
</style>