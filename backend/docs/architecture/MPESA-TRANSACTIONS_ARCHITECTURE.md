# Mpesa Transaction Architecture

> Defines the individual Mpesa financial events received through a Business Mpesa Account and establishes their ownership, lifecycle, and reconciliation boundaries.

---

# 1. Purpose

The Mpesa Transaction module records individual Mpesa transactions belonging to a Business Mpesa Account.

It provides the immutable financial event history required to determine:

- Money received
- Transaction identity
- Transaction timing
- Transaction ownership
- Shift attribution
- Payment reconciliation

The module does not manage the Mpesa Account itself. That belongs to the Mpesa Account module.

---

# 2. Requirements: Functional and Non-functional

## Functional Requirements

The module must:

- Receive Mpesa transactions.
- Associate each transaction with an Mpesa Account.
- Preserve the external Mpesa transaction identifier.
- Record transaction amount and timestamp.
- Prevent duplicate transactions.
- Associate transactions with a Shift when ownership is established.
- Retrieve transactions.
- Filter transactions by account, shift, date, and status.
- Support reconciliation using transaction records.
- Preserve transaction history.

## Non-functional Requirements

The module must provide:

- Idempotent transaction ingestion.
- Immutable financial history.
- Business-level data isolation.
- Reliable transaction identification.
- Atomic database operations.
- Auditability.
- Safe handling of financial amounts.
- Deterministic reconciliation behavior.

---

# 3. Module Dependencies

## Depends On

- Business Module
- Mpesa Account Module
- Shift Module
- Prisma
- PostgreSQL

## Used By

- Shift Payment Summary Module
- Discrepancy Module
- Reports Module
- Reconciliation processes

The Mpesa Transaction module provides the financial events consumed by reconciliation.

---

# 4. Design Principles

The module follows these principles:

- Every transaction belongs to exactly one Mpesa Account.
- Every Mpesa Account belongs to exactly one Business.
- External Mpesa transaction identifiers are unique.
- Transactions are immutable after ingestion.
- A transaction must never silently change ownership.
- Duplicate ingestion must not create duplicate financial records.
- Transaction amounts are stored using exact decimal representation.
- Historical transactions remain available even when their Mpesa Account becomes inactive.
- Shift attribution must be explicit and traceable.

---

# 5. Module Skeleton

````text
Mpesa Transaction
│
├── Transaction Identity
│   ├── External Transaction ID
│   ├── Amount
│   ├── Transaction Time
│   └── Status
│
├── Ownership
│   ├── Business
│   └── Mpesa Account
│
├── Operational Attribution
│   └── Shift
│
└── Reconciliation
    ├── Payment Summary
    ├── Discrepancy
    └── Reports

6. File Structure
backend/
├── src/
│   └── mpesa-transactions/
│       ├── mpesa-transactions.module.ts
│       ├── mpesa-transactions.controller.ts
│       ├── mpesa-transactions.service.ts
│       │
│       ├── dto/
│       │   ├── create-mpesa-transaction.dto.ts
│       │   └── update-mpesa-transaction.dto.ts
│       │
│       └── entities/
│           └── mpesa-transaction.entity.ts
│
└── prisma/
    └── schema.prisma

7. Entity Design
Mpesa Transaction
Fields
id
businessId
mpesaAccountId
shiftId
transactionReference
transactionType
amount
transactionTime
sender
receiver
status
reconciliationStatus
createdAt
updatedAt
Relationships
Mpesa Transaction belongs to:
Business
Mpesa Account
Shift (optional)
Referenced by:
Shift Payment Summary
Discrepancy
Reports
Ownership

Business
   │
   └── Mpesa Account
          │
          └── Mpesa Transaction
                  │
                  └── Shift

The Mpesa Transaction is the immutable financial event.
The Shift represents the operational ownership assigned to that transaction.

# 8. API Design

## Ingest Mpesa Transaction

```http
POST /mpesa-transactions
Creates a transaction from an Mpesa source.
The operation must be idempotent: receiving the same external transaction identifier again must not create another transaction.

Get Transactions
GET /mpesa-transactions
Supports filtering by:
Mpesa Account
Branch
Shift
Transaction type
Transaction status
Reconciliation status
Date range

Get Transaction
GET /mpesa-transactions/:id
Returns one transaction within the authorized Business.

Get Shift Transactions
GET /mpesa-transactions/shift/:shiftId
Returns transactions attributed to a Shift.

9. Transaction Lifecycle
Mpesa Event Received
        │
        ▼
Validate Payload
        │
        ▼
Verify Mpesa Account
        │
        ▼
Check Duplicate
        │
        ▼
Create Immutable Transaction
        │
        ▼
Determine Shift Attribution
        │
        ▼
Available for Reconciliation
A transaction must never be deleted as part of normal operations.

10. Integration Points
The Mpesa Transaction module integrates with:
Business Module
Mpesa Account Module
Shift Module
Shift Payment Summary Module
Discrepancy Module
Reports Module
Integration Boundaries
Mpesa Account
Answers:
Which business account received this transaction?
Mpesa Transaction
Answers:
What financial event occurred?
Shift
Answers:
Which operational period owns the transaction?
Payment Summary
Answers:
How much Mpesa money was collected during the Shift?
Discrepancy
Answers:
Does recorded Mpesa money match expected operational revenue?

11. Business Rules
Every transaction belongs to exactly one Business.
Every transaction belongs to exactly one Mpesa Account.
A transaction may belong to one Shift.
transactionReference must be unique per account.
Transaction amount must be greater than zero.
Transaction type must be valid.
Transactions are immutable after creation.
A transaction cannot be moved to another Business.
A transaction cannot be reassigned between Mpesa Accounts.
Historical transactions remain available after account deactivation.
Duplicate ingestion must return the existing transaction or an equivalent idempotent response.
Only transactions belonging to the authorized Business may be retrieved.
Financial amounts must use exact decimal arithmetic.

12. Validation Rules
Ingestion
Validate:
Business exists.
Branch exists where applicable.
Mpesa Account exists.
Mpesa Account belongs to the Business.
Transaction reference is present.
Transaction reference is unique for the relevant account.
Transaction type is valid.
Amount is positive.
Transaction timestamp is valid.
Sender/receiver information is valid where required.
Required transaction data is present.
Shift Attribution
Validate:
Shift exists when attribution is supplied.
Shift belongs to the same Business.
Shift belongs to the same Branch context where applicable.
Shift is eligible to receive transaction attribution.
Attribution cannot silently overwrite existing ownership.
Retrieval
Validate:
Transaction exists.
Transaction belongs to the authorized Business.
13. Database Design

enum MpesaTransactionStatus {
  RECEIVED
  RECONCILED
  DISPUTED
}

enum MpesaTransactionType {
  PAYBILL
  POCHI
  BUY_GOODS_AND_SERVICES
  SEND_MONEY
}

enum MpesaReconciliationStatus {
  UNRECONCILED
  RECONCILED
}

model MpesaTransaction {
  id String @id @default(cuid())

  businessId String
  business Business @relation(
    fields: [businessId],
    references: [id]
  )

  mpesaAccountId String
  mpesaAccount MpesaAccount @relation(
    fields: [mpesaAccountId],
    references: [id]
  )

  shiftId String?
  shift Shift? @relation(
    fields: [shiftId],
    references: [id]
  )

  transactionReference String

  transactionType MpesaTransactionType

  amount Decimal

  transactionTime DateTime

  sender String?

  receiver String?

  status MpesaTransactionStatus @default(RECEIVED)

  reconciliationStatus MpesaReconciliationStatus @default(UNRECONCILED)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([mpesaAccountId, transactionReference])
  @@index([businessId, transactionTime])
  @@index([shiftId])
}

Database Principles
businessId establishes tenant ownership.
mpesaAccountId identifies the receiving account.
transactionReference provides idempotency.
Decimal prevents floating-point financial errors.
Transactions remain stored after reconciliation.
Status changes represent reconciliation state, not changes to the original financial event.

14. Testing Requirements
Unit Tests
Verify:
Valid transaction creation.
Invalid account rejection.
Wrong-Business account rejection.
Zero amount rejection.
Negative amount rejection.
Duplicate transaction handling.
Immutable transaction behavior.
Valid Shift attribution.
Invalid Shift attribution rejection.
Integration Tests
Verify:
Business → Mpesa Account → Transaction relationship.
Transaction → Shift relationship.
Duplicate ingestion does not create duplicate records.
Account deactivation does not remove historical transactions.
Cross-Business transaction access is rejected.
API Tests
Verify:
POST /mpesa-transactions
GET  /mpesa-transactions
GET  /mpesa-transactions/:id
GET  /mpesa-transactions/shift/:shiftId
Reconciliation Test
Given:
Transaction A = 500
Transaction B = 1,000
Transaction C = 750
The Shift Mpesa total must equal:
2,250
No transaction may be counted twice.


# 15. Implementation Algorithm

> Deterministic implementation procedure for the Mpesa Transaction module.
> Follow this sequence exactly. Do not invent business behavior where the architecture already defines it.

## Step 1 — Verify Prerequisites

Confirm:

- Business module exists.
- Mpesa Account module exists.
- Shift module exists.
- Prisma schema validates.
- Application currently builds.

If any prerequisite fails:

```text
STOP.
Report the exact failure.
Do not continue.

Step 2 — Create Transaction Status
Add:
enum MpesaTransactionStatus {
  RECEIVED
  RECONCILED
  DISPUTED
}
Do not add additional statuses without an explicit requirement.

Step 3 — Create Prisma Model
Create MpesaTransaction with:
id
businessId
mpesaAccountId
shiftId
transactionReference
amount
transactionTime
status
createdAt
updatedAt
Relationships:
Business
MpesaAccount
Shift
Constraints:
@@unique([mpesaAccountId, transactionReference])
Use Decimal for amount.

Step 4 — Validate and Migrate
Run:
npx prisma format
npx prisma validate
Then:
npx prisma migrate dev --name add_mpesa_transaction
If schema validation or migration fails:
STOP.
Fix the exact database problem.
Do not continue to service implementation.

Step 5 — Create Module
Create:
src/mpesa-transactions/
├── mpesa-transactions.module.ts
├── mpesa-transactions.controller.ts
├── mpesa-transactions.service.ts
│
├── dto/
│   ├── create-mpesa-transaction.dto.ts
│   └── update-mpesa-transaction.dto.ts
│
└── entities/
    └── mpesa-transaction.entity.ts
Do not place Mpesa Account management logic here.

Step 6 — Implement Ingestion
Implement:
create()
Algorithm:
Receive transaction payload
        ↓
Validate payload
        ↓
Resolve authorized Business
        ↓
Verify Mpesa Account exists
        ↓
Verify Mpesa Account belongs to Business
        ↓
Verify account is ACTIVE
        ↓
Validate amount > 0
        ↓
Validate transaction timestamp
        ↓
Check transactionReference
        ↓
If duplicate → return existing transaction
        ↓
Create transaction
        ↓
status = RECEIVED
        ↓
Assign Shift if valid attribution is supplied
        ↓
Return transaction
The operation must be idempotent.
The same external transaction must never produce two financial records.

Step 7 — Enforce Business Isolation
Every transaction query must include Business ownership.
Never rely on:
id only
Use the equivalent of:
id
AND businessId = authorizedBusinessId
The same rule applies to:
Mpesa Account
Shift
Transaction retrieval
Transaction attribution
Cross-Business access must fail.

Step 8 — Implement Shift Attribution
When a transaction is associated with a Shift:
Verify Shift exists
        ↓
Verify Shift belongs to same Business
        ↓
Verify Shift is eligible
        ↓
Attach shiftId
Never attach a Shift to a different Business.

If attribution is invalid:

```text
STOP.
Reject the operation.
Do not create or modify transaction ownership.

Step 9 — Enforce Immutability

After creation, do not allow modification of:

- id
- businessId
- mpesaAccountId
- transactionReference
- amount
- transactionTime
- createdAt

Only explicitly permitted reconciliation state changes may modify `status`.

Do not implement a general-purpose update operation that can alter financial event data.

Step 10 — Implement Transaction Retrieval

For:

```http
GET /mpesa-transactions
GET /mpesa-transactions/:id
GET /mpesa-transactions/shift/:shiftId

Algorithm:

Receive request
      ↓
Resolve authorized Business
      ↓
Apply Business ownership filter
      ↓
Apply requested filters
      ↓
Query database
      ↓
Return only authorized records

Supported filters:

mpesaAccountId
shiftId
status
from
to

Date filtering must use transactionTime.

Step 11 — Implement Duplicate Handling

When receiving a transaction:

transactionReference received
        ↓
Search using:
mpesaAccountId
+
transactionReference
        ↓
Existing transaction?
   │
   ├── YES → return existing transaction
   │
   └── NO  → continue creation

Do not create a second transaction.

The database unique constraint remains the final protection against concurrent duplicate ingestion.

If concurrent requests produce a unique-constraint conflict:

Catch conflict
      ↓
Retrieve existing transaction
      ↓
Return existing transaction

Step 12 — Implement Reconciliation Status

Initial state:

RECEIVED

When reconciliation successfully includes the transaction:

RECEIVED
    ↓
RECONCILED

If the transaction is formally identified as problematic:

RECEIVED
    ↓
DISPUTED

Do not change:

amount
transaction time
external transaction ID
Mpesa Account
Business ownership

Status describes reconciliation state only.

Step 13 — Implement Controller

Expose only the defined operations:

POST /mpesa-transactions
GET  /mpesa-transactions
GET  /mpesa-transactions/:id
GET  /mpesa-transactions/shift/:shiftId

The controller must:

Validate request input.
Resolve authenticated Business context.
Delegate business logic to the service.
Return appropriate HTTP responses.

The controller must not contain:

Prisma queries.
Reconciliation calculations.
Ownership rules.
Duplicate-handling logic.

Step 14 — Implement Service Boundaries

The service owns:

Transaction validation.
Mpesa Account verification.
Business ownership verification.
Duplicate detection.
Transaction creation.
Shift attribution.
Status transitions.

The service must not:

Create Mpesa Accounts.
Modify Shift records.
Calculate Shift Payment Summaries.
Create Discrepancies.
Generate Reports.

Those responsibilities belong to their respective modules.

Step 15 — Test Financial Integrity

Test this exact scenario:

Business A
    ↓
Mpesa Account A
    ↓
Transaction X = 500
    ↓
Transaction X created

Submit Transaction X again:

Transaction X
    ↓
Existing transaction detected
    ↓
No second record created

Expected:

Database transaction count = 1
Total Mpesa value = 500

Step 16 — Test Business Isolation

Create:

Business A
└── Mpesa Account A
    └── Transaction A

Business B
└── Mpesa Account B
    └── Transaction B

Attempt:

Business A → Transaction B

Expected:

ACCESS DENIED

Attempt:

Business B → Transaction A

Expected:

ACCESS DENIED

Neither transaction may leak across Business boundaries.

Step 17 — Test Account Deactivation

Scenario:

Mpesa Account
    ↓
ACTIVE
    ↓
Transaction A created
    ↓
Account deactivated

Expected:

Transaction A remains accessible.

Then attempt:

New Transaction
      ↓
Inactive Account

Expected:

INGESTION REJECTED

Step 18 — Test Shift Attribution

Scenario:

Business A
    ↓
Branch A
    ↓
Shift A
    ↓
Mpesa Transaction A

Expected:

Transaction A.shiftId = Shift A

Attempt to attach the transaction to a Shift belonging to another Business.

Expected:

REJECT

Existing attribution must not be silently replaced.

Step 19 — Test Reconciliation

Given:

Transaction A = 500
Transaction B = 1,000
Transaction C = 750

All belong to the same Shift.

Calculate:

500 + 1,000 + 750 = 2,250

Expected Shift Mpesa total:

2,250

The same transaction must never contribute twice.

Step 20 — Run Full Verification

Run:

npx prisma validate
npm run build
npm test

Then verify:

✓ Schema valid
✓ Migration successful
✓ Module builds
✓ Valid ingestion works
✓ Duplicate ingestion is idempotent
✓ Invalid accounts are rejected
✓ Inactive accounts are rejected
✓ Business isolation works
✓ Shift attribution works
✓ Transactions remain immutable
✓ Status transitions work
✓ Reconciliation totals are correct
✓ Tests pass

If any verification fails:

STOP.
Identify the exact failing layer.
Fix it.
Run verification again.

Step 21 — Completion Gate

The Mpesa Transaction module is complete only when:

✓ Transaction entity exists
✓ Mpesa Account relationship works
✓ Business relationship works
✓ Shift relationship works
✓ Idempotent ingestion works
✓ Duplicate protection works
✓ Business isolation works
✓ Financial amounts use Decimal
✓ Transaction records are immutable
✓ Shift attribution works
✓ Reconciliation status works
✓ Historical transactions survive account deactivation
✓ API endpoints work
✓ Tests pass
✓ Application builds
````
