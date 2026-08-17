STOCK_LOCATIONS_DESIGN_ARCHITECTURE.md

Static technical contract for the Stock Locations capability.

The AI agent translates this specification into software. It must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Stock Locations capability defines where physical stock exists within the business.

It provides the physical boundary used by:

Inventory.
Shift Stock Items.
Stock Movements.
Transfers.
Opening stock.
Closing stock.

A Stock Location represents a real physical stock-holding location such as a counter, store, or other established stock area.

2. Requirements: Functional and Non-functional
   Functional Requirements

The system must:

Create stock locations.
Associate locations with a Business.
Associate locations with a Branch.
Identify the physical purpose of a location.
Allow inventory to be associated with a location.
Allow shift stock to be associated with a location.
Support stock movement between applicable locations.
Support transfers between applicable locations.
Allow the Owner to manage locations.
Allow Workers to view/use locations required for their operations.
Prevent unauthorized cross-Business access.
Prevent unauthorized cross-Branch access.
Non-functional Requirements

The capability must provide:

Accurate location ownership.
Business isolation.
Branch isolation.
Referential integrity.
Stable identifiers.
Historical traceability.
Reliable queries.
Mobile-friendly responses.
Protection against invalid stock-location relationships. 3. Dependencies
Depends On
Business
Branch
User
Authentication / Authorization
Prisma
PostgreSQL
Used By
Inventory Items
Shift Stock Items
Stock Movements
Transfers
Products
Reports
Analytics
Shifts 4. Design Principles
A Stock Location represents a real physical stock boundary.
A location belongs to one Business.
A location belongs to one Branch where the established model requires Branch ownership.
Inventory belongs to a specific physical location.
Shift opening and closing stock must use the correct location.
Stock movements must identify the correct location context.
Transfers must respect location ownership.
Locations are not products.
Locations are not inventory quantities.
Locations do not independently calculate stock.
Inventory remains the authoritative current-stock state. 5. Operational Model
Business
│
└── Branch
│
├── Counter
│
├── Store
│
└── Other Stock Location

Example:

Main Bar
│
├── Main Counter
└── Store Room

The exact locations are determined by the business configuration.

6. Module Skeleton
   Stock Locations
   │
   ├── Location Identity
   ├── Business Ownership
   ├── Branch Ownership
   │
   ├── Location Management
   │ ├── Create
   │ ├── View
   │ ├── List
   │ └── Update
   │
   ├── Inventory Association
   ├── Shift Stock Association
   ├── Stock Movement Association
   ├── Transfer Association
   │
   ├── Validation
   ├── Authorization
   └── Persistence
7. File Structure
   backend/
   ├── src/
   │ └── stock-locations/
   │ ├── stock-locations.module.ts
   │ ├── stock-locations.controller.ts
   │ ├── stock-locations.service.ts
   │ │
   │ ├── dto/
   │ │ ├── create-stock-location.dto.ts
   │ │ ├── update-stock-location.dto.ts
   │ │ └── stock-location-filter.dto.ts
   │ │
   │ └── entities/
   │ └── stock-location.entity.ts
   │
   └── prisma/
   └── schema.prisma

Preserve established project conventions where repositories, validation, or shared infrastructure already exists.

8. Entity Design

Conceptual structure:

StockLocation
│
├── id
├── businessId
├── branchId
├── name
├── type / purpose
├── createdAt
└── updatedAt

The existing Prisma schema is authoritative for exact fields.

9. Location Identity

Every Stock Location must have a stable identity.

Example:

id: location_001
name: Main Counter
Branch: Nairobi Branch
Business: Main Bar

The identifier must not change merely because the displayed name changes.

10. Location Ownership

Ownership chain:

Business
↓
Branch
↓
Stock Location

The system must validate that the Business and Branch are compatible.

Invalid:

Business A

- Branch B belonging to Business B
- Location

must be rejected.

11. Location Purpose

A Stock Location identifies where stock physically exists.

Examples:

Main Counter
Store Room
Bar Counter
Back Store

The system must use the established location type/purpose model.

Agents must not invent additional operational meanings.

12. Counter as Operational Stock Location

The counter is especially important because shift operations occur there.

Shift
↓
Counter
↓
Opening Stock
↓
Physical Verification
↓
Active Operations
↓
Closing Stock

The location therefore provides the physical boundary for the worker's stock accountability.

13. Inventory Integration

Inventory follows:

Product

- Stock Location
  ↓
  Inventory Item

Example:

Tusker

- Main Counter
  ↓
  48 bottles

The Stock Location identifies where the inventory exists.

Inventory identifies what quantity exists.

14. Shift Stock Integration

Shift Stock Items may reference the relevant location:

Shift

- Product
- Unit
- Stock Location
  ↓
  Shift Stock Item

Example:

Morning Shift

- Tusker
- Bottle
- Main Counter
  ↓
  Opening = 48

15. Stock Movement Integration

Stock movements use locations to describe where stock changes occur.

Example:

Main Counter
↓
REDUCE 5

or:

Store Room
↓
ADD 10

The Stock Movement capability remains responsible for the actual stock change.

16. Transfer Integration

A transfer between locations follows:

Source Location
↓
Transfer
↓
Destination Location

Example:

Store Room
↓
10 bottles
↓
Main Counter

Both locations must belong to an authorized operational context.

17. Location Lifecycle

Locations follow:

CREATED
↓
ACTIVE
↓
USED BY OPERATIONS

If the established system supports deactivation:

ACTIVE
↓
INACTIVE

An inactive location must not accept new operational stock activity.

Historical records referencing it must remain valid.

18. Location Creation

Creating a location requires:

Business

- Branch
- Name
- Required Location Information

The system must validate ownership before persistence.

19. Location Update

Updates may change descriptive information.

They must not silently rewrite historical stock records.

Example:

"Back Counter"
↓
"Main Counter"

Historical movements must continue referencing the same location identity.

20. Location Deactivation

If supported:

ACTIVE
↓
INACTIVE

Deactivation must not delete historical references.

Do not physically delete a location that is already referenced by operational history unless the established data model explicitly supports safe deletion.

21. API Contract
    Create
    POST /stock-locations
    List
    GET /stock-locations

Supported filtering may include:

branchId
type
status

All results must remain Business-scoped.

Retrieve
GET /stock-locations/:id
Update
PATCH /stock-locations/:id
Deactivate

If supported by the established backend contract:

PATCH /stock-locations/:id/status

The exact endpoint must follow the existing project API conventions.

22. Authorization
    OWNER

The Owner may:

Create locations.
Rename locations.
Configure locations.
View locations.
Deactivate locations where supported.
Review location-based stock.
WORKER

The Worker may:

View locations required for assigned operations.
Use authorized locations during shifts.
Record operations against permitted locations.

Workers must not create or restructure business stock locations unless explicitly permitted by the established rules.

23. Business Isolation

Every location query must be Business-scoped.

Authenticated User
↓
Business
↓
Branch
↓
Stock Location

A user must never retrieve another Business's location by guessing its ID.

24. Branch Isolation

Branch ownership must be enforced.

A location belonging to Branch A must not be usable as Branch B's operational stock location.

25. Validation

Validate:

Location exists.
Business exists.
Branch exists.
Branch belongs to Business.
Location belongs to Business.
Location belongs to correct Branch.
Location is operationally usable.
Required fields are valid.
Duplicate names are handled according to established business rules. 26. Data Integrity

Foreign-key relationships must enforce:

Stock Location
↓
Valid Business
↓
Valid Branch

and:

Inventory Item
↓
Valid Stock Location

and:

Shift Stock Item
↓
Valid Stock Location

and:

Stock Movement / Transfer
↓
Valid Stock Location 27. Historical Integrity

Historical records must retain their original location reference.

Example:

2026-08-01
Main Counter
↓
Stock Movement

Renaming the location later must not create a different historical location.

The stable ID remains the identity.

28. Concurrency

The system must prevent:

Duplicate creation caused by concurrent requests where uniqueness rules prohibit it.
Updating a location while another request performs a conflicting lifecycle transition.
Using an inactive location for a new operation.
Cross-Branch location assignment.

Database constraints and transactions must be used where required.

29. Transaction Safety

Location creation:

BEGIN
↓
Validate Business
↓
Validate Branch
↓
Validate uniqueness
↓
Create Location
↓
COMMIT

Location deactivation:

BEGIN
↓
Validate Location
↓
Validate authorization
↓
Validate lifecycle
↓
Deactivate
↓
COMMIT

If any required operation fails:

ROLLBACK 30. Error Handling

Handle:

Location not found
Business not found
Branch not found
Branch belongs to another Business
Unauthorized access
Location belongs to another Branch
Location inactive
Duplicate location
Invalid location data
Invalid lifecycle operation
Database failure

Use the established application error format.

Never expose raw database errors.

31. Performance

The capability must:

Retrieve locations quickly.
Filter by Branch efficiently.
Use indexed ownership fields.
Avoid unnecessary relation loading.
Return compact mobile-friendly responses.
Avoid N+1 queries. 32. Security

The implementation must:

Require authentication.
Enforce Business ownership.
Enforce Branch ownership.
Enforce Worker operational scope.
Validate every referenced location.
Prevent ID-based cross-business access.
Prevent unauthorized location modification. 33. Tools
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

Alternatives must preserve the same behavior and data-integrity guarantees.

34. Testing Requirements
    Creation
    Owner
    ↓
    Create Main Counter
    ↓
    Location exists
    Business Ownership

Attempt:

Business A
↓
Create location under Branch B

Verify rejection when Branch B belongs to Business B.

Branch Isolation

Verify a Worker cannot use another Branch's location.

Inventory Association

Verify:

Product

- Location
  ↓
  Inventory Item

works correctly.

Shift Association

Verify:

Shift

- Location
  ↓
  Shift Stock Item

works correctly.

Stock Movement

Verify stock changes occur against the correct location.

Transfer

Verify:

Location A
↓
Transfer
↓
Location B

updates the correct stock locations.

Inactive Location

If supported:

Location
↓
INACTIVE
↓
New stock operation

must be rejected.

Historical Reference

Deactivate/rename a location.

Verify historical records remain intact.

35. Completion Criteria
    ✓ Location creation works
    ✓ Location retrieval works
    ✓ Location listing works
    ✓ Location update works
    ✓ Location lifecycle works
    ✓ Business ownership works
    ✓ Branch ownership works
    ✓ Authorization works
    ✓ Inventory integration works
    ✓ Shift Stock integration works
    ✓ Stock Movement integration works
    ✓ Transfer integration works
    ✓ Historical references remain valid
    ✓ Invalid ownership is rejected
    ✓ Invalid lifecycle operations are rejected
    ✓ Transaction safety works
    ✓ Concurrency protection works
    ✓ Error handling works
    ✓ Tests pass
    ✓ Application builds
36. Implementation Algorithm
    Step 1 — Establish Physical Locations

Build:

Business
↓
Branch
↓
Stock Locations

Create the real locations used by the business.

Verify each location belongs to the correct Branch and Business.

Step 2 — Establish Location Usage

Connect:

Stock Location
↓
Inventory

Verify stock can be identified by its physical location.

Step 3 — Connect Locations to Shift Reality

Connect:

Shift
↓
Shift Stock Items
↓
Stock Location

Verify the Worker receives the correct physical stock boundary during opening.

Step 4 — Connect Stock Operations

Connect:

Active Shift
↓
Stock Operation
↓
Stock Location
↓
Inventory

Verify additions and reductions occur against the correct physical location.

Step 5 — Connect Transfers

Connect:

Source Location
↓
Transfer
↓
Destination Location

Verify the physical movement is reflected correctly.

Step 6 — Establish Location Lifecycle

If locations can become unavailable:

ACTIVE
↓
INACTIVE

Verify inactive locations cannot receive new operational activity.

Step 7 — Verify Complete Physical Reality

Run:

Create Location
↓
Place Inventory There
↓
Open Shift There
↓
Verify Opening Stock
↓
Perform Stock Operations
↓
Transfer Stock
↓
Close Shift
↓
Verify Historical Location Records
Step 8 — Transition to the Next Capability
Physical locations established
↓
Inventory connected
↓
Shift stock connected
↓
Stock movements connected
↓
Transfers connected
↓
Lifecycle verified
↓
Next implementation step

Never proceed merely because Stock Locations compile.
