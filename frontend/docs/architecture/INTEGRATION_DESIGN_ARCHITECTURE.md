INTEGRATION_DESIGN_ARCHITECTURE.md

Static technical contract. AI agents translate this specification into software. They must not redesign, reinterpret, or invent business behavior.

Integration connects already-defined capabilities. It does not create new business rules.

1. Purpose

The Integration capability ensures the system's modules work together as one operational system.

Opening
↓
Verification
↓
Active Shift
↓
Operations
↓
Closing
↓
Shift Result
↓
Owner Visibility

The purpose is to ensure that transitions between modules are implemented and verified.

Transitions must never be skipped.

2. Requirements
   Functional Requirements

The integrated system must:

Authenticate users.
Establish Owner/Worker identity.
Establish Business and Branch scope.
Open shifts.
Establish opening stock.
Verify opening stock.
Record discrepancies.
Transition into active shifts.
Record payments.
Record expenses.
Record stock operations.
Record transfers.
Record Mpesa activity.
Record closing stock.
Close shifts.
Calculate resulting financial state.
Make operational information available to the Owner.
Produce reports.
Produce analytics.
Preserve authoritative records across module boundaries.
Non-functional Requirements

The integrated system must provide:

Consistent state transitions.
Transactional integrity.
Business isolation.
Branch isolation.
Accurate calculations.
No duplicated sources of truth.
Traceable operations.
Reliable error recovery.
Mobile usability.
Safe offline behavior where supported.
Deterministic results. 3. Integration Principles
Each module remains responsible for its own domain.
Integration coordinates modules; it does not replace them.
Backend is authoritative.
Frontend is a client of the backend.
No module may silently modify another module's meaning.
Cross-module operations must respect authorization.
Cross-module operations must respect Business ownership.
Branch boundaries must remain intact.
Financial calculations must use authoritative records.
Operational transitions must be explicit.
Failed transitions must not leave misleading state. 4. System Architecture
FRONTEND
│
▼
AUTHENTICATION
│
▼
AUTHORIZATION
│
▼
BUSINESS
│
┌───────┴───────┐
▼ ▼
BRANCHES USERS
│
▼
SHIFTS
│
┌───────────┼────────────┐
▼ ▼ ▼
INVENTORY PAYMENTS EXPENSES
│ │ │
▼ ▼ ▼
STOCK MPESA FINANCIAL
│
▼
TRANSFERS
│
▼
DISCREPANCIES
│
└────────────┐
▼
REPORTS
│
▼
ANALYTICS
│
▼
OWNER 5. Integration Boundaries

The major integration boundaries are:

Authentication → Authorization

Business → Branch

Branch → Shift

Shift → Opening Stock

Opening Stock → Verification

Verification → Active Shift

Active Shift → Operations

Operations → Closing

Closing → Shift Result

Operational Records → Reports

Reports → Analytics

Backend → Frontend 6. Authentication → Authorization
Login
↓
Authenticated User
↓
Role
↓
Business Scope
↓
Branch Scope
↓
Authorized System

No protected operation may bypass this transition.

7. Business → Branch

Branches belong to a Business.

Business
│
├── Branch A
├── Branch B
└── Branch C

All Branch operations must remain associated with the correct Business.

8. Branch → Shift

A Shift belongs to the appropriate operational Branch.

Branch
↓
Worker
↓
Shift

A Worker must not operate a Shift outside their authorized scope.

9. Shift → Opening Stock

Opening begins the operational state.

Shift Opening
↓
System Opening Stock
↓
Worker Physical Count

The system must establish what stock the Worker is expected to begin with.

10. Opening Stock → Verification
    Expected Stock
    ↓
    Physical Count
    ↓
    Compare

Two outcomes are valid:

MATCH
↓
Verified

or:

MISMATCH
↓
Discrepancy Reported
↓
Continue

The Worker begins the Shift from the current physical reality.

11. Verification → Active Shift

This is a critical transition.

Opening Verification
↓
ACTIVE SHIFT

The system must not treat verification as optional background information.

It establishes the transition into operational activity.

12. Active Shift → Operations

During an active Shift:

ACTIVE SHIFT
│
├── Payments
├── Mpesa
├── Expenses
├── Stock Changes
├── Transfers
└── Discrepancies

Each operation must be associated with the correct operational context.

13. Payments → Shift

Payment records must belong to the appropriate operational period.

Payment
↓
Shift
↓
Branch
↓
Business

This relationship enables later reconciliation and reporting.

14. Mpesa → Payments

Mpesa activity must integrate with the established payment model.

Supported Mpesa realities include:

Mpesa Paybill
Pochi la Biashara
Send Money
Buy Goods and Services

The exact transaction handling follows the existing Mpesa architecture.

Mpesa integration must not create a separate competing payment truth.

15. Expenses → Shift

Where an expense occurs during a Shift:

Expense
↓
Shift
↓
Branch
↓
Business

The expense becomes part of the Shift's operational and financial record.

16. Stock Operations → Shift

Stock operations occurring during an active Shift must remain traceable to that operational context.

Shift
↓
Stock Operation
↓
Stock Movement
↓
Inventory State

The authoritative inventory model remains unchanged.

17. Transfers → Inventory

A transfer represents movement between stock locations/Branches where applicable.

Source
↓
Transfer
↓
Destination

The transfer lifecycle must remain explicit.

Create
↓
Dispatch
↓
In Transit
↓
Receive

Inventory must reflect only valid completed transitions according to the existing Transfer rules.

18. Operations → Closing

When operational work is complete:

ACTIVE SHIFT
↓
CLOSING

No operation should be silently inserted after the Shift has entered its final closing state.

19. Closing → Closing Stock
    System Closing State
    ↓
    Physical Count
    ↓
    Actual Closing State
    ↓
    Compare

If different:

Mismatch
↓
Discrepancy 20. Closing → Shift Result

After valid closing:

Closing Stock

- Payments
- Expenses
- Stock Records
- Other Authoritative Records
  ↓
  Shift Result

The backend calculates the authoritative result.

The frontend displays it.

21. Shift → Reports

Completed Shift information feeds reporting.

Shift
├── Payments
├── Expenses
├── Stock
├── Transfers
└── Discrepancies
↓
Reports

Reports must not recreate operational records.

22. Reports → Analytics
    Operational Truth
    ↓
    Reports
    ↓
    Analytics

Analytics identifies trends and patterns.

Analytics must not become a second source of truth.

23. Owner Visibility
    Operational Reality
    ↓
    Stored Records
    ↓
    Reports / Analytics
    ↓
    Owner

The Owner must be able to understand what happened without needing to meet the Worker physically.

24. Frontend → Backend
    Frontend
    ↓
    HTTP API
    ↓
    Backend
    ↓
    Database

The frontend must never directly access PostgreSQL.

25. Backend → Database

The backend is responsible for:

Authorization.
Validation.
Business rules.
Transactions.
Persistence.
Calculations.
State transitions.

Prisma remains the database access layer.

26. Transaction Boundaries

Any operation requiring multiple related writes must use a database transaction where atomicity is required.

Example:

Transfer completion
│
├── Update transfer state
├── Update source inventory
└── Update destination inventory

These operations must not partially succeed.

Expected:

ALL SUCCESS

or:

ALL ROLLBACK

where the business operation requires atomicity.

27. Integration Error Rule

If a cross-module operation fails:

Operation
↓
Failure
↓
No misleading partial state
↓
Clear error

The system must not tell the Worker that an operation succeeded when only part of the operation was persisted.

28. Idempotency

Critical operations must protect against duplicate submissions.

Examples:

Payment recording.
Expense recording.
Transfer actions.
Shift closing.
Mpesa transaction processing.

Repeated delivery of the same operation must not unintentionally create duplicate business records.

29. Offline Integration

Where offline functionality is supported:

Worker
↓
Offline
↓
Local pending operation
↓
Reconnect
↓
Server synchronization
↓
Server confirmation

The local device must distinguish:

Pending

from:

Server Confirmed

Offline mode must not silently create conflicting authoritative states.

30. Integration API Structure

The existing modules remain responsible for their APIs.

Example:

/auth
/businesses
/branches
/users
/shifts
/products
/inventory
/stock-movements
/transfers
/expenses
/mpesa-accounts
/mpesa-transactions
/discrepancies
/reports
/analytics

Integration must not create duplicate endpoints for existing operations.

31. Data Ownership
    User
    → Users

Business
→ Business

Branch
→ Branches

Shift
→ Shifts

Product
→ Products

Inventory
→ Inventory / Stock

Transfer
→ Transfers

Expense
→ Expenses

Mpesa Transaction
→ Mpesa Transactions

Discrepancy
→ Discrepancies

Report
→ Reports

Analytics
→ Analytics

Each domain remains authoritative for its own records.

32. Data Flow

The complete data flow is:

Worker
↓
Frontend
↓
API
↓
Authentication
↓
Authorization
↓
Domain Module
↓
Database
↓
Authoritative Record
↓
Reports
↓
Analytics
↓
Owner 33. Functional Integration Tests
Test 1 — Worker Entry
Worker Login
↓
Worker Interface
↓
Correct Branch

Expected: Worker sees only authorized operational reality.

Test 2 — Opening
Start Shift
↓
Opening Stock
↓
Verify

Expected: Worker cannot silently bypass the opening transition.

Test 3 — Opening Discrepancy
Expected ≠ Actual
↓
Report
↓
Continue Shift

Expected: discrepancy is recorded and Worker can continue from physical reality.

Test 4 — Active Operation
Active Shift
↓
Payment
↓
Payment linked to correct Shift
Test 5 — Expense
Active Shift
↓
Expense
↓
Expense linked to correct context
Test 6 — Stock
Active Shift
↓
Stock Operation
↓
Inventory updated
↓
Movement recorded
Test 7 — Transfer
Create
↓
Dispatch
↓
Receive
↓
Inventory reflects valid transfer
Test 8 — Closing
Active Shift
↓
Closing
↓
Closing Stock
↓
Close Shift

Expected: Shift becomes closed exactly once.

Test 9 — Shift Result
Closed Shift
↓
Financial Result

Expected: result matches authoritative records.

Test 10 — Owner Visibility
Worker Operations
↓
Stored Records
↓
Owner
↓
Reports / Analytics

Expected: Owner can see the resulting business information.

34. Isolation Tests
    Business Isolation
    Business A
    ↓
    Operations
    ↓
    Reports
    ↓
    Analytics

must never contain Business B data.

Branch Isolation
Branch A
↓
Worker
↓
Operations

must not expose unauthorized Branch B records.

35. Failure Tests

Test:

Network failure
Database failure
Duplicate request
Expired authentication
Invalid authorization
Partial transaction failure
Invalid input
Offline synchronization conflict

Expected behavior must never create misleading operational reality.

36. Full-System Integration Test

The complete test must reproduce real business operation:

Owner creates/configures Business
↓
Branch exists
↓
Products/inventory exist
↓
Worker authenticates
↓
Worker starts Shift
↓
Opening Stock appears
↓
Worker physically verifies stock
↓
Mismatch is reported if present
↓
Worker enters Active Shift
↓
Payments occur
↓
Mpesa occurs
↓
Expenses occur
↓
Stock changes occur
↓
Transfers occur
↓
Worker transitions to Closing
↓
Closing Stock is recorded
↓
Closing discrepancies are recorded
↓
Worker closes Shift
↓
System calculates result
↓
Owner sees records
↓
Reports reflect records
↓
Analytics reflects records

Every transition must succeed.

37. Completion Criteria
    ✓ Authentication integrates with all protected modules
    ✓ Owner access works
    ✓ Worker access works
    ✓ Business isolation works
    ✓ Branch isolation works
    ✓ Shift lifecycle works
    ✓ Opening transition works
    ✓ Opening verification works
    ✓ Discrepancy transition works
    ✓ Active Shift works
    ✓ Payment integration works
    ✓ Mpesa integration works
    ✓ Expense integration works
    ✓ Stock integration works
    ✓ Transfer integration works
    ✓ Closing transition works
    ✓ Shift result works
    ✓ Reports consume authoritative records
    ✓ Analytics consumes authoritative records
    ✓ Frontend and backend agree on state
    ✓ Critical operations are atomic
    ✓ Duplicate submissions are controlled
    ✓ Offline synchronization is safe where implemented
    ✓ Error recovery does not create false state
    ✓ Full-system integration test passes
    ✓ Production build passes
38. Implementation Algorithm
    Step 1 — Connect Authentication to the System
    Login
    ↓
    Identity
    ↓
    Authorization
    ↓
    System
    Step 2 — Connect Business and Branch Reality
    Owner
    ↓
    Business
    ↓
    Branches
    ↓
    Authorized Users
    Step 3 — Connect Worker to Shift
    Worker
    ↓
    Branch
    ↓
    Start Shift
    ↓
    Opening State
    Step 4 — Connect Opening to Verification
    Opening Stock
    ↓
    Physical Count
    ↓
    Verify
    OR
    Report Discrepancy
    Step 5 — Transition Into Active Reality
    Opening Complete
    ↓
    ACTIVE SHIFT
    Step 6 — Connect Operations
    Active Shift
    │
    ├── Payments
    ├── Mpesa
    ├── Expenses
    ├── Stock
    ├── Transfers
    └── Discrepancies
    Step 7 — Transition Into Closing
    Operations Complete
    ↓
    CLOSING
    ↓
    Closing Stock
    Step 8 — Connect Closing to Result
    Closing Complete
    ↓
    Close Shift
    ↓
    Calculate Result
    ↓
    Shift Closed
    Step 9 — Connect Operational Records to Owner
    Operational Records
    ↓
    Reports
    ↓
    Analytics
    ↓
    Owner
    Step 10 — Connect Offline Reality
    Offline
    ↓
    Safe Local State
    ↓
    Pending Operations
    ↓
    Reconnect
    ↓
    Synchronize
    ↓
    Server Confirmation
    Step 11 — Verify the Complete Reality
    Authentication
    ↓
    Opening
    ↓
    Verification
    ↓
    Active Shift
    ↓
    Operations
    ↓
    Closing
    ↓
    Result
    ↓
    Owner Visibility
    ↓
    Reports
    ↓
    Analytics
    Step 12 — Deployment Readiness Transition
    All Modules Connected
    ↓
    Full-System Test
    ↓
    Failure Tests
    ↓
    Isolation Tests
    ↓
    Offline Tests
    ↓
    Production Build
    ↓
    Deployment Readiness

Integration is complete only when the business can move through the entire reality without a broken transition.
INTEGRATION_DESIGN_ARCHITECTURE.md

Static technical contract. AI agents translate this specification into software. They must not redesign, reinterpret, or invent business behavior.

Integration connects already-defined capabilities. It does not create new business rules.

1. Purpose

The Integration capability ensures the system's modules work together as one operational system.

Opening
↓
Verification
↓
Active Shift
↓
Operations
↓
Closing
↓
Shift Result
↓
Owner Visibility

The purpose is to ensure that transitions between modules are implemented and verified.

Transitions must never be skipped.

2. Requirements
   Functional Requirements

The integrated system must:

Authenticate users.
Establish Owner/Worker identity.
Establish Business and Branch scope.
Open shifts.
Establish opening stock.
Verify opening stock.
Record discrepancies.
Transition into active shifts.
Record payments.
Record expenses.
Record stock operations.
Record transfers.
Record Mpesa activity.
Record closing stock.
Close shifts.
Calculate resulting financial state.
Make operational information available to the Owner.
Produce reports.
Produce analytics.
Preserve authoritative records across module boundaries.
Non-functional Requirements

The integrated system must provide:

Consistent state transitions.
Transactional integrity.
Business isolation.
Branch isolation.
Accurate calculations.
No duplicated sources of truth.
Traceable operations.
Reliable error recovery.
Mobile usability.
Safe offline behavior where supported.
Deterministic results. 3. Integration Principles
Each module remains responsible for its own domain.
Integration coordinates modules; it does not replace them.
Backend is authoritative.
Frontend is a client of the backend.
No module may silently modify another module's meaning.
Cross-module operations must respect authorization.
Cross-module operations must respect Business ownership.
Branch boundaries must remain intact.
Financial calculations must use authoritative records.
Operational transitions must be explicit.
Failed transitions must not leave misleading state. 4. System Architecture
FRONTEND
│
▼
AUTHENTICATION
│
▼
AUTHORIZATION
│
▼
BUSINESS
│
┌───────┴───────┐
▼ ▼
BRANCHES USERS
│
▼
SHIFTS
│
┌───────────┼────────────┐
▼ ▼ ▼
INVENTORY PAYMENTS EXPENSES
│ │ │
▼ ▼ ▼
STOCK MPESA FINANCIAL
│
▼
TRANSFERS
│
▼
DISCREPANCIES
│
└────────────┐
▼
REPORTS
│
▼
ANALYTICS
│
▼
OWNER 5. Integration Boundaries

The major integration boundaries are:

Authentication → Authorization

Business → Branch

Branch → Shift

Shift → Opening Stock

Opening Stock → Verification

Verification → Active Shift

Active Shift → Operations

Operations → Closing

Closing → Shift Result

Operational Records → Reports

Reports → Analytics

Backend → Frontend 6. Authentication → Authorization
Login
↓
Authenticated User
↓
Role
↓
Business Scope
↓
Branch Scope
↓
Authorized System

No protected operation may bypass this transition.

7. Business → Branch

Branches belong to a Business.

Business
│
├── Branch A
├── Branch B
└── Branch C

All Branch operations must remain associated with the correct Business.

8. Branch → Shift

A Shift belongs to the appropriate operational Branch.

Branch
↓
Worker
↓
Shift

A Worker must not operate a Shift outside their authorized scope.

9. Shift → Opening Stock

Opening begins the operational state.

Shift Opening
↓
System Opening Stock
↓
Worker Physical Count

The system must establish what stock the Worker is expected to begin with.

10. Opening Stock → Verification
    Expected Stock
    ↓
    Physical Count
    ↓
    Compare

Two outcomes are valid:

MATCH
↓
Verified

or:

MISMATCH
↓
Discrepancy Reported
↓
Continue

The Worker begins the Shift from the current physical reality.

11. Verification → Active Shift

This is a critical transition.

Opening Verification
↓
ACTIVE SHIFT

The system must not treat verification as optional background information.

It establishes the transition into operational activity.

12. Active Shift → Operations

During an active Shift:

ACTIVE SHIFT
│
├── Payments
├── Mpesa
├── Expenses
├── Stock Changes
├── Transfers
└── Discrepancies

Each operation must be associated with the correct operational context.

13. Payments → Shift

Payment records must belong to the appropriate operational period.

Payment
↓
Shift
↓
Branch
↓
Business

This relationship enables later reconciliation and reporting.

14. Mpesa → Payments

Mpesa activity must integrate with the established payment model.

Supported Mpesa realities include:

Mpesa Paybill
Pochi la Biashara
Send Money
Buy Goods and Services

The exact transaction handling follows the existing Mpesa architecture.

Mpesa integration must not create a separate competing payment truth.

15. Expenses → Shift

Where an expense occurs during a Shift:

Expense
↓
Shift
↓
Branch
↓
Business

The expense becomes part of the Shift's operational and financial record.

16. Stock Operations → Shift

Stock operations occurring during an active Shift must remain traceable to that operational context.

Shift
↓
Stock Operation
↓
Stock Movement
↓
Inventory State

The authoritative inventory model remains unchanged.

17. Transfers → Inventory

A transfer represents movement between stock locations/Branches where applicable.

Source
↓
Transfer
↓
Destination

The transfer lifecycle must remain explicit.

Create
↓
Dispatch
↓
In Transit
↓
Receive

Inventory must reflect only valid completed transitions according to the existing Transfer rules.

18. Operations → Closing

When operational work is complete:

ACTIVE SHIFT
↓
CLOSING

No operation should be silently inserted after the Shift has entered its final closing state.

19. Closing → Closing Stock
    System Closing State
    ↓
    Physical Count
    ↓
    Actual Closing State
    ↓
    Compare

If different:

Mismatch
↓
Discrepancy 20. Closing → Shift Result

After valid closing:

Closing Stock

- Payments
- Expenses
- Stock Records
- Other Authoritative Records
  ↓
  Shift Result

The backend calculates the authoritative result.

The frontend displays it.

21. Shift → Reports

Completed Shift information feeds reporting.

Shift
├── Payments
├── Expenses
├── Stock
├── Transfers
└── Discrepancies
↓
Reports

Reports must not recreate operational records.

22. Reports → Analytics
    Operational Truth
    ↓
    Reports
    ↓
    Analytics

Analytics identifies trends and patterns.

Analytics must not become a second source of truth.

23. Owner Visibility
    Operational Reality
    ↓
    Stored Records
    ↓
    Reports / Analytics
    ↓
    Owner

The Owner must be able to understand what happened without needing to meet the Worker physically.

24. Frontend → Backend
    Frontend
    ↓
    HTTP API
    ↓
    Backend
    ↓
    Database

The frontend must never directly access PostgreSQL.

25. Backend → Database

The backend is responsible for:

Authorization.
Validation.
Business rules.
Transactions.
Persistence.
Calculations.
State transitions.

Prisma remains the database access layer.

26. Transaction Boundaries

Any operation requiring multiple related writes must use a database transaction where atomicity is required.

Example:

Transfer completion
│
├── Update transfer state
├── Update source inventory
└── Update destination inventory

These operations must not partially succeed.

Expected:

ALL SUCCESS

or:

ALL ROLLBACK

where the business operation requires atomicity.

27. Integration Error Rule

If a cross-module operation fails:

Operation
↓
Failure
↓
No misleading partial state
↓
Clear error

The system must not tell the Worker that an operation succeeded when only part of the operation was persisted.

28. Idempotency

Critical operations must protect against duplicate submissions.

Examples:

Payment recording.
Expense recording.
Transfer actions.
Shift closing.
Mpesa transaction processing.

Repeated delivery of the same operation must not unintentionally create duplicate business records.

29. Offline Integration

Where offline functionality is supported:

Worker
↓
Offline
↓
Local pending operation
↓
Reconnect
↓
Server synchronization
↓
Server confirmation

The local device must distinguish:

Pending

from:

Server Confirmed

Offline mode must not silently create conflicting authoritative states.

30. Integration API Structure

The existing modules remain responsible for their APIs.

Example:

/auth
/businesses
/branches
/users
/shifts
/products
/inventory
/stock-movements
/transfers
/expenses
/mpesa-accounts
/mpesa-transactions
/discrepancies
/reports
/analytics

Integration must not create duplicate endpoints for existing operations.

31. Data Ownership
    User
    → Users

Business
→ Business

Branch
→ Branches

Shift
→ Shifts

Product
→ Products

Inventory
→ Inventory / Stock

Transfer
→ Transfers

Expense
→ Expenses

Mpesa Transaction
→ Mpesa Transactions

Discrepancy
→ Discrepancies

Report
→ Reports

Analytics
→ Analytics

Each domain remains authoritative for its own records.

32. Data Flow

The complete data flow is:

Worker
↓
Frontend
↓
API
↓
Authentication
↓
Authorization
↓
Domain Module
↓
Database
↓
Authoritative Record
↓
Reports
↓
Analytics
↓
Owner 33. Functional Integration Tests
Test 1 — Worker Entry
Worker Login
↓
Worker Interface
↓
Correct Branch

Expected: Worker sees only authorized operational reality.

Test 2 — Opening
Start Shift
↓
Opening Stock
↓
Verify

Expected: Worker cannot silently bypass the opening transition.

Test 3 — Opening Discrepancy
Expected ≠ Actual
↓
Report
↓
Continue Shift

Expected: discrepancy is recorded and Worker can continue from physical reality.

Test 4 — Active Operation
Active Shift
↓
Payment
↓
Payment linked to correct Shift
Test 5 — Expense
Active Shift
↓
Expense
↓
Expense linked to correct context
Test 6 — Stock
Active Shift
↓
Stock Operation
↓
Inventory updated
↓
Movement recorded
Test 7 — Transfer
Create
↓
Dispatch
↓
Receive
↓
Inventory reflects valid transfer
Test 8 — Closing
Active Shift
↓
Closing
↓
Closing Stock
↓
Close Shift

Expected: Shift becomes closed exactly once.

Test 9 — Shift Result
Closed Shift
↓
Financial Result

Expected: result matches authoritative records.

Test 10 — Owner Visibility
Worker Operations
↓
Stored Records
↓
Owner
↓
Reports / Analytics

Expected: Owner can see the resulting business information.

34. Isolation Tests
    Business Isolation
    Business A
    ↓
    Operations
    ↓
    Reports
    ↓
    Analytics

must never contain Business B data.

Branch Isolation
Branch A
↓
Worker
↓
Operations

must not expose unauthorized Branch B records.

35. Failure Tests

Test:

Network failure
Database failure
Duplicate request
Expired authentication
Invalid authorization
Partial transaction failure
Invalid input
Offline synchronization conflict

Expected behavior must never create misleading operational reality.

36. Full-System Integration Test

The complete test must reproduce real business operation:

Owner creates/configures Business
↓
Branch exists
↓
Products/inventory exist
↓
Worker authenticates
↓
Worker starts Shift
↓
Opening Stock appears
↓
Worker physically verifies stock
↓
Mismatch is reported if present
↓
Worker enters Active Shift
↓
Payments occur
↓
Mpesa occurs
↓
Expenses occur
↓
Stock changes occur
↓
Transfers occur
↓
Worker transitions to Closing
↓
Closing Stock is recorded
↓
Closing discrepancies are recorded
↓
Worker closes Shift
↓
System calculates result
↓
Owner sees records
↓
Reports reflect records
↓
Analytics reflects records

Every transition must succeed.

37. Completion Criteria
    ✓ Authentication integrates with all protected modules
    ✓ Owner access works
    ✓ Worker access works
    ✓ Business isolation works
    ✓ Branch isolation works
    ✓ Shift lifecycle works
    ✓ Opening transition works
    ✓ Opening verification works
    ✓ Discrepancy transition works
    ✓ Active Shift works
    ✓ Payment integration works
    ✓ Mpesa integration works
    ✓ Expense integration works
    ✓ Stock integration works
    ✓ Transfer integration works
    ✓ Closing transition works
    ✓ Shift result works
    ✓ Reports consume authoritative records
    ✓ Analytics consumes authoritative records
    ✓ Frontend and backend agree on state
    ✓ Critical operations are atomic
    ✓ Duplicate submissions are controlled
    ✓ Offline synchronization is safe where implemented
    ✓ Error recovery does not create false state
    ✓ Full-system integration test passes
    ✓ Production build passes
38. Implementation Algorithm
    Step 1 — Connect Authentication to the System
    Login
    ↓
    Identity
    ↓
    Authorization
    ↓
    System
    Step 2 — Connect Business and Branch Reality
    Owner
    ↓
    Business
    ↓
    Branches
    ↓
    Authorized Users
    Step 3 — Connect Worker to Shift
    Worker
    ↓
    Branch
    ↓
    Start Shift
    ↓
    Opening State
    Step 4 — Connect Opening to Verification
    Opening Stock
    ↓
    Physical Count
    ↓
    Verify
    OR
    Report Discrepancy
    Step 5 — Transition Into Active Reality
    Opening Complete
    ↓
    ACTIVE SHIFT
    Step 6 — Connect Operations
    Active Shift
    │
    ├── Payments
    ├── Mpesa
    ├── Expenses
    ├── Stock
    ├── Transfers
    └── Discrepancies
    Step 7 — Transition Into Closing
    Operations Complete
    ↓
    CLOSING
    ↓
    Closing Stock
    Step 8 — Connect Closing to Result
    Closing Complete
    ↓
    Close Shift
    ↓
    Calculate Result
    ↓
    Shift Closed
    Step 9 — Connect Operational Records to Owner
    Operational Records
    ↓
    Reports
    ↓
    Analytics
    ↓
    Owner
    Step 10 — Connect Offline Reality
    Offline
    ↓
    Safe Local State
    ↓
    Pending Operations
    ↓
    Reconnect
    ↓
    Synchronize
    ↓
    Server Confirmation
    Step 11 — Verify the Complete Reality
    Authentication
    ↓
    Opening
    ↓
    Verification
    ↓
    Active Shift
    ↓
    Operations
    ↓
    Closing
    ↓
    Result
    ↓
    Owner Visibility
    ↓
    Reports
    ↓
    Analytics
    Step 12 — Deployment Readiness Transition
    All Modules Connected
    ↓
    Full-System Test
    ↓
    Failure Tests
    ↓
    Isolation Tests
    ↓
    Offline Tests
    ↓
    Production Build
    ↓
    Deployment Readiness

Integration is complete only when the business can move through the entire reality without a broken transition.
