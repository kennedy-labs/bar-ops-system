TRANSFER_DESIGN_ARCHITECTURE.md

Static technical contract. AI agents translate this specification into software. They must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Transfer capability records movement of stock between operational locations.

It provides a traceable record of:

What was moved?
How much was moved?
From where?
To where?
Who initiated it?
Who received it?
When did it happen?
What is its current state?

Transfers are stock movements, not sales.

2. Requirements: Functional and Non-functional
   Functional Requirements

The system must:

Create stock transfer requests.
Identify the source location.
Identify the destination location.
Identify the products/items being transferred.
Record quantities.
Record the initiating worker.
Record the receiving worker.
Track transfer state.
Prevent invalid transfers.
Prevent transfers across incompatible Businesses.
Deduct stock from the source when the transfer is dispatched.
Add stock to the destination when the transfer is received.
Preserve transfer history.
Support transfer review by the Owner.
Maintain traceability from transfer to resulting stock movements.
Non-functional Requirements

The capability must provide:

Accurate stock quantities.
Business isolation.
Branch/location isolation.
Atomic stock changes.
No silent stock creation or loss.
Full transfer traceability.
Idempotent state transitions.
Transaction safety.
Concurrency protection.
Reliable performance. 3. Dependencies
Depends On
Business
Branch
User
Product
Product Unit
Inventory Item
Stock Location
Stock Movement
Authentication / Authorization
Prisma
PostgreSQL
Used By
Inventory
Stock Movement
Shifts
Reports
Analytics
Owner management 4. Design Principles
A Transfer represents physical stock movement between locations.
A Transfer does not represent a sale.
A Transfer must have one source and one destination.
Source and destination must belong to the same Business unless an explicit future cross-business model exists.
Stock must not disappear between locations.
Every physical quantity moved must be traceable.
Dispatch and receipt are distinct operational events.
The source is responsible for dispatch confirmation.
The destination is responsible for receipt confirmation.
Historical transfer records must remain traceable.
Stock changes must occur atomically with the corresponding transfer state change.
Transfer records do not replace Stock Movement records. 5. Operational Model
Source Location
↓
Create Transfer
↓
Confirm / Dispatch
↓
Stock leaves source
↓
Transfer in transit
↓
Destination receives
↓
Stock enters destination
↓
Transfer completed

Example:

Branch A Counter
↓
Transfer 5 Tusker
↓
Dispatch
↓
Branch A stock -5
↓
Transfer in transit
↓
Branch B receives
↓
Branch B stock +5 6. Transfer Lifecycle

The transfer lifecycle must represent the real operational sequence.

CREATED
↓
DISPATCHED
↓
RECEIVED

If the existing backend defines additional states, those states remain authoritative.

A transfer must not skip required operational transitions.

7. Module Skeleton
   Transfers
   │
   ├── Transfer Creation
   ├── Transfer Items
   ├── Source Location
   ├── Destination Location
   ├── Dispatch
   ├── Receipt
   ├── Stock Movement
   ├── User Accountability
   ├── State Management
   ├── Validation
   ├── Authorization
   ├── Transaction Safety
   └── Persistence
8. File Structure
   backend/
   ├── src/
   │ └── transfers/
   │ ├── transfers.module.ts
   │ ├── transfers.controller.ts
   │ ├── transfers.service.ts
   │ │
   │ ├── dto/
   │ │ ├── create-transfer.dto.ts
   │ │ ├── add-transfer-items.dto.ts
   │ │ ├── confirm-sender.dto.ts
   │ │ └── confirm-receiver.dto.ts
   │ │
   │ └── entities/
   │ └── transfer.entity.ts
   │
   └── prisma/
   └── schema.prisma

Exact names must follow the existing implementation if already established.

9. Entity Design

Conceptual structure:

Transfer
│
├── id
├── businessId
├── fromLocationId
├── toLocationId
├── status
├── initiatedBy
├── dispatchedBy
├── receivedBy
├── createdAt
├── dispatchedAt
└── receivedAt

Transfer items:

TransferItem
│
├── id
├── transferId
├── productId
├── quantity
└── unit

Exact Prisma structure remains authoritative.

10. Source Location

Every transfer must have a source location.

Source
↓
Stock exists
↓
Transfer

The source location must belong to the same Business as the Transfer.

11. Destination Location

Every transfer must have a destination location.

Transfer
↓
Destination

The destination must belong to the same Business.

A transfer from a location to itself must be rejected unless explicitly supported by the existing business rules.

12. Transfer Items

A transfer contains one or more stock items.

Example:

Transfer #T001

Tusker × 10
Coke × 15
Fanta × 8

Each item must identify:

Product.
Quantity.
Relevant unit information.

Quantities must be positive.

13. Stock Availability

Before dispatch:

Source Stock
↓
Check Required Quantity
↓
Enough?
├── YES → Dispatch allowed
└── NO → Reject

The system must never dispatch more stock than the source actually holds.

14. Dispatch

Dispatch represents the moment stock physically leaves the source location.

Transfer
↓
DISPATCHED
↓
Source stock decreases
↓
Stock Movement recorded

Dispatch must be atomic.

Either all transfer items are dispatched or none are.

15. Transfer In Transit

After dispatch:

Source
↓
[TRANSFER IN TRANSIT]
↓
Destination

The stock must not simultaneously appear as available at both locations.

The transfer record preserves the quantity while it is in transit.

16. Receipt

Receipt represents the moment the destination confirms physical arrival.

Transfer
↓
RECEIVED
↓
Destination stock increases
↓
Stock Movement recorded

Receipt must be atomic.

17. User Accountability

The system must preserve:

Initiated By
Dispatched By
Received By

Example:

Worker A
↓
Creates transfer

Worker A
↓
Dispatches

Worker B
↓
Receives

The authenticated user must determine the recorded actor.

Client-submitted user IDs must not be trusted.

18. Separation of Dispatch and Receipt

The system must not treat:

Dispatch = Receipt

They are separate operational events.

Correct:

Dispatch
↓
Transfer in transit
↓
Receipt

This allows the Owner to determine whether stock was sent but never received.

19. Transfer State Integrity

State transitions must be controlled.

Valid sequence:

CREATED
↓
DISPATCHED
↓
RECEIVED

Invalid examples:

CREATED → RECEIVED
RECEIVED → DISPATCHED
RECEIVED → CREATED
DISPATCHED → CREATED

must be rejected.

20. Stock Movement Integration

Transfer state changes create corresponding stock movements.

Transfer
│
├── Dispatch
│ ↓
│ OUT movement
│
└── Receipt
↓
IN movement

Stock Movement remains the authoritative inventory movement ledger.

21. Atomicity

Dispatch must execute as one database transaction:

BEGIN
↓
Validate Transfer
↓
Validate Source Stock
↓
Deduct Source Stock
↓
Create OUT Stock Movement
↓
Update Transfer
↓
COMMIT

Failure:

ROLLBACK 22. Receipt Atomicity

Receipt must execute as one transaction:

BEGIN
↓
Validate Transfer
↓
Validate Destination
↓
Add Destination Stock
↓
Create IN Stock Movement
↓
Update Transfer
↓
COMMIT

Failure:

ROLLBACK 23. Business Isolation

Every transfer must satisfy:

# Transfer Business

# Source Business

# Destination Business

Product Business

Any mismatch must be rejected.

24. Branch Isolation

Where locations are Branch-specific:

Business
├── Branch A
│ └── Location
│
└── Branch B
└── Location

Transfers may occur between authorized locations belonging to the same Business.

Workers may only create/operate transfers within their authorized operational scope.

25. Authorization
    OWNER

The Owner may:

View all transfers.
Review transfer history.
Review in-transit transfers.
Review completed transfers.
Perform authorized management actions.
WORKER

Workers may:

Create permitted transfers.
Dispatch transfers they are authorized to dispatch.
Receive transfers at their authorized destination.
View relevant transfers.

Workers must not bypass transfer state transitions.

26. API Contract
    Create Transfer
    POST /transfers
    Add Items
    POST /transfers/:id/items
    View Transfer
    GET /transfers/:id
    List Transfers
    GET /transfers

Supported filters may include:

status
fromLocationId
toLocationId
branchId
dateFrom
dateTo
Dispatch / Confirm Sender
POST /transfers/:id/dispatch
Receive / Confirm Receiver
POST /transfers/:id/receive

Exact endpoint names must follow the existing backend contract.

27. Validation

Validate:

Transfer exists.
Source exists.
Destination exists.
Source and destination belong to same Business.
Products belong to same Business.
Quantities are positive.
Source has sufficient stock.
Transfer state allows requested action.
User has required authorization.
Transfer has required items.
Transfer cannot be dispatched twice.
Transfer cannot be received twice. 28. Duplicate Protection

Dispatch:

Already DISPATCHED
↓
Reject duplicate dispatch

Receipt:

Already RECEIVED
↓
Reject duplicate receipt

Repeated client requests must not duplicate stock movements.

29. Concurrency

Protect against:

Two workers dispatching the same transfer.
Two workers receiving the same transfer.
Two simultaneous deductions from the same source stock.
Source stock changing while dispatch is being processed.
Duplicate requests caused by network retries.

Database transactions and appropriate locking/constraints must guarantee consistency.

30. Historical Integrity

Completed transfers must remain traceable.

The system must preserve:

Who created it
Who dispatched it
Who received it
What was moved
Where it came from
Where it went
When each event occurred

Historical transfer records must not be silently rewritten.

31. Error Handling

Handle:

Transfer not found
Source not found
Destination not found
Product not found
Business mismatch
Branch mismatch
Unauthorized access
Invalid quantity
Insufficient stock
Invalid transfer state
Already dispatched
Already received
Missing transfer items
Database failure

Use the established application error format.

Never expose raw database errors.

32. Performance

The capability must:

Index Business.
Index source location.
Index destination location.
Index status.
Index createdAt.
Retrieve transfer history efficiently.
Avoid N+1 queries.
Avoid loading unnecessary inventory records.
Support mobile-friendly responses. 33. Security

The implementation must:

Require authentication.
Enforce Business ownership.
Enforce Branch/location authorization.
Determine actor identity from authentication.
Never trust client-supplied ownership fields.
Prevent unauthorized stock manipulation.
Prevent state-transition bypasses. 34. Tools
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

Alternatives must preserve atomic stock movement and transfer-state guarantees.

35. Testing Requirements
    Create Transfer
    Source

- Destination
- Products
- Quantities
  ↓
  Transfer CREATED
  Invalid Business

Attempt:

Business A source

- Business B destination

Expected:

REJECT
Insufficient Stock
Source = 5
Transfer = 10

Expected:

REJECT

Source remains unchanged.

Dispatch
Stock = 20
Transfer = 5
↓
Dispatch
↓
Stock = 15
↓
OUT movement exists
Receipt
Destination = 10
Transfer = 5
↓
Receive
↓
Destination = 15
↓
IN movement exists
Duplicate Dispatch

Dispatch twice.

Expected:

One deduction
One OUT movement
Duplicate Receipt

Receive twice.

Expected:

One addition
One IN movement
Invalid State Transition

Attempt:

CREATED → RECEIVED

Expected:

REJECT
Accountability

Verify the authenticated users are recorded as:

createdBy
dispatchedBy
receivedBy
Concurrent Dispatch

Two workers attempt dispatch simultaneously.

Expected:

One succeeds
One fails
Stock remains correct
Historical Integrity

After receipt, verify:

Source
Destination
Quantity
Actors
Timestamps

remain traceable.

36. Completion Criteria
    ✓ Transfer creation works
    ✓ Transfer items work
    ✓ Source validation works
    ✓ Destination validation works
    ✓ Business isolation works
    ✓ Branch/location authorization works
    ✓ Quantity validation works
    ✓ Stock availability works
    ✓ Dispatch works
    ✓ Receipt works
    ✓ Transfer states work
    ✓ Stock movements are created
    ✓ Dispatch is atomic
    ✓ Receipt is atomic
    ✓ Duplicate protection works
    ✓ Concurrency protection works
    ✓ User accountability works
    ✓ Historical integrity works
    ✓ Error handling works
    ✓ Reports can consume transfers
    ✓ Inventory remains consistent
    ✓ Tests pass
    ✓ Application builds
37. Implementation Algorithm
    Step 1 — Establish Transfer Reality
    Source Location
    ↓
    Destination Location
    ↓
    Products + Quantities
    ↓
    Transfer Created

Verify the system accurately represents what is intended to move.

Step 2 — Establish Transfer Accountability
Worker
↓
Creates Transfer
↓
Transfer knows who initiated it
Step 3 — Establish Dispatch
Transfer Created
↓
Source verifies stock
↓
Dispatch
↓
Stock leaves source
↓
Transfer becomes DISPATCHED
Step 4 — Establish the In-Transit State
Source
↓
Transfer in transit
↓
Destination

Verify the stock is not incorrectly available at both locations.

Step 5 — Establish Receipt
Destination receives physical stock
↓
Worker confirms receipt
↓
Destination stock increases
↓
Transfer becomes RECEIVED
Step 6 — Connect Stock Movements
Dispatch
↓
OUT movement

Receipt
↓
IN movement

Verify the inventory ledger reflects the physical movement.

Step 7 — Connect Owner Visibility
Transfers
↓
Owner
↓
Pending / In-transit / Completed

Verify the Owner can see where stock has moved and its current transfer state.

Step 8 — Verify Complete Transfer Reality
Stock exists at Source
↓
Transfer created
↓
Source dispatches
↓
Stock leaves Source
↓
Transfer travels
↓
Destination receives
↓
Stock enters Destination
↓
Transfer completed
Step 9 — Transition
Creation verified
↓
Dispatch verified
↓
In-transit state verified
↓
Receipt verified
↓
Stock movements verified
↓
Concurrency verified
↓
Owner visibility verified
↓
Next capability

Never proceed merely because Transfers compile.
