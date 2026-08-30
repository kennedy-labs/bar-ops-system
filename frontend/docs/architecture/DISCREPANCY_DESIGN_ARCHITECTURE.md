DISCREPANCY_DESIGN_ARCHITECTURE.md

Static technical contract. AI agents translate this specification into software. They must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Discrepancy capability records situations where the physical business reality does not match the system's expected state.

It provides the accountability bridge between:

System State
↓
Physical Reality
↓
Difference Detected
↓
Discrepancy Recorded
↓
Owner Visibility
↓
Investigation / Reconciliation

A discrepancy is a record of a difference, not an automatic explanation of why the difference occurred.

2. Requirements: Functional and Non-functional
   Functional Requirements

The system must:

Record stock discrepancies.
Record financial discrepancies.
Associate discrepancies with the correct Business.
Associate discrepancies with the correct Branch/location.
Associate discrepancies with the relevant Shift where applicable.
Identify the affected product/item.
Record expected quantity and expected value.
Record actual quantity and actual value.
Calculate the quantity difference.
Calculate the financial variance.
Record who reported the discrepancy.
Record when it was reported.
Allow workers to report discrepancies during operations.
Allow the Owner to review discrepancies.
Preserve discrepancy history.
Make discrepancies available to reconciliation.
Make discrepancies available to reports and analytics.
Non-functional Requirements

The capability must provide:

Exact quantity calculations.
Business isolation.
Branch isolation.
Shift traceability.
Historical integrity.
Accountability.
Deterministic discrepancy calculations.
Reliable performance.
Mobile-friendly operation.
No silent deletion or rewriting of discrepancy history. 3. Dependencies
Depends On
Business
Branch
User
Product
Product Unit
Inventory Item
Stock Location
Shift
Shift Stock Item
Stock Movement
Authentication / Authorization
Prisma
PostgreSQL
Used By
Shift reconciliation
Inventory
Reports
Analytics
Owner management 4. Design Principles
A discrepancy records a difference between expected and actual reality.
The discrepancy itself does not determine the cause.
The original operational records remain authoritative.
A discrepancy must never silently alter historical records.
Expected and actual quantities must remain separately traceable.
The system must preserve who reported the difference.
The system must preserve when the difference was detected.
Business ownership must always be enforced.
Branch/location ownership must always be enforced.
Discrepancies must remain available for later investigation.
A discrepancy must not be used as a substitute for Stock Movement. 5. Operational Model

The core reality is:

System says:
10 bottles

Worker counts:
8 bottles

↓
Difference detected

Expected = 10
Actual = 8
Difference = -2

↓
Discrepancy recorded

The system must preserve both states.

6. Discrepancy Lifecycle
   Difference Detected
   ↓
   Discrepancy Reported
   ↓
   Discrepancy Recorded
   ↓
   Owner / Reconciliation Review
   ↓
   Resolved / Investigated

If the existing backend defines explicit statuses, those statuses are authoritative.

The implementation must not invent additional lifecycle states.

7. Module Skeleton
   Discrepancies
   │
   ├── Detection
   ├── Reporting
   ├── Expected State
   ├── Actual State
   ├── Difference Calculation
   ├── Product Association
   ├── Location Association
   ├── Shift Association
   ├── User Accountability
   ├── Review
   ├── Resolution
   ├── Validation
   ├── Authorization
   └── Historical Integrity
8. File Structure
   backend/
   ├── src/
   │ └── discrepancies/
   │ ├── discrepancies.module.ts
   │ ├── discrepancies.controller.ts
   │ ├── discrepancies.service.ts
   │ │
   │ ├── dto/
   │ │ ├── create-discrepancy.dto.ts
   │ │ ├── update-discrepancy.dto.ts
   │ │ └── discrepancy-filter.dto.ts
   │ │
   │ └── entities/
   │ └── discrepancy.entity.ts
   │
   └── prisma/
   └── schema.prisma

Existing project conventions remain authoritative.

9. Entity Design

Conceptual structure:

Discrepancy
│
├── id
├── businessId
├── branchId
├── locationId
├── shiftId
├── productId
├── type
├── expectedQuantity
├── actualQuantity
├── quantityDifference
├── expectedValue
├── actualValue
├── valueVariance
├── reportedBy
├── reportedAt
├── status
├── reason / notes
├── createdAt
└── updatedAt

Exact Prisma fields remain authoritative.

9. Discrepancy Types

STOCK_SHORTAGE
CASH_SHORTAGE
MPESA_MISMATCH
TRANSFER_MISMATCH
UNCONFIRMED_ADDITION

10. Expected Quantity

Expected quantity represents what the system believed existed at the moment the discrepancy was detected.

# Expected Quantity

System State

Example:

System:
25 Coke bottles

The expected value must not simply be replaced with the actual count.

11. Actual Quantity

Actual quantity represents what the worker physically counted or verified.

# Actual Quantity

Physical Reality

Example:

Physical count:
22 Coke bottles 12. Difference Calculation

The difference must be deterministic:

# Difference

## Actual Quantity

Expected Quantity

Example:

Expected = 25
Actual = 22

Difference
= 22 - 25
= -3

Interpretation:

-3 = shortage
0 = match
+3 = excess

The sign must not be reversed.

12. Value Variance Calculation

The financial variance must be deterministic:

# Value Variance

## Actual Value

Expected Value

Example:

Expected = 5000
Actual = 4500

Variance
= 4500 - 5000
= -500

Interpretation:

-500 = shortage
0 = match
+500 = excess

The sign must not be reversed.

13. Detection

A discrepancy is detected when:

Actual Quantity
≠
Expected Quantity

If:

Actual = Expected

there is no discrepancy.

The system must not create a false discrepancy with zero difference unless explicitly required by the existing backend model.

14. Opening Shift Integration

Opening stock verification is a primary discrepancy scenario.

Shift Opens
↓
System Opening Stock
↓
Worker Counts Physical Stock
↓
Compare
↓
Match?
├── YES → Verify opening state
└── NO → Record discrepancy

The worker then begins operations using the current counter reality.

15. Active Shift Integration

Discrepancies may also be detected during normal operations where supported.

Active Shift
↓
System State
↓
Physical Reality
↓
Difference
↓
Discrepancy

The discrepancy must be associated with the relevant operational context.

16. Closing Integration

At closing:

Operations Complete
↓
Physical Closing Count
↓
Compare With System State
↓
Difference
↓
Discrepancy if required
↓
Closing Reconciliation

The discrepancy becomes part of the Shift's accountability record.

17. User Accountability

Every discrepancy must preserve the reporting actor.

Worker
↓
Detects Difference
↓
Reports Discrepancy
↓
Discrepancy

The reporting user must be derived from authentication.

A client must not be allowed to claim another user's identity.

18. Location Association

A discrepancy must identify where the difference was detected.

Business
↓
Branch
↓
Stock Location
↓
Product
↓
Discrepancy

The location must belong to the correct Business.

19. Product Association

Every stock discrepancy must identify the affected product/item.

Example:

Product:
Tusker

Expected:
12

Actual:
10

Difference:
-2

Product identity must remain stable for historical interpretation.

20. Shift Association

Where detected during a Shift:

Discrepancy
↓
Shift

The Shift must belong to the same Business and valid Branch/location context.

21. Reason / Notes

A discrepancy may contain explanatory information.

Example:

Difference:
-2

Note:
2 bottles damaged

Notes provide context.

They must not replace the structured quantity difference.

22. Resolution

Resolution is separate from detection.

Difference detected
↓
Discrepancy recorded
↓
Investigation
↓
Resolution

Recording a discrepancy must not automatically imply that its cause is known.

23. Discrepancy Does Not Automatically Adjust Stock

A critical rule:

Discrepancy
≠
Automatic Stock Adjustment

A discrepancy records the difference.

Any subsequent stock adjustment must occur through the established inventory/stock movement mechanism.

24. Historical Integrity

Once recorded, the discrepancy must preserve:

Expected Quantity
Actual Quantity
Difference
Product
Location
Shift
Reporter
Timestamp
Context

Historical facts must not be silently overwritten.

25. API Contract
    Create Discrepancy
    POST /discrepancies
    List Discrepancies
    GET /discrepancies

Supported filters may include:

branchId
locationId
shiftId
productId
status
dateFrom
dateTo
Retrieve Discrepancy
GET /discrepancies/:id
Update / Review
PATCH /discrepancies/:id

Updates must follow the established lifecycle and authorization rules.

Exact endpoint naming follows the existing backend contract.

26. Authorization
    OWNER

The Owner may:

View discrepancies.
Filter discrepancies.
Review historical discrepancies.
Investigate discrepancies.
Perform authorized resolution actions.
WORKER

Workers may:

Report discrepancies.
View discrepancies relevant to their authorized operational context.
Provide notes/context where permitted.

Workers must not silently alter historical discrepancy facts.

27. Business Isolation

Every query must follow:

Authenticated User
↓
Business
↓
Branch
↓
Location
↓
Discrepancy

A discrepancy ID alone must never grant cross-Business access.

28. Branch Isolation

Workers must only access discrepancies within their authorized operational Branches.

Worker
↓
Authorized Branch
↓
Discrepancy

Unauthorized Branch access must be rejected.

29. Validation

Validate:

Business exists.
Branch exists.
Location exists.
Location belongs to Branch/Business.
Product exists.
Product belongs to Business.
Shift exists where required.
Shift belongs to Business.
Expected quantity is valid.
Actual quantity is valid.
Quantity difference is calculated server-side.
Expected value is valid where applicable.
Actual value is valid where applicable.
Value variance is calculated server-side.
Discrepancy type is valid.
User is authorized.
Lifecycle state permits requested action. 30. Server-side Difference Calculation

The client must not be trusted to provide the authoritative difference.

Client:

Expected = 25
Actual = 22

Server calculates:

22 - 25 = -3

The authoritative difference comes from the server.

30. Server-side Variance Calculation

The client must not be trusted to provide the authoritative financial variance.

Client:

Expected Value = 5000
Actual Value = 4500

Server calculates:

4500 - 5000 = -500

The authoritative variance comes from the server.

31. Transaction Safety

Discrepancy creation must be atomic when multiple records are involved.

BEGIN
↓
Validate context
↓
Read authoritative expected state
↓
Validate actual count
↓
Calculate difference
↓
Create discrepancy
↓
COMMIT

Failure:

ROLLBACK 32. Concurrency

Protect against:

Two discrepancy reports for the same operational event.
System state changing while discrepancy is being created.
Duplicate mobile submissions.
Concurrent shift closing.
Concurrent inventory changes.

The implementation must preserve the correct operational snapshot.

33. Duplicate Protection

Mobile connectivity may cause repeated requests.

The same operational discrepancy must not accidentally be recorded multiple times because of network retries.

Use the established project idempotency mechanism where available.

34. Security

The implementation must:

Require authentication.
Enforce Business ownership.
Enforce Branch authorization.
Enforce Location authorization.
Determine reporter identity from authentication.
Calculate difference server-side.
Prevent unauthorized historical modification.
Never expose raw database errors. 35. Performance

The capability must:

Index Business.
Index Branch.
Index Location.
Index Shift.
Index Product.
Index status.
Index reportedAt.
Support date-range queries.
Avoid N+1 queries.
Return compact mobile-friendly responses. 36. Error Handling

Handle:

Discrepancy not found
Business mismatch
Branch mismatch
Location mismatch
Product mismatch
Shift mismatch
Unauthorized access
Invalid quantity
Invalid lifecycle transition
Duplicate discrepancy
Concurrent modification
Database failure

Use the established application error format.

37. Tools
    Primary
    NestJS
    TypeScript
    Prisma
    PostgreSQL
    Existing validation mechanism
    Jest
    Alternatives
    Primary Alternative
    Prisma PostgreSQL driver/query layer
    Jest Vitest
    Existing validation Zod / class-validator

Alternatives must preserve historical integrity and quantity accuracy.

38. Testing Requirements
    Matching Stock
    Expected = 20
    Actual = 20

Expected:

No discrepancy
Shortage
Expected = 20
Actual = 17

Expected:

Difference = -3
Excess
Expected = 20
Actual = 23

Expected:

Difference = +3
Opening Verification
Opening Stock
↓
Physical Count
↓
Mismatch
↓
Discrepancy

Verify the worker can continue operating using the actual counter reality.

Closing Verification
Closing Stock
↓
Physical Count
↓
Mismatch
↓
Discrepancy
↓
Closing Reconciliation
Business Isolation

Business A must never access Business B discrepancies.

Branch Isolation

Unauthorized Branch discrepancies must be inaccessible.

Reporter Accountability

Verify the authenticated Worker is recorded as the reporter.

Server Calculation

Submit an incorrect client-provided difference.

Expected:

Server ignores supplied difference
↓
Calculates actual - expected
Duplicate Submission

Submit the same discrepancy request repeatedly.

Expected:

One operational discrepancy
Historical Integrity

Verify expected, actual, difference, reporter, product, location, and Shift context remain traceable.

39. Completion Criteria
    ✓ Discrepancy creation works
    ✓ Expected quantity works
    ✓ Actual quantity works
    ✓ Difference calculation works
    ✓ Product association works
    ✓ Location association works
    ✓ Branch association works
    ✓ Shift association works
    ✓ Reporter attribution works
    ✓ Opening verification works
    ✓ Closing verification works
    ✓ Business isolation works
    ✓ Branch isolation works
    ✓ Server-side calculation works
    ✓ Duplicate protection works
    ✓ Concurrency protection works
    ✓ Historical integrity works
    ✓ Authorization works
    ✓ Validation works
    ✓ Error handling works
    ✓ Reconciliation integration works
    ✓ Reports integration works
    ✓ Analytics integration works
    ✓ Tests pass
    ✓ Application builds
40. Implementation Algorithm
    Step 1 — Establish Expected Reality
    System State
    ↓
    Expected Stock

Verify the system knows what it believes should physically exist.

Step 2 — Establish Physical Reality
Worker
↓
Counts Real Stock
↓
Actual Quantity
Step 3 — Compare Reality
Expected
vs
Actual
Match?
├── YES → Verify
└── NO → Discrepancy
Step 4 — Record the Difference
Expected Quantity

- Actual Quantity
  ↓
  Difference
  ↓
  Discrepancy
  Step 5 — Preserve Accountability
  Worker
  ↓
  Reports Difference
  ↓
  Reporter + Timestamp
  Step 6 — Connect Opening Reality
  Opening Stock
  ↓
  Physical Verification
  ↓
  Discrepancy if mismatch
  ↓
  Worker starts with current counter reality
  Step 7 — Connect Closing Reality
  Operations
  ↓
  Closing Count
  ↓
  Difference
  ↓
  Discrepancy if mismatch
  ↓
  Closing Reconciliation
  Step 8 — Connect Owner Visibility
  Discrepancies
  ↓
  Owner
  ↓
  Review / Investigation
  Step 9 — Verify Complete Discrepancy Reality
  System State
  ↓
  Physical Count
  ↓
  Difference detected
  ↓
  Discrepancy recorded
  ↓
  Shift accountability
  ↓
  Owner visibility
  ↓
  Reconciliation
  Step 10 — Transition
  Detection verified
  ↓
  Recording verified
  ↓
  Opening integration verified
  ↓
  Closing integration verified
  ↓
  Reconciliation verified
  ↓
  Owner visibility verified
  ↓
  Next capability

Never proceed merely because Discrepancies compile.
