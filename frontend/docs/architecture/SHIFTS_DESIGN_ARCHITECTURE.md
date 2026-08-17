SHIFTS_DESIGN_ARCHITECTURE.md

Static technical contract for the Shifts capability.

The AI agent translates this specification into working software. It must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Shifts capability represents the worker's operational period of responsibility.

It controls the transition:

Opening Stock
↓
Opening Verification
↓
Active Shift
↓
Business Operations
↓
Closing Stock
↓
Reconciliation
↓
Closed Shift

A Shift establishes:

Who is responsible.
Which Business is involved.
Which Branch is involved.
When responsibility begins.
When responsibility ends.
What stock existed at opening.
What stock remained at closing.
What operations occurred during the shift.
What financial/stock result belongs to the shift. 2. Requirements: Functional and Non-functional
Functional Requirements

The system must:

Create/open shifts.
Associate a shift with a Worker.
Associate a shift with a Business.
Associate a shift with a Branch.
Establish opening stock.
Require opening-stock verification or inconsistency reporting.
Transition verified shifts into active operation.
Allow permitted business operations during an active shift.
Prevent operational actions against invalid shift states.
Record closing stock.
Reconcile the shift.
Calculate the shift's resulting financial/operational outcome.
Close shifts.
Retrieve current shift state.
Retrieve historical shifts.
Allow the Owner to review shifts.
Maintain Business and Branch isolation.
Non-functional Requirements

The capability must provide:

Deterministic lifecycle transitions.
Accurate responsibility tracking.
Transaction-safe state changes.
Business isolation.
Branch isolation.
Worker authorization.
Historical traceability.
Reliable reconciliation.
Protection against incomplete closure.
Consistent error handling.
Reliable mobile performance. 3. Dependencies
Depends On
Business
Branch
User
Inventory Item
Shift Stock Item
Stock Movement
Product
Product Unit
Stock Location
Discrepancy
Expense
Mpesa Transaction
Authentication / Authorization
Prisma
PostgreSQL
Used By
Stock Operations
Expenses
Mpesa
Discrepancies
Reports
Analytics
Profit calculations 4. Design Principles
A Worker operates through a Shift.
A Shift belongs to one Branch.
A Branch belongs to one Business.
A Worker may only perform permitted operations within an authorized Shift.
A Shift has a strict lifecycle.
Opening verification must happen before normal active operations.
Closing stock must be recorded before successful closure.
Closed shifts are historical records.
Closed shifts must not be casually modified.
Shift Stock Items represent shift-specific stock boundaries.
Inventory represents current stock.
Stock Movements represent stock changes.
Expenses belong to the operational period in which they occurred.
Payments belong to the operational period in which they occurred.
Reconciliation uses authoritative records from those capabilities.
The Shift coordinates the operational period; it does not duplicate every underlying record. 5. Operational Lifecycle
┌──────────────────────┐
│ NO ACTIVE SHIFT │
└──────────┬───────────┘
│
▼
┌──────────────────────┐
│ OPENING │
└──────────┬───────────┘
│
Verify / Report
│
▼
┌──────────────────────┐
│ ACTIVE │
└──────────┬───────────┘
│
End shift
│
▼
┌──────────────────────┐
│ CLOSING │
└──────────┬───────────┘
│
Reconcile
│
▼
┌──────────────────────┐
│ CLOSED │
└──────────────────────┘

The lifecycle is authoritative.

6. Module Skeleton
   Shifts
   │
   ├── Shift Lifecycle
   │ ├── Open
   │ ├── Opening Verification
   │ ├── Active
   │ ├── Closing
   │ └── Closed
   │
   ├── Responsibility
   │ ├── Worker
   │ ├── Branch
   │ └── Business
   │
   ├── Stock
   │ ├── Opening Stock
   │ ├── Closing Stock
   │ └── Shift Stock Items
   │
   ├── Operations
   │ ├── Stock Movements
   │ ├── Transfers
   │ ├── Expenses
   │ └── Payments
   │
   ├── Reconciliation
   │ ├── Stock
   │ ├── Payments
   │ ├── Expenses
   │ └── Profit/Loss
   │
   ├── API
   ├── Validation
   ├── Authorization
   └── Persistence
7. File Structure
   backend/
   ├── src/
   │ └── shifts/
   │ ├── shifts.module.ts
   │ ├── shifts.controller.ts
   │ ├── shifts.service.ts
   │ │
   │ ├── dto/
   │ │ ├── create-shift.dto.ts
   │ │ ├── start-shift.dto.ts
   │ │ ├── close-shift.dto.ts
   │ │ └── shift-filter.dto.ts
   │ │
   │ └── entities/
   │ └── shift.entity.ts
   │
   └── prisma/
   └── schema.prisma

Preserve established project architecture.

8. Entity Design

Conceptual fields:

id
businessId
branchId
workerId
status
openedAt
closedAt
createdAt
updatedAt

Additional fields may exist in the established schema for reconciliation and shift summaries.

The exact Prisma model remains authoritative.

9. Shift Identity

Every Shift must have:

Business

- Branch
- Worker
- Lifecycle
- Time period

Example:

Business: Main Bar
Branch: Nairobi
Worker: John
Status: ACTIVE
Opened: 08:00 10. Worker Responsibility

The Worker is the operational actor responsible for the shift.

During an active shift, the system must know:

WHO
↓
IS RESPONSIBLE
↓
FOR WHICH BRANCH
↓
DURING WHICH PERIOD

A worker must not operate under another worker's active shift.

11. One Active Shift Rule

The system must enforce the established operational rule for active shifts.

Where the operational model requires one active shift per Worker:

Worker
↓
ONE ACTIVE SHIFT

Attempting to open another active shift must be rejected.

Where the Branch requires one active operational shift at a time, that rule must also be enforced.

Do not create overlapping shifts that violate the established operational reality.

12. Opening Shift

Opening begins:

Worker
↓
Starts Shift
↓
System loads Opening Stock

The Worker enters the physical counter and counts the actual stock.

13. Opening Verification

The Worker compares:

System Opening Stock
VS
Physical Opening Stock

Two valid outcomes:

MATCH

or:

INCONSISTENCY REPORTED

The worker must make the required decision before the shift transitions into normal active operation.

14. Opening Transition

Required transition:

OPENING
↓
Worker Counts Stock
↓
Verify / Report
↓
ACTIVE

This transition must never be silently skipped.

15. Active Shift

Once the opening state is completed:

ACTIVE SHIFT

The Worker can perform permitted business operations.

These may include:

Receiving payments.
Recording expenses.
Adding stock.
Reducing stock.
Transferring stock.
Recording discrepancies when required.

The Shift provides the operational context.

The underlying modules own their individual records.

16. Operational Context

During an active shift:

Worker
│
└── Active Shift
│
├── Stock
├── Transfers
├── Expenses
├── Payments
└── Discrepancies

Each operation must reference the correct shift where the existing model requires it.

17. Stock Integration

Stock operations during a shift follow:

Active Shift
↓
Stock Operation
↓
Stock Movement
↓
Inventory

Examples:

ADD
REDUCE
TRANSFER

The Shift does not duplicate Inventory quantities.

18. Expense Integration

Expenses occurring during the shift must be associated with the correct operational context.

Active Shift
↓
Expense
↓
Shift Reconciliation

The Expense module remains authoritative for expense records.

19. Payment Integration

Payments occurring during the shift must be associated with the correct shift context where required.

Active Shift
↓
Cash / Mpesa Payment
↓
Payment Records
↓
Shift Reconciliation

The Shift does not become the source of truth for Mpesa transactions.

20. Mpesa Integration

Mpesa activity relevant to the shift may include:

Mpesa Paybill
Pochi la Biashara
Send Money
Buy Goods and Services

The Mpesa Transactions capability owns transaction records.

The Shift associates relevant transactions with the operational period where required.

21. Transfer Integration

A transfer during a shift follows:

Active Shift
↓
Transfer
↓
Source Reduction

- Destination Addition
  ↓
  Stock Movements
  ↓
  Inventory

The Shift provides context.

The Transfer capability owns the transfer workflow.

22. Discrepancy Integration

Discrepancies may arise during opening, active operation, or closing.

Example:

Expected
↓
Physical Reality
↓
Difference
↓
Discrepancy

The Discrepancy module owns the discrepancy record.

The Shift provides the operational context.

23. Ending a Shift

Ending begins:

ACTIVE
↓
Worker finishes operations
↓
Worker begins closing

The system must transition into the closing state rather than immediately marking the shift closed.

24. Closing Stock

The Worker counts the remaining physical stock.

Physical Counter
↓
Closing Count
↓
Shift Stock Items

The closing quantity must be recorded before closure.

25. Closing Transition

Required sequence:

ACTIVE
↓
CLOSING
↓
Closing Stock Recorded
↓
Reconciliation
↓
CLOSED

The system must not skip the closing state.

26. Reconciliation

The shift reconciliation consumes authoritative records:

Opening Stock

- Stock Movements
- Closing Stock
- Payments
- Expenses
- Other established shift records
  ↓
  Shift Reconciliation
  ↓
  Profit / Loss

The exact formulas must follow the established business design.

The Shift module must not create competing versions of these calculations.

27. Profit/Loss

After closing, the system automatically calculates the shift's financial result according to the established business rules.

Conceptually:

## Revenue

## Expenses

# Applicable Stock Cost

Profit / Loss

The existing financial architecture remains authoritative for the exact calculation.

28. Closed Shift

A closed shift is historical.

CLOSED

It must preserve:

Worker.
Branch.
Opening state.
Closing state.
Operational records.
Reconciliation result.
Opening/closing timestamps.
Relevant discrepancies. 29. Closed Shift Modification

After closure:

DO NOT
↓
Rewrite historical shift state

If correction is required, use the established correction mechanism.

Do not silently alter the historical operational record.

30. API Contract
    Open Shift
    POST /shifts

Creates the shift-opening process.

Get Current Shift
GET /shifts/current

Returns the authenticated worker's current operational shift state.

Get Shift
GET /shifts/:id

Returns the authorized shift.

List Shifts
GET /shifts

Owner-level filtering may include:

branchId
workerId
status
dateFrom
dateTo
Begin Closing
POST /shifts/:id/close

This initiates the closing process according to the established backend contract.

31. API State Protection

Every shift operation must verify the current lifecycle state.

Examples:

OPENING → cannot perform normal operations

ACTIVE → normal operations permitted

CLOSING → new normal operations restricted

CLOSED → historical/read-only

Exact restrictions must follow the established operational rules.

32. Authorization
    OWNER

The Owner may:

View shifts.
Review historical shifts.
Review operational performance.
Review reconciliations.
Review discrepancies.
Access management information.

The Owner has manager/admin authority in this system.

There is no separate Manager actor.

WORKER

The Worker may:

Start their shift.
View opening state.
Verify/report opening stock.
Perform permitted operations during the active shift.
Record closing stock.
End their shift.

Workers must not access management-only operations.

33. Business Isolation

Every Shift must belong to exactly one Business.

Every related entity must belong to that Business.

Reject:

Business A

- Branch B
- Worker C

when those entities belong to different businesses.

34. Branch Isolation

Every shift belongs to one Branch.

Branch-level access must respect the Owner's management permissions and the Worker's operational scope.

A Worker must not operate another Branch's shift unless explicitly authorized by the established rules.

35. Transaction Safety

Lifecycle transitions involving multiple records must use transactions.

Example opening:

BEGIN
↓
Create/open Shift
↓
Load/create Shift Stock Items
↓
Establish Opening State
↓
COMMIT

Opening verification:

BEGIN
↓
Record physical count
↓
Verify OR create discrepancy
↓
Transition Shift
↓
COMMIT

Closing:

BEGIN
↓
Record closing stock
↓
Reconcile
↓
Calculate result
↓
Close Shift
↓
COMMIT

Failure must roll back all dependent state that must remain atomic.

36. Concurrency

The system must prevent:

Two workers opening the same operational shift.
One worker closing a shift while another performs a conflicting operation.
Operations being accepted after closure.
Duplicate lifecycle transitions.
Lost updates to shift state.

Lifecycle transitions must be database-safe.

37. Validation

Before opening:

Worker must be authenticated.
Worker must belong to the Business.
Branch must belong to the Business.
Worker must be permitted to operate the Branch.
No conflicting active shift may exist.

Before active operation:

Shift must be in the correct state.
Worker must be authorized.
Required opening decision must be complete.

Before closing:

Shift must be active.
Worker must be authorized.
Required closing stock must be recorded.
Required reconciliation data must be available. 38. Error Handling

Handle:

No active shift
Active shift already exists
Shift not found
Unauthorized worker
Wrong Branch
Wrong Business
Invalid lifecycle transition
Opening verification incomplete
Closing stock incomplete
Shift already closed
Concurrent state transition
Database failure

Use the project's standard error-response format.

Never expose raw database errors.

39. Performance

The Shift capability must:

Retrieve current shift quickly.
Load opening stock efficiently.
Load closing stock efficiently.
Avoid N+1 queries.
Use indexed Worker/Branch/status fields.
Avoid loading unnecessary historical data into mobile views.
Return compact operational responses.
Remain responsive on mobile networks. 40. Tools
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

Alternatives must preserve lifecycle, transaction, and consistency behavior.

41. Testing Requirements
    Open Shift

Verify:

Worker
↓
Open Shift
↓
OPENING
Opening Verification

Matching:

System = Physical
↓
VERIFIED
↓
ACTIVE

Mismatch:

System ≠ Physical
↓
INCONSISTENCY REPORTED
↓
ACTIVE according to established rule
Active Operations

Verify:

ACTIVE
↓
Payment
Expense
Stock operation
Transfer

Each operation is accepted and associated correctly.

Invalid Operation

Attempt an operational action before opening verification.

Verify rejection.

Closing

Verify:

ACTIVE
↓
CLOSING
↓
Closing Stock
↓
Reconciliation
↓
CLOSED
Closed Shift

Attempt an operational mutation after closure.

Verify rejection.

Business Isolation

Business A cannot access Business B shifts.

Worker Isolation

Worker A cannot operate Worker B's shift unless explicitly permitted.

Branch Isolation

Unauthorized cross-Branch operation must fail.

Concurrent Closure

Two simultaneous close requests must result in exactly one successful lifecycle transition.

42. Completion Criteria
    ✓ Shift can be opened
    ✓ Worker is assigned
    ✓ Branch is assigned
    ✓ Business ownership works
    ✓ Opening stock loads
    ✓ Physical opening count works
    ✓ Opening verification works
    ✓ Inconsistency transition works
    ✓ ACTIVE transition works
    ✓ Active operations connect correctly
    ✓ Stock operations connect
    ✓ Transfers connect
    ✓ Expenses connect
    ✓ Payments connect
    ✓ Mpesa connects
    ✓ Closing state works
    ✓ Closing stock works
    ✓ Reconciliation works
    ✓ Profit/Loss calculation connects
    ✓ CLOSED transition works
    ✓ Historical shift state is protected
    ✓ Business isolation works
    ✓ Branch isolation works
    ✓ Worker authorization works
    ✓ Owner authorization works
    ✓ Concurrent transitions are safe
    ✓ Validation works
    ✓ Error handling works
    ✓ Tests pass
    ✓ Application builds
43. Implementation Algorithm
    Step 1 — Establish Shift Creation

Build:

Worker

- Branch
- Business
  ↓
  Shift
  ↓
  OPENING

Verify that the Worker can start exactly the operational shift permitted by the business rules.

Step 2 — Establish Opening Stock Transition

Build:

OPENING
↓
Load Inventory State
↓
Create/prepare Shift Stock Items
↓
Present Opening Stock

Verify the Worker sees the correct system opening state.

Step 3 — Establish Physical Verification

Build:

Opening Stock
↓
Worker Counts Counter
↓
Physical Quantity
↓
Compare

Verify matching and mismatching scenarios.

Step 4 — Establish Inconsistency Transition

Build:

Mismatch
↓
Report Inconsistency
↓
Discrepancy
↓
Opening Process Complete

Verify the worker can proceed according to the established operational rule.

Step 5 — Establish Active Shift

Build:

Verified
OR
Inconsistency Reported
↓
ACTIVE

Verify normal operations become available only after this transition.

Step 6 — Connect Business Operations

Connect:

ACTIVE
│
├── Payments
├── Mpesa
├── Expenses
├── Stock Additions
├── Stock Reductions
├── Transfers
└── Discrepancies

Verify every operation is associated with the correct operational period.

Step 7 — Establish Closing Transition

Build:

ACTIVE
↓
Worker Ends Operations
↓
CLOSING

Verify normal operations are restricted according to the closing state.

Step 8 — Establish Closing Stock

Build:

CLOSING
↓
Worker Counts Remaining Stock
↓
Closing Stock Recorded

Verify all required stock is accounted for.

Step 9 — Establish Reconciliation

Build:

Opening

- Operations
- Payments
- Expenses
- Stock Changes
- Closing
  ↓
  Reconciliation

Verify the established reconciliation calculations.

Step 10 — Establish Profit/Loss

Connect:

Reconciliation
↓
Profit/Loss
↓
Shift Result

Verify the result is calculated automatically after the required records are complete.

Step 11 — Establish Closed State

Build:

Closing Complete
↓
Reconciliation Complete
↓
CLOSED

Verify the shift becomes historical and protected from ordinary operational mutation.

Step 12 — Verify the Complete Reality

Run the complete journey:

Build Opening Shift
↓
Verify Opening Stock
↓
Transition Into Active Shift
↓
Record Operations
↓
Transition Into Closing
↓
Record Closing Stock
↓
Reconcile
↓
Calculate Profit/Loss
↓
Close Shift

This is the authoritative operational journey.

Step 13 — Transition to the Next Capability
Shift lifecycle verified
↓
Opening verified
↓
Active operations verified
↓
Closing verified
↓
Reconciliation verified
↓
Historical closure verified
↓
Next implementation step

Never proceed merely because the Shifts module compiles.
