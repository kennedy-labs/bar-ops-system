INVENTORY_ITEMS_DESIGN_ARCHITECTURE.md

Static technical contract for the Inventory Items capability.

The AI agent must translate this specification into working software.
It must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Inventory Items capability represents the physical quantity of a Product currently held at a Stock Location.

It connects:

Product
↓
Product Unit
↓
Stock Location
↓
Inventory Item
↓
Current Quantity

Inventory is the system's current representation of physical stock.

It does not own:

Product identity.
Product Unit definitions.
Stock Location identity.
Shift state.
Stock movement history.
Transfer workflow.
Payments.
Expenses.
Profit calculations. 2. Requirements: Functional and Non-functional
Functional Requirements

The system must:

Create Inventory Items.
Retrieve Inventory Items.
List Inventory Items.
Associate each Inventory Item with a Product.
Associate each Inventory Item with a Product Unit where required.
Associate each Inventory Item with a Stock Location.
Store the current quantity.
Update quantity through authorized stock operations.
Allow operational systems to read current stock.
Support opening and closing stock verification through dependent shift capabilities.
Support stock additions and reductions.
Support stock transfers through the appropriate movement/transfer capability.
Prevent invalid Product/Unit/Location combinations.
Maintain Business isolation.
Maintain Branch isolation.
Preserve current inventory state accurately.
Non-functional Requirements

The capability must provide:

Accurate quantities.
Referential integrity.
Atomic stock updates.
Business isolation.
Branch isolation.
Reliable persistence.
Deterministic quantity behavior.
Consistent authorization.
Consistent validation.
Reliable concurrent updates.
No duplicate current-stock source of truth.
Traceability through Stock Movements. 3. Dependencies
Depends On
Business
Branch
Product
Product Unit
Stock Location
Authentication / Authorization
Prisma
PostgreSQL
Used By
Shifts
Shift Stock Items
Stock Movements
Transfers
Reports
Analytics
Discrepancies

Inventory Items provide the current physical stock state consumed by these capabilities.

4. Design Principles
   An Inventory Item represents current stock at a specific location.
   Every Inventory Item belongs to one Product.
   Every Inventory Item belongs to one Stock Location.
   Every Stock Location belongs to one Branch.
   Every Branch belongs to one Business.
   Therefore every Inventory Item belongs to exactly one Business.
   Product identity must come from Product.
   Unit identity must come from Product Unit.
   Location identity must come from Stock Location.
   Current quantity must have one authoritative source.
   Stock changes must be traceable through Stock Movements.
   Inventory quantity must not be changed through arbitrary descriptive Product operations.
   Business and Branch boundaries must always be enforced.
   Historical stock changes belong to Stock Movements, not Inventory Items.
   Inventory must represent current state; movement history represents how that state changed.
5. Architecture
   Business
   │
   └── Branch
   │
   └── Stock Location
   │
   └── Inventory Item
   │
   ├── Product
   │
   └── Product Unit

Operationally:

Physical Reality
↓
Stock Operation
↓
Stock Movement
↓
Inventory Quantity

Inventory answers:

How much of this Product currently exists at this location?

6. Module Skeleton
   Inventory Items
   │
   ├── Product Association
   ├── Product Unit Association
   ├── Stock Location Association
   ├── Current Quantity
   ├── Business Ownership
   ├── Branch Ownership
   │
   ├── API
   │ ├── Create
   │ ├── List
   │ ├── Retrieve
   │ └── Read Current State
   │
   ├── Validation
   ├── Authorization
   ├── Transaction Safety
   └── Persistence
   └── Prisma
7. File Structure
   backend/
   ├── src/
   │ └── inventory-items/
   │ ├── inventory-items.module.ts
   │ ├── inventory-items.controller.ts
   │ ├── inventory-items.service.ts
   │ │
   │ ├── dto/
   │ │ ├── create-inventory-item.dto.ts
   │ │ └── update-inventory-item.dto.ts
   │ │
   │ └── entities/
   │ └── inventory-item.entity.ts
   │
   └── prisma/
   └── schema.prisma

If the existing project uses repositories, mappers, command handlers, or another established structure, preserve that structure.

Do not introduce a second architecture.

8. Entity Design

Conceptual fields:

id
productId
productUnitId
stockLocationId
quantity
createdAt
updatedAt

The exact fields must match the established Prisma schema.

Field Requirements
Field Requirement
id Stable unique identifier
productId Required Product reference
productUnitId Required where the schema models the unit explicitly
stockLocationId Required Stock Location reference
quantity Current physical quantity
createdAt Automatically generated
updatedAt Automatically maintained 9. Inventory Identity

An Inventory Item represents a specific combination of:

Product

- Unit
- Location

Example:

Tusker

- Bottle
- Counter

The resulting Inventory Item represents:

Tusker bottles currently at the Counter 10. Quantity

Quantity represents the current known physical stock for the Inventory Item.

Example:

Product: Tusker
Unit: Bottle
Location: Counter
Quantity: 48

The value 48 is current state.

It is not the historical explanation for how the system arrived at 48.

That explanation belongs to Stock Movements.

11. Quantity Rules

The system must:

Reject invalid quantities.
Prevent unintended negative stock where the established operational rules prohibit it.
Preserve required decimal precision.
Avoid floating-point errors.
Use the database-supported numeric representation.
Perform stock changes atomically.

The implementation must follow the established quantity semantics already defined by the backend.

12. Inventory Uniqueness

Where the operational design requires one current stock record for each:

Product

- Product Unit
- Stock Location

the database must enforce uniqueness.

Conceptually:

@@unique([
productId,
productUnitId,
stockLocationId
])

Do not allow duplicate current-stock records for the same Product/Unit/Location combination.

If the existing schema defines a different authoritative key, preserve it.

13. Prisma Design

Conceptual example:

model InventoryItem {
id String @id @default(cuid())

productId String
product Product @relation(fields: [productId], references: [id])

productUnitId String
productUnit ProductUnit @relation(fields: [productUnitId], references: [id])

stockLocationId String
stockLocation StockLocation @relation(fields: [stockLocationId], references: [id])

quantity Decimal

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@unique([productId, productUnitId, stockLocationId])
@@index([stockLocationId])
@@index([productId])
}

The actual Prisma model must follow the established project schema.

Do not duplicate the model.

14. Database Constraints

The database must enforce:

Valid Product reference.
Valid Product Unit reference.
Valid Stock Location reference.
Valid quantity representation.
Required relationships.
Inventory uniqueness.
Referential integrity.

The database must not permit an Inventory Item referencing a nonexistent entity.

15. Business Isolation

Inventory ownership follows:

Business
↓
Branch
↓
Stock Location
↓
Inventory Item

Product ownership must also be checked:

Business
↓
Product
↓
Inventory Item

Therefore an Inventory Item must only combine entities belonging to the same Business.

The system must reject combinations such as:

Business A Product

- Business B Stock Location

16. Branch Isolation

A Stock Location belongs to one Branch.

Therefore:

Branch A
↓
Counter A
↓
Inventory A

must not be exposed as:

Branch B inventory

unless an explicit transfer has created the appropriate destination state.

17. Product Association

Every Inventory Item must reference a valid Product.

The Product must belong to the same Business as the Stock Location.

Do not duplicate Product name or description inside Inventory as the authoritative identity.

18. Product Unit Association

Every quantity must have an understood measurement.

Example:

Product: Tusker
Unit: Bottle
Quantity: 48

The system must not treat:

48

as meaningful without its unit context.

Product Units remain the authority for measurement definitions.

19. Stock Location Association

Every Inventory Item must identify where the stock exists.

Example:

Product
↓
Tusker
↓
Unit: Bottle
↓
Location: Counter
↓
Quantity: 48

Inventory must not store a free-form location name as its authoritative location.

20. API Contract
    Create Inventory Item
    POST /inventory-items

Example:

{
"productId": "product-id",
"productUnitId": "unit-id",
"stockLocationId": "location-id",
"quantity": 48
}

The backend must verify:

Product belongs to Business
Unit belongs to Product
Location belongs to Business

before persistence.

21. List Inventory
    GET /inventory-items

Returns current inventory for the authorized Business.

Optional filtering may include:

branchId
stockLocationId
productId
productUnitId

Every filter remains Business-scoped.

22. Get Inventory Item
    GET /inventory-items/:id

Returns the Inventory Item only when it belongs to the authenticated Business.

23. Update Inventory
    PATCH /inventory-items/:id

Direct quantity modification must be tightly controlled.

Normal operational quantity changes should occur through the appropriate stock operation and Stock Movement process.

The Inventory Item is not a free-form counter that any caller may overwrite.

24. Stock Change Architecture

A normal stock change follows:

Physical Reality
↓
Authorized Operation
↓
Stock Movement
↓
Inventory Update

Example:

48 bottles
↓
10 bottles sold/removed
↓
Stock Movement
↓
38 bottles

The movement explains the change.

Inventory stores the resulting current state.

25. Stock Addition

Example:

Current Inventory
48 bottles
↓
Stock added
12 bottles
↓
New Inventory
60 bottles

The implementation must:

Validate the Product.
Validate the Unit.
Validate the Location.
Validate Business ownership.
Record the stock operation.
Update Inventory atomically.
Preserve the movement record. 26. Stock Reduction

Example:

Current Inventory
60 bottles
↓
Stock reduced
8 bottles
↓
New Inventory
52 bottles

The implementation must validate sufficient stock where the operational rules require it.

Do not allow concurrent requests to create incorrect quantities.

27. Stock Transfer

Transfer behavior must not be implemented as an arbitrary Inventory overwrite.

Conceptually:

Source Inventory
↓
Reduce source
↓
Transfer record
↓
Increase destination
↓
Destination Inventory

The complete operation must be atomic.

A transfer must not leave:

Source reduced

- Destination not increased

or:

Destination increased

- Source not reduced

28. Transaction Safety

Operations that change inventory and create corresponding movement records must use a database transaction.

Conceptually:

BEGIN
↓
Validate
↓
Create Movement
↓
Update Inventory
↓
COMMIT

If any required step fails:

ROLLBACK

No partial stock state may remain.

29. Concurrency

Inventory operations must account for simultaneous operations.

Example:

Current = 10

Two workers attempt:

Worker A reduces 7
Worker B reduces 6

The system must not incorrectly allow both operations to produce an impossible state.

Inventory updates must use atomic database-safe operations and appropriate transaction behavior.

30. Shifts Boundary

Shift Stock Items represent the stock state associated with a shift.

Inventory represents the current physical stock state.

Inventory
↓
Current stock reality

Shift Stock Item
↓
Shift-specific opening/closing reality

They must not become competing sources of truth.

31. Opening Stock

At shift opening:

Current Inventory
↓
Opening Stock
↓
Worker physically counts
↓
Verified / inconsistency reported

The Inventory capability provides the current system stock.

The Shift capability owns the opening-stock workflow.

32. Closing Stock

At shift closing:

Current physical stock
↓
Worker counts
↓
Closing Stock
↓
Shift closes

The Shift capability owns closing workflow.

Inventory remains the current stock state.

33. Discrepancy Boundary

When a worker finds:

System quantity ≠ Physical quantity

the discrepancy belongs to the Discrepancies capability.

Example:

System: 48
Physical: 45
Difference: -3

Inventory does not itself become the discrepancy record.

The discrepancy records the difference and its operational context.

34. Reports Boundary

Reports may consume:

Current Inventory.
Historical Stock Movements.
Shift Stock Items.
Products.
Product Units.
Stock Locations.

Reports remain read-only.

They must not modify Inventory.

35. Authorization
    OWNER

The Owner may:

View inventory.
Manage inventory through authorized stock operations.
Review stock state.
Review stock discrepancies.
Review inventory reports.
WORKER

Workers may:

View operational stock.
Record authorized stock operations.
Participate in opening-stock verification.
Participate in closing-stock recording.
Perform permitted stock additions/reductions/transfers.

Workers must not bypass the operational stock workflow by arbitrarily rewriting inventory.

36. Security Requirements

The implementation must:

Authenticate requests.
Authorize inventory operations.
Enforce Business ownership.
Enforce Branch ownership.
Validate Product ownership.
Validate Product Unit ownership.
Validate Stock Location ownership.
Prevent cross-Business combinations.
Prevent unauthorized quantity manipulation.
Prevent partial transfer operations.
Protect database integrity. 37. Performance and Reliability

The capability must:

Index Product references.
Index Stock Location references.
Support efficient Branch inventory retrieval.
Avoid N+1 queries.
Use atomic quantity updates.
Use database transactions for multi-record stock operations.
Avoid unnecessary relation loading.
Return only required fields.
Remain reliable under concurrent stock operations. 38. Tools
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

Alternative tools must preserve:

Transaction safety.
Quantity accuracy.
Referential integrity.
Business isolation.
API behavior. 39. Testing Requirements
Inventory Creation

Verify:

Business
↓
Branch
↓
Location
↓
Product
↓
Unit
↓
Inventory Item

All relationships must belong to the same Business.

Duplicate Inventory

Attempt to create two Inventory Items representing the same:

Product

- Unit
- Location

Verify that the database/application rejects the duplicate.

Quantity Changes

Verify:

48
↓
+12
↓
60

and:

60
↓
-8
↓
52
Insufficient Stock

Attempt an invalid reduction.

Verify that the operation is rejected when the established business rules prohibit negative stock.

The existing Inventory state must remain unchanged.

Transfer

Verify:

Source = 20
Destination = 10

Transfer 5

Source = 15
Destination = 15

Verify that both sides change atomically.

Failed Transfer

Force a failure during the transfer.

Verify:

Source unchanged
Destination unchanged
No incomplete movement
Business Isolation

Verify:

Business A
↓
Inventory A

cannot be read or changed by Business B.

Branch Isolation

Verify that inventory belonging to Branch A cannot be treated as Branch B inventory.

Concurrent Operations

Test simultaneous quantity changes.

Verify that the final quantity is mathematically correct and no update is silently lost.

Shift Integration

Verify:

Inventory
↓
Opening Stock
↓
Worker verification
↓
Closing Stock

without creating competing current-stock sources.

40. Completion Criteria
    ✓ Inventory Item can be created
    ✓ Inventory Item can be retrieved
    ✓ Inventory can be listed
    ✓ Product association works
    ✓ Product Unit association works
    ✓ Stock Location association works
    ✓ Quantity representation works
    ✓ Duplicate inventory is prevented
    ✓ Business isolation works
    ✓ Branch isolation works
    ✓ Stock addition works
    ✓ Stock reduction works
    ✓ Transfer integration works
    ✓ Atomic updates work
    ✓ Transaction rollback works
    ✓ Concurrent operations are safe
    ✓ Shift opening can consume inventory state
    ✓ Shift closing can use inventory context
    ✓ Discrepancies can reference inventory reality
    ✓ Reports can consume inventory state
    ✓ Owner permissions work
    ✓ Worker permissions work
    ✓ Validation works
    ✓ Error handling works
    ✓ Database constraints work
    ✓ Tests pass
    ✓ Application builds
41. Implementation Algorithm
    Step 1 — Establish Current Stock Persistence
    Product

- Product Unit
- Stock Location
  ↓
  Inventory Item
  ↓
  Current Quantity
  ↓
  Database

Create a valid Inventory Item.

Verify that all referenced entities belong to the correct Business.

Step 2 — Establish Current Stock Retrieval
Request
↓
Inventory
↓
Product
↓
Unit
↓
Location

Verify:

List inventory.
Retrieve inventory.
Filter inventory.
Business isolation.
Branch isolation.
Step 3 — Establish Inventory Uniqueness

Verify that one current Product/Unit/Location combination cannot create competing Inventory Items.

Step 4 — Establish Stock Addition

Build the transition:

Current Stock
↓
Stock Added
↓
Movement Recorded
↓
Inventory Increased

Verify that the movement and quantity update succeed together.

Step 5 — Establish Stock Reduction

Build:

Current Stock
↓
Stock Reduced
↓
Movement Recorded
↓
Inventory Decreased

Verify insufficient-stock rules.

Step 6 — Establish Atomic Stock Changes

Verify:

Operation
↓
Movement

- Inventory Update
  ↓
  COMMIT

Force failures and verify rollback.

Step 7 — Establish Transfer Reality

Build:

Source Inventory
↓
Reduce Source
↓
Transfer
↓
Increase Destination
↓
Destination Inventory

Verify the entire transition occurs atomically.

Step 8 — Transition Into Shift Opening

Connect current Inventory to the real opening process:

Inventory
↓
Opening Stock
↓
Worker counts physical stock
↓
Verified / inconsistency reported
↓
Active Shift

Verify that the transition reflects the actual opening workflow.

Step 9 — Transition Into Shift Closing

Connect:

Active Shift
↓
Operations completed
↓
Physical closing count
↓
Closing Stock
↓
Shift closes

Verify that Inventory and Shift Stock do not become competing sources of truth.

Step 10 — Transition Into Discrepancies

Verify:

System Stock
↓
Physical Count
↓
Difference
↓
Discrepancy

The discrepancy must reference the relevant inventory/operational context.

Step 11 — Verify Complete Inventory Reality

Run the complete chain:

Product
↓
Product Unit
↓
Stock Location
↓
Inventory
↓
Stock Addition
↓
Stock Reduction
↓
Transfer
↓
Shift Opening
↓
Shift Operations
↓
Shift Closing
↓
Discrepancy
↓
Reports

Verify that current stock, operational history, and shift reality remain correctly separated.

Step 12 — Transition to the Next Capability
Inventory built
↓
Current stock verified
↓
Stock changes verified
↓
Transactions verified
↓
Transfers verified
↓
Shift transition verified
↓
Discrepancy transition verified
↓
Historical traceability verified
↓
Next implementation step

Never proceed merely because the Inventory Items module compiles.
