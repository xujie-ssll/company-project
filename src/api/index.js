import request from '@/utils/request'

//用户登录注册模块
export const userApi = {
  //注册
  register: (data) => request.post('/oauth/account/register', data),
  //获取公钥
  getPublicKey: (data) => request.get('/oauth/rsa/public-key', data),
  // 登录
  login: (data) => request.post('/oauth/account/login', data),

}

//我的页面模块
export const myApi = {
  //判断是否填写过全国系统授权信息
  tokenPage: (data) => request.post('/sys/token/page', data),
  //添加全国系统授权信息
  addToken: (data) => request.post('/sys/token', data),
  //同步单位信息
  syncData: (data) => request.get('/sys/office/sync/data', data),
  //单位基本信息
  officeData: (id) => request.get(`/sys/office/${id}`),
  //业务基本信息(废物信息查询)
  wastePage: (data) => request.post('/program/waste/info/page', data),
  //业务基本信息(贮存设施查询)
  storagePage: (data) => request.post('/program/storageinfo/page', data),
  //业务基本信息(管理计划产生信息查询)
  productionPage: (data) => request.post('/program/production/info/page', data),
  //业务基本信息(管理计划自行利用处置情况查询)
  dispositionPage: (data) => request.post('/program/disposition/info/page', data),
  //经办人列表
  operatorPage: (data) => request.post('/program/operator/info/page', data),
  //新增经办人
  addoperator: (data) => request.post('/program/operator/info', data),
  //删除经办人
  deloperator: (id) => request.delete(`/program/operator/info/${id}`),
  //修改经办人
  editoperator: (data) => request.put('/program/operator/info', data),
  //设备管理列表
  equipmentPage: (data) => request.post('/program/equipment/page', data),
  //修改设备管理状态
  editequipmentStatus: (data) => request.put('/program/equipment', data),
  //删除设备
  delequipment: (id) => request.delete(`/program/equipment/${id}`),
  //添加设备
  addequipment: (data) => request.post('/program/equipment', data),
}



//产生模块
export const generateApi = {
  //产生新的危废单(新增)
  addProduction: (data) => request.post('/program/production', data),
  //产生新的危废单(修改)
  editProduction: (data) => request.put('/program/production', data),
  //产生单(列表)
  productionPage: (data) => request.post('/program/production/page', data),
  //产生单(删除)
  delproduction: (id) => request.delete(`/program/production/${id}`),
  //产生单(撤销)
  cancelData: (data) => request.post('/program/production/cancel/data', data),
  //产生单(申报)
  reportdata: (id) => request.get(`/program/production/report/data/${id}`),
}

//入库模块
export const warehousingApi = {
  //添加危废入库单(新增)
  addSavebatch: (data) => request.post('/program/storage/save/batch', data),
  //危废入库单(列表)
  warehousingPage: (data) => request.post('/program/storage/page', data),
  //入库单(删除)
  delWarehousing: (id) => request.delete(`/program/storage/${id}`),
  //入库单(详情)
  warehousingDetails: (id) => request.get(`/program/storage/${id}`),
  //入库单(撤销)
  warehousingCancelData: (data) => request.post('/program/storage/cancel/data', data),
  //入库单(申报)
  warehousingReport: (id) => request.get(`/program/storage/report/data/${id}`),
  //入库单(批次详情)
  batchgDetails: (batchNo) => request.get(`/program/storage/batch/no?batchNo=${batchNo}`),
}

//出库模块
export const outboundApi = {
  //添加危废出库单(新增)
  addoutbound: (data) => request.post('/program/out/storage/save/batch', data),
  //危废出库单(列表)
  outboundPage: (data) => request.post('/program/out/storage/page', data),
  //出库单(删除)
  delOutbound: (id) => request.delete(`/program/out/storage/${id}`),
  //出生单(申报)
  outreportdata: (id) => request.get(`/program/out/storage/report/data/${id}`),
  //出库单(撤销)
  outCancelData: (data) => request.post('/program/out/storage/cancel/data', data),
  //出库单(批次详情)
  outbatchgDetails: (batchNo) => request.get(`/program/out/storage/batch/no?batchNo=${batchNo}`),
}

//自行利用处置模块
export const selfUseApi = {
  //自行利用处置(新增)
  addselfUse: (data) => request.post('/program/self/dispose', data),
  //自行利用处置(列表)
  selfUsepage: (data) => request.post('/program/self/dispose/page', data),
  //自行利用处置(申报)
  selfUsereportdata: (id) => request.get(`/program/self/dispose/report/data/${id}`),
  //自行利用处置(删除)
  delSelfUse: (id) => request.delete(`/program/self/dispose/${id}`),
  //自行利用处置(撤销)
  selfCancelData: (data) => request.post('/program/self/dispose/cancel/data', data),
  //自行利用处置(详情)
  selfDetails: (id) => request.get(`/program/self/dispose/${id}`),
}



//管理台账
export const ledgerApi = {
  //产生台账
  productionData: (data) => request.post('/program/ledger/production/page', data),
  //入库台账
  storageData: (data) => request.post('/program/ledger/storage/page', data),
  //自行利用处置台账
  disposeData: (data) => request.post('/program/ledger/self/dispose/page', data),
  //调整台账
  inventoryData: (data) => request.post('/program/ledger/adjust/inventory/page', data),
  //撤销台账
  cancelData: (data) => request.post('/program/ledger/cancel/page', data),
}


//转移联单模块
export const licenceApi = {
  //转移联单--新增--选择转移企业(列表)
  licenceData: (data) => request.post('/program/licence/page', data),
}



//库存查看模块
export const inventoryApi = {
  //库存查看(列表)
  inventoryPage: (data) => request.post('/program/label/page', data),
  //库存调整(新增)
  addAdjust: (data) => request.post('/program/adjust/inventory', data),

}

//访问签名附件
export const imgApi = {
  presigner: (filePath) => request.get(`/sys/upload/file/access/presigner/${filePath}`, { responseType: 'blob' }),
}


//设置页面模块
export const settingApi = {
  //全国系统授权信息获取
  isToken: (id) => request.get(`/sys/token/${id}`),
  //更新全国系统授权信息
  updateToken: (data) => request.put('/sys/token', data),
}


// 通用字典模块
export const dictionaryApi = {
  //通过组id查询字典
  dictionaryItemPage: (data) => request.post('/program/dictionary/item/page', data),
  //贮存部门经办人/运送部门经办人字典查询
  operatorInfoPage: (data) => request.post('/program/operator/info/page', data),
}
