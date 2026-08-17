PRODUCT_UNITS_DESIGN_ARCHITECTURE.md

Static technical contract for the Product Units capability.

The AI agent must translate this specification into working software.
It must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Product Units capability defines how a Product is measured.

A Product identifies what the business handles.

A Product Unit identifies the measurement used when recording:

Stock.
Purchases/additions.
Reductions.
Transfers.
Opening stock.
Closing stock.
Operational quantities.

Example:

Product
↓
Product Unit
↓
Bottle

or:

Product
↓
Product Unit
↓
Crate

The Product Units capability does not own:

Product identity.
Inventory quantities.
Stock locations.
Stock movements.
Shift stock.
Product costs.
Payments.
Expenses.
Profit calculations. 2. Requirements: Functional and Non-functional
Functional Requirements

The system must:

Define units used by Products.
Associate units with Products.
Store unit names.
Store unit conversion information where required by the existing Product design.
Allow authorized Owners to manage Product Units.
Allow Workers to view units required for operational work.
Allow operational records to reference the correct Product Unit.
Preserve historical unit references.
Prevent units from crossing Business boundaries.
Prevent invalid Product Unit associations.
Provide predictable Product Unit retrieval.
Non-functional Requirements

The capability must provide:

Accurate quantity representation.
Deterministic conversion behavior.
Business isolation.
Referential integrity.
Stable identifiers.
Consistent validation.
Reliable persistence.
Consistent error handling.
No duplicate unit definitions inside dependent modules.
Reproducible historical records. 3. Dependencies
Depends On
Business
Product
Authentication / Authorization
Prisma
PostgreSQL
Used By
Inventory Items
Stock Movements
Shift Stock Items
Transfers
Product Cost History where applicable
Reports
Analytics

Product Units provide measurement information to these capabilities.

4. Design Principles
   Every Product Unit belongs to exactly one Product.
   Every Product belongs to exactly one Business.
   Therefore every Product Unit belongs to exactly one Business through its Product.
   Product Units must never exist independently of their Product.
   Product Units must not duplicate Product identity.
   Quantities must use the correct unit.
   Unit conversion must be deterministic.
   Historical operational records must preserve the unit used when the record was created.
   Changing current unit configuration must not silently rewrite historical records.
   Cross-Business Product Unit access must be rejected.
   Product Unit management belongs to the Owner.
   Workers may use units required by their operational work.
5. Architecture
   Business
   │
   └── Product
   │
   ├── Unit A
   │
   ├── Unit B
   │
   └── Unit C

Operational usage:

Product
↓
Product Unit
↓
Quantity
↓
Inventory / Shift / Movement / Transfer

Example:

Tusker
↓
Bottle
↓
24 bottles

Another:

Tusker
↓
Crate
↓
1 crate

If conversion is supported:

1 Crate
↓
24 Bottles 6. Module Skeleton
Product Units
│
├── Product Association
│
├── Unit Identity
│
├── Measurement
│
├── Conversion
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
│ └── product-units/
│ ├── product-units.module.ts
│ ├── product-units.controller.ts
│ ├── product-units.service.ts
│ │
│ ├── dto/
│ │ ├── create-product-unit.dto.ts
│ │ └── update-product-unit.dto.ts
│ │
│ └── entities/
│ └── product-unit.entity.ts
│
└── prisma/
└── schema.prisma

Preserve any repository/service architecture already established by the project.

Do not introduce a competing pattern.

8. Entity Design
   Product Unit

Conceptual fields:

id
productId
name
abbreviation
conversionFactor
createdAt
updatedAt

The exact fields must match the established backend schema.

Field Requirements
Field Requirement
id Stable unique identifier
productId Required Product reference
name Required
abbreviation Optional where applicable
conversionFactor Required only where conversion is supported
createdAt Automatically generated
updatedAt Automatically maintained 9. Product Unit Identity

The Product Unit ID identifies a specific measurement definition.

Example:

Product Unit
├── id: unit-001
├── Product: Tusker
└── Name: Bottle

Operational records may reference:

productUnitId

rather than duplicating the entire unit definition.

10. Unit Naming

Unit names must:

Be required.
Not be blank.
Clearly identify the measurement.
Remain consistent within the Product.
Be validated before persistence.

Examples:

Bottle
Crate
Can
Litre
Kilogram

The system must not silently interpret arbitrary names as equivalent measurements.

11. Unit Conversion

Where the established Product model supports conversion, conversion must be explicit.

Example:

1 Crate = 24 Bottles

The system must not infer:

Crate = 24

without an explicitly stored conversion rule.

Conversion must be deterministic.

12. Conversion Direction

A conversion must have a clearly defined base/reference unit.

Example:

Base Unit: Bottle

Crate
1 Crate
↓
24 Bottles

The implementation must not allow ambiguous conversion direction.

If the existing schema already defines conversion differently, the implementation must follow that established definition consistently.

13. Quantity Precision

The Product Unit implementation must support the precision required by the actual Product.

Examples:

Bottle → whole quantities
Crate → whole quantities
Litre → decimal quantities
Kilogram → decimal quantities

Do not force integer quantities if the established Product Unit design requires fractional measurement.

Do not introduce floating-point monetary calculations.

Quantity representation must remain compatible with the existing Prisma/database design.

14. Prisma Design

The Product Unit model must follow the established schema.

Conceptual example:

model ProductUnit {
id String @id @default(cuid())

productId String
product Product @relation(fields: [productId], references: [id])

name String
abbreviation String?
conversionFactor Decimal?

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([productId])
}

The exact model must match the existing project schema.

Do not create a second Product Unit model.

15. Database Constraints

The database must enforce:

Unique Product Unit ID.
Required Product reference.
Valid Product foreign key.
Required unit name.
Valid conversion values.
Referential integrity.

A Product Unit must never reference a Product belonging to another Business through unauthorized operations.

16. Business Isolation

Business ownership is inherited through:

Business
↓
Product
↓
Product Unit

Every Product Unit query must therefore establish:

Authenticated Business
↓
Product
↓
Product Unit

A Product Unit ID alone must never grant access.

17. API Contract
    Create Product Unit
    POST /product-units

Example:

{
"productId": "product-id",
"name": "Bottle",
"abbreviation": "btl"
}

The backend must verify that the referenced Product belongs to the authenticated Business.

18. List Product Units
    GET /product-units

Returns Product Units accessible within the authorized Business.

Filtering by Product may be supported:

GET /product-units?productId=product-id

The Product filter must remain Business-scoped.

19. Get Product Unit
    GET /product-units/:id

Returns the Product Unit only when:

Product Unit
↓
Product
↓
Authenticated Business

all match.

20. Update Product Unit
    PATCH /product-units/:id

Updates permitted configuration.

Protected fields:

id
productId
createdAt

must not be changed through ordinary updates.

Changing conversion rules must be treated carefully because historical records may depend on previous definitions.

21. Historical Integrity

Historical records must not silently change because a current Product Unit changes.

Example:

January
1 Crate = 24 Bottles

Later:

Current configuration
1 Crate = 20 Bottles

Historical records created under the previous configuration must remain reproducible.

If the existing system requires immutable unit definitions once used, enforce that rule.

Do not rewrite historical quantities.

22. API Response

Example:

{
"id": "unit-id",
"productId": "product-id",
"name": "Bottle",
"abbreviation": "btl",
"conversionFactor": "1",
"createdAt": "timestamp",
"updatedAt": "timestamp"
}

Do not automatically return inventory, movement, or shift records.

23. API Error Behavior

Handle:

Invalid input
Unauthorized request
Forbidden request
Product Unit not found
Product not found
Cross-Business access
Invalid conversion
Database failure

Use the established application error format.

Never expose raw Prisma errors.

24. Validation
    Create

Validate:

Product exists.
Product belongs to authorized Business.
Unit name exists.
Unit name is not blank.
Abbreviation is valid when supplied.
Conversion factor is valid where applicable.
Conversion factor is positive where required.
Update

Validate:

Product Unit exists.
Product belongs to authorized Business.
Fields are editable.
Conversion values remain valid. 25. Authorization
OWNER

The Owner may:

Create Product Units.
View Product Units.
Update Product Units.
Configure measurement definitions.
WORKER

Workers may:

View Product Units required for operational work.
Use Product Units when recording permitted operations.

Workers must not:

Create Product Units.
Change conversion definitions.
Reassign a Product Unit to another Product.
Modify Business ownership. 26. Product Boundary

Product Units must never become a second Product model.

Product
↓
Product Unit

The Product Unit identifies measurement.

It does not redefine:

Product name
Product description
Product status

Those remain owned by Products.

27. Inventory Boundary

Product Units provide the measurement.

Inventory provides the quantity.

Product
↓
Product Unit
↓
Inventory Item
↓
Quantity

Example:

Product: Tusker
Unit: Bottle
Quantity: 48

Inventory remains responsible for the 48.

Product Units remain responsible for what Bottle means.

28. Stock Movement Boundary

Stock Movements record changes.

Product Unit
↓
Stock Movement
↓
Quantity changed

Product Units do not create movement records.

29. Shift Stock Boundary

Shift Stock Items use Product Units to represent opening and closing quantities.

Shift
↓
Product
↓
Product Unit
↓
Opening / Closing Quantity

The Product Unit must remain consistent throughout the shift unless the operational design explicitly permits conversion.

30. Transfer Boundary

Transfers may use Product Units to describe quantities being transferred.

Example:

Transfer
Product: Tusker
Unit: Crate
Quantity: 2

The Transfer capability remains responsible for transfer state.

Product Units provide measurement semantics.

31. Security Requirements

The implementation must:

Authenticate requests.
Authorize Product Unit management.
Enforce Business ownership through Product.
Prevent cross-Business access.
Prevent cross-Product reassignment.
Prevent Worker configuration changes.
Validate conversion rules.
Protect database integrity. 32. Performance and Reliability

The capability must:

Index productId.
Use efficient Product Unit lookups.
Avoid unnecessary Product/Inventory loading.
Avoid N+1 queries.
Return only required fields.
Preserve transactional consistency where conversion configuration affects dependent operations. 33. Tools
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

Alternatives must preserve the same behavior and data guarantees.

34. Testing Requirements
    Creation

Verify:

Owner
↓
Create Unit
↓
Correct Product
↓
Correct Business
Isolation

Verify:

Business A
↓
Product A
↓
Unit A

cannot be accessed or modified by Business B.

Product Association

Verify that a Product Unit cannot be reassigned to another Product through unauthorized operations.

Conversion

Where conversion exists, verify:

1 Crate
↓
Configured number of Bottles

and reject:

0
negative
invalid
ambiguous

conversion factors.

Historical Integrity

Verify that changing current configuration does not rewrite historical operational records.

Worker Restrictions

Verify:

Worker
↓
View Unit = allowed
Worker
↓
Change Unit definition = rejected 35. Completion Criteria
✓ Product Unit can be created
✓ Product Unit can be retrieved
✓ Product Units can be listed
✓ Product Unit can be updated
✓ Product association works
✓ Business isolation works
✓ Conversion works where supported
✓ Quantity precision is correct
✓ Historical integrity is preserved
✓ Owner permissions work
✓ Worker restrictions work
✓ Validation works
✓ Database constraints work
✓ Inventory can use Product Units
✓ Stock Movements can use Product Units
✓ Shift Stock can use Product Units
✓ Transfers can use Product Units
✓ Tests pass
✓ Application builds 36. Implementation Algorithm
Step 1 — Establish Product Unit Persistence
Product
↓
Product Unit
↓
Database

Create and persist a valid Product Unit.

Verify that it belongs to the correct Product and Business.

Step 2 — Establish Product Unit Retrieval
Request
↓
Product Unit
↓
Product
↓
Business

Verify:

List.
Single retrieval.
Product filtering.
Business isolation.
Step 3 — Establish Unit Management
Owner
↓
Create / Update Unit
↓
Product ownership verification
↓
Database

Verify that only authorized users can modify definitions.

Step 4 — Establish Measurement Meaning

Connect the Product Unit to actual quantities.

Product
↓
Product Unit
↓
Quantity

Verify that the quantity is interpreted using the correct unit.

Step 5 — Establish Conversion

Where conversion is part of the established Product Unit design:

Unit A
↓
Conversion rule
↓
Unit B

Verify the conversion with real quantities.

Do not proceed until conversion produces deterministic results.

Step 6 — Transition Into Inventory
Product Unit verified
↓
Inventory Item
↓
Quantity
↓
Physical stock

Verify that inventory can represent the Product using its correct measurement.

Step 7 — Transition Into Stock Operations

Connect the Product Unit to:

Stock Movement
Shift Stock
Transfer

Verify that each operational quantity retains the correct measurement.

Step 8 — Verify Historical Reality

Create an operational record using a Product Unit.

Then change current configuration where permitted.

Verify:

Historical record
↓
Still reproducible
↓
Original operational meaning preserved
Step 9 — Complete the Product Unit Boundary

Verify the complete chain:

Business
↓
Product
↓
Product Unit
↓
Inventory
↓
Stock Movement
↓
Shift Stock
↓
Transfer
Step 10 — Transition to the Next Capability
Product Units built
↓
Product Units verified
↓
Measurement verified
↓
Conversion verified where applicable
↓
Inventory transition verified
↓
Stock operations transition verified
↓
Historical integrity verified
↓
Next implementation step

Never proceed merely because the Product Units module compiles.
