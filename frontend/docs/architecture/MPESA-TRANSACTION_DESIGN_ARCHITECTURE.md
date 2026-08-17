MPESA_TRANSACTION_DESIGN_ARCHITECTURE.md

Static technical contract for Mpesa Transactions.
AI agents translate this specification into software. They must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Mpesa Transactions capability records and reconciles money movements involving the business's Mpesa accounts.

It answers:

What Mpesa transaction happened?
Which account received/sent it?
How much was involved?
When did it happen?
What reference identifies it?
Which business/branch does it belong to?
Which shift does it relate to?
Has it been reconciled?

The transaction record is the authoritative system record for the Mpesa event after ingestion.

2. Requirements: Functional and Non-functional
   Functional Requirements

The system must:

Record Mpesa transactions.
Identify the Mpesa account involved.
Record transaction type.
Record transaction amount.
Record transaction time.
Record the Mpesa transaction reference.
Record relevant sender/receiver information.
Associate transactions with the correct Business.
Associate transactions with the correct Branch where applicable.
Associate transactions with the correct Shift where applicable.
Support Paybill transactions.
Support Pochi la Biashara transactions.
Support Buy Goods and Services transactions.
Support Send Money transactions.
Support reconciliation.
Prevent duplicate transaction records.
Preserve transaction history.
Allow Owners to review transactions.
Allow Workers to view relevant operational transaction information.
Non-functional Requirements

The capability must provide:

Exact monetary values.
Immutable historical records.
Idempotent transaction ingestion.
Business isolation.
Branch isolation.
Reliable reconciliation.
Secure handling of transaction information.
Traceability to the external Mpesa reference.
Transaction-safe persistence.
Reliable performance.
Mobile-friendly responses. 3. Dependencies
Depends On
Business
Branch
User
Shift
Mpesa Account
Authentication / Authorization
Prisma
PostgreSQL
External Mpesa integration where enabled
Used By
Shifts
Reconciliation
Reports
Analytics
Profit calculations 4. Design Principles
An Mpesa Transaction represents an actual financial event.
The external Mpesa transaction reference is the primary external identity.
Transactions are immutable historical records.
A transaction must never be silently rewritten.
Duplicate external transactions must not create duplicate internal records.
Mpesa Account identifies the business account involved.
Shift identifies the operational period where applicable.
Reconciliation connects Mpesa reality to business operations.
External Mpesa integration is responsible for receiving/obtaining transaction data.
This module is responsible for validating, storing, and exposing transaction records.
Business and Branch ownership must always be enforced. 5. Operational Model
External Mpesa Reality
↓
Mpesa Transaction
↓
Business Account
↓
Operational Shift
↓
Reconciliation
↓
Reports / Profit

Example:

Customer pays KSh 2,000
↓
Mpesa Paybill
↓
Transaction received
↓
Mpesa Transaction record
↓
Evening Shift
↓
Reconciliation 6. Supported Transaction Contexts

The implementation must support the operational Mpesa methods already established:

PAYBILL
POCHI
BUY_GOODS_AND_SERVICES
SEND_MONEY

If the existing Prisma enum uses different canonical names, the existing schema is authoritative.

Do not introduce a second incompatible transaction taxonomy.

7. Module Skeleton
   Mpesa Transactions
   │
   ├── Transaction Ingestion
   │ ├── External
   │ └── Internal
   │
   ├── Transaction Identity
   │ ├── External Reference
   │ └── Internal ID
   │
   ├── Transaction Details
   │ ├── Type
   │ ├── Amount
   │ ├── Time
   │ ├── Sender
   │ └── Receiver
   │
   ├── Operational Association
   │ ├── Business
   │ ├── Branch
   │ ├── Mpesa Account
   │ └── Shift
   │
   ├── Reconciliation
   ├── Duplicate Protection
   ├── Validation
   ├── Authorization
   ├── Security
   └── Persistence
8. File Structure
   backend/
   ├── src/
   │ └── mpesa-transactions/
   │ ├── mpesa-transactions.module.ts
   │ ├── mpesa-transactions.controller.ts
   │ ├── mpesa-transactions.service.ts
   │ │
   │ ├── dto/
   │ │ ├── create-mpesa-transaction.dto.ts
   │ │ └── mpesa-transaction-filter.dto.ts
   │ │
   │ └── entities/
   │ └── mpesa-transaction.entity.ts
   │
   └── prisma/
   └── schema.prisma

Preserve established project conventions.

9. Entity Design

Conceptual structure:

MpesaTransaction
│
├── id
├── businessId
├── branchId
├── mpesaAccountId
├── shiftId
├── transactionReference
├── transactionType
├── amount
├── transactionTime
├── sender
├── receiver
├── status
├── reconciliationStatus
├── createdAt
└── updatedAt

Exact fields remain authoritative in the existing Prisma schema.

10. Transaction Identity

Every transaction must have:

Internal ID

- External Mpesa Transaction Reference

Example:

Internal ID:
clxyz...

External Reference:
TBC123456789

The external reference must be unique within the appropriate account/business scope.

11. Transaction Amount

Amounts must use exact monetary representation.

Example:

Amount = KSh 2,500.00

Do not use binary floating-point arithmetic for authoritative monetary values.

12. Transaction Time

The transaction must preserve the external transaction time where provided.

The system must distinguish:

Transaction Time
vs
Record Creation Time

Example:

Mpesa Transaction:
10:32

System received:
10:34

Both facts must not be confused.

13. Transaction Type

The transaction type identifies the Mpesa operation.

Examples:

PAYBILL
POCHI
BUY_GOODS_AND_SERVICES
SEND_MONEY

The type must remain part of the historical transaction record.

14. Mpesa Account Association

Every transaction must identify the relevant Mpesa Account.

Mpesa Account
↓
Mpesa Transaction

Validate:

# Transaction Business

Account Business

and, where applicable:

# Transaction Branch

Account Branch 15. Business Association

Every transaction must belong to one Business.

The system must never accept a transaction whose related:

Mpesa Account
Branch
Shift

belong to incompatible Businesses.

16. Branch Association

Where transactions are Branch-specific:

Business
↓
Branch
↓
Mpesa Account
↓
Transaction

Branch ownership must be validated.

Business-wide accounts may follow the existing schema's explicit representation.

17. Shift Association

Where the transaction belongs to an operational shift:

Mpesa Transaction
↓
Shift

Validate:

# Transaction Business

Shift Business

and:

# Transaction Branch

Shift Branch

where Branch association applies.

The transaction timestamp must be used when determining whether the transaction belongs to a shift; manual association must not bypass established lifecycle rules.

18. Reconciliation Status

The system must distinguish between:

Transaction exists

and:

Transaction has been reconciled

Conceptually:

RECONCILED
UNRECONCILED

If the existing schema has a different status model, use that model.

19. Reconciliation Model
    Mpesa Transaction
    ↓
    Expected Business Operation
    ↓
    Matching
    ↓
    Reconciled

Unmatched transactions must remain visible.

They must not be deleted merely because they cannot immediately be matched.

20. Duplicate Protection

Mpesa transaction ingestion must be idempotent.

Given:

External Reference = ABC123

and the same transaction arrives twice:

ABC123
↓
Existing transaction found
↓
Do NOT create another transaction

The operation must be safe against:

Webhook retries.
API retries.
Network failures.
Worker/client retries.
External integration retries. 21. External Mpesa Integration Boundary

External communication follows:

Safaricom / Mpesa
↓
Integration Layer
↓
Mpesa Transaction
↓
Database

The core transaction capability must not depend on a specific external transport mechanism.

This allows external integration methods to change without redesigning the transaction domain.

22. Transaction Ingestion

The ingestion process must:

Receive transaction
↓
Validate external identity
↓
Validate account
↓
Validate Business
↓
Validate transaction data
↓
Check duplicate
↓
Persist
↓
Associate operational context

The exact ordering may be implemented differently only if the resulting behavior remains identical.

23. API Contract
    Create Transaction
    POST /mpesa-transactions

Used for authorized internal ingestion/testing according to the established backend contract.

Retrieve Transaction
GET /mpesa-transactions/:id
List Transactions
GET /mpesa-transactions

Supported filters may include:

mpesaAccountId
branchId
shiftId
transactionType
reconciliationStatus
dateFrom
dateTo

All queries must remain Business-scoped.

24. Reconciliation Endpoint

Where exposed separately:

POST /mpesa-transactions/:id/reconcile

This must only change reconciliation state according to the established reconciliation rules.

It must not rewrite the original Mpesa transaction.

25. Authorization
    OWNER

The Owner may:

View transactions.
Filter transactions.
Review transaction history.
Review unreconciled transactions.
Perform authorized reconciliation actions.
Review Mpesa activity across authorized Branches.
WORKER

Workers may:

View transactions relevant to their operational Shift.
Perform permitted reconciliation-related actions.
View transaction information needed to operate the business.

Workers must not modify historical transaction facts.

26. Business Isolation

Every transaction query must follow:

Authenticated User
↓
Business
↓
Mpesa Account
↓
Transaction

An ID alone must never provide cross-Business access.

27. Branch Isolation

Where Branch-specific:

Worker
↓
Authorized Branch
↓
Mpesa Account
↓
Transaction

Cross-Branch access must be rejected.

28. Validation

Validate:

Mpesa Account exists.
Account belongs to Business.
Branch is compatible.
Shift is compatible.
Transaction reference exists.
Transaction reference is unique.
Transaction type is valid.
Amount is valid.
Transaction time is valid.
Sender/receiver information is valid where required.
Reconciliation state is valid.
Authenticated actor is authorized. 29. Transaction State

The transaction lifecycle must distinguish:

RECEIVED
↓
STORED
↓
RECONCILED

Where the existing system has additional states, the existing model is authoritative.

Historical transaction facts must remain immutable regardless of reconciliation state.

30. Historical Immutability

After persistence:

Transaction
↓
Historical Financial Fact

The following must not be casually changed:

Amount.
External reference.
Transaction type.
Transaction time.
Account identity.
Original transaction information.

Corrections must use an explicit correction/reconciliation mechanism.

31. Security

The implementation must:

Require authentication for business-facing APIs.
Validate Business ownership.
Validate Branch authorization.
Protect sensitive sender/receiver information.
Avoid exposing integration credentials.
Avoid exposing external authentication secrets.
Validate webhook/integration authenticity where external ingestion is enabled. 32. Transaction Safety

Transaction ingestion must be atomic:

BEGIN
↓
Validate
↓
Check duplicate
↓
Create transaction
↓
Associate required context
↓
COMMIT

Failure:

ROLLBACK

No partially-created transaction may remain.

33. Reconciliation Safety

Reconciliation must be atomic:

BEGIN
↓
Validate transaction
↓
Validate reconciliation target/context
↓
Update reconciliation state
↓
Create required linkage
↓
COMMIT

Failure:

ROLLBACK

The original transaction remains intact.

34. Concurrency

Protect against:

Duplicate webhook delivery.
Simultaneous transaction ingestion.
Simultaneous reconciliation.
Reconciliation after a transaction has already been reconciled.
Cross-Business transaction association.
Transaction assignment to a closed/invalid Shift.

Database uniqueness constraints and transactions must enforce these guarantees.

35. Idempotency

The external transaction reference must act as the primary duplicate-protection key.

Example:

Webhook 1
↓
ABC123
↓
Create

Webhook 2
↓
ABC123
↓
Existing
↓
Return existing result

No second financial record may be created.

36. Performance

The capability must:

Index external transaction reference.
Index Mpesa Account.
Index Shift.
Index Branch/Business.
Index transaction time.
Index reconciliation status where reporting requires it.
Retrieve recent transactions efficiently.
Avoid N+1 queries.
Support reporting without unnecessarily blocking ingestion. 37. Error Handling

Handle:

Transaction not found
Account not found
Business mismatch
Branch mismatch
Shift mismatch
Invalid transaction type
Invalid amount
Invalid transaction reference
Duplicate transaction
Already reconciled
Invalid reconciliation
Unauthorized access
Invalid external request
Integration authentication failure
Database failure

Use the established application error format.

Never expose raw database errors.

38. Tools
    Primary
    NestJS
    TypeScript
    Prisma
    PostgreSQL
    Existing validation mechanism
    Jest
    External Mpesa integration APIs when enabled
    Alternatives
    Primary Alternative
    Prisma PostgreSQL driver/query layer
    Jest Vitest
    Existing validation Zod / class-validator
    External Mpesa API integration Approved alternative integration mechanism

The alternative must preserve transaction identity, idempotency, security, and reconciliation behavior.

39. Testing Requirements
    Transaction Creation
    Mpesa Account
    ↓
    Transaction
    ↓
    Stored correctly

Verify:

Amount.
Reference.
Type.
Time.
Account.
Business.
Duplicate Transaction

Submit the same external reference twice.

Expected:

1 transaction

not:

2 transactions
Account Isolation

Attempt to associate a transaction with an account belonging to another Business.

Expected:

REJECT
Shift Association

Associate a transaction with the correct active shift.

Verify Business and Branch compatibility.

Invalid Shift

Attempt association with an incompatible/closed Shift.

Verify rejection according to established rules.

Reconciliation
UNRECONCILED
↓
Reconcile
↓
RECONCILED

Verify the original transaction remains unchanged.

Double Reconciliation

Attempt reconciliation twice.

Verify the operation does not create duplicate reconciliation state.

Historical Integrity

Attempt to modify:

Amount
Reference
Type
Transaction Time

Verify ordinary mutation is rejected.

External Retry

Simulate repeated webhook/API delivery.

Verify exactly one transaction exists.

Business Isolation

Business A cannot retrieve Business B transactions.

Worker Isolation

Worker cannot access unauthorized transaction history.

40. Completion Criteria
    ✓ Transaction ingestion works
    ✓ Transaction identity works
    ✓ External reference uniqueness works
    ✓ Amount precision works
    ✓ Transaction types work
    ✓ Account association works
    ✓ Business isolation works
    ✓ Branch isolation works
    ✓ Shift association works
    ✓ Reconciliation state works
    ✓ Duplicate protection works
    ✓ Idempotency works
    ✓ Historical immutability works
    ✓ External integration boundary works
    ✓ Security validation works
    ✓ Transaction safety works
    ✓ Concurrency protection works
    ✓ Error handling works
    ✓ Reports can consume transactions
    ✓ Shifts can consume transactions
    ✓ Tests pass
    ✓ Application builds
41. Implementation Algorithm
    Step 1 — Establish Mpesa Transaction Reality

Build:

Actual Mpesa Event
↓
Mpesa Transaction

Verify the system can preserve the actual transaction reference, amount, type, and time.

Step 2 — Connect the Mpesa Account

Build:

Mpesa Account
↓
Mpesa Transaction

Verify the transaction belongs to the correct business account.

Step 3 — Establish Duplicate Protection

Build:

Transaction Received
↓
Check External Reference
↓
New?
├── YES → Store
└── NO → Do Not Duplicate

Verify repeated delivery cannot create multiple financial records.

Step 4 — Connect the Shift

Build:

Mpesa Transaction
↓
Operational Shift

Verify the transaction can be associated with the correct operational period without changing the underlying Mpesa fact.

Step 5 — Establish Reconciliation

Build:

Mpesa Transaction
↓
Unreconciled
↓
Matching / Reconciliation
↓
Reconciled

Verify unmatched transactions remain visible.

Step 6 — Connect Owner Visibility

Build:

Mpesa Transactions
↓
Owner
↓
Transaction History
↓
Unreconciled Transactions
↓
Reconciliation Information

Verify the Owner can understand what happened without modifying the underlying transaction.

Step 7 — Establish External Mpesa Integration

Build:

Mpesa / Safaricom
↓
Integration Layer
↓
Mpesa Transaction

Verify external retries, invalid requests, authentication failures, and duplicate delivery are handled safely.

Step 8 — Connect Reconciliation to Shift Results

Build:

Mpesa Transactions

- Cash / Other Payments
- Expenses
- Stock Reality
  ↓
  Shift Reconciliation
  ↓
  Profit / Loss

Verify Mpesa activity contributes correctly to the shift's final result.

Step 9 — Verify Complete Mpesa Reality

Run:

Mpesa Payment
↓
External Transaction
↓
Transaction Stored
↓
Correct Account
↓
Correct Shift
↓
Reconciliation
↓
Shift Result
↓
Owner Visibility

Also verify:

Same Transaction Delivered Twice
↓
ONE Financial Record
Step 10 — Transition
Transaction ingestion verified
↓
Account association verified
↓
Idempotency verified
↓
Shift association verified
↓
Reconciliation verified
↓
External integration verified
↓
Owner visibility verified
↓
Next capability

Never proceed merely because Mpesa Transactions compile.
