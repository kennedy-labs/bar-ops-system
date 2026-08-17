# 1. Purpose

The Shift Payment Summary module records the final payment totals collected during a Shift.

It consolidates all payment methods into a single reconciliation record used to verify expected revenue against actual collections.

---

# 2. Module Responsibility

The Shift Payment Summary module is responsible for:

- Recording Cash collected
- Recording Mpesa collected
- Recording Credit sales
- Calculating total collections
- Providing payment data for reconciliation

The Shift Payment Summary module is **not responsible** for:

- Mpesa transaction ingestion
- Expense recording
- Shift operations
- Stock reconciliation
- Profit calculations

These responsibilities belong to their respective modules.

---

# 3. Module Dependencies

## Depends On

- Business Module
- Branch Module
- Shift Module
- Prisma
- Database

A Shift Payment Summary cannot exist without a Shift.

## Used By

The Shift Payment Summary module is used by:

- Discrepancy Module
- Reports Module

Shift reconciliation depends on the payment summary.

---

# 4. Design Principles

The Shift Payment Summary module follows these principles:

- Every Shift has one Payment Summary.
- Payment Summary is created during Shift closing.
- Payment values represent actual collections.
- Total collections are system calculated.
- Payment Summary becomes immutable after Shift closure.

---

# 5. Module Skeleton

```
Shift Payment Summary
│
├── Payment Information
│   ├── Cash
│   ├── Mpesa
│   ├── Credit
│   └── Total Collected
│
├── Ownership
│   ├── Business
│   ├── Branch
│   └── Shift
│
└── Operational References
    ├── Discrepancies
    └── Reports
```

---

# 6. File Structure

```
backend/
├── src/
│   └── shift-payment-summaries/
│       ├── shift-payment-summaries.module.ts
│       ├── shift-payment-summaries.controller.ts
│       ├── shift-payment-summaries.service.ts
│       │
│       ├── dto/
│       │   ├── create-shift-payment-summary.dto.ts
│       │   └── update-shift-payment-summary.dto.ts
│       │
│       └── entities/
│           └── shift-payment-summary.entity.ts
│
└── prisma/
    └── schema.prisma
```

---

# 7. Entity Design

## Shift Payment Summary

### Fields

- id
- businessId
- branchId
- shiftId
- cashAmount
- mpesaAmount
- creditAmount
- totalCollected
- createdAt
- updatedAt

### Relationships

Shift Payment Summary belongs to:

- Business
- Branch
- Shift

Referenced by:

- Discrepancy
- Report

---

# 8. API Design

## Endpoints

### Create Payment Summary

```
POST /shift-payment-summaries
```

Creates a Shift Payment Summary.

---

### Get Payment Summaries

```
GET /shift-payment-summaries
```

Returns Payment Summaries.

---

### Get Payment Summary

```
GET /shift-payment-summaries/:id
```

Returns a single Payment Summary.

---

### Update Payment Summary

```
PATCH /shift-payment-summaries/:id
```

Updates payment values while the Shift is active.

---

### Get Shift Payment Summary

```
GET /shift-payment-summaries/shift/:shiftId
```

Returns the Payment Summary for a Shift.

---

# 9. Workflow

```
Close Shift
      │
      ▼
Enter Cash
      │
      ▼
Retrieve Mpesa Total
      │
      ▼
Enter Credit Sales
      │
      ▼
System Calculates
Total Collected
      │
      ▼
Discrepancy Check
      │
      ▼
Reports
```

---

# 10. Integration Points

The Shift Payment Summary module integrates with:

- Business Module
- Branch Module
- Shift Module
- Mpesa Transaction Module
- Discrepancy Module
- Reports Module

The Shift Payment Summary module is the financial reconciliation layer of the Shift lifecycle.

# 11. Business Rules

- Every Shift Payment Summary belongs to exactly one Business.
- Every Shift Payment Summary belongs to exactly one Branch.
- Every Shift Payment Summary belongs to exactly one Shift.
- Every Shift has exactly one Payment Summary.
- Cash Amount is entered by the worker during Shift closing.
- Mpesa Amount is calculated from Mpesa Transactions assigned to the Shift.
- Credit Amount is entered during Shift closing.
- Total Collected is calculated by the system.

```
Total Collected =
Cash Amount
+ Mpesa Amount
+ Credit Amount
```

- Payment Summary becomes immutable after the Shift is closed.
- Payment values are used for reconciliation only.

---

# 12. Implementation Order

1. Create Shift Payment Summary Prisma model.
2. Add relationships to Business, Branch, and Shift.
3. Generate migration.
4. Generate Shift Payment Summaries module.
5. Create DTOs.
6. Implement service.
7. Implement controller.
8. Implement automatic Total Collected calculation.
9. Integrate Mpesa transaction aggregation.
10. Add validation rules.
11. Test payment reconciliation.
12. Verify before implementing Discrepancy module.

---

# 13. Validation Rules

## Payment Summary Creation

Validate:

- Business exists.
- Branch exists.
- Shift exists.
- Shift does not already have a Payment Summary.
- Cash Amount is greater than or equal to zero.
- Credit Amount is greater than or equal to zero.

## Payment Summary Updates

Allowed:

- Update payment values while the Shift is active.

Restricted:

- Editing after Shift closure.
- Editing calculated fields.
- Manual editing of Mpesa Amount.

## Data Integrity

- Every Payment Summary references existing Business, Branch, and Shift records.
- Total Collected is always system calculated.
- Mpesa Amount is always derived from Shift Mpesa Transactions.

---

# 14. Database Design

## Prisma Model

```prisma
model ShiftPaymentSummary {
  id String @id @default(cuid())

  businessId String
  business Business @relation(fields: [businessId], references: [id])

  branchId String
  branch Branch @relation(fields: [branchId], references: [id])

  shiftId String @unique
  shift Shift @relation(fields: [shiftId], references: [id])

  cashAmount Decimal @default(0)

  mpesaAmount Decimal @default(0)

  creditAmount Decimal @default(0)

  totalCollected Decimal

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Database Principles

- One Payment Summary exists per Shift.
- Total Collected is stored as a reconciliation snapshot.
- Mpesa Amount is sourced from Mpesa Transactions.
- Historical Payment Summaries are immutable.

---

# 15. Testing Requirements

## Unit Tests

- Create Payment Summary.
- Calculate Total Collected.
- Aggregate Mpesa Transactions.
- Reject duplicate Payment Summary for the same Shift.

## Integration Tests

- Payment Summary belongs to Business.
- Payment Summary belongs to Branch.
- Payment Summary belongs to Shift.
- Mpesa aggregation returns the correct amount.

## API Tests

Verify:

- POST /shift-payment-summaries
- GET /shift-payment-summaries
- GET /shift-payment-summaries/:id
- PATCH /shift-payment-summaries/:id
- GET /shift-payment-summaries/shift/:shiftId

---

# 16. Out of Scope

The Shift Payment Summary module does not:

- Store individual Mpesa Transactions.
- Record expenses.
- Calculate stock reconciliation.
- Calculate profit.
- Detect discrepancies.
- Generate reports.

---

# 17. Possible Future Features

- Multiple cash drawers.
- Multiple payment methods.
- Bank deposits.
- Card payments.
- Mobile money providers beyond Mpesa.
- Payment breakdown by cashier.
- Daily payment reconciliation dashboard.

---

# 18. Completion Criteria

The Shift Payment Summary module is complete when:

- Shift Payment Summary entity exists.
- Relationships are implemented.
- Total Collected is automatically calculated.
- Mpesa aggregation works correctly.
- Validation rules are implemented.
- Tests pass.
- Discrepancy module can use the Payment Summary.

---

# 19. Summary

The Shift Payment Summary module establishes the payment reconciliation layer of the Bar Operations Reconciliation & Profit System.

It provides:

- Cash collection totals.
- Mpesa collection totals.
- Credit sales totals.
- Automatically calculated total collections.
- The financial snapshot required for Shift reconciliation and discrepancy detection.
