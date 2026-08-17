PRODUCT-COST-HISTORY_DESIGN_ARCHITECTURE.md

Static technical contract. AI agents translate this specification into software. They must not redesign or invent business behavior.

1. Purpose

The Product Cost History capability preserves the historical cost of products over time.

It allows the system to determine what a product cost at a particular point in history, rather than relying only on its current cost.

2. Requirements: Functional and Non-functional
   Functional Requirements

The system must:

Record product cost changes.
Associate each cost record with a Product.
Preserve previous costs.
Record the effective cost.
Record when the cost became effective.
Support historical cost lookup.
Support profit calculations using the correct historical cost.
Support reports using historical costs.
Prevent historical cost records from being silently overwritten.
Non-functional Requirements

The capability must provide:

Historical accuracy.
Immutable records.
Deterministic historical lookup.
Business isolation.
Product ownership validation.
Exact monetary calculations.
Reliable performance.
Transaction safety. 3. Dependencies
Depends On
Business
Branch where applicable
Product
User
Authentication / Authorization
Prisma
PostgreSQL
Used By
Inventory
Sales/Revenue calculations
Shifts
Profit calculations
Reports
Analytics 4. Design Principles
Current Product cost is not sufficient for historical calculations.
Every cost change creates a historical record.
Historical records are immutable.
A new cost does not rewrite previous costs.
Historical calculations must use the cost effective at the relevant time.
Monetary values must use exact decimal-safe storage/calculation.
Product ownership must always be validated.
Historical records must remain reproducible. 5. Operational Model
Product
↓
Cost changes
↓
Cost History
├── Cost A
├── Cost B
└── Cost C

Example:

Tusker

Jan → 180
Mar → 190
Jun → 200

A transaction occurring in April must use 190, not the current 200.

6. Module Skeleton
   Product Cost History
   │
   ├── Cost Creation
   ├── Historical Lookup
   ├── Effective Date
   ├── Product Association
   ├── Business Ownership
   ├── Immutability
   ├── Validation
   ├── Authorization
   └── Persistence
7. File Structure
   backend/
   ├── src/
   │ └── product-cost-history/
   │ ├── product-cost-history.module.ts
   │ ├── product-cost-history.controller.ts
   │ ├── product-cost-history.service.ts
   │ │
   │ ├── dto/
   │ │ ├── create-product-cost.dto.ts
   │ │ └── product-cost-history-filter.dto.ts
   │ │
   │ └── entities/
   │ └── product-cost-history.entity.ts
   │
   └── prisma/
   └── schema.prisma
8. Entity Design

Conceptual structure:

ProductCostHistory
│
├── id
├── productId
├── businessId
├── cost
├── effectiveFrom
├── createdBy
└── createdAt

The existing Prisma schema remains authoritative for exact fields.

9. Cost Record

Each record represents:

Product

- Cost
- Effective Date

Example:

Product: Tusker
Cost: 190
Effective From: 2026-03-01 10. Historical Lookup

Given:

Product = Tusker
Date = 2026-04-15

the system must select the latest cost whose effective date is on or before the requested date.

Example:

Jan 1 → 180
Mar 1 → 190
Jun 1 → 200

April 15 → 190 11. Cost Changes

When cost changes:

Current Cost
↓
New Cost
↓
Create New History Record

Do not update the previous historical record.

12. Immutability

After creation:

Cost History
↓
Historical Fact

must not be ordinarily edited or deleted.

Correction must create an explicit new historical event according to established rules.

13. Effective Dates

Effective dates must be explicit.

The system must prevent ambiguous overlapping cost periods.

Example:

Jan 1 → 180
Mar 1 → 190
Jun 1 → 200

is valid.

The implementation must define deterministic behavior for duplicate effective dates according to the established data model.

14. Product Association

Every cost record must reference a valid Product.

The Product must belong to the same Business.

Business
↓
Product
↓
Cost History 15. Business Isolation

A user must never access another Business's cost history.

Every query must establish:

Authenticated User
↓
Business
↓
Product
↓
Cost History 16. Authorization
OWNER

May:

Create cost records.
View historical costs.
Review cost changes.
Use historical cost information for management.
WORKER

May:

View cost information required for authorized operations.

Workers must not alter historical cost records unless explicitly permitted by the established operational rules.

17. Monetary Precision

Costs must not be represented using binary floating-point values for authoritative monetary storage.

Use the project's exact monetary representation.

Calculations must preserve exact monetary values.

18. API Contract
    Create
    POST /product-cost-history
    List
    GET /product-cost-history

Supported filtering:

productId
dateFrom
dateTo
Retrieve
GET /product-cost-history/:id
Historical Cost Lookup

If exposed separately:

GET /products/:productId/cost-history/current
GET /products/:productId/cost-history/at

The exact endpoint naming must follow the existing backend conventions.

19. Validation

Validate:

Product exists.
Product belongs to Business.
Cost is valid.
Effective date is valid.
User is authorized.
Historical ordering is valid.
Duplicate/ambiguous effective dates are handled deterministically. 20. Integration With Profit

Profit calculations must use:

## Revenue

# Historical Product Cost

Gross Profit

The cost must correspond to the relevant transaction/shift date.

Current product cost must never automatically replace historical cost.

21. Integration With Reports

Reports may query:

Product
↓
Cost History
↓
Historical Cost
↓
Report

Reports must be reproducible from stored records.

22. Transaction Safety

Cost creation:

BEGIN
↓
Validate Product
↓
Validate Cost
↓
Validate Effective Date
↓
Create History Record
↓
COMMIT

Failure:

ROLLBACK 23. Error Handling

Handle:

Product not found
Business mismatch
Unauthorized access
Invalid cost
Invalid effective date
Ambiguous effective date
Duplicate historical record
Database failure

Use the established application error format.

Never expose raw database errors.

24. Performance

The system must:

Index Product + effective date.
Retrieve historical cost efficiently.
Avoid unnecessary relation loading.
Support reporting queries efficiently.
Avoid N+1 queries. 25. Testing Requirements

Verify:

Cost 180
↓
New cost 190
↓
Both records remain

Historical lookup:

Before Mar → 180
After Mar → 190

Verify Business isolation.

Verify historical records cannot be silently modified.

Verify profit calculations use the correct historical cost.

Verify duplicate/ambiguous effective dates are rejected or deterministically handled.

26. Completion Criteria
    ✓ Cost creation works
    ✓ Historical lookup works
    ✓ Effective dates work
    ✓ Product ownership works
    ✓ Business isolation works
    ✓ Historical records remain immutable
    ✓ Monetary precision is preserved
    ✓ Profit integration works
    ✓ Reports integration works
    ✓ Authorization works
    ✓ Validation works
    ✓ Error handling works
    ✓ Transaction safety works
    ✓ Performance indexes exist
    ✓ Tests pass
    ✓ Application builds
27. Implementation Algorithm
    Step 1 — Establish Product Cost
    Product
    ↓
    Cost

Verify the system knows the current cost.

Step 2 — Establish Cost History
Cost Changes
↓
Historical Records

Verify previous costs remain intact.

Step 3 — Establish Historical Lookup
Date

- Product
  ↓
  Correct Historical Cost
  Step 4 — Connect Profit
  Operational Revenue
- Historical Cost
  ↓
  Profit
  Step 5 — Connect Reports
  Historical Cost
  ↓
  Reports / Analytics
  Step 6 — Verify Complete Reality
  Cost changes
  ↓
  Historical records
  ↓
  Historical lookup
  ↓
  Profit calculation
  ↓
  Reports
  Step 7 — Transition
  Cost history verified
  ↓
  Profit verified
  ↓
  Reports verified
  ↓
  Next capability
