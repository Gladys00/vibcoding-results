(function () {
  const STORAGE_KEY = "project-finance-ledger-mvp-v1";
  const CURRENT_USER = "预留用户";
  const LATENCY = 180;

  class StoreError extends Error {
    constructor(code, message) {
      super(message);
      this.name = "StoreError";
      this.code = code;
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function now() {
    const date = new Date();
    const pad = (num) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const seeded = clone(window.seedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    try {
      return JSON.parse(saved);
    } catch (error) {
      const seeded = clone(window.seedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function withLatency(callback) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(callback());
        } catch (error) {
          reject(error);
        }
      }, LATENCY);
    });
  }

  function createId(prefix) {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  function log(data, entry) {
    data.logs.unshift({
      id: createId("LOG"),
      time: now(),
      user: CURRENT_USER,
      module: entry.module,
      type: entry.type,
      object: entry.object,
      result: entry.result,
      reason: entry.reason || ""
    });
    data.logs = data.logs.slice(0, 200);
  }

  function commit(entry, mutator) {
    return withLatency(() => {
      const data = load();
      try {
        const result = mutator(data);
        log(data, { ...entry, result: "成功" });
        save(data);
        return result;
      } catch (error) {
        log(data, { ...entry, result: "失败", reason: error.message || "未知错误" });
        save(data);
        throw error;
      }
    });
  }

  function getCollection(data, collection) {
    if (!Array.isArray(data[collection])) {
      throw new StoreError("NOT_FOUND", `未找到数据集合：${collection}`);
    }
    return data[collection];
  }

  function ensureUnique(items, field, value, excludeId) {
    if (!value) return;
    const exists = items.some((item) => item[field] === value && item.id !== excludeId);
    if (exists) throw new StoreError("DUPLICATE", `重复数据：${value}`);
  }

  function normalizeMappingColumn(value) {
    return String(value || "").trim().replace(/\s+/g, "");
  }

  function ensureUniqueMapping(items, record) {
    const target = normalizeMappingColumn(record.excel);
    if (!target) return;
    const exists = items.some((item) => normalizeMappingColumn(item.excel) === target && item.id !== record.id);
    if (exists) throw new StoreError("DUPLICATE", `表格列名已存在映射：${record.excel}`);
  }

  function removeById(items, id) {
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) throw new StoreError("NOT_FOUND", "未找到要删除的数据");
    const [removed] = items.splice(index, 1);
    return removed;
  }

  function calculateLedgerAmount(record) {
    const qty = Number(record.qty || 0);
    const price = Number(record.price || 0);
    return Number((qty * price).toFixed(2));
  }

  function normalizeLedgerBiz(type, biz) {
    if (type === "收入" && biz === "材料采购") return "材料销售";
    if (type === "收入" && biz === "设备采购") return "设备销售";
    if (type === "支出" && biz === "材料销售") return "材料采购";
    if (type === "支出" && biz === "设备销售") return "设备采购";
    return biz;
  }

  function normalizeLedgerRecord(record) {
    const payload = { ...record };
    payload.qty = Number(payload.qty || 0);
    payload.price = Number(payload.price || 0);
    payload.amount = calculateLedgerAmount(payload);
    payload.biz = normalizeLedgerBiz(payload.type, payload.biz);
    return payload;
  }

  function normalizeFieldDefinitions(data) {
    if (!Array.isArray(data.fieldDefs)) return false;
    let changed = false;
    const renameRules = [
      { object: "project", from: ["客户/主往来单位"], to: "客户" },
      { object: "ledger", from: ["金额"], to: "台账金额" },
      { object: "payment", from: ["收款/付款"], to: "收付款方向" },
      { object: "payment", from: ["金额"], to: "收付款金额" },
      { object: "invoice", from: ["开票/收票"], to: "发票类型" }
    ];
    data.fieldDefs.forEach((field) => {
      const rule = renameRules.find((item) => item.object === field.object && item.from.includes(field.name));
      if (rule) {
        field.name = rule.to;
        changed = true;
      }
    });
    return changed;
  }

  function normalizeImportMappings(data) {
    if (!Array.isArray(data.mappings)) return false;
    let changed = false;
    const renameMap = {
      "金额": "台账金额",
      "付款金额": "收付款金额",
      "收款金额": "收付款金额",
      "收付款流水.日期": "收付款日期"
    };
    data.mappings.forEach((mapping) => {
      const next = renameMap[mapping.system];
      if (next) {
        mapping.system = next;
        changed = true;
      }
    });
    return changed;
  }

  function normalizeStoredData(data) {
    if (!Array.isArray(data.ledger)) return data;
    let changed = false;
    data.ledger = data.ledger.map((item) => {
      const normalized = normalizeLedgerRecord(item);
      if (
        normalized.amount !== Number(item.amount || 0) ||
        normalized.qty !== Number(item.qty || 0) ||
        normalized.price !== Number(item.price || 0) ||
        normalized.biz !== item.biz
      ) {
        changed = true;
      }
      return normalized;
    });
    changed = normalizeFieldDefinitions(data) || changed;
    changed = normalizeImportMappings(data) || changed;
    if (changed) save(data);
    return data;
  }

  function upsert(collection, record, options = {}) {
    return commit({
      module: options.module || collection,
      type: record.id ? "更新" : "新增",
      object: record.name || record.item || record.no || record.id || collection
    }, (data) => {
      const items = getCollection(data, collection);
      const payload = { ...record };
      if (options.uniqueField) ensureUnique(items, options.uniqueField, payload[options.uniqueField], payload.id);
      if (payload.id) {
        const index = items.findIndex((item) => item.id === payload.id);
        if (index < 0) throw new StoreError("NOT_FOUND", "未找到要更新的数据");
        items[index] = { ...items[index], ...payload };
        return clone(items[index]);
      }
      payload.id = createId(options.prefix || collection.slice(0, 3).toUpperCase());
      items.unshift(payload);
      return clone(payload);
    });
  }

  function remove(collection, id, options = {}) {
    return commit({
      module: options.module || collection,
      type: "删除",
      object: id
    }, (data) => {
      const items = getCollection(data, collection);
      if (collection === "projects") {
        ["ledger", "payments", "invoices"].forEach((child) => {
          data[child] = data[child].filter((item) => item.projectId !== id);
        });
        data.groupings.forEach((group) => {
          group.projectIds = group.projectIds.filter((projectId) => projectId !== id);
        });
      }
      if (collection === "fieldDefs") {
        const target = items.find((item) => item.id === id);
        if (target?.core) throw new StoreError("FORBIDDEN", "核心字段不能删除");
      }
      return clone(removeById(items, id));
    });
  }

  function sumsForProject(data, projectId) {
    const ledger = data.ledger.filter((item) => item.projectId === projectId);
    const payments = data.payments.filter((item) => item.projectId === projectId);
    const income = ledger.filter((item) => item.type === "收入").reduce((sum, item) => sum + calculateLedgerAmount(item), 0);
    const expense = ledger.filter((item) => item.type === "支出").reduce((sum, item) => sum + calculateLedgerAmount(item), 0);
    const received = payments.filter((item) => item.direction === "收款").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const paid = payments.filter((item) => item.direction === "付款").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return {
      income,
      expense,
      profit: income - expense,
      receivable: Math.max(income - received, 0),
      payable: Math.max(expense - paid, 0),
      received,
      paid
    };
  }

  function hydrate(data) {
    const state = clone(data);
    state.ledger = state.ledger.map(normalizeLedgerRecord);
    state.projects = state.projects.map((project) => ({
      ...project,
      ...sumsForProject(state, project.id)
    }));
    state.metrics = buildMetrics(state);
    state.groupings = state.groupings.map((group) => {
      const projects = state.projects.filter((project) => group.projectIds.includes(project.id));
      const income = projects.reduce((sum, project) => sum + project.income, 0);
      const expense = projects.reduce((sum, project) => sum + project.expense, 0);
      const receivable = projects.reduce((sum, project) => sum + project.receivable, 0);
      const payable = projects.reduce((sum, project) => sum + project.payable, 0);
      return {
        ...group,
        projects: projects.length,
        income,
        expense,
        profit: income - expense,
        receivable,
        payable
      };
    });
    state.suggestions = buildSuggestions(state);
    return state;
  }

  function buildMetrics(data) {
    const income = data.projects.reduce((sum, project) => sum + project.income, 0);
    const ungrouped = data.projects.filter((project) => !project.group || project.group === "未归集");
    const ungroupedAmount = ungrouped.reduce((sum, project) => sum + project.income, 0);
    const receivable = data.projects.reduce((sum, project) => sum + project.receivable, 0);
    const invoiceTodo = data.invoices.filter((invoice) => invoice.status.includes("未")).length;
    return [
      { label: "本月台账金额", value: income, change: `${data.projects.length} 个项目`, tone: "up", money: true },
      { label: "未归集金额", value: ungroupedAmount, change: `${ungrouped.length} 个项目`, tone: ungrouped.length ? "warn" : "up", money: true },
      { label: "应收未收", value: receivable, change: "需跟进", tone: receivable ? "down" : "up", money: true },
      { label: "发票待处理", value: invoiceTodo, change: "需核对", tone: invoiceTodo ? "warn" : "up" }
    ];
  }

  function buildSuggestions(data) {
    const ungrouped = data.projects.filter((project) => !project.group || project.group === "未归集");
    const firstCustomer = ungrouped[0]?.customer || "A公司";
    return data.projects
      .filter((project) => project.customer === firstCustomer || project.group === "未归集")
      .map((project) => ({
        id: project.id,
        project: project.name,
        customer: project.customer,
        reason: project.customer === firstCustomer ? "客户相同、名称相似、日期接近" : "客户不同",
        amount: project.income,
        selected: project.customer === firstCustomer
      }));
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    const data = load();
    log(data, {
      module: "系统设置",
      type: "重置",
      object: "演示数据",
      result: "成功"
    });
    save(data);
    return hydrate(data);
  }

  window.appStore = {
    StoreError,
    getState() {
      return hydrate(normalizeStoredData(load()));
    },
    reset,
    upsertProject(record) {
      return upsert("projects", record, { module: "项目", prefix: "P", uniqueField: "name" });
    },
    deleteProject(id) {
      return remove("projects", id, { module: "项目" });
    },
    upsertLedger(record) {
      return upsert("ledger", normalizeLedgerRecord(record), { module: "台账明细", prefix: "L" });
    },
    deleteLedger(id) {
      return remove("ledger", id, { module: "台账明细" });
    },
    upsertPayment(record) {
      return upsert("payments", record, { module: "收付款", prefix: "PAY" });
    },
    deletePayment(id) {
      return remove("payments", id, { module: "收付款" });
    },
    upsertInvoice(record) {
      return upsert("invoices", record, { module: "发票", prefix: "INV" });
    },
    deleteInvoice(id) {
      return remove("invoices", id, { module: "发票" });
    },
    upsertField(record) {
      return upsert("fieldDefs", record, { module: "字段配置", prefix: "F" });
    },
    deleteField(id) {
      return remove("fieldDefs", id, { module: "字段配置" });
    },
    upsertMapping(record) {
      return commit({
        module: "导入字段映射",
        type: record.id ? "更新" : "新增",
        object: record.excel || record.id || "字段映射"
      }, (data) => {
        const items = getCollection(data, "mappings");
        const payload = {
          ...record,
          excel: normalizeMappingColumn(record.excel),
          confidence: record.confidence || "高",
          action: record.action || "人工维护"
        };
        ensureUniqueMapping(items, payload);
        if (payload.id) {
          const index = items.findIndex((item) => item.id === payload.id);
          if (index < 0) throw new StoreError("NOT_FOUND", "未找到要更新的映射");
          items[index] = { ...items[index], ...payload };
          return clone(items[index]);
        }
        payload.id = createId("MAP");
        items.unshift(payload);
        return clone(payload);
      });
    },
    deleteMapping(id) {
      return remove("mappings", id, { module: "导入字段映射" });
    },
    saveGrouping(name, projectIds) {
      return commit({ module: "统计归集", type: "更新", object: name }, (data) => {
        if (!name) throw new StoreError("VALIDATION", "统计归集项目名称不能为空");
        if (!projectIds.length) throw new StoreError("VALIDATION", "至少选择一个原始项目");
        let group = data.groupings.find((item) => item.name === name);
        if (!group) {
          group = { id: createId("G"), name, projectIds: [] };
          data.groupings.unshift(group);
        }
        group.projectIds = Array.from(new Set([...group.projectIds, ...projectIds]));
        data.projects.forEach((project) => {
          if (group.projectIds.includes(project.id)) project.group = name;
        });
        return clone(group);
      });
    },
    removeProjectFromGrouping(groupId, projectId) {
      return commit({ module: "统计归集", type: "移除", object: projectId }, (data) => {
        const group = data.groupings.find((item) => item.id === groupId);
        if (!group) throw new StoreError("NOT_FOUND", "未找到统计归集项目");
        group.projectIds = group.projectIds.filter((id) => id !== projectId);
        const project = data.projects.find((item) => item.id === projectId);
        if (project) project.group = "未归集";
        return clone(group);
      });
    },
    deleteGrouping(id) {
      return commit({ module: "统计归集", type: "删除", object: id }, (data) => {
        const group = data.groupings.find((item) => item.id === id);
        if (!group) throw new StoreError("NOT_FOUND", "未找到统计归集项目");
        data.projects.forEach((project) => {
          if (group.projectIds.includes(project.id) || project.group === group.name) {
            project.group = "未归集";
          }
        });
        removeById(data.groupings, id);
        return clone(group);
      });
    },
    importParsedWorkbook(payload) {
      return commit({ module: "Excel 导入", type: "导入", object: payload.fileName || "导入文件" }, (data) => {
        if (!payload || !Array.isArray(payload.projects) || !Array.isArray(payload.ledger)) {
          throw new StoreError("VALIDATION", "导入数据格式不正确");
        }
        if (!payload.projects.length && !payload.ledger.length) {
          throw new StoreError("VALIDATION", "未解析到可导入的数据");
        }

        const projectIdMap = {};
        const importedProjectIds = [];
        payload.projects.forEach((project) => {
          const name = project.name || "未命名项目";
          let target = data.projects.find((item) => item.name === name);
          if (!target) {
            target = {
              id: createId("P"),
              name,
              customer: project.customer || "未识别客户",
              group: project.group || "未归集",
              status: project.status || "交付中",
              signed: project.signed || "",
              delivery: project.delivery || "",
              invoice: project.invoice || "",
              importedFrom: project.importedFrom || payload.fileName || "导入文件"
            };
            data.projects.unshift(target);
          } else {
            target.customer = target.customer || project.customer || "未识别客户";
            target.importedFrom = project.importedFrom || target.importedFrom;
            target.invoice = project.invoice || target.invoice;
          }
          projectIdMap[project.tempId] = target.id;
          importedProjectIds.push(target.id);
        });

        const importedLedgerIds = [];
        payload.ledger.forEach((record) => {
          const projectId = projectIdMap[record.projectTempId] || record.projectId;
          if (!projectId) return;
          const item = normalizeLedgerRecord({
            ...record,
            id: createId("L"),
            projectId
          });
          delete item.projectTempId;
          data.ledger.unshift(item);
          importedLedgerIds.push(item.id);
        });

        const importedPaymentIds = [];
        (payload.payments || []).forEach((record) => {
          const projectId = projectIdMap[record.projectTempId] || record.projectId;
          if (!projectId) return;
          const item = {
            ...record,
            id: createId("PAY"),
            projectId,
            amount: Number(record.amount || 0)
          };
          delete item.projectTempId;
          data.payments.unshift(item);
          importedPaymentIds.push(item.id);
        });

        const importedInvoiceIds = [];
        (payload.invoices || []).forEach((record) => {
          const projectId = projectIdMap[record.projectTempId] || record.projectId;
          if (!projectId) return;
          const item = {
            ...record,
            id: createId("INV"),
            projectId,
            amount: Number(record.amount || 0)
          };
          delete item.projectTempId;
          data.invoices.unshift(item);
          importedInvoiceIds.push(item.id);
        });

        const importId = `IMP-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(data.imports.length + 1).padStart(3, "0")}`;
        data.imports.unshift({
          id: importId,
          file: payload.fileName || "导入文件",
          sheets: payload.sheets?.length || 0,
          status: payload.warnings?.length ? "有警告" : "已完成",
          amount: payload.ledger.filter((item) => item.type === "收入").reduce((sum, item) => sum + calculateLedgerAmount(item), 0),
          rows: payload.rows || payload.ledger.length,
          warnings: payload.warnings?.length || 0,
          createdAt: now()
        });

        return clone({
          import: data.imports[0],
          projectIds: Array.from(new Set(importedProjectIds)),
          ledgerIds: importedLedgerIds,
          paymentIds: importedPaymentIds,
          invoiceIds: importedInvoiceIds
        });
      });
    },
    simulateImport(options = {}) {
      return commit({ module: "Excel 导入", type: "导入", object: "A公司_项目台账_2026Q2.xlsx" }, (data) => {
        const selectedSheetCount = Array.isArray(options.sheets)
          ? options.sheets.length
          : data.sheets.filter((sheet) => sheet.selected).length;
        const id = `IMP-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(data.imports.length + 1).padStart(3, "0")}`;
        data.imports.unshift({
          id,
          file: "A公司_项目台账_2026Q2.xlsx",
          sheets: selectedSheetCount,
          status: "已完成",
          amount: data.projects.reduce((sum, project) => sum + sumsForProject(data, project.id).income, 0),
          rows: 136,
          warnings: 5,
          createdAt: now()
        });
        return clone(data.imports[0]);
      });
    },
    deleteImport(id) {
      return remove("imports", id, { module: "Excel 导入" });
    }
  };
})();
