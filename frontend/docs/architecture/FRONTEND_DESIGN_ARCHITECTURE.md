FRONTEND_DESIGN_ARCHITECTURE.md

Static technical contract. AI agents translate this specification into software. They must not redesign, reinterpret, or invent business behavior.

The frontend represents the operational reality already defined by IMPLEMENTATION_ALGORITHM.md and the backend architecture files.

The frontend is not the source of business truth.

1. Purpose

The frontend is the mobile interface through which the Owner and Worker interact with the business system.

Business Reality
↓
Frontend
↓
Backend
↓
Authoritative Records

The frontend must make the real operational sequence visible and usable.

It must not invent workflows that do not exist in the business reality.

2. Actors

The frontend has exactly two actors:

OWNER
WORKER

There is no Manager interface.

The Owner uses the management interface.

The Worker uses the operational interface.

3. Frontend Responsibilities

The frontend must:

Authenticate users.
Show the correct interface for the actor.
Guide workers through the operational sequence.
Display current system state.
Collect operational data.
Show relevant business information.
Display validation errors.
Display successful operations.
Display discrepancies.
Display reports and analytics to authorized users.
Work effectively on mobile devices.
Handle unreliable connectivity.
Prevent accidental duplicate submissions.
Preserve user-entered data where appropriate.

The frontend must not:

Become the source of truth.
Perform authoritative financial calculations independently.
Decide permissions.
Invent business rules.
Bypass backend validation.
Modify records directly. 4. Operational Sequence

The primary Worker interface must follow the real operational sequence:

OPENING SHIFT
↓
VERIFY OPENING STOCK
↓
REPORT INCONSISTENCY IF NECESSARY
↓
TRANSITION INTO ACTIVE SHIFT
↓
RECORD OPERATIONS
↓
TRANSITION INTO CLOSING
↓
RECORD CLOSING STOCK
↓
CLOSE SHIFT
↓
SYSTEM CALCULATES RESULT

This sequence must remain visible to the Worker.

Transitions must never be silently skipped.

5. Owner Experience

The Owner interface is management-oriented.

OWNER
│
├── Business Overview
├── Branches
├── Products
├── Inventory
├── Shifts
├── Transfers
├── Expenses
├── Mpesa
├── Discrepancies
├── Reports
└── Analytics

The Owner must be able to understand the current state without needing to manually reconstruct it from raw records.

6. Worker Experience

The Worker interface is operation-oriented.

WORKER
│
├── Current Shift
├── Opening Stock
├── Verify / Report
├── Active Operations
├── Payments
├── Expenses
├── Stock Operations
├── Transfers
├── Closing Stock
└── End Shift

The interface should prioritize the next operational action.

7. Frontend Architecture
   Frontend
   │
   ├── Authentication
   │
   ├── Owner
   │ ├── Dashboard
   │ ├── Business
   │ ├── Branches
   │ ├── Products
   │ ├── Inventory
   │ ├── Transfers
   │ ├── Expenses
   │ ├── Mpesa
   │ ├── Discrepancies
   │ ├── Reports
   │ └── Analytics
   │
   └── Worker
   ├── Shift
   ├── Opening
   ├── Operations
   ├── Payments
   ├── Stock
   ├── Transfers
   ├── Expenses
   ├── Closing
   └── Shift Result
8. Technology
   Required
   Next.js
   TypeScript
   React
   Tailwind CSS
   TanStack Query
   Zod
   Zustand where client-side state is required
   Backend Integration

The frontend communicates with the existing NestJS backend through HTTP APIs.

Next.js
↓
HTTP API
↓
NestJS
↓
Prisma
↓
PostgreSQL 9. Tool Alternatives
Primary Alternative
Next.js React/Vite
TanStack Query SWR
Zustand React Context
Zod Existing backend-compatible validation
Tailwind CSS CSS Modules

Alternatives must not be introduced automatically.

The primary stack is the default implementation.

10. File Structure
    frontend/
    ├── src/
    │ ├── app/
    │ │ ├── login/
    │ │ ├── owner/
    │ │ │ ├── dashboard/
    │ │ │ ├── branches/
    │ │ │ ├── products/
    │ │ │ ├── inventory/
    │ │ │ ├── transfers/
    │ │ │ ├── expenses/
    │ │ │ ├── mpesa/
    │ │ │ ├── discrepancies/
    │ │ │ ├── reports/
    │ │ │ └── analytics/
    │ │ │
    │ │ └── worker/
    │ │ ├── shift/
    │ │ ├── opening/
    │ │ ├── operations/
    │ │ ├── payments/
    │ │ ├── stock/
    │ │ ├── transfers/
    │ │ ├── expenses/
    │ │ └── closing/
    │ │
    │ ├── components/
    │ │ ├── ui/
    │ │ ├── forms/
    │ │ ├── navigation/
    │ │ ├── feedback/
    │ │ └── data-display/
    │ │
    │ ├── features/
    │ │ ├── auth/
    │ │ ├── shifts/
    │ │ ├── inventory/
    │ │ ├── payments/
    │ │ ├── expenses/
    │ │ ├── transfers/
    │ │ ├── discrepancies/
    │ │ ├── reports/
    │ │ └── analytics/
    │ │
    │ ├── lib/
    │ │ ├── api/
    │ │ ├── auth/
    │ │ ├── validation/
    │ │ └── utils/
    │ │
    │ ├── store/
    │ └── types/
    │
    └── package.json
11. API Layer

All backend communication must pass through a centralized API layer.

UI
↓
Feature API function
↓
API client
↓
Backend

Components must not scatter raw fetch() calls throughout the application.

12. Server State

Server state must be handled through TanStack Query.

Examples:

Current Shift
Products
Inventory
Transfers
Expenses
Reports
Analytics

Server state must not be duplicated unnecessarily in Zustand.

13. Client State

Zustand is reserved for genuinely client-owned state.

Examples:

Temporary form state where appropriate.
UI preferences.
Local operational draft state where required.
Offline queue state where required.

Server records remain backend-owned.

14. Validation

Frontend validation must provide immediate user feedback.

User Input
↓
Frontend Validation
↓
Backend Validation
↓
Operation

Frontend validation improves usability.

Backend validation remains authoritative.

15. Loading States

Every network operation must have a visible loading state.

Examples:

Loading...
Saving...
Submitting...
Closing shift...

The interface must prevent accidental repeated actions during critical submissions.

16. Error States

Errors must be understandable in business language.

Prefer:

"Could not record the expense. Please try again."

over:

"HTTP 500 PrismaClientKnownRequestError"

Technical details may be logged for developers but must not become the primary Worker experience.

17. Success States

Successful operations must provide immediate confirmation.

Example:

Expense recorded ✓
Discrepancy reported ✓
Transfer sent ✓
Shift closed ✓ 18. Opening Shift Interface

The Worker begins with:

Current Shift
↓
Opening Stock

The screen must clearly show:

Expected system quantity.
Product.
Location/counter where applicable.
Input for actual quantity.
Verification action.
Discrepancy reporting action. 19. Opening Verification
Expected
↓
Worker counts
↓
Actual
↓
Compare

If matching:

Verified ✓

If different:

Difference detected
↓
Report discrepancy
↓
Continue

The Worker must not be trapped indefinitely because reality differs from the system.

20. Active Shift Interface

After opening verification:

ACTIVE SHIFT

The Worker must be able to record the operations that actually happen.

Payments
Expenses
Stock Changes
Transfers
Other Supported Operations

The interface should make the current Shift state obvious.

21. Payments

The Worker must be able to record supported payment activity.

Payment methods must include the existing backend-supported methods.

Mpesa operations must follow the existing Mpesa architecture.

The frontend must not pretend a payment succeeded before backend confirmation.

22. Expenses

The Worker must be able to record authorized expenses.

The form must collect only required information.

Example:

Amount
Category
Description
Submit

After successful submission:

Expense recorded ✓ 23. Stock Operations

The Worker must be able to perform authorized stock operations.

Examples:

Add
Reduce
Transfer

The interface must clearly identify:

Product
Quantity
Location
Operation

Backend rules remain authoritative.

24. Transfers

The frontend must represent the Transfer lifecycle.

Create
↓
Dispatch
↓
In Transit
↓
Receive

The interface must clearly distinguish:

Sender.
Receiver.
Source.
Destination.
Items.
Quantities.
Current state. 25. Discrepancies

Discrepancy reporting must be quick.

Expected
Actual
↓
Difference
↓
Report

The frontend may display the calculated difference.

The backend remains authoritative for the final value.

26. Closing Interface

Closing begins only when the Worker has completed active operations.

ACTIVE SHIFT
↓
CLOSING

The interface must show the products/items requiring closing verification.

27. Closing Stock
    System Closing State
    ↓
    Worker Physical Count
    ↓
    Actual Closing State
    ↓
    Compare

If a discrepancy exists:

Record discrepancy
↓
Continue closing 28. End Shift

The final action must clearly communicate that the Shift is being closed.

Example:

Review Closing State

[ CLOSE SHIFT ]

Critical actions must require appropriate confirmation where accidental activation could cause operational problems.

29. Shift Result

After successful closing:

Shift Closed ✓

The system result may include:

Payments.
Expenses.
Stock information.
Discrepancies.
Profit/loss.

The backend calculation is authoritative.

30. Owner Dashboard

The Owner dashboard must prioritize current business state.

It should provide access to:

Current Operations
Financial State
Inventory State
Discrepancies
Transfers
Reports
Analytics

The dashboard must not become an overloaded wall of information.

31. Reports Interface

Reports must provide:

Report
↓
Filters
↓
Results

Filters may include:

Date.
Branch.
Shift.
Product.
Location.

The interface must clearly distinguish:

Current
Historical

data where relevant.

32. Analytics Interface

Analytics should prioritize visual understanding.

Suitable representations include:

Cards.
Tables.
Charts.
Trends.
Comparisons.

Analytics must remain understandable without requiring the Owner to interpret raw database concepts.

33. Navigation

Navigation must be role-specific.

Worker:

Current Shift
Operations
Closing

Owner:

Dashboard
Operations
Management
Reports
Analytics

Navigation must not expose inaccessible areas as if they were usable.

34. Mobile-first Requirement

The primary device is the mobile phone.

Therefore:

Touch targets must be large enough.
Forms must be easy to complete.
Important actions must remain visible.
Tables must not require desktop-width layouts.
Navigation must work comfortably with one hand where practical.
Network requests must be minimized.
Screens must remain usable on small displays.

Desktop support must not compromise mobile usability.

35. Offline Strategy

The system must operate offline as much as reliably possible.

Offline support must prioritize operational continuity.

Online
↓
Normal operation
Offline
↓
Local operational capability where safe
↓
Queue pending changes
↓
Reconnect
↓
Synchronize
↓
Confirm server state

The frontend must never falsely display a queued operation as permanently recorded.

36. Synchronization

Offline synchronization must protect against:

Duplicate submissions.
Conflicting changes.
Lost records.
Incorrect Shift state.
Incorrect inventory state.

Server confirmation is authoritative.

37. Network Feedback

The user must be able to understand connectivity state.

Examples:

Online
Offline — changes will sync when connection returns.
Syncing...
Synced ✓ 38. Data Freshness

For active operational data:

Fresh server state

> stale local state

The frontend must clearly distinguish locally queued data from server-confirmed data.

39. Forms

Forms must:

Use clear labels.
Use appropriate numeric inputs.
Prevent impossible values.
Preserve entered values during recoverable errors.
Disable duplicate submission.
Show validation beside the relevant field.
Provide clear success/failure feedback. 40. Design Language

The interface must feel:

Practical.
Fast.
Clear.
Calm.
Operational.
Trustworthy.

Avoid unnecessary decorative UI.

The interface exists to help people operate the business.

41. Visual Hierarchy

Important information must be visually dominant.

Example:

CURRENT SHIFT
↓
NEXT ACTION
↓
IMPORTANT STATE
↓
Supporting Information

The interface must not make a Worker search through decorative content to find the next operational action.

42. Accessibility

The frontend must provide:

Readable text.
Adequate contrast.
Clear focus states.
Keyboard support where applicable.
Labels for form controls.
Meaningful error messages.
Non-color-only status indicators. 43. Performance Requirements

The frontend must:

Load quickly.
Minimize JavaScript where practical.
Avoid unnecessary API requests.
Avoid unnecessary rerenders.
Lazy-load heavy management views where appropriate.
Keep mobile interactions responsive.
Avoid blocking the interface during normal operations. 44. Security

The frontend must:

Never store backend secrets.
Never expose database credentials.
Never contain private API keys.
Never trust client-side authorization.
Never assume hidden UI equals protected access.
Never expose sensitive Mpesa information unnecessarily. 45. Testing

The frontend must test:

Authentication
Login
↓
Correct actor interface
Worker
Open Shift
↓
Verify Stock
↓
Operate
↓
Close Shift
Owner
Login
↓
Management Interface
↓
Reports
↓
Analytics
Discrepancy
Expected
↓
Actual
↓
Mismatch
↓
Report
Offline
Offline
↓
Allowed operation
↓
Queued
↓
Reconnect
↓
Sync
Duplicate Submission

Verify critical operations cannot accidentally be submitted twice.

46. Completion Criteria
    ✓ Authentication integrated
    ✓ Owner interface works
    ✓ Worker interface works
    ✓ Role routing works
    ✓ Opening Shift works
    ✓ Opening verification works
    ✓ Discrepancy reporting works
    ✓ Active Shift works
    ✓ Payments work
    ✓ Expenses work
    ✓ Stock operations work
    ✓ Transfers work
    ✓ Closing works
    ✓ Shift closing works
    ✓ Reports work
    ✓ Analytics work
    ✓ Backend validation is respected
    ✓ Business isolation is respected
    ✓ Branch isolation is respected
    ✓ Offline behavior is safe
    ✓ Synchronization works
    ✓ Loading states work
    ✓ Error states work
    ✓ Success states work
    ✓ Mobile layout works
    ✓ Critical actions prevent duplicate submission
    ✓ Frontend builds successfully
    ✓ Production build works
    ✓ Full-system integration tests pass
47. Implementation Algorithm
    Step 1 — Establish Authentication
    User
    ↓
    Login
    ↓
    Authenticated
    ↓
    Owner / Worker
    Step 2 — Establish the Correct Reality
    Owner
    ↓
    Management Interface
    Worker
    ↓
    Operational Interface
    Step 3 — Build the Opening Reality
    Worker
    ↓
    Open Shift
    ↓
    Opening Stock
    ↓
    Verify / Report
    Step 4 — Transition Into Active Reality
    Opening Complete
    ↓
    ACTIVE SHIFT
    ↓
    Record Operations
    Step 5 — Build Operational Reality
    Active Shift
    │
    ├── Payments
    ├── Expenses
    ├── Stock
    ├── Transfers
    └── Discrepancies
    Step 6 — Transition Into Closing
    Operations Complete
    ↓
    CLOSING
    ↓
    Closing Stock
    Step 7 — Close Reality
    Closing Verified
    ↓
    Close Shift
    ↓
    Backend Calculates Result
    ↓
    Shift Closed
    Step 8 — Connect Management Reality
    Operational Records
    ↓
    Owner
    ↓
    Reports
    ↓
    Analytics
    Step 9 — Connect Offline Reality
    Network Available
    ↓
    Normal Operation
    Network Lost
    ↓
    Safe Local Operation
    ↓
    Queue
    ↓
    Reconnect
    ↓
    Synchronize
    ↓
    Server Confirmation
    Step 10 — Full-System Transition
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
    Shift Result
    ↓
    Owner Visibility
    ↓
    Reports
    ↓
    Analytics
    ↓
    Offline / Sync Verification
    ↓
    Deployment

Never proceed merely because the frontend compiles. The frontend is complete only when the entire business reality can pass through it end-to-end.
