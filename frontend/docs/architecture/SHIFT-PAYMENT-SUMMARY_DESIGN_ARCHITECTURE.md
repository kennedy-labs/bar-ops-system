SHIFT-PAYMENT-SUMMARY_DESIGN_ARCHITECTURE.md

Static technical contract. AI agents translate this specification into software. They must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Shift Payment Summary provides the financial summary of payments recorded during a Shift.

It combines payment activity into a Shift-level view used for closing, reconciliation, and profit/loss calculation.

Shift
↓
Cash + Mpesa + Other Payments
↓
Shift Payment Summary
↓
Closing Reconciliation
↓
Profit/Loss
↓
Owner Visibility

It is a derived operational summary, not a replacement for individual payment records.

2. Requirements: Functional and Non-functional
   Functional Requirements

The system must:

Summarize payments belonging to a Shift.
Separate payment methods.
Calculate payment totals.
Associate the summary with the correct Shift.
Respect Business and Branch ownership.
Support Shift closing.
Support reconciliation.
Provide totals required for profit/loss calculations.
Allow the Owner to review payment summaries.
Preserve traceability to underlying payment records.
Non-functional Requirements

The capability must provide:

Accurate calculations.
Exact monetary values.
Consistent results.
Business isolation.
Branch isolation.
Shift isolation.
Reproducible calculations.
Reliable performance.
Readable mobile responses.
No independent source of financial truth. 3. Dependencies
Depends On
Business
Branch
Shift
Mpesa Transactions
Payment records / operational payment data
Authentication / Authorization
Prisma
PostgreSQL
Used By
Shift Closing
Reconciliation
Profit/Loss
Reports
Analytics
Owner Management 4. Design Principles
The underlying payment records are authoritative.
The summary is derived from those records.
The summary must never invent payment activity.
Payment totals must be reproducible from stored records.
Cash and Mpesa must remain distinguishable.
Business and Branch ownership must always be enforced.
A closed Shift's financial summary must remain historically reproducible.
Summary calculations must use exact monetary arithmetic.
Recalculation must produce the same result from the same underlying records. 5. Operational Model

During a Shift:

Customer Payments
│
├── Cash
├── Mpesa
└── Other supported payment methods
↓
Payment Records
↓
Shift Payment Summary

At closing:

Shift Payment Summary

- Actual Closing Reality
  ↓
  Reconciliation
  ↓
  Profit/Loss

6. Payment Methods

The system must support the payment methods already defined by the backend/business model.

At minimum, the architecture must accommodate:

CASH
MPESA

Additional payment methods must only be introduced if already defined by the existing system.

7. Module Skeleton
   Shift Payment Summary
   │
   ├── Payment Aggregation
   ├── Cash Summary
   ├── Mpesa Summary
   ├── Payment Totals
   ├── Shift Association
   ├── Reconciliation
   ├── Profit/Loss Input
   ├── Validation
   ├── Authorization
   └── Persistence / Derivation
8. File Structure
   backend/
   ├── src/
   │ └── shift-payment-summary/
   │ ├── shift-payment-summary.module.ts
   │ ├── shift-payment-summary.controller.ts
   │ ├── shift-payment-summary.service.ts
   │ │
   │ ├── dto/
   │ │ └── shift-payment-summary-filter.dto.ts
   │ │
   │ └── types/
   │ └── shift-payment-summary.ts
   │
   └── prisma/
   └── schema.prisma

If the existing backend stores the summary as a Prisma entity, preserve the established entity structure.

9. Entity Design

Conceptual structure:

ShiftPaymentSummary
│
├── id
├── businessId
├── branchId
├── shiftId
├── cashTotal
├── mpesaTotal
├── otherTotal
├── totalPayments
├── createdAt
└── updatedAt

Exact fields remain authoritative in the existing Prisma schema.

10. Summary Authority

The summary must derive its values from authoritative payment records.

Payment Records
↓
Aggregation
↓
Shift Payment Summary

It must not become an independent payment ledger.

11. Cash Summary

Cash payments must be aggregated separately.

Cash Payment 1

- Cash Payment 2
- Cash Payment 3
  ↓
  Cash Total

The total must represent only payments belonging to the relevant Shift.

12. Mpesa Summary

Mpesa payments must be aggregated separately.

Mpesa Transaction 1

- Mpesa Transaction 2
- Mpesa Transaction 3
  ↓
  Mpesa Total

Only transactions belonging to the correct Business/Branch/Shift context may contribute.

13. Total Payments

The total payment amount is derived from payment-method totals.

# Total Payments

Cash

- Mpesa
- Other Supported Payments

No payment may be counted twice.

14. Shift Association

Every summary must correspond to exactly one Shift.

Shift
↓
Payment Records
↓
Summary

The system must validate:

# Summary Business

Shift Business

and:

# Summary Branch

Shift Branch

where Branch applies.

15. Open Shift Behavior

During an active Shift, payment information may change as new payments occur.

The summary must therefore reflect the current authoritative payment state.

Payment occurs
↓
Payment record stored
↓
Summary changes 16. Closing Behavior

At Shift closing:

Final Payment Records
↓
Final Shift Payment Summary
↓
Closing Reconciliation

The final summary must represent the payment reality of the closed Shift.

17. Historical Integrity

Once the Shift is closed:

Closed Shift
↓
Historical Payment Summary

The historical result must remain reproducible.

If the summary is persisted, its values must remain consistent with the underlying immutable records.

If derived dynamically, the calculation must remain deterministic.

18. Recalculation

The system must support deterministic recalculation.

Given identical payment records:

Same Inputs
↓
Same Summary

Recalculation must not create new payment records.

19. API Contract
    Retrieve Shift Summary
    GET /shift-payment-summary/:shiftId
    List Summaries
    GET /shift-payment-summary

Supported filters may include:

branchId
shiftId
dateFrom
dateTo

Exact endpoint naming must follow the established backend conventions.

20. Authorization
    OWNER

The Owner may:

View payment summaries.
Review historical Shift summaries.
Compare payment activity.
Review reconciliation results.
WORKER

The Worker may:

View the payment summary for their authorized active/current Shift.
View payment information necessary for closing the Shift.

Workers must not arbitrarily modify calculated totals.

21. Business Isolation

Every query must follow:

Authenticated User
↓
Business
↓
Shift
↓
Payment Summary

An arbitrary shiftId must never bypass Business ownership.

22. Branch Isolation

Where Branch-specific:

Worker
↓
Authorized Branch
↓
Shift
↓
Payment Summary

Cross-Branch access must be rejected.

23. Calculation Rules

Payment totals must be calculated using exact monetary arithmetic.

Required conceptual calculations:

# Cash Total

Σ Cash Payments
Mpesa Total
=
Σ Mpesa Payments
Total Payments
=
Cash Total

- Mpesa Total
- Other Payment Totals

The underlying records determine the actual values.

24. Double-counting Prevention

The same payment must contribute exactly once.

Example:

Mpesa Transaction
↓
Mpesa Total
↓
Total Payments

It must not independently enter the total a second time.

25. Integration With Closing Stock

The payment summary participates in the Shift closing process:

Opening Stock
↓
Operations
↓
Payments
↓
Expenses
↓
Closing Stock
↓
Payment Summary
↓
Reconciliation

The summary does not calculate stock.

26. Integration With Expenses

Expenses remain separate records.

Payment Summary

- Expenses
  ↓
  Profit/Loss

The payment summary must not absorb expenses into payment totals.

27. Integration With Profit/Loss

Payment totals provide the payment/revenue side of the financial calculation.

Conceptually:

## Revenue / Payments

## Expenses

# Relevant Costs / Adjustments

Profit/Loss

The exact profit calculation belongs to the established profit/reconciliation logic.

28. Integration With Mpesa Transactions
    Mpesa Account
    ↓
    Mpesa Transactions
    ↓
    Shift Association
    ↓
    Mpesa Total
    ↓
    Shift Payment Summary

The summary must consume transaction records rather than duplicate them.

29. Validation

Validate:

Shift exists.
Shift belongs to Business.
Branch relationship is valid.
Payment records belong to the Shift.
Payment methods are valid.
Monetary values are valid.
Unauthorized Shift access is rejected.
Closed Shift behavior follows historical rules. 30. Transaction Safety

If the summary is persisted during Shift closing:

BEGIN
↓
Lock/validate Shift
↓
Read final payment records
↓
Calculate totals
↓
Persist final summary
↓
Close Shift
↓
COMMIT

Failure:

ROLLBACK

The Shift must not become closed with an incomplete financial summary.

31. Concurrency

Protect against:

Payment arriving while Shift closes.
Two closing requests.
Two summary recalculations writing conflicting results.
Duplicate payment inclusion.
Unauthorized modification of summary totals. 32. Security

The implementation must:

Require authentication.
Enforce Business ownership.
Enforce Branch authorization.
Never trust client-supplied totals.
Calculate authoritative totals server-side.
Prevent workers from directly manipulating calculated totals.
Protect sensitive Mpesa transaction information. 33. Performance

The capability must:

Index Shift.
Index Business.
Index Branch.
Efficiently aggregate payments.
Avoid N+1 queries.
Avoid loading unnecessary payment records.
Support historical Shift reports efficiently.
Remain responsive on mobile connections. 34. Error Handling

Handle:

Shift not found
Business mismatch
Branch mismatch
Unauthorized access
Invalid payment data
Invalid payment method
Summary calculation failure
Summary persistence failure
Concurrent closing
Database failure

Use the established application error format.

Never expose raw database errors.

35. Tools
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

Alternatives must preserve deterministic calculations and financial integrity.

36. Testing Requirements
    Cash Summary
    Cash:
    500

- 1000
- 250
  ↓
  Cash Total = 1750
  Mpesa Summary
  Mpesa:
  2000
- 500
- 750
  ↓
  Mpesa Total = 3250
  Combined Total
  Cash = 1750
  Mpesa = 3250
  ↓
  Total = 5000
  Shift Isolation

Payments from another Shift must not enter the summary.

Branch Isolation

Payments from another Branch must not enter the summary.

Business Isolation

Payments from another Business must never enter the summary.

Duplicate Prevention

Verify one payment contributes exactly once.

Closing
Active Shift
↓
Final payments
↓
Summary
↓
Close Shift

Verify the final summary is complete.

Concurrent Closing

Two workers attempt to close the same Shift.

Expected:

One succeeds
One fails safely
Recalculation

Run the summary calculation twice against unchanged data.

Expected:

Same result
Historical Integrity

After Shift closure, verify the final summary remains reproducible.

37. Completion Criteria
    ✓ Shift association works
    ✓ Cash totals work
    ✓ Mpesa totals work
    ✓ Other supported methods work
    ✓ Total payment calculation works
    ✓ No double counting
    ✓ Business isolation works
    ✓ Branch isolation works
    ✓ Shift isolation works
    ✓ Exact monetary calculations work
    ✓ Closing integration works
    ✓ Reconciliation integration works
    ✓ Profit/Loss integration works
    ✓ Historical integrity works
    ✓ Recalculation is deterministic
    ✓ Concurrency protection works
    ✓ Authorization works
    ✓ Validation works
    ✓ Error handling works
    ✓ Reports can consume summaries
    ✓ Tests pass
    ✓ Application builds
38. Implementation Algorithm
    Step 1 — Establish Payment Reality
    Payments occur during Shift
    ↓
    Payment records exist

Verify the system knows exactly what payments happened.

Step 2 — Establish Payment Methods
Payments
├── Cash
├── Mpesa
└── Other supported methods

Verify each payment belongs to the correct Shift.

Step 3 — Build the Shift Summary
Payment Records
↓
Aggregate by Payment Method
↓
Shift Payment Summary
Step 4 — Connect Mpesa
Mpesa Transactions
↓
Correct Shift
↓
Mpesa Total

Verify Mpesa payments are not duplicated.

Step 5 — Connect Closing
Active Shift
↓
Final Payment Summary
↓
Closing Reconciliation
↓
Close Shift

The final payment state must be established before the Shift becomes closed.

Step 6 — Connect Profit/Loss
Payment Summary

- Expenses
- Relevant Operational Data
  ↓
  Profit/Loss
  Step 7 — Connect Owner Visibility
  Shift Payment Summary
  ↓
  Owner
  ↓
  Review

The Owner must be able to see the financial payment result of a Shift.

Step 8 — Verify Complete Payment Reality
Payment occurs
↓
Payment recorded
↓
Correct Shift
↓
Payment Summary
↓
Closing
↓
Reconciliation
↓
Profit/Loss
↓
Owner visibility
Step 9 — Transition
Payment records verified
↓
Aggregation verified
↓
Mpesa integration verified
↓
Closing integration verified
↓
Reconciliation verified
↓
Profit/Loss verified
↓
Owner visibility verified
↓
Next capability

Never proceed merely because Shift Payment Summary compiles.
