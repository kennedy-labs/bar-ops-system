# Mpesa Account Architecture

> Defines the business Mpesa account used as the source for Mpesa transaction ingestion and reconciliation.

---

# 1. Purpose

The Mpesa Account module represents a business-owned Mpesa account connected to the system.

It establishes which Mpesa account belongs to which Business and provides the ownership boundary for Mpesa Transactions.

The module does not process individual transactions. That belongs to the Mpesa Transaction module.

---

# 2. Requirements: Functional and Non-functional

## Functional Requirements

The module must:

- Create an Mpesa Account.
- Associate the account with exactly one Business.
- Store the account identifier required for transaction ingestion.
- Retrieve an Mpesa Account.
- List Mpesa Accounts belonging to a Business.
- Update account information where permitted.
- Activate or deactivate an account.
- Prevent duplicate account registration within the same Business.

## Non-functional Requirements

The module must provide:

- Data isolation between Businesses.
- Referential integrity.
- Reliable account identification.
- Auditability of account creation and changes.
- Secure handling of account identifiers.
- Stable identifiers for historical transactions.
- Transaction-safe database operations.

---

# 3. Module Dependencies

## Depends On

- Business Module
- Prisma
- PostgreSQL

An Mpesa Account cannot exist without a Business.

## Used By

- Mpesa Transaction Module
- Shift Module
- Reconciliation Module
- Reports Module

The Mpesa Account provides the ownership context for Mpesa Transactions.

---

# 4. Design Principles

The module follows these principles:

- Every Mpesa Account belongs to exactly one Business.
- An Mpesa Account represents a business collection account.
- An account may be active or inactive.
- Historical transactions remain associated with their original account.
- Deactivating an account must not delete its transaction history.
- Account identity must remain stable.
- Transaction records belong to the Mpesa Transaction module, not this module.

---

# 5. Module Skeleton

````text
Mpesa Account
│
├── Account Identity
│   ├── Account Number / Identifier
│   ├── Display Name
│   └── Status
│
├── Ownership
│   └── Business
│
└── Operational References
    ├── Mpesa Transactions
    ├── Shifts
    ├── Reconciliation
    └── Reports
6. File Structure
backend/
├── src/
│   └── mpesa-accounts/
│       ├── mpesa-accounts.module.ts
│       ├── mpesa-accounts.controller.ts
│       ├── mpesa-accounts.service.ts
│       │
│       ├── dto/
│       │   ├── create-mpesa-account.dto.ts
│       │   └── update-mpesa-account.dto.ts
│       │
│       └── entities/
│           └── mpesa-account.entity.ts
│
└── prisma/
    └── schema.prisma
7. Entity Design
Mpesa Account
Fields
id
businessId
branchId
accountIdentifier
displayName
status
createdAt
updatedAt
Relationships
Mpesa Account belongs to:
Business
Branch
Mpesa Account has:
MpesaTransaction[]
Ownership
Business
   │
   └── Branch
          │
          └── Mpesa Account
          │
          └── Mpesa Transactions
The Mpesa Account is the ownership boundary between a Business and its incoming Mpesa transaction records.

Absolutely. I’ll make 8–14 the architecture, 15 the standalone Implementation Algorithm, with enough deterministic detail that an agent has little room to invent behavior.
# 8. API Design

## Create Mpesa Account

```http
POST /mpesa-accounts
Creates an Mpesa Account for a Business.
Required Input
businessId
branchId
accountIdentifier
displayName
Expected Behavior
Verify the Business exists.
Verify the Branch exists.
Verify the Branch belongs to the Business.
Verify the requester has permission to manage the Business.
Normalize the account identifier.
Check for an existing account with the same identifier under the Business.
Reject duplicates.
Create the account with ACTIVE status.
Return the created account.
Get Mpesa Accounts
GET /mpesa-accounts
Returns Mpesa Accounts belonging to the authorized Business.
Get Mpesa Account
GET /mpesa-accounts/:id
Returns one Mpesa Account.
The account must belong to the authorized Business.
Update Mpesa Account
PATCH /mpesa-accounts/:id
Updates permitted account information.
Historical transaction ownership must not be changed.
Deactivate Mpesa Account
POST /mpesa-accounts/:id/deactivate
Marks the account as inactive.
Existing transactions remain untouched.
9. Workflow
Business exists
      │
      ▼
Register Mpesa Account
      │
      ▼
Validate account identity
      │
      ▼
Account becomes ACTIVE
      │
      ▼
Mpesa Transaction ingestion
      │
      ▼
Transactions reference Mpesa Account
      │
      ▼
Shift reconciliation
      │
      ▼
Reports
Deactivation:
ACTIVE ACCOUNT
      │
      ▼
Deactivate
      │
      ▼
INACTIVE ACCOUNT
      │
      ├── Existing transactions remain available
      └── New ingestion is rejected or disabled
10. Integration Points
The Mpesa Account module integrates with:
Business Module
Mpesa Transaction Module
Shift Module
Reconciliation Module
Reports Module
Integration Boundary
The Mpesa Account module answers:
"Which Mpesa account does this transaction belong to?"
The Mpesa Transaction module answers:
"What transaction occurred?"
The Shift module answers:
"Which operational period owns that transaction?"
The Reconciliation module answers:
"Does the money received match operational records?"
11. Business Rules
Every Mpesa Account belongs to exactly one Business.
Account identifiers must be unique within a Business.
An inactive account cannot be used for new transaction ingestion.
Deactivation must never delete historical transactions.
Historical transactions retain their original mpesaAccountId.
An account cannot be moved between Businesses.
Account identity cannot be silently changed when historical transactions exist.
Mpesa Account deletion should be replaced by deactivation once transactions exist.
Only authorized Business users may manage Mpesa Accounts.
Cross-Business account access must be rejected.
12. Validation Rules
Creation
Validate:
Business exists.
Business is accessible to requester.
accountIdentifier is present.
accountIdentifier follows the accepted identifier format.
displayName is present.
No duplicate account exists for the Business.
Update
Validate:
Account exists.
Account belongs to requester’s Business.
Updated fields are permitted.
Account identifier remains unique.
Deactivation
Validate:
Account exists.
Account belongs to requester’s Business.
Account is currently active.
13. Database Design
model MpesaAccount {
  id String @id @default(cuid())

  businessId String
  business Business @relation(
    fields: [businessId],
    references: [id]
  )

  branchId String
  branch Branch @relation(
    fields: [branchId],
    references: [id]
  )

  accountIdentifier String
  displayName String

  status MpesaAccountStatus @default(ACTIVE)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  transactions MpesaTransaction[]

  @@unique([businessId, accountIdentifier])
}
Database Principles
businessId establishes ownership.
The composite unique constraint prevents duplicate registration within a Business.
status controls whether the account can receive new operational activity.
Historical transactions reference the account by immutable ID.
Deactivation preserves historical data.
14. Testing Requirements
Unit Tests
Verify:
Business existence validation.
Duplicate account rejection.
Account creation.
Account update.
Account deactivation.
Unauthorized access rejection.
Cross-Business access rejection.
Integration Tests
Verify:
Business → Mpesa Account relationship.
Mpesa Account → Mpesa Transaction relationship.
Historical transactions remain attached after deactivation.
Inactive accounts cannot be used for new ingestion.
API Tests
Verify:
POST   /mpesa-accounts
GET    /mpesa-accounts
GET    /mpesa-accounts/:id
PATCH  /mpesa-accounts/:id
POST   /mpesa-accounts/:id/deactivate

15. IMPLEMENTATION ALGORITHM
This section is the deterministic build procedure for the Mpesa Account module.
An implementation agent must follow this sequence and must not invent additional business behavior when the required behavior is already defined here.
Step 1 — Verify Prerequisites
Before modifying code:
Confirm the Business module exists.
Confirm the Prisma Business model exists.
Confirm the project currently builds.
Confirm the Prisma schema validates.
Confirm no existing Mpesa Account implementation conflicts with this design.
If any prerequisite fails:
STOP.
Report the exact failure.
Do not redesign the dependency.
Step 2 — Create the Prisma Enum
Add:
enum MpesaAccountStatus {
  ACTIVE
  INACTIVE
}
Do not add additional statuses unless explicitly required by a later architecture document.
Step 3 — Create the Prisma Model
Add MpesaAccount with:
id
businessId
accountIdentifier
displayName
status
createdAt
updatedAt
Relationships:
MpesaAccount → Business
MpesaAccount → MpesaTransaction[]
Enforce:
@@unique([businessId, accountIdentifier])
Do not add transaction-specific fields to this model.
Step 4 — Update Business Relationship
Add the corresponding relation to Business.
The relationship must allow:
Business
    └── MpesaAccount[]
Do not duplicate Business information inside Mpesa Account.
Step 5 — Validate Prisma Schema
Run:
npx prisma format
Then:
npx prisma validate
If validation fails:
STOP.
Fix the schema relationship or type error.
Do not continue to module implementation.
Step 6 — Create Migration
Create the migration:
npx prisma migrate dev --name add_mpesa_account
Verify:
Migration succeeds.
Database schema matches Prisma schema.
No unrelated tables are modified unexpectedly.
Step 7 — Create Module Structure
Create:
src/mpesa-accounts/
├── mpesa-accounts.module.ts
├── mpesa-accounts.controller.ts
├── mpesa-accounts.service.ts
│
├── dto/
│   ├── create-mpesa-account.dto.ts
│   └── update-mpesa-account.dto.ts
│
└── entities/
    └── mpesa-account.entity.ts
Do not create ingestion logic here.
Step 8 — Implement Creation
Implement:
create()
Algorithm:
Receive request
      ↓
Validate DTO
      ↓
Resolve authenticated Business
      ↓
Verify Business exists
      ↓
Normalize accountIdentifier
      ↓
Search for duplicate
      ↓
If duplicate → reject
      ↓
Create MpesaAccount
      ↓
status = ACTIVE
      ↓
Return account
The service must enforce the ownership boundary.
Never trust a client-supplied businessId when authenticated Business context is already available.
Step 9 — Implement Retrieval
For every read operation:
Resolve authenticated Business
        ↓
Query by account ID
        ↓
Require matching businessId
        ↓
Return account
Never retrieve:
WHERE id = :id
without the Business ownership constraint.
The effective query must behave like:
WHERE id = :id
AND businessId = authorizedBusinessId

Step 10 — Implement Update
Allow only fields explicitly defined as editable.
The update algorithm:
Resolve account
      ↓
Verify Business ownership
      ↓
Validate new values
      ↓
Normalize accountIdentifier if changed
      ↓
Check uniqueness
      ↓
Update permitted fields
      ↓
Return account
Do not modify:
businessId
id
historical transaction ownership

Step 11 — Implement Deactivation
Algorithm:
Resolve account
      ↓
Verify Business ownership
      ↓
Verify status = ACTIVE
      ↓
Set status = INACTIVE
      ↓
Persist
      ↓
Return account
Do not delete the account.
Do not delete its transactions.
Do not modify historical transaction records.

Step 12 — Enforce Ingestion Boundary
The Mpesa Transaction module must check:
MpesaAccount exists?
        ↓
Belongs to Business?
        ↓
Status = ACTIVE?
If inactive:
Reject new ingestion.
Historical transactions remain readable.

Step 13 — Implement Controller
Expose only the defined operations:
POST   /mpesa-accounts
GET    /mpesa-accounts
GET    /mpesa-accounts/:id
PATCH  /mpesa-accounts/:id
POST   /mpesa-accounts/:id/deactivate
Controllers must:
Validate input.
Delegate business logic to the service.
Return appropriate HTTP responses.
Never contain database business logic.

Step 14 — Test the Complete Reality
Verify this exact scenario:
Business A
   ↓
Register Mpesa Account X
   ↓
Account X = ACTIVE
   ↓
Transaction references X
   ↓
Deactivate X
   ↓
Transaction still exists
   ↓
New ingestion using X is rejected
Also verify:
Business B
   ↓
Attempts to access Account X
   ↓
Access rejected
Step 15 — Completion Gate
The module is complete only when all of the following are true:
✓ Prisma model exists
✓ Business relationship works
✓ Migration succeeds
✓ Account creation works
✓ Account retrieval works
✓ Account update works
✓ Account deactivation works
✓ Business isolation works
✓ Duplicate prevention works
✓ Historical transactions remain intact
✓ Inactive accounts cannot receive new transactions
✓ Tests pass
✓ Application builds
Only after this gate passes should implementation proceed to:
````
