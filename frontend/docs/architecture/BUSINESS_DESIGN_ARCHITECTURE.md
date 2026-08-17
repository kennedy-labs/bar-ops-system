# Business Design Architecture

> Static technical contract for the Business capability.
>
> The AI agent must translate this specification into working software.
> It must not redesign, reinterpret, or invent behavior.

---

# 1. Purpose

The Business capability establishes the ownership root of the system.

A Business owns the operational records belonging to it.

The Business capability provides:

- Business identity
- Business information
- Business-level configuration
- Ownership boundaries
- Business retrieval and modification

The Business capability does not manage branches, workers, inventory, shifts, payments, or reports.

Those capabilities belong to their respective modules.

---

# 2. Requirements: Functional and Non-functional

## Functional Requirements

The system must:

- Create a Business.
- Retrieve a Business.
- Update editable Business information.
- Allow authorized users to view Business information.
- Establish Business ownership for dependent records.
- Prevent records from belonging to multiple Businesses.
- Prevent cross-Business access.
- Provide stable Business identity.

## Non-functional Requirements

The system must provide:

- Strict Business data isolation.
- Referential integrity.
- Predictable API behavior.
- Validation at the API and database boundaries.
- Reliable persistence.
- Secure authorization.
- Consistent error responses.
- Exact timestamps.
- No unnecessary duplication of Business information.

---

# 3. Dependencies

## Depends On

- PostgreSQL
- Prisma
- Authentication/authorization capability

## Used By

- Branches
- Users
- Products
- Product Units
- Product Cost History
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

The Business is the ownership root for these capabilities.

---

# 4. Design Principles

- Every operational record must have an ownership path to exactly one Business.
- Business ownership must be enforced server-side.
- Client-provided ownership identifiers must never override authenticated ownership.
- Cross-Business reads must be rejected.
- Cross-Business writes must be rejected.
- Business identity must remain stable.
- Business deletion must not silently destroy operational history.
- Dependent modules must reference the Business rather than duplicate Business data.
- The Business module must not contain unrelated operational logic.
- Business information is authoritative only within the Business capability.

---

# 5. Architecture

```text
Business
│
├── Identity
│   └── Stable Business ID
│
├── Information
│   ├── Name
│   ├── Phone
│   ├── Email
│   ├── Currency
│   └── Timezone
│
├── Ownership
│   └── Business ID referenced by dependent records
│
└── Configuration
    └── Business-level settings

Ownership:

Business
   │
   ├── Branches
   ├── Users
   ├── Products
   ├── Inventory
   ├── Shifts
   ├── Payments
   ├── Expenses
   ├── Transfers
   ├── Reconciliation
   └── Reports
6. Module Skeleton
Business
│
├── API
│   ├── Create
│   ├── Read
│   └── Update
│
├── Business Service
│   ├── Creation
│   ├── Retrieval
│   └── Update
│
├── Validation
│
├── Authorization
│
└── Persistence
    └── Prisma
7. File Structure
backend/
├── src/
│   └── businesses/
│       ├── businesses.module.ts
│       ├── businesses.controller.ts
│       ├── businesses.service.ts
│       │
│       ├── dto/
│       │   ├── create-business.dto.ts
│       │   └── update-business.dto.ts
│       │
│       └── entities/
│           └── business.entity.ts
│
└── prisma/
    └── schema.prisma
8. Data Model
Business

Required fields:

id
name
phone
email
currency
timezone
createdAt
updatedAt
Field Requirements
Field	Requirement
id	Stable unique identifier
name	Required
phone	Required
email	Required
currency	Required
timezone	Required
createdAt	Automatically generated
updatedAt	Automatically maintained
Prisma Structure
model Business {
  id String @id @default(cuid())

  name String
  phone String
  email String

  currency String
  timezone String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

Dependent modules must add their own relations to Business.

9. Database Constraints

The database must enforce:

Unique Business ID.
Required Business identity fields.
Valid foreign-key relationships from dependent records.
Referential integrity.

Do not use application logic as the only protection for ownership relationships.

10. API Contract
Create Business
POST /businesses
Request
{
  "name": "Example Business",
  "phone": "0700000000",
  "email": "owner@example.com",
  "currency": "KES",
  "timezone": "Africa/Nairobi"
}
Response

Return the created Business.

Get Business
GET /businesses/:id

The request must only succeed when the requester is authorized to access the Business.

Update Business
PATCH /businesses/:id

Only editable Business information may be changed.

The following must never be changed:

id
createdAt
11. API Error Behavior

The API must provide deterministic responses for:

Invalid input
Unauthorized request
Forbidden request
Business not found
Database failure

The frontend must never receive raw database errors.

Errors should use the backend's standardized error-response format.

12. Validation
Creation

Validate:

name exists.
phone exists and follows the accepted phone format.
email exists and is valid.
currency exists.
timezone exists and is valid.
Update

Validate only fields allowed by the update contract.

Reject attempts to modify protected identity fields.

13. Authorization

There are two system actors:

OWNER
WORKER

Business management belongs to:

OWNER

Workers must not modify Business configuration or identity.

Every Business request must establish:

Authenticated User
        ↓
Authorized Business
        ↓
Requested Resource

Cross-Business access must be rejected.

Authorization must be enforced on the backend even if the frontend hides unavailable actions.

14. Security Requirements
Never trust businessId supplied by the client when authenticated Business context is available.
Never expose another Business's records.
Never allow a Worker to modify Business ownership.
Never expose sensitive database errors.
Validate all incoming data.
Enforce authorization server-side.
Use secure authentication/session mechanisms provided by the authentication layer.
15. Performance and Reliability

The Business capability must:

Use indexed primary-key lookups.
Avoid unnecessary database queries.
Avoid loading unrelated operational records when retrieving Business information.
Use database transactions where multiple Business-owned records are created together.
Return predictable responses.
Fail safely without corrupting ownership relationships.

Business retrieval should not automatically load all dependent records.

16. Tools
Required
NestJS
TypeScript
Prisma
PostgreSQL
Zod or the project's established DTO validation mechanism
Jest for testing
Tool Selection Rule

Use the tools already established by the project unless there is a verified reason to replace them.

Alternatives

If a required tool becomes unavailable:

Primary	Alternative
Prisma	Direct PostgreSQL driver/query layer
Jest	Vitest
Zod	class-validator
PostgreSQL	PostgreSQL-compatible managed provider

An alternative must preserve the same externally observable behavior and data constraints.

17. Integration Contracts
Business → Branch

A Branch must reference exactly one Business.

Business
   ↓
Branch
Business → User

A User must have an ownership relationship to the Business.

Business
   ↓
User
Business → Product

A Product must belong to one Business.

Business
   ↓
Product

The same ownership pattern applies to every Business-owned operational capability.

18. Testing Requirements
Creation

Verify:

Valid Business can be created.
Invalid input is rejected.
Required fields cannot be omitted.
Retrieval

Verify:

Authorized Owner can retrieve Business.
Unknown Business returns not-found behavior.
Cross-Business access is rejected.
Update

Verify:

Authorized Owner can update editable fields.
Worker cannot update Business.
Protected fields cannot be changed.
Ownership

Verify:

Business A
   ↓
Resource A

Business B
   ↓
Resource B

Business A must never retrieve or modify Resource B.

Reliability

Verify:

Database failures produce controlled errors.
Failed operations do not create partial ownership records.
19. Completion Criteria

The Business capability is complete when:

✓ Business can be created
✓ Business can be retrieved
✓ Business can be updated
✓ Owner authorization works
✓ Worker restrictions work
✓ Business isolation works
✓ Database constraints work
✓ Validation works
✓ Error handling works
✓ Tests pass
✓ Application builds
✓ Dependent modules can reference Business
20. Implementation Algorithm

This is the only dynamic section of this document.

It describes the current build sequence. The implementation agent must execute it exactly and must verify each transition before continuing.

Step 1 — Establish Business Persistence

Create the Business database representation.

Business information
↓
Business record
↓
Database

Verify the record can be persisted and retrieved.

Step 2 — Establish Business Service

Connect Business operations to the database.

Request
↓
Business service
↓
Database
↓
Business result

Verify creation, retrieval, and update.

Step 3 — Establish Business API

Expose the required Business operations through the API.

Frontend/API client
↓
Business controller
↓
Business service
↓
Database

Verify the complete path.

Step 4 — Establish Ownership

Connect the Business to the first dependent capability.

The dependent record must reference the Business.

Verify:

Business
↓
Dependent record

The dependent record must not exist without valid Business ownership.

Step 5 — Establish Authorization

Connect the authenticated user to Business ownership.

Verify:

Owner
↓
Authorized Business
↓
Business operation

Verify:

Worker
↓
Unauthorized Business management
↓
Rejected
Step 6 — Establish the Business as a Reliable Foundation

Run the complete Business test set.

Only when all tests pass should implementation proceed to the next capability in IMPLEMENTATION_ALGORITHM.md.

Never treat the Business module as complete merely because its files compile.

The transition must be:

Business built
↓
Business verified
↓
Business ownership established
↓
Authorization verified
↓
Next reality step
```
