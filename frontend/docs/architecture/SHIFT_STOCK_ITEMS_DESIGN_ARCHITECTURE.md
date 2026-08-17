SHIFT_STOCK_ITEMS_DESIGN_ARCHITECTURE.md

Static technical contract for Shift Stock Items.

The AI agent translates this specification into software. It must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

Shift Stock Items connect shift-specific stock reality with the system's Inventory state.

They record the stock state relevant to a particular shift, especially:

Opening Stock
↓
Physical Verification
↓
Closing Stock

They allow the system to determine what stock a worker started with, what was verified, and what remained when the shift ended.

They do not replace Inventory or Stock Movements.

2. Requirements: Functional and Non-functional
   Functional Requirements

The system must:

Associate stock with a Shift.
Associate stock with a Product.
Associate stock with a Product Unit.
Associate stock with a Stock Location where required.
Record opening quantity.
Record closing quantity.
Support opening-stock verification.
Support inconsistency reporting.
Preserve shift-specific stock records.
Support shift reconciliation.
Provide stock information required for shift calculations.
Allow authorized users to retrieve shift stock information.
Maintain Business and Branch isolation.
Non-functional Requirements

The capability must provide:

Accurate quantities.
Deterministic calculations.
Business isolation.
Branch isolation.
Referential integrity.
Historical traceability.
Reliable persistence.
Atomic updates where multiple records change together.
No competing current-stock source of truth.
Reliable integration with Shifts, Inventory, Stock Movements, and Discrepancies. 3. Dependencies
Depends On
Business
Branch
Shift
Product
Product Unit
Stock Location
Inventory Item
Stock Movement
User
Authentication / Authorization
Prisma
PostgreSQL
Used By
Shifts
Discrepancies
Reports
Analytics
Profit/Reconciliation calculations 4. Design Principles
Inventory represents current stock.
Shift Stock Items represent stock in the context of a particular shift.
Stock Movements represent historical stock changes.
Shift Stock Items must not become a second current-inventory system.
Opening stock belongs to the shift-opening process.
Closing stock belongs to the shift-closing process.
Physical verification must be distinguishable from system quantity.
Inconsistencies must be handled through the Discrepancies capability.
Historical shift information must remain reproducible.
Business ownership must always be enforced.
Branch ownership must always be enforced. 5. Architecture
Inventory
│
▼
Shift Opening
│
▼
Shift Stock Item
│
├── Opening Quantity
├── Verification
└── Closing Quantity
│
▼
Shift Closing

Operational reality:

System Opening State
↓
Worker counts physical stock
↓
Matches?
┌────┴────┐
YES NO
↓ ↓
Verify Report inconsistency
└────┬─────┘
↓
Active Shift
↓
Operations
↓
Closing Count 6. Module Skeleton
Shift Stock Items
│
├── Shift Association
├── Product Association
├── Product Unit Association
├── Stock Location Association
│
├── Opening Quantity
├── Physical Opening Quantity
├── Opening Verification
├── Closing Quantity
│
├── Business Ownership
├── Branch Ownership
│
├── API
│ ├── Create
│ ├── Retrieve
│ ├── List
│ └── Update
│
├── Validation
├── Authorization
└── Persistence
└── Prisma 7. File Structure
backend/
├── src/
│ └── shift-stock-items/
│ ├── shift-stock-items.module.ts
│ ├── shift-stock-items.controller.ts
│ ├── shift-stock-items.service.ts
│ │
│ ├── dto/
│ │ ├── create-shift-stock-item.dto.ts
│ │ ├── verify-opening-stock.dto.ts
│ │ └── record-closing-stock.dto.ts
│ │
│ └── entities/
│ └── shift-stock-item.entity.ts
│
└── prisma/
└── schema.prisma

Preserve established project conventions if repositories, validators, or other layers already exist.

8. Entity Design

Conceptual fields:

id
shiftId
productId
productUnitId
stockLocationId
openingQuantity
physicalOpeningQuantity
openingVerified
closingQuantity
createdAt
updatedAt

Exact fields must follow the established Prisma schema.

9. Shift Association

Every Shift Stock Item belongs to one Shift.

Shift
↓
Shift Stock Item

The Shift determines:

Business.
Branch.
Worker.
Shift lifecycle.
Opening context.
Closing context.

A Shift Stock Item must not belong to a Shift outside the authorized Business.

10. Product Association

Every Shift Stock Item represents a particular Product.

Example:

Shift: Morning Shift
Product: Tusker
Unit: Bottle
Opening: 48
Closing: 31

Product identity remains owned by Product.

11. Product Unit Association

The quantity must have an explicit unit where required by the existing model.

Example:

Tusker

- Bottle
- 48

The system must not treat quantities without their correct unit context as interchangeable.

12. Stock Location Association

Where the existing model requires location:

Shift Stock Item
↓
Stock Location
↓
Counter

This identifies the physical stock boundary being counted.

13. Opening Quantity

openingQuantity represents the system's opening stock state provided to the shift.

Example:

Inventory says:
48 bottles

Shift opens:
Opening Quantity = 48

This is the system's expected opening state.

14. Physical Opening Quantity

The worker counts the real physical stock.

Example:

System Opening = 48
Physical Count = 45

The physical count must be recorded separately from the system opening quantity where supported by the established model.

15. Opening Verification

Opening verification represents the worker's explicit response to the opening state.

Conceptually:

System Opening
↓
Physical Count
↓
Verification

Possible reality:

MATCH

or:

INCONSISTENCY REPORTED

The system must not allow the worker to silently continue without recording the required opening decision.

16. Opening Transition

The required operational transition is:

Shift Created/Open
↓
Opening Stock Presented
↓
Worker Counts Counter
↓
Worker Verifies OR Reports Inconsistency
↓
Active Shift

This transition is mandatory.

17. Active Shift Boundary

Once opening stock has been verified or the required inconsistency has been reported:

Shift
↓
ACTIVE

The worker operates against the current business reality.

Stock changes occurring during the shift are represented through the appropriate operational capabilities.

18. Closing Quantity

At shift end, the worker counts the remaining stock.

Example:

Closing Count:
31 bottles

This value belongs to the shift's closing state.

19. Closing Transition

The operational transition is:

Active Shift
↓
Operations Complete
↓
Worker Counts Remaining Stock
↓
Closing Quantity Recorded
↓
Shift Closed

The closing state must be recorded before the shift is considered complete.

20. Shift Stock vs Inventory

These are different realities.

Inventory
↓
Current stock state

Shift Stock Item
↓
Stock state at a particular shift boundary

Example:

Inventory now = 31

Morning Shift:
Opening = 48
Closing = 31

The Shift Stock Item preserves the shift history.

Inventory preserves current state.

21. Shift Stock vs Stock Movements
    Shift Stock Item
    ↓
    Opening / Closing state

Stock Movement
↓
Changes occurring between states

Example:

Opening = 48

ADD 10
REDUCE 12
TRANSFER 5

Closing = 41

The movements explain the operational changes.

The Shift Stock Item records the boundary states.

22. Discrepancy Integration

When:

Physical Opening ≠ System Opening

the system must create or initiate the established Discrepancy workflow.

Example:

System = 48
Physical = 45

Difference = -3

The Shift Stock Item preserves the shift context.

The Discrepancy preserves the inconsistency record.

23. Business Isolation

The ownership chain is:

Business
↓
Branch
↓
Shift
↓
Shift Stock Item

Every Shift Stock Item must therefore be accessible only within its Business.

Cross-Business access must be rejected.

24. Branch Isolation

A Shift belongs to a Branch.

Therefore its Shift Stock Items belong to that Branch context.

A Branch must not access another Branch's shift stock unless the Owner's management-level visibility explicitly permits it.

25. API Contract
    Create Shift Stock Item
    POST /shift-stock-items

Creation must validate:

Shift
Product
Product Unit
Stock Location
Business
Branch 26. List Shift Stock Items
GET /shift-stock-items

Supported filters may include:

shiftId
branchId
productId
productUnitId
stockLocationId

All queries must remain Business-scoped.

27. Retrieve Shift Stock Item
    GET /shift-stock-items/:id

The system must return the item only if it belongs to the authorized Business.

28. Verify Opening Stock

Conceptual endpoint:

POST /shift-stock-items/:id/verify-opening

Example:

{
"physicalQuantity": 45,
"verification": "INCONSISTENCY_REPORTED"
}

The exact request shape must follow the established backend contract.

The operation must record the worker's opening decision.

29. Record Closing Stock

Conceptual endpoint:

POST /shift-stock-items/:id/close

Example:

{
"closingQuantity": 31
}

The operation must only be permitted during the correct shift lifecycle state.

30. Lifecycle Rules

Shift Stock Items follow:

CREATED
↓
OPENING
↓
VERIFIED / INCONSISTENCY REPORTED
↓
ACTIVE SHIFT
↓
CLOSING
↓
CLOSED

The implementation must enforce the actual lifecycle already established by the Shift architecture.

31. Invalid Lifecycle Operations

Reject operations such as:

Verify opening after shift already closed
Record closing before opening verification
Record closing on a nonexistent shift
Modify closed shift stock
Modify another Business's shift stock 32. Authorization
OWNER

The Owner may:

View shift stock.
Review opening states.
Review closing states.
Review inconsistencies.
Review historical shift information.
WORKER

Workers may:

View their operational opening state.
Verify/report opening stock.
Record closing stock.
View stock information required for their active shift.

Workers must not modify another worker's completed shift unless the established operational rules explicitly permit it.

33. Data Integrity

The system must ensure:

Shift Stock Item
↓
Valid Shift
↓
Valid Branch
↓
Valid Business

and:

Product
↓
Same Business

and:

Stock Location
↓
Same Business
↓
Correct Branch

Invalid combinations must be rejected.

34. Transaction Safety

Operations involving:

Shift state

- Shift Stock Item
- Discrepancy

must use a transaction when they must succeed or fail together.

Example:

BEGIN
↓
Record physical count
↓
Determine match/inconsistency
↓
Create discrepancy if required
↓
Update verification state
↓
COMMIT

Failure:

ROLLBACK

No incomplete opening state may remain.

35. Closing Safety

Closing must preserve the complete closing state.

Conceptually:

BEGIN
↓
Validate active shift
↓
Validate worker authorization
↓
Record closing quantities
↓
Transition shift toward closed
↓
COMMIT

If any required closing operation fails, the shift must not be falsely represented as successfully closed.

36. Calculations

Shift Stock Items provide quantities required for reconciliation.

Example:

Opening Stock

- Stock Added

* Stock Reduced
* # Stock Transferred
  Expected Closing Stock

The exact business reconciliation formula must come from the established Shift/Profit architecture.

Shift Stock Items provide data; they do not become a second calculation authority.

37. Performance

The capability must:

Efficiently retrieve all stock items for a shift.
Efficiently retrieve stock by product.
Efficiently retrieve stock by location.
Avoid N+1 queries.
Use indexed foreign keys.
Load only required relations.
Maintain reliable mobile response times. 38. Security Requirements

The implementation must:

Authenticate users.
Authorize shift access.
Enforce Business ownership.
Enforce Branch ownership.
Enforce worker/Owner permissions.
Prevent unauthorized lifecycle transitions.
Prevent modification of completed historical state.
Validate all related entities. 39. Tools
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

Alternatives must preserve lifecycle, transaction, and data-integrity behavior.

40. Testing Requirements
    Opening Match

Verify:

System = 48
Physical = 48
↓
VERIFIED
↓
Shift can become active
Opening Inconsistency

Verify:

System = 48
Physical = 45
↓
INCONSISTENCY REPORTED
↓
Discrepancy created/initiated
↓
Worker can proceed according to established rules
Closing

Verify:

Active Shift
↓
Physical Closing Count
↓
Closing Stock recorded
↓
Shift closes
Invalid Closing

Attempt:

Opening not verified
↓
Closing

Verify rejection.

Closed Shift Modification

Attempt to modify completed shift stock.

Verify rejection.

Business Isolation

Business A must not access Business B shift stock.

Branch Isolation

Verify unauthorized Branch access is rejected.

Transaction Failure

Force failure during discrepancy/opening processing.

Verify no partial opening state remains.

41. Completion Criteria
    ✓ Shift Stock Item creation works
    ✓ Shift relationship works
    ✓ Product relationship works
    ✓ Product Unit relationship works
    ✓ Stock Location relationship works
    ✓ Opening quantity works
    ✓ Physical opening count works
    ✓ Opening verification works
    ✓ Inconsistency reporting works
    ✓ Active-shift transition works
    ✓ Closing quantity works
    ✓ Closing transition works
    ✓ Shift integration works
    ✓ Inventory integration works
    ✓ Stock Movement integration works
    ✓ Discrepancy integration works
    ✓ Business isolation works
    ✓ Branch isolation works
    ✓ Worker authorization works
    ✓ Owner authorization works
    ✓ Lifecycle rules work
    ✓ Transaction safety works
    ✓ Historical state is protected
    ✓ Validation works
    ✓ Error handling works
    ✓ Tests pass
    ✓ Application builds
42. Implementation Algorithm
    Step 1 — Establish Shift Stock Persistence
    Shift

- Product
- Unit
- Location
- Opening Quantity
  ↓
  Shift Stock Item

Create valid shift-stock records.

Verify every relationship belongs to the same operational context.

Step 2 — Establish Opening State

Build:

Shift Opens
↓
System Opening Stock Loaded
↓
Shift Stock Items Created/Prepared
↓
Worker Sees Opening Reality

Verify the worker receives the correct opening state.

Step 3 — Establish Physical Verification

Build:

System Opening
↓
Worker Counts Physical Stock
↓
Physical Quantity Recorded
↓
Compare

Verify matching quantities.

Step 4 — Establish Inconsistency Transition

Build:

System ≠ Physical
↓
Inconsistency Reported
↓
Discrepancy Workflow
↓
Opening State Complete

Verify the worker cannot silently skip the required decision.

Step 5 — Establish Active Shift Transition

Build:

Opening Verified
OR
Inconsistency Reported
↓
Active Shift
↓
Worker Begins Operations

Verify the worker operates from the resulting reality.

Step 6 — Connect Stock Operations

Connect:

Active Shift
↓
Stock Added
Stock Reduced
Stock Transferred
↓
Stock Movements
↓
Inventory

Verify the shift remains connected to the stock changes occurring during it.

Step 7 — Establish Closing State

Build:

Active Shift
↓
Operations Complete
↓
Worker Counts Physical Stock
↓
Closing Quantity Recorded

Verify every required stock item receives its closing state.

Step 8 — Establish Shift Closure Transition

Build:

Closing Stock Complete
↓
Shift Reconciliation
↓
Shift Closed

Do not allow the shift to appear successfully closed while required closing information is missing.

Step 9 — Connect Reconciliation

Connect:

Opening

- Stock Movements
- Closing
  ↓
  Shift Reconciliation
  ↓
  Profit/Loss Calculation

Use the established reconciliation authority.

Do not duplicate calculation logic inside Shift Stock Items.

Step 10 — Verify Complete Shift Stock Reality

Run the complete journey:

Opening Stock
↓
Physical Verification
↓
Inconsistency if necessary
↓
Active Shift
↓
Stock Operations
↓
Closing Count
↓
Reconciliation
↓
Shift Closed

Verify that every transition is represented correctly.

Step 11 — Transition to the Next Capability
Shift Stock Items built
↓
Opening verified
↓
Inconsistency transition verified
↓
Active transition verified
↓
Stock operations connected
↓
Closing verified
↓
Reconciliation connected
↓
Shift closure verified
↓
Next implementation step

Never proceed merely because Shift Stock Items compile.
