PRODUCTS_DESIGN_ARCHITECTURE.md

Static technical contract for the Products capability.

The AI agent must translate this specification into working software.
It must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Products capability represents the products that the Business handles operationally.

A Product identifies what the business handles, while other capabilities determine:

How it is measured.
What it costs.
Where it is stored.
How much exists.
How it moves.
How it is used in shifts.
How it contributes to financial calculations.

The Products capability is the authoritative source for Product identity and Product-level descriptive information.

It does not own:

Physical stock quantities.
Stock locations.
Stock movements.
Product cost history.
Shift stock.
Payments.
Expenses.
Profit calculations.

Those responsibilities belong to their respective capabilities.

2. Requirements: Functional and Non-functional
   Functional Requirements

The system must:

Create Products.
Retrieve Products.
List Products belonging to a Business.
Update permitted Product information.
Associate every Product with exactly one Business.
Maintain stable Product identity.
Allow Products to be referenced by inventory records.
Allow Products to be referenced by stock movements.
Allow Products to be referenced by shifts.
Allow Products to be referenced by Product Units.
Allow Products to be referenced by Product Cost History.
Support Product activation/deactivation where required by the existing Business design.
Prevent cross-Business Product access.
Allow authorized Owners to manage Products.
Allow Workers to view Products required for their operational work.
Non-functional Requirements

The Products capability must provide:

Strict Business isolation.
Stable Product identifiers.
Referential integrity.
Predictable API behavior.
Server-side authorization.
Input validation.
Consistent error handling.
Efficient Product retrieval.
No duplication of Product identity across dependent modules.
Reliable persistence.
Historical compatibility with existing Product references. 3. Dependencies
Depends On
Business
Authentication / Authorization
Prisma
PostgreSQL
Used By
Product Units
Product Cost History
Stock Locations
Inventory Items
Stock Movements
Shift Stock Items
Shifts
Transfers
Reports
Analytics

The Product is the identity referenced by these capabilities.

4. Design Principles
   Every Product belongs to exactly one Business.
   Product identity must remain stable.
   Product information must not be duplicated unnecessarily in dependent records.
   Product quantities do not belong to the Product entity.
   Product costs do not belong to the Product entity when historical cost tracking is required.
   Product units do not belong to the Product entity when unit definitions are separately managed.
   Product stock does not belong directly to Product.
   Business ownership must be enforced server-side.
   Client-provided Business ownership must never override authenticated ownership.
   Cross-Business Product access must be rejected.
   Product deletion must not silently destroy historical operational records.
   Historical records must continue to reference the Product they were created against.
   Product management belongs to the Owner.
   Workers receive only the Product access required for operations.
5. Architecture
   Business
   │
   └── Products
   │
   ├── Product Identity
   │
   ├── Product Units
   │
   ├── Product Cost History
   │
   ├── Inventory Items
   │
   ├── Stock Movements
   │
   ├── Shift Stock Items
   │
   └── Reports / Analytics

The Product is the identity foundation.

Product
│
├── What is it?
│
├── How is it measured? → Product Units
│
├── What did it cost historically? → Product Cost History
│
└── Where/how much exists? → Inventory 6. Module Skeleton
Products
│
├── Product Identity
│
├── Product Information
│
├── Business Ownership
│
├── Product Status
│
├── API
│ ├── Create
│ ├── List
│ ├── Retrieve
│ └── Update
│
├── Validation
│
├── Authorization
│
└── Persistence
└── Prisma 7. File Structure
backend/
├── src/
│ └── products/
│ ├── products.module.ts
│ ├── products.controller.ts
│ ├── products.service.ts
│ │
│ ├── dto/
│ │ ├── create-product.dto.ts
│ │ └── update-product.dto.ts
│ │
│ └── entities/
│ └── product.entity.ts
│
└── prisma/
└── schema.prisma

If the existing backend already uses repositories, mappers, response types, or another established pattern, preserve that project convention.

Do not introduce a competing architecture.

8. Entity Design
   Product

The Product must contain only Product-level identity and descriptive information.

Required conceptual fields:

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
businessId Required Business ownership
name Required
description Optional
status Required Product availability state
createdAt Automatically generated
updatedAt Automatically maintained

The exact status representation must follow the established project schema.

9. Product Identity

The Product ID is the permanent identity of the Product.

Example:

Product
├── id: product-001
├── name: Tusker
└── Business: Main Business

Other records reference:

productId

rather than copying:

productName
productDescription

as their authoritative identity.

This prevents multiple sources of truth.

10. Product Name

The Product name must:

Be required.
Not be blank.
Be stored consistently.
Be returned through Product APIs.
Be editable only through authorized Product management operations.

Changing the Product name must not create a new Product.

Historical records referencing the Product must continue referencing the same Product ID.

11. Product Description

Description is descriptive information.

It may be optional.

Changing a description must not alter:

Stock quantities.
Stock history.
Product cost history.
Shift records.
Payment records.
Historical reports. 12. Product Status

The Product status controls whether the Product remains available for normal operational selection.

Conceptually:

ACTIVE
INACTIVE

An inactive Product must not be silently deleted.

Historical records must continue to reference it.

Example:

Product
↓
INACTIVE
↓
Existing stock/history remain
↓
Product remains identifiable

The exact enum/value must match the established backend schema.

13. Prisma Design

The Product model must follow the established Prisma schema.

Example:

enum ProductStatus {
ACTIVE
INACTIVE
}

model Product {
id String @id @default(cuid())

businessId String
business Business @relation(fields: [businessId], references: [id])

name String
description String?
status ProductStatus @default(ACTIVE)

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([businessId])
}

If the existing schema already contains the Product model, preserve its established fields and relations.

Do not duplicate the Product model.

14. Database Constraints

The database must enforce:

Unique Product ID.
Required Business ownership.
Valid Business foreign key.
Required Product name.
Valid Product status.
Referential integrity.

Product-dependent records must reference valid Products.

15. Business Isolation

Every Product query must establish Business ownership.

Conceptually:

Authenticated Business
↓
Product.businessId
↓
Requested Product

A Product ID alone must never grant access.

Business A must never:

Read Business B Product
Update Business B Product
Use Business B Product in a Business A operation 16. API Contract
Create Product
POST /products
Request
{
"name": "Tusker",
"description": "Tusker Lager"
}

Business ownership comes from authorized Business context.

The client must not be trusted to assign the Product to another Business.

Response

Return the created Product.

17. List Products
    GET /products

Returns Products belonging to the authorized Business.

The endpoint may support established filters.

Examples:

status
search

Filters must never bypass Business ownership.

18. Get Product
    GET /products/:id

Returns the Product only when it belongs to the authorized Business.

19. Update Product
    PATCH /products/:id

Updates permitted Product information.

Protected fields must not be modified:

id
businessId
createdAt

Product status changes must be explicitly authorized.

20. API Response

Example:

{
"id": "product-id",
"businessId": "business-id",
"name": "Tusker",
"description": "Tusker Lager",
"status": "ACTIVE",
"createdAt": "timestamp",
"updatedAt": "timestamp"
}

Do not automatically return:

Inventory records
Stock movements
Cost history
Shift records

unless explicitly required by a dedicated endpoint.

21. API Error Behavior

The API must handle:

Invalid input
Unauthorized request
Forbidden request
Product not found
Business not found
Cross-Business access
Invalid status
Database failure

Use the project's standardized error-response structure.

Never expose raw Prisma/database errors.

22. Validation
    Create Product

Validate:

Name exists.
Name is not blank.
Description is valid when supplied.
Business ownership is valid.
Status is valid where status input is supported.
Update Product

Validate:

Product exists.
Product belongs to authorized Business.
Fields are permitted.
Values satisfy Product constraints.

Reject attempts to modify protected ownership or identity fields.

23. Authorization
    OWNER

The Owner may:

Create Products.
View Products.
Update Products.
Change Product status.
Manage Product information.
WORKER

Workers may:

View Products required for operations.
Select Products during permitted operational actions.

Workers must not:

Create Products.
Change Product ownership.
Modify Product configuration.
Modify Product status unless explicitly permitted by a future operational rule.

Backend authorization is authoritative.

24. Product Units Boundary

Product Units define how a Product is measured.

Product
↓
Product Unit

The Product capability must not duplicate unit definitions.

Example:

Product: Tusker
↓
Unit: Bottle
Unit: Crate

The Product remains the identity.

Product Units remain responsible for measurement.

25. Product Cost History Boundary

Product Cost History records how the Product's cost changes over time.

Product
↓
Cost History
├── Cost A
├── Cost B
└── Cost C

The Product capability must not overwrite historical costs.

Historical costs must remain available to calculations that require historical truth.

26. Product and Inventory

Inventory answers:

How much of this Product exists, and where?

Products answers:

What is this Product?

Therefore:

Product
↓
Inventory Item
↓
Quantity
↓
Stock Location

Product must not own inventory quantity.

27. Product and Stock Movements

Stock movements reference Products.

Product
↓
Stock Movement
↓
Added / Reduced / Transferred

The Stock Movement capability remains responsible for movement history.

Products only provides the identity being moved.

28. Product and Shifts

Shift Stock Items reference Products.

Shift
↓
Shift Stock Item
↓
Product

The Product capability must not contain shift-specific quantities.

Shift-specific stock state belongs to Shift Stock Items.

29. Product and Transfers

Transfers may contain Product references through their stock movement/item structure.

Product
↓
Transfer
↓
Stock movement

The Transfer capability owns transfer behavior.

Products only identifies the item involved.

30. Product and Reports

Reports may consume Product information to produce:

Product performance
Product stock information
Product movement reports
Product profitability
Product-related reconciliation

Reports must consume Product identity from the Product capability.

Reports must not create another Product source of truth.

31. Product Deletion Policy

Products must not be physically deleted when historical records depend on them.

Preferred behavior:

ACTIVE
↓
INACTIVE

rather than:

DELETE

This preserves:

Stock history
Cost history
Shift history
Movement history
Transfer history
Reports

If physical deletion is ever permitted, the implementation must first prove that no historical or operational record depends on the Product.

32. Security Requirements

The implementation must:

Authenticate requests.
Authorize Product management.
Enforce Business ownership.
Prevent cross-Business access.
Prevent client-controlled Business assignment.
Prevent Worker privilege escalation.
Validate Product input.
Protect database integrity.
Avoid exposing internal database errors. 33. Performance and Reliability

The Product capability must:

Index businessId.
Use efficient Product ID lookups.
Avoid unnecessary dependent-record loading.
Avoid N+1 queries.
Return only required fields.
Support efficient Product listing.
Maintain predictable response times.
Preserve data consistency.

Product search/filtering must operate within the authorized Business boundary.

34. Tools
    Primary
    NestJS
    TypeScript
    Prisma
    PostgreSQL
    Existing project validation mechanism
    Jest
    Alternatives
    Primary Alternative
    Prisma PostgreSQL driver/query layer
    Jest Vitest
    Existing validation Zod / class-validator

Alternative tools must preserve:

API contracts
Database constraints
Business isolation
Authorization
Validation
Testing behavior

Do not replace tools merely for preference.

35. Testing Requirements
    Creation

Verify:

Owner
↓
Create Product
↓
Product belongs to correct Business

Invalid Product data must be rejected.

Retrieval

Verify:

Business A
↓
Product A

cannot be accessed by:

Business B
Update

Verify:

Owner can update permitted fields.
Worker cannot manage Product information.
businessId cannot be changed.
id cannot be changed.
Product status follows authorization rules.
Status

Verify:

ACTIVE
↓
INACTIVE

does not delete historical Product references.

Relationships

Verify that valid Products can be referenced by:

Product Unit
Product Cost History
Inventory Item
Stock Movement
Shift Stock Item
Transfer

where applicable.

Historical Integrity

Verify:

Product
↓
Historical records
↓
Product becomes inactive

Historical records remain readable and correctly associated with the Product.

36. Completion Criteria

The Products capability is complete when:

✓ Product can be created
✓ Product can be retrieved
✓ Products can be listed
✓ Product can be updated
✓ Product status works
✓ Business ownership is enforced
✓ Cross-Business access is rejected
✓ Owner permissions work
✓ Worker restrictions work
✓ Validation works
✓ Database constraints work
✓ Product identity remains stable
✓ Historical references remain valid
✓ Product Unit integration works
✓ Product Cost History integration works
✓ Inventory integration works
✓ Stock Movement integration works
✓ Shift Stock integration works
✓ Transfer integration works
✓ Reports can reference Products
✓ Tests pass
✓ Application builds 37. Implementation Algorithm

This is the only dynamic section.

Execute these steps in order.
Verify every transition before continuing.

Step 1 — Establish Product Persistence

Create the Product representation.

Business
↓
Product
↓
Database

Verify that a Product can be persisted with correct Business ownership.

Step 2 — Establish Product Retrieval

Connect Product retrieval to the database.

Request
↓
Product service
↓
Database
↓
Product

Verify:

List Products.
Retrieve Product.
Business filtering.
Step 3 — Establish Product Creation

Connect Owner Product creation.

Owner
↓
Create Product
↓
Business ownership
↓
Database

Verify that the Product belongs to the correct Business.

Step 4 — Establish Product Updates

Connect editable Product information.

Owner
↓
Update Product
↓
Validate ownership
↓
Update Product

Verify that protected identity and ownership fields cannot be modified.

Step 5 — Establish Product Status

Connect Product activation/deactivation.

Active Product
↓
Deactivate
↓
Inactive Product
↓
Historical records remain

Verify that deactivation does not destroy historical truth.

Step 6 — Transition Into Product Units

Connect Product identity to Product Units.

Product built
↓
Product verified
↓
Product Unit references Product
↓
Product measurement becomes available

Verify that Product Units reference the correct Business-owned Product.

Step 7 — Transition Into Product Cost History

Connect Product identity to historical costs.

Product
↓
Product Cost History
↓
Historical cost records

Verify that historical costs remain separate from Product identity.

Step 8 — Transition Into Inventory

Connect Product identity to Inventory Items.

Product
↓
Inventory Item
↓
Stock Location
↓
Physical stock

Verify that inventory can identify the Product without duplicating Product identity.

Step 9 — Transition Into Stock Movements

Connect Product identity to stock movement records.

Product
↓
Stock Movement
↓
Stock changes

Verify that stock changes reference the correct Product.

Step 10 — Transition Into Shift Reality

Connect Products to Shift Stock Items.

Product
↓
Shift Stock Item
↓
Opening / Closing stock

Verify that the Product can participate in the shift's stock reality.

Step 11 — Verify Complete Product Boundary

Run:

Create Product
↓
Retrieve Product
↓
Assign Unit
↓
Record Cost History
↓
Create Inventory Item
↓
Record Stock Movement
↓
Use Product in Shift Stock
↓
Preserve Product identity

Verify the entire chain.

Step 12 — Transition to the Next Capability

Only after Product identity, ownership, API behavior, authorization, status, and dependent relationships are verified:

Products built
↓
Products verified
↓
Business ownership verified
↓
Product identity verified
↓
Units connected
↓
Cost history connected
↓
Inventory connected
↓
Stock movement connected
↓
Shift stock connected
↓
Products become available to the next implementation step

Never proceed merely because the Product module compiles.
