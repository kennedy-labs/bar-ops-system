EXPENSE_DESIGN_ARCHITECTURE.md

Static technical contract. AI agents translate this specification into software. They must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Expense capability records money spent during business operations.

It provides the authoritative expense records used by:

Shifts
Reconciliation
Profit/loss calculations
Reports
Analytics
Business Operation
↓
Expense occurs
↓
Expense recorded
↓
Shift reconciliation
↓
Profit/Loss
↓
Owner visibility 2. Requirements: Functional and Non-functional
Functional Requirements

The system must:

Record expenses.
Associate each expense with the correct Business.
Associate expenses with a Branch where applicable.
Associate expenses with the relevant Shift.
Record the expense amount.
Record the expense category/type.
Record when the expense occurred.
Record an optional description/reference.
Allow authorized users to record operational expenses.
Allow the Owner to review expenses.
Include expenses in shift reconciliation.
Include expenses in profit/loss calculations.
Support expense filtering.
Preserve historical expense records.
Non-functional Requirements

The capability must provide:

Exact monetary calculations.
Business isolation.
Branch isolation.
Shift traceability.
Historical integrity.
Reliable calculations.
Transaction safety.
Mobile-friendly operation.
Efficient reporting queries. 3. Dependencies
Depends On
Business
Branch
User
Shift
Authentication / Authorization
Prisma
PostgreSQL
Used By
Shifts
Reconciliation
Profit/Loss
Reports
Analytics 4. Design Principles
An Expense represents money actually spent by the business.
Expenses are operational records, not report calculations.
Every expense must belong to a Business.
Expenses must be associated with the relevant operational context.
Historical expenses must remain traceable.
Expense amounts must use exact monetary representation.
Expenses must not be silently deleted or rewritten.
Profit calculations consume Expense records.
Reports consume Expense records.
The Expense module must not become a second accounting system. 5. Operational Model
Worker
↓
Expense occurs
↓
Worker records expense
↓
Expense belongs to current Shift
↓
Shift closes
↓
Expense included in reconciliation
↓
Profit/Loss calculated
↓
Owner sees result

Example:

Worker buys cleaning supplies
↓
KSh 500
↓
Record expense
↓
Current Shift
↓
Closing reconciliation
↓
Profit calculation 6. Module Skeleton
Expenses
│
├── Expense Recording
├── Expense Identity
├── Amount
├── Category
├── Date/Time
├── Business Association
├── Branch Association
├── Shift Association
├── User Association
├── Validation
├── Authorization
├── Historical Integrity
└── Persistence 7. File Structure
backend/
├── src/
│ └── expenses/
│ ├── expenses.module.ts
│ ├── expenses.controller.ts
│ ├── expenses.service.ts
│ │
│ ├── dto/
│ │ ├── create-expense.dto.ts
│ │ ├── update-expense.dto.ts
│ │ └── expense-filter.dto.ts
│ │
│ └── entities/
│ └── expense.entity.ts
│
└── prisma/
└── schema.prisma

Preserve established project naming and module conventions.

8. Entity Design

Conceptual structure:

Expense
│
├── id
├── businessId
├── branchId
├── shiftId
├── recordedBy
├── amount
├── category
├── description
├── occurredAt
├── createdAt
└── updatedAt

The existing Prisma schema remains authoritative for exact fields.

9. Expense Identity

Every Expense must have a stable internal ID.

Expense
↓
Unique ID

The ID must remain stable throughout the record's lifetime.

10. Expense Amount

Amounts must use exact monetary representation.

Example:

Amount = KSh 750.00

Do not use floating-point arithmetic for authoritative money values.

11. Expense Category

Expenses must be categorized using the established project model.

Examples may include:

Supplies
Transport
Maintenance
Utilities
Other

The implementation must use the existing category representation rather than inventing a second taxonomy.

12. Expense Description

An expense may contain descriptive information that helps explain the expenditure.

Example:

Category:
Supplies

Description:
Cleaning detergent

Descriptions must not replace structured expense fields.

13. Expense Time

The system must distinguish:

Expense Occurred At
vs
Record Created At

Example:

Expense occurred:
14:10

Recorded:
14:15

Both timestamps must not be confused.

14. Shift Association

Expenses occurring during an operational Shift must be associated with that Shift.

Shift
↓
Expenses

The system must validate:

# Expense Business

Shift Business

and where applicable:

# Expense Branch

Shift Branch 15. Branch Association

Where the expense belongs to a Branch:

Business
↓
Branch
↓
Shift
↓
Expense

Cross-Business and invalid Branch associations must be rejected.

16. User Association

The system must preserve who recorded the expense.

Worker
↓
Records Expense
↓
Expense

This provides operational accountability.

The recording user must not be allowed to impersonate another user through request data.

17. Expense Lifecycle
    Expense Occurs
    ↓
    Recorded
    ↓
    Included in Shift
    ↓
    Shift Reconciliation
    ↓
    Profit/Loss
    ↓
    Reports

The lifecycle must remain traceable.

18. Expense Immutability

Historical expense facts must not be silently overwritten.

After an expense has been incorporated into a closed Shift, ordinary mutation must be prohibited.

If correction is required, it must use the established correction mechanism rather than rewriting history invisibly.

19. Expense During Active Shift

Workers may record expenses during the active operational period according to authorization rules.

OPEN SHIFT
↓
Expense
↓
Current Shift

The system must prevent recording an expense against an invalid or closed operational period.

20. Expense During Shift Closing

Before a Shift closes:

Opening
↓
Operations
↓
Expenses
↓
Closing

All expenses belonging to the Shift must be available to reconciliation.

21. API Contract
    Create Expense
    POST /expenses
    List Expenses
    GET /expenses

Supported filters may include:

branchId
shiftId
category
dateFrom
dateTo
Retrieve Expense
GET /expenses/:id
Update Expense
PATCH /expenses/:id

Updates must respect historical/closed-shift restrictions.

The exact endpoint naming must follow existing project conventions.

22. Authorization
    OWNER

The Owner may:

View expenses.
Filter expenses.
Review expense history.
Correct expenses through authorized mechanisms.
Review expenses across authorized Branches.
WORKER

Workers may:

Record operational expenses.
View expenses relevant to their operational context.
Review expenses they are authorized to access.

Workers must not alter historical records outside the established correction rules.

23. Business Isolation

Every Expense query must follow:

Authenticated User
↓
Business
↓
Expense

An Expense ID alone must never grant cross-Business access.

24. Branch Isolation

Where Branch-specific:

Worker
↓
Authorized Branch
↓
Expense

Cross-Branch access must be rejected unless explicitly authorized.

25. Validation

Validate:

Business exists.
Branch exists where required.
Branch belongs to Business.
Shift exists.
Shift belongs to Business.
Shift/Branch relationship is valid.
Amount is positive and valid.
Category is valid.
Occurrence time is valid.
User is authorized.
Shift is operationally valid.
Closed Shift restrictions are enforced. 26. Transaction Safety

Expense creation must be atomic:

BEGIN
↓
Validate User
↓
Validate Business
↓
Validate Branch
↓
Validate Shift
↓
Validate Expense
↓
Create Expense
↓
COMMIT

Failure:

ROLLBACK

No partially-created Expense may remain.

27. Concurrency

Protect against:

Recording an expense while a Shift is closing.
Recording an expense against a closed Shift.
Duplicate submissions caused by network retries.
Conflicting updates.
Cross-Business associations. 28. Duplicate Submission Protection

Mobile environments may retry requests.

The implementation must prevent accidental duplicate expenses where the same request is submitted repeatedly.

Where the existing architecture supports idempotency keys, use them.

Otherwise, use the established project mechanism.

29. Integration With Shift

Expenses must flow into the Shift:

Shift
├── Payments
├── Stock Operations
├── Transfers
├── Discrepancies
└── Expenses

At closing:

Shift
↓
Expenses
↓
Reconciliation 30. Integration With Profit/Loss

Expenses contribute to profit/loss:

## Revenue

## Expenses

# Relevant Costs

Profit/Loss

The Profit/Loss calculation must consume authoritative Expense records.

Expense records themselves must not contain calculated profit.

31. Integration With Reports

Reports may consume:

Expenses
↓
Expense Report

Reports may filter by:

Business
Branch
Shift
Category
Date Range

Historical reports must remain reproducible.

32. Security

The implementation must:

Require authentication.
Enforce Business ownership.
Enforce Branch authorization.
Enforce Shift ownership.
Prevent user impersonation.
Validate all IDs through ownership relationships.
Never trust Business/Branch IDs supplied by clients without authorization checks. 33. Error Handling

Handle:

Expense not found
Business mismatch
Branch mismatch
Shift not found
Invalid Shift
Closed Shift
Invalid amount
Invalid category
Unauthorized access
Duplicate submission
Database failure

Use the established application error format.

Never expose raw database errors.

34. Performance

The capability must:

Index Business.
Index Branch.
Index Shift.
Index occurrence time.
Index category where reporting requires it.
Support date-range queries efficiently.
Avoid unnecessary relation loading.
Avoid N+1 queries.
Return compact responses suitable for mobile devices. 35. Tools
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

Alternatives must preserve the same operational behavior and data guarantees.

36. Testing Requirements
    Record Expense
    Active Shift
    ↓
    Worker records KSh 500 expense
    ↓
    Expense exists
    ↓
    Correct Shift
    ↓
    Correct Branch
    ↓
    Correct Business
    Invalid Shift

Attempt to record an expense against a closed Shift.

Expected:

REJECT
Business Isolation

Business A must not access Business B expenses.

Branch Isolation

Worker from Branch A must not access unauthorized Branch B expenses.

User Accountability

Verify the authenticated Worker is recorded as the creator.

Amount Precision

Verify monetary values are stored and calculated exactly.

Duplicate Submission

Submit the same expense request repeatedly.

Verify accidental duplicate records are prevented according to the established mechanism.

Closing Integration
Active Shift
↓
Expense
↓
Closing
↓
Expense included in reconciliation
Profit Integration

Verify:

## Revenue

Expense
↓
Correct Profit/Loss
Historical Integrity

After Shift closure, verify historical expenses cannot be silently modified.

37. Completion Criteria
    ✓ Expense creation works
    ✓ Expense retrieval works
    ✓ Expense listing works
    ✓ Expense filtering works
    ✓ Amount precision works
    ✓ Category works
    ✓ Time tracking works
    ✓ User attribution works
    ✓ Business isolation works
    ✓ Branch isolation works
    ✓ Shift association works
    ✓ Closed Shift protection works
    ✓ Historical integrity works
    ✓ Duplicate protection works
    ✓ Authorization works
    ✓ Validation works
    ✓ Transaction safety works
    ✓ Concurrency protection works
    ✓ Reports integration works
    ✓ Profit/Loss integration works
    ✓ Tests pass
    ✓ Application builds
38. Implementation Algorithm
    Step 1 — Establish Expense Reality
    Expense occurs
    ↓
    Worker records it
    ↓
    Expense exists

Verify the recorded amount, category, time, and description represent what actually happened.

Step 2 — Connect Expense to the Current Shift
Active Shift
↓
Expense

Verify the expense belongs to the correct operational period.

Step 3 — Establish Accountability
Worker
↓
Records Expense
↓
Expense

Verify the system knows who recorded it.

Step 4 — Establish Branch and Business Ownership
Business
↓
Branch
↓
Shift
↓
Expense

Verify the entire chain remains inside the correct Business.

Step 5 — Connect Expense to Shift Closing
Active Shift
↓
Operations
↓
Expenses
↓
Closing
↓
Reconciliation

Verify all expenses are included before the Shift becomes closed.

Step 6 — Connect Expense to Profit/Loss
Revenue

- Stock / Cost Information
- Expenses
  ↓
  Profit/Loss

Verify expenses affect the final financial result correctly.

Step 7 — Connect Owner Visibility
Expenses
↓
Reports
↓
Owner

Verify the Owner can see what was spent, where, when, and during which Shift.

Step 8 — Verify Complete Expense Reality
Expense occurs
↓
Worker records expense
↓
Correct Shift
↓
Correct Branch
↓
Closing
↓
Reconciliation
↓
Profit/Loss
↓
Owner visibility
Step 9 — Transition
Expense recording verified
↓
Shift association verified
↓
Accountability verified
↓
Closing integration verified
↓
Profit/Loss verified
↓
Reports verified
↓
Next capability

Never proceed merely because Expenses compile.
