# Expense Module Architecture

> **Defines the permanent architecture of the Expense module.**

**Scope:** Expense entity, workflow, APIs, business rules, integrations, database design, and implementation structure.

**Status:** Architecture (timeless)

**Source of Truth:** PROJECT_BLUEPRINT.md

---

# 1. Purpose

The Expense module records and tracks operational expenses incurred during business operations.

It provides financial accountability by ensuring every expense is:

- Assigned to the correct Business, Branch, and Shift.
- Attributed to the User who recorded it.
- Included in reconciliation and profit calculations.
- Preserved with a complete audit history.

The Expense module exists to answer:

- What expense occurred?
- Who recorded it?
- When did it happen?
- Which Shift and Branch were affected?
- How did it affect profitability?

---

# 2. Module Responsibility

The Expense module is responsible for:

- Creating expenses.
- Updating pending expenses.
- Tracking expense lifecycle.
- Maintaining expense audit history.
- Providing expense summaries.
- Integrating expenses into financial calculations.

The Expense module is **not responsible** for:

- Managing shifts.
- Managing users.
- Managing branches.
- Processing payments.
- Managing inventory.
- Calculating stock sales.
- Generating final reports.

Those responsibilities belong to their respective modules.

---

# 3. Module Dependencies

## Depends On

The Expense module depends on:

- Business Module
- Branch Module
- User Module
- Shift Module
- Prisma
- Database

An Expense cannot exist without:

- A Business
- A Branch
- A Shift
- A User who recorded it

---

## Used By

The Expense module is used by:

- Shift Payment Summary Module
- Profit Calculation Module
- Discrepancy Module
- Reports Module

Approved expenses affect financial reconciliation.

---

# 4. Design Principles

The Expense module follows these principles:

- Every Expense belongs to one Business.
- Every Expense belongs to one Branch.
- Every Expense belongs to one Shift.
- Every Expense has a responsible User.
- Expenses are immediately valid upon recording.
- Owner approval provides acknowledgment, not authorization.
- Expenses are immutable after recording.
- Every financial impact must be traceable.
- Expense records must support audit reconstruction.

---

# 5. Module Skeleton

Expense
│
├── Entity
│
├── DTOs
│ ├── CreateExpenseDto
│ ├── UpdateExpenseDto
│ ├── ApproveExpenseDto
│ ├── RejectExpenseDto
│ └── ExpenseSummaryDto
│
├── Controller
│ ├── Create Expense
│ ├── Get Expense
│ ├── List Expenses
│ ├── Update Pending Expense
│ ├── Acknowledge Expense
│ ├── Shift Summary
│ ├── Branch Summary
│ └── Reconciliation Summary
│
├── Service
│ ├── Validation
│ ├── Financial Integration
│ ├── Reconciliation
│ └── Reporting Support
│
└── Database
├── Expense
├── ExpenseType
└── ExpenseStatus


---

# 6. File Structure


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
│ │ ├── approve-expense.dto.ts
│ │ ├── reject-expense.dto.ts
│ │ └── expense-summary.dto.ts
│ │
│ └── entities/
│ └── expense.entity.ts
│
└── prisma/
└── schema.prisma


---

# 7. Entity Design

## Expense


Expense
│
├── id
│
├── businessId
├── branchId
├── shiftId
│
├── recordedByUserId
├── acknowledgedByUserId?
│
├── type
├── description
├── amount
├── category?
│
├── receiptUrl?
├── notes?
│
├── status
│
├── recordedAt
├── acknowledgedAt?
│
├── createdAt
└── updatedAt


---

## Enums

### ExpenseType


TRANSPORT
EMERGENCY_PAYMENT
SMALL_PURCHASE
OTHER


---

### ExpenseStatus


RECORDED
ACKNOWLEDGED


---

## Relationships


Expense
│
├── belongs to Business
├── belongs to Branch
├── belongs to Shift
├── recorded by User
├── approved by User
│
├── affects Shift Payment Summary
├── affects Profit Calculation
└── may create Discrepancy


---

# 8. API Design

## Core Operations


POST /expenses
GET /expenses
GET /expenses/:id
PATCH /expenses/:id
DELETE /expenses/:id


---

## Approval Workflow

Owner acknowledgment provides read confirmation, not authorization.


POST /expenses/:id/approve

POST /expenses/:id/reject


---

## Query Operations


GET /expenses/pending-approval

GET /expenses/shift/:shiftId/summary

GET /expenses/branch/:branchId/summary

GET /expenses/reconciliation/:shiftId


---

## Endpoint Responsibilities


Create Expense

Creates:
RECORDED Expense

Update Expense

Updates:
Editable fields while expense remains open

Acknowledge Expense

Records:
Owner read acknowledgment

Reconciliation Summary

Shift Summary

Returns:
Expenses belonging to a Shift

Branch Summary

Returns:
Branch expense totals

Reconciliation

Returns:
Expenses affecting Shift reconciliation


---

# 9. Workflow


Record Expense
│
▼
Create Expense
│
▼
Status = RECORDED
│
▼
Financial Impact Applied
│
├── Shift Payment Summary
├── Profit Calculation
├── Reports
└── Reconciliation


---

## State Machine


RECORDED

│
└────────► ACKNOWLEDGED


---

## Effects

### APPROVED


├── Becomes immutable
├── Reduces available cash
├── Reduces profit
├── Appears in reconciliation
└── Appears in reports


---

### REJECTED


├── Becomes immutable
├── Does not affect profit
├── Does not affect reconciliation
└── Remains in audit history


---

# 10. Integration Points


Expense
│
├── Shift Module
│ ├── Validate Shift
│ ├── Ensure Shift ownership
│ └── Attach expense to Shift
│
├── Branch Module
│ ├── Validate Branch
│ └── Branch expense reporting
│
├── User Module
│ ├── Validate recorder
│ └── Permission checks
│
├── Shift Payment Summary Module
│ ├── Include expenses
│ └── Adjust reconciliation totals
│
├── Profit Module
│ ├── Gross Profit
│ ├── Recorded Expenses
│ └── Net Profit
│
├── Discrepancy Module
│ ├── Cash inconsistencies
│ └── Expense anomalies
│
└── Reports Module
├── Shift reports
├── Branch reports
├── Expense summaries
└── Profit reports


---

# 11. Business Rules

- Every Expense belongs to exactly one Business.
- Every Expense belongs to exactly one Branch.
- Every Expense belongs to exactly one Shift.
- Every Expense belongs to exactly one recording User.
- Expenses are immediately valid upon recording.
- Recorded Expenses may be edited while open.
- Acknowledged Expenses cannot be edited.
- All recorded Expenses affect financial calculations.
- Expense amounts cannot be negative.
- Every Expense must have a valid category/type.
- Every Expense must have a timestamp.

---

# 12. Database Design

## Prisma Model

```prisma
model Expense {
  id String @id @default(cuid())

  businessId String
  business Business @relation(fields: [businessId], references: [id])

  branchId String
  branch Branch @relation(fields: [branchId], references: [id])

  shiftId String
  shift Shift @relation(fields: [shiftId], references: [id])

  recordedByUserId String
  recordedBy User @relation(fields: [recordedByUserId], references: [id])

  acknowledgedByUserId String?
  acknowledgedBy User? @relation(fields: [acknowledgedByUserId], references: [id])

  type ExpenseType

  description String

  amount Decimal

  status ExpenseStatus

  recordedAt DateTime

  acknowledgedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
13. Implementation Order
Phase 1 — Foundation

├── Expense model
├── ExpenseType enum
├── ExpenseStatus enum
└── Prisma migration


Phase 2 — CRUD

├── CreateExpenseDto
├── UpdateExpenseDto
├── Controller
└── Service


Phase 3 — Owner Acknowledgment

├── AcknowledgeExpenseDto
├── acknowledgeExpense()


Phase 4 — Business Rules

├── Validate Shift
├── Validate Branch
├── Validate Users
├── Validate Amounts
└── Protect approved expenses


Phase 5 — Financial Integration

├── Shift Payment Summary
├── Profit Calculation
└── Reconciliation


Phase 6 — Reporting

├── Shift summaries
├── Branch summaries
├── Approval reports
└── Expense reports


Phase 7 — Discrepancy Detection

├── Approval violations
├── Cash inconsistencies
└── Expense anomalies


Phase 8 — Testing

├── Unit tests
├── Workflow tests
├── Validation tests
└── Integration tests
14. Testing Requirements
Unit Tests

Verify:

Expense creation.
Expense update.
Approval workflow.
Rejection workflow.
Validation rules.
Integration Tests

Verify:

Expense belongs to Shift.
Expense belongs to Branch.
Expense belongs to User.
Approved expenses affect financial modules.
API Tests

Verify:

POST /expenses

GET /expenses

GET /expenses/:id

PATCH /expenses/:id

POST /expenses/:id/approve

POST /expenses/:id/reject
15. Security Rules
Only authorized roles can create expenses.
Workers cannot modify another user's expenses.
Recorded expenses cannot be modified after acknowledgment.
All expense actions must be traceable.
Sensitive expense information must respect access permissions.
16. Out of Scope

The Expense module does not:

Manage payments.
Manage inventory.
Manage stock movements.
Calculate sales.
Manage suppliers.
Handle payroll.
Generate accounting statements.
17. Possible Future Features
Receipt image uploads.
Expense approval thresholds.
Multi-level approvals.
Supplier expense tracking.
Expense categories management.
Recurring expenses.
Budget limits.
Expense analytics.
18. Completion Criteria

The Expense module is complete when:

Expense entity exists.
CRUD operations work.
Owner acknowledgment works.
Validation rules are enforced.
Recorded expenses affect reconciliation.
Audit history is preserved.
Tests pass.
19. Summary

The Expense module provides controlled operational expense tracking for the Bar Operations Reconciliation & Profit System.

It ensures:

Expense accountability.
Financial accuracy.
Auditability.
Reconciliation support.
Profit calculation accuracy.

The module converts informal expense recording into a traceable operational process.
