window.seedData = {
  imports: [
    { id: "IMP-202606-017", file: "A公司_项目台账_2026Q2.xlsx", sheets: 6, status: "已完成", amount: 2864000, rows: 184, warnings: 5, createdAt: "2026-06-17 09:32" },
    { id: "IMP-202606-016", file: "B公司_设备销售明细.xlsx", sheets: 3, status: "有警告", amount: 1187000, rows: 76, warnings: 3, createdAt: "2026-06-13 14:08" },
    { id: "IMP-202606-015", file: "供应商采购付款表.xlsx", sheets: 4, status: "待确认", amount: 775000, rows: 52, warnings: 8, createdAt: "2026-06-08 16:20" }
  ],
  sheets: [
    { id: "S-001", name: "25年3月A公司项目", rows: 42, detected: "项目台账", selected: true },
    { id: "S-002", name: "A公司设备追加", rows: 28, detected: "设备买卖", selected: true },
    { id: "S-003", name: "A公司补材料", rows: 33, detected: "材料采购", selected: true },
    { id: "S-004", name: "B公司5月材料", rows: 19, detected: "材料销售", selected: false }
  ],
  mappings: [
    { id: "MAP-001", excel: "客户名", system: "往来单位", confidence: "高", action: "已匹配" },
    { id: "MAP-002", excel: "品名", system: "品名", confidence: "高", action: "已匹配" },
    { id: "MAP-003", excel: "付款日期2", system: "收付款日期", confidence: "中", action: "需确认" },
    { id: "MAP-004", excel: "图号", system: "自定义字段：图号", confidence: "新字段", action: "新建" },
    { id: "MAP-005", excel: "备注说明", system: "忽略", confidence: "低", action: "忽略" },
    { id: "MAP-006", excel: "欠款金额", system: "欠款金额（仅校验）", confidence: "高", action: "仅校验" }
  ],
  projects: [
    { id: "P-2603-A01", name: "25年3月A公司项目", customer: "A公司", group: "A公司年度合作", status: "交付中", signed: "2026-03-18", delivery: "2026-06-30", invoice: "部分开票", importedFrom: "A公司_项目台账_2026Q2.xlsx / 25年3月A公司项目 / 行 2-43" },
    { id: "P-2604-A02", name: "A公司设备追加", customer: "A公司", group: "A公司年度合作", status: "待收款", signed: "2026-04-22", delivery: "2026-07-12", invoice: "未开票", importedFrom: "A公司_项目台账_2026Q2.xlsx / A公司设备追加 / 行 2-29" },
    { id: "P-2605-B01", name: "B公司5月材料", customer: "B公司", group: "未归集", status: "已交付", signed: "2026-05-09", delivery: "2026-05-28", invoice: "已开票", importedFrom: "B公司_设备销售明细.xlsx / B公司5月材料 / 行 2-20" },
    { id: "P-2606-C01", name: "C公司输送线改造", customer: "C公司", group: "C公司一期改造", status: "设计中", signed: "2026-06-03", delivery: "2026-08-20", invoice: "未开票", importedFrom: "手工创建" }
  ],
  ledger: [
    { id: "L-001", projectId: "P-2603-A01", type: "收入", biz: "设备销售", partner: "A公司", item: "上料机", spec: "SL-2600", unit: "台", qty: 2, weight: "", price: 280000, amount: 560000, date: "2026-03-20", invoice: "部分开票", drawing: "A-SL-02" },
    { id: "L-002", projectId: "P-2603-A01", type: "收入", biz: "材料销售", partner: "A公司", item: "不锈钢板", spec: "304 / 12mm", unit: "吨", qty: 5, weight: "5.2t", price: 28600, amount: 143000, date: "2026-03-24", invoice: "未开票", drawing: "A-M-11" },
    { id: "L-003", projectId: "P-2603-A01", type: "支出", biz: "设备采购", partner: "恒达机械", item: "减速机", spec: "HD-90", unit: "台", qty: 4, weight: "", price: 36000, amount: 144000, date: "2026-03-26", invoice: "已收票", drawing: "SUP-09" },
    { id: "L-004", projectId: "P-2603-A01", type: "支出", biz: "材料采购", partner: "华东钢材", item: "碳钢型材", spec: "Q235B", unit: "吨", qty: 8, weight: "8.4t", price: 5200, amount: 41600, date: "2026-03-29", invoice: "未收票", drawing: "MAT-41" },
    { id: "L-005", projectId: "P-2604-A02", type: "收入", biz: "设备销售", partner: "A公司", item: "提升机", spec: "TS-900", unit: "台", qty: 1, weight: "", price: 860000, amount: 860000, date: "2026-04-25", invoice: "未开票", drawing: "A-TS-03" },
    { id: "L-006", projectId: "P-2604-A02", type: "支出", biz: "设备采购", partner: "恒达机械", item: "电机组件", spec: "HD-M22", unit: "套", qty: 3, weight: "", price: 84000, amount: 252000, date: "2026-04-28", invoice: "未收票", drawing: "SUP-22" },
    { id: "L-007", projectId: "P-2605-B01", type: "收入", biz: "材料销售", partner: "B公司", item: "钢板", spec: "Q235B / 8mm", unit: "吨", qty: 12, weight: "12.6t", price: 36500, amount: 438000, date: "2026-05-10", invoice: "已开票", drawing: "B-M-01" },
    { id: "L-008", projectId: "P-2605-B01", type: "支出", biz: "材料采购", partner: "华东钢材", item: "钢板", spec: "Q235B / 8mm", unit: "吨", qty: 12, weight: "12.6t", price: 24000, amount: 288000, date: "2026-05-08", invoice: "已收票", drawing: "MAT-08" },
    { id: "L-009", projectId: "P-2606-C01", type: "收入", biz: "设备销售", partner: "C公司", item: "输送线", spec: "CX-1200", unit: "套", qty: 1, weight: "", price: 1560000, amount: 1560000, date: "2026-06-03", invoice: "未开票", drawing: "C-CX-01" },
    { id: "L-010", projectId: "P-2606-C01", type: "支出", biz: "设备采购", partner: "恒达机械", item: "输送组件", spec: "HD-CX", unit: "批", qty: 1, weight: "", price: 930000, amount: 930000, date: "2026-06-09", invoice: "未收票", drawing: "SUP-CX" }
  ],
  payments: [
    { id: "PAY-001", projectId: "P-2603-A01", direction: "收款", partner: "A公司", date: "2026-04-02", amount: 400000, status: "已确认", note: "合同首款" },
    { id: "PAY-002", projectId: "P-2603-A01", direction: "收款", partner: "A公司", date: "2026-05-15", amount: 520000, status: "已确认", note: "阶段款" },
    { id: "PAY-003", projectId: "P-2603-A01", direction: "付款", partner: "恒达机械", date: "2026-04-08", amount: 96000, status: "已确认", note: "设备预付款" },
    { id: "PAY-004", projectId: "P-2603-A01", direction: "付款", partner: "华东钢材", date: "2026-04-12", amount: 41600, status: "待核对", note: "材料款" },
    { id: "PAY-005", projectId: "P-2604-A02", direction: "收款", partner: "A公司", date: "2026-05-20", amount: 640000, status: "已确认", note: "追加设备首款" },
    { id: "PAY-006", projectId: "P-2605-B01", direction: "收款", partner: "B公司", date: "2026-05-30", amount: 376000, status: "已确认", note: "材料款" }
  ],
  invoices: [
    { id: "INV-001", projectId: "P-2603-A01", type: "开票", partner: "A公司", no: "FP-A-260401", date: "2026-04-01", amount: 560000, status: "已开票", original: "已开设备票" },
    { id: "INV-002", projectId: "P-2603-A01", type: "开票", partner: "A公司", no: "", date: "", amount: 143000, status: "未开票", original: "材料未开票" },
    { id: "INV-003", projectId: "P-2603-A01", type: "收票", partner: "恒达机械", no: "FP-H-260410", date: "2026-04-10", amount: 144000, status: "已收票", original: "设备票已收" },
    { id: "INV-004", projectId: "P-2603-A01", type: "收票", partner: "华东钢材", no: "", date: "", amount: 41600, status: "未收票", original: "供应商未开" }
  ],
  groupings: [
    { id: "G-001", name: "A公司年度合作", projectIds: ["P-2603-A01", "P-2604-A02"] },
    { id: "G-002", name: "C公司一期改造", projectIds: ["P-2606-C01"] }
  ],
  fieldDefs: [
    { id: "F-P-001", object: "project", name: "项目名称", type: "核心字段", required: true, visible: true, order: 1, core: true },
    { id: "F-P-002", object: "project", name: "客户", type: "核心字段", required: true, visible: true, order: 2, core: true },
    { id: "F-P-003", object: "project", name: "业务员", type: "文本", required: false, visible: true, order: 7, core: false },
    { id: "F-L-001", object: "ledger", name: "往来单位", type: "核心字段", required: true, visible: true, order: 1, core: true },
    { id: "F-L-002", object: "ledger", name: "收支方向", type: "核心字段", required: true, visible: true, order: 2, core: true },
    { id: "F-L-003", object: "ledger", name: "台账金额", type: "核心字段", required: true, visible: true, order: 7, core: true },
    { id: "F-L-004", object: "ledger", name: "图号", type: "文本", required: false, visible: true, order: 8, core: false },
    { id: "F-PAY-001", object: "payment", name: "收付款方向", type: "核心字段", required: true, visible: true, order: 1, core: true },
    { id: "F-PAY-002", object: "payment", name: "收付款金额", type: "核心字段", required: true, visible: true, order: 3, core: true },
    { id: "F-INV-001", object: "invoice", name: "发票类型", type: "核心字段", required: true, visible: true, order: 1, core: true },
    { id: "F-INV-002", object: "invoice", name: "发票金额", type: "核心字段", required: true, visible: true, order: 3, core: true },
    { id: "F-PT-001", object: "partner", name: "往来单位名称", type: "核心字段", required: true, visible: true, order: 1, core: true },
    { id: "F-PT-002", object: "partner", name: "税号", type: "文本", required: false, visible: true, order: 5, core: false }
  ],
  partners: [
    { id: "PT-001", name: "A公司", type: "客户" },
    { id: "PT-002", name: "B公司", type: "客户" },
    { id: "PT-003", name: "C公司", type: "客户" },
    { id: "PT-004", name: "恒达机械", type: "供应商" },
    { id: "PT-005", name: "华东钢材", type: "供应商" }
  ],
  logs: []
};
