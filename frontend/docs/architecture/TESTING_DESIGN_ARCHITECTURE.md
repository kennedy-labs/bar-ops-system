TESTING_DESIGN_ARCHITECTURE.md

Static technical contract. AI agents translate this specification into tests. They must not redesign business behavior or invent requirements.

Testing verifies that the software accurately reproduces the defined business reality.

1. Purpose

Testing verifies that the complete system behaves according to the operational reality defined by IMPLEMENTATION_ALGORITHM.md and the design architecture files.

Testing is not limited to checking whether code compiles.

Business Reality
↓
Software Implementation
↓
Test
↓
Reality Matches 2. Testing Requirements
Functional Requirements

Testing must verify:

Authentication.
Owner access.
Worker access.
Business isolation.
Branch isolation.
Opening shifts.
Opening stock.
Opening verification.
Discrepancies.
Active shifts.
Payments.
Mpesa.
Expenses.
Stock operations.
Transfers.
Closing stock.
Shift closing.
Profit/loss calculations.
Reports.
Analytics.
Frontend/backend integration.
Offline behavior where implemented.
Non-functional Requirements

Testing must also verify:

Reliability.
Security.
Performance.
Data integrity.
Mobile usability.
Error handling.
Duplicate-request protection.
Transaction integrity.
Historical accuracy.
Offline synchronization. 3. Testing Principles
Test business reality, not implementation trivia.
Test transitions explicitly.
Never skip transitions.
Test module boundaries.
Test failures, not only successful paths.
Test authorization from the backend.
Test Business isolation.
Test Branch isolation.
Test financial calculations against known results.
Test historical records using historical values.
Test duplicate operations.
Test offline recovery.
Test the complete system end-to-end. 4. Testing Pyramid
Full-System
Integration
▲
│
Module Integration
▲
│
Unit Tests
▲
│
Validation / Rules

The system must have tests at multiple levels.

5. Test Layers
   Testing
   │
   ├── Unit Tests
   ├── Module Integration Tests
   ├── API Tests
   ├── Database Tests
   ├── Frontend Tests
   ├── Full-System Integration Tests
   ├── Security Tests
   ├── Performance Tests
   └── Offline / Recovery Tests
6. Unit Tests

Unit tests verify isolated business calculations and rules.

Examples:

Profit calculation
Discrepancy calculation
Quantity calculation
Percentage calculation
Filter logic
Validation
State transition rules

Example:

Expected = 100
Actual = 95

Difference = -5

Expected result must always be deterministic.

7. Module Integration Tests

Each module must be tested against its real dependencies.

Examples:

Shift
↓
Shift Stock
↓
Inventory
Transfer
↓
Inventory
↓
Stock Movement
Expense
↓
Shift
↓
Reports 8. API Tests

Every public API endpoint must be tested for:

Valid request.
Invalid request.
Authentication.
Authorization.
Business scope.
Branch scope.
Expected response.
Failure response.
Duplicate request where applicable. 9. Database Tests

Database tests must verify:

Relationships.
Constraints.
Required fields.
Unique constraints.
Referential integrity.
Transaction rollback.
Business isolation.
Branch relationships.
Historical records. 10. Authentication Testing
Valid Login
Valid credentials
↓
Authenticated User
↓
Correct interface
Invalid Login
Invalid credentials
↓
Rejected
Logout
Login
↓
Logout
↓
Protected request
↓
Rejected
Expired Authentication
Expired session/token
↓
Protected request
↓
Rejected 11. Authorization Testing
Owner

Verify Owner can perform authorized management actions.

Worker

Verify Worker can perform authorized operational actions.

Worker → Owner
Worker
↓
Owner-only action
↓
403 12. Business Isolation Testing

Create:

Business A
Business B

Then verify:

Business A User
↓
Business B Record
↓
Rejected

Test this across:

Products.
Branches.
Shifts.
Inventory.
Transfers.
Expenses.
Mpesa.
Discrepancies.
Reports.
Analytics. 13. Branch Isolation Testing

Create:

Branch A
Branch B

Verify unauthorized Branch data cannot be accessed.

Worker at Branch A
↓
Branch B data
↓
Rejected

Owner access must follow the Owner authorization model.

14. Shift Lifecycle Testing

The complete Shift lifecycle is:

OPENING
↓
VERIFYING
↓
ACTIVE
↓
CLOSING
↓
CLOSED

Every transition must be tested.

15. Opening Shift Test
    Worker
    ↓
    Start Shift
    ↓
    Opening Stock appears

Expected:

Correct Branch.
Correct Worker.
Correct opening state.
Correct stock records. 16. Opening Verification Test
Expected = Actual
↓
Verified
↓
Active Shift

Expected:

Verification recorded.
Shift progresses correctly. 17. Opening Discrepancy Test
Expected ≠ Actual
↓
Discrepancy
↓
Continue
↓
Active Shift

Expected:

Difference recorded.
Worker is not blocked unnecessarily.
Starting operational reality remains traceable. 18. Active Shift Testing

During an Active Shift test:

Payment
Expense
Stock Change
Transfer
Mpesa
Discrepancy

Each operation must:

Belong to the correct Shift where applicable.
Belong to the correct Branch.
Belong to the correct Business.
Be persisted correctly.
Appear in later reporting. 19. Payment Testing

Test:

Cash
Mpesa
Other supported payment methods

Verify:

Recorded payment
↓
Correct Shift
↓
Correct totals
↓
Correct reports 20. Mpesa Testing

The system must test the supported Mpesa realities:

Paybill
Pochi la Biashara
Send Money
Buy Goods and Services

Testing must verify:

Correct transaction association.
Correct amount.
Correct account.
Correct Business/Branch context.
Duplicate transaction protection.
Reconciliation behavior.
Failure handling.

Real Mpesa integration must be tested separately from simulated/test transactions.

21. Expense Testing
    Worker
    ↓
    Record Expense
    ↓
    Expense stored
    ↓
    Shift / Branch / Business
    ↓
    Report

Verify the expense contributes correctly to downstream calculations.

22. Stock Testing

Test:

Add
Reduce
Transfer
Opening
Closing

Verify stock quantities remain consistent.

23. Transfer Testing

Full lifecycle:

Create
↓
Dispatch
↓
In Transit
↓
Receive

Test:

Correct source.
Correct destination.
Correct product.
Correct quantity.
Duplicate actions.
Invalid transitions.
Inventory effects.
Failure rollback. 24. Discrepancy Testing

Test:

Expected
Actual
↓
Difference
↓
Discrepancy Record

Test discrepancies during:

Opening.
Active operations where applicable.
Closing. 25. Closing Testing
Active Shift
↓
Closing
↓
Closing Stock
↓
Discrepancies
↓
Close Shift

Verify:

Correct final state.
Correct closing quantities.
Correct discrepancies.
Shift cannot close twice.
Closed Shift cannot accept unauthorized operations. 26. Profit/Loss Testing

Profit/loss calculations must be tested using known scenarios.

Example:

Revenue = KSh 20,000
Expenses = KSh 5,000
Cost = KSh 8,000

The expected result must be explicitly calculated and compared with the system result.

The authoritative business formula must come from the existing system design.

27. Reports Testing

Every report must be verified against underlying records.

Example:

Operational Records
↓
Report

Expected:

# Report total

Authoritative record total

Test filters:

Business.
Branch.
Shift.
Product.
Date range. 28. Analytics Testing

Analytics must be verified against Reports and underlying authoritative records.

Test:

Trends.
Totals.
Comparisons.
Percentages.
Branch comparisons.
Product patterns.
Discrepancy patterns.
Financial patterns.

Repeat identical queries against unchanged data.

Expected:

Same Input
↓
Same Result 29. Historical Testing

Historical records must remain historically correct.

Example:

January
Product cost = 100

March
Product cost = 120

January analysis must not suddenly use 120.

Test Product Cost History explicitly.

30. Frontend Testing

Frontend tests must verify operational flows rather than only visual rendering.

Critical flow:

Login
↓
Open Shift
↓
Verify Stock
↓
Active Shift
↓
Record Operations
↓
Closing
↓
Close Shift
↓
View Result 31. Frontend State Testing

Test:

Loading
Success
Error
Offline
Syncing
Synced

The interface must never display false confirmation.

Example:

Offline
↓
Expense queued

must not display:

Expense permanently recorded

until server confirmation exists.

32. Duplicate Submission Testing

Critical operations must be tested by submitting the same request multiple times.

Examples:

Close Shift twice
Submit Expense twice
Dispatch Transfer twice
Receive Transfer twice
Process Mpesa transaction twice

Expected:

One valid business operation 33. Transaction Integrity Testing

For multi-record operations:

Operation
↓
Failure halfway

Expected:

Rollback
↓
No misleading partial state

Example:

Transfer
├── Source update
├── Transfer state
└── Destination update

If required to be atomic, all must succeed or all must roll back.

34. Offline Testing

Test:

Online
↓
Operation
↓
Offline
↓
Allowed operation
↓
Reconnect
↓
Synchronization
↓
Server confirmation

Also test:

Duplicate synchronization.
Failed synchronization.
Interrupted synchronization.
Conflicting changes.
Device restart while pending operations exist. 35. Network Failure Testing

Simulate:

Slow network
No network
Network interruption
Timeout
Reconnect

Expected behavior must be understandable to the Worker.

36. Performance Testing

Test:

Login response.
Dashboard loading.
Shift loading.
Inventory queries.
Reports.
Analytics.
Large date ranges.
Large product sets.
Multiple Branches.

Look for:

Slow queries.
N+1 queries.
Excessive payloads.
Unnecessary frontend requests.
Memory growth. 37. Mobile Testing

Primary target:

Mobile device

Test:

Small screen.
Touch interaction.
Slow network.
Intermittent connectivity.
Long forms.
Numeric input.
Navigation.
Critical action visibility. 38. Security Testing

Test:

Unauthorized request
Role escalation
User impersonation
Business ID manipulation
Branch ID manipulation
Resource ID manipulation
Expired authentication
Malformed requests
Sensitive response exposure

Expected:

Rejected

where authorization is insufficient.

39. Data Integrity Testing

After a complete business cycle:

Opening
↓
Operations
↓
Closing

verify:

Shift state.
Stock state.
Payment state.
Expense state.
Transfer state.
Discrepancy state.
Financial result.
Reports.
Analytics.

remain consistent.

40. Full-System Scenario

The primary integration scenario must reproduce actual business operation.

1. Owner configures Business
2. Branch exists
3. Products exist
4. Inventory exists
5. Worker logs in
6. Worker starts Shift
7. Opening Stock appears
8. Worker counts physical stock
9. Worker verifies or reports discrepancy
10. Shift becomes active
11. Payment occurs
12. Mpesa payment occurs
13. Expense occurs
14. Stock changes
15. Transfer occurs
16. Worker begins closing
17. Worker counts closing stock
18. Closing discrepancy is recorded if required
19. Worker closes Shift
20. System calculates result
21. Owner views records
22. Reports reflect operations
23. Analytics reflects patterns

This is the primary test of whether the system actually represents the business.

41. Test Data

Test data must represent realistic business situations.

Include:

Multiple Businesses
Multiple Branches
Multiple Workers
Multiple Products
Multiple Shifts
Cash payments
Mpesa payments
Expenses
Transfers
Opening discrepancies
Closing discrepancies
Historical costs

Test data must not accidentally cross Business or Branch boundaries.

42. Test Environment

Testing must use environments isolated from production.

Development
↓
Testing
↓
Production

Production data must never be casually modified during testing.

43. Test Tools
    Primary
    Jest
    Supertest
    React Testing Library
    Playwright
    Prisma test database
    PostgreSQL
    Alternatives
    Primary Alternative
    Jest Vitest
    Supertest API client integration tests
    Playwright Cypress
    React Testing Library Component testing alternative
    PostgreSQL test DB Isolated test database

Alternatives must preserve test coverage and reliability.

44. Test Organization
    backend/
    ├── test/
    │ ├── unit/
    │ ├── integration/
    │ ├── api/
    │ ├── security/
    │ └── e2e/

frontend/
├── tests/
│ ├── components/
│ ├── features/
│ └── e2e/ 45. Test Naming

Test names must describe business behavior.

Prefer:

should prevent a worker from closing another worker's shift

over:

should return 403

Prefer:

should record an opening discrepancy when physical stock differs

over:

should call discrepancyService 46. Regression Testing

Every discovered defect must result in a regression test where practical.

Bug discovered
↓
Fix
↓
Regression test
↓
Future protection 47. Deployment Gate

Deployment must not proceed until:

Unit Tests
✓

Integration Tests
✓

API Tests
✓

Security Tests
✓

Frontend Tests
✓

Full-System Tests
✓

Production Build
✓

All critical tests must pass.

48. Completion Criteria
    ✓ Unit tests pass
    ✓ Module integration tests pass
    ✓ API tests pass
    ✓ Database tests pass
    ✓ Authentication tests pass
    ✓ Authorization tests pass
    ✓ Business isolation tests pass
    ✓ Branch isolation tests pass
    ✓ Shift lifecycle tests pass
    ✓ Opening tests pass
    ✓ Verification tests pass
    ✓ Discrepancy tests pass
    ✓ Payment tests pass
    ✓ Mpesa tests pass
    ✓ Expense tests pass
    ✓ Stock tests pass
    ✓ Transfer tests pass
    ✓ Closing tests pass
    ✓ Profit/loss tests pass
    ✓ Reports tests pass
    ✓ Analytics tests pass
    ✓ Frontend tests pass
    ✓ Offline tests pass where implemented
    ✓ Duplicate-operation tests pass
    ✓ Transaction-integrity tests pass
    ✓ Performance tests pass
    ✓ Mobile tests pass
    ✓ Security tests pass
    ✓ Full-system scenario passes
    ✓ Production build passes
49. Implementation Algorithm
    Step 1 — Verify Individual Reality
    Each Module
    ↓
    Its Own Rules
    ↓
    Unit Tests
    Step 2 — Verify Module Connections
    Module A
    ↓
    Transition
    ↓
    Module B
    ↓
    Integration Test
    Step 3 — Verify Authentication and Access
    Owner
    ↓
    Authorized Management Reality

Worker
↓
Authorized Operational Reality
Step 4 — Verify Opening Reality
Start Shift
↓
Opening Stock
↓
Physical Verification
↓
Verify / Report
Step 5 — Verify Active Reality
Active Shift
↓
Payments
↓
Mpesa
↓
Expenses
↓
Stock
↓
Transfers
↓
Discrepancies
Step 6 — Verify Closing Reality
Active Shift
↓
Closing
↓
Closing Stock
↓
Discrepancy
↓
Close Shift
Step 7 — Verify Result Reality
Closed Shift
↓
Calculations
↓
Profit/Loss
↓
Stored Result
Step 8 — Verify Owner Reality
Operational Records
↓
Reports
↓
Analytics
↓
Owner
Step 9 — Break the System Deliberately

Test:

Invalid input
Unauthorized user
Wrong Branch
Wrong Business
Duplicate request
Network failure
Database failure
Partial transaction failure
Offline operation
Synchronization failure

Expected behavior must remain safe and truthful.

Step 10 — Run the Complete Business Reality
Login
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
Step 11 — Deployment Readiness
All Critical Tests Pass
↓
No Known Critical Integration Failure
↓
Production Build Passes
↓
Production Configuration Verified
↓
Deployment Ready

Testing is complete only when the software has demonstrated that it can reproduce the complete operational reality—not merely when the test suite is green.
