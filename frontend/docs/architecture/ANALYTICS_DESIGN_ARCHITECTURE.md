ANALYTICS_DESIGN_ARCHITECTURE.md

Static technical contract. AI agents translate this specification into software. They must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Analytics capability transforms historical operational records into patterns, trends, comparisons, and indicators that help the Owner understand how the business is performing.

Operational Reality
↓
Authoritative Records
↓
Reports
↓
Analytics
↓
Owner understands patterns

Analytics is read-only.

It must never become a second source of operational truth.

2. Requirements: Functional and Non-functional
   Functional Requirements

The module must:

Analyze business performance over time.
Analyze Branch performance.
Analyze Shift performance.
Analyze payment patterns.
Analyze expense patterns.
Analyze stock movement.
Analyze discrepancies.
Analyze transfers.
Analyze product performance.
Analyze profit/loss trends.
Compare selected periods where supported.
Support Business-level analysis.
Support Branch-level analysis.
Support date-range filtering.
Provide data suitable for frontend visualization.
Non-functional Requirements

The module must provide:

Accurate calculations.
Deterministic results.
Historical consistency.
Business isolation.
Branch isolation.
Exact monetary calculations.
Reliable aggregation.
Efficient queries.
Mobile-appropriate responses.
Read-only behavior.
Explainable metrics. 3. Module Dependencies
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
Reports
Used By
Owner dashboard
Management views
Analytics frontend

Analytics consumes established system truth.

4. Design Principles
   Analytics is read-only.
   Analytics does not create operational records.
   Analytics does not modify operational records.
   Analytics must use authoritative records.
   Analytics must not invent business facts.
   Every metric must have a defined calculation.
   Metrics must be reproducible from stored records.
   Historical analysis must respect historical data.
   Business isolation is mandatory.
   Branch isolation is mandatory.
   Monetary calculations must use exact values.
   Analytics must not silently change the meaning of operational data.
5. Operational Model
   Business Reality
   │
   ├── Payments
   ├── Expenses
   ├── Stock
   ├── Transfers
   ├── Discrepancies
   ├── Shifts
   └── Products
   ↓
   Authoritative Records
   ↓
   Reports / Aggregations
   ↓
   Analytics
   ↓
   Patterns / Trends / Comparisons
   ↓
   Owner

Analytics answers questions such as:

Is performance improving?
Which Branch performs better?
Which products move most?
Are discrepancies increasing?
Are expenses increasing?
What happens across different periods? 6. Analytics Categories
Analytics
│
├── Financial
│ ├── Revenue Trend
│ ├── Expense Trend
│ ├── Profit/Loss Trend
│ └── Payment Mix
│
├── Operational
│ ├── Shift Performance
│ ├── Stock Movement
│ ├── Transfer Activity
│ └── Discrepancy Patterns
│
├── Product
│ ├── Product Activity
│ ├── Product Movement
│ ├── Product Cost
│ └── Product Performance
│
└── Business
├── Branch Comparison
├── Period Comparison
└── Business Trends

Only analytics already supported by the backend business model may be implemented.

7. File Structure
   backend/
   ├── src/
   │ └── analytics/
   │ ├── analytics.module.ts
   │ ├── analytics.controller.ts
   │ ├── analytics.service.ts
   │ │
   │ ├── dto/
   │ │ └── analytics-filter.dto.ts
   │ │
   │ └── types/
   │ ├── financial-analytics.ts
   │ ├── operational-analytics.ts
   │ ├── product-analytics.ts
   │ ├── branch-analytics.ts
   │ └── business-analytics.ts
   │
   └── prisma/
   └── schema.prisma
8. Architecture

Analytics sits above the operational system.

                         Analytics
                             │
          ┌──────────────────┼──────────────────┐
          ↓                  ↓                  ↓
      Financial          Operational          Product
          │                  │                  │
       Payments          Shifts             Products
       Expenses          Stock              Costs
       Profit            Transfers           Movement
       Mpesa             Discrepancies

Reports provide structured visibility.

Analytics provides higher-level interpretation of those records.

9. Analytics Must Not Become a Source of Truth

Incorrect:

Analytics
↓
Creates operational value

Correct:

Operational Records
↓
Analytics

Analytics results must always be derivable from authoritative records.

10. Common Filters

Analytics filters may include:

business scope
branchId
productId
dateFrom
dateTo
shiftId

Only relevant filters should be accepted by each endpoint.

Business authorization must determine the available scope.

11. Time-Based Analysis

Analytics must support time-based aggregation where applicable.

Examples:

Daily
Weekly
Monthly

The supported granularity must follow the existing backend implementation.

Do not introduce additional time models without explicit specification.

12. Financial Analytics

Financial analytics may include:

Revenue
Expenses
Profit/Loss
Payment Mix

Conceptually:

Revenue Trend
↓
Period 1
Period 2
Period 3
...

All values must come from authoritative financial records.

13. Revenue Analytics

Revenue/payment analytics must use the established payment/revenue definition.

Example:

Day 1 → KSh 20,000
Day 2 → KSh 23,000
Day 3 → KSh 18,000

Analytics may calculate:

Total.
Average.
Trend.
Period comparison.

The definition of revenue must not be reinvented by the analytics layer.

14. Expense Analytics

Expense analytics must consume Expense records.

Examples:

Expense by:
├── Date
├── Category
├── Branch
└── Shift

The system may identify increasing or decreasing expense patterns.

It must not modify expenses.

15. Profit/Loss Analytics

Profit/loss analytics must consume the authoritative financial calculation.

Profit/Loss
↓
Time Series
↓
Trend

Analytics must not create a competing profit formula.

16. Payment Mix Analytics

Payment analytics may compare:

Cash
vs
Mpesa
vs
Other Supported Methods

Example:

Cash = 60%
Mpesa = 40%

Percentages must be calculated from authoritative payment totals.

17. Shift Analytics

Shift analytics may summarize:

Number of shifts.
Shift duration where available.
Payment activity.
Expenses.
Discrepancies.
Stock activity.
Profit/loss.

Example:

Shift
↓
Operational Records
↓
Performance Indicators

Analytics must respect Shift boundaries.

18. Branch Analytics

Branch analytics compares authorized Branches.

Business
│
├── Branch A
├── Branch B
└── Branch C
↓
Branch Comparison

Possible metrics:

Revenue/payment activity.
Expenses.
Profit/loss.
Stock movement.
Discrepancies.
Transfers.

A Branch comparison must use identical metric definitions across Branches.

19. Product Analytics

Product analytics may include:

Movement volume.
Payment/revenue contribution where supported.
Cost information.
Discrepancy frequency.
Stock activity.

Example:

Product
↓
Historical Activity
↓
Product Pattern

Historical product costs must use Product Cost History where required.

20. Discrepancy Analytics

Discrepancy analytics may identify:

Number of discrepancies.
Shortages.
Excesses.
Product patterns.
Branch patterns.
Time patterns.

Example:

Discrepancies
↓
Group by Product
↓
Identify repeated differences

Analytics must not determine the cause of a discrepancy unless the underlying data explicitly records it.

21. Transfer Analytics

Transfer analytics may summarize:

Number of transfers.
Transfer quantities.
Source/destination activity.
Pending/in-transit transfers.
Completed transfers.

Example:

Branch A → Branch B
10 transfers

The analysis must consume Transfer records.

22. Stock Analytics

Stock analytics may summarize:

Stock movement volume.
Additions.
Reductions.
Transfers.
Discrepancies.
Product movement.

Stock analytics must not modify Inventory.

23. Metric Definitions

Every metric must have a deterministic definition.

Example:

# Total Expenses

Σ Expense.amount
Total Payments
=
Σ valid payment amounts
Discrepancy Count
=
COUNT(discrepancy records)
Shortage Quantity
=
Σ negative discrepancy differences

The exact definitions must follow the established backend calculations.

24. Comparison Rules

Period comparison must compare equivalent periods.

Example:

Current Week
vs
Previous Week

The system must not compare incompatible ranges without explicitly representing the difference.

25. Percentage Calculations

Where percentages are used:

# Percentage

Part / Whole × 100

Zero denominators must be handled explicitly.

Never return Infinity, NaN, or undefined financial metrics to the frontend.

26. Historical Integrity

Analytics must respect historical reality.

Example:

January Product Cost
≠
Current Product Cost

When historical cost is required:

Product Cost History
↓
Historical Analytics

Do not use today's values to rewrite yesterday's performance.

27. API Contract

Example read-only endpoints:

GET /analytics/financial
GET /analytics/operations
GET /analytics/products
GET /analytics/branches
GET /analytics/business
GET /analytics/discrepancies
GET /analytics/transfers

Exact endpoints must follow the existing backend implementation.

No analytics endpoint may mutate operational state.

28. Authorization
    OWNER

The Owner may access authorized Business analytics.

WORKER

Workers may only access analytics explicitly permitted by operational rules.

Analytics must never grant broader access than the underlying records allow.

29. Business Isolation

Every analytics query must follow:

Authenticated User
↓
Business Scope
↓
Analytics Query

Client-provided identifiers must never override authorization.

30. Branch Isolation

Branch analytics must enforce Branch authorization.

Authorized Branches
↓
Branch Records
↓
Analytics

Cross-Branch leakage through aggregation or joins is prohibited.

31. Read-only Constraint

Analytics must not perform operational:

CREATE
UPDATE
DELETE

operations.

Analytics requests must only read and aggregate data.

32. Query Architecture

Analytics queries must:

Aggregate at database level where practical.
Filter before aggregation.
Use indexed fields.
Avoid loading unnecessary records.
Avoid N+1 queries.
Avoid unbounded queries.
Return only required fields.
Support date-range filtering efficiently. 33. Performance

Analytics must remain usable from mobile devices.

The system must:

Return compact responses.
Avoid unnecessarily large datasets.
Aggregate server-side.
Use pagination where raw records are returned.
Avoid repeated expensive queries where safe.
Avoid blocking operational transactions.

Analytics must never degrade core business operations.

34. Caching

Caching may be used for expensive historical analytics if:

Results remain correct.
Cache invalidation is reliable.
Active operational views do not display stale information where freshness matters.

For active Shift analytics:

Current Reality

> Stale Cache 35. Security

The implementation must:

Require authentication.
Enforce Business ownership.
Enforce Branch authorization.
Prevent unauthorized aggregation.
Prevent ID-based data leakage.
Protect sensitive financial/Mpesa information.
Avoid exposing database internals. 36. Error Handling

Handle:

Unauthorized
Forbidden
Invalid filters
Invalid date range
Invalid Branch
Invalid Product
Invalid Shift
Analytics query failure
Database failure
Division by zero

Use the established application error format.

37. Tools
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
    PostgreSQL aggregation Application-level aggregation where necessary

Alternatives must preserve deterministic calculations and performance.

38. Testing Requirements
    Financial Trend

Verify analytics equals the underlying financial records for the requested period.

Expense Trend

Verify:

# Analytics Expense Total

Authoritative Expense Total
Payment Mix

Verify:

Cash %

- Mpesa %
- # Other %
  100%

where applicable.

Branch Comparison

Verify each Branch only contributes its own authorized records.

Product Analytics

Verify product metrics correspond to actual product records.

Discrepancy Analytics

Verify:

# Shortages

negative discrepancy differences

and excesses are not incorrectly classified as shortages.

Historical Analytics

Verify historical product costs and other time-dependent values use historical records.

Business Isolation

Business A analytics must never contain Business B records.

Read-only

Verify analytics requests cannot change operational data.

Zero Denominator

Test:

Part = 0
Whole = 0

Expected: safe, defined response rather than NaN or Infinity.

Reproducibility

Run the same analytics query twice against unchanged data.

Expected:

Same Inputs
↓
Same Result 39. Completion Criteria
✓ Financial analytics work
✓ Expense analytics work
✓ Payment analytics work
✓ Profit/Loss analytics work
✓ Shift analytics work
✓ Branch analytics work
✓ Product analytics work
✓ Stock analytics work
✓ Transfer analytics work
✓ Discrepancy analytics work
✓ Date filtering works
✓ Business isolation works
✓ Branch isolation works
✓ Historical integrity works
✓ Metric definitions are deterministic
✓ Percentage calculations are safe
✓ Zero denominators are handled
✓ Read-only constraint is enforced
✓ Authorization works
✓ Query performance is acceptable
✓ No N+1 queries
✓ Mobile responses are reasonable
✓ Tests pass
✓ Application builds 40. Implementation Algorithm
Step 1 — Establish Analytical Inputs
Authoritative Operational Records
↓
Analytics Inputs

Verify Analytics can consume the existing system truth without modifying it.

Step 2 — Establish Financial Patterns
Payments

- Expenses
- Profit/Loss
  ↓
  Financial Trends
  Step 3 — Establish Operational Patterns
  Shifts
- Stock
- Transfers
- Discrepancies
  ↓
  Operational Trends
  Step 4 — Establish Product Patterns
  Products
- Stock Movement
- Costs
- Discrepancies
  ↓
  Product Patterns
  Step 5 — Establish Branch Comparison
  Branch A
- Branch B
- Other Authorized Branches
  ↓
  Comparable Metrics

Every Branch must use the same metric definitions.

Step 6 — Establish Historical Analysis
Historical Records
↓
Historical Metrics
↓
Trends

Historical analysis must use the values applicable to the historical period.

Step 7 — Connect Owner Visibility
Analytics
↓
Owner
↓
Patterns / Trends / Comparisons
↓
Management Understanding
Step 8 — Verify Complete Analytics Reality
Business Operations
↓
Records
↓
Reports
↓
Analytics
↓
Owner sees patterns
Step 9 — Transition
Financial analytics verified
↓
Operational analytics verified
↓
Product analytics verified
↓
Branch analytics verified
↓
Historical analytics verified
↓
Authorization verified
↓
Performance verified
↓
Next capability

Never proceed merely because Analytics compiles.
