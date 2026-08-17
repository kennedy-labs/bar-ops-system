REPORTS_DESIGN_ARCHITECTURE.md

Static technical contract. AI agents translate this specification into software. They must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Reports capability transforms verified operational records into understandable management information.

Reports provide the Owner with visibility into:

Business activity
Shifts
Stock
Payments
Expenses
Transfers
Discrepancies
Profit/loss
Mpesa activity

Reports are read-only derived views.

Operational Records
↓
Reports
↓
Owner understands what happened

Reports must never become a second source of operational truth.

2. Requirements: Functional and Non-functional
   Functional Requirements

The module must:

Provide Shift reports.
Provide inventory reports.
Provide stock movement reports.
Provide transfer reports.
Provide discrepancy reports.
Provide expense reports.
Provide payment reports.
Provide Mpesa reports.
Provide profit/loss reports.
Provide Branch-level reports.
Provide Business-level summaries.
Support date filtering.
Support Branch filtering.
Support Shift filtering.
Support Product filtering.
Support relevant operational filters.
Return data suitable for mobile frontend presentation.
Non-functional Requirements

The module must provide:

Accurate calculations.
Deterministic results.
Business data isolation.
Branch data isolation.
Historical reproducibility.
Read-only access to operational records.
Reliable reporting performance.
Exact monetary calculations.
Efficient database queries.
Mobile-friendly response sizes. 3. Module Dependencies
Depends On
Business
Branch
User
Product
Product Unit
Product Cost History
Stock Location
Inventory Item
Stock Movement
Shift
Shift Stock Item
Transfer
Expense
Mpesa Account
Mpesa Transaction
Shift Payment Summary
Discrepancy
Used By
Owner
Frontend management dashboard
Analytics

Reports consume existing system truth.

4. Design Principles
   Reports are read-only.
   Reports do not modify operational records.
   Reports do not create operational records.
   Reports do not become a second source of truth.
   Calculations must use authoritative records.
   Every query must respect Business ownership.
   Branch reports must respect Branch ownership.
   Historical reports must remain reproducible.
   Financial calculations must use exact monetary values.
   Report filters must never bypass authorization.
   Report calculations must be deterministic.
5. Operational Model
   Business Reality
   │
   ├── Shifts
   ├── Payments
   ├── Expenses
   ├── Stock
   ├── Transfers
   ├── Discrepancies
   ├── Mpesa
   └── Other Operations
   ↓
   Authoritative Records
   ↓
   Reports
   ↓
   Owner

Reports answer:

What happened?
Where?
When?
How much?
Which Branch?
Which Shift?
What was the financial result? 6. Report Categories
Reports
│
├── Operational
│ ├── Shift
│ ├── Inventory
│ ├── Stock Movement
│ └── Transfer
│
├── Financial
│ ├── Payments
│ ├── Expenses
│ ├── Mpesa
│ └── Profit/Loss
│
├── Accountability
│ ├── Discrepancies
│ └── Shift Reconciliation
│
└── Management
├── Branch Performance
├── Product Performance
└── Business Summary 7. File Structure
backend/
├── src/
│ └── reports/
│ ├── reports.module.ts
│ ├── reports.controller.ts
│ ├── reports.service.ts
│ │
│ ├── dto/
│ │ └── report-filter.dto.ts
│ │
│ └── types/
│ ├── shift-report.ts
│ ├── inventory-report.ts
│ ├── stock-movement-report.ts
│ ├── transfer-report.ts
│ ├── payment-report.ts
│ ├── expense-report.ts
│ ├── mpesa-report.ts
│ ├── profit-report.ts
│ ├── discrepancy-report.ts
│ └── business-summary-report.ts
│
└── prisma/
└── schema.prisma 8. Report Architecture

Reports sit above operational modules.

                    Reports
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓

Operations Inventory Finance
│ │ │
Shifts Stock Items Payments
Transfers Movements Expenses
Discrepancy Products Mpesa
Profit

Reports must consume these systems rather than duplicate their data.

9. Report Filters

The common filter model must support:

businessId
branchId
shiftId
productId
locationId
dateFrom
dateTo

Only filters relevant to a particular report should be accepted.

The Business context must come from authorization, not trusted client input.

10. Business Report

Business-level reporting provides the Owner with a high-level view.

Conceptually:

Business
│
├── Branch A
├── Branch B
├── Branch C
└── Overall Business

The report may summarize:

Revenue/payments
Expenses
Profit/loss
Stock
Discrepancies
Transfers
Shift activity 11. Branch Report

Branch reporting must isolate activity to one Branch.

Business
↓
Branch
↓
Operations
↓
Report

The report must not include records belonging to another Branch.

12. Shift Report

A Shift report must summarize what happened during a Shift.

Conceptually:

Shift
│
├── Opening Stock
├── Opening Discrepancies
├── Payments
├── Expenses
├── Stock Operations
├── Transfers
├── Closing Stock
├── Closing Discrepancies
└── Profit/Loss

The Shift report must preserve the operational sequence.

13. Inventory Report

Inventory reports provide visibility into stock state.

They may include:

Current quantities.
Product quantities.
Location quantities.
Stock movement history.
Stock additions.
Stock reductions.
Transfers.
Discrepancies.

Inventory reports must consume authoritative inventory records.

14. Stock Movement Report

Stock movements must be presented as a traceable history.

Stock Movement
│
├── Product
├── Location
├── Quantity
├── Movement Type
├── Reference
├── User
└── Timestamp

The report must not manufacture movement records.

15. Transfer Report

Transfer reports must show:

Transfer
│
├── Source
├── Destination
├── Products
├── Quantities
├── Created By
├── Dispatched By
├── Received By
├── Status
└── Timestamps

The Owner must be able to identify transfers that are:

Created.
Dispatched.
In transit.
Received. 16. Discrepancy Report

The discrepancy report must expose differences between expected and actual reality.

Discrepancy
│
├── Product
├── Location
├── Shift
├── Expected
├── Actual
├── Difference
├── Reporter
├── Status
└── Timestamp

The report must not alter discrepancy records.

17. Expense Report

Expense reporting must show:

Expense
│
├── Amount
├── Category
├── Description
├── Branch
├── Shift
├── Recorded By
└── Date

Expense totals must be calculated from authoritative Expense records.

18. Payment Report

Payment reporting must distinguish payment methods.

Payments
│
├── Cash
├── Mpesa
└── Other Supported Methods

Reports must prevent double counting.

19. Mpesa Report

Mpesa reports must provide visibility into relevant Mpesa activity.

They may include:

Transaction totals.
Transaction counts.
Transaction status.
Shift association.
Branch association.
Mpesa account.
Transaction dates.
Reconciliation state.

Mpesa reports must consume Mpesa transaction records.

20. Profit/Loss Report

Profit/loss reporting must use authoritative financial records.

Conceptually:

## Revenue / Payments

## Expenses

# Relevant Costs / Adjustments

Profit/Loss

The exact financial calculation must follow the existing backend implementation.

Reports must not invent a second profit calculation.

21. Product Performance Report

Where supported, product reporting may summarize:

Product activity.
Sales/payment contribution.
Stock movement.
Stock discrepancies.
Costs.
Profit contribution.

Product cost history must be respected when historical cost information is required.

22. Historical Reporting

Historical reports must use the records that existed during the requested period.

The system must not silently replace historical values with current values.

Example:

Product cost in January
≠
Current product cost

Where historical cost is required, use Product Cost History.

23. Read-only Constraint

Reports must never perform:

CREATE
UPDATE
DELETE

against operational records.

Report requests must only read data.

24. API Contract

The report API must expose dedicated read endpoints.

Example structure:

GET /reports/shifts
GET /reports/inventory
GET /reports/stock-movements
GET /reports/transfers
GET /reports/discrepancies
GET /reports/expenses
GET /reports/payments
GET /reports/mpesa
GET /reports/profit
GET /reports/business-summary

Exact endpoint naming must follow the established backend implementation.

25. Authorization
    OWNER

The Owner may access authorized Business reporting across their Branches.

WORKER

Workers may only access reports explicitly permitted by the operational rules and their authorized scope.

The report layer must not bypass normal authorization.

26. Business Isolation

Every report query must begin conceptually with:

Authenticated User
↓
Business Scope
↓
Report Query

Never:

Client
↓
businessId
↓
Unrestricted Query 27. Branch Isolation

Branch-specific queries must enforce:

Authorized Branch
↓
Branch Records
↓
Report

Cross-Branch data must never leak through joins or aggregate queries.

28. Calculation Authority

Reports may calculate:

Totals.
Counts.
Differences.
Aggregations.
Percentages.
Summaries.

But calculations must use authoritative underlying records.

Records
↓
Calculation
↓
Report

Not:

Report
↓
Invented Record 29. Monetary Precision

All monetary report calculations must use exact monetary values.

Do not use JavaScript floating-point arithmetic for authoritative financial calculations.

30. Query Design

Report queries must:

Filter at database level.
Aggregate at database level where appropriate.
Select only required fields.
Avoid loading entire tables into memory.
Avoid N+1 queries.
Use indexed fields.
Use date ranges efficiently.
Respect Business/Branch ownership inside the query. 31. Pagination

Large historical reports must support pagination where appropriate.

Pagination must be deterministic.

Preferred ordering:

timestamp DESC
id DESC

or the established project ordering convention.

32. Response Design

Responses must be structured for frontend consumption.

Example:

{
"summary": {
"total": 125000,
"count": 42
},
"items": []
}

Exact response shapes must follow the established backend implementation.

33. Caching

Caching may only be introduced if it does not compromise report freshness or historical correctness.

For active Shift reports:

Fresh operational data

> stale cache

Closed historical reports may be cached if invalidation is reliable.

34. Security

The implementation must:

Require authentication.
Enforce Business ownership.
Enforce Branch authorization.
Prevent unauthorized aggregation.
Prevent ID-based data leakage.
Avoid exposing sensitive Mpesa information unnecessarily.
Avoid exposing internal database errors. 35. Error Handling

Handle:

Unauthorized
Forbidden
Invalid filters
Invalid date range
Invalid Branch
Invalid Shift
Invalid Product
Report query failure
Database failure

Use the established application error format.

36. Performance Requirements

Reports must remain usable on mobile connections.

The implementation must:

Minimize response size.
Avoid unnecessary nested data.
Use database aggregation.
Use indexes.
Avoid unbounded queries.
Paginate large datasets.
Avoid N+1 queries.
Return summaries efficiently. 37. Tools
Primary
NestJS
TypeScript
Prisma
PostgreSQL
Jest
Alternatives
Primary Alternative
Prisma PostgreSQL driver/query layer
Jest Vitest
PostgreSQL aggregation Application-level aggregation only where necessary

Alternatives must preserve correctness and performance.

38. Testing Requirements
    Business Isolation
    Business A
    ↓
    Report

Must never contain Business B records.

Branch Isolation
Branch A
↓
Report

Must never contain unauthorized Branch B records.

Shift Report

Verify:

Opening

- Operations
- Payments
- Expenses
- Transfers
- Closing

are correctly represented.

Expense Report

Verify expense totals equal authoritative Expense records.

Payment Report

Verify:

Cash

- Mpesa
- # Other
  Total

with no double counting.

Transfer Report

Verify source, destination, items, quantities, actors, and state.

Discrepancy Report

Verify:

# Difference

## Actual

Expected
Profit/Loss

Verify report results match the authoritative financial calculation.

Historical Report

Verify historical results remain reproducible after later operational activity.

Read-only

Verify report requests cannot modify operational records.

39. Completion Criteria
    ✓ Shift reports work
    ✓ Inventory reports work
    ✓ Stock movement reports work
    ✓ Transfer reports work
    ✓ Discrepancy reports work
    ✓ Expense reports work
    ✓ Payment reports work
    ✓ Mpesa reports work
    ✓ Profit/Loss reports work
    ✓ Business summaries work
    ✓ Branch isolation works
    ✓ Business isolation works
    ✓ Historical reporting works
    ✓ Exact monetary calculations work
    ✓ Filters work
    ✓ Pagination works where required
    ✓ Database aggregation is efficient
    ✓ No N+1 queries
    ✓ Read-only constraint is enforced
    ✓ Authorization works
    ✓ Error handling works
    ✓ Mobile response sizes are reasonable
    ✓ Tests pass
    ✓ Application builds
40. Implementation Algorithm
    Step 1 — Establish Report Inputs
    Authoritative Operational Records
    ↓
    Available to Reports

Verify Reports can access the required sources without modifying them.

Step 2 — Build Shift Visibility
Shift
↓
Opening
↓
Operations
↓
Payments
↓
Expenses
↓
Closing
↓
Shift Report
Step 3 — Build Stock Visibility
Inventory

- Stock Movements
- Transfers
- Discrepancies
  ↓
  Inventory Reports
  Step 4 — Build Financial Visibility
  Payments
- Mpesa
- Expenses
- Costs
  ↓
  Financial Reports
  Step 5 — Build Accountability Visibility
  Shifts
- Discrepancies
- Transfers
- Expenses
  ↓
  Accountability Reports
  Step 6 — Build Management Visibility
  Branch Data
- Product Data
- Financial Data
- Operational Data
  ↓
  Business Summary
  ↓
  Owner
  Step 7 — Verify Historical Reality
  Past Operations
  ↓
  Historical Records
  ↓
  Report

The same historical records must produce the same historical report.

Step 8 — Verify Complete Reporting Reality
Business Operations
↓
Authoritative Records
↓
Reports
↓
Owner understands what happened
Step 9 — Transition
Shift reports verified
↓
Inventory reports verified
↓
Financial reports verified
↓
Accountability reports verified
↓
Management reports verified
↓
Authorization verified
↓
Historical accuracy verified
↓
Next capability

Never proceed merely because Reports compile.
