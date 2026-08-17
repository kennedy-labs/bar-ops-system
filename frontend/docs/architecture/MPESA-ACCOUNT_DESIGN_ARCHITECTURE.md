MPESA_ACCOUNT_DESIGN_ARCHITECTURE.md

Static technical contract for the Mpesa Account capability.

AI agents translate this specification into software. They must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Mpesa Account capability represents the business's registered Mpesa receiving account and provides the account context required to reconcile Mpesa transactions against business operations.

It does not represent individual payments.

Mpesa Account
↓
Mpesa Transactions
↓
Reconciliation
↓
Business / Shift Reality 2. Requirements: Functional and Non-functional
Functional Requirements

The system must:

Register Mpesa accounts belonging to the Business.
Associate accounts with the appropriate Branch where applicable.
Identify the account type.
Store the account's operational identity.
Allow authorized users to view account information.
Allow the Owner to manage account configuration.
Associate Mpesa transactions with the correct account.
Support reconciliation using the correct account.
Prevent transactions from being associated with the wrong Business/account.
Support the Mpesa operational methods used by the business.
Non-functional Requirements

The capability must provide:

Business isolation.
Branch isolation where applicable.
Accurate account identification.
Secure handling of sensitive account information.
Stable account identity.
Reliable transaction association.
Historical integrity.
Mobile-friendly performance.
No unnecessary storage of sensitive credentials. 3. Dependencies
Depends On
Business
Branch
User
Authentication / Authorization
Mpesa Transactions
Prisma
PostgreSQL
Used By
Mpesa Transactions
Shifts
Reconciliation
Reports
Analytics 4. Design Principles
An Mpesa Account represents an operational receiving/payment account.
An Mpesa Account is not an Mpesa Transaction.
Transactions reference accounts; accounts do not contain transaction history directly.
Account identity must remain stable.
Historical transactions must retain their original account reference.
Account configuration must not rewrite historical transactions.
Sensitive credentials must not be exposed through ordinary API responses.
Business ownership must always be enforced.
The account capability must not perform reconciliation itself.
Mpesa transaction records remain the authoritative transaction records. 5. Supported Mpesa Operational Context

The system must accommodate the Mpesa operations used by the business:

Paybill
Pochi la Biashara
Send Money
Buy Goods and Services

The account capability identifies the account context.

The transaction capability records what actually happened.

6. Operational Model
   Business
   │
   └── Mpesa Account
   │
   ├── Account Identity
   ├── Account Type
   └── Transactions
   │
   └── Reconciliation

Example:

Main Bar
↓
Mpesa Paybill Account
↓
Mpesa Transactions
↓
Shift Reconciliation 7. Module Skeleton
Mpesa Accounts
│
├── Account Management
│ ├── Create
│ ├── View
│ ├── List
│ └── Update
│
├── Account Identity
├── Account Type
├── Business Ownership
├── Branch Association
├── Transaction Association
├── Security
├── Validation
├── Authorization
└── Persistence 8. File Structure
backend/
├── src/
│ └── mpesa-accounts/
│ ├── mpesa-accounts.module.ts
│ ├── mpesa-accounts.controller.ts
│ ├── mpesa-accounts.service.ts
│ │
│ ├── dto/
│ │ ├── create-mpesa-account.dto.ts
│ │ ├── update-mpesa-account.dto.ts
│ │ └── mpesa-account-filter.dto.ts
│ │
│ └── entities/
│ └── mpesa-account.entity.ts
│
└── prisma/
└── schema.prisma

Preserve established project conventions.

9. Entity Design

Conceptual structure:

MpesaAccount
│
├── id
├── businessId
├── branchId
├── accountType
├── accountIdentifier
├── displayName
├── status
├── createdAt
└── updatedAt

Exact fields remain defined by the established Prisma schema.

10. Account Identity

Each account must have a stable identity.

Example:

Business: Main Bar
Type: PAYBILL
Identifier: 123456
Name: Main Bar Paybill

The internal database ID must remain stable even if display information changes.

11. Account Types

The implementation must use the account types established by the existing backend/business design.

The architecture must support the operational Mpesa contexts already identified:

PAYBILL
POCHI
BUY_GOODS_AND_SERVICES
SEND_MONEY

If the existing Prisma enum uses different canonical names, the existing schema is authoritative.

Do not create a second incompatible enum.

12. Account Status

Where supported by the existing model:

ACTIVE
INACTIVE

An inactive account:

Must remain available for historical transaction references.
Must not receive new operational transactions through normal workflows.
Must not be deleted merely to remove it from current operations. 13. Business Ownership

Every Mpesa Account belongs to one Business.

Business
↓
Mpesa Account

The system must reject:

Business A

- Branch B belonging to Business B
- Mpesa Account

14. Branch Association

Where the account is branch-specific:

Business
↓
Branch
↓
Mpesa Account

If an account is business-wide, the existing schema must represent that explicitly.

Agents must not invent branch behavior.

15. Transaction Association

Transactions follow:

Mpesa Account
↓
Mpesa Transaction

A transaction must never reference an account belonging to another Business.

The account establishes which business account the transaction belongs to.

The transaction establishes what happened.

16. Historical Integrity

Historical transactions must preserve their original account association.

Example:

August 1
↓
Paybill A
↓
Transaction

If Paybill A is later deactivated:

Transaction
↓
Still references Paybill A

Historical records must remain reproducible.

17. Account Configuration vs Credentials

The account record must not expose sensitive integration credentials.

Account identity may include:

Account number
Account type
Display name
Status
Business
Branch

Integration secrets such as:

Consumer secret
API secret
Private credentials
Webhook secrets

must not be returned through ordinary account endpoints.

Where such credentials are required, they belong in the secure integration/configuration layer rather than ordinary business-facing account responses.

18. Real Mpesa Integration Boundary

The account capability represents the business account.

Real external Mpesa connectivity belongs to the integration layer.

Business Mpesa Account
↓
Mpesa Integration
↓
Safaricom / Mpesa
↓
Mpesa Transaction
↓
Business System

The account module must not become the external API client itself.

19. API Contract
    Create Account
    POST /mpesa-accounts
    List Accounts
    GET /mpesa-accounts

Supported filtering may include:

branchId
accountType
status

All results must remain Business-scoped.

Retrieve Account
GET /mpesa-accounts/:id
Update Account
PATCH /mpesa-accounts/:id
Deactivate Account

Where supported:

PATCH /mpesa-accounts/:id/status

The exact endpoint naming must follow existing API conventions.

20. Authorization
    OWNER

The Owner may:

Create Mpesa accounts.
Update account configuration.
Activate/deactivate accounts.
View accounts.
Review account-related transaction information.
WORKER

The Worker may:

View authorized Mpesa account information needed for operations.
Use authorized accounts through the operational Mpesa workflow.
View relevant transaction state.

Workers must not modify account configuration unless explicitly permitted.

21. Business Isolation

Every account query must follow:

Authenticated User
↓
Business
↓
Mpesa Account

An account ID alone must never grant access.

22. Branch Isolation

Where an account belongs to a Branch:

Worker
↓
Authorized Branch
↓
Authorized Mpesa Account

Cross-Branch access must be rejected unless explicitly authorized.

23. Validation

Validate:

Business exists.
Branch exists where required.
Branch belongs to Business.
Account type is valid.
Account identifier is valid.
Account belongs to Business.
Account is operationally valid.
Duplicate account configuration is handled according to business rules. 24. Transaction Safety

Account creation:

BEGIN
↓
Validate Business
↓
Validate Branch
↓
Validate account data
↓
Create account
↓
COMMIT

Account status change:

BEGIN
↓
Validate account
↓
Validate authorization
↓
Change status
↓
COMMIT

Failure:

ROLLBACK 25. Concurrency

The system must prevent:

Duplicate account creation where uniqueness is required.
Simultaneous conflicting status changes.
New transactions being associated with an account that has just become inactive.
Cross-Business account association. 26. Error Handling

Handle:

Account not found
Business not found
Branch not found
Business/Branch mismatch
Unauthorized access
Invalid account type
Invalid account identifier
Duplicate account
Inactive account
Invalid status transition
Database failure

Use the established application error format.

Never expose raw database errors.

27. Performance

The capability must:

Retrieve active accounts quickly.
Filter by Branch efficiently.
Filter by account type efficiently.
Use indexed Business/Branch ownership fields.
Avoid unnecessary transaction loading.
Return compact mobile responses. 28. Security

The implementation must:

Require authentication.
Enforce Business ownership.
Enforce Branch authorization.
Protect sensitive credentials.
Avoid exposing integration secrets.
Validate all account references.
Prevent unauthorized configuration changes. 29. Tools
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

Alternatives must preserve the same security and ownership behavior.

30. Testing Requirements
    Account Creation
    Owner
    ↓
    Create Paybill
    ↓
    Account exists
    ↓
    Correct Business
    Branch Validation

Attempt:

Business A

- Branch B belonging to Business B
- Account

Verify rejection.

Worker Access

Verify a Worker can access only accounts within their authorized operational scope.

Account Isolation

Business A must not retrieve Business B's account.

Account Deactivation
ACTIVE
↓
INACTIVE

Verify new operational usage is rejected while historical transactions remain accessible.

Historical Integrity

Deactivate an account.

Verify existing transactions still reference it correctly.

Duplicate Protection

Attempt to create the same account configuration twice.

Verify established uniqueness rules are enforced.

Security

Verify sensitive integration credentials are never returned by ordinary account endpoints.

31. Completion Criteria
    ✓ Account creation works
    ✓ Account retrieval works
    ✓ Account listing works
    ✓ Account update works
    ✓ Account status works
    ✓ Business ownership works
    ✓ Branch ownership works
    ✓ Account types work
    ✓ Transaction association works
    ✓ Historical references remain valid
    ✓ Inactive accounts are protected
    ✓ Worker authorization works
    ✓ Owner authorization works
    ✓ Sensitive credentials are protected
    ✓ Validation works
    ✓ Transaction safety works
    ✓ Concurrency protection works
    ✓ Error handling works
    ✓ Tests pass
    ✓ Application builds
32. Implementation Algorithm
    Step 1 — Establish the Business Mpesa Account
    Business
    ↓
    Mpesa Account

Verify the system can identify the actual Mpesa account used by the business.

Step 2 — Establish Account Ownership
Business
↓
Branch where applicable
↓
Mpesa Account

Verify the account cannot cross Business or Branch boundaries.

Step 3 — Establish Account Types

Represent the actual Mpesa operational account types already used by the business:

Paybill
Pochi la Biashara
Buy Goods and Services
Send Money

Verify the system distinguishes the account context correctly.

Step 4 — Connect Mpesa Transactions

Build:

Mpesa Account
↓
Mpesa Transaction

Verify every transaction belongs to the correct account.

Step 5 — Establish Account Lifecycle

Build:

ACTIVE
↓
INACTIVE

Verify inactive accounts cannot be used for new operational activity while historical transactions remain intact.

Step 6 — Establish External Integration Boundary

Build:

Mpesa Account
↓
External Mpesa Integration
↓
Mpesa Transactions

Keep external credentials and communication outside ordinary account management.

Step 7 — Connect Reconciliation

Build:

Mpesa Transactions
↓
Shift
↓
Reconciliation
↓
Reports

Verify the account context remains traceable throughout reconciliation.

Step 8 — Verify Complete Mpesa Reality
Business Mpesa Account
↓
Mpesa Payment
↓
Transaction Recorded
↓
Correct Account
↓
Correct Shift
↓
Reconciliation
↓
Owner Visibility
Step 9 — Transition
Account identity verified
↓
Ownership verified
↓
Transaction association verified
↓
Lifecycle verified
↓
Security verified
↓
Reconciliation verified
↓
Next implementation step

Never proceed merely because Mpesa Accounts compile.
