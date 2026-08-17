# Architecture

This document serves as an index for the bar operations backend's modular architecture. Each module has its own dedicated architecture document.

---

## Architecture Principles

All module architectures follow these foundational principles from PROJECT_BLUEPRINT.md:

1. **Event-Driven**: All state changes result from immutable operational events
2. **Accountability**: Shift-based ownership and user attribution for all actions
3. **Immutability**: Operational records cannot be modified after approval/completion
4. **Reconciliation**: Automatic discrepancy detection and flagging
5. **Profit Visibility**: Accurate gross and net profit calculations
6. **Multi-Branch Support**: Isolated data per branch with controlled inter-branch transfers

# Bar Operations Reconciliation & Profit System

> System Architecture Document  
> Defines the implementation structure, module dependency order, and completion path.

---

# 1. Purpose

This document defines the overall architecture and implementation strategy of the Bar Operations Reconciliation & Profit System.

It connects:

- System vision
- Module implementation order
- Module dependencies
- Development milestones
- Completion criteria

This document exists to guide building the system from foundation to production.

It does **not** replace:

- `PROJECT_BLUEPRINT.md` → Product definition and business rules
- Individual module architecture documents → Detailed module implementation

This document answers:

> "In what order should the system be built, and how do all modules connect?"

---

# 2. System Architecture Philosophy

The system is built around one principle:

> Operational truth must always be reconstructable.

The system does not directly modify business reality.

Instead:
Business Event
↓
Recorded Event
↓
System State Update
↓
Reconciliation
↓
Operational Truth

Examples:

Stock does not simply change.
Stock Movement ↓ Inventory State

Money does not simply appear.
Mpesa Transaction ↓ Shift Ownership ↓ Payment Reconciliation

Profit is not manually entered.
Sales Data + Historical Costs
Expenses
↓
Profit

---

# 3. System Layers

The system is divided into architectural layers.
Layer 1 Foundation
Business Branch User
Layer 2 Product Foundation
Product Product Unit Product Cost History
Layer 3 Inventory Foundation
Stock Location Inventory Item Stock Movement
Layer 4 Operational Control
Shift Shift Stock Item Transfer Expense
Layer 5 Financial Reconciliation
Mpesa Shift Payment Summary Discrepancy
Layer 6 Visibility
Reports Analytics Dashboards

---

# 4. Core Implementation Principle

Build from ownership → resources → operations → reconciliation.

The system cannot reconcile operations before ownership exists.

Dependency direction:
Who owns the system?
↓
What exists?
↓
Where does it exist?
↓
What happened?
↓
Can we verify reality?

---

# 5. Complete Implementation Order

## Phase 1 — Ownership Foundation

Purpose:

Create the system ownership boundary.

Modules:

1. Business
2. Branch
3. User

Success:

The system knows:

- Who owns the business.
- Where operations happen.
- Who performs operations.

---

## Phase 2 — Product Foundation

Purpose:

Define what the business sells.

Modules:

4. Product
5. Product Unit
6. Product Cost History

Success:

The system knows:

- What products exist.
- How products are measured.
- What products cost historically.

---

## Phase 3 — Inventory Foundation

Purpose:

Create physical stock control.

Modules:

7. Stock Location
8. Inventory Item
9. Stock Movement

Success:

The system knows:

- Where stock exists.
- Current stock state.
- Every stock change history.

---

## Phase 4 — Operational Ownership

Purpose:

Connect workers to operational responsibility.

Modules:

10. Shift
11. Shift Stock Item

Success:

The system knows:

- Who controlled operations.
- Opening stock.
- Closing stock.
- Quantity sold.

---

## Phase 5 — Financial Control

Purpose:

Measure money movement.

Modules:

12. Mpesa Account
13. Mpesa Transaction
14. Expense
15. Shift Payment Summary

Success:

The system knows:

- Money received.
- Expenses.
- Expected collections.
- Actual collections.

---

## Phase 6 — Verification System

Purpose:

Detect operational differences.

Module:

16. Discrepancy

Success:

The system detects:

- Missing stock.
- Missing money.
- Incorrect transfers.
- Reconciliation failures.

---

## Phase 7 — Visibility

Purpose:

Expose business intelligence.

Module:

17. Reports

Success:

Owners can understand:

- Revenue
- Cost
- Profit
- Losses
- Operational problems

---

# 6. Module Dependency Graph

Business | ├── Branch | | | ├── Stock Location | | | ├── Shift | | | └── Inventory | ├── User | ├── Product | | | ├── Product Unit | | | └── Product Cost History | └── Operations
Shift
|
├── Stock Movement
|
├── Expenses
|
├── Mpesa Transactions
|
└── Payment Summary

                |
                ↓

          Discrepancy

                |
                ↓

            Reports

---

# 7. Data Flow Architecture

## Inventory Flow

Product
↓
Product Unit
↓
Inventory Item
↓
Stock Movement
↓
Shift Stock Item
↓
Reconciliation

---

## Money Flow

Mpesa Transaction

Cash Entry

Credit Entry

Expenses
↓
Shift Payment Summary
↓
Discrepancy Detection
↓
Profit Calculation

---

# 8. Single Source of Truth Rules

Each responsibility has one owner.

| Information           | Source                               |
| --------------------- | ------------------------------------ |
| Business ownership    | Business                             |
| Physical locations    | Branch / Stock Location              |
| Product identity      | Product                              |
| Measurement           | Product Unit                         |
| Historical cost       | Product Cost History                 |
| Current stock         | Inventory Item                       |
| Stock history         | Stock Movement                       |
| Worker responsibility | Shift                                |
| Shift sales           | Shift Stock Item                     |
| Payments              | Payment Summary + Mpesa Transactions |
| Problems              | Discrepancy                          |
| Insights              | Reports                              |

---

# 9. What Success Looks Like

The system is successful when an owner can answer:

## Stock

- What stock existed?
- Who controlled it?
- What changed?
- Where did it go?

## Money

- How much money came in?
- From which source?
- Who was responsible?

## Profit

- What was sold?
- What did it cost?
- What profit was generated?

## Accountability

- Who handled operations?
- What happened during their shift?
- Are there unexplained differences?

---

# 10. Production Readiness Criteria

The system is production-ready when:

## Data Integrity

- Records are traceable.
- Historical data cannot be silently changed.
- Events can reconstruct system state.

## Operational Accuracy

- Stock reconciliation works.
- Mpesa reconciliation works.
- Shift ownership works.

## Financial Accuracy

- Revenue calculation works.
- Cost calculation works.
- Profit calculation works.

## Accountability

- Every operational action has ownership.

---

# 11. Development Workflow

Every module follows:
Architecture Document
↓
Prisma Model
↓
Migration
↓
Module Skeleton
↓
DTO Validation
↓
Service Logic
↓
Controller/API
↓
Tests
↓
Integration
↓
Next Module

---

# 12. Backend Implementation Strategy

Priority:

1. Database correctness
2. Business rules
3. Service logic
4. API exposure
5. UI

The system advantage is operational correctness, not interface complexity.

---

# 13. Database Architecture Principles

The database must support:

- Auditability
- Historical reconstruction
- Branch isolation
- Ownership tracking
- Immutable events
- Financial accuracy

Avoid:

- Hidden state changes
- Direct quantity manipulation
- Overwriting history

---

# 14. Event-Driven Principle

Operational changes create events.

Example:

Wrong:
inventory.quantity = 50

Correct:
Create Stock Movement
↓
Update Inventory

The event explains why reality changed.

---

# 15. Module Completion Standard

A module is complete when:

- Entity exists.
- Relationships work.
- Business rules are implemented.
- Validation exists.
- API works.
- Tests pass.
- It integrates with dependent modules.

---

# 16. Expansion Strategy

Future modules must attach to existing truth.

Possible additions:

- Suppliers
- Purchasing
- Payroll
- Customer accounts
- Advanced analytics
- AI forecasting

They extend the system without replacing existing foundations.

---

# 17. Architecture Ownership

Responsibility separation:
PROJECT_BLUEPRINT.md
= What the product should become
ARCHITECTURE.md
= How the system is built
MODULE_ARCHITECTURE.md
= How each component works

---

# 18. Final System Model

Business Ownership
↓
Resources
(Product + Inventory)
↓
Operations
(Shift + Transactions)
↓
Verification
(Reconciliation + Discrepancy)
↓
Understanding
(Reports + Analytics)

---

# 19. Summary

The Bar Operations Reconciliation & Profit System is built as an operational truth platform.

Implementation follows:
Ownership
↓
Resources
↓
Inventory
↓
Operations
↓
Financial Control
↓
Verification
↓
Visibility

The final system should provide:

- Accurate operational ownership
- Reliable stock accountability
- Mpesa reconciliation
- Profit visibility
- Automated discrepancy detection

The architecture exists to ensure every implementation step moves toward that final system.
