# Ledgerforge Changelog

## V1.3.2.2 - 2026-07-01

Local feature and bugfix version.

- Removed the Excel import assignment step because project grouping is handled in the grouping module, not during import.
- Replaced mock import preview fallback with real parsed Excel data, including selected Sheets, projects, ledger rows, payments, invoices, and warnings.
- Replaced the import correction mock table with real parsed warning rows and selectable handling actions.
- Updated import confirmation to summarize real parsed data and stop triggering simulated import when no parsed file exists.
- Added documentation for import preview issue handling and correction handling logic.

## V1.3.2.1 - 2026-07-01

Local fix version, not pushed to GitHub yet.

- Fixed clipped tooltip overlay around the `台账金额` table header.
- Added Sheet select all, clear all, multi-select, and persisted selection state during Excel import.
- Changed import mapping adjustment to edit field mapping against existing system fields instead of opening the new field form.

## V1.3.2 - 2026-06-30

Baseline version added to GitHub.

- Unified ambiguous amount fields as `台账金额`, `收付款金额`, `发票金额`, and `欠款金额`.
- Added help tooltips for key financial fields and statistical metrics.
- Simplified field configuration to display, order, and required settings.
- Added local data migration for old field names.

## V1.3.1

- Added import field mapping maintenance.
- Added duplicate Excel column mapping validation.
- Treated `欠款金额` as validation-only import data.
- Tightened import matching rules to reduce ambiguous field matches.

## V1.3

- Added real Excel file parsing for `.xlsx`, `.xls`, `.csv`, and `.tsv`.
- Imported projects became searchable across project ledger, grouping, and reports.
- Replaced English modal options with Chinese text.

## V1.2

- Added grouping detail ledger search, edit, and delete.
- Added import history deletion.
- Added grouping project deletion.

## V1.1

- Unified field names across pages.
- Added metric help tooltips.
- Improved modal close, cancel, save, drag, and overlay behavior.
- Unified ledger amount calculation as `数量 × 单价`.
