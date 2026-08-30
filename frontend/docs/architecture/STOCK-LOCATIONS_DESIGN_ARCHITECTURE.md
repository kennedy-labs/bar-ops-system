STOCK_LOCATIONS_DESIGN_ARCHITECTURE.md

Static technical contract for the Stock Locations capability.

The AI agent must translate this specification into working software.
It must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Stock Locations capability identifies where physical stock exists within a Business.

A Stock Location provides the physical boundary needed to distinguish places such as:

Counter
Store
Bar
Back room
Warehouse

The Stock Locations capability identifies the location.

It does not own:

Product identity.
Product units.
Inventory quantities.
Stock movements.
Shifts.
Transfers.
Expenses.
Payments.
Profit calculations. 2. Requirements: Functional and Non-functional
Functional Requirements

The system must:

Create Stock Locations.
Retrieve Stock Locations.
List Stock Locations belonging to a Business.
Update permitted Stock Location information.
Associate every Stock Location with exactly one Business.
Ensure the Business ownership is correct.
Allow Inventory Items to reference Stock Locations.
Allow stock operations to identify their physical location.
Allow authorized Owners to manage Stock Locations.
Allow Workers to view and use relevant Stock Locations.
Preserve Stock Location identity.
Support multiple Stock Locations within one Business.
Prevent cross-Business Stock Location access.
Non-functional Requirements

The capability must provide:

Strict Business isolation.
Branch isolation.
Stable location identifiers.
Referential integrity.
Reliable persistence.
Deterministic validation.
Consistent authorization.
Consistent error handling.
Efficient location retrieval.
Historical compatibility.
No duplicate physical-location source of truth. 3. Dependencies
Depends On
Business
User
Authentication / Authorization
Prisma
PostgreSQL
Used By
Inventory Items
Stock Movements
Shift Stock Items
Transfers
Reports
Analytics

Stock Locations provide the physical location context used by these capabilities.

4. Design Principles
Every Stock Location belongs to exactly one Business.
Every Business may have multiple Stock Locations.
   Stock Location identity must remain stable.
   Location identity must not be duplicated in Inventory or Movement records as free-form text.
   Stock quantity belongs to Inventory.
   Stock movement history belongs to Stock Movements.
   A location must not silently change Branch ownership.
   Cross-Business access must be rejected.
   Historical records must remain traceable to their original location where required.
   Owners manage Stock Locations.
   Workers use Stock Locations operationally.
5. Architecture
Business
│
├── Counter
│ └── Inventory
│
├── Store
│ └── Inventory
│
└── Other Location
└── Inventory

Operational structure:

Branch
↓
Stock Location
↓
Product
↓
Product Unit
↓
Inventory Item 6. Module Skeleton
Stock Locations
│
├── Location Identity
│
├── Branch Association
│
├── Location Information
│
├── Status
│
├── Validation
│
├── Authorization
│
├── API
│ ├── Create
│ ├── List
│ ├── Retrieve
│ └── Update
│
└── Persistence
└── Prisma 7. File Structure
backend/
├── src/
│ └── stock-locations/
│ ├── stock-locations.module.ts
│ ├── stock-locations.controller.ts
│ ├── stock-locations.service.ts
│ │
│ ├── dto/
│ │ ├── create-stock-location.dto.ts
│ │ └── update-stock-location.dto.ts
│ │
│ └── entities/
│ └── stock-location.entity.ts
│
└── prisma/
└── schema.prisma

Preserve existing repository/service conventions where they already exist.

8. Entity Design
   Stock Location

Conceptual fields:

id
businessId
name
description
status
createdAt
updatedAt
Field Requirements
Field Requirement
id Stable unique identifier
businessId Required Business reference
name Required
description Optional
status Active/inactive state where supported
createdAt Automatically generated
updatedAt Automatically maintained

The exact fields must follow the established Prisma schema.

9. Location Identity

The Stock Location ID is the permanent identity of the physical location.

Example:

Business: Main Bar

Stock Location
├── id: location-001
└── name: Counter

Dependent records reference:

stockLocationId

They must not use free-form location names as the authoritative reference.

10. Location Naming

Location names must:

Be required.
Not be blank.
Clearly identify the physical location.
Be meaningful within the Business.
Be validated before persistence.

Examples:

Counter
Store
Back Room
Warehouse

The system must not automatically infer physical meaning from arbitrary text.

11. Location Status

Where supported, locations may have an active/inactive state.

Conceptually:

ACTIVE
INACTIVE

Deactivation must not destroy historical records.

Example:

Counter
↓
INACTIVE
↓
Historical stock records remain traceable 12. Prisma Design

Conceptual model:

enum StockLocationStatus {
ACTIVE
INACTIVE
}

model StockLocation {
id String @id @default(cuid())

businessId String
business Business @relation(fields: [businessId], references: [id])

name String
description String?
status StockLocationStatus @default(ACTIVE)

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([businessId])
}

The actual model must match the project's established Prisma schema.

Do not create a duplicate Stock Location model.

13. Database Constraints

The database must enforce:

Unique Stock Location ID.
Required Business reference.
Valid Business foreign key.
Required location name.
Valid status.
Referential integrity. 14. Business Isolation

Ownership follows:

Business
↓
Stock Location

Every Stock Location operation must establish:

Authenticated Business
↓
Stock Location

A location ID alone must never grant access.

Business A must never access:

Business B
↓
Location B 15. Business Isolation

A Stock Location belongs to one Business.

Therefore:

Business A
↓
Location A

must not be treated as belonging to:

Business B

Business boundaries must remain explicit.

16. API Contract
    Create Stock Location
    POST /stock-locations

Example:

{
"businessId": "business-id",
"name": "Counter",
"description": "Main operating counter"
}

The backend must verify that the Business ownership is valid.

17. List Stock Locations
    GET /stock-locations

Returns locations accessible within the authorized Business.

Optional Business filtering:

GET /stock-locations?businessId=business-id

The filter must not bypass Business ownership.

18. Get Stock Location
    GET /stock-locations/:id

The requested location must belong to:

Authenticated Business
↓
Requested Location 19. Update Stock Location
PATCH /stock-locations/:id

Editable fields may include:

name
description
status

Protected fields:

id
businessId
createdAt

must not be modified through ordinary updates.

Changing Business ownership requires a separate explicit business process if ever supported.

20. API Response

Example:

{
"id": "location-id",
"businessId": "business-id",
"name": "Counter",
"description": "Main operating counter",
"status": "ACTIVE",
"createdAt": "timestamp",
"updatedAt": "timestamp"
}

Do not automatically return all Inventory Items.

21. API Error Behavior

Handle:

Invalid input
Unauthorized request
Forbidden request
Stock Location not found
Business not found
Cross-Business access
Invalid status
Database failure

Use the established application error format.

Never expose raw Prisma errors.

22. Validation
    Create

Validate:

Location exists.
Business exists.
Business ownership is valid.
Name exists.
Name is not blank.
Description is valid where supplied.
Status is valid where supplied.
Update

Validate:

Location exists.
Location belongs to authorized Business.
Editable fields only.
Valid status.
Name remains valid. 23. Authorization
OWNER

The Owner may:

Create Stock Locations.
View Stock Locations.
Update Stock Locations.
Activate/deactivate locations.
WORKER

Workers may:

View operationally relevant Stock Locations.
Use Stock Locations when recording permitted operations.

Workers must not:

Create locations.
Change Business ownership.
Modify location configuration unless explicitly authorized. 24. Inventory Boundary

Stock Location identifies where stock exists.

Inventory identifies what quantity exists there.

Stock Location
↓
Inventory Item
↓
Product
↓
Product Unit
↓
Quantity

Example:

Counter
↓
Tusker
↓
Bottle
↓
48

The Stock Location does not own 48.

25. Stock Movement Boundary

Stock Movements record changes to stock.

Stock Location
↓
Stock Movement
↓
Quantity change

The Stock Location capability does not create stock movements.

It provides location identity.

26. Shift Boundary

Shift Stock Items may reference a Stock Location.

Example:

Shift
↓
Opening Stock
↓
Counter
↓
Product
↓
Quantity

This allows the system to distinguish physical stock locations during shift operations.

The Stock Location capability does not own shift state.

27. Transfer Boundary

Transfers may move stock between locations or Branches depending on the established operational design.

Stock Locations provide the physical source/destination identity where required.

Source Location
↓
Transfer
↓
Destination Location

Transfer state remains owned by Transfers.

28. Historical Integrity

Deactivating a Stock Location must not destroy historical records.

Example:

Counter
↓
Historical stock
↓
Historical movement
↓
Location later becomes inactive

The historical record must remain traceable.

Do not rewrite historical location identity merely because the location is no longer active.

29. Security Requirements

The implementation must:

Authenticate requests.
Authorize management operations.
Enforce Business ownership.
Prevent cross-Business access.
Validate all input.
Protect database relationships.
Prevent unauthorized configuration changes. 30. Performance and Reliability

The capability must:

Index businessId.
Use efficient location ID lookups.
Avoid unnecessary Inventory loading.
Avoid N+1 queries.
Return only required fields.
Preserve database consistency.
Support efficient Business-level location retrieval. 31. Tools
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

Alternatives must preserve the same behavior and guarantees.

32. Testing Requirements
    Creation

Verify:

Owner
↓
Create Location
↓
Branch
↓
Business

Correct ownership must be established.

Business Isolation

Verify:

Business A
↓
Branch A
↓
Location A

cannot be accessed by Business B.

Business Isolation

Verify:

Business A
├── Location A
└── Location B

Location A must not be treated as Location B.

Worker Restrictions

Verify:

Worker
↓
View location = allowed
Worker
↓
Create location = rejected
Worker
↓
Move location to another Business = rejected
Historical Integrity

Verify:

Location
↓
Operational record
↓
Location deactivated

Historical records remain readable and correctly associated.

33. Completion Criteria
✓ Stock Location can be created
✓ Stock Location can be retrieved
✓ Stock Locations can be listed
✓ Stock Location can be updated
✓ Business ownership works
✓ Business isolation works
✓ Owner permissions work
✓ Worker restrictions work
✓ Location status works
✓ Historical references remain valid
    ✓ Inventory can reference locations
    ✓ Stock Movements can reference locations
    ✓ Shift Stock can reference locations
    ✓ Transfers can reference locations where required
    ✓ Validation works
    ✓ Database constraints work
    ✓ Error handling works
    ✓ Tests pass
    ✓ Application builds
34. Implementation Algorithm
    Step 1 — Establish Location Persistence
    Branch
    ↓
    Stock Location
    ↓
    Database

Create a valid Stock Location.

Verify that it belongs to the correct Branch and Business.

Step 2 — Establish Location Retrieval
Request
↓
Stock Location
↓
Branch
↓
Business

Verify:

List.
Single retrieval.
Branch filtering.
Business isolation.
Step 3 — Establish Location Management
Owner
↓
Create / Update Location
↓
Ownership verification
↓
Database

Verify Owner permissions.

Step 4 — Establish Location Status
Active Location
↓
Deactivate
↓
Inactive Location
↓
Historical records remain

Verify that deactivation does not destroy history.

Step 5 — Transition Into Inventory
Stock Location
↓
Inventory Item
↓
Product
↓
Quantity

Verify that physical stock can be represented at the correct location.

Step 6 — Transition Into Stock Operations

Connect the location to:

Stock Movements
Shift Stock
Transfers

Verify that each operation references the correct physical location.

Step 7 — Verify Physical Location Boundary

Run:

Business
↓
Branch
↓
Stock Location
↓
Inventory
↓
Stock Movement
↓
Shift Stock

Verify that the same physical location remains correctly identified throughout the chain.

Step 8 — Transition to the Next Capability
Stock Locations built
↓
Locations verified
↓
Business ownership verified
↓
Inventory transition verified
↓
Stock operations transition verified
↓
Historical integrity verified
↓
Next implementation step

Never proceed merely because the Stock Locations module compiles.
