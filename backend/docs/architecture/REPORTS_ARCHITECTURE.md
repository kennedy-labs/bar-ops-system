# Reports Architecture

# 1. Purpose

The Reports module provides business-level visibility into operational, inventory, financial, and reconciliation data.

It transforms verified system records into understandable reports without becoming the source of operational truth.

---

# 2. Requirements: Functional and Non-functional

## Functional Requirements

The module must:

- Provide inventory reports.
- Provide sales and revenue reports.
- Provide expense reports.
- Provide profit reports.
- Provide Shift reports.
- Provide Mpesa reconciliation reports.
- Provide discrepancy reports.
- Filter reports by Business, Branch, Shift, Product, and date range.

## Non-functional Requirements

The module must provide:

- Accurate calculations.
- Consistent results.
- Business data isolation.
- Traceable report results.
- Read-only access to operational data.
- Reliable performance for reporting queries.

---

# 3. Module Dependencies

## Depends On

- Business
- Branch
- User
- Product
- Product Unit
- Product Cost History
- Stock Location
- Inventory Item
- Stock Movement
- Shift
- Shift Stock Item
- Mpesa Account
- Mpesa Transaction
- Expense
- Shift Payment Summary
- Discrepancy

## Used By

- Business owners
- Managers
- Authorized operational users

Reports consume existing system truth; they do not create it.

---

# 4. Design Principles

- Reports are read-only.
- Reports do not modify operational records.
- Reports do not become a second source of truth.
- Calculations must use authoritative underlying records.
- Every report must respect Business ownership.
- Branch-level reports must respect Branch ownership.
- Historical reports must remain reproducible from stored records.
- Financial calculations must use exact monetary values.

---

# 5. Module Skeleton

````text
Reports
│
├── Operational Reports
│   ├── Shift
│   ├── Inventory
│   └── Stock Movement
│
├── Financial Reports
│   ├── Revenue
│   ├── Expenses
│   ├── Mpesa
│   └── Profit
│
├── Accountability Reports
│   ├── Discrepancies
│   └── Shift Reconciliation
│
└── Management Reports
    ├── Branch Performance
    ├── Product Performance
    └── Business Summary
6. File Structure
backend/
├── src/
│   └── reports/
│       ├── reports.module.ts
│       ├── reports.controller.ts
│       ├── reports.service.ts
│       │
│       ├── dto/
│       │   └── report-filter.dto.ts
│       │
│       └── types/
│           ├── inventory-report.ts
│           ├── sales-report.ts
│           ├── expense-report.ts
│           ├── profit-report.ts
│           ├── mpesa-report.ts
│           └── discrepancy-report.ts
│
└── prisma/
    └── schema.prisma
7. Entity Design

The Reports module does not require a primary operational entity.

Reports are derived views over existing system records.

Business
   │
   ├── Operations
   │
   ├── Inventory
   │
   ├── Financial Records
   │
   └── Reconciliation
          │
          ▼
       Reports
Report Inputs

Reports may consume:

Stock Movements
Inventory Items
Shift Stock Items
Mpesa Transactions
Expenses
Shift Payment Summaries
Discrepancies
Product Cost History

The underlying modules remain the authoritative sources.

# 8. API Design

## Report Endpoints

```http
GET /reports/inventory
GET /reports/sales
GET /reports/expenses
GET /reports/profit
GET /reports/shifts
GET /reports/mpesa
GET /reports/discrepancies
GET /reports/summary

All endpoints support appropriate filters such as:

Branch
Shift
Product
Date range
9. Report Generation Workflow
Request Report
      ↓
Validate Filters
      ↓
Resolve Business
      ↓
Query Authoritative Records
      ↓
Apply Business Rules
      ↓
Calculate Results
      ↓
Return Read-only Report

Reports must not modify the records used to generate them.

10. Integration Points

Reports integrate with:

Business
Branch
Product
Inventory
Stock Movement
Shift
Shift Stock Item
Mpesa Transaction
Expense
Shift Payment Summary
Discrepancy

Each report reads from the module that owns the underlying truth.

11. Business Rules
Every report is scoped to an authorized Business.
Branch reports are scoped to the selected Branch.
Date filters use stored transaction/event timestamps.
Reports cannot modify source records.
Financial reports use exact monetary calculations.
Profit reports use Product Cost History for historical costs.
Inventory reports use Inventory Item and Stock Movement data.
Mpesa reports use Mpesa Transactions.
Discrepancy reports use Discrepancy records.
Reports must not create duplicate versions of operational truth.
12. Validation Rules

Validate:

Requester has access to the Business.
Requested Branch belongs to the Business.
Requested Shift belongs to the Business.
Requested Product belongs to the Business.
Date ranges are valid.
Required filters are present where a report requires them.

Reject:

Cross-Business queries.
Invalid IDs.
Invalid date ranges.
Unauthorized report access.
13. Testing Requirements
Unit Tests

Verify:

Report calculations.
Date filtering.
Branch filtering.
Product filtering.
Profit calculations.
Mpesa totals.
Discrepancy totals.
Integration Tests

Verify:

Reports read the correct authoritative records.
Business isolation works.
Historical costs produce correct profit.
Inventory reports reconcile with Stock Movements.
Mpesa reports reconcile with Mpesa Transactions.
API Tests

Verify:

GET /reports/inventory
GET /reports/sales
GET /reports/expenses
GET /reports/profit
GET /reports/shifts
GET /reports/mpesa
GET /reports/discrepancies
GET /reports/summary
14. Out of Scope

The Reports module does not:

Modify inventory.
Record sales.
Record Mpesa transactions.
Record expenses.
Close shifts.
Resolve discrepancies.
Modify product costs.
Become a second operational database.
15. Possible Future Features
Scheduled reports.
PDF exports.
Excel exports.
Dashboard visualizations.
Automated daily summaries.
Branch comparison.
Product profitability rankings.
Trend analysis.
Custom report builder.
16. Completion Criteria

The Reports module is complete when:

Required reports are available.
Business isolation works.
Filters work correctly.
Financial calculations are accurate.
Reports use authoritative source records.
Historical reports are reproducible.
Tests pass.
Application builds successfully.
17. Implementation Algorithm

Follow this sequence exactly. Do not introduce new sources of truth.

Step 1 — Verify Prerequisites

Confirm:

Business exists.
Branch exists.
Product exists.
Inventory modules exist.
Shift modules exist.
Mpesa modules exist.
Expense module exists.
Discrepancy module exists.
Prisma validates.
Application builds.

If a prerequisite fails:

STOP.
Report the exact failure.
Do not redesign the missing module.
Step 2 — Establish Read-only Boundary

Reports must only read authoritative records.

Do not create operational records from the Reports module.

Step 3 — Implement Report Filters

Create a shared filter structure containing only required filters:

businessId
branchId?
shiftId?
productId?
startDate?
endDate?

Validate every supplied ID against Business ownership.

Step 4 — Implement Reports Independently

Build each report from its authoritative source:

Inventory
→ Inventory Item + Stock Movement

Sales
→ Shift Stock Item

Expenses
→ Expense

Mpesa
→ Mpesa Transaction

Profit
→ Sales + Product Cost History + Expenses

Discrepancies
→ Discrepancy

Shift
→ Shift + Shift Stock Item + Payment Summary

Do not copy these records into another reporting table unless a later architecture explicitly requires a reporting warehouse.

Step 5 — Implement Business Isolation

Every query must be scoped to the authorized Business.

Never query a report source using an unscoped ID alone.

Step 6 — Implement Calculations

Use exact Decimal arithmetic for financial values.

Profit must use the historical cost applicable to the relevant sale period.

Step 7 — Implement Controllers

Expose only the defined report endpoints.

Controllers validate input and delegate calculations to the service.

Step 8 — Verify Reconciliation

Test that:

Inventory Report
↔ Stock Movement History

Mpesa Report
↔ Mpesa Transactions

Sales Report
↔ Shift Stock Items

Profit Report
↔ Sales + Historical Costs - Expenses

Discrepancy Report
↔ Discrepancy Records
Step 9 — Completion Gate

Do not proceed until:

✓ Reports are read-only
✓ Business isolation works
✓ Filters work
✓ Source records are authoritative
✓ Financial calculations are accurate
✓ Reports reconcile with source modules
✓ Tests pass
✓ Application builds

The Reports module is then the final visibility layer over the operational system.

````
