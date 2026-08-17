# Branch Design Architecture

> Static technical contract for the Branch capability.
>
> The AI agent must translate this specification into working software.
> It must not redesign, reinterpret, or invent business behavior.

---

# 1. Purpose

The Branch capability represents a physical operating location belonging to a Business.

A Branch provides the organizational boundary required to identify:

- Where workers operate.
- Where stock exists.
- Where shifts occur.
- Where operational activity happens.
- Where branch-level information is reported.

A Branch always belongs to exactly one Business.

The Branch capability does not manage:

- Users
- Products
- Inventory calculations
- Shifts
- Payments
- Transfers
- Reports

It provides the branch identity and ownership boundary required by those capabilities.

---

# 2. Requirements: Functional and Non-functional

## Functional Requirements

The system must:

- Create a Branch.
- Retrieve Branches belonging to a Business.
- Retrieve one Branch.
- Update editable Branch information.
- Associate every Branch with exactly one Business.
- Prevent a Branch from belonging to multiple Businesses.
- Allow authorized Owners to manage Branches.
- Allow operational capabilities to reference a Branch.
- Support multiple Branches under one Business.
- Preserve Branch identity after creation.

## Non-functional Requirements

The Branch capability must provide:

- Strict Business isolation.
- Referential integrity.
- Reliable persistence.
- Deterministic validation.
- Server-side authorization.
- Consistent error handling.
- Stable Branch identifiers.
- Efficient Branch retrieval.
- No duplication of Business ownership data beyond required foreign keys.
- Traceable relationships with dependent operational records.

---

# 3. Dependencies

## Depends On

- Business
- Authentication / Authorization
- Prisma
- PostgreSQL

## Used By

- Users
- Stock Locations
- Inventory Items
- Stock Movements
- Shifts
- Shift Stock Items
- Mpesa Accounts
- Mpesa Transactions
- Expenses
- Transfers
- Discrepancies
- Reports
- Analytics

The Branch capability depends on an existing Business.

A Branch must never exist independently of a Business.

---

# 4. Design Principles

- Every Branch belongs to exactly one Business.
- A Business may own multiple Branches.
- Branch ownership is enforced server-side.
- Client input must never override authenticated Business ownership.
- Cross-Business Branch access must be rejected.
- Branch identity must remain stable.
- Branch deletion must not silently destroy historical operational records.
- Dependent records must reference the Branch rather than duplicate Branch information.
- Branches must remain organizational boundaries, not become operational modules themselves.
- Branch-level filtering must always respect Business ownership.
- A Branch cannot reference a Business that does not exist.

---

# 5. Architecture

```text
Business
│
├── Branch A
│   ├── Stock Locations
│   ├── Inventory
│   ├── Shifts
│   ├── Payments
│   ├── Expenses
│   └── Operations
│
├── Branch B
│   ├── Stock Locations
│   ├── Inventory
│   ├── Shifts
│   ├── Payments
│   ├── Expenses
│   └── Operations
│
└── Branch C
    └── ...

Ownership:

Business
   ↓
Branch
   ↓
Branch-owned operational records

Business remains the highest ownership boundary.

Branch is the physical operational boundary beneath Business.

6. Module Skeleton
Branch
│
├── Identity
│   └── Branch ID
│
├── Information
│   ├── Name
│   ├── Location
│   └── Contact Information
│
├── Ownership
│   └── Business ID
│
├── API
│   ├── Create
│   ├── List
│   ├── Retrieve
│   └── Update
│
└── Persistence
    └── Prisma
7. File Structure
backend/
├── src/
│   └── branches/
│       ├── branches.module.ts
│       ├── branches.controller.ts
│       ├── branches.service.ts
│       │
│       ├── dto/
│       │   ├── create-branch.dto.ts
│       │   └── update-branch.dto.ts
│       │
│       └── entities/
│           └── branch.entity.ts
│
└── prisma/
    └── schema.prisma

If the project uses a different established entity/repository convention, preserve the project's existing convention rather than introducing a second architecture.

8. Entity Design
Branch

Required fields:

id
businessId
name
location
phone
createdAt
updatedAt
Field Requirements
Field	Requirement
id	Stable unique identifier
businessId	Required Business ownership reference
name	Required
location	Required
phone	Required
createdAt	Automatically generated
updatedAt	Automatically maintained
9. Prisma Design
model Branch {
  id String @id @default(cuid())

  businessId String
  business   Business @relation(fields: [businessId], references: [id])

  name     String
  location String
  phone    String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([businessId])
}

The exact relation names must remain consistent with the existing Prisma schema.

Do not create duplicate Business-to-Branch relations.

10. Database Constraints

The database must enforce:

Unique Branch ID.
Required businessId.
Valid Business foreign key.
Required Branch identity fields.
Referential integrity.

The database must prevent:

Branch
   ↓
Non-existent Business

A Branch must never become orphaned.

11. API Contract
Create Branch
POST /branches
Request
{
  "name": "Main Branch",
  "location": "Nairobi",
  "phone": "0700000000"
}

The Business ownership context must come from the authenticated request context where applicable.

The client must not be trusted to assign a Branch to another Business.

Response

Return the created Branch.

Get Branches
GET /branches

Returns Branches belonging to the authenticated Owner's Business.

Optional filtering may be supported where already established by the system.

The endpoint must never return Branches belonging to another Business.

Get Branch
GET /branches/:id

Returns one Branch only when it belongs to the authenticated Business context.

Update Branch
PATCH /branches/:id

Updates editable Branch information.

The following fields must not be changed through ordinary update operations:

id
businessId
createdAt
12. API Response Requirements

Successful responses must return predictable structured data.

A Branch response should contain:

{
  "id": "branch-id",
  "businessId": "business-id",
  "name": "Main Branch",
  "location": "Nairobi",
  "phone": "0700000000",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}

Do not expose unrelated dependent records by default.

13. API Error Behavior

The Branch API must handle:

Invalid input
Unauthorized request
Forbidden request
Branch not found
Business not found
Cross-Business access
Database failure

The API must use the project's standardized error-response format.

Raw Prisma/database errors must never be returned directly to clients.

14. Validation
Create Branch

Validate:

name exists.
name is not blank.
location exists.
location is not blank.
phone follows the project's accepted phone format.
Update Branch

Only editable fields may be supplied.

Reject attempts to modify:

id
businessId
createdAt

Validation must happen before persistence.

15. Authorization

There are two actors:

OWNER
WORKER

Branch management belongs to the Owner.

Owner

The Owner may:

Create Branches.
View Branches.
View individual Branches.
Update Branches.
Worker

Workers may access Branch information required for their assigned operational work.

Workers must not:

Create Branches.
Change Branch ownership.
Modify Branch identity/configuration.
Access unrelated Business Branches.

Backend authorization is authoritative.

Frontend visibility is not security.

16. Business Isolation

Every Branch query must be constrained by Business ownership.

Conceptually:

Authenticated Business
        ↓
Branch.businessId
        ↓
Requested Branch

Never use:

GET /branches/:id

as permission to access the Branch by ID alone.

The request must establish:

Branch belongs to authenticated Business

before returning or modifying the record.

17. Branch Relationships

A Branch may become the operational parent for:

Branch
│
├── Users / Worker assignments
├── Stock Locations
├── Inventory
├── Shifts
├── Shift Stock
├── Mpesa Accounts
├── Expenses
├── Transfers
├── Stock Movements
├── Discrepancies
└── Reports

The exact relationships must follow the established Prisma models.

Do not duplicate Branch information inside dependent records.

18. Branch and Workers

Workers operate within Branch boundaries.

The system must be able to establish:

Business
   ↓
Branch
   ↓
Worker

Where the existing User design permits workers to operate across multiple Branches, that relationship must be represented explicitly rather than assumed.

Branch access must never be inferred from the frontend.

19. Branch and Shifts

A Shift must identify the Branch where the shift occurs.

Business
   ↓
Branch
   ↓
Shift

This allows the system to determine:

Which Branch operated.
Which Worker operated.
Which stock belonged to the operation.
Which payments occurred.
Which expenses occurred.
Which reconciliation belongs to the Branch.
20. Branch and Inventory

Inventory must remain associated with the correct physical Branch through the established Stock Location structure.

Branch
   ↓
Stock Location
   ↓
Inventory Item

Do not make Branch directly responsible for inventory quantities if Stock Location and Inventory Item already provide that responsibility.

21. Branch and Transfers

Transfers may move stock between Branches.

Conceptually:

Source Branch
      ↓
Transfer
      ↓
Destination Branch

The Transfer capability remains responsible for transfer behavior.

Branch only provides the location identity and ownership boundary.

22. Branch and Reports

Reports may filter operational information by Branch.

Business
   ↓
Branch
   ↓
Operational records
   ↓
Reports

A Branch report must never include another Business's data.

23. Security Requirements

The implementation must:

Authenticate requests.
Authorize Branch operations.
Enforce Business ownership.
Prevent ID-based cross-Business access.
Validate all incoming data.
Avoid exposing database internals.
Preserve ownership relationships.
Prevent unauthorized Branch modification.
24. Performance and Reliability

The Branch capability must:

Index businessId.
Use efficient primary-key lookups.
Avoid unnecessary dependent-record loading.
Avoid N+1 queries.
Return only required fields.
Preserve database consistency.
Fail safely when dependencies are unavailable.

Branch listing must remain efficient as the number of Branches increases.

25. Tools
Primary
NestJS
TypeScript
Prisma
PostgreSQL
DTO validation mechanism already established by the project
Jest
Alternatives
Primary	Alternative
Prisma	PostgreSQL driver/query layer
Jest	Vitest
Existing DTO validation	class-validator / Zod

Alternatives must preserve:

API contracts.
Business isolation.
Database constraints.
Authorization behavior.
Test coverage.

Do not replace a tool merely for stylistic preference.

26. Testing Requirements
Creation

Verify:

Valid Branch
→ Created
→ Correct Business

Invalid Branch data must be rejected.

Retrieval

Verify:

Owner
→ Own Business
→ Own Branch
→ Allowed

And:

Owner
→ Different Business
→ Other Branch
→ Rejected
Update

Verify:

Owner can update permitted Branch fields.
Worker cannot modify Branch management information.
businessId cannot be changed.
Protected fields cannot be changed.
Multiple Branches

Verify:

Business
├── Branch A
├── Branch B
└── Branch C

All Branches belong to the same Business.

Isolation

Create:

Business A
└── Branch A

Business B
└── Branch B

Verify:

Business A → Branch A = allowed
Business A → Branch B = rejected
Business B → Branch B = allowed
Business B → Branch A = rejected
27. Completion Criteria

The Branch capability is complete when:

✓ Branch can be created
✓ Branch can be retrieved
✓ Branches can be listed
✓ Branch can be updated
✓ Business ownership is enforced
✓ Cross-Business access is rejected
✓ Owner permissions work
✓ Worker restrictions work
✓ Validation works
✓ Database constraints work
✓ Error handling works
✓ Branch relationships work
✓ Tests pass
✓ Application builds
✓ Dependent capabilities can reference Branch
28. Implementation Algorithm

This is the only dynamic section.

Execute these steps in order.
Do not skip verification or transitions.

Step 1 — Establish Branch Persistence

Create the Branch database representation.

Business
↓
Branch record
↓
Database

Verify that a Branch can be persisted with valid Business ownership.

Step 2 — Establish Branch Retrieval

Connect Branch retrieval to the database.

Request
↓
Branch service
↓
Database
↓
Branch

Verify:

List.
Single Branch.
Business filtering.
Step 3 — Establish Branch Creation

Connect Branch creation.

Owner
↓
Create Branch
↓
Business ownership
↓
Database

Verify that the new Branch belongs to the correct Business.

Step 4 — Establish Branch Update

Connect editable Branch information.

Owner
↓
Update Branch
↓
Validate ownership
↓
Update database

Verify protected fields cannot be changed.

Step 5 — Establish Authorization

Connect Branch operations to the existing authentication/authorization system.

Authenticated user
↓
Business
↓
Branch
↓
Permission
↓
Operation

Verify Owner and Worker behavior.

Step 6 — Establish Branch Isolation

Create test Businesses and Branches.

Verify:

Business A
↓
Branch A

cannot access:

Business B
↓
Branch B
Step 7 — Transition Branch Into the Next Reality

Only after Branch persistence, API behavior, authorization, and isolation are verified:

Branch built
↓
Branch verified
↓
Business → Branch ownership verified
↓
Branch becomes available to dependent capabilities
↓
Next implementation step

Never proceed by assuming the Branch foundation works. Verify the transition explicitly.
```
