# Bar Operations Reconciliation & Profit System

> Event-driven operational reconciliation and profit visibility platform for bars and similar businesses.

---

# 1. Purpose

The Bar Operations Reconciliation & Profit System exists to create a single operational truth for a business.

It enables owners and managers to:

- Reconcile daily operations accurately.
- Assign accountability during shifts.
- Detect operational discrepancies early.
- Measure business profitability.
- Preserve an immutable operational history.

The system replaces manual operational tracking with structured, verifiable business workflows.

# 2. Vision

The system becomes the operational truth layer of the business.

Every sale, stock movement, expense, transfer, payment, and reconciliation is recorded as part of a complete operational history.

At any moment, the business should be able to answer:

- What happened?
- Who was responsible?
- What changed?
- What discrepancies exist?
- How much profit was generated?

The system replaces assumptions with verifiable operational truth.

# 3. Scope

## In Scope

The system manages operational activities that affect accountability and profitability.

These include:

- Shift operations
- Stock accountability
- Stock movements
- Branch transfers
- Expenses
- Mpesa reconciliation
- Payment reconciliation
- Discrepancy detection
- Profit measurement
- Multi-branch operations
- Operational reporting

## Out of Scope

The system is not designed to manage:

- Point of Sale (POS)
- Financial accounting
- Payroll
- Tax management
- Supplier debt management
- Customer management
- Inventory forecasting
- AI business predictions
- General ERP functions

# 4. Business Problems

The system exists to solve the operational problems that prevent a business from knowing what actually happened during daily operations.

## Operational Accountability

- Responsibility is difficult to assign during shifts.
- Stock ownership changes without a clear chain of custody.
- Operational actions cannot be traced back to the responsible worker.

## Stock Reconciliation

- Stock quantities are manually tracked.
- Stock movements are difficult to verify.
- Closing stock often differs from physical stock without explanation.

## Payment Reconciliation

- Cash and Mpesa collections require manual verification.
- Payments are difficult to associate with the responsible shift.
- Reconciliation consumes significant time and effort.

## Transfer Verification

- Stock transfers rely on verbal confirmation.
- Sending and receiving branches may report different quantities.
- Transfer disputes are difficult to resolve.

## Expense Control

- Operational expenses reduce profitability without proper visibility.
- Expenses may be unapproved or undocumented.
- Their impact on profit is difficult to measure.

## Profit Visibility

- Revenue is known.
- Costs are known.
- Operational profit is often unknown.

The system connects operational events with financial outcomes to produce accurate profit measurement.

# 5. Core Principles

The system is built on a set of permanent principles that guide every feature and business workflow.

## Operational Truth

Every operational event must be recorded so the complete history of the business can always be reconstructed.

## Accountability

Every operational action must be attributable to a responsible user, shift, or branch.

## Event-Driven

Business state changes because operational events occur.

The system records events rather than directly changing business state.

## Immutability

Completed operational records must not be modified.

Corrections are made by creating new operational events.

## Reconciliation

The system continuously compares operational records to identify inconsistencies and discrepancies.

## Profit Visibility

Profit is calculated from recorded operational events rather than manual calculations.

## Automation

The system performs calculations, reconciliations, and discrepancy detection automatically.

Workers record operational facts; the system produces business results.

## Multi-Branch Isolation

Each branch operates independently while allowing controlled interactions such as stock transfers and centralized reporting.

# 6. Core Business Concepts

## Business

The organization that owns and operates one or more branches.

## Branch

A physical operating location where daily business activities occur.

## Shift

A period during which operational responsibility is assigned to a specific worker.

## User

A person who performs operational activities within the business.

Examples include:

- Owner
- Worker

## Product

An item the business sells or manages as stock.

## Inventory

The current quantity of products available within the business.

## Stock Location

A physical location where inventory is stored.

Examples:

- Storage
- Counter

## Stock Movement

An operational event that changes inventory.

Examples include receiving stock, transferring stock, selling stock, or recording damaged stock.

## Transfer

The movement of inventory between branches or stock locations while preserving accountability.

## Sale

The exchange of products for payment during business operations.

## Payment

Money received by the business through supported payment methods.

Examples:

- Cash
- Mpesa
- Credit

## Expense

Money spent during business operations.

## Reconciliation

The process of comparing operational records to verify that business activity is accurate and complete.

## Discrepancy

A mismatch between expected and actual operational records that requires investigation.

## Profit

The financial result produced after considering revenue, product costs, and operational expenses.

# 7. Business Workflows

The system is organized around business workflows. Each workflow represents a complete operational process from start to finish.

## Shift Management

A worker opens a shift, performs business operations, and closes the shift. The shift becomes the unit of operational accountability.

## Inventory Management

Inventory is received, moved, sold, adjusted, and counted through recorded stock movements.

## Branch Transfers

Inventory is transferred between branches or stock locations through a controlled confirmation workflow that preserves chain of custody.

## Expense Management

Operational expenses are recorded, reviewed, approved, and included in profitability calculations.

## Payment Reconciliation

Cash, Mpesa, and other payment methods are reconciled against operational activity to verify financial accuracy.

## Discrepancy Management

The system detects inconsistencies between operational records, records discrepancies, and supports their investigation and resolution.

## Profit Measurement

Revenue, product costs, and approved expenses are combined to produce accurate operational profit.

## Reporting

Operational data is summarized into reports that provide visibility into business performance, accountability, and profitability.

# 8. Core Entities

The system is built around the following core entities.

- Business
- Branch
- User
- Product
- Product Unit
- Product Cost History
- Inventory Item
- Stock Location
- Stock Movement
- Shift
- Shift Stock Item
- Transfer
- Transfer Item
- Expense
- Mpesa Account
- Mpesa Transaction
- Shift Payment Summary
- Discrepancy

Each entity has its own implementation and business rules documented in its corresponding architecture document.

# 9. Business Rules

The following rules govern how the system behaves regardless of implementation.

## Shift Ownership

- Only one active shift owns operational responsibility at a time.
- Every operational event belongs to a shift whenever applicable.

## Accountability

- Every operational action must be attributable to a user.
- Responsibility must remain traceable throughout the workflow.

## Inventory

- Inventory changes only through recorded stock movements.
- Inventory must always be reconstructable from its movement history.

## Transfers

- A transfer is not complete until both the sender and receiver have confirmed it.
- Quantity mismatches must produce a discrepancy.

## Payments

- Payments must be reconciled against operational activity.
- Unreconciled payments remain visible until resolved.

## Expenses

- Expenses must follow the defined approval workflow.
- Only approved expenses affect profit calculations.

## Discrepancies

- Discrepancies are never hidden or deleted.
- Every discrepancy must remain traceable to the workflow that produced it.

## Immutability

- Completed operational records cannot be modified.
- Corrections are recorded as new operational events.

## Profit

- Profit is calculated by the system.
- Users record operational facts; they never calculate business results manually.

# 10. System Modules

The system is implemented as independent modules. Each module owns a specific business capability.

## Core Modules

- Authentication
- Businesses
- Branches
- Users

## Inventory Modules

- Products
- Product Units
- Product Cost History
- Inventory Items
- Stock Locations
- Stock Movements

## Operations Modules

- Shifts
- Transfers
- Expenses
- Mpesa
- Shift Payment Summary
- Discrepancies

## Reporting Modules

- Reports
- Analytics

Each module has its own architecture document that defines:

- Purpose
- Module skeleton
- File structure
- Entity design
- API design
- Workflow
- Integration points
- Implementation order

# 11. Architecture Documents

The system is designed through a collection of architecture documents.

Each document defines the permanent design of one module and serves as the implementation guide for both humans and AI agents.

## Expected Architecture Documents

### Foundation

- AUTHENTICATION_ARCHITECTURE.md
- BUSINESS_ARCHITECTURE.md
- BRANCH_ARCHITECTURE.md
- USER_ARCHITECTURE.md

### Inventory

- PRODUCT_ARCHITECTURE.md
- PRODUCT_UNIT_ARCHITECTURE.md
- PRODUCT_COST_HISTORY_ARCHITECTURE.md
- INVENTORY_ARCHITECTURE.md
- STOCK_LOCATION_ARCHITECTURE.md
- STOCK_MOVEMENT_ARCHITECTURE.md

### Operations

- SHIFT_ARCHITECTURE.md
- TRANSFER_ARCHITECTURE.md
- EXPENSE_ARCHITECTURE.md
- MPESA_ARCHITECTURE.md
- SHIFT_PAYMENT_SUMMARY_ARCHITECTURE.md
- DISCREPANCY_ARCHITECTURE.md

### Reporting

- REPORTING_ARCHITECTURE.md
- ANALYTICS_ARCHITECTURE.md

Each architecture document follows the same structure:

1. Purpose
2. Module Skeleton
3. File Structure
4. Entity Design
5. API Design
6. Workflow
7. Integration Points
8. Implementation Order

Architecture documents describe the permanent design of the system and remain independent of the current implementation state.

# 12. Evolution

The system evolves by extending existing workflows and introducing new business capabilities while preserving the core principles defined in this blueprint.

Every new feature should:

- Solve a real business problem.
- Integrate with existing workflows.
- Preserve operational truth.
- Maintain accountability.
- Support reconciliation.
- Contribute to profit visibility.

New capabilities should be introduced through dedicated architecture documents before implementation begins.

The blueprint remains stable over time, while architecture documents evolve to support new business requirements.

# 13. Success Criteria

The system is considered successful when it can consistently answer the following questions using recorded operational data:

- What happened?
- Who was responsible?
- What inventory changed?
- What payments were received?
- What expenses were incurred?
- What discrepancies exist?
- What profit was generated?

The system should provide:

- A complete operational history.
- Clear accountability for every business event.
- Accurate reconciliation of operations.
- Reliable profit measurement.
- Visibility into business performance.
- A trusted operational record for every branch.

# 14. Guiding Principle

The system exists to preserve operational truth.

Every design decision, workflow, module, and feature should answer one question:

> **Does this make the operational truth of the business clearer, more accurate, and more accountable?**

If the answer is no, it does not belong in the system.

The system values:

- Truth over convenience.
- Accountability over assumption.
- Recorded events over manual calculations.
- Business understanding over technical complexity.
- Simplicity over unnecessary features.

Operational truth is the foundation upon which reconciliation, discrepancy detection, and profit visibility are built.

# 15. Document Hierarchy

The project maintains a single source of truth at each level.

```
PROJECT_BLUEPRINT.md
        │
        ▼
Architecture Documents
        │
        ▼
Implementation (Source Code)
        │
        ▼
SYSTEM_STATUS.md
        │
        ▼
Reviews
```

## Responsibilities

**PROJECT_BLUEPRINT.md**

Defines the business vision, principles, concepts, workflows, modules, and rules of the system.

---

**Architecture Documents**

Define the permanent design of each module before implementation.

---

**Implementation**

Contains the working source code that follows the architecture.

---

**SYSTEM_STATUS.md**

Records the current implementation state, completed work, known gaps, and next implementation priorities.

---

**Reviews**

Evaluate the implementation against the architecture and identify improvements.

## Rule

Each document has a single responsibility.

Changes should be made only in the document responsible for that information.