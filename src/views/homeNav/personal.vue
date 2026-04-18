<template>
  <div class="personal-center">
    <div class="personal-content">
      <div class="user-info-header">
        <div class="user-avatar">
          <div v-if="!avatar" class="avatar-icon">👤</div>
          <img v-else :src="avatar" alt="头像" class="avatar-img">
        </div>
        
        <!-- 第二部分：用户名和工号 -->
        <div class="user-details">
          <div class="user-name">
            <span>用户名：</span>
            <span>{{ userName }}</span>
          </div>
          <div class="user-job">
            <span>工号：</span>
            <span>{{ userCode }}</span>
          </div>
        </div>
        
        <!-- 第三部分：企业认证和全国系统授权信息 -->
        <div class="auth-info">
          <div class="system-authorization">
          <span>全国系统授权信息：</span>
          <span class="fill-status">
            {{ authorizationInfo || '未填写' }}
          </span>
          <button class="auth-btn" @click="handleAuthEdit">
            {{ authorizationInfo ? '修改' : '填写' }}
          </button>
        </div>
        
        <!-- 全国系统授权信息弹窗 -->
        <div v-if="showAuthDialog" class="auth-dialog-overlay">
          <div class="auth-dialog">
            <div class="auth-dialog-header">
              <h3>全国系统授权信息填写</h3>
              <button class="auth-dialog-close" @click="handleAuthCancel">&times;</button>
            </div>
            <div class="auth-dialog-body">
              <input 
                type="text" 
                v-model="authDialogValue"
                placeholder="请输入"
                class="auth-dialog-input"
              />
            </div>
            <div class="auth-dialog-footer">
              <button
                type="button"
                class="auth-dialog-confirm"
                :disabled="isSubmitting"
                @click="handleAuthConfirm"
              >
                确定
              </button>
            </div>
          </div>
        </div>
        
        <!-- 企业认证弹窗 -->
        <div v-if="showCertifyDialog" class="certify-dialog-overlay">
          <div class="certify-dialog">
            <div class="certify-dialog-header">
              <h3>企业认证</h3>
              <button class="certify-dialog-close" @click="handleCertifyCancel">&times;</button>
            </div>
            <div class="certify-dialog-body">
              <div class="certify-form-item">
                <label>企业名称</label>
                <input 
                  type="text" 
                  v-model="certifyForm.companyName"
                  placeholder="请输入企业名称"
                  class="certify-dialog-input"
                />
              </div>
              <div class="certify-form-item">
                <label>统一社会信用代码</label>
                <input 
                  type="text" 
                  v-model="certifyForm.socialCreditCode"
                  placeholder="请输入统一社会信用代码"
                  class="certify-dialog-input"
                />
              </div>
              <div class="certify-form-item">
                <label>法定代表人</label>
                <input 
                  type="text" 
                  v-model="certifyForm.legalRepresentative"
                  placeholder="请输入法定代表人"
                  class="certify-dialog-input"
                />
              </div>
            </div>
            <div class="certify-dialog-footer">
              <button class="certify-dialog-confirm" @click="handleCertifyConfirm">确定</button>
            </div>
          </div>
        </div>
        
        <!-- 修改确认弹窗 -->
        <div v-if="showModifyDialog" class="edit-dialog-overlay">
          <div class="edit-dialog">
            <div class="edit-dialog-header">
              <h3>{{ modifyType === 'password' ? '修改登录密码' : '修改注册手机' }}</h3>
              <button class="edit-dialog-close" @click="handleModifyCancel">&times;</button>
            </div>
            <div class="edit-dialog-body">
              <!-- 密码修改表单 -->
              <div v-if="modifyType === 'password'">
                <div class="form-item">
                  <label>新密码</label>
                  <input 
                    type="password" 
                    v-model="loginPassword"
                    placeholder="请输入新密码"
                    class="edit-input"
                  />
                </div>
                <div class="form-item">
                  <label>确认密码</label>
                  <input 
                    type="password" 
                    v-model="confirmPassword"
                    placeholder="请确认新密码"
                    class="edit-input"
                  />
                </div>
              </div>
              <!-- 手机修改表单 -->
              <div v-else-if="modifyType === 'phone'">
                <div class="form-item">
                  <label>新手机号</label>
                  <input 
                    type="text" 
                    v-model="registeredPhone"
                    placeholder="请输入新手机号"
                    class="edit-input"
                  />
                </div>
              </div>
            </div>
            <div class="edit-dialog-footer">
              <button class="edit-dialog-cancel" @click="handleModifyCancel">取消</button>
              <button class="edit-dialog-confirm" @click="handleModifyConfirm">确定</button>
            </div>
          </div>
        </div>
        
        <!-- 添加经办人弹窗 -->
        <div v-if="showAddAgentDialog" class="add-agent-dialog-overlay">
          <div class="add-agent-dialog">
            <div class="add-agent-dialog-header">
              <h3>添加经办人</h3>
              <button class="add-agent-dialog-close" @click="handleAddAgentCancel">&times;</button>
            </div>
            <div class="add-agent-dialog-body">
              <div class="form-item">
                <label>姓名</label>
                <input 
                  type="text" 
                  v-model="newAgent.operatorName"
                  placeholder="请输入"
                  class="add-agent-input"
                />
              </div>
              <div class="form-item">
                <label>经办人类型</label>
                <select 
                  v-model="newAgent.operatorType"
                  class="add-agent-select"
                >
                  <option value="">请选择</option>
                  <option v-for="type in agentTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
              </div>
            </div>
            <div class="add-agent-dialog-footer">
              <button class="add-agent-dialog-save" @click="handleAddAgentSave">保存</button>
            </div>
          </div>
        </div>
        
        <!-- 删除确认弹窗 -->
        <div v-if="showDeleteDialog" class="delete-dialog-overlay">
          <div class="delete-dialog">
            <div class="delete-dialog-header">
              <div class="delete-warning-icon">!</div>
              <h3>温馨提示</h3>
            </div>
            <div class="delete-dialog-body">
              <p>是否确定删除？</p>
            </div>
            <div class="delete-dialog-footer">
              <button class="delete-dialog-cancel" @click="handleDeleteCancel">取消</button>
              <button class="delete-dialog-confirm" @click="handleDeleteConfirm">确定</button>
            </div>
          </div>
        </div>
        
        <!-- 添加物联网设备弹窗 -->
        <div v-if="showAddIotDialog" class="add-iot-dialog-overlay">
          <div class="add-iot-dialog">
            <div class="add-iot-dialog-header">
              <h3>添加物联网设备</h3>
              <button class="add-iot-dialog-close" @click="handleAddIotCancel">&times;</button>
            </div>
            <div class="add-iot-dialog-body">
              <div class="form-item">
                <label>统一设备编号</label>
                <input 
                  type="text" 
                  v-model="newIotDevice.code"
                  placeholder="请输入"
                  class="add-iot-input"
                />
              </div>
              <div class="form-item">
                <label>物联网设备类型</label>
                <select 
                  v-model="newIotDevice.type"
                  class="add-iot-input"
                >
                  <option value="">请选择</option>
                  <option v-for="type in iotDeviceTypes" :key="type" :value="type">
                    {{ type }}
                  </option>
                </select>
              </div>
              <div class="form-item">
                <label>状态</label>
                <div class="status-switch">
                  <label class="switch">
                    <input type="checkbox" v-model="newIotDevice.enabled">
                    <span class="switch-slider"></span>
                  </label>
                  <span>{{ newIotDevice.enabled ? '开启' : '关闭' }}</span>
                </div>
              </div>
            </div>
            <div class="add-iot-dialog-footer">
              <button class="add-iot-dialog-save" @click="handleAddIotSave">保存</button>
            </div>
          </div>
        </div>
        
        <!-- 修改弹窗 -->
        <div v-if="showEditDialog" class="edit-dialog-overlay">
          <div class="edit-dialog">
            <div class="edit-dialog-header">
              <h3>{{ editType === 'agent' ? '修改经办人' : '修改物联网设备' }}</h3>
              <button class="edit-dialog-close" @click="handleEditCancel">&times;</button>
            </div>
            <div class="edit-dialog-body">
              <!-- 经办人修改表单 -->
              <div v-if="editType === 'agent'">
                <div class="form-item">
                  <label>姓名</label>
                  <input 
                    type="text" 
                    v-model="editItem.operatorName"
                    placeholder="请输入"
                    class="edit-input"
                  />
                </div>
                <div class="form-item">
                  <label>经办人类型</label>
                  <select 
                    v-model="editItem.operatorType"
                    class="edit-input"
                  >
                    <option value="">请选择</option>
                    <option v-for="type in agentTypes" :key="type.value" :value="type.value">
                      {{ type.label }}
                    </option>
                  </select>
                </div>
              </div>
              <!-- 物联网设备修改表单 -->
              <div v-else-if="editType === 'iot'">
                <div class="form-item">
                  <label>物联网设备类型</label>
                  <input 
                    type="text" 
                    v-model="editItem.type"
                    placeholder="请输入"
                    class="edit-input"
                  />
                </div>
                <div class="form-item">
                  <label>统一设备编号</label>
                  <select 
                    v-model="editItem.code"
                    class="edit-input"
                  >
                    <option value="">请选择</option>
                    <option v-for="type in iotDeviceTypes" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                </div>
                <div class="form-item">
                  <label>状态</label>
                  <div class="status-switch">
                    <label class="switch">
                      <input type="checkbox" v-model="editItem.enabled">
                      <span class="switch-slider"></span>
                    </label>
                    <span>{{ editItem.enabled ? '开启' : '关闭' }}</span>   
                  </div>
                </div>
              </div>
            </div>
            <div class="edit-dialog-footer">
              <button class="edit-dialog-cancel" @click="handleEditCancel">取消</button>
              <button class="edit-dialog-confirm" @click="handleEditConfirm">确定</button>
            </div>
          </div>
        </div>
          <div class="user-company">
            <span>企业认证：</span>
            <span v-if="isCertified" class="company-name">{{ companyName }}</span>
            <span :class="isCertified ? 'verified' : 'not-verified'">
              {{ isCertified ? '已认证' : '未认证' }}
            </span>
            <button v-if="!isCertified" class="auth-btn" @click="handleCertifyEdit">
              认证
            </button>
          </div>
        </div>
      </div>
      
      <!-- 标签页导航和内容容器 -->
      <div v-if="isInfoComplete" class="tab-container">
        <!-- 标签页导航 -->
        <div class="tab-navigation">
          <div class="tab-item" :class="{ active: currentTab === 'basic' }" @click="handleTabClick('basic')">基本信息</div>
          <div class="tab-item" :class="{ active: currentTab === 'unit' }" @click="handleTabClick('unit')">单位信息</div>
          <div class="tab-item" :class="{ active: currentTab === 'business' }" @click="handleTabClick('business')">业务信息</div>
          <div class="tab-item" :class="{ active: currentTab === 'agent' }" @click="handleTabClick('agent')">经办人管理</div>
          <div class="tab-item" :class="{ active: currentTab === 'iot' }" @click="handleTabClick('iot')">物联网设备管理</div>
        </div>
        
        <!-- 分隔线 -->
        <div class="divider"></div>
        
        <!-- 标签页内容 -->
        <div class="tab-content">
        <!-- 基本信息 -->
        <div v-if="currentTab === 'basic'">
          <div class="info-item">
            <label>登录密码：</label>
            <span>{{ loginPassword ? '已设置，密码至少6位字符，支持数字、字母和除空格外的特殊字符，且必须同时包含数字和大小写字母。' : '未设置' }}</span>
            <button class="modify-btn" @click="handleModifyClick('password')">修改</button>
          </div>
          <div class="info-item">
            <label>注册手机：</label>
            <span>{{ registeredPhone ? registeredPhone : '191****9640' }}</span>
            <button class="modify-btn" @click="handleModifyClick('phone')">修改</button>
          </div>
        </div>
        
        <!-- 单位信息 -->
        <div v-else-if="currentTab === 'unit'">
          <h3 class="section-title">主体信息</h3>
          <div class="info-columns">
            <!-- 左列 -->
            <div class="info-column">
              <div class="info-item">
                <label>企业名称：</label>
                <span>{{ companyName }}</span>
              </div>
              <div class="info-item">
                <label>法定代表人：</label>
                <span>{{ legalRepresentative || '未获取' }}</span>
              </div>
              <div class="info-item">
                <label>经营状态：</label>
                <span><span class="status-enabled">{{ businessStatus || '启用' }}</span></span>
              </div>
              <div class="info-item">
                <label>所属行业：</label>
                <span>{{ industry || '未获取' }}</span>
              </div>
              <div class="info-item">
                <label>注册地址：</label>
                <span>{{ registeredAddress || '未获取' }}</span>
              </div>
            </div>
            <!-- 右列 -->
            <div class="info-column">
              <div class="info-item">
                <label>统一社会信用代码：</label>
                <span>{{ unifiedSocialCreditCode || '未获取' }}</span>
              </div>
              <div class="info-item">
                <label>企业类型：</label>
                <span>{{ companyType || '产生单位' }}</span>
              </div>
              <div class="info-item">
                <label>行政区划：</label>
                <span>{{ administrativeDivision || '未获取' }}</span>
              </div>
              <div class="info-item">
                <label>企业联系人：</label>
                <span>{{ companyContact || '未获取' }}</span>
              </div>
              <div class="info-item">
                <label>企业电话：</label>
                <span>{{ companyPhone || '未获取' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 业务信息 -->
        <div v-else-if="currentTab === 'business'">
          <!-- 危废信息查询导航栏 -->
          <div class="business-nav">
            <div 
              class="business-nav-item" 
              :class="{ active: currentBusinessNav === 'waste-info' }"
              @click="handleBusinessNavClick('waste-info')"
            >
              危废信息查询
            </div>
            <div 
              class="business-nav-item" 
              :class="{ active: currentBusinessNav === 'storage' }"
              @click="handleBusinessNavClick('storage')"
            >
              贮存设施
            </div>
            <div 
              class="business-nav-item" 
              :class="{ active: currentBusinessNav === 'plan-produce' }"
              @click="handleBusinessNavClick('plan-produce')"
            >
              管理计划产生信息
            </div>
            <div 
              class="business-nav-item" 
              :class="{ active: currentBusinessNav === 'plan-dispose' }"
              @click="handleBusinessNavClick('plan-dispose')"
            >
              管理计划自行利用处置情况
            </div>
            <div 
              class="business-nav-item" 
              :class="{ active: currentBusinessNav === 'business-facility' }"
              @click="handleBusinessNavClick('business-facility')"
            >
              经营单位利用处置设施信息
            </div>
          </div>
          
          <!-- 危废信息列表 -->
          <div v-if="currentBusinessNav === 'waste-info'">
            <div class="waste-info-table">
              <table>
                <thead>
                  <tr>
                    <th>产废编号</th>
                    <th>危废名称</th>
                    <th>危废类别</th>
                    <th>危废代码</th>
                    <th>危废形态</th>
                    <th>主要成分</th>
                    <th>危险特性</th>
                    <th>容器类型</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in getCurrentPageData(wasteInfoData)" :key="item.id">
                    <td>{{ item.cfxxtybh }}</td>
                    <td>{{ item.fwmc }}</td>
                    <td>{{ item.fwlx }}</td>
                    <td>{{ item.fwdm }}</td>
                    <td>{{ item.fwxt }}</td>
                    <td>{{ item.zycf }}</td>
                    <td>{{ item.wxtx }}</td>
                    <td>{{ item.rqlx }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 分页 -->
            <div class="pagination">
              <span>共{{ getTotalItems() }}条</span>
              <div class="page-numbers">
                <button 
                  v-for="page in Math.min(5, getTotalPages())" 
                  :key="page"
                  class="page-btn"
                  :class="{ active: currentPage === page }"
                  @click="handlePageClick(page)"
                >
                  {{ page }}
                </button>
                <span v-if="getTotalPages() > 5">...</span>
                <button 
                  v-if="getTotalPages() > 5"
                  class="page-btn"
                  :class="{ active: currentPage === getTotalPages() }"
                  @click="handlePageClick(getTotalPages())"
                >
                  {{ getTotalPages() }}
                </button>
              </div>
              <div class="go-to-page">
                <input 
                  type="text" 
                  v-model="goToPage"
                  placeholder="页码"
                  class="go-to-input"
                />
                <button class="page-btn" @click="handleGoToPage">前往</button>
              </div>
            </div>
          </div>
          
          <!-- 贮存设施 -->
          <div v-else-if="currentBusinessNav === 'storage'" class="business-content">
            <div class="waste-info-table">
              <table>
                <thead>
                  <tr>
                    <th>贮存设施编号</th>
                    <th>设施名称</th>
                    <th>设施编码</th>
                    <th>设施类型</th>
                    <th>负责人</th>
                    <th>联系电话</th>
                    <th>设施大小</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in getCurrentPageData(storageData)" :key="item.id">
                    <td>{{ item.zcsstybh }}</td>
                    <td>{{ item.ssmc }}</td>
                    <td>{{ item.ssbm }}</td>
                    <td>{{ item.sslx }}</td>
                    <td>{{ item.fzr }}</td>
                    <td>{{ item.lxdh }}</td>
                    <td>{{ item.ssdx }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 分页 -->
            <div class="pagination">
              <span>共{{ getTotalItems() }}条</span>
              <div class="page-numbers">
                <button 
                  v-for="page in Math.min(5, getTotalPages())" 
                  :key="page"
                  class="page-btn"
                  :class="{ active: currentPage === page }"
                  @click="handlePageClick(page)"
                >
                  {{ page }}
                </button>
                <span v-if="getTotalPages() > 5">...</span>
                <button 
                  v-if="getTotalPages() > 5"
                  class="page-btn"
                  :class="{ active: currentPage === getTotalPages() }"
                  @click="handlePageClick(getTotalPages())"
                >
                  {{ getTotalPages() }}
                </button>
              </div>
              <div class="go-to-page">
                <input 
                  type="text" 
                  v-model="goToPage"
                  placeholder="页码"
                  class="go-to-input"
                />
                <button class="page-btn" @click="handleGoToPage">前往</button>
              </div>
            </div>
          </div>
          
          <!-- 管理计划产生信息 -->
          <div v-else-if="currentBusinessNav === 'plan-produce'" class="business-content">
            <div class="waste-info-table">
              <table>
                <thead>
                  <tr>
                    <th>产废设施编号</th>
                    <th>设施名称</th>
                    <th>设施编码</th>
                    <th>产废编号</th>
                    <th>危废名称</th>
                    <th>危废代码</th>
                    <th>预计产生量</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in getCurrentPageData(planProduceData)" :key="item.id">
                    <td>{{ item.cfsstybh }}</td>
                    <td>{{ item.ssmc }}</td>
                    <td>{{ item.ssbm }}</td>
                    <td>{{ item.cfxxtybh }}</td>
                    <td>{{ item.fwmc }}</td>
                    <td>{{ item.fwdm }}</td>
                    <td>{{ item.yjcsl }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 分页 -->
            <div class="pagination">
              <span>共{{ getTotalItems() }}条</span>
              <div class="page-numbers">
                <button 
                  v-for="page in Math.min(5, getTotalPages())" 
                  :key="page"
                  class="page-btn"
                  :class="{ active: currentPage === page }"
                  @click="handlePageClick(page)"
                >
                  {{ page }}
                </button>
                <span v-if="getTotalPages() > 5">...</span>
                <button 
                  v-if="getTotalPages() > 5"
                  class="page-btn"
                  :class="{ active: currentPage === getTotalPages() }"
                  @click="handlePageClick(getTotalPages())"
                >
                  {{ getTotalPages() }}
                </button>
              </div>
              <div class="go-to-page">
                <input 
                  type="text" 
                  v-model="goToPage"
                  placeholder="页码"
                  class="go-to-input"
                />
                <button class="page-btn" @click="handleGoToPage">前往</button>
              </div>
            </div>
          </div>
          
          <!-- 管理计划自行利用处置情况 -->
          <div v-else-if="currentBusinessNav === 'plan-dispose'" class="business-content">
            <div class="waste-info-table">
              <table>
                <thead>
                  <tr>
                    <th>自行利用处置设施编号</th>
                    <th>设施名称</th>
                    <th>设施编码</th>
                    <th>产废编号</th>
                    <th>危废名称</th>
                    <th>危废代码</th>
                    <th>利用处置方式</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in getCurrentPageData(planDisposeData)" :key="item.id">
                    <td>{{ item.zxlyczsstybh }}</td>
                    <td>{{ item.ssmc }}</td>
                    <td>{{ item.ssbm }}</td>
                    <td>{{ item.cfxxtybh }}</td>
                    <td>{{ item.fwmc }}</td>
                    <td>{{ item.fwdm }}</td>
                    <td>{{ item.lyczfsValue }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 分页 -->
            <div class="pagination">
              <span>共{{ getTotalItems() }}条</span>
              <div class="page-numbers">
                <button 
                  v-for="page in Math.min(5, getTotalPages())" 
                  :key="page"
                  class="page-btn"
                  :class="{ active: currentPage === page }"
                  @click="handlePageClick(page)"
                >
                  {{ page }}
                </button>
                <span v-if="getTotalPages() > 5">...</span>
                <button 
                  v-if="getTotalPages() > 5"
                  class="page-btn"
                  :class="{ active: currentPage === getTotalPages() }"
                  @click="handlePageClick(getTotalPages())"
                >
                  {{ getTotalPages() }}
                </button>
              </div>
              <div class="go-to-page">
                <input 
                  type="text" 
                  v-model="goToPage"
                  placeholder="页码"
                  class="go-to-input"
                />
                <button class="page-btn" @click="handleGoToPage">前往</button>
              </div>
            </div>
          </div>
          
          <!-- 经营单位利用处置设施信息 -->
          <div v-else-if="currentBusinessNav === 'business-facility'" class="business-content">
            <div class="waste-info-table">
              <table>
                <thead>
                  <tr>
                    <th>利用处置设施统一编号</th>
                    <th>设施名称</th>
                    <th>设施编码</th>
                    <th>设施状态</th>
                    <th>利用处置方式</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in getCurrentPageData(businessFacilityData)" :key="item.id">
                    <td>{{ item.zxlyczsstybh }}</td>
                    <td>{{ item.ssmc }}</td>
                    <td>{{ item.ssbm }}</td>
                    <td><span :class="['status-dot', item.sszt === 1 ? 'enabled' : 'disabled']"></span>{{ item.sszt === 1 ? '启用' : '禁用' }}</td>
                    <td>{{ item.lyczfsValue }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 分页 -->
            <div class="pagination">
              <span>共{{ getTotalItems() }}条</span>
              <div class="page-numbers">
                <button 
                  v-for="page in Math.min(5, getTotalPages())" 
                  :key="page"
                  class="page-btn"
                  :class="{ active: currentPage === page }"
                  @click="handlePageClick(page)"
                >
                  {{ page }}
                </button>
                <span v-if="getTotalPages() > 5">...</span>
                <button 
                  v-if="getTotalPages() > 5"
                  class="page-btn"
                  :class="{ active: currentPage === getTotalPages() }"
                  @click="handlePageClick(getTotalPages())"
                >
                  {{ getTotalPages() }}
                </button>
              </div>
              <div class="go-to-page">
                <input 
                  type="text" 
                  v-model="goToPage"
                  placeholder="页码"
                  class="go-to-input"
                />
                <button class="page-btn" @click="handleGoToPage">前往</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 经办人管理 -->
        <div v-else-if="currentTab === 'agent'">
          <button class="add-agent-btn" @click="handleAddAgentClick">添加经办人</button>
          <div class="agent-table-container">
            <table class="agent-table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>经办人类型</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in agentData" :key="item.id">
                  <td>{{ item.operatorName }}</td>
                  <td>{{ item.operatorTypeValue }}</td>
                  <td class="agent-actions">
                    <button class="delete-btn" @click="handleDeleteClick(item.id)">删除</button>
                    <button class="edit-btn" @click="handleEditClick('agent', item)">修改</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 物联网设备管理 -->
        <div v-else-if="currentTab === 'iot'">
          <button class="add-iot-btn" @click="handleAddIotClick">添加物联网设备</button>
          <div class="iot-table-container">
            <table class="iot-table">
              <thead>
                <tr>
                  <th>物联网设备类型</th>
                  <th>统一设备编号</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in iotData" :key="item.id">
                  <td>{{ item.type }}</td>
                  <td>{{ item.facilityNo || '-' }}</td>
                  <td class="iot-actions">
                    <button class="delete-btn" @click="handleIotDeleteClick(item.id)">删除</button>
                    <button class="edit-btn" @click="handleEditClick('iot', item)">修改</button>
                    <label class="switch">
                      <input type="checkbox" v-model="item.enabled">
                      <span class="switch-slider"></span>
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
      </div>
</template>

<script>
import { 
  myApi, 
  settingApi
} from '@/api/index'
import StorageUtil from '@/utils/storage'
import { Message } from 'element-ui'

export default {
  name: 'PersonalCenter',
  data() {
    return {
      currentTab: 'basic', // basic, unit, business, agent, iot
      authorizationInfo: '', // 全国系统授权信息文本
      tokenId: null, // 存储 token 的主键 ID，用于更新判断
      officeId: '',
      showAuthDialog: false,
      authDialogValue: '',
      isSubmitting: false, // 防重复提交状态
      
      companyName: '',
      isCertified: false,
      showCertifyDialog: false,
      certifyForm: {
        companyName: '',
        socialCreditCode: '',
        legalRepresentative: ''
      },
      
      currentBusinessNav: 'waste-info',
      currentPage: 1,
      pageSize: 11,
      totalCount: 0, // 新增：保存当前列表的总条数
      goToPage: '',
      
      // 用户信息
      userName: '',
      userCode: '',
      loginPassword: '',
      registeredPhone: '',
      confirmPassword: '',
      avatar: '',
      
      // 单位信息
      companyName: '',
      legalRepresentative: '',
      businessStatus: '',
      industry: '',
      registeredAddress: '',
      unifiedSocialCreditCode: '',
      companyType: '',
      administrativeDivision: '',
      companyContact: '',
      companyPhone: '',
      
      // 列表数据
      agentData: [], // 经办人列表
      iotData: [], // 物联网设备列表
      wasteInfoData: [],
      storageData: [],
      planProduceData: [],
      planDisposeData: [],
      businessFacilityData: [],

      // 弹窗控制
      showModifyDialog: false,
      modifyType: '',
      showAddAgentDialog: false,
      newAgent: { operatorName: '', operatorType: '' },
      agentTypes: [
        { value: 'ATTEND', label: '出库部门经办人' },
        { value: 'TRANSPORT', label: '运送部门经办人' },
        { value: 'STORAGE', label: '贮存部门经办人' },
        { value: 'DISPOSAL', label: '利用/处置部门经办人' },
        { value: 'PRODUCE', label: '产生部门经办人' }
      ],
      
      showDeleteDialog: false,
      pendingDeleteId: null, 
      
      showAddIotDialog: false,
      newIotDevice: { code: '', type: '', enabled: false },
      iotDeviceTypes: ['扫码设备', '智能终端', '智能称重设备', '智能标识设备'],
      
      showEditDialog: false,
      editType: '',
      editItem: null
    }
  },
  mounted() {
    this.initData()
  },
  computed: {
    isInfoComplete() {
      return this.authorizationInfo
    }
  },
  methods: {
    pickFirstNonEmpty(...values) {
      for (const value of values) {
        if (value === null || value === undefined) continue
        const text = String(value).trim()
        if (text.length > 0) return text
      }
      return ''
    },

    /** tokenPage 列表里全国系统授权串可能出现的字段名 */
    pickNationalTokenFromRecord(info) {
      if (!info || typeof info !== 'object') {
        return ''
      }
      const result = this.pickFirstNonEmpty(
        info.token,
        info.accessToken,
        info.nationalToken,
        info.sysToken,
        info.authToken,
        info.tokenValue,
        info.tokenStr,
        info.value
      )
      return result
    },

    /** 兼容不同分页返回结构 */
    extractTokenPageRecords(res) {
      const d = res?.result || res?.data
      if (!d) {
        return []
      }
      if (Array.isArray(d.records)) {
        return d.records
      }
      if (Array.isArray(d.list)) {
        return d.list
      }
      if (Array.isArray(d.rows)) {
        return d.rows
      }
      if (Array.isArray(d.content)) {
        return d.content
      }
      if (Array.isArray(d.data)) {
        return d.data
      }
      return []
    },
    // === 分页补充方法 开始 ===
    getTotalItems() {
      return this.totalCount || 0;
    },
    getTotalPages() {
      return Math.ceil(this.totalCount / this.pageSize) || 1;
    },
    getCurrentPageData(dataArray) {
      // 当前页数据已经由后端分页，直接返回即可
      return dataArray; 
    },
    handleGoToPage() {
      const page = parseInt(this.goToPage);
      if (!isNaN(page) && page > 0 && page <= this.getTotalPages()) {
        this.handlePageClick(page);
        this.goToPage = ''; // 前往后清空输入框
      } else {
        Message.warning('请输入有效的页码');
      }
    },
    // === 分页补充方法 结束 ===

    // 初始化页面数据（先同步单位 officeId，再查 tokenPage，避免 id 条件错误导致一直「未填写」）
    async initData() {
      this.loadUserProfile()
      await this.getOfficeStatus()
      await this.getAuthTokenStatus()
      this.refreshList()
    },

    loadUserProfile() {
      let user = null
      try {
        const userRaw = StorageUtil.getItemSync('user')
        user = userRaw ? JSON.parse(userRaw) : null
      } catch (e) {
        user = null
      }
      const token = StorageUtil.getItemSync('token') || window.tokenCache || ''
      const jwt = this.parseJwtPayload(token)
      const userData = user?.data || {}
      const userInfo = user?.userInfo || user?.user || {}

      this.userName = this.pickFirstNonEmpty(
        user?.userName,
        userData?.userName,
        userInfo?.userName,
        user?.username,
        userData?.username,
        userInfo?.username,
        user?.account,
        userData?.account,
        userInfo?.account,
        user?.loginName,
        userData?.loginName,
        userInfo?.loginName,
        jwt?.userName,
        jwt?.username,
        jwt?.account,
        jwt?.preferred_username,
        jwt?.sub,
        user?.createdName,
        userData?.createdName,
        userInfo?.createdName,
        user?.name
      ) || '未获取到用户名'

      this.userCode = this.pickFirstNonEmpty(
        user?.mobileNo,
        userData?.mobileNo,
        userInfo?.mobileNo,
        jwt?.mobileNo,
        user?.updatedBy,
        userData?.updatedBy,
        userInfo?.updatedBy,
        user?.jobNo,
        userData?.jobNo,
        userInfo?.jobNo,
        user?.workNo,
        userData?.workNo,
        userInfo?.workNo
      ) || '未获取到工号'

      this.officeId = this.pickFirstNonEmpty(
        user?.officeId,
        userData?.officeId,
        userInfo?.officeId,
        user?.officeCode,
        userData?.officeCode,
        userInfo?.officeCode,
        jwt?.officeId,
        jwt?.officeCode,
        jwt?.orgId
      ) || ''

      // 全国系统授权信息：仅展示 /sys/token/page 返回的业务 token（与登录鉴权 JWT 不是同一种）
      this.authorizationInfo = ''

      this.loginPassword = user?.password || userData?.password || userInfo?.password || '已设置'

      // 设置注册手机号
      this.registeredPhone = this.pickFirstNonEmpty(
        user?.phone,
        userData?.phone,
        userInfo?.phone,
        user?.mobile,
        userData?.mobile,
        userInfo?.mobile,
        user?.mobilePhone,
        userData?.mobilePhone,
        userInfo?.mobilePhone,
        user?.phoneNumber,
        userData?.phoneNumber,
        userInfo?.phoneNumber,
        jwt?.phone,
        jwt?.mobile,
        jwt?.mobile_phone,
        jwt?.mobileNo
      ) || ''
    },

    // 1. 获取全国系统授权信息状态（数据来自 /sys/token/page 的列表项）
    getAuthTokenStatus() {
      let user = null
      try {
        const userRaw = StorageUtil.getItemSync('user')
        user = userRaw ? JSON.parse(userRaw) : null
      } catch (e) {
        user = null
      }
      const loginToken = StorageUtil.getItemSync('token') || window.tokenCache || ''
      const jwt = this.parseJwtPayload(loginToken)
      const userData = user?.data || {}
      const userInfo = user?.userInfo || user?.user || {}

      const loginOfficeId = this.pickFirstNonEmpty(
        this.officeId,
        user?.officeId,
        userData?.officeId,
        userInfo?.officeId,
        user?.officeCode,
        userData?.officeCode,
        userInfo?.officeCode,
        user?.office?.id,
        userData?.office?.id,
        userInfo?.office?.id,
        jwt?.officeId,
        jwt?.officeCode,
        jwt?.orgId
      )
      if (loginOfficeId) {
        this.officeId = loginOfficeId
      }

      const applyTokenInfo = (info, fallbackRes) => {
        if (info) {
          // 根据page里的token字段判断是否已填写
          const tokenValue = this.pickNationalTokenFromRecord(info)
          this.authorizationInfo = tokenValue ? '已填写' : ''
          this.tokenId = info.id != null ? info.id : null
          if (!this.userName || this.userName === '未获取到用户名') {
            this.userName = this.pickFirstNonEmpty(
              info.createdName,
              info.userName,
              info.name,
              info.realName,
              info.account,
              info.username,
              info.userAccount,
              this.userName
            )
          }
          if (!this.userCode || this.userCode === '未获取到工号') {
            this.userCode = this.pickFirstNonEmpty(
              info.updatedBy,
              info.jobNo,
              info.workNo,
              info.employeeNo,
              info.employeeId,
              info.staffNo,
              info.staffId,
              info.userNo,
              this.userCode
            )
          }
          return
        }
        // 没有记录时认为未填写
        this.authorizationInfo = ''
        this.tokenId = null
      }

      const buildOfficeQuery = (base) => {
        const q = { page: 1, size: 50, ...base }
        if (loginOfficeId) {
          q.id = loginOfficeId
          q.officeId = loginOfficeId
        }
        return q
      }

      const findRecordForOffice = (records) => {
        if (!records.length) {
          return null
        }
        if (!loginOfficeId) {
          return records.find(r => this.pickNationalTokenFromRecord(r)) || records[0]
        }
        const oid = String(loginOfficeId)
        const byOffice = records.find(r =>
          String(r?.id ?? '') === oid ||
          String(r?.officeId ?? '') === oid
        )
        if (byOffice) {
          return byOffice
        }
        // 如果没有按officeId匹配到记录，尝试返回第一条有token的记录
        const recordWithToken = records.find(r => this.pickNationalTokenFromRecord(r))
        if (recordWithToken) {
          return recordWithToken
        }
        // 如果都没有，返回第一条记录      
        return records[0]
      }

      return myApi.tokenPage(buildOfficeQuery({})).then(async res => {
        let records = this.extractTokenPageRecords(res)
        let matched = findRecordForOffice(records)
        if (matched) {
          applyTokenInfo(matched, res)
          return
        }

        const allRes = await myApi.tokenPage({ page: 1, size: 100 })
        records = this.extractTokenPageRecords(allRes)
        matched = findRecordForOffice(records)
        applyTokenInfo(matched, allRes)
      }).catch(err => console.error('获取授权信息失败', err))
    },

    // 2. 获取企业认证状态
    getOfficeStatus() {
      return myApi.syncData().then(res => {
        // 检查响应是否成功
        if (res.success === false || res.code === '0002') {
          console.error('同步单位信息失败', res)
          Message.error(res.message || '同步信息失败，请重试')
          return
        }
        
        const data = res.data || res.result
        if (data) {
          const newOfficeId = data.officeId || data.id || data.office?.id || data.office?.officeId
          if (newOfficeId) {
            this.officeId = String(newOfficeId)
          }
          this.companyName = data.name || this.companyName
          this.isCertified = !!this.companyName
          
          if (this.officeId) {
            myApi.officeData(this.officeId).then(res => {
              // 检查响应是否成功
              if (res.success === false) {
                console.error('获取企业详情失败', res)
                Message.error(res.message || '获取企业详情失败，请重试')
                return
              }
              
              const data = res.result || res.data
              if (data) {
                this.companyName = data.name || this.companyName
                this.unifiedSocialCreditCode = data.code || ''
                this.registeredAddress = data.address || data.gszcdxxdz || ''
                this.administrativeDivision = data.xzqh || data.gszcdxzqh || ''
                this.legalRepresentative = data.fddbr || ''
                this.industry = data.hylbdm || ''
                this.companyContact = data.lxr || ''
                this.companyPhone = data.lxrsj || data.fddbrlxdh || ''
              }
            }).catch((err) => {
              console.error('获取企业详情失败', err)
              Message.error('获取企业详情失败，请重试')
            })
          }
        }
      }).catch((err) => {
        console.error('同步单位信息失败', err)
        Message.error('同步信息失败，请重试')
      })
    },

    parseJwtPayload(token) {
      try {
        if (!token || token.split('.').length < 2) return {}
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const json = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
            .join('')
        )
        return JSON.parse(json)
      } catch (e) {
        return {}
      }
    },

    // 3. 统一刷新当前标签页下的列表 (补充了总条数 totalCount 的赋值)
    refreshList() {
      const params = { page: this.currentPage, size: this.pageSize }
      
      if (this.currentTab === 'agent') {
        myApi.operatorPage(params).then(res => { 
          const data = res.result || res.data
          this.agentData = data.records || []
          this.totalCount = data.total || 0 
        }).catch(() => {
          this.agentData = []
          this.totalCount = 0
        })
      } else if (this.currentTab === 'iot') {
        myApi.equipmentPage(params).then(res => { 
          const data = res.result || res.data
          this.iotData = data.records || []
          this.totalCount = data.total || 0 
        }).catch(() => {
          this.iotData = []
          this.totalCount = 0
        })
      } else if (this.currentTab === 'business') {
        this.fetchBusinessData()
      } else {
      }
    },

    // 4. 业务信息分页查询 (补充了总条数 totalCount 的赋值)
    fetchBusinessData() {
      const params = { page: this.currentPage, size: this.pageSize }
      switch (this.currentBusinessNav) {
        case 'waste-info':
          myApi.wastePage(params).then(res => { 
            const data = res.result || res.data
            this.wasteInfoData = data.records || []
            this.totalCount = data.total || 0
          }).catch((err) => {
            this.wasteInfoData = []
            this.totalCount = 0
          })
          break
        case 'storage':
          myApi.storagePage(params).then(res => { 
            const data = res.result || res.data
            this.storageData = data.records || []
            this.totalCount = data.total || 0
          }).catch((err) => {
            this.storageData = []
            this.totalCount = 0
          })
          break
        case 'plan-produce':
          myApi.productionPage(params).then(res => { 
            const data = res.result || res.data
            this.planProduceData = data.records || []
            this.totalCount = data.total || 0
          }).catch((err) => {
            this.planProduceData = []
            this.totalCount = 0
          })
          break
        case 'plan-dispose':
          myApi.dispositionPage(params).then(res => { 
            const data = res.result || res.data
            this.planDisposeData = data.records || []
            this.totalCount = data.total || 0
          }).catch((err) => {
            this.planDisposeData = []
            this.totalCount = 0
          })
          break
        case 'business-facility':
          myApi.dispositionPage(params).then(res => {
            const data = res.result || res.data
            this.businessFacilityData = data.records || []
            this.totalCount = data.total || 0
          }).catch((err) => {
            this.businessFacilityData = []
            this.totalCount = 0
          })
          break
        default:
          this.totalCount = 0
          break
      }
    },

    // 5. 保存授权信息
    async handleAuthConfirm() {
      const authToken = (this.authDialogValue || '').trim()
      if (authToken.length < 1) return Message.warning('全国系统授权信息不能为空，请填写')
      if (this.isSubmitting) return
      
      this.isSubmitting = true
      let user = null
      try {
        const userRaw = StorageUtil.getItemSync('user')
        user = userRaw ? JSON.parse(userRaw) : null
      } catch (e) {
        user = null
      }
      const token = StorageUtil.getItemSync('token') || window.tokenCache || ''
      const jwt = this.parseJwtPayload(token)

      // 业务约定：token记录里的 id 使用登录用户 officeId
      let id = ''
      let officeId = String(
        user?.officeId ||
        user?.officeCode ||
        this.officeId ||
        jwt?.officeId ||
        jwt?.officeCode ||
        jwt?.orgId ||
        ''
      )

      if (!officeId) {
        try {
          await this.getOfficeStatus()
          officeId = String(officeId || this.officeId || '')
        } catch (e) {}
      }

      id = String(officeId || '')

      // 保存前先同步一下token 列表：若后端已有记录则拿到tokenId，只走一次更新，避免「先新增后0002 再更新」两次写操作两次请求
      if (!this.tokenId) {
        try {
          await this.getAuthTokenStatus()
        } catch (e) {}
      }

      // 接口约定：body �?{ id, token }；更新时�?tokenPage 带回�?this.tokenId，新增时�?officeId
      const submitData = {
        token: authToken,
        id
      }
      if (this.tokenId != null && this.tokenId !== '') {
        submitData.id = this.tokenId
      }
      if (submitData.id === '' || submitData.id == null) {
        this.isSubmitting = false
        return Message.warning('缺少 id（officeId �?token 记录 id），请重新登录后重试')
      }

      try {
        // 已存在记录时走更新；�?tokenId 时先新增，若后端提示 0002（已有有�?token）则改走更新
        if (this.tokenId) {
          await settingApi.updateToken(submitData)
        } else {
          try {
            await myApi.addToken(submitData)
          } catch (e) {
            const code = e?.code
            const msg = e?.message || e?.msg || ''
            if (code === '0002' || /请勿重复添加|有效期内/.test(msg)) {
              await settingApi.updateToken(submitData)
            } else {
              throw e
            }
          }
        }
        Message.success('保存成功')
        // 保存成功后设置为已填写
        this.authorizationInfo = '已填写'
        this.showAuthDialog = false
        await this.getAuthTokenStatus()
      } catch (err) {
        console.error('[token-submit] failed payload:', JSON.stringify(submitData))
        console.error('[token-submit] failed response:', err?.response?.data || err)
        Message.error((err?.message || err?.msg || err?.response?.data?.message || '保存失败'))
      } finally {
        this.isSubmitting = false
      }
    },

    // 6. 经办人管理
    handleAddAgentSave() {
      if (!this.newAgent.operatorName || !this.newAgent.operatorType) return Message.warning('请填写完整')
      if (this.isSubmitting) return;
      
      this.isSubmitting = true;
      myApi.addoperator(this.newAgent).then(() => {
        Message.success('添加成功')
        this.showAddAgentDialog = false
        this.newAgent = { operatorName: '', operatorType: '' } // 提交成功后清空表单
        this.refreshList()
      }).finally(() => {
        this.isSubmitting = false;
      })
    },

    // 7. 物联网设备管理
    handleAddIotSave() {
      if (!this.newIotDevice.code || !this.newIotDevice.type) return Message.warning('请填写完整')
          if (this.isSubmitting) return;

      this.isSubmitting = true;
      myApi.addequipment(this.newIotDevice).then(() => {
        Message.success('添加成功')
        this.showAddIotDialog = false
        this.newIotDevice = { code: '', type: '', enabled: false } // 提交成功后清空表单
        this.refreshList()
      }).finally(() => {
        this.isSubmitting = false;
      })
    },

    // 8. 统一删除确认逻辑
    handleDeleteConfirm() {
      if (this.isSubmitting) return;
      const id = this.pendingDeleteId
      this.isSubmitting = true;

      if (this.currentTab === 'agent') {
        myApi.deloperator(id).then(() => {
          Message.success('删除成功')
          this.showDeleteDialog = false
          this.refreshList()
        }).finally(() => { this.isSubmitting = false })
      } else if (this.currentTab === 'iot') {
        myApi.delequipment(id).then(() => {
          Message.success('删除成功')
          this.showDeleteDialog = false
          this.refreshList()
        }).finally(() => { this.isSubmitting = false })
      }
    },

    // --- UI 交互方法 ---
    handleTabClick(tab) {
      try {
        this.currentTab = tab
        this.currentPage = 1
        this.refreshList()
      } catch (error) {
        console.error('[DEBUG] handleTabClick: 错误:', error)
      }
    },
    handleBusinessNavClick(nav) {
      try {
        this.currentBusinessNav = nav
        this.currentPage = 1
        this.fetchBusinessData()
      } catch (error) {
        console.error('[DEBUG] handleBusinessNavClick: 错误:', error)
      }
    },
    handleAuthEdit() {
      // 重新获取token信息，确保弹窗显示最新的token值
      this.getAuthTokenStatus().then(() => {
        // 从token记录中获取实际的token值
        if (this.tokenId) {
          myApi.tokenPage({ page: 1, size: 50, id: this.tokenId }).then(res => {
            const records = this.extractTokenPageRecords(res)
            if (records.length > 0) {
              this.authDialogValue = this.pickNationalTokenFromRecord(records[0])
            } else {
              this.authDialogValue = ''
            }
            this.showAuthDialog = true
          }).catch(() => {
            this.authDialogValue = ''
            this.showAuthDialog = true
          })
        } else {
          this.authDialogValue = ''
          this.showAuthDialog = true
        }
      })
    },
    handleDeleteClick(id) {
      this.pendingDeleteId = id
      this.showDeleteDialog = true
    },
    handleIotDeleteClick(id) {
      this.pendingDeleteId = id
      this.showDeleteDialog = true
    },
    handlePageClick(page) {
      this.currentPage = page
      this.refreshList()
    },

    // 企业认证
    handleCertifyEdit() {
      this.showCertifyDialog = true;
    },
    handleCertifyConfirm() {
      // TODO: 在这里接入提交企业认证接口
      this.$message.success('认证信息已提交');
      this.showCertifyDialog = false;
    },

    // 修改密码 / 手机号
    handleModifyClick(type) {
      this.modifyType = type;
      this.showModifyDialog = true;
    },
    handleModifyCancel() {
      this.showModifyDialog = false;
    },
    handleModifyConfirm() {
      // TODO: 在这里接入修改密码/手机接口
      this.$message.success('修改成功');
      this.showModifyDialog = false;
    },

    // 经办人 / 物联网设备 - 修改操作
    handleEditClick(type, item) {
      this.editType = type;
      // 使用浅拷贝防止直接修改表格数据
      this.editItem = { ...item }; 
      this.showEditDialog = true;
    },
    handleEditCancel() {
      this.showEditDialog = false;
      this.editItem = null;
    },
    handleEditConfirm() {
      if (this.isSubmitting) return;
      this.isSubmitting = true;

      // 判断是修改经办人还是修改物联网设备
      const apiMethod = this.editType === 'agent' ? myApi.editoperator : myApi.editequipmentStatus;
      
      apiMethod(this.editItem).then(() => {
        this.$message.success('修改成功');
        this.showEditDialog = false;
        this.refreshList();
      }).finally(() => {
        this.isSubmitting = false;
      });
    },

    // 取消删除操作
    handleDeleteCancel() {
      this.showDeleteDialog = false;
      this.pendingDeleteId = null;
    },
    // 其余 Dialog 取消方法...
    handleAuthCancel() { this.showAuthDialog = false },
    handleCertifyCancel() { this.showCertifyDialog = false },
    handleAddAgentClick() { this.showAddAgentDialog = true },
    handleAddAgentCancel() { this.showAddAgentDialog = false },
    handleAddIotClick() { this.showAddIotDialog = true },
    handleAddIotCancel() { this.showAddIotDialog = false }
  }
}
</script>

<style scoped>
.personal-center {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  border-radius: 24px;
  overflow: hidden;
  min-height: 0;
  position: relative;
}

.personal-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0;
  flex: 1;
  min-height: 0;
}

/* 上面容器 */
.user-info-header {
  width: 100%;
  height: 140px;
  border-radius: 24px;
  opacity: 1;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  flex-wrap: nowrap;
  flex-direction: row;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #F2F3F5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 40px;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.user-name,
.user-job {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name span:first-child,
.user-job span:first-child {
  color: #717782;
  font-size: 14px;
  min-width: 60px;
}

.user-name span:last-child,
.user-job span:last-child {
  color: #1D2129;
  font-size: 14px;
  font-weight: 500;
  word-break: break-word;
}

.auth-info {
  flex-wrap: wrap;
  gap: 16px;
  display: flex;
  flex-direction: column;
  flex: 2;
  min-width: 0;
  align-items: flex-start;
}

.user-company {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.user-company span:first-child {
  color: #717782;
  font-size: 14px;
  min-width: 80px;
  margin-right: 12px;
}

.user-company .company-name {
  margin-right: 16px;
}

.company-name {
  color: #1D2129;
  font-size: 14px;
  font-weight: 500;
  word-break: break-word;
}

.verified {
  color: #13B63A;
  font-size: 14px;
  font-weight: 500;
  word-break: break-word;
  background-color:#E8FFEA;
;
}

.not-verified {
  color: #717782;
  font-size: 14px;
  font-weight: 500;
  word-break: break-word;
  background-color:#E8FFEA;
}

.system-authorization {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.system-authorization > span {
  flex-shrink: 0;
  white-space: nowrap;
  margin-right: 12px;
}

.system-authorization > div,
.system-authorization > input,
.system-authorization > span.fill-status {
  min-width: 0;
  width: auto;
  flex-shrink: 1;
  margin-right: 16px;
}

.fill-status {
  color: #717782;
  font-size: 14px;
  padding: 0 12px;
  height: 32px;
  display: flex;
  align-items: center;
}

.system-authorization span {
  color: #717782;
  font-size: 14px;
  min-width: 120px;
}

.not-filled {
  color: #717782;
  font-size: 14px;
  min-width: 200px;
  max-width: 300px;
  padding: 0 12px;
  height: 32px;
  display: flex;
  align-items: center;
}

.filled {
  color: #1D2129;
  font-size: 14px;
  min-width: 200px;
  max-width: 300px;
  padding: 0 12px;
  height: 32px;
  display: flex;
  align-items: center;
  word-break: break-word;
}

.authorization-input {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  color: #1D2129;
  background: transparent;
}

.auth-btn {
  height: 32px;
  padding: 0 16px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #13B63A;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-btn:hover {
  background: transparent;
  color: #0EA231;
}

/* 下面容器 */
.tab-container {
  width: 100%;
  border-radius: 24px;
  opacity: 1;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 5px 10px 0px 3px;
  box-sizing: border-box;
  position: relative;
  flex: 1;
  min-height: 0;
}

.tab-navigation {
  display: flex;
  gap: 16px;
  margin-bottom: 0;
  overflow-x: hidden;
  padding-bottom: 8px;
  position: sticky;
  top: 0;
  background: #FFFFFF;
  z-index: 10;
  flex-wrap: wrap;
}

.divider {
  width: 100%;
  height: 0px;
  border-top: 1px solid #E5E7EB;
  margin-bottom: 5px;
  opacity: 1;
}

.tab-content {
  flex: 1;
  min-height: 0;
  overflow: visible;
}

.tab-item {
  padding: 5px 16px;
  font-size: 14px;
  color: #717782;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  border-radius: 100px;
  gap: 10px;
  opacity: 1;
  background: transparent;
  height: 32px;
  display: inline-flex;
  align-items: center;
}

.tab-item:hover {
  color: #13B63A;
  background: #F2F3F5;
}

.tab-item.active {
  color: #13B63A;
  font-weight: 500;
  background: #F2F3F5;
  border-bottom: none;
}

.tab-content {
  flex: 1;
  min-height: 0;
  overflow: visible;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.info-item label {
  color: #717782;
  font-size: 14px;
  min-width: 120px;
  flex-shrink: 0;
}

.info-item span {
  color: #1D2129;
  font-size: 14px;
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.modify-btn {
  height: 28px;
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #13B63A;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.modify-btn:hover {
  background: transparent;
  color: #0EA231;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 20px;
  margin-top: 0;
}

.status-enabled {
  color: #13B63A !important;
  font-weight: 500;
  background-color:#E8FFEA;
  border: 1px solid #13b6394b;
}

.info-columns {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.info-column {
  flex: 1;
  min-width: 300px;
}

/* 业务信息导航栏 */
.business-nav {
  display: flex;
  gap: 16px;
  margin-bottom: 0;
  margin-top: 5px;
  padding-bottom: 8px;
  overflow-x: hidden;
  position: sticky;
  top: 0;
  background: #FFFFFF;
  z-index: 5;
  margin-left: -20px;
  margin-right: -20px;
  padding-left: 20px;
  padding-right: 20px;
  flex-wrap: wrap;
}

.business-nav-item {
  padding: 8px 16px;
  font-size: 14px;
  color: #717782;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  border-radius: 100px;
  gap: 10px;
  opacity: 1;
  background: transparent;
  height: 32px;
  display: inline-flex;
  align-items: center;
}

.business-nav-item:hover {
  color: #13B63A;
  background: #F2F3F5;
}

.business-nav-item.active {
  color: #13B63A;
  font-weight: 500;
  background: #F2F3F5;
}

/* 危废信息表格 */
.waste-info-table {
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  max-height: calc(100vh - 350px);
  border: 1px solid #E5E7EB;
  border-radius: 4px;
}

.waste-info-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  table-layout: fixed;
  min-width: 800px;
}

.waste-info-table thead {
  position: sticky;
  top: 0;
  background-color: #E5E6EB;
  z-index: 1;
}

.waste-info-table th,
.waste-info-table td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #E5E7EB;
  word-break: break-word;
  white-space: normal;
}

.waste-info-table th {
  font-weight: 500;
  color: #374151;
  width: 12.5%;
  border-bottom: 1px solid #E5E7EB;
}

.waste-info-table td {
  color: #1D2129;
  width: 12.5%;
}

.waste-info-table tr:hover {
  background-color: #F9FAFB;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 20px;
  font-size: 14px;
  color: #717782;
  flex-shrink: 0;
  margin-top: auto;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  padding: 4px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  background: white;
  color: #717782;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover {
  background: #F3F4F6;
  color: #13B63A;
  border-color: #13B63A;
}

.page-btn.active {
  background: #13B63A;
  color: white;
  border-color: #13B63A;
}

/* 设施状态 */
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-dot.enabled {
  background-color: #13B63A;
}

.status-dot.disabled {
  background-color: #F87171;
}

/* 前往页码 */
.go-to-page {
  display: flex;
  align-items: center;
  gap: 8px;
}

.go-to-input {
  width: 60px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  font-size: 14px;
  color: #1D2129;
  text-align: center;
}

.go-to-input:focus {
  outline: none;
  border-color: #13B63A;
  box-shadow: 0 0 0 2px rgba(19, 182, 58, 0.1);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-info-header,
  .auth-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .user-details {
    width: 100%;
  }
  
  .system-authorization {
    width: 100%;
  }
  
  .authorization-input {
    max-width: none;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-item label {
    min-width: auto;
  }
}

/* 授权信息弹窗 */
.auth-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.auth-dialog {
  background-color: white;
  border-radius: 4px;
  width: 328px;
  height: 184px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  opacity: 1;
}

.auth-dialog-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 20px;
  position: relative;
}

.auth-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}

.auth-dialog-close {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-dialog-close:hover {
  color: #6B7280;
}

.auth-dialog-body {
  padding: 20px;
}

.auth-dialog-input {
  width: 280px;
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  color: #1D2129;
  box-sizing: border-box;
  background-color: #F2F3F5;
}

.auth-dialog-input:focus {
  outline: none;
  background-color: #F2F3F5;
}

.auth-dialog-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: center;
}

.auth-dialog-confirm {
  background-color: #13B63A;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-dialog-confirm:hover {
  background-color: #0EA231;
}

/* 企业认证弹窗样式 */
.certify-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.certify-dialog {
  background-color: white;
  border-radius: 8px;
  width: 480px;
  min-height: 320px;
  max-height: 80vh;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.certify-dialog-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 24px;
  position: relative;
  border-bottom: 1px solid #E5E7EB;
}

.certify-dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1D2129;
}

.certify-dialog-close {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 24px;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.certify-dialog-close:hover {
  color: #6B7280;
  background-color: #F3F4F6;
}

.certify-dialog-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.certify-form-item {
  margin-bottom: 20px;
}

.certify-form-item:last-child {
  margin-bottom: 0;
}

.certify-form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.certify-dialog-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
  color: #1D2129;
  box-sizing: border-box;
  background-color: #FFFFFF;
  transition: all 0.2s;
}

.certify-dialog-input:focus {
  outline: none;
  border-color: #13B63A;
  box-shadow: 0 0 0 3px rgba(19, 182, 58, 0.1);
}

.certify-dialog-input::placeholder {
  color: #9CA3AF;
}

.certify-dialog-footer {
  padding: 16px 24px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #E5E7EB;
}

.certify-dialog-confirm {
  background-color: #13B63A;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.certify-dialog-confirm:hover {
  background-color: #0EA231;
}

/* 修改确认弹窗样式 */
.modify-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modify-dialog {
  background-color: white;
  border-radius: 4px;
  width: 244px;
  height: 182px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  opacity: 1;
  padding: 24px 32px 32px 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.modify-dialog-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #F56C6C;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
}

.modify-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}

.modify-dialog-body {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.modify-dialog-body p {
  margin: 0;
  font-size: 14px;
  color: #1D2129;
  text-align: center;
}

.modify-dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.modify-dialog-cancel {
  width: 80px;
  height: 32px;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  background: white;
  color: #717782;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.modify-dialog-cancel:hover {
  background: #F3F4F6;
}

.modify-dialog-confirm {
  width: 80px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: #F56C6C;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.modify-dialog-confirm:hover {
  background: #E6A23C;
}

/* 经办人管理样式 */
.add-agent-btn {
  width: 100px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: #13B63A;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.add-agent-btn:hover {
  background: #0EA231;
}

.agent-table-container {
  width: 100%;
  overflow-x: auto;
}

.agent-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.agent-table th,
.agent-table td {
  padding: 12px;
  border-bottom: 1px solid #E5E7EB;
}

.agent-table th:first-child,
.agent-table td:first-child {
  text-align: left;
}

.agent-table th:nth-child(2),
.agent-table td:nth-child(2) {
  text-align: center;
}

.agent-table th:last-child,
.agent-table td:last-child {
  text-align: right;
}

.agent-table th {
  background-color: #E5E6EB;
  font-weight: 600;
  color: #1D2129;
  font-size: 14px;
}

.agent-table td {
  font-size: 14px;
  color: #1D2129;
}

.agent-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.delete-btn {
  border: none;
  background: transparent;
  color: #F56C6C;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  color: #E6A23C;
}

.edit-btn {
  border: none;
  background: transparent;
  color: #13B63A;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  color: #0EA231;
}

/* 添加经办人弹窗样式 */
.add-agent-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.add-agent-dialog {
  background-color: #FFFFFF;
  border-radius: 4px;
  width: 328px;
  height: 324px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  opacity: 1;
  display: flex;
  flex-direction: column;
}

.add-agent-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.add-agent-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}

.add-agent-dialog-close {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #909399;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-agent-dialog-close:hover {
  color: #606266;
}

.add-agent-dialog-body {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
}

.add-agent-input,
.add-agent-select {
  width: 280px;
  height: 32px;
  padding: 5px 12px;
  border: 1px solid #DCDFE6;
  border-radius: 2px;
  font-size: 14px;
  color: #1D2129;
  box-sizing: border-box;
  transition: all 0.2s;
}

.add-agent-input:focus,
.add-agent-select:focus {
  outline: none;
  border-color: #13B63A;
  box-shadow: 0 0 0 2px rgba(19, 182, 58, 0.2);
}

.add-agent-dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  border-top: 1px solid #E5E7EB;
}

.add-agent-dialog-save {
  width: 80px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: #13B63A;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-agent-dialog-save:hover {
  background: #0EA231;
}

/* 删除确认弹窗样式 */
.delete-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.delete-dialog {
  background-color: white;
  border-radius: 4px;
  width: 244px;
  height: 182px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  opacity: 1;
  padding: 24px 32px 32px 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.delete-dialog-header {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.delete-warning-icon {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background-color: #F56C6C;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
  position: relative;
  top: 0;
  left: 0;
}

.delete-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}

.delete-dialog-body {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.delete-dialog-body p {
  margin: 0;
  font-size: 14px;
  color: #1D2129;
  text-align: center;
}

.delete-dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.delete-dialog-cancel {
  width: 80px;
  height: 32px;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  background: white;
  color: #717782;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-dialog-cancel:hover {
  background: #F3F4F6;
}

.delete-dialog-confirm {
  width: 80px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: #F53F3F;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-dialog-confirm:hover {
  background: #E6A23C;
}

/* 物联网设备管理样�?*/
.add-iot-btn {
  width: 120px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: #13B63A;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.add-iot-btn:hover {
  background: #0EA231;
}

.iot-table-container {
  width: 100%;
  overflow-x: auto;
}

.iot-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.iot-table th,
.iot-table td {
  padding: 12px;
  border-bottom: 1px solid #E5E7EB;
}

.iot-table th:first-child,
.iot-table td:first-child {
  text-align: left;
}

.iot-table th:nth-child(2),
.iot-table td:nth-child(2) {
  text-align: center;
}

.iot-table th:last-child,
.iot-table td:last-child {
  text-align: right;
}

.iot-table th {
  background-color: #E5E6EB;
  font-weight: 600;
  color: #1D2129;
  font-size: 14px;
}

.iot-table td {
  font-size: 14px;
  color: #1D2129;
}

.iot-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
}

/* 开关按钮样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 20px;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .switch-slider {
  background-color: #13B63A;
}

input:focus + .switch-slider {
  box-shadow: 0 0 1px #13B63A;
}

input:checked + .switch-slider:before {
  transform: translateX(20px);
}

/* 添加物联网设备弹窗样式 */
.add-iot-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.add-iot-dialog {
  background-color: #FFFFFF;
  border-radius: 4px;
  width: 328px;
  height: 370px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  opacity: 1;
  display: flex;
  flex-direction: column;
}

.add-iot-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.add-iot-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}

.add-iot-dialog-close {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #909399;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-iot-dialog-close:hover {
  color: #606266;
}

.add-iot-dialog-body {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-switch {
  display: flex;
  align-items: center;
  gap: 12px;
}

.add-iot-input {
  width: 100%;
  height: 32px;
  padding: 5px 12px;
  border: 1px solid #DCDFE6;
  border-radius: 2px;
  font-size: 14px;
  color: #1D2129;
  box-sizing: border-box;
  transition: all 0.2s;
}

.add-iot-input:focus {
  outline: none;
  border-color: #13B63A;
  box-shadow: 0 0 0 2px rgba(19, 182, 58, 0.2);
}

.add-iot-dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  border-top: 1px solid #E5E7EB;
}

.add-iot-dialog-save {
  width: 80px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: #13B63A;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-iot-dialog-save:hover {
  background: #0EA231;
}

/* 修改弹窗样式 */
.edit-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.edit-dialog {
  background-color: #FFFFFF;
  border-radius: 4px;
  width: 328px;
  min-height: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  opacity: 1;
  display: flex;
  flex-direction: column;
}

.edit-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.edit-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}

.edit-dialog-close {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #909399;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.edit-dialog-close:hover {
  color: #606266;
}

.edit-dialog-body {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.edit-input {
  width: 100%;
  height: 32px;
  padding: 5px 12px;
  border: 1px solid #DCDFE6;
  border-radius: 2px;
  font-size: 14px;
  color: #1D2129;
  box-sizing: border-box;
  transition: all 0.2s;
}

.edit-input:focus {
  outline: none;
  border-color: #13B63A;
  box-shadow: 0 0 0 2px rgba(19, 182, 58, 0.2);
}

.edit-dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  border-top: 1px solid #E5E7EB;
  gap: 12px;
}

.edit-dialog-cancel {
  width: 80px;
  height: 32px;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  background: white;
  color: #717782;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-dialog-cancel:hover {
  background: #F3F4F6;
}

.edit-dialog-confirm {
  width: 80px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: #F56C6C;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-dialog-confirm:hover {
  background: #E6A23C;
}
</style>