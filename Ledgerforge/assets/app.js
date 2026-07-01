(function () {
  const store = window.appStore;

  const routes = {
    dashboard: "首页 / 工作台",
    import: "Excel 导入页",
    "import-upload": "上传文件页",
    "import-sheets": "Sheet 选择页",
    "import-mapping": "字段映射页",
    "import-preview": "导入预览页",
    "import-errors": "错误修正页",
    "import-confirm": "导入确认页",
    "import-result": "导入结果页",
    projects: "项目列表页",
    "project-detail": "项目详情页",
    grouping: "统计归集页",
    "grouping-ungrouped": "未归集项目列表",
    "grouping-suggestions": "疑似归集推荐页",
    "grouping-preview": "归集结果预览页",
    "grouping-detail": "统计归集详情页",
    reports: "报表查询页",
    "report-result": "报表结果页",
    drilldown: "明细下钻页",
    settings: "系统设置",
    "field-config": "字段配置页",
    "field-preview": "字段预览页"
  };

  const nav = [
    { route: "dashboard", label: "工作台", icon: "layout-dashboard" },
    { route: "import", label: "Excel 导入", icon: "upload-cloud" },
    { route: "projects", label: "项目台账", icon: "folder-kanban" },
    { route: "grouping", label: "统计归集", icon: "git-merge" },
    { route: "reports", label: "报表查询", icon: "bar-chart-3" },
    { route: "settings", label: "字段配置", icon: "settings-2" }
  ];

  const importSteps = [
    ["import-upload", "上传"],
    ["import-sheets", "Sheet"],
    ["import-mapping", "映射"],
    ["import-preview", "预览"],
    ["import-errors", "修正"],
    ["import-confirm", "确认"],
    ["import-result", "结果"]
  ];

  const state = {
    route: routeFromHash(),
    projectTab: "ledger",
    reportView: "project",
    fieldObject: "ledger",
    selectedProjectId: null,
    selectedGroupingId: null,
    modal: null,
    modalPayload: null,
    modalOffset: { x: 0, y: 0 },
    drag: null,
    confirm: null,
    toast: null,
    errors: {},
    loading: new Set(),
    query: "",
    parsedImport: null,
    importSheetSelections: {},
    importIssueActions: {}
  };

  let data = store.getState();

  const APP_VERSION = "V1.3.2.2";

  const FIELD_LABELS = {
    project: "项目",
    projectName: "项目名称",
    customer: "客户",
    groupingProject: "统计归集项目",
    status: "状态",
    income: "收入",
    expense: "支出",
    grossProfit: "毛利",
    debt: "欠款金额",
    receivable: "应收",
    payable: "应付",
    invoice: "发票",
    invoiceStatus: "发票状态",
    paymentStatus: "收付款状态",
    counterparty: "往来单位",
    direction: "收付款方向",
    entryDirection: "收支方向",
    businessType: "业务类型",
    itemName: "品名",
    spec: "规格",
    quantity: "数量",
    unitPrice: "单价",
    amount: "台账金额",
    ledgerAmount: "台账金额",
    paymentAmount: "收付款金额",
    invoiceAmount: "发票金额",
    debtAmount: "欠款金额",
    invoiceType: "发票类型",
    invoiceNo: "发票号",
    invoiceDate: "发票日期",
    originalInvoiceText: "原始发票情况",
    operation: "操作",
    source: "导入来源"
  };

  const METRIC_HELP = {
    "收入": "统计已确认收入台账明细金额，金额 = 数量 × 单价，不包含已删除记录。",
    "总收入": "统计当前范围内已确认收入台账明细金额，金额 = 数量 × 单价，不包含已删除记录。",
    "项目收入": "统计所有项目下已确认收入台账明细金额，金额 = 数量 × 单价，不包含已删除记录。",
    "归集收入": "统计已归入统计归集项目的收入台账明细金额，金额 = 数量 × 单价，不包含未归集项目。",
    "归集后收入": "统计本次预览归集项目的收入台账明细金额，金额 = 数量 × 单价，保存前仅用于核对。",
    "已归集收入": "统计已绑定统计归集项目的项目收入金额。",
    "本月台账金额": "统计当前本地数据中所有项目的收入台账金额，金额 = 数量 × 单价，不包含已删除记录。",
    "支出": "统计已确认支出台账明细金额，金额 = 数量 × 单价，不包含已删除记录。",
    "总支出": "统计当前范围内已确认支出台账明细金额，金额 = 数量 × 单价，不包含已删除记录。",
    "项目支出": "统计所有项目下已确认支出台账明细金额，金额 = 数量 × 单价，不包含已删除记录。",
    "归集支出": "统计已归入统计归集项目的支出台账明细金额，金额 = 数量 × 单价。",
    "归集后支出": "统计本次预览归集项目的支出台账明细金额，金额 = 数量 × 单价，保存前仅用于核对。",
    "毛利": "毛利 = 收入 - 支出，收入和支出均按台账明细的数量 × 单价计算。",
    "项目毛利": "项目毛利 = 项目收入 - 项目支出，收入和支出均按台账明细的数量 × 单价实时计算。",
    "归集后毛利": "归集后毛利 = 归集后收入 - 归集后支出，保存前仅用于核对。",
    "欠款": "欠款金额 = 应收未收 + 应付未付，收入和支出金额按数量 × 单价计算，再扣减已确认收付款。",
    "台账金额": "台账明细金额，系统按数量 × 单价自动计算，用于收入、支出和毛利统计。",
    "收付款金额": "实际收款或付款流水金额，用于扣减应收或应付，不改变台账收入和支出金额。",
    "发票金额": "开票或收票记录金额，用于发票核对，不直接改变收入、支出和毛利统计。",
    "欠款金额": "欠款金额为系统计算字段，欠款金额 = 应收未收 + 应付未付；导入欠款列仅用于校验。",
    "应收": "应收 = 收入金额 - 已确认收款金额，收入金额按台账明细数量 × 单价计算，最小为 0。",
    "应付": "应付 = 支出金额 - 已确认付款金额，支出金额按台账明细数量 × 单价计算，最小为 0。",
    "应收 / 应付": "统计本次范围内应收未收与应付未付合计。",
    "应付 / 已付 / 未付": "展示应付金额、已确认付款金额和未付金额；应付按支出台账金额扣减已确认付款计算。",
    "应收未收": "统计所有项目收入扣除已确认收款后的未收金额，收入金额按数量 × 单价计算。",
    "发票待处理": "统计状态包含“未”的发票记录数量，包含未开票和未收票。",
    "发票记录": "统计本次导入预览中将生成或需要结构化的发票记录数量。",
    "将创建项目": "统计本次导入确认后将创建或关联的项目数量，保存前仅用于预览。",
    "台账明细": "统计本次导入预览中将生成的买卖台账明细数量。",
    "收付款记录": "统计本次导入预览中将生成的收款和付款流水数量。",
    "未归集金额": "统计尚未绑定统计归集项目的原始项目收入金额，收入金额按数量 × 单价计算。",
    "统计归集项目": "统计已创建的统计归集项目数量。",
    "未归集风险": "根据当前统计归集项目是否仍有疑似未归集项目进行提示。",
    "导入成功": "统计本次导入确认后成功写入的记录数量。",
    "失败": "统计本次导入中未能写入的记录数量。",
    "警告": "统计本次导入中允许继续但需要后续核对的问题数量。",
    "导入台账金额": "统计最近一次导入批次关联项目的收入台账金额，台账金额按数量 × 单价计算。",
    "供应商采购支出": "统计该供应商作为往来单位出现的支出台账金额，金额 = 数量 × 单价。",
    "关联项目总收入": "统计该供应商参与项目的全部收入金额，金额 = 数量 × 单价，不表示供应商自身产生收入。",
    "关联项目总支出": "统计该供应商参与项目的全部支出金额，金额 = 数量 × 单价，包含其他供应商支出。",
    "关联项目毛利": "关联项目毛利 = 关联项目总收入 - 关联项目总支出。",
    "A公司收入": "统计 A 公司相关项目的收入台账金额，金额 = 数量 × 单价。",
    "A公司支出": "统计 A 公司相关项目的支出台账金额，金额 = 数量 × 单价。",
    "A公司毛利": "A 公司毛利 = A 公司收入 - A 公司支出。"
  };

  function label(key) {
    return FIELD_LABELS[key] || key;
  }

  function routeFromHash() {
    const route = (location.hash || "#dashboard").replace("#", "") || "dashboard";
    return route === "import-assignment" ? "import-preview" : route;
  }

  function refreshData() {
    data = store.getState();
    if (!state.selectedProjectId && data.projects[0]) state.selectedProjectId = data.projects[0].id;
    if (!state.selectedGroupingId && data.groupings[0]) state.selectedGroupingId = data.groupings[0].id;
  }

  function setRoute(route) {
    location.hash = route;
  }

  function icon(name, cls = "icon") {
    return `<i data-lucide="${name}" class="${cls}"></i>`;
  }

  function money(value) {
    const num = Number(value || 0);
    return `¥ ${(num / 10000).toFixed(1)}万`;
  }

  function currencyInput(value) {
    return Number(value || 0);
  }

  function calculateLedgerAmount(record) {
    return Number((Number(record.qty || 0) * Number(record.price || 0)).toFixed(2));
  }

  function normalizeLedgerBiz(type, biz) {
    if (type === "收入" && biz === "材料采购") return "材料销售";
    if (type === "收入" && biz === "设备采购") return "设备销售";
    if (type === "支出" && biz === "材料销售") return "材料采购";
    if (type === "支出" && biz === "设备销售") return "设备采购";
    return biz;
  }

  const IMPORT_ALIASES = {
    projectName: ["项目名称", "项目名", "项目", "工程名称", "合同名称", "订单名称"],
    customer: ["客户名", "客户", "客户名称", "甲方", "买方", "主往来单位"],
    partner: ["往来单位", "单位名称", "供应商", "供方", "乙方", "客户名", "客户"],
    type: ["收支方向", "方向", "收支", "类型"],
    biz: ["业务类型", "交易类型", "类别", "台账类型"],
    item: ["品名", "名称", "货物名称", "材料名称", "设备名称", "产品名称"],
    material: ["材质", "材料"],
    spec: ["规格", "规格型号", "尺寸"],
    model: ["型号", "设备型号"],
    unit: ["单位", "计量单位"],
    qty: ["数量", "件数", "台数"],
    weight: ["重量", "吨位"],
    price: ["单价", "含税单价", "不含税单价"],
    amount: ["台账金额", "金额", "总额", "合计", "价税合计"],
    debtAmount: ["欠款金额", "欠款", "未收金额", "未付金额"],
    signed: ["签订日期", "合同日期", "订单日期"],
    paymentDate: ["付款日期", "收款日期", "收付款日期"],
    paymentAmount: ["收付款金额", "付款金额", "收款金额"],
    delivery: ["到货日期", "交付日期", "发货日期"],
    invoice: ["发票情况", "发票状态", "开票情况", "收票情况"],
    invoiceDate: ["发票日期", "开票日期", "收票日期"],
    invoiceNo: ["发票号", "发票号码", "票号"],
    drawing: ["图号", "图纸号"]
  };

  const IMPORT_SYSTEM_FIELDS = [
    ["项目名称", "projectName"],
    ["客户", "customer"],
    ["往来单位", "partner"],
    ["收支方向", "type"],
    ["业务类型", "biz"],
    ["品名", "item"],
    ["材质", "material"],
    ["规格", "spec"],
    ["型号", "model"],
    ["单位", "unit"],
    ["数量", "qty"],
    ["重量", "weight"],
    ["单价", "price"],
    ["台账金额", "amount"],
    ["签订日期", "signed"],
    ["付款日期", "paymentDate"],
    ["收付款金额", "paymentAmount"],
    ["到货日期", "delivery"],
    ["发票情况", "invoice"],
    ["发票日期", "invoiceDate"],
    ["发票号", "invoiceNo"],
    ["图号", "drawing"],
    ["欠款金额（仅校验）", "debtAmount"],
    ["忽略字段", "ignore"],
    ["自定义字段", "custom"]
  ];

  function systemFieldKey(systemField) {
    const normalized = normalizeHeader(systemField).replace("仅校验", "");
    if (normalized === "金额") return "amount";
    if (normalized === "付款金额" || normalized === "收款金额") return "paymentAmount";
    const match = IMPORT_SYSTEM_FIELDS.find(([labelText]) => normalizeHeader(labelText).replace("仅校验", "") === normalized);
    return match?.[1] || "";
  }

  function normalizeHeader(value) {
    return String(value ?? "").trim().replace(/\s+/g, "").replace(/[_-]\d+$/, "");
  }

  function isReservedAmountColumn(field, key) {
    if (key !== "amount") return false;
    return /付款金额|收款金额|收付款金额|欠款金额|欠款|发票金额/.test(field);
  }

  function headerMatchesAlias(field, alias) {
    return field === alias || field.includes(alias);
  }

  function pickImportValue(row, key) {
    const mapped = row.__mapped?.[key];
    if (Array.isArray(mapped)) {
      const value = mapped.find((item) => String(item ?? "").trim() !== "");
      if (value !== undefined) return value;
    }
    const aliases = IMPORT_ALIASES[key] || [];
    for (const alias of aliases) {
      const direct = row[normalizeHeader(alias)];
      if (Array.isArray(direct)) {
        const value = direct.find((item) => String(item ?? "").trim() !== "");
        if (value !== undefined) return value;
      } else if (direct !== undefined && String(direct).trim() !== "") {
        return direct;
      }
    }
    const aliasSet = aliases.map(normalizeHeader);
    const found = Object.keys(row).find((field) => !field.startsWith("__") && !isReservedAmountColumn(field, key) && aliasSet.some((alias) => headerMatchesAlias(field, alias)));
    if (!found) return "";
    return Array.isArray(row[found]) ? row[found].find((item) => String(item ?? "").trim() !== "") || "" : row[found];
  }

  function collectImportValues(row, key) {
    const mapped = row.__mapped?.[key] || [];
    const aliases = (IMPORT_ALIASES[key] || []).map(normalizeHeader);
    const values = Array.isArray(mapped) ? mapped.filter((item) => String(item ?? "").trim() !== "") : [];
    Object.entries(row).forEach(([field, value]) => {
      if (field.startsWith("__") || isReservedAmountColumn(field, key) || !aliases.some((alias) => headerMatchesAlias(field, alias))) return;
      const list = Array.isArray(value) ? value : [value];
      list.forEach((item) => {
        if (String(item ?? "").trim() !== "") values.push(item);
      });
    });
    return values;
  }

  function toNumber(value) {
    if (value === undefined || value === null || value === "") return 0;
    if (typeof value === "number") return value;
    const text = String(value).replace(/[￥¥,\s]/g, "").trim();
    if (!text) return 0;
    const multiplier = text.endsWith("万") ? 10000 : 1;
    const num = Number(text.replace("万", ""));
    return Number.isFinite(num) ? num * multiplier : 0;
  }

  function formatImportDate(value) {
    if (!value) return "";
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
    if (typeof value === "number" && value > 20000) {
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
    }
    const text = String(value).trim().replaceAll("/", "-").replaceAll(".", "-");
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? text : date.toISOString().slice(0, 10);
  }

  function normalizeImportDirection(row) {
    const explicit = String(pickImportValue(row, "type") || "");
    const biz = String(pickImportValue(row, "biz") || "");
    const invoice = String(pickImportValue(row, "invoice") || "");
    const signal = `${explicit} ${biz} ${invoice}`;
    if (/支出|采购|付款|收票|应付/.test(signal)) return "支出";
    if (/收入|销售|收款|开票|应收/.test(signal)) return "收入";
    return "收入";
  }

  function normalizeImportBiz(row, type) {
    const raw = String(pickImportValue(row, "biz") || "");
    if (raw.includes("材料")) return type === "收入" ? "材料销售" : "材料采购";
    if (raw.includes("设备")) return type === "收入" ? "设备销售" : "设备采购";
    const itemSignal = `${pickImportValue(row, "item")} ${pickImportValue(row, "material")} ${pickImportValue(row, "model")}`;
    if (/板|钢|材|料|吨/.test(itemSignal)) return type === "收入" ? "材料销售" : "材料采购";
    if (/机|线|设备|组件|台|套/.test(itemSignal)) return type === "收入" ? "设备销售" : "设备采购";
    return "其他";
  }

  function normalizeInvoiceStatus(text, type) {
    const value = String(text || "").trim();
    if (!value) return type === "收入" ? "未开票" : "未收票";
    if (value.includes("未收")) return "未收票";
    if (value.includes("已收")) return "已收票";
    if (value.includes("未开")) return "未开票";
    if (value.includes("已开") || value.includes("部分")) return value.includes("部分") ? "部分开票" : "已开票";
    return value;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function matchesQuery(values, query = state.query) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return values.some((value) => String(value ?? "").toLowerCase().includes(q));
  }

  function sheetKey(sheet) {
    return String(sheet?.id || sheet?.name || "");
  }

  function importSheets() {
    return state.parsedImport?.sheets || data.sheets || [];
  }

  function isImportSheetSelected(sheet) {
    const key = sheetKey(sheet);
    if (Object.prototype.hasOwnProperty.call(state.importSheetSelections, key)) {
      return state.importSheetSelections[key];
    }
    return sheet?.selected !== false;
  }

  function setImportSheetSelection(key, selected) {
    state.importSheetSelections[key] = selected;
    if (state.parsedImport?.sheets) {
      state.parsedImport.sheets = state.parsedImport.sheets.map((sheet) => sheetKey(sheet) === key ? { ...sheet, selected } : sheet);
    }
  }

  function resetImportSheetSelections(sheets = []) {
    state.importSheetSelections = {};
    sheets.forEach((sheet) => {
      state.importSheetSelections[sheetKey(sheet)] = sheet.selected !== false;
    });
  }

  function selectedImportSheets() {
    return importSheets().filter((sheet) => isImportSheetSelected(sheet));
  }

  function sourceHasSelectedSheet(source, selectedNames) {
    const parts = String(source || "").split("/").map((part) => part.trim()).filter(Boolean);
    return parts.some((part) => selectedNames.has(part));
  }

  function filteredParsedImport() {
    if (!state.parsedImport) return null;
    const sheets = selectedImportSheets();
    const selectedNames = new Set(sheets.map((sheet) => sheet.name));
    const ledger = state.parsedImport.ledger.filter((item) => sourceHasSelectedSheet(item.importedFrom, selectedNames));
    const payments = state.parsedImport.payments.filter((item) => sourceHasSelectedSheet(item.importedFrom || item.note, selectedNames));
    const invoices = state.parsedImport.invoices.filter((item) => sourceHasSelectedSheet(item.importedFrom || item.original, selectedNames));
    const projectTempIds = new Set([...ledger, ...payments, ...invoices].map((item) => item.projectTempId));
    const projects = state.parsedImport.projects.filter((project) => projectTempIds.has(project.tempId) || sourceHasSelectedSheet(project.importedFrom, selectedNames));
    const warnings = state.parsedImport.warnings.filter((warning) => selectedNames.has(String(warning.location || "").split("/")[0].trim()));
    return {
      ...state.parsedImport,
      sheets,
      projects,
      ledger,
      payments,
      invoices,
      warnings,
      rows: sheets.reduce((sum, sheet) => sum + Number(sheet.rows || 0), 0)
    };
  }

  function importDataRequired(message = "请先上传并解析 Excel 文件，再继续当前步骤。") {
    return `
      <div class="panel p-6 text-center">
        ${icon("file-spreadsheet", "mx-auto mb-3 h-9 w-9 text-zinc-500")}
        <h3 class="text-lg font-semibold">暂无可导入数据</h3>
        <p class="mt-2 text-sm text-zinc-500">${escapeHtml(message)}</p>
        <button class="btn btn-primary mt-5" data-route="import-upload">${icon("upload")}上传 Excel</button>
      </div>
    `;
  }

  function importWarningKey(warning, index) {
    return `${warning.location || "未知位置"}::${warning.message || "未知问题"}::${index}`;
  }

  function importWarningOptions(warning) {
    const message = String(warning.message || "");
    if (message.includes("未识别到台账明细字段")) {
      return ["已跳过该行", "返回源文件补齐后重新导入"];
    }
    if (message.includes("欠款金额")) {
      return ["仅作为校验参考", "返回源文件核对欠款后重新导入"];
    }
    if (message.includes("付款日期") && message.includes("付款金额为空")) {
      return ["导入后在收付款中补齐金额", "返回源文件补齐金额后重新导入"];
    }
    return ["确认后继续导入", "返回源文件核对后重新导入"];
  }

  function importWarningAction(warning, index) {
    const key = importWarningKey(warning, index);
    const options = importWarningOptions(warning);
    return state.importIssueActions[key] || options[0];
  }

  function parsedImportAmount(parsed) {
    return (parsed?.ledger || [])
      .filter((item) => item.type === "收入")
      .reduce((sum, item) => sum + calculateLedgerAmount(item), 0);
  }

  function chip(text, tone = "neutral") {
    const map = {
      green: "chip-green",
      amber: "chip-amber",
      red: "chip-red",
      blue: "chip-blue",
      neutral: ""
    };
    return `<span class="chip ${map[tone] || ""}">${escapeHtml(text)}</span>`;
  }

  function activeNav(route) {
    if (state.route === route) return true;
    if (route === "import" && state.route.startsWith("import")) return true;
    if (route === "projects" && state.route.includes("project")) return true;
    if (route === "grouping" && state.route.startsWith("grouping")) return true;
    if (route === "reports" && (state.route.startsWith("report") || state.route === "drilldown")) return true;
    if (route === "settings" && (state.route === "field-config" || state.route === "field-preview")) return true;
    return false;
  }

  function isLoading(key) {
    return state.loading.has(key);
  }

  function loadingText(key, label) {
    return isLoading(key) ? `${icon("loader-2", "icon animate-spin")}处理中` : label;
  }

  function metricHelp(labelText) {
    return METRIC_HELP[labelText] || "统计当前页面范围内已确认数据，不包含已删除记录。";
  }

  function helpIcon(labelText) {
    return `
      <span class="help-wrap" tabindex="0" aria-label="${escapeHtml(metricHelp(labelText))}">
        <span class="help-icon">?</span>
        <span class="tooltip">${escapeHtml(metricHelp(labelText))}</span>
      </span>
    `;
  }

  function helpLabel(labelText) {
    return `<span class="inline-flex items-center gap-1">${escapeHtml(labelText)}${helpIcon(labelText)}</span>`;
  }

  function pageHeader(title, desc, actions = "") {
    return `
      <div class="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="text-2xl font-semibold tracking-normal">${title}</h2>
          <p class="mt-1 max-w-3xl text-sm text-zinc-500">${desc}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">${actions}</div>
      </div>
    `;
  }

  function table(headers, rows, emptyText = "暂无数据") {
    return `
      <div class="table-wrap">
        <table>
          <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>
            ${rows.length ? rows.join("") : `<tr><td colspan="${headers.length}" class="text-center text-zinc-500">${emptyText}</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  function metricValue(metric) {
    return metric.money ? money(metric.value) : escapeHtml(metric.value);
  }

  function metricsGrid(metrics = data.metrics) {
    return `
      <div class="grid gap-3 md:grid-cols-4">
        ${metrics.map((m) => `
          <div class="metric">
            <div class="flex items-center justify-between gap-2">
              <span class="flex items-center gap-1 text-sm text-zinc-500">${m.label}${helpIcon(m.label)}</span>
              ${chip(m.change, m.tone === "up" ? "green" : m.tone === "warn" ? "amber" : m.tone === "down" ? "red" : "neutral")}
            </div>
            <div class="mt-3 text-2xl font-semibold">${metricValue(m)}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function topbar() {
    return `
      <header class="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 px-6 py-3 backdrop-blur">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <div class="text-xs text-zinc-500">当前页面</div>
            <h1 class="text-lg font-semibold tracking-normal">${routes[state.route] || "MVP 页面"}</h1>
          </div>
          <div class="flex min-w-0 items-center gap-2">
            <input class="hidden h-9 w-80 rounded-lg border border-zinc-200 bg-white px-3 text-sm md:block" data-global-search placeholder="搜索项目、客户、供应商、发票号" value="${escapeHtml(state.query)}">
            <button class="btn" data-route="import">${icon("upload")}导入</button>
            <button class="btn btn-primary" data-route="reports">${icon("bar-chart-3")}查看报表</button>
          </div>
        </div>
      </header>
    `;
  }

  function layout(content) {
    return `
      <div class="app-shell">
        <aside class="sidebar p-4">
          <div class="flex items-center gap-3 px-2 py-2">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white">${icon("factory", "h-5 w-5")}</div>
            <div>
              <div class="text-sm font-semibold">项目财务台账</div>
              <div class="text-xs text-zinc-500">MVP ${APP_VERSION} · LocalStorage</div>
            </div>
          </div>
          <nav class="mt-6 space-y-1">
            ${nav.map((item) => `
              <button class="nav-link ${activeNav(item.route) ? "active" : ""}" data-route="${item.route}">
                ${icon(item.icon)}
                <span>${item.label}</span>
              </button>
            `).join("")}
          </nav>
          <div class="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
            <div class="mb-2 font-medium text-zinc-900">MVP 数据流</div>
            <p>当前数据来自统一 localStorage 数据层；新增、编辑、删除、日志和刷新保持均已接入。</p>
          </div>
        </aside>
        <main class="main">
          ${topbar()}
          <section class="mx-auto max-w-7xl px-6 py-6">${content}</section>
        </main>
        ${state.modal ? renderModal() : ""}
        ${state.confirm ? renderConfirm() : ""}
        ${state.toast ? renderToast() : ""}
      </div>
    `;
  }

  function renderToast() {
    const tone = state.toast.type === "error" ? "toast-error" : "toast-success";
    const iconName = state.toast.type === "error" ? "x-circle" : "check-circle";
    return `<div class="toast ${tone}">${icon(iconName, "inline h-4 w-4")} ${escapeHtml(state.toast.message)}</div>`;
  }

  function renderSkeleton() {
    return `
      <div class="space-y-3">
        <div class="skeleton h-16"></div>
        <div class="skeleton h-44"></div>
        <div class="skeleton h-36"></div>
      </div>
    `;
  }

  function renderDashboard() {
    const tasks = [
      ["字段映射待确认", "付款日期2、备注说明", "导入修正", "import-errors"],
      ["未归集项目", `${data.projects.filter((p) => p.group === "未归集").length} 个项目`, "去归集", "grouping-ungrouped"],
      ["发票待处理", `${data.invoices.filter((i) => i.status.includes("未")).length} 条记录`, "查看发票", "project-detail"],
      ["供应商统计核对", "查看供应商关联项目毛利", "看报表", "reports"]
    ];
    return `
      ${pageHeader("工作台", "围绕导入、核对、归集、报表的第一版工作闭环。", `
        <button class="btn" data-route="field-config">${icon("sliders-horizontal")}字段配置</button>
        <button class="btn btn-primary" data-route="import">${icon("upload-cloud")}开始导入</button>
      `)}
      ${metricsGrid()}
      <div class="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.95fr]">
        <div class="panel p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-semibold">待处理事项</h3>
            <button class="btn" data-route="reports">${icon("arrow-up-right")}查看全部</button>
          </div>
          <div class="space-y-2">
            ${tasks.map((t) => `
              <button class="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 text-left hover:bg-zinc-50" data-route="${t[3]}">
                <span>
                  <span class="block text-sm font-medium">${t[0]}</span>
                  <span class="text-xs text-zinc-500">${t[1]}</span>
                </span>
                <span class="text-xs font-medium text-zinc-900">${t[2]}</span>
              </button>
            `).join("")}
          </div>
        </div>
        <div class="panel p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-semibold">最近操作日志</h3>
            <button class="btn" data-route="settings">${icon("list")}日志</button>
          </div>
          <div class="space-y-2">
            ${(data.logs.slice(0, 5).length ? data.logs.slice(0, 5) : [{ time: "-", module: "系统", type: "初始化", object: "本地数据", result: "成功" }]).map((log) => `
              <div class="rounded-lg border border-zinc-200 bg-white p-3 text-xs">
                <div class="flex items-center justify-between">
                  <span class="font-medium">${log.module} · ${log.type}</span>
                  ${chip(log.result, log.result === "失败" ? "red" : "green")}
                </div>
                <div class="mt-1 text-zinc-500">${log.time} · ${log.object}${log.reason ? ` · ${log.reason}` : ""}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
      <div class="mt-5">
        <h3 class="mb-3 font-semibold">最近导入</h3>
        ${table(["批次", "文件", "Sheet", "状态", helpLabel(label("ledgerAmount")), "行数", "操作"], data.imports.map((i) => `
          <tr>
            <td class="font-medium">${i.id}</td>
            <td>${escapeHtml(i.file)}</td>
            <td>${i.sheets}</td>
            <td>${chip(i.status, i.status === "已完成" ? "green" : i.status === "有警告" ? "amber" : "blue")}</td>
            <td>${money(i.amount)}</td>
            <td>${i.rows}</td>
            <td class="space-x-1">
              <button class="btn" data-route="import-result">${icon("eye")}查看</button>
              <button class="btn btn-danger" data-delete="import" data-id="${i.id}" data-name="${escapeHtml(i.file)}">${icon("trash-2")}删除</button>
            </td>
          </tr>
        `))}
      </div>
    `;
  }

  function renderImport() {
    if (state.route === "import") return renderImportHome();
    return `
      ${pageHeader("Excel 导入向导", "保留原型流程；确认导入会写入导入批次和操作日志。", `
        <button class="btn" data-route="import">${icon("list")}历史批次</button>
        <button class="btn btn-primary" data-next-step>${icon("arrow-right")}下一步</button>
      `)}
      ${renderStepper()}
      <div class="mt-5">${renderImportStep()}</div>
    `;
  }

  function renderImportHome() {
    return `
      ${pageHeader("Excel 导入", "查看历史导入批次，或开始一次新的台账导入。", `
        <button class="btn btn-primary" data-route="import-upload">${icon("upload-cloud")}导入 Excel</button>
      `)}
      ${table(["批次", "文件", "Sheet", "状态", helpLabel(label("ledgerAmount")), "警告", "创建时间", "操作"], data.imports.map((i) => `
        <tr>
          <td class="font-medium">${i.id}</td>
          <td>${escapeHtml(i.file)}</td>
          <td>${i.sheets}</td>
          <td>${chip(i.status, i.status === "已完成" ? "green" : i.status === "有警告" ? "amber" : "blue")}</td>
          <td>${money(i.amount)}</td>
          <td>${i.warnings}</td>
          <td>${i.createdAt || "-"}</td>
          <td class="space-x-1">
            <button class="btn" data-route="import-result">${icon("arrow-up-right")}结果</button>
            <button class="btn btn-danger" data-delete="import" data-id="${i.id}" data-name="${escapeHtml(i.file)}">${icon("trash-2")}删除</button>
          </td>
        </tr>
      `))}
    `;
  }

  function renderStepper() {
    const idx = importSteps.findIndex((s) => s[0] === state.route);
    return `
      <div class="panel flex flex-wrap items-center gap-3 p-3">
        ${importSteps.map((s, i) => `
          <button class="step ${i === idx ? "active" : ""}" data-route="${s[0]}">
            <span class="step-dot">${i + 1}</span>
            <span>${s[1]}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderImportStep() {
    const rawParsed = state.parsedImport;
    const parsed = filteredParsedImport();
    if (isLoading("import")) return renderSkeleton();
    if (state.route === "import-upload") {
      return `
        <div class="panel grid gap-5 p-6 lg:grid-cols-[1fr_0.8fr]">
          <div class="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
            ${icon("file-spreadsheet", "mb-4 h-10 w-10 text-zinc-500")}
            <div class="text-lg font-semibold">选择表格文件</div>
            <p class="mt-2 text-sm text-zinc-500">支持 .xlsx、.xls、.csv、.tsv，解析后可预览项目、台账、收付款和发票。</p>
            <label class="btn btn-primary mt-5 cursor-pointer">
              ${icon("upload")}选择文件
              <input class="hidden" type="file" data-import-file accept=".xlsx,.xls,.csv,.tsv">
            </label>
            <div class="mt-3 text-xs text-zinc-500">${isLoading("parse-import") ? "正在解析文件..." : parsed ? `已解析：${escapeHtml(parsed.fileName)}` : "选择文件后自动进入导入预览"}</div>
          </div>
          <div>
            <h3 class="font-semibold">导入前提醒</h3>
            <ul class="mt-3 space-y-2 text-sm text-zinc-600">
              <li>• 每个工作表会按原始项目导入，不在导入流程中做项目归集。</li>
              <li>• 未识别字段可在字段配置中维护映射，或作为备注信息保留。</li>
              <li>• 原始文件、工作表、行号会在导入来源中保留。</li>
              <li>• 若没有项目名称，会使用工作表名称作为项目名称。</li>
            </ul>
          </div>
        </div>
      `;
    }
    if (state.route === "import-sheets") {
      const sheets = importSheets();
      const selectedCount = selectedImportSheets().length;
      return `
        <div class="panel mb-3 flex flex-wrap items-center justify-between gap-3 p-3">
          <div class="text-sm text-zinc-500">已选择 ${selectedCount} / ${sheets.length} 个 Sheet</div>
          <div class="flex gap-2">
            <button class="btn" data-action="select-all-sheets">${icon("check-square")}全选</button>
            <button class="btn" data-action="clear-all-sheets">${icon("square")}取消全选</button>
          </div>
        </div>
        ${table(["选择", "工作表名称", "识别类型", "行数", "状态"], sheets.map((s) => {
          const selected = isImportSheetSelected(s);
          return `
            <tr>
              <td><input type="checkbox" data-import-sheet="${escapeHtml(sheetKey(s))}" ${selected ? "checked" : ""}></td>
              <td class="font-medium">${escapeHtml(s.name)}</td>
              <td>${s.detected}</td>
              <td>${s.rows}</td>
              <td>${chip(selected ? "本次导入" : "暂不导入", selected ? "blue" : "neutral")}</td>
            </tr>
          `;
        }))}
      `;
    }
    if (state.route === "import-mapping") {
      const mappings = rawParsed?.mappings || data.mappings;
      return table(["表格列", "系统字段", "置信度", "处理", "操作"], mappings.map((m) => `
        <tr>
          <td class="font-medium">${escapeHtml(m.excel)}</td>
          <td>${escapeHtml(m.system)}</td>
          <td>${chip(m.confidence, m.confidence === "高" ? "green" : m.confidence === "中" ? "amber" : "blue")}</td>
          <td>${m.action}</td>
          <td><button class="btn" data-modal="mapping" data-edit-mapping="${escapeHtml(m.id || "")}" data-edit-mapping-excel="${escapeHtml(m.excel)}">${icon("settings-2")}调整</button></td>
        </tr>
      `));
    }
    if (state.route === "import-preview") {
      if (parsed) {
        return `
          ${metricsGrid([
            { label: "将创建项目", value: parsed.projects.length, change: `${parsed.sheets.length} 个工作表`, tone: "neutral" },
            { label: "台账明细", value: parsed.ledger.length, change: "可导入", tone: "up" },
            { label: "收付款记录", value: parsed.payments.length, change: parsed.warnings.length ? `${parsed.warnings.length} 条提示` : "已识别", tone: parsed.warnings.length ? "warn" : "up" },
            { label: "发票记录", value: parsed.invoices.length, change: "按发票情况生成", tone: "neutral" }
          ])}
          <div class="mt-5">${table(["文件", "Sheet", "行数", "状态"], parsed.sheets.map((s) => `
            <tr>
              <td>${escapeHtml(parsed.fileName)}</td>
              <td class="font-medium">${escapeHtml(s.name)}</td>
              <td>${s.rows}</td>
              <td>${chip("本次导入", "blue")}</td>
            </tr>
          `), "暂无已选择 Sheet")}</div>
          <div class="mt-5">${table(["项目", "客户", "台账明细", "收付款", "发票", "来源"], parsed.projects.map((p) => `
            <tr>
              <td class="font-medium">${escapeHtml(p.name)}</td>
              <td>${escapeHtml(p.customer)}</td>
              <td>${parsed.ledger.filter((item) => item.projectTempId === p.tempId).length}</td>
              <td>${parsed.payments.filter((item) => item.projectTempId === p.tempId).length}</td>
              <td>${parsed.invoices.filter((item) => item.projectTempId === p.tempId).length}</td>
              <td>${escapeHtml(p.importedFrom)}</td>
            </tr>
          `), "未解析到项目")}</div>
          <div class="mt-5">${table(["收支方向", "往来单位", "品名", "数量", "单价", helpLabel(label("ledgerAmount")), "来源"], parsed.ledger.map((item) => `
            <tr>
              <td>${chip(item.type, item.type === "收入" ? "green" : "amber")}</td>
              <td>${escapeHtml(item.partner)}</td>
              <td class="font-medium">${escapeHtml(item.item)}</td>
              <td>${item.qty}</td>
              <td>${money(item.price)}</td>
              <td>${money(calculateLedgerAmount(item))}</td>
              <td>${escapeHtml(item.importedFrom)}</td>
            </tr>
          `), "未解析到台账明细")}</div>
          <div class="mt-5">${table(["方向", "往来单位", "日期", helpLabel(label("paymentAmount")), "状态", "来源"], parsed.payments.map((item) => `
            <tr>
              <td>${chip(item.direction, item.direction === "收款" ? "green" : "amber")}</td>
              <td>${escapeHtml(item.partner)}</td>
              <td>${escapeHtml(item.date || "-")}</td>
              <td>${money(item.amount)}</td>
              <td>${escapeHtml(item.status)}</td>
              <td>${escapeHtml(item.importedFrom || item.note)}</td>
            </tr>
          `), "未解析到收付款记录")}</div>
          <div class="mt-5">${table(["类型", "往来单位", "发票号", "日期", helpLabel(label("invoiceAmount")), "状态", "来源"], parsed.invoices.map((item) => `
            <tr>
              <td>${chip(item.type, item.type === "开票" ? "green" : "amber")}</td>
              <td>${escapeHtml(item.partner)}</td>
              <td>${escapeHtml(item.no || "-")}</td>
              <td>${escapeHtml(item.date || "-")}</td>
              <td>${money(item.amount)}</td>
              <td>${escapeHtml(item.status)}</td>
              <td>${escapeHtml(item.importedFrom || item.original)}</td>
            </tr>
          `), "未解析到发票记录")}</div>
          <div class="mt-5">${table(["级别", "位置", "问题", "处理建议"], parsed.warnings.map((w) => `
            <tr><td>${chip(w.level, w.level === "错误" ? "red" : "amber")}</td><td>${escapeHtml(w.location)}</td><td>${escapeHtml(w.message)}</td><td>${escapeHtml(w.suggestion)}</td></tr>
          `), "暂无需要处理的问题")}</div>
        `;
      }
      return importDataRequired("导入预览只展示本次上传并解析出的真实数据。");
    }
    if (state.route === "import-errors") {
      if (!parsed) return importDataRequired("修正页只处理本次上传文件解析出的真实问题。");
      return `
        ${metricsGrid([
          { label: "待处理问题", value: parsed.warnings.length, change: parsed.warnings.length ? "来自解析结果" : "暂无问题", tone: parsed.warnings.length ? "warn" : "up" },
          { label: "已选择 Sheet", value: parsed.sheets.length, change: "本次导入", tone: "neutral" },
          { label: "台账明细", value: parsed.ledger.length, change: "可继续导入", tone: "up" },
          { label: "收付款记录", value: parsed.payments.length, change: "含待核对项", tone: parsed.payments.some((item) => item.status === "待核对") ? "warn" : "neutral" }
        ])}
        <div class="mt-5">${table(["位置", "问题", "当前处理建议", "处理"], parsed.warnings.map((w, index) => {
          const options = importWarningOptions(w);
          const selected = importWarningAction(w, index);
          return `
            <tr>
              <td>${escapeHtml(parsed.fileName)} / ${escapeHtml(w.location)}</td>
              <td><div class="font-medium">${escapeHtml(w.message)}</div><div class="text-xs text-zinc-500">${escapeHtml(w.level)}</div></td>
              <td>${escapeHtml(w.suggestion || "-")}</td>
              <td>
                <select class="rounded-lg border border-zinc-200 px-2 py-1 text-sm" data-import-warning-action="${escapeHtml(importWarningKey(w, index))}">
                  ${options.map((option) => `<option ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
                </select>
              </td>
            </tr>
          `;
        }), "暂无需要修正的问题")}</div>
      `;
    }
    if (state.route === "import-confirm") {
      if (parsed) {
        return `
          <div class="panel p-6">
            <h3 class="text-lg font-semibold">确认写入系统</h3>
            <p class="mt-2 text-sm text-zinc-500">确认后会把解析出的项目、台账明细、收付款和发票写入系统，并生成导入批次。</p>
            <div class="mt-5 grid gap-3 md:grid-cols-4">
              <div class="rounded-lg border border-zinc-200 p-4"><div class="text-sm text-zinc-500">导入文件</div><div class="mt-1 font-medium">${escapeHtml(parsed.fileName)}</div></div>
              <div class="rounded-lg border border-zinc-200 p-4"><div class="text-sm text-zinc-500">项目</div><div class="mt-1 font-medium">${parsed.projects.length} 个</div></div>
              <div class="rounded-lg border border-zinc-200 p-4"><div class="text-sm text-zinc-500">台账明细</div><div class="mt-1 font-medium">${parsed.ledger.length} 条</div></div>
              <div class="rounded-lg border border-zinc-200 p-4"><div class="text-sm text-zinc-500">提示</div><div class="mt-1 font-medium">${parsed.warnings.length} 条</div></div>
            </div>
            <div class="mt-5">${table(["Sheet", "行数", "状态"], parsed.sheets.map((s) => `
              <tr>
                <td class="font-medium">${escapeHtml(s.name)}</td>
                <td>${s.rows}</td>
                <td>${chip("将导入", "blue")}</td>
              </tr>
            `), "暂无已选择 Sheet")}</div>
            <div class="mt-5">${table(["问题", "处理"], parsed.warnings.map((w, index) => `
              <tr>
                <td><div class="font-medium">${escapeHtml(w.message)}</div><div class="text-xs text-zinc-500">${escapeHtml(w.location)}</div></td>
                <td>${escapeHtml(importWarningAction(w, index))}</td>
              </tr>
            `), "暂无需要处理的问题")}</div>
            <div class="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              本次确认后将写入 ${parsed.projects.length} 个项目、${parsed.ledger.length} 条台账明细、${parsed.payments.length} 条收付款记录、${parsed.invoices.length} 条发票记录；台账金额按数量 × 单价计算，本次收入台账金额为 ${money(parsedImportAmount(parsed))}。
            </div>
            <button class="btn btn-primary mt-6" data-action="confirm-import" ${isLoading("import") ? "disabled" : ""}>${loadingText("import", `${icon("check")}确认导入`)}</button>
          </div>
        `;
      }
      return importDataRequired("确认页只确认本次上传文件解析出的真实项目、台账、收付款和发票。");
    }
    const latestImport = data.imports[0];
    if (!latestImport) return importDataRequired("暂无导入结果，请先完成一次 Excel 导入。");
    return `
      ${metricsGrid([
        { label: "导入批次", value: latestImport.id, change: latestImport.file, tone: "neutral" },
        { label: "导入行数", value: latestImport.rows || 0, change: `${latestImport.sheets || 0} 个 Sheet`, tone: "up" },
        { label: "警告", value: latestImport.warnings || 0, change: latestImport.warnings ? "需后续核对" : "暂无", tone: latestImport.warnings ? "warn" : "up" },
        { label: "本次台账金额", value: latestImport.amount || 0, change: "已汇总", tone: "neutral", money: true }
      ])}
      <div class="mt-5 flex gap-2">
        <button class="btn btn-primary" data-route="project-detail">${icon("folder-open")}进入项目详情核对</button>
        <button class="btn" data-route="grouping-ungrouped">${icon("git-merge")}处理未归集</button>
      </div>
    `;
  }

  function buildImportMappings(headers) {
    const used = new Set();
    const maintained = data.mappings || [];
    return headers.filter(Boolean).map((header) => {
      const saved = maintained.find((item) => normalizeHeader(item.excel) === normalizeHeader(header));
      if (saved) {
        return { ...saved, id: `MAP-${header}`, excel: header, confidence: "高", action: "维护映射" };
      }
      let system = "自定义字段";
      Object.entries(IMPORT_ALIASES).forEach(([key, aliases]) => {
        if (used.has(header)) return;
        const normalized = normalizeHeader(header);
        if (aliases.map(normalizeHeader).some((alias) => headerMatchesAlias(normalized, alias))) {
          const labelMap = {
            projectName: "项目名称",
            customer: "客户",
            partner: "往来单位",
            type: "收支方向",
            biz: "业务类型",
            item: "品名",
            material: "材质",
            spec: "规格",
            model: "型号",
            unit: "单位",
            qty: "数量",
            weight: "重量",
            price: "单价",
            amount: "台账金额",
            signed: "签订日期",
            paymentDate: "付款日期",
            paymentAmount: "收付款金额",
            delivery: "到货日期",
            invoice: "发票情况",
            invoiceDate: "发票日期",
            invoiceNo: "发票号",
            drawing: "图号"
          };
          system = labelMap[key] || "自定义字段";
          used.add(header);
        }
      });
      if (system === "自定义字段" && normalizeHeader(header).includes("欠款")) system = "欠款金额（仅校验）";
      return { id: `MAP-${header}`, excel: header, system, confidence: system === "自定义字段" ? "中" : "高", action: system === "自定义字段" ? "作为备注保留" : "自动匹配" };
    });
  }

  function detectHeaderRow(rows) {
    const known = Object.values(IMPORT_ALIASES).flat().map(normalizeHeader);
    const index = rows.findIndex((row) => row.filter(Boolean).some((cell) => known.includes(normalizeHeader(cell))));
    return index >= 0 ? index : 0;
  }

  function parseWorkbookRows(workbook, fileName) {
    const projects = new Map();
    const ledger = [];
    const payments = [];
    const invoices = [];
    const warnings = [];
    const sheets = [];
    const allHeaders = new Set();
    let totalRows = 0;

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
      if (!rows.length) return;
      const headerRowIndex = detectHeaderRow(rows);
      const headers = rows[headerRowIndex].map(normalizeHeader);
      headers.forEach((header) => header && allHeaders.add(header));
      const bodyRows = rows.slice(headerRowIndex + 1).filter((row) => row.some((cell) => String(cell ?? "").trim()));
      sheets.push({ id: `S-${sheetName}`, name: sheetName, rows: bodyRows.length, detected: "项目台账", selected: true });
      totalRows += bodyRows.length;

      bodyRows.forEach((row, index) => {
        const rowObject = {};
        headers.forEach((header, cellIndex) => {
          if (!header) return;
          if (rowObject[header] === undefined) rowObject[header] = row[cellIndex];
          else if (Array.isArray(rowObject[header])) rowObject[header].push(row[cellIndex]);
          else rowObject[header] = [rowObject[header], row[cellIndex]];
        });
        rowObject.__mapped = {};
        (data.mappings || []).forEach((mapping) => {
          const key = systemFieldKey(mapping.system);
          if (!key || key === "ignore" || key === "custom") return;
          const value = rowObject[normalizeHeader(mapping.excel)];
          if (value === undefined) return;
          rowObject.__mapped[key] = rowObject.__mapped[key] || [];
          const list = Array.isArray(value) ? value : [value];
          rowObject.__mapped[key].push(...list);
        });
        const rowNo = headerRowIndex + index + 2;
        const projectName = String(pickImportValue(rowObject, "projectName") || sheetName).trim();
        const customer = String(pickImportValue(rowObject, "customer") || pickImportValue(rowObject, "partner") || "未识别客户").trim();
        const tempId = `${projectName}::${customer}`;
        const invoiceText = String(pickImportValue(rowObject, "invoice") || "");
        const importedFrom = `${fileName} / ${sheetName} / 行 ${rowNo}`;

        if (!projects.has(tempId)) {
          projects.set(tempId, {
            tempId,
            name: projectName,
            customer,
            group: "未归集",
            status: "交付中",
            signed: formatImportDate(pickImportValue(rowObject, "signed")),
            delivery: formatImportDate(pickImportValue(rowObject, "delivery")),
            invoice: normalizeInvoiceStatus(invoiceText, "收入"),
            importedFrom
          });
        }

        const itemName = String(pickImportValue(rowObject, "item") || "").trim();
        const qtyValue = toNumber(pickImportValue(rowObject, "qty"));
        const priceValue = toNumber(pickImportValue(rowObject, "price"));
        const amountValue = toNumber(pickImportValue(rowObject, "amount"));
        const debtValue = toNumber(pickImportValue(rowObject, "debtAmount"));
        const hasLedgerData = itemName || qtyValue || priceValue || amountValue;
        if (!hasLedgerData) {
          warnings.push({ level: "警告", location: `${sheetName} / 行 ${rowNo}`, message: "未识别到台账明细字段", suggestion: "已跳过该行" });
          return;
        }

        const type = normalizeImportDirection(rowObject);
        const qty = qtyValue || 1;
        const price = priceValue || (amountValue ? amountValue / qty : 0);
        const material = String(pickImportValue(rowObject, "material") || "").trim();
        const spec = String(pickImportValue(rowObject, "spec") || "").trim();
        const model = String(pickImportValue(rowObject, "model") || "").trim();
        const specText = [material, spec, model].filter(Boolean).join(" / ");
        const record = {
          projectTempId: tempId,
          type,
          biz: normalizeImportBiz(rowObject, type),
          partner: String(pickImportValue(rowObject, "partner") || customer).trim(),
          item: itemName || "未命名明细",
          spec: specText,
          unit: String(pickImportValue(rowObject, "unit") || "").trim(),
          qty,
          weight: String(pickImportValue(rowObject, "weight") || "").trim(),
          price,
          amount: qty * price,
          date: formatImportDate(pickImportValue(rowObject, "signed")) || formatImportDate(pickImportValue(rowObject, "delivery")),
          invoice: normalizeInvoiceStatus(invoiceText, type),
          drawing: String(pickImportValue(rowObject, "drawing") || "").trim(),
          importedFrom
        };
        ledger.push(record);

        if (debtValue) {
          const calculatedBeforePayments = calculateLedgerAmount(record);
          warnings.push({
            level: "警告",
            location: `${sheetName} / 行 ${rowNo}`,
            message: `表格欠款金额为 ${money(debtValue)}，系统欠款金额会按台账金额和收付款流水重新计算`,
            suggestion: `该列仅作为校验参考，不写入台账金额；本行台账金额为 ${money(calculatedBeforePayments)}`
          });
        }

        const paymentAmounts = collectImportValues(rowObject, "paymentAmount");
        const paymentDates = collectImportValues(rowObject, "paymentDate");
        const paymentCount = Math.max(paymentAmounts.length, paymentDates.length);
        for (let paymentIndex = 0; paymentIndex < paymentCount; paymentIndex += 1) {
          const paymentAmount = toNumber(paymentAmounts[paymentIndex]);
          const paymentDate = formatImportDate(paymentDates[paymentIndex]);
          if (!paymentAmount && !paymentDate) continue;
          payments.push({
            projectTempId: tempId,
            direction: type === "收入" ? "收款" : "付款",
            partner: record.partner,
            date: paymentDate,
            amount: paymentAmount,
            status: paymentAmount ? "已确认" : "待核对",
            importedFrom,
            note: importedFrom
          });
          if (!paymentAmount) warnings.push({ level: "警告", location: `${sheetName} / 行 ${rowNo}`, message: "存在付款日期但付款金额为空", suggestion: "导入后在收付款中补齐金额" });
        }

        if (invoiceText || pickImportValue(rowObject, "invoiceNo") || pickImportValue(rowObject, "invoiceDate")) {
          invoices.push({
            projectTempId: tempId,
            type: type === "收入" ? "开票" : "收票",
            partner: record.partner,
            no: String(pickImportValue(rowObject, "invoiceNo") || "").trim(),
            date: formatImportDate(pickImportValue(rowObject, "invoiceDate")),
            amount: calculateLedgerAmount(record),
            status: record.invoice,
            importedFrom,
            original: invoiceText || record.invoice
          });
        }
      });
    });

    return {
      fileName,
      sheets,
      mappings: buildImportMappings(Array.from(allHeaders)),
      projects: Array.from(projects.values()),
      ledger,
      payments,
      invoices,
      warnings,
      rows: totalRows
    };
  }

  async function parseImportFile(file) {
    if (!file) return;
    if (!window.XLSX) {
      toastError("解析组件加载失败，请检查网络后重试");
      return;
    }
    state.loading.add("parse-import");
    render();
    try {
      const buffer = await file.arrayBuffer();
      const workbook = window.XLSX.read(buffer, { type: "array", cellDates: true });
      const parsed = parseWorkbookRows(workbook, file.name);
      if (!parsed.projects.length && !parsed.ledger.length) throw new Error("未解析到可导入的数据");
      state.parsedImport = parsed;
      state.importIssueActions = {};
      resetImportSheetSelections(parsed.sheets);
      state.loading.delete("parse-import");
      toastSuccess("解析成功");
      setRoute("import-preview");
    } catch (error) {
      state.loading.delete("parse-import");
      toastError(error.message || "文件解析失败，请检查表头和格式");
      render();
    }
  }

  function filterProjects() {
    const q = state.query.trim().toLowerCase();
    if (!q) return data.projects;
    return data.projects.filter((p) => [p.name, p.customer, p.group, p.status].some((field) => String(field).toLowerCase().includes(q)));
  }

  function renderProjects() {
    if (state.route === "project-detail") return renderProjectDetail();
    const projects = filterProjects();
    return `
      ${pageHeader("项目台账", "从项目、客户、供应商、状态、日期、欠款状态快速进入项目详情。", `
        <button class="btn" data-route="import">${icon("upload")}导入</button>
        <button class="btn btn-primary" data-modal="project">${icon("plus")}新建项目</button>
      `)}
      <div class="mb-3 flex flex-wrap gap-2">
        <input class="h-9 w-72 rounded-lg border border-zinc-200 px-3 text-sm" data-global-search placeholder="搜索项目、客户或供应商" value="${escapeHtml(state.query)}">
        ${chip("状态：全部")}
        ${chip("欠款金额：全部")}
        ${chip("日期：本年")}
      </div>
      ${table([label("projectName"), label("customer"), label("groupingProject"), label("status"), helpLabel(label("income")), helpLabel(label("expense")), helpLabel(label("receivable")), helpLabel(label("payable")), label("invoiceStatus"), label("operation")], projects.map((p) => `
        <tr>
          <td class="row-click" data-open-project="${p.id}"><div class="font-medium">${escapeHtml(p.name)}</div><div class="text-xs text-zinc-500">${p.id}</div></td>
          <td>${escapeHtml(p.customer)}</td>
          <td>${escapeHtml(p.group || "未归集")}</td>
          <td>${chip(p.status, p.status === "已交付" ? "green" : p.status === "待收款" ? "amber" : "blue")}</td>
          <td>${money(p.income)}</td>
          <td>${money(p.expense)}</td>
          <td>${money(p.receivable)}</td>
          <td>${money(p.payable)}</td>
          <td>${escapeHtml(p.invoice)}</td>
          <td class="space-x-1">
            <button class="btn" data-modal="project" data-edit-project="${p.id}">${icon("pencil")}编辑</button>
            <button class="btn btn-danger" data-delete="project" data-id="${p.id}" data-name="${escapeHtml(p.name)}">${icon("trash-2")}删除</button>
          </td>
        </tr>
      `))}
    `;
  }

  function selectedProject() {
    return data.projects.find((p) => p.id === state.selectedProjectId) || data.projects[0];
  }

  function projectChildren(collection) {
    const project = selectedProject();
    return project ? data[collection].filter((item) => item.projectId === project.id) : [];
  }

  function renderProjectDetail() {
    const p = selectedProject();
    if (!p) {
      return pageHeader("项目详情", "暂无项目，请先新建项目。", `<button class="btn btn-primary" data-modal="project">${icon("plus")}新建项目</button>`);
    }
    const tabs = [["ledger", "台账明细"], ["payments", "收付款"], ["invoices", "发票"], ["source", "导入来源"]];
    return `
      ${pageHeader(escapeHtml(p.name), `${escapeHtml(p.customer)} · ${escapeHtml(p.group || "未归集")} · ${escapeHtml(p.status)}`, `
        <button class="btn" data-route="projects">${icon("arrow-left")}返回列表</button>
        <button class="btn" data-modal="project" data-edit-project="${p.id}">${icon("pencil")}编辑项目</button>
        <button class="btn btn-primary" data-modal="ledger">${icon("plus")}新增明细</button>
      `)}
      ${metricsGrid([
        { label: "收入", value: p.income, change: "销售", tone: "up", money: true },
        { label: "支出", value: p.expense, change: "采购", tone: "warn", money: true },
        { label: "毛利", value: p.profit, change: p.income ? `${((p.profit / p.income) * 100).toFixed(1)}%` : "0%", tone: "up", money: true },
        { label: "欠款金额", value: p.receivable + p.payable, change: "需跟进", tone: p.receivable + p.payable ? "down" : "up", money: true }
      ])}
      <div class="panel mt-5">
        <div class="flex items-center gap-5 border-b border-zinc-200 px-4">
          ${tabs.map((t) => `<button class="tab ${state.projectTab === t[0] ? "active" : ""}" data-project-tab="${t[0]}">${t[1]}</button>`).join("")}
        </div>
        <div class="p-4">${renderProjectTab(p)}</div>
      </div>
    `;
  }

  function renderProjectTab(project) {
    if (state.projectTab === "payments") return renderPaymentsTab();
    if (state.projectTab === "invoices") return renderInvoicesTab();
    if (state.projectTab === "source") {
      return table(["数据对象", "Excel 文件", "Sheet", "行号", "状态"], [
        `<tr><td>项目</td><td>${escapeHtml(project.importedFrom.split("/")[0] || project.importedFrom)}</td><td>${escapeHtml(project.importedFrom.split("/")[1] || "-")}</td><td>${escapeHtml(project.importedFrom.split("/")[2] || "-")}</td><td>${chip("已追溯", "green")}</td></tr>`,
        `<tr><td>台账明细</td><td>${escapeHtml(project.importedFrom.split("/")[0] || project.importedFrom)}</td><td>${escapeHtml(project.importedFrom.split("/")[1] || "-")}</td><td>多行</td><td>${chip("已追溯", "green")}</td></tr>`
      ]);
    }
    return renderLedgerTab();
  }

  function renderLedgerTab() {
    const rows = projectChildren("ledger");
    return `
      <div class="mb-3 flex justify-between">
        <div class="flex gap-2">${chip("图号可筛选", "blue")}${chip("自定义字段显示")}</div>
        <button class="btn btn-primary" data-modal="ledger">${icon("plus")}新增明细</button>
      </div>
      ${table([label("entryDirection"), label("businessType"), label("counterparty"), label("itemName"), label("spec"), label("quantity"), label("unitPrice"), helpLabel(label("ledgerAmount")), label("invoiceStatus"), label("operation")], rows.map((r) => `
        <tr>
          <td>${chip(r.type, r.type === "收入" ? "green" : "amber")}</td>
          <td>${escapeHtml(r.biz)}</td>
          <td>${escapeHtml(r.partner)}</td>
          <td>${escapeHtml(r.item)}</td>
          <td>${escapeHtml(r.spec)}</td>
          <td>${r.qty}</td>
          <td>${money(r.price)}</td>
          <td>${money(r.amount)}</td>
          <td>${escapeHtml(r.invoice)}</td>
          <td class="space-x-1">
            <button class="btn" data-modal="ledger" data-edit-ledger="${r.id}">${icon("pencil")}编辑</button>
            <button class="btn btn-danger" data-delete="ledger" data-id="${r.id}" data-name="${escapeHtml(r.item)}">${icon("trash-2")}删除</button>
          </td>
        </tr>
      `), "暂无台账明细")}
    `;
  }

  function renderPaymentsTab() {
    const rows = projectChildren("payments");
    return `
      <div class="mb-3 flex justify-end"><button class="btn btn-primary" data-modal="payment">${icon("plus")}新增收付款</button></div>
      ${table([label("direction"), label("counterparty"), "日期", helpLabel(label("paymentAmount")), label("status"), "备注", label("operation")], rows.map((r) => `
        <tr>
          <td>${chip(r.direction, r.direction === "收款" ? "green" : "amber")}</td>
          <td>${escapeHtml(r.partner)}</td>
          <td>${escapeHtml(r.date)}</td>
          <td>${money(r.amount)}</td>
          <td>${escapeHtml(r.status)}</td>
          <td>${escapeHtml(r.note)}</td>
          <td class="space-x-1">
            <button class="btn" data-modal="payment" data-edit-payment="${r.id}">${icon("pencil")}编辑</button>
            <button class="btn btn-danger" data-delete="payment" data-id="${r.id}" data-name="${escapeHtml(r.partner)} ${money(r.amount)}">${icon("trash-2")}删除</button>
          </td>
        </tr>
      `), "暂无收付款记录")}
    `;
  }

  function renderInvoicesTab() {
    const rows = projectChildren("invoices");
    return `
      <div class="mb-3 flex justify-end"><button class="btn btn-primary" data-modal="invoice">${icon("plus")}新增发票</button></div>
      ${table([label("invoiceType"), label("counterparty"), label("invoiceNo"), label("invoiceDate"), helpLabel(label("invoiceAmount")), label("invoiceStatus"), label("originalInvoiceText"), label("operation")], rows.map((r) => `
        <tr>
          <td>${chip(r.type, r.type === "开票" ? "blue" : "green")}</td>
          <td>${escapeHtml(r.partner)}</td>
          <td>${escapeHtml(r.no || "-")}</td>
          <td>${escapeHtml(r.date || "-")}</td>
          <td>${money(r.amount)}</td>
          <td>${escapeHtml(r.status)}</td>
          <td>${escapeHtml(r.original)}</td>
          <td class="space-x-1">
            <button class="btn" data-modal="invoice" data-edit-invoice="${r.id}">${icon("pencil")}编辑</button>
            <button class="btn btn-danger" data-delete="invoice" data-id="${r.id}" data-name="${escapeHtml(r.partner)} ${money(r.amount)}">${icon("trash-2")}删除</button>
          </td>
        </tr>
      `), "暂无发票记录")}
    `;
  }

  function renderGrouping() {
    if (state.route === "grouping-ungrouped") return renderUngrouped();
    if (state.route === "grouping-suggestions") return renderSuggestions();
    if (state.route === "grouping-preview") return renderGroupingPreview();
    if (state.route === "grouping-detail") return renderGroupingDetail();
    const groups = data.groupings.filter((group) => {
      const projects = data.projects.filter((project) => group.projectIds.includes(project.id));
      return matchesQuery([group.name, ...projects.flatMap((project) => [project.name, project.customer])]);
    });
    return `
      ${pageHeader("统计归集", "保留原始项目名，通过统计归集修正项目命名不规范带来的偏差。", `
        <button class="btn" data-route="grouping-ungrouped">${icon("list-checks")}未归集项目</button>
        <button class="btn btn-primary" data-route="grouping-suggestions">${icon("sparkles")}疑似归集</button>
      `)}
      ${metricsGrid([
        { label: "统计归集项目", value: data.groupings.length, change: "已建立", tone: "neutral" },
        data.metrics[1],
        { label: "已归集收入", value: data.groupings.reduce((sum, g) => sum + g.income, 0), change: `${data.groupings.length} 项`, tone: "up", money: true },
        { label: "归集后毛利", value: data.groupings.reduce((sum, g) => sum + g.profit, 0), change: "实时计算", tone: "up", money: true }
      ])}
      <div class="panel mt-5 p-3">
        <input class="h-9 w-full rounded-lg border border-zinc-200 px-3 text-sm md:w-80" data-global-search placeholder="搜索归集项目、原始项目、客户" value="${escapeHtml(state.query)}">
      </div>
      <div class="mt-3">${table(["归集项目", "原始项目数", helpLabel(label("income")), helpLabel(label("expense")), helpLabel(label("grossProfit")), helpLabel(label("receivable")), helpLabel(label("payable")), "操作"], groups.map((g) => `
        <tr>
          <td class="row-click font-medium" data-open-grouping="${g.id}">${escapeHtml(g.name)}</td>
          <td>${g.projects}</td><td>${money(g.income)}</td><td>${money(g.expense)}</td><td>${money(g.profit)}</td><td>${money(g.receivable)}</td><td>${money(g.payable)}</td>
          <td class="space-x-1">
            <button class="btn" data-open-grouping="${g.id}">${icon("eye")}详情</button>
            <button class="btn btn-danger" data-delete="grouping" data-id="${g.id}" data-name="${escapeHtml(g.name)}">${icon("trash-2")}删除</button>
          </td>
        </tr>
      `), "未找到匹配的统计归集项目")}</div>
    `;
  }

  function renderUngrouped() {
    const ungrouped = data.projects.filter((p) => p.group === "未归集" || !p.group);
    return `
      ${pageHeader("未归集项目列表", "查看尚未绑定统计归集项目的原始项目，可以按客户筛选并勾选归集。", `
        <button class="btn" data-route="grouping">${icon("arrow-left")}返回</button>
        <button class="btn btn-primary" data-modal="grouping">${icon("git-merge")}归集</button>
      `)}
      ${table(["选择", "原始项目", "客户", helpLabel(label("income")), "状态", "建议"], ungrouped.map((p) => `
        <tr><td><input type="checkbox" data-grouping-project="${p.id}" checked></td><td class="font-medium">${escapeHtml(p.name)}</td><td>${escapeHtml(p.customer)}</td><td>${money(p.income)}</td><td>${chip("未归集", "amber")}</td><td>按客户和项目名建议归集</td></tr>
      `), "暂无未归集项目")}
    `;
  }

  function renderSuggestions() {
    return `
      ${pageHeader("疑似归集推荐", "按客户、项目名称相似度、日期等推荐可能相关的项目。", `
        <button class="btn" data-route="grouping-ungrouped">${icon("list")}未归集列表</button>
        <button class="btn btn-primary" data-route="grouping-preview">${icon("eye")}预览归集</button>
      `)}
      <div class="grid gap-3 md:grid-cols-2">
        ${data.suggestions.map((s) => `
          <label class="panel flex items-start gap-3 p-4">
            <input class="mt-1" type="checkbox" data-grouping-project="${s.id}" ${s.selected ? "checked" : ""}>
            <span class="min-w-0">
              <span class="block font-medium">${escapeHtml(s.project)}</span>
              <span class="mt-1 block text-sm text-zinc-500">${escapeHtml(s.customer)} · ${money(s.amount)}</span>
              <span class="mt-3 block">${chip(s.reason, s.selected ? "blue" : "neutral")}</span>
            </span>
          </label>
        `).join("")}
      </div>
    `;
  }

  function selectedSuggestionProjects() {
    return data.suggestions.filter((s) => s.selected).map((s) => data.projects.find((p) => p.id === s.id)).filter(Boolean);
  }

  function renderGroupingPreview() {
    const projects = selectedSuggestionProjects();
    const income = projects.reduce((sum, p) => sum + p.income, 0);
    const expense = projects.reduce((sum, p) => sum + p.expense, 0);
    return `
      ${pageHeader("归集结果预览", "保存前核对归集后的收入、支出、毛利、应收和应付。", `
        <button class="btn" data-route="grouping-suggestions">${icon("arrow-left")}返回推荐</button>
        <button class="btn btn-primary" data-action="save-grouping">${loadingText("grouping", `${icon("check")}确认归集`)}</button>
      `)}
      ${metricsGrid([
        { label: "归集后收入", value: income, change: `${projects.length} 项`, tone: "up", money: true },
        { label: "归集后支出", value: expense, change: "采购", tone: "warn", money: true },
        { label: "归集后毛利", value: income - expense, change: income ? `${(((income - expense) / income) * 100).toFixed(1)}%` : "0%", tone: "up", money: true },
        { label: "应收 / 应付", value: projects.reduce((sum, p) => sum + p.receivable + p.payable, 0), change: "需跟进", tone: "down", money: true }
      ])}
      <div class="mt-5">${table([label("projectName"), label("customer"), helpLabel(label("income")), helpLabel(label("expense")), helpLabel(label("grossProfit"))], projects.map((p) => `<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.customer)}</td><td>${money(p.income)}</td><td>${money(p.expense)}</td><td>${money(p.profit)}</td></tr>`))}</div>
    `;
  }

  function selectedGrouping() {
    return data.groupings.find((g) => g.id === state.selectedGroupingId) || data.groupings[0];
  }

  function renderGroupingDetail() {
    const group = selectedGrouping();
    if (!group) return pageHeader("统计归集详情", "暂无统计归集项目。");
    const projects = data.projects.filter((p) => group.projectIds.includes(p.id));
    const projectIds = new Set(projects.map((p) => p.id));
    const groupedLedger = data.ledger
      .filter((item) => projectIds.has(item.projectId))
      .map((item) => ({ ...item, projectName: data.projects.find((p) => p.id === item.projectId)?.name || "-" }))
      .filter((item) => matchesQuery([item.projectName, item.type, item.biz, item.partner, item.item, item.spec, item.invoice, item.drawing]));
    return `
      ${pageHeader(escapeHtml(group.name), "查看统计归集项目下包含的原始项目和整体经营情况。", `
        <button class="btn" data-route="grouping">${icon("arrow-left")}返回归集</button>
      `)}
      ${metricsGrid([
        { label: "总收入", value: group.income, change: `${group.projects} 项目`, tone: "up", money: true },
        { label: "总支出", value: group.expense, change: "采购", tone: "warn", money: true },
        { label: "毛利", value: group.profit, change: group.income ? `${((group.profit / group.income) * 100).toFixed(1)}%` : "0%", tone: "up", money: true },
        { label: "未归集风险", value: "低", change: "已确认", tone: "up" }
      ])}
      <div class="mt-5">${table(["原始项目", "客户", helpLabel(label("income")), helpLabel(label("expense")), helpLabel(label("grossProfit")), "操作"], projects.map((p) => `
        <tr><td class="font-medium">${escapeHtml(p.name)}</td><td>${escapeHtml(p.customer)}</td><td>${money(p.income)}</td><td>${money(p.expense)}</td><td>${money(p.profit)}</td><td><button class="btn btn-danger" data-delete="grouping-member" data-id="${group.id}:${p.id}" data-name="${escapeHtml(p.name)}">${icon("x")}移除</button></td></tr>
      `))}</div>
      <div class="panel mt-5 p-4">
        <div class="mb-3 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <h3 class="font-semibold">归集台账明细</h3>
          <input class="h-9 w-full rounded-lg border border-zinc-200 px-3 text-sm md:w-80" data-global-search placeholder="搜索项目、往来单位、品名、规格" value="${escapeHtml(state.query)}">
        </div>
        ${table([label("projectName"), label("entryDirection"), label("businessType"), label("counterparty"), label("itemName"), label("spec"), label("quantity"), label("unitPrice"), helpLabel(label("ledgerAmount")), label("invoiceStatus"), label("operation")], groupedLedger.map((r) => `
          <tr>
            <td class="font-medium">${escapeHtml(r.projectName)}</td>
            <td>${chip(r.type, r.type === "收入" ? "green" : "amber")}</td>
            <td>${escapeHtml(r.biz)}</td>
            <td>${escapeHtml(r.partner)}</td>
            <td>${escapeHtml(r.item)}</td>
            <td>${escapeHtml(r.spec || "-")}</td>
            <td>${r.qty}</td>
            <td>${money(r.price)}</td>
            <td>${money(r.amount)}</td>
            <td>${escapeHtml(r.invoice)}</td>
            <td class="space-x-1">
              <button class="btn" data-modal="ledger" data-edit-ledger="${r.id}">${icon("pencil")}编辑</button>
              <button class="btn btn-danger" data-delete="ledger" data-id="${r.id}" data-name="${escapeHtml(r.item)}">${icon("trash-2")}删除</button>
            </td>
          </tr>
        `), "暂无匹配的台账明细")}
      </div>
    `;
  }

  function renderReports() {
    if (state.route === "drilldown") return renderDrilldown();
    const views = [["project", "项目视角"], ["customer", "客户视角"], ["supplier", "供应商视角"], ["group", "统计归集视角"]];
    return `
      ${pageHeader("报表查询", "通过项目、客户、供应商、统计归集多口径查看收入、支出、毛利、应收应付和发票。", `
        <button class="btn" data-modal="export">${icon("download")}导出</button>
        <button class="btn btn-primary" data-route="drilldown">${icon("list-tree")}下钻明细</button>
      `)}
      <div class="panel mb-5 p-4">
        <div class="flex flex-wrap items-center gap-2">
          ${views.map((v) => `<button class="btn ${state.reportView === v[0] ? "btn-primary" : ""}" data-report-view="${v[0]}">${v[1]}</button>`).join("")}
          <input class="h-9 rounded-lg border border-zinc-200 px-3 text-sm" data-global-search value="${escapeHtml(state.query)}" placeholder="供应商 / 客户 / 项目">
          <select class="h-9 rounded-lg border border-zinc-200 px-3 text-sm"><option>时间：本年</option></select>
          <select class="h-9 rounded-lg border border-zinc-200 px-3 text-sm"><option>发票状态：全部</option></select>
          <select class="h-9 rounded-lg border border-zinc-200 px-3 text-sm"><option>付款状态：全部</option></select>
        </div>
      </div>
      ${renderReportView()}
    `;
  }

  function renderReportView() {
    if (state.reportView === "customer") return renderCustomerReport();
    if (state.reportView === "supplier") return renderSupplierReport();
    if (state.reportView === "group") return renderGroupReport();
    return renderProjectReport();
  }

  function renderProjectReport() {
    const projects = data.projects.filter((p) => matchesQuery([p.name, p.customer, p.group, p.status, p.invoice]));
    return `
      ${metricsGrid([
        { label: "项目收入", value: projects.reduce((s, p) => s + p.income, 0), change: `${projects.length} 项目`, tone: "up", money: true },
        { label: "项目支出", value: projects.reduce((s, p) => s + p.expense, 0), change: "采购", tone: "warn", money: true },
        { label: "项目毛利", value: projects.reduce((s, p) => s + p.profit, 0), change: "实时计算", tone: "up", money: true },
        { label: "欠款金额", value: projects.reduce((s, p) => s + p.receivable + p.payable, 0), change: "待跟进", tone: "down", money: true }
      ])}
      <div class="mt-5">${table([label("projectName"), helpLabel(label("income")), helpLabel(label("expense")), helpLabel(label("grossProfit")), helpLabel(label("debt")), label("invoiceStatus")], projects.map((p) => `
        <tr class="row-click" data-open-project="${p.id}" data-route="drilldown"><td>${escapeHtml(p.name)}</td><td>${money(p.income)}</td><td>${money(p.expense)}</td><td>${money(p.profit)}</td><td>${money(p.receivable + p.payable)}</td><td>${escapeHtml(p.invoice)}</td></tr>
      `), "未找到匹配项目")}</div>
    `;
  }

  function renderCustomerReport() {
    const scopedProjects = data.projects.filter((p) => matchesQuery([p.name, p.customer, p.group, p.status, p.invoice]));
    const customers = Array.from(new Set(scopedProjects.map((p) => p.customer))).map((customer) => {
      const projects = scopedProjects.filter((p) => p.customer === customer);
      return {
        customer,
        income: projects.reduce((s, p) => s + p.income, 0),
        expense: projects.reduce((s, p) => s + p.expense, 0),
        receivable: projects.reduce((s, p) => s + p.receivable, 0),
        invoice: projects.some((p) => p.invoice.includes("未")) ? "待处理" : "已处理"
      };
    });
    return table([label("customer"), helpLabel(label("income")), helpLabel(label("expense")), helpLabel(label("grossProfit")), helpLabel(label("receivable")), label("invoiceStatus")], customers.map((c) => `
      <tr class="row-click" data-route="drilldown"><td>${escapeHtml(c.customer)}</td><td>${money(c.income)}</td><td>${money(c.expense)}</td><td>${money(c.income - c.expense)}</td><td>${money(c.receivable)}</td><td>${c.invoice}</td></tr>
    `));
  }

  function renderSupplierReport() {
    const supplier = state.query || "恒达机械";
    const supplierLedger = data.ledger.filter((l) => l.partner.includes(supplier) && l.type === "支出");
    const projectIds = Array.from(new Set(supplierLedger.map((l) => l.projectId)));
    const projects = data.projects.filter((p) => projectIds.includes(p.id));
    return `
      ${metricsGrid([
        { label: "供应商采购支出", value: supplierLedger.reduce((s, l) => s + l.amount, 0), change: supplier, tone: "warn", money: true },
        { label: "关联项目总收入", value: projects.reduce((s, p) => s + p.income, 0), change: `${projects.length} 项目`, tone: "up", money: true },
        { label: "关联项目总支出", value: projects.reduce((s, p) => s + p.expense, 0), change: "含其他供应商", tone: "warn", money: true },
        { label: "关联项目毛利", value: projects.reduce((s, p) => s + p.profit, 0), change: "项目口径", tone: "up", money: true }
      ])}
      <div class="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">供应商自身通常只产生支出；关联项目收入来自该供应商参与过的项目下的销售收入。</div>
      <div class="mt-5">${table([label("projectName"), helpLabel("供应商采购支出"), helpLabel("关联项目总收入"), helpLabel("关联项目总支出"), helpLabel("关联项目毛利"), helpLabel("应付 / 已付 / 未付"), "收票状态"], projects.map((p) => {
        const purchase = supplierLedger.filter((l) => l.projectId === p.id).reduce((s, l) => s + l.amount, 0);
        return `<tr class="row-click" data-open-project="${p.id}" data-route="drilldown"><td>${escapeHtml(p.name)}</td><td>${money(purchase)}</td><td>${money(p.income)}</td><td>${money(p.expense)}</td><td>${money(p.profit)}</td><td>${money(p.payable)} / ${money(p.paid)} / ${money(p.payable)}</td><td>查看发票</td></tr>`;
      }), "未找到供应商相关项目")}</div>
    `;
  }

  function renderGroupReport() {
    return table(["统计归集项目", helpLabel(label("income")), helpLabel(label("expense")), helpLabel(label("grossProfit")), helpLabel(label("receivable")), helpLabel(label("payable"))], data.groupings.map((g) => `
      <tr class="row-click" data-open-grouping="${g.id}"><td>${escapeHtml(g.name)}</td><td>${money(g.income)}</td><td>${money(g.expense)}</td><td>${money(g.profit)}</td><td>${money(g.receivable)}</td><td>${money(g.payable)}</td></tr>
    `));
  }

  function renderDrilldown() {
    const project = selectedProject();
    const ledger = projectChildren("ledger");
    const payments = projectChildren("payments");
    const invoices = projectChildren("invoices");
    return `
      ${pageHeader("明细下钻", `当前项目：${escapeHtml(project?.name || "-")}`, `
        <button class="btn" data-route="reports">${icon("arrow-left")}返回报表</button>
        <button class="btn btn-primary" data-modal="export">${icon("download")}导出</button>
      `)}
      <div class="grid gap-5 lg:grid-cols-2">
        <div>
          <h3 class="mb-3 font-semibold">收入 / 支出明细</h3>
          ${table([label("entryDirection"), label("counterparty"), label("itemName"), helpLabel(label("ledgerAmount"))], ledger.map((r) => `<tr><td>${chip(r.type, r.type === "收入" ? "green" : "amber")}</td><td>${escapeHtml(r.partner)}</td><td>${escapeHtml(r.item)}</td><td>${money(r.amount)}</td></tr>`))}
        </div>
        <div class="space-y-5">
          <div><h3 class="mb-3 font-semibold">收付款</h3>${table([label("direction"), label("counterparty"), helpLabel(label("paymentAmount")), label("status")], payments.map((r) => `<tr><td>${r.direction}</td><td>${escapeHtml(r.partner)}</td><td>${money(r.amount)}</td><td>${escapeHtml(r.status)}</td></tr>`))}</div>
          <div><h3 class="mb-3 font-semibold">发票</h3>${table([label("invoiceType"), label("counterparty"), helpLabel(label("invoiceAmount")), label("invoiceStatus")], invoices.map((r) => `<tr><td>${r.type}</td><td>${escapeHtml(r.partner)}</td><td>${money(r.amount)}</td><td>${escapeHtml(r.status)}</td></tr>`))}</div>
        </div>
      </div>
    `;
  }

  function fieldsForObject(object) {
    return data.fieldDefs
      .filter((field) => field.object === object)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }

  function filterMappings() {
    return (data.mappings || []).filter((mapping) => matchesQuery([mapping.excel, mapping.system, mapping.confidence, mapping.action]));
  }

  function renderSettings() {
    const objects = [["project", "项目字段"], ["ledger", "台账明细字段"], ["payment", "收付款字段"], ["invoice", "发票字段"], ["partner", "往来单位字段"]];
    return `
      ${pageHeader("字段配置", "配置项目、台账明细、收付款、发票、往来单位的核心字段和自定义字段。", `
        <button class="btn" data-route="field-preview">${icon("eye")}字段预览</button>
        <button class="btn" data-action="reset-data">${icon("rotate-ccw")}重置演示数据</button>
        <button class="btn btn-primary" data-modal="field">${icon("plus")}新增字段</button>
      `)}
      <div class="grid gap-5 lg:grid-cols-[260px_1fr]">
        <div class="panel p-3">
          <div class="mb-2 px-2 text-xs font-medium uppercase text-zinc-500">选择对象</div>
          ${objects.map((o) => `<button class="nav-link ${state.fieldObject === o[0] ? "active" : ""}" data-field-object="${o[0]}">${icon("columns-3")} ${o[1]}</button>`).join("")}
        </div>
        <div class="space-y-5">
          <div class="panel p-4">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="font-semibold">${objects.find((o) => o[0] === state.fieldObject)[1]}</h3>
              ${chip("核心字段不可删除", "amber")}
            </div>
            ${table(["字段名", "类型", "显示", "排序", "必填", "操作"], fieldsForObject(state.fieldObject).map((f) => `
              <tr><td class="font-medium">${escapeHtml(f.name)}</td><td>${escapeHtml(f.type)}</td><td>${f.visible ? "显示" : "隐藏"}</td><td>${Number(f.order || 0)}</td><td>${f.required ? "是" : "否"}</td><td class="space-x-1"><button class="btn" data-modal="field" data-edit-field="${f.id}">${icon("settings-2")}编辑</button><button class="btn btn-danger" data-delete="field" data-id="${f.id}" data-name="${escapeHtml(f.name)}" ${f.core ? "disabled" : ""}>${icon("trash-2")}删除</button></td></tr>
            `))}
          </div>
          <div class="panel p-4">
            <h3 class="mb-3 font-semibold">操作日志</h3>
            ${table(["时间", "用户", "模块", "操作", "对象", "结果", "错误原因"], data.logs.slice(0, 8).map((log) => `
              <tr><td>${log.time}</td><td>${log.user}</td><td>${log.module}</td><td>${log.type}</td><td>${escapeHtml(log.object)}</td><td>${chip(log.result, log.result === "失败" ? "red" : "green")}</td><td>${escapeHtml(log.reason || "-")}</td></tr>
            `), "暂无操作日志")}
          </div>
          <div class="panel p-4">
            <div class="mb-3 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h3 class="font-semibold">导入字段映射</h3>
                <p class="mt-1 text-sm text-zinc-500">维护表格列与系统字段的一一映射，导入时优先使用这里的规则。</p>
              </div>
              <button class="btn btn-primary" data-modal="mapping">${icon("plus")}新增映射</button>
            </div>
            <input class="mb-3 h-9 w-full rounded-lg border border-zinc-200 px-3 text-sm md:w-80" data-global-search placeholder="搜索表格列或系统字段" value="${escapeHtml(state.query)}">
            ${table(["表格列名", "系统字段", "置信度", "处理", "操作"], filterMappings().map((m) => `
              <tr>
                <td class="font-medium">${escapeHtml(m.excel)}</td>
                <td>${escapeHtml(m.system)}</td>
                <td>${chip(m.confidence || "高", m.confidence === "中" ? "amber" : "green")}</td>
                <td>${escapeHtml(m.action || "人工维护")}</td>
                <td class="space-x-1">
                  <button class="btn" data-modal="mapping" data-edit-mapping="${m.id}">${icon("settings-2")}编辑</button>
                  <button class="btn btn-danger" data-delete="mapping" data-id="${m.id}" data-name="${escapeHtml(m.excel)}">${icon("trash-2")}删除</button>
                </td>
              </tr>
            `), "暂无匹配的导入字段映射")}
          </div>
        </div>
      </div>
    `;
  }

  function renderFieldPreview() {
    const fields = fieldsForObject(state.fieldObject);
    return `
      ${pageHeader("字段预览", "预览字段在列表、详情和导入映射中的效果。", `
        <button class="btn" data-route="settings">${icon("arrow-left")}返回字段配置</button>
      `)}
      <div class="grid gap-5 lg:grid-cols-3">
        <div class="panel p-4">
          <h3 class="font-semibold">列表效果</h3>
          <div class="mt-3 text-sm text-zinc-500">当前对象可见字段会进入列表。</div>
          <div class="mt-4">${table(fields.filter((f) => f.visible).slice(0, 3).map((f) => f.name), [`<tr>${fields.filter((f) => f.visible).slice(0, 3).map((f) => `<td>${escapeHtml(f.name)}示例</td>`).join("")}</tr>`])}</div>
        </div>
        <div class="panel p-4">
          <h3 class="font-semibold">详情效果</h3>
          <div class="mt-4 space-y-2 text-sm">${fields.slice(0, 5).map((f) => `<div>${escapeHtml(f.name)}：${f.required ? "必填" : "可选"}</div>`).join("")}</div>
        </div>
        <div class="panel p-4">
          <h3 class="font-semibold">导入映射效果</h3>
          <div class="mt-4">${table(["Excel 列", "系统字段"], fields.slice(0, 4).map((f) => `<tr><td>${escapeHtml(f.name)}</td><td>${escapeHtml(f.name)}</td></tr>`))}</div>
        </div>
      </div>
    `;
  }

  function renderModal() {
    const titles = {
      project: state.modalPayload ? "编辑项目" : "新建项目",
      ledger: state.modalPayload ? "编辑明细" : "新增明细",
      payment: state.modalPayload ? "编辑收付款" : "新增收付款",
      invoice: state.modalPayload ? "编辑发票" : "新增发票",
      grouping: "创建 / 选择统计归集项目",
      export: "导出确认",
      field: state.modalPayload ? "编辑字段" : "新增字段",
      mapping: state.route === "import-mapping" ? "调整字段映射" : state.modalPayload ? "编辑导入字段映射" : "新增导入字段映射"
    };
    return `
      <div class="modal-backdrop">
        <div class="modal" style="transform: translate(${state.modalOffset.x}px, ${state.modalOffset.y}px);">
          <div class="modal-titlebar flex items-center justify-between border-b border-zinc-200 p-4" data-drag-modal>
            <h3 class="font-semibold">${titles[state.modal]}</h3>
            <button class="btn" data-close-modal data-no-drag>${icon("x")}关闭</button>
          </div>
          <div class="p-5">${modalBody(state.modal)}</div>
        </div>
      </div>
    `;
  }

  function renderConfirm() {
    return `
      <div class="modal-backdrop">
        <div class="modal max-w-md">
          <div class="border-b border-zinc-200 p-4">
            <h3 class="font-semibold">${escapeHtml(state.confirm.title)}</h3>
          </div>
          <div class="p-5">
            <p class="text-sm text-zinc-600">${escapeHtml(state.confirm.content)}</p>
            <div class="mt-5 flex justify-end gap-2">
              <button class="btn" data-cancel-confirm>取消</button>
              <button class="btn btn-danger" data-confirm-action ${isLoading("confirm") ? "disabled" : ""}>${loadingText("confirm", "确认删除")}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function err(name) {
    return state.errors[name] ? `<div class="mt-1 text-xs text-red-600">${state.errors[name]}</div>` : "";
  }

  function inputField(label, name, value = "", attrs = "") {
    return `<label class="block text-sm font-medium">${label}<input name="${name}" class="mt-1 h-9 w-full rounded-lg border border-zinc-200 px-3" value="${escapeHtml(value)}" ${attrs}>${err(name)}</label>`;
  }

  function selectField(label, name, value, options) {
    return `<label class="block text-sm font-medium">${label}<select name="${name}" class="mt-1 h-9 w-full rounded-lg border border-zinc-200 px-3">${options.map((opt) => `<option value="${escapeHtml(opt)}" ${opt === value ? "selected" : ""}>${escapeHtml(opt)}</option>`).join("")}</select>${err(name)}</label>`;
  }

  function selectFieldOptions(label, name, value, options) {
    return `<label class="block text-sm font-medium">${label}<select name="${name}" class="mt-1 h-9 w-full rounded-lg border border-zinc-200 px-3">${options.map((opt) => `<option value="${escapeHtml(opt.value)}" ${opt.value === value ? "selected" : ""}>${escapeHtml(opt.label)}</option>`).join("")}</select>${err(name)}</label>`;
  }

  function modalBody(type) {
    if (type === "project") return projectForm();
    if (type === "ledger") return ledgerForm();
    if (type === "payment") return paymentForm();
    if (type === "invoice") return invoiceForm();
    if (type === "field") return fieldForm();
    if (type === "mapping") return mappingForm();
    if (type === "grouping") return groupingForm();
    if (type === "export") return exportForm();
    return "";
  }

  function formShell(type, body, buttonText) {
    return `
      <form data-submit="${type}" class="grid gap-4 md:grid-cols-2" novalidate>
        ${body}
        <div class="md:col-span-2 flex items-center gap-2">
          <button class="btn btn-primary" type="submit" ${isLoading(type) ? "disabled" : ""}>${loadingText(type, `${icon("save")}${buttonText}`)}</button>
          <button class="btn" type="button" data-close-modal>取消</button>
          <span class="text-sm text-zinc-500">失败会显示原因，并写入操作日志。</span>
        </div>
      </form>
    `;
  }

  function projectForm() {
    const r = state.modalPayload || {};
    return formShell("project",
      `${inputField("项目名称", "name", r.name)}
       ${inputField(label("customer"), "customer", r.customer)}
       ${inputField("统计归集项目", "group", r.group || "未归集")}
       ${selectField("项目状态", "status", r.status || "交付中", ["设计中", "交付中", "待收款", "已交付"])}
       ${inputField("签订日期", "signed", r.signed, 'type="date"')}
       ${inputField("交付日期", "delivery", r.delivery, 'type="date"')}
       <input type="hidden" name="id" value="${escapeHtml(r.id || "")}">`,
      r.id ? "更新项目" : "保存项目");
  }

  function ledgerForm() {
    const r = state.modalPayload || {};
    const amount = calculateLedgerAmount(r);
    return formShell("ledger",
      `<input type="hidden" name="id" value="${escapeHtml(r.id || "")}">
       <input type="hidden" name="projectId" value="${escapeHtml(r.projectId || selectedProject()?.id || "")}">
       ${selectField("收支方向", "type", r.type || "收入", ["收入", "支出"])}
       ${selectField("业务类型", "biz", normalizeLedgerBiz(r.type || "收入", r.biz || "设备销售"), ["材料采购", "材料销售", "设备采购", "设备销售", "其他"])}
       ${inputField("往来单位", "partner", r.partner)}
       ${inputField("品名", "item", r.item)}
       ${inputField("规格", "spec", r.spec)}
       ${inputField("数量", "qty", r.qty || 1, 'type="number" min="0" step="0.01"')}
       ${inputField("单价", "price", r.price || 0, 'type="number" min="0" step="0.01"')}
       ${inputField(helpLabel(label("ledgerAmount")), "amount", amount, 'type="number" min="0" step="0.01" readonly data-calculated-amount title="台账金额 = 数量 × 单价"')}
       ${inputField("日期", "date", r.date, 'type="date"')}
       ${inputField("图号", "drawing", r.drawing)}
       ${inputField("发票状态", "invoice", r.invoice || "未开票")}`,
      r.id ? "更新明细" : "保存明细");
  }

  function paymentForm() {
    const r = state.modalPayload || {};
    return formShell("payment",
      `<input type="hidden" name="id" value="${escapeHtml(r.id || "")}">
       <input type="hidden" name="projectId" value="${escapeHtml(r.projectId || selectedProject()?.id || "")}">
       ${selectField(label("direction"), "direction", r.direction || "收款", ["收款", "付款"])}
       ${inputField("往来单位", "partner", r.partner)}
       ${inputField("日期", "date", r.date, 'type="date"')}
       ${inputField(helpLabel(label("paymentAmount")), "amount", r.amount || 0, 'type="number" min="0" step="0.01"')}
       ${selectField("状态", "status", r.status || "已确认", ["已确认", "待核对"])}
       ${inputField("备注", "note", r.note)}`,
      r.id ? "更新收付款" : "保存收付款");
  }

  function invoiceForm() {
    const r = state.modalPayload || {};
    return formShell("invoice",
      `<input type="hidden" name="id" value="${escapeHtml(r.id || "")}">
       <input type="hidden" name="projectId" value="${escapeHtml(r.projectId || selectedProject()?.id || "")}">
       ${selectField(label("invoiceType"), "type", r.type || "开票", ["开票", "收票"])}
       ${inputField("往来单位", "partner", r.partner)}
       ${inputField("发票日期", "date", r.date, 'type="date"')}
       ${inputField(helpLabel(label("invoiceAmount")), "amount", r.amount || 0, 'type="number" min="0" step="0.01"')}
       ${inputField("发票号", "no", r.no)}
       ${selectField("状态", "status", r.status || "未开票", ["已开票", "未开票", "已收票", "未收票"])}
       ${inputField("原始发票情况", "original", r.original)}`,
      r.id ? "更新发票" : "保存发票");
  }

  function fieldForm() {
    const r = state.modalPayload || {};
    const objectOptions = [
      { value: "project", label: "项目" },
      { value: "ledger", label: "台账明细" },
      { value: "payment", label: "收付款" },
      { value: "invoice", label: "发票" },
      { value: "partner", label: "往来单位" }
    ];
    return formShell("field",
      `<input type="hidden" name="id" value="${escapeHtml(r.id || "")}">
       ${selectFieldOptions("对象", "object", r.object || state.fieldObject, objectOptions)}
       ${inputField("字段名称", "name", r.name)}
       ${selectField("字段类型", "type", r.type || "文本", ["文本", "数字", "金额", "日期", "单选", "是否", "长文本"])}
       ${selectField("是否显示", "visible", r.visible === false ? "隐藏" : "显示", ["显示", "隐藏"])}
       ${inputField("显示顺序", "order", r.order || 10, 'type="number" min="1"')}
       ${selectField("是否必填", "required", r.required ? "是" : "否", ["否", "是"])}`,
      r.id ? "更新字段" : "保存字段");
  }

  function mappingForm() {
    const r = state.modalPayload || {};
    const isImportMappingAdjust = state.route === "import-mapping";
    const systemOptions = IMPORT_SYSTEM_FIELDS
      .filter(([labelText]) => !(isImportMappingAdjust && labelText === "自定义字段"))
      .map(([labelText]) => ({ value: labelText, label: labelText }));
    const selectedSystem = systemOptions.some((option) => option.value === r.system) ? r.system : "";
    const options = isImportMappingAdjust ? [{ value: "", label: "请选择系统字段" }, ...systemOptions] : systemOptions;
    return formShell("mapping",
      `<input type="hidden" name="id" value="${escapeHtml(r.id || "")}">
       ${inputField("表格列名", "excel", r.excel)}
       ${selectFieldOptions("系统字段", "system", isImportMappingAdjust ? selectedSystem : r.system || "自定义字段", options)}
       ${selectField("置信度", "confidence", r.confidence || "高", ["高", "中", "低"])}
       ${selectField("处理方式", "action", r.action || "人工维护", ["人工维护", "自动匹配", "作为备注保留", "忽略", "仅校验"])}
       <div class="md:col-span-2 text-sm text-zinc-500">${isImportMappingAdjust ? "这里用于把表格列映射到系统已有字段；需要新增字段请到字段配置页。" : "同一个表格列名只能维护一条映射，欠款金额建议选择“欠款金额（仅校验）”。"}</div>`,
      r.id ? "更新映射" : "保存映射");
  }

  function groupingForm() {
    return formShell("grouping",
      `${inputField("统计归集项目名称", "name", "A公司年度合作")}
       <div class="md:col-span-2 text-sm text-zinc-500">会归集当前勾选或推荐的原始项目。</div>`,
      "保存归集关系");
  }

  function exportForm() {
    return `
      <div class="space-y-4">
        <label class="block text-sm font-medium">导出范围<select class="mt-1 h-9 w-full rounded-lg border border-zinc-200 px-3"><option>当前筛选结果</option><option>全部数据</option></select></label>
        <label class="block text-sm font-medium">导出字段<select class="mt-1 h-9 w-full rounded-lg border border-zinc-200 px-3"><option>当前显示字段</option><option>全部字段</option></select></label>
        <div class="flex items-center gap-2">
          <button class="btn btn-primary" data-action="export">${loadingText("export", `${icon("download")}导出表格`)}</button>
          <button class="btn" data-close-modal>取消</button>
        </div>
      </div>
    `;
  }

  function render() {
    refreshData();
    state.route = routeFromHash();
    let content;
    if (state.route.startsWith("import")) content = renderImport();
    else if (state.route === "projects" || state.route === "project-detail") content = renderProjects();
    else if (state.route.startsWith("grouping")) content = renderGrouping();
    else if (state.route === "reports" || state.route === "report-result" || state.route === "drilldown") content = renderReports();
    else if (state.route === "settings" || state.route === "field-config") content = renderSettings();
    else if (state.route === "field-preview") content = renderFieldPreview();
    else content = renderDashboard();
    document.getElementById("app").innerHTML = layout(content);
    if (window.lucide) window.lucide.createIcons();
  }

  function nextImportStep() {
    const idx = importSteps.findIndex((s) => s[0] === state.route);
    if (state.route === "import-sheets" && !selectedImportSheets().length) {
      toastError("请至少选择一个 Sheet");
      return;
    }
    if (idx >= 0 && idx < importSteps.length - 1) setRoute(importSteps[idx + 1][0]);
  }

  function showToast(type, message) {
    state.toast = { type, message };
    render();
    setTimeout(() => {
      state.toast = null;
      render();
    }, 2300);
  }

  function toastSuccess(message) {
    showToast("success", `✅ ${message}`);
  }

  function toastError(message) {
    showToast("error", `❌ ${message}`);
  }

  function withLoading(key, promiseFactory, successMessage, afterSuccess) {
    state.loading.add(key);
    render();
    return promiseFactory()
      .then((result) => {
        state.loading.delete(key);
        state.errors = {};
        state.modal = null;
        state.modalPayload = null;
        if (afterSuccess) afterSuccess(result);
        toastSuccess(successMessage);
        return result;
      })
      .catch((error) => {
        state.loading.delete(key);
        toastError(error.message || "操作失败，请稍后重试");
        render();
      });
  }

  function readForm(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function isValidDate(value) {
    if (!value) return true;
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
  }

  function validate(type, values) {
    const errors = {};
    const required = {
      project: ["name", "customer"],
      ledger: ["projectId", "type", "biz", "partner", "item", "qty", "price", "date"],
      payment: ["projectId", "direction", "partner", "date", "amount"],
      invoice: ["projectId", "type", "partner", "amount", "status"],
      field: ["object", "name", "type", "order"],
      mapping: ["excel", "system", "confidence", "action"],
      grouping: ["name"]
    }[type] || [];

    required.forEach((field) => {
      if (!String(values[field] || "").trim()) errors[field] = "必填";
    });

    ["amount", "price", "qty", "order"].forEach((field) => {
      if (values[field] !== undefined && values[field] !== "" && Number(values[field]) < 0) errors[field] = "不能小于 0";
    });

    ["signed", "delivery", "date"].forEach((field) => {
      if (values[field] && !isValidDate(values[field])) errors[field] = "日期不合法";
    });

    ["name", "customer", "partner", "item"].forEach((field) => {
      if (values[field] && values[field].length > 80) errors[field] = "长度不能超过 80";
    });

    if (Object.keys(errors).length) throw errors;
  }

  function normalize(type, values) {
    const payload = { ...values };
    ["amount", "price", "qty", "order"].forEach((field) => {
      if (payload[field] !== undefined && payload[field] !== "") payload[field] = Number(payload[field]);
    });
    if (type === "field") {
      payload.required = payload.required === "是";
      payload.visible = payload.visible === "显示";
      payload.core = false;
    }
    if (type === "ledger") {
      payload.biz = normalizeLedgerBiz(payload.type, payload.biz);
      payload.amount = calculateLedgerAmount(payload);
    }
    if (type === "mapping") {
      payload.excel = normalizeHeader(payload.excel);
      if (payload.system === "欠款金额（仅校验）") payload.action = "仅校验";
      if (payload.system === "忽略字段") payload.action = "忽略";
    }
    return payload;
  }

  function syncParsedMapping(record) {
    if (!state.parsedImport || !record?.excel) return;
    const excelKey = normalizeHeader(record.excel);
    const index = state.parsedImport.mappings.findIndex((mapping) => normalizeHeader(mapping.excel) === excelKey || mapping.id === record.id);
    const next = {
      id: record.id || `MAP-${excelKey}`,
      excel: record.excel,
      system: record.system,
      confidence: record.confidence || "高",
      action: record.action || "人工维护"
    };
    if (index >= 0) state.parsedImport.mappings[index] = { ...state.parsedImport.mappings[index], ...next };
    else state.parsedImport.mappings.push(next);
  }

  function submitForm(form) {
    const type = form.getAttribute("data-submit");
    const raw = readForm(form);
    try {
      validate(type, raw);
    } catch (errors) {
      state.errors = errors;
      toastError("数据校验失败，请检查表单");
      render();
      return;
    }
    const values = normalize(type, raw);
    const actions = {
      project: () => store.upsertProject(values),
      ledger: () => store.upsertLedger(values),
      payment: () => store.upsertPayment(values),
      invoice: () => store.upsertInvoice(values),
      field: () => store.upsertField(values),
      mapping: () => store.upsertMapping(values),
      grouping: () => {
        const selected = Array.from(document.querySelectorAll("[data-grouping-project]:checked")).map((el) => el.getAttribute("data-grouping-project"));
        const fallback = data.suggestions.filter((s) => s.selected).map((s) => s.id);
        return store.saveGrouping(values.name, selected.length ? selected : fallback);
      }
    };
    const messages = {
      project: values.id ? "更新成功" : "保存成功",
      ledger: values.id ? "更新成功" : "保存成功",
      payment: values.id ? "更新成功" : "保存成功",
      invoice: values.id ? "更新成功" : "保存成功",
      field: values.id ? "更新成功" : "保存成功",
      mapping: values.id ? "更新成功" : "保存成功",
      grouping: "更新成功"
    };
    withLoading(type, actions[type], messages[type], (result) => {
      if (type === "mapping") syncParsedMapping(result || values);
      if (type === "project") {
        state.selectedProjectId = result.id;
        setRoute("project-detail");
      }
      if (type === "grouping") {
        state.selectedGroupingId = result.id;
        setRoute("grouping-detail");
      }
    });
  }

  function openModal(type, payload = null) {
    state.modal = type;
    state.modalPayload = payload;
    state.modalOffset = { x: 0, y: 0 };
    state.drag = null;
    state.errors = {};
    render();
  }

  function confirmDanger(title, content, action) {
    state.confirm = { title, content, action };
    render();
  }

  function deleteAction(kind, id, name) {
    const actionMap = {
      project: () => store.deleteProject(id),
      ledger: () => store.deleteLedger(id),
      payment: () => store.deletePayment(id),
      invoice: () => store.deleteInvoice(id),
      field: () => store.deleteField(id),
      import: () => store.deleteImport(id),
      grouping: () => store.deleteGrouping(id),
      mapping: () => store.deleteMapping(id),
      "grouping-member": () => {
        const [groupId, projectId] = id.split(":");
        return store.removeProjectFromGrouping(groupId, projectId);
      }
    };
    confirmDanger("确认删除？", `${name} 删除后无法恢复，是否继续？`, () => {
      withLoading("confirm", actionMap[kind], "删除成功", () => {
        state.confirm = null;
        if (kind === "project") state.selectedProjectId = data.projects[0]?.id || null;
        if (kind === "grouping") state.selectedGroupingId = null;
      });
    });
  }

  function handleAction(action) {
    if (action === "confirm-import") {
      if (state.parsedImport) {
        const payload = filteredParsedImport();
        if (!payload?.sheets.length) {
          toastError("请至少选择一个 Sheet");
          return;
        }
        withLoading("import", () => store.importParsedWorkbook(payload), "导入成功", (result) => {
          state.selectedProjectId = result.projectIds?.[0] || state.selectedProjectId;
          state.parsedImport = null;
          state.importSheetSelections = {};
          state.importIssueActions = {};
          setRoute("import-result");
        });
      } else {
        toastError("请先上传并解析 Excel 文件");
      }
    }
    if (action === "select-all-sheets" || action === "clear-all-sheets") {
      const selected = action === "select-all-sheets";
      importSheets().forEach((sheet) => setImportSheetSelection(sheetKey(sheet), selected));
      toastSuccess(selected ? "已全选" : "已取消全选");
      return;
    }
    if (action === "save-grouping") {
      withLoading("grouping", () => store.saveGrouping("A公司年度合作", data.suggestions.filter((s) => s.selected).map((s) => s.id)), "更新成功", (result) => {
        state.selectedGroupingId = result.id;
        setRoute("grouping-detail");
      });
    }
    if (action === "export") {
      withLoading("export", () => Promise.resolve(), "导出成功", () => {
        state.modal = null;
      });
    }
    if (action === "reset-data") {
      confirmDanger("确认清空并重置？", "当前本地数据会被清空并恢复为初始演示数据，是否继续？", () => {
        state.loading.add("confirm");
        render();
        setTimeout(() => {
          store.reset();
          state.confirm = null;
          state.loading.delete("confirm");
          toastSuccess("更新成功");
        }, 180);
      });
    }
    if (action === "allow-warning") {
      toastSuccess("更新成功");
    }
  }

  function clampModalOffset(x, y) {
    const modal = document.querySelector(".modal");
    if (!modal) return { x: 0, y: 0 };
    const rect = modal.getBoundingClientRect();
    const maxX = Math.max(0, (window.innerWidth - rect.width) / 2);
    const maxY = Math.max(0, (window.innerHeight - rect.height) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y))
    };
  }

  function startModalDrag(event) {
    if (event.target.closest("[data-no-drag]")) return;
    if (!event.target.closest("[data-drag-modal]")) return;
    state.drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: state.modalOffset.x,
      originY: state.modalOffset.y
    };
    event.target.closest("[data-drag-modal]").setPointerCapture(event.pointerId);
  }

  function moveModalDrag(event) {
    if (!state.drag || state.drag.pointerId !== event.pointerId) return;
    const next = clampModalOffset(
      state.drag.originX + event.clientX - state.drag.startX,
      state.drag.originY + event.clientY - state.drag.startY
    );
    state.modalOffset = next;
    const modal = document.querySelector(".modal");
    if (modal) modal.style.transform = `translate(${next.x}px, ${next.y}px)`;
  }

  function stopModalDrag(event) {
    if (!state.drag || state.drag.pointerId !== event.pointerId) return;
    state.drag = null;
  }

  function updateLedgerAmountField(form) {
    const amountInput = form.querySelector("[data-calculated-amount]");
    if (!amountInput) return;
    amountInput.value = calculateLedgerAmount({
      qty: form.elements.qty?.value,
      price: form.elements.price?.value
    });
  }

  function updateLedgerBizField(form) {
    const type = form.elements.type?.value;
    const biz = form.elements.biz;
    if (!type || !biz) return;
    biz.value = normalizeLedgerBiz(type, biz.value);
  }

  function mappingRecordFromTrigger(trigger) {
    const id = trigger.getAttribute("data-edit-mapping");
    const excel = trigger.getAttribute("data-edit-mapping-excel");
    const stored = (data.mappings || []).find((item) => item.id === id || normalizeHeader(item.excel) === normalizeHeader(excel));
    if (stored) return stored;
    const parsed = (state.parsedImport?.mappings || []).find((item) => item.id === id || normalizeHeader(item.excel) === normalizeHeader(excel));
    return parsed ? { ...parsed, id: "" } : null;
  }

  document.addEventListener("click", (event) => {
    const openProject = event.target.closest("[data-open-project]");
    if (openProject) {
      state.selectedProjectId = openProject.getAttribute("data-open-project");
      setRoute(openProject.getAttribute("data-route") || "project-detail");
      return;
    }

    const openGrouping = event.target.closest("[data-open-grouping]");
    if (openGrouping) {
      state.selectedGroupingId = openGrouping.getAttribute("data-open-grouping");
      setRoute("grouping-detail");
      return;
    }

    const routeEl = event.target.closest("[data-route]");
    if (routeEl) {
      state.modal = null;
      setRoute(routeEl.getAttribute("data-route"));
      return;
    }

    if (event.target.closest("[data-next-step]")) {
      nextImportStep();
      return;
    }

    const modalEl = event.target.closest("[data-modal]");
    if (modalEl) {
      const type = modalEl.getAttribute("data-modal");
      const record =
        data.projects.find((item) => item.id === modalEl.getAttribute("data-edit-project")) ||
        data.ledger.find((item) => item.id === modalEl.getAttribute("data-edit-ledger")) ||
        data.payments.find((item) => item.id === modalEl.getAttribute("data-edit-payment")) ||
        data.invoices.find((item) => item.id === modalEl.getAttribute("data-edit-invoice")) ||
        data.fieldDefs.find((item) => item.id === modalEl.getAttribute("data-edit-field")) ||
        mappingRecordFromTrigger(modalEl) ||
        null;
      openModal(type, record);
      return;
    }

    if (event.target.closest("[data-close-modal]")) {
      state.modal = null;
      state.modalPayload = null;
      state.errors = {};
      render();
      return;
    }

    const tab = event.target.closest("[data-project-tab]");
    if (tab) {
      state.projectTab = tab.getAttribute("data-project-tab");
      render();
      return;
    }

    const report = event.target.closest("[data-report-view]");
    if (report) {
      state.reportView = report.getAttribute("data-report-view");
      render();
      return;
    }

    const field = event.target.closest("[data-field-object]");
    if (field) {
      state.fieldObject = field.getAttribute("data-field-object");
      render();
      return;
    }

    const del = event.target.closest("[data-delete]");
    if (del) {
      if (del.disabled) {
        toastError("权限不足，核心字段不能删除");
        return;
      }
      deleteAction(del.getAttribute("data-delete"), del.getAttribute("data-id"), del.getAttribute("data-name"));
      return;
    }

    const action = event.target.closest("[data-action]");
    if (action) {
      handleAction(action.getAttribute("data-action"));
      return;
    }

    if (event.target.closest("[data-cancel-confirm]")) {
      state.confirm = null;
      render();
      return;
    }

    if (event.target.closest("[data-confirm-action]")) {
      state.confirm.action();
    }
  });

  document.addEventListener("pointerdown", startModalDrag);
  document.addEventListener("pointermove", moveModalDrag);
  document.addEventListener("pointerup", stopModalDrag);
  document.addEventListener("pointercancel", stopModalDrag);

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-submit]");
    if (!form) return;
    event.preventDefault();
    submitForm(form);
  });

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-global-search]")) {
      state.query = event.target.value;
      render();
    }
    const form = event.target.closest('form[data-submit="ledger"]');
    if (form && (event.target.name === "qty" || event.target.name === "price")) {
      updateLedgerAmountField(form);
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-import-file]")) {
      parseImportFile(event.target.files?.[0]);
      return;
    }
    if (event.target.matches("[data-import-sheet]")) {
      setImportSheetSelection(event.target.getAttribute("data-import-sheet"), event.target.checked);
      render();
      return;
    }
    if (event.target.matches("[data-import-warning-action]")) {
      state.importIssueActions[event.target.getAttribute("data-import-warning-action")] = event.target.value;
      toastSuccess("处理方式已更新");
      return;
    }
    const form = event.target.closest('form[data-submit="ledger"]');
    if (form && event.target.name === "type") {
      updateLedgerBizField(form);
    }
  });

  window.addEventListener("hashchange", render);
  if (!location.hash) location.hash = "dashboard";
  render();
})();
