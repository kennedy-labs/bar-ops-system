STOCK_MOVEMENTS_DESIGN_ARCHITECTURE.md

Static technical contract for the Stock Movements capability.

The AI agent must translate this specification into working software.
It must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Stock Movements capability records changes to physical stock.

Inventory represents current stock.

Stock Movements explain how that stock changed.

Inventory
↓
Current state

Stock Movement
↓
Change that produced the state

Examples:

Stock added
Stock reduced
Stock transferred
Stock adjusted

The capability provides the historical operational trail required to understand stock changes.

It does not own:

Product identity.
Product Unit definitions.
Stock Location identity.
Current Inventory quantity.
Shift state.
Transfer workflow.
Discrepancy workflow.
Payments.
Expenses.
Profit calculations. 2. Requirements: Functional and Non-functional
Functional Requirements

The system must:

Record stock additions.
Record stock reductions.
Record stock transfers where movements are part of a transfer.
Identify the Product involved.
Identify the Product Unit involved.
Identify the quantity changed.
Identify the relevant Stock Location.
Identify the Business.
Identify the Branch where applicable.
Identify the operation responsible for the movement.
Preserve movement history.
Allow authorized users to view movements.
Allow operational modules to create movements.
Prevent arbitrary deletion of historical movements.
Support filtering by relevant operational dimensions.
Provide enough information to reconstruct stock history.
Non-functional Requirements

The capability must provide:

Immutable historical records.
Accurate quantities.
Business isolation.
Branch isolation.
Referential integrity.
Transactional consistency.
Traceability.
Reliable chronological ordering.
Predictable querying.
Consistent authorization.
Consistent error handling.
No second current-stock source of truth. 3. Dependencies
Depends On
Business
Branch
Product
Product Unit
Stock Location
Inventory Items
Authentication / Authorization
Prisma
PostgreSQL
Used By
Shifts
Transfers
Discrepancies
Reports
Analytics

Stock Movements are consumed as historical operational truth.

4. Design Principles
   Stock Movements are historical records.
   Historical movements must not be silently rewritten.
   Historical movements must not be casually deleted.
   Inventory is the current stock state.
   Stock Movements explain changes to Inventory.
   A movement must identify what changed.
   A movement must identify where the change occurred.
   A movement must identify the quantity changed.
   A movement must have a clear movement type.
   Business ownership must always be enforceable.
   Branch ownership must be enforceable.
   Movement creation and Inventory updates must be atomic.
   A failed stock operation must not leave an orphan movement.
   An Inventory update without the corresponding movement must not occur for operations requiring movement history.
5. Architecture
   Physical Reality
   ↓
   Authorized Stock Operation
   ↓
   Stock Movement
   ↓
   Inventory Update
   ↓
   Current Stock

Historical view:

Movement 1
↓
Movement 2
↓
Movement 3
↓
Current Inventory

Example:

Opening: 50
↓
Added: +20
↓
Reduced: -8
↓
Transferred: -5
↓
Current: 57

The movement history explains the transition from one stock state to another.

6. Module Skeleton
   Stock Movements
   │
   ├── Movement Identity
   ├── Movement Type
   ├── Product
   ├── Product Unit
   ├── Quantity
   ├── Location
   ├── Business
   ├── Branch
   ├── Actor / Source
   ├── Historical Timestamp
   │
   ├── API
   │ ├── Create
   │ ├── List
   │ ├── Retrieve
   │ └── Filter
   │
   ├── Validation
   ├── Authorization
   ├── Transaction Safety
   └── Persistence
   └── Prisma
7. File Structure
   backend/
   ├── src/
   │ └── stock-movements/
   │ ├── stock-movements.module.ts
   │ ├── stock-movements.controller.ts
   │ ├── stock-movements.service.ts
   │ │
   │ ├── dto/
   │ │ ├── create-stock-movement.dto.ts
   │ │ └── stock-movement-filter.dto.ts
   │ │
   │ └── entities/
   │ └── stock-movement.entity.ts
   │
   └── prisma/
   └── schema.prisma

Preserve existing repository/service conventions.

Do not introduce a competing architecture.

8. Entity Design

Conceptual fields:

id
businessId
branchId
productId
productUnitId
stockLocationId
quantity
type
referenceId
referenceType
performedBy
createdAt

The exact fields must follow the established Prisma schema.

9. Movement Identity

Every movement requires a stable identifier.

Example:

Movement
├── id: movement-001
├── Product: Tusker
├── Unit: Bottle
├── Location: Counter
├── Type: ADD
└── Quantity: 20

The movement ID must remain stable.

10. Movement Types

Movement types must explicitly represent the stock change.

At minimum, where supported by the established backend:

ADD
REDUCE
TRANSFER

Additional types may exist only if already defined by the established operational design.

The implementation must not invent new movement types.

11. Quantity Semantics

The stored movement quantity represents the magnitude of the recorded stock change.

The movement type determines its meaning.

Example:

ADD
quantity = 20

means:

+20

while:

REDUCE
quantity = 8

means:

-8

Do not create ambiguity by mixing movement type and signed quantity unless the existing schema explicitly defines that convention.

12. Movement Direction

Conceptually:

ADD
↓
Inventory increases

REDUCE
↓
Inventory decreases

For transfers:

Source
↓
REDUCE

Destination
↓
ADD

Both sides must be linked to the same transfer operation where the transfer architecture requires it.

13. Historical Immutability

Once a Stock Movement has been committed as historical operational truth:

DO NOT MODIFY
DO NOT REINTERPRET
DO NOT SILENTLY DELETE

If a correction is required, the system must use the established correction/reversal mechanism rather than rewriting history.

This preserves an auditable stock trail.

14. Prisma Design

Conceptual example:

enum StockMovementType {
ADD
REDUCE
TRANSFER
}

model StockMovement {
id String @id @default(cuid())

businessId String
branchId String

productId String
productUnitId String
stockLocationId String

quantity Decimal
type StockMovementType

referenceId String?
referenceType String?

performedBy String?

createdAt DateTime @default(now())

@@index([businessId, createdAt])
@@index([branchId, createdAt])
@@index([productId, createdAt])
@@index([stockLocationId, createdAt])
}

The actual Prisma model must match the established backend schema.

Do not duplicate the model.

15. Database Constraints

The database must enforce:

Valid Product reference.
Valid Product Unit reference.
Valid Stock Location reference.
Valid Business reference.
Valid Branch reference.
Valid movement type.
Valid quantity.
Referential integrity.

Historical records must remain persistent.

16. Business Isolation

Every movement must belong to the authenticated Business context.

Conceptually:

Business
↓
Branch
↓
Stock Location
↓
Stock Movement

The Product must also belong to the same Business.

Reject:

Business A Product

- Business B Location

17. Branch Isolation

A movement occurring at a Branch must reference the correct Branch.

The system must prevent a movement belonging to Branch A from being recorded against Branch B.

18. API Contract
    Create Movement
    POST /stock-movements

Creation should normally occur through an authorized stock operation rather than arbitrary client manipulation.

Example:

{
"productId": "product-id",
"productUnitId": "unit-id",
"stockLocationId": "location-id",
"quantity": 20,
"type": "ADD"
}

The service must validate all relationships.

19. List Movements
    GET /stock-movements

May support filters such as:

branchId
stockLocationId
productId
productUnitId
type
dateFrom
dateTo
referenceId

All filters must remain Business-scoped.

20. Retrieve Movement
    GET /stock-movements/:id

The movement must only be returned when it belongs to the authorized Business.

21. Filtering

Movement history must support operational investigation.

Examples:

All movements today
All movements for Counter
All movements for Tusker
All REDUCE movements
All movements during a shift
All movements related to a transfer

Filtering must not alter historical data.

22. API Error Behavior

Handle:

Invalid input
Unauthorized request
Forbidden request
Movement not found
Product not found
Product Unit not found
Stock Location not found
Invalid quantity
Invalid movement type
Cross-Business access
Database failure

Use the project's standard error format.

Never expose raw database errors.

23. Validation

Before creating a movement:

Product must exist.
Product must belong to Business.
Product Unit must belong to Product.
Stock Location must belong to Business.
Branch must match Stock Location.
Quantity must be valid.
Movement type must be valid.
Required reference information must exist where applicable. 24. Authorization
OWNER

The Owner may:

View movements.
Filter movements.
Review stock history.
Perform authorized management operations.

Historical movement records must not be casually edited or deleted.

WORKER

Workers may:

Trigger permitted stock operations.
Create movements through permitted operational workflows.
View movements necessary for their work.

Workers must not bypass the operational workflow to rewrite stock history.

25. Inventory Relationship

The relationship is:

Stock Movement
↓
Stock change
↓
Inventory
↓
Current quantity

Example:

Inventory = 40

ADD 10
↓
Movement recorded
↓
Inventory = 50

Inventory stores 50.

The Movement stores the +10 event.

Neither replaces the other.

26. Transaction Boundary

Movement creation and Inventory modification must occur within one transaction.

BEGIN
↓
Validate operation
↓
Create movement
↓
Update inventory
↓
COMMIT

Failure:

ROLLBACK

No partial operation is permitted.

27. Stock Addition

Example:

Current = 40

ADD 10

Movement:
+10

Inventory:
50

Both records must succeed together.

28. Stock Reduction

Example:

Current = 50

REDUCE 8

Movement:
-8

Inventory:
42

Insufficient stock must be rejected when prohibited by the established operational rules.

29. Transfer

A transfer represents movement between physical stock boundaries.

Conceptually:

Source
↓
REDUCE
↓
Transfer
↓
ADD
↓
Destination

The source reduction and destination addition must belong to the same transfer transaction.

30. Shift Integration

During a shift:

Opening
↓
Operations
↓
Stock Movements
↓
Closing

Every permitted stock change during the active shift must be traceable to the relevant operational event.

The Shift capability owns shift state.

Stock Movements own stock-change history.

31. Discrepancy Integration

A discrepancy may arise when:

System Stock
≠
Physical Stock

The discrepancy capability owns the discrepancy.

Stock Movements provide historical evidence of what the system recorded.

Example:

Opening = 50
ADD = 20
REDUCE = 8

Expected = 62

Physical count = 60

Difference = -2

The movement history remains unchanged.

32. Reports Integration

Reports may use Stock Movements to calculate:

Stock additions.
Stock reductions.
Transfer activity.
Product movement history.
Location activity.
Shift activity.
Historical stock changes.

Reports remain read-only.

33. Historical Ordering

Movement records must provide a reliable chronological ordering.

At minimum:

createdAt

must be stored.

When multiple records can occur at effectively the same time, the implementation must use a deterministic secondary ordering mechanism where required.

Do not rely on accidental database ordering.

34. Audit Information

Where supported by the established architecture, a movement should identify:

Who
What
Where
When
Why/reference

Conceptually:

WHO → worker
WHAT → REDUCE 8 bottles
WHERE → Counter
WHEN → timestamp
WHY → operational reference

Do not invent audit fields that are absent from the established system.

35. Security Requirements

The implementation must:

Authenticate requests.
Authorize operational actions.
Enforce Business ownership.
Enforce Branch ownership.
Prevent cross-Business movement access.
Prevent unauthorized historical modification.
Validate all references.
Protect transaction integrity. 36. Performance and Reliability

The capability must:

Index Business and timestamp.
Index Product.
Index Stock Location.
Index Branch.
Support date-range queries.
Avoid N+1 queries.
Use transactions for stock-changing operations.
Avoid unnecessary relation loading.
Maintain reliable historical ordering. 37. Tools
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

Alternatives must preserve transactional and historical guarantees.

38. Testing Requirements
    Addition

Verify:

40
↓
ADD 10
↓
Movement +10
↓
Inventory 50
Reduction

Verify:

50
↓
REDUCE 8
↓
Movement -8
↓
Inventory 42
Failed Operation

Force an error after movement creation but before Inventory update.

Verify:

No movement
No inventory change
Transfer

Verify:

Source = 20
Destination = 10

Transfer 5

Source = 15
Destination = 15

and both movement records are correctly linked.

Historical Integrity

Create a movement.

Verify that historical information remains unchanged after later stock operations.

Business Isolation

Verify that Business A cannot read or create movements against Business B's stock.

Branch Isolation

Verify that Branch A cannot create or manipulate movements belonging to Branch B.

Shift Integration

Verify:

Opening
↓
Stock operation
↓
Movement
↓
Closing

The movement remains traceable to the operational reality.

39. Completion Criteria
    ✓ Stock Movement can be created
    ✓ Stock Movement can be retrieved
    ✓ Movements can be listed
    ✓ Movements can be filtered
    ✓ Product relationship works
    ✓ Product Unit relationship works
    ✓ Stock Location relationship works
    ✓ Business isolation works
    ✓ Branch isolation works
    ✓ ADD works
    ✓ REDUCE works
    ✓ TRANSFER integration works
    ✓ Inventory updates atomically
    ✓ Failed operations roll back
    ✓ Historical records remain immutable
    ✓ Shift integration works
    ✓ Discrepancy integration works
    ✓ Reports can consume movement history
    ✓ Owner permissions work
    ✓ Worker permissions work
    ✓ Validation works
    ✓ Error handling works
    ✓ Database constraints work
    ✓ Tests pass
    ✓ Application builds
40. Implementation Algorithm
    Step 1 — Establish Movement Persistence
    Product

- Product Unit
- Stock Location
- Quantity
- Movement Type
  ↓
  Stock Movement
  ↓
  Database

Create a valid historical movement.

Verify all references belong to the correct Business.

Step 2 — Establish Movement Retrieval
Request
↓
Movement
↓
Product
↓
Unit
↓
Location
↓
Business

Verify:

List.
Single retrieval.
Filters.
Business isolation.
Branch isolation.
Step 3 — Establish Stock Addition Transition

Build:

Physical Stock Added
↓
Authorized Operation
↓
ADD Movement
↓
Inventory Increase

Verify both movement and Inventory change succeed together.

Step 4 — Establish Stock Reduction Transition

Build:

Physical Stock Reduced
↓
Authorized Operation
↓
REDUCE Movement
↓
Inventory Decrease

Verify insufficient-stock behavior.

Step 5 — Establish Transaction Safety

Test:

Operation
↓
Movement

- Inventory
  ↓
  COMMIT

Force failure.

Verify:

ROLLBACK
Step 6 — Establish Transfer Transition

Build:

Source Reality
↓
Source Reduction
↓
Transfer
↓
Destination Addition
↓
Destination Reality

Verify the entire transition is atomic.

Step 7 — Establish Shift Transition

Connect:

Opening State
↓
Active Shift
↓
Stock Operation
↓
Stock Movement
↓
Closing State

Verify that every permitted stock change during the shift produces the required historical movement.

Step 8 — Establish Discrepancy Transition

Connect:

Expected System Stock
↓
Physical Count
↓
Difference
↓
Discrepancy

Verify that discrepancy creation does not modify historical movements.

Step 9 — Establish Reporting Transition

Connect:

Stock Movement History
↓
Reports
↓
Owner Visibility

Verify reports consume movement history without modifying it.

Step 10 — Verify Complete Stock History

Run:

Opening
↓
ADD
↓
REDUCE
↓
TRANSFER
↓
Current Inventory
↓
Closing
↓
Reports

Verify that the complete stock journey is reconstructable from the stored records.

Step 11 — Transition to the Next Capability
Stock Movements built
↓
Historical persistence verified
↓
ADD verified
↓
REDUCE verified
↓
TRANSFER verified
↓
Inventory transition verified
↓
Shift transition verified
↓
Discrepancy transition verified
↓
Reporting transition verified
↓
Next implementation step

Never proceed merely because the Stock Movements module compiles.
