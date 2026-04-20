<template>
  <div class="inventory-container">
    <!-- 上容器 -->
    <div class="upper-container">
      <!-- 第一个容器：标题和切换图标 -->
      <div class="title-container">
        <div class="title-row">
          <span class="title-text">{{ defaultData.factoryName }}</span>
          <el-button
            icon="el-icon-sort"
            style="transform: rotate(90deg)"
            class="switch-icon"
          ></el-button>
        </div>
      </div>

      <!-- 第二个容器：卡片和图片的左右布局 -->
      <div class="cards-image-container">
        <!-- 左侧容器：存放卡片且固定 -->
        <div class="left-container">
          <div class="stat-card">
            <div class="stat-value">{{ defaultData.storageVolume }}</div>
            <div class="stat-label">贮存量 (t)</div>
          </div>
          <div class="stat-card">
            <div class="stat-value total">{{ defaultData.totalStorageVolume }}</div>
            <div class="stat-label">总贮存量 (t)</div>
          </div>
        </div>
        <!-- 右侧容器：存放图片，当屏幕变大时向右填充 -->
        <div class="right-container">
          <div class="image-area">
            <img src="@/assets/weifei 1.png" alt="illustration" class="illustration" />
          </div>
        </div>
      </div>
    </div>

    <!-- 下容器 -->
    <div class="lower-container">
      <div class="query-bar">
        <div class="query-table-title">查询表格</div>
        <div class="query-row">
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
            <label>入库日期</label>
            <el-date-picker
              v-model="inboundDate"
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
            <el-select v-model="wasteType" placeholder="请选择" class="query-select">
              <el-option
                v-for="option in wasteOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
          <div class="query-buttons">
            <el-button
              type="primary"
              icon="el-icon-search"
              class="query-btn"
              @click="handleQuery"
            >
              <span> 查询</span>
            </el-button>
            <el-button class="reset-btn" icon="el-icon-refresh" @click="handleReset">
              <span>重置</span>
            </el-button>
          </div>
        </div>

        <div class="divider-line"></div>

        <!-- 按钮组 -->
        <div class="batch-search-area">
          <button class="batch-print-btn" @click="handleBatchPrint">批量打印</button>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索"
              class="custom-search-input"
              @keyup.enter="handleSearch"
            >
              <template slot="append">
                <el-button icon="el-icon-search" @click="handleSearch"></el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 表格容器 -->
      <div class="table-container">
        <el-table
          :data="paginatedData"
          row-key="id"
          style="width: 100%"
          class="nowrap-table"
          height="230px"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          ref="inventoryTable"
        >
          <el-table-column
            type="selection"
            width="55"
            :reserve-selection="true"
          ></el-table-column>
          <el-table-column prop="name" label="危废名称"></el-table-column>
          <el-table-column prop="code" label="危废代码"></el-table-column>
          <el-table-column
            prop="digitalId"
            label="数字识别码"
            width="200"
          ></el-table-column>
          <el-table-column prop="amount" label="产生量"></el-table-column>
          <el-table-column prop="unit" label="计量单位"></el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <div class="operation-buttons">
                <el-button type="primary" size="small" @click="handleTag(scope.row)"
                  >标签</el-button
                >
                <el-button type="warning" size="small" @click="handleAdjust(scope.row)"
                  >调整</el-button
                >
                <el-button type="success" size="small" @click="handlePrint(scope.row)"
                  >打印</el-button
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <span>已选{{ selectedCount }}条 共{{ totalCount }}条</span>
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

    <!-- 标签打印弹窗 -->
    <div v-show="showPrintDialog" class="print-dialog">
      <div class="print-dialog-content">
        <div class="print-dialog-header">
          <h3>标签打印</h3>
          <button
            class="print-dialog-close"
            @click="!isPrinting && (showPrintDialog = false)"
          >
            ×
          </button>
        </div>

        <!-- 打印设置界面 -->
        <div v-show="!isPrinting && !printSuccess" class="print-dialog-body">
          <div class="print-size-option">
            <input type="radio" id="size-100" v-model="printSize" value="100" />
            <label for="size-100">100mm×100mm</label>
          </div>
          <div class="print-size-option">
            <input type="radio" id="size-150" v-model="printSize" value="150" />
            <label for="size-150">150mm×150mm</label>
          </div>
          <div class="print-size-option">
            <input type="radio" id="size-200" v-model="printSize" value="200" />
            <label for="size-200">200mm×200mm</label>
          </div>
        </div>

        <!-- 打印加载界面 -->
        <div v-show="isPrinting" class="print-loading">
          <div class="loading-bar">
            <div
              class="loading-progress"
              :style="{ width: (printProgress / totalPrintItems) * 100 + '%' }"
            ></div>
          </div>
          <div class="loading-text">
            Loading {{ printProgress }}/{{ totalPrintItems }}...
          </div>
          <div class="printing-status">打印中</div>
        </div>

        <!-- 打印成功界面 -->
        <div v-show="printSuccess" class="print-success">
          <div class="success-icon">✓</div>
          <div class="success-text">打印完成</div>
          <button class="close-success-btn" @click="showPrintDialog = false">关闭</button>
        </div>

        <div v-show="!isPrinting && !printSuccess" class="print-dialog-footer">
          <button class="start-print-btn" @click="startPrint">开始打印</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { inventoryApi } from "@/api/index";
import { Message } from "element-ui";

export default {
  name: "InventoryPage",
  data() {
    return {
      searchKeyword: "", // 用于绑定搜索框的值
      productionDate: "",
      inboundDate: "",
      wasteType: "",
      selectedCount: 0,
      totalCount: 0,
      selectAll: false,
      selectedItems: [],
      showPrintDialog: false,
      isPrinting: false,
      printProgress: 0,
      totalPrintItems: 0,
      printSuccess: false,
      printSize: "100",
      searchTimer: null,
      loading: false,
      defaultData: {
        factoryName: "东川污水处理厂",
        storageVolume: "23.6",
        totalStorageVolume: "100.4",
      },
      tableData: [],
      originalTableData: [],
      wasteOptions: [],
      // 当前页码
      currentPage: 1,
      dialogVisible: false,
      dialogTitle: "",
      currentItem: null,
    };
  },
  mounted() {
    // 初始化时获取库存列表数据
    this.fetchInventoryData();
  },
  // 计算属性：分页数据
  computed: {
    paginatedData() {
      // 动态切割当前页的数据，每页显示6条
      const startIndex = (this.currentPage - 1) * 6;
      const endIndex = startIndex + 6;
      return this.tableData.slice(startIndex, endIndex);
    },
  },
  watch: {
    selectedItems: {
      handler(newVal) {
        this.selectedCount = newVal.length;
        // 当选中项数量变化时，更新全选状态
        this.selectAll =
          newVal.length === this.tableData.length && this.tableData.length > 0;
      },
      deep: true,
      immediate: true,
    },
    tableData: {
      handler(newVal) {
        this.totalCount = newVal.length;
        // 当表格数据变化时，更新全选状态
        this.selectAll = this.selectedItems.length === newVal.length && newVal.length > 0;
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 获取库存列表数据
    fetchInventoryData() {
      this.loading = true;

      const params = {page: 1,size: 100,};

      // 调用库存列表接口获取数据
      inventoryApi
        .inventoryPage(params)
        .then((res) => {
          const data = res.result || res.data;
          
          if (data) {
            this.originalTableData = (data.records || data.list || []).map((item) => {
              return {
                id: item.id || item.labelId || "",
                name: item.name || item.fwmc || "-",
                code: item.code || item.fwdm || "-",
                digitalId: item.digitalId || item.szsbm || "-",
                amount: item.amount || item.csl || 0,
                unit: item.unit || item.jldw || "吨",
                // 产生日期：支持多种字段格式
                productionDate: item.productionDate || item.cssj || "",
                // 入库日期：支持多种字段格式
                inboundDate: item.inboundDate || item.rksj || "",
                // 完整数据用于搜索
                rawData: item,
              };
            });
            this.wasteOptions = Array.from(
              new Map(
                this.originalTableData
                  .filter((item) => item.name && item.name !== "-")//过滤掉没有名称或名称为 "-" 的数据
                  .map((item) => [item.name, item])//将名称和数据映射为键值对
              ).values()//提取所有值，返回对象数组
            ).map((item) => ({
              label: item.name,
              value: item.name,
            }));
            this.tableData = [...this.originalTableData];
            this.totalCount = this.originalTableData.length;
            this.currentPage = 1;
          }
        })
        .catch((err) => {
          console.error("获取库存数据失败:", err);
          Message.error("获取库存数据失败，请稍后重试");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 处理标签操作
    handleTag(item) {
      this.currentItem = item;
      this.dialogTitle = "标签操作";
      this.dialogVisible = true;
    },
    // 处理调整操作
    handleAdjust(item) {
      this.currentItem = item;
      this.dialogTitle = "调整操作";
      this.dialogVisible = true;
    },
    // 处理打印操作
    handlePrint(item) {
      this.currentItem = item;
      this.showPrintDialog = true;
    },
    // 处理批量打印操作
    handleBatchPrint() {
      if (this.selectedItems.length === 0) {
        this.$message.warning("请选择要打印的项");
        return;
      }
      this.showPrintDialog = true;
    },
    // 处理打印开始
    startPrint() {
      // 显示加载状态
      this.isPrinting = true;
      this.printProgress = 0;
      this.totalPrintItems = this.selectedItems.length;
      this.printSuccess = false;

      // 模拟打印过程
      const printInterval = setInterval(() => {
        this.printProgress += 1;
        if (this.printProgress >= this.totalPrintItems) {
          clearInterval(printInterval);
          // 打印完成后显示成功提示
          setTimeout(() => {
            this.isPrinting = false;
            this.printSuccess = true;
          }, 500);
        }
      }, 200);
    },
    toggleSelectAll(selection) {
      if (selection.length > 0) {
        // 全选：选中所有项的 id
        this.selectedItems = this.tableData.map((item) => item.id);
      } else {
        // 取消全选：清空选中项
        this.selectedItems = [];
      }
    },
    handleCheckboxChange(selection, row) {
      // 更新选中项
      this.selectedItems = selection.map((item) => item.id);
      this.selectedCount = this.selectedItems.length;
    },
    handleSelectionChange(selection) {
      // 处理表格选择变化
      this.selectedItems = selection.map((item) => item.id);
      this.selectedCount = this.selectedItems.length;
    },
    handleCurrentChange(val) {
      // 处理页码变化
      this.currentPage = val;
      // 这里可以添加分页请求逻辑
    },
    // 处理查询操作
    handleQuery() {
      // 查询逻辑：根据产生日期、入库日期、危险废物类型和搜索关键词过滤数据
      const { productionDate, inboundDate, wasteType, searchKeyword } = this;

      if (!productionDate && !inboundDate && !wasteType && !searchKeyword.trim()) {
        this.$message.warning("请至少选择一个查询条件");
        return;
      }

      // 根据条件过滤数据
      this.tableData = this.originalTableData.filter((item) => {
        let match = true;

        // 产生日期比较：比较日期部分（YYYY-MM-DD）
        if (productionDate) {
          const selectedDate = this.formatDate(productionDate);
          const itemDate = item.productionDate ? item.productionDate.substring(0, 10) : "";
          if (itemDate !== selectedDate) {
            match = false;
          }
        }

        // 入库日期比较：比较日期部分（YYYY-MM-DD）
        if (inboundDate) {
          const selectedDate = this.formatDate(inboundDate);
          const itemDate = item.inboundDate ? item.inboundDate.substring(0, 10) : "";
          if (itemDate !== selectedDate) {
            match = false;
          }
        }

        // 危险废物类型比较：支持模糊匹配和精确匹配
        if (wasteType && !item.name.includes(wasteType) && item.name !== wasteType) {
          match = false;
        }

        // 搜索关键词：支持按危废名称、代码、数字识别码搜索
        const keyword = searchKeyword.trim();
        if (keyword) {
          const matchesKeyword =
            item.name.includes(keyword) ||
            item.code.includes(keyword) ||
            item.digitalId.includes(keyword);
          if (!matchesKeyword) {
            match = false;
          }
        }

        return match;
      });

      // 重置选中项和页码
      this.selectedItems = [];
      this.selectedCount = 0;
      this.currentPage = 1;
      this.$message.success(`查询成功，共找到 ${this.tableData.length} 条数据`);
    },
    // 格式化日期为 YYYY-MM-DD 格式
    formatDate(date) {
      if (!date) return "";
      if (typeof date === "string") {
        return date.substring(0, 10);
      }
      if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      return "";
    },
    handleReset() {
      // 恢复原始数据
      this.tableData = [...this.originalTableData];
      this.productionDate = "";
      this.inboundDate = "";
      this.wasteType = "";
      this.searchKeyword = "";
      this.selectedItems = [];
      this.selectedCount = 0;
      this.currentPage = 1;

      // 清空表格的内置多选缓存
      this.$refs.inventoryTable && this.$refs.inventoryTable.clearSelection();
      this.$message.success("已重置查询条件");
    },

    // 搜索功能：按危废名称、代码等关键词搜索
    handleSearch() {
      const keyword = this.searchKeyword.trim();
      const { productionDate, inboundDate, wasteType } = this;

      // 防抖处理
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      this.searchTimer = setTimeout(() => {
        let filteredData = this.originalTableData;

        // 首先应用查询表格的条件
        filteredData = filteredData.filter((item) => {
          let match = true;

          // 产生日期比较
          if (productionDate) {
            const selectedDate = this.formatDate(productionDate);
            const itemDate = item.productionDate ? item.productionDate.substring(0, 10) : "";
            if (itemDate !== selectedDate) {
              match = false;
            }
          }

          // 入库日期比较
          if (inboundDate) {
            const selectedDate = this.formatDate(inboundDate);
            const itemDate = item.inboundDate ? item.inboundDate.substring(0, 10) : "";
            if (itemDate !== selectedDate) {
              match = false;
            }
          }

          // 危险废物类型比较
          if (wasteType && !item.name.includes(wasteType) && item.name !== wasteType) {
            match = false;
          }

          return match;
        });

        // 然后应用搜索关键词
        if (keyword) {
          filteredData = filteredData.filter((item) => {
            return (
              item.name.includes(keyword) ||
              item.code.includes(keyword) ||
              item.digitalId.includes(keyword)
            );
          });
        }

        this.tableData = filteredData;
        this.totalCount = this.tableData.length;
        this.currentPage = 1;
      }, 300);
    },
  },
};
</script>

<style scoped>
/* 统一设置输入框样式 */
.custom-date-picker {
  width: 140px !important;
  height: 24px !important;
}

.query-select {
  width: 140px !important;
  height: 24px !important;
}

.custom-date-picker .el-input__inner,
.query-select .el-input__inner,
.search-input {
  font-family: Microsoft YaHei !important;
  font-weight: 400 !important;
  font-style: Regular !important;
  font-size: 12px !important;
  line-height: 20px !important;
  letter-spacing: 0% !important;
  height: 24px !important;
  background-color: #f2f3f5 !important;
  border: 1px solid transparent !important;
  color: #1d2129 !important;
}

/* 当输入框聚焦时，背景变白并显示主题色边框，体验更好 */
.custom-date-picker .el-input.is-active .el-input__inner,
.custom-date-picker .el-input__inner:focus,
.query-select .el-input.is-active .el-input__inner,
.query-select .el-input__inner:focus,
.search-input:focus {
  background-color: #ffffff !important;
  border-color: #13b63a !important;
}

/* 针对禁用状态的输入框背景 */
.custom-date-picker .el-input.is-disabled .el-input__inner {
  background-color: #e5e6eb !important;
  color: #86909c !important;
}

/* ✅ ======= 修正后的图标样式 ======= */

/* 1. 统一设置图标的包裹容器，使其垂直居中 */
.custom-date-picker :deep(.el-input__prefix),
.custom-date-picker :deep(.el-input__suffix),
.query-select :deep(.el-input__suffix) {
  display: flex !important;
  align-items: center !important; /* Flex 垂直居中，最稳妥 */
  height: 24px !important; /* 与你设定的输入框高度保持一致 */
  top: 0 !important; /* 清除默认的 top 偏移 */
}

/* 2. 统一调整图标本身的行高 */
.custom-date-picker :deep(.el-input__icon),
.query-select :deep(.el-input__icon) {
  line-height: normal !important; /* 清除 Element 默认的大行高 */
  height: auto !important;
  width: 25px !important; /* 约束图标容器宽度 */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 3. 日期选择器的输入内容需要给左边留出日历图标的位置 */
.custom-date-picker :deep(.el-input__inner) {
  padding-left: 30px !important; /* 避免文字和日历图标重叠 */
  padding-right: 15px !important;
}

/* 4. 可选：如果你觉得下拉框的小箭头太大，可以用 scale 等比缩小，比直接改宽高更安全 */
.query-select :deep(.el-select__caret) {
  transform: scale(0.85);
}
.inventory-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 0;
  position: relative;
  width: 100%;
  overflow: hidden;
}

/* 上容器 */
.upper-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
  width: 100%;
  position: relative;
  z-index: 1;
  padding-bottom: 10px;
  max-height: 25vh;
}

/* 第一个容器：标题和切换图标 */
.title-container {
  width: 100%;
  flex-shrink: 0;
}

/* 标题行 */
.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  width: 100%;
  justify-content: flex-start;
}

/* 切换图标 */
.switch-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 第二个容器：卡片和图片的左右布局 */
.cards-image-container {
  display: flex;
  width: 100%;
  flex-shrink: 1;
  position: relative;
  align-items: flex-start;
  padding-bottom: 10px;
}

/* 左侧容器：存放卡片且固定在标题下方 */
.left-container {
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  margin-top: 4px;
  margin-left: -20px;
}

/* 右侧容器：存放图片，当屏幕变大时向右填充 */
.right-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  z-index: 2;
  margin-left: 10px;
}

.title-text {
  font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
  color: #1e253d;
}

/* 统计卡片 */
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: transparent;
  padding: 8px 16px;
}

.stat-value {
  font-family: "DingTalk JinBuTi", "Microsoft YaHei", sans-serif;
  font-weight: 400;
  font-size: 24px;
  line-height: 24px;
  color: #13b63a;
  margin-bottom: 4px;
}

.stat-value.total {
  color: #34c759;
}

.stat-label {
  font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #717782;
}

/* 图片（在上层，与卡片重叠） */
.image-area {
  width: 300px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.illustration {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 下容器 */
.lower-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  position: relative;
  z-index: 1;
  background: #ffffff;
  border-radius: 24px;
  opacity: 1;
  margin-top: 35px;
  padding: 16px;
  box-sizing: border-box;
}

.query-bar {
  margin-bottom: 10px;
}

.query-table-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 10px;
  font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
}

.query-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between;
}

.query-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.query-item label {
  font-size: 14px;
  color: #717782;
  white-space: nowrap;
}

.query-select {
  width: 140px;
  border-radius: 2px;
  opacity: 1;
}

/* 调整日期选择器宽度 */
.custom-date-picker {
  width: 140px;
  border-radius: 2px;
  opacity: 1;
}

/* 调整搜索输入框宽度 */
.search-input {
  width: 140px;
  border-radius: 2px;
  opacity: 1;
}

/* 日历输入框样式 */
.custom-date-picker :deep(.el-input__inner) {
  height: 24px !important;
  line-height: 24px !important;
  font-size: 12px !important;
  padding: 0 35px !important;
  background-color: #f2f3f5 !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 2px !important;
  color: #1d2129 !important;
}

/* 日历输入框聚焦效果 */
.custom-date-picker :deep(.el-input__inner:focus) {
  background-color: #ffffff !important;
  border-color: #13b63a !important;
}

/* 日历输入框图标样式 */
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

/* 下拉选择框样式 */
.query-select :deep(.el-input__inner) {
  height: 24px !important;
  line-height: 24px !important;
  font-size: 12px !important;
  padding: 0 12px !important;
  background-color: #f2f3f5 !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 2px !important;
  color: #1d2129 !important;
}

/* 下拉选择框聚焦效果 */
.query-select :deep(.el-input__inner:focus) {
  background-color: #ffffff !important;
  border-color: #13b63a !important;
}

/* 下拉选择框图标样式 */
.query-select :deep(.el-input__suffix) {
  display: flex !important;
  align-items: center !important;
  height: 24px !important;
  top: 0 !important;
}

.query-select :deep(.el-input__icon) {
  line-height: normal !important;
  height: auto !important;
  width: 25px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.query-buttons {
  display: flex;
  gap: 18px;
  align-items: center;
  margin-left: auto;
}

.query-buttons .el-button {
  height: 24px !important;
  padding: 0 12px !important;
  border-radius: 2px !important;
  font-size: 12px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 24px !important; /* 防止被内部元素撑开 */
}

/* 让图片和文字在一行居中 */
.query-buttons .el-button {
  height: 24px !important;
  padding: 0 12px !important;
  border-radius: 2px !important;
  font-size: 12px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 24px !important;
}
.query-buttons .el-button [class*="el-icon-"] + span {
  margin-left: 4px;
}

.query-buttons .query-btn {
  background-color: #13b63a !important;
  border-color: #13b63a !important;
  color: white !important;
}

.query-buttons .reset-btn {
  background-color: #f2f3f5 !important;
  border-color: #e5e7eb !important;
  color: #717782 !important;
}

.btn-icon,
.reset-btn-icon,
.search-btn-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.divider-line {
  height: 1px;
  background: #e5e7eb;
  margin: 7px 0 14px 0;
}

.batch-search-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.batch-print-btn {
  height: 32px;
  padding: 0 16px;
  background: #13b63a;
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0;
  margin-left: auto;
}

/* ✅ ======= 替换后的 Element UI 搜索框样式 ======= */
.custom-search-input {
  width: 172px !important; /* 140px的输入框 + 32px的按钮 */
  height: 24px !important;
  display: flex;
}

/* 输入框内部样式 */
.custom-search-input :deep(.el-input__inner) {
  height: 24px !important;
  line-height: 24px !important;
  font-size: 12px !important;
  padding: 0 12px !important;
  background-color: #f2f3f5 !important;
  border: 1px solid #e5e7eb !important;
  border-right: none !important; /* 右侧边框去掉，和按钮贴合 */
  border-radius: 2px 0 0 2px !important;
  color: #1d2129 !important;
}

/* 输入框聚焦效果 */
.custom-search-input :deep(.el-input__inner:focus) {
  background-color: #ffffff !important;
  border-color: #13b63a !important;
}

/* 右侧附加按钮的包裹层样式 */
.custom-search-input :deep(.el-input-group__append) {
  padding: 0 !important;
  width: 32px !important;
  border: 1px solid #e5e7eb !important;
  border-left: none !important;
  background-color: #f2f3f5 !important;
  border-radius: 0 2px 2px 0 !important;
  overflow: hidden;
}

/* 右侧附加按钮本身样式 */
.custom-search-input :deep(.el-button) {
  padding: 0 !important;
  margin: 0 !important;
  height: 24px !important;
  width: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: none !important;
  background: transparent !important;
}

.table-container {
  width: 100%;
  margin-bottom: 20px;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  table-layout: fixed;
  min-width: 800px;
}

.inventory-table thead {
  position: sticky;
  top: 0;
  background-color: #e5e6eb;
  z-index: 1;
}

.inventory-table th,
.inventory-table td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  word-break: break-word;
  white-space: normal;
}

.inventory-table th {
  font-weight: 500;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.inventory-table td {
  color: #1d2129;
}

.inventory-table tr:hover {
  background-color: #f9fafb;
}

.inventory-table input[type="checkbox"] {
  margin: 0;
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  background: white;
}

.inventory-table input[type="checkbox"]:checked {
  background: #13b63a;
  border-color: #13b63a;
}

.inventory-table input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* 旧按钮样式，仅适用于非Element UI按钮 */
.inventory-table .operation-buttons {
  display: flex;
  gap: 8px;
}

.inventory-table .operation-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 2px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.inventory-table .operation-btn:hover {
  background: #f3f4f6;
}

.inventory-table .tag-btn {
  color: #13b63a;
  border-color: #13b63a;
}

.inventory-table .adjust-btn {
  color: #3b82f6;
  border-color: #3b82f6;
}

.inventory-table .print-btn {
  color: #f59e0b;
  border-color: #f59e0b;
}

/* 标签打印弹窗 */
.print-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: auto;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.print-dialog-content {
  background: white;
  border-radius: 8px;
  width: 328px;
  min-height: 242px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.print-dialog-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  position: relative;
}

.print-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  padding-top: 25px;
}

.print-dialog-close {
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  color: #909399;
  padding: 0;
  line-height: 1;
  width: 12.96px;
  height: 12.96px;
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.print-dialog-body {
  margin-bottom: 24px;
}

.print-size-option {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.print-size-option input[type="radio"] {
  margin: 0;
  width: 16px;
  height: 16px;
}

.print-size-option label {
  font-size: 14px;
  color: #1d2129;
  cursor: pointer;
}

.print-dialog-footer {
  display: flex;
  justify-content: center;
  padding-bottom: 24px;
}

.start-print-btn {
  background: #13b63a;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 32px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.start-print-btn:hover {
  background: #0f9a30;
}

/* 打印加载状态 */
.print-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.loading-bar {
  width: 100%;
  height: 4px;
  background: #f2f3f5;
  border-radius: 2px;
  overflow: hidden;
}

.loading-progress {
  height: 100%;
  background: #13b63a;
  border-radius: 2px;
  transition: width 0.2s ease;
}

.loading-text {
  font-size: 14px;
  color: #717782;
}

.printing-status {
  padding: 8px 16px;
  background: #e6f7ef;
  color: #13b63a;
  border-radius: 4px;
  font-size: 14px;
}

/* 打印成功界面 */
.print-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
  width: 100%;
  box-sizing: border-box;
}

.success-icon {
  width: 48px;
  height: 48px;
  background: #13b63a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.success-text {
  font-size: 16px;
  color: #1d2129;
  font-weight: 500;
}

.close-success-btn {
  margin-top: 20px;
  padding: 8px 24px;
  background: #13b63a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.close-success-btn:hover {
  background: #0f9a30;
}

/* ✅ 优化后的表格行高计算：1表头(38px) + 6数据行(32px*6=192px) = 230px */

/* 1. 强制表头高度为 38px */
.nowrap-table :deep(.el-table__header-wrapper),
.nowrap-table :deep(.el-table__header-wrapper .el-table__header),
.nowrap-table :deep(.el-table__header-wrapper tr),
.nowrap-table :deep(.el-table__header-wrapper th) {
  height: 38px !important;
  padding: 0 !important;
}

/* 2. 强制数据行高度为 32px */
.nowrap-table :deep(.el-table__row),
.nowrap-table :deep(.el-table__row td) {
  height: 32px !important;
  padding: 0 !important;
}

/* 3. 调整单元格内部 cell 的行高，确保文字垂直居中 */
.nowrap-table :deep(.el-table__cell .cell) {
  height: 32px !important;
  line-height: 32px !important;
  display: flex;
  align-items: center;
  padding: 0 12px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 4. 针对表头文字的特殊对齐 */
.nowrap-table :deep(.el-table__header th .cell) {
  height: 38px !important;
  line-height: 38px !important;
}

/* 移除可能导致高度溢出的内边距，隐藏滚动条 */
.nowrap-table :deep(.el-table__body-wrapper) {
  overflow-y: hidden !important;
}

/* 分页器选中项背景色 */
.pagination .el-pagination__item--active {
  background: #d0f0d8 !important;
  border-color: #d0f0d8 !important;
  color: #13b63a !important;
}

/* 覆盖 Element UI 分页器选中项样式 */
.el-pagination.is-background .el-pager li:not(.disabled).active {
  background: #d0f0d8 !important;
  border-color: #d0f0d8 !important;
  color: #13b63a !important;
}

/* 表格行选中背景色 */
.nowrap-table .el-table__row.el-table__row--current {
  background: #d0f0d8 !important;
}

/* 表格单元格选中背景色 */
.nowrap-table .el-table__row.el-table__row--current > .el-table__cell {
  background: #d0f0d8 !important;
  color: #13b63a !important;
}

/* 表格单元格内容选中颜色 */
.nowrap-table .el-table__row.el-table__row--current > .el-table__cell .cell {
  color: #13b63a !important;
}

/* 确保样式优先级 */
:root {
  --selected-bg-color: #d0f0d8;
  --selected-text-color: #13b63a;
}

/* 使用CSS变量的样式 */
.pagination .el-pagination__item--active,
.el-pagination.is-background .el-pager li:not(.disabled).active,
.nowrap-table .el-table__row.el-table__row--current,
.nowrap-table .el-table__row.el-table__row--current > .el-table__cell {
  background: var(--selected-bg-color) !important;
  color: var(--selected-text-color) !important;
}

.nowrap-table .el-table__row.el-table__row--current > .el-table__cell .cell {
  color: var(--selected-text-color) !important;
}

/* 操作按钮在一行显示 */
.operation-buttons {
  display: flex;
  gap: 0;
  align-items: center;
}

/* 操作按钮透明背景 */
.operation-buttons .el-button {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.operation-buttons .el-button--primary {
  color: #409eff !important;
}

.operation-buttons .el-button--warning {
  color: #e6a23c !important;
}

.operation-buttons .el-button--success {
  color: #67c23a !important;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 10px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #717782;
  flex-shrink: 0;
  z-index: 10;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  padding: 4px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  color: #717782;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover {
  background: #f3f4f6;
  color: #13b63a;
  border-color: #13b63a;
}

.page-btn.active {
  background: #13b63a;
  color: white;
  border-color: #13b63a;
}

.page-input {
  width: 60px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.page-input:focus {
  outline: none;
  border-color: #13b63a;
  box-shadow: 0 0 0 2px rgba(19, 182, 58, 0.1);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .query-row {
    flex-wrap: wrap;
  }

  .batch-search-area {
    flex-wrap: wrap;
  }

  .search-box {
    margin-left: 0;
    width: 100%;
  }

  .search-input {
    flex: 1;
  }
}
</style>