AUTH_DESIGN_ARCHITECTURE.md

Static technical contract. AI agents translate this specification into software. They must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Auth capability controls who can enter the system and what each authenticated actor is allowed to do.

The system has exactly two actors:

Owner
Worker
User
↓
Authentication
↓
Identity established
↓
Authorization
↓
Allowed system actions

The Owner has management/admin authority. There is no separate Manager or Admin actor.

2. Requirements: Functional and Non-functional
   Functional Requirements

The module must:

Authenticate users.
Establish authenticated identity.
Identify whether the user is an Owner or Worker.
Protect authenticated endpoints.
Enforce role-based authorization.
Enforce Business ownership.
Enforce Branch access.
Prevent unauthorized operations.
Support secure session/token handling.
Reject invalid authentication.
Support logout/session termination where required.
Provide authenticated user context to backend modules.
Non-functional Requirements

The module must provide:

Secure authentication.
Deterministic authorization.
Business isolation.
Branch isolation.
Secure credential handling.
No client-controlled identity.
Reliable session behavior.
Clear authentication errors.
Mobile-friendly authentication.
No sensitive information leakage. 3. Actors
Owner

The Owner manages the system.

The Owner may:

Manage Business information.
Manage Branches.
Manage Products.
Manage stock configuration.
Review operational records.
Review discrepancies.
Review expenses.
Review transfers.
Review Mpesa records.
View reports.
View analytics.
Perform authorized management actions.
Worker

The Worker performs business operations.

The Worker may:

Start shifts.
Verify opening stock.
Report discrepancies.
Record operational activity.
Record payments.
Record expenses where permitted.
Record stock operations where permitted.
Record transfers where permitted.
Verify closing stock.
End shifts.
View operational information relevant to their work.

Workers must not obtain Owner-only management authority.

4. Actor Model
   User
   │
   ├── OWNER
   │
   └── WORKER

There is no:

MANAGER
ADMIN
SUPERVISOR

role in the application authorization model.

5. Module Dependencies
   Depends On
   User
   Business
   Branch
   Database
   Prisma
   Authentication configuration
   Existing application error handling
   Used By

Every protected backend module.

Auth
↓
Users
↓
Business
↓
Branches
↓
Products
↓
Shifts
↓
Inventory
↓
Operations
↓
Reports
↓
Analytics 6. Design Principles
Authentication establishes identity.
Authorization establishes permission.
The authenticated identity comes from the server-side authentication context.
Clients must never be trusted to declare their own role.
Clients must never be trusted to declare their own Business.
Clients must never be trusted to declare their own Branch access.
Owner authority must not be granted to Workers.
Business isolation is mandatory.
Branch isolation is mandatory.
Authentication must occur before protected operations.
Authorization must occur before protected data access.
Failed authorization must not reveal sensitive information. 7. Authentication Model
Credentials
↓
Authentication Verification
↓
Authenticated User
↓
Session / Token
↓
Protected Request

The exact authentication mechanism already implemented in the backend is authoritative.

Agents must not replace it without an explicit architectural change.

8. User Identity

Authenticated requests must resolve to a server-recognized User.

Conceptually:

Authenticated Request
↓
User ID
↓
User
↓
Role
↓
Business / Branch Scope

The backend must never use a client-supplied userId as the authoritative identity for protected actions.

9. Role Resolution

The user's role must come from the authenticated User record.

Authenticated User
↓
User.role
↓
OWNER / WORKER

The frontend may display role information.

The frontend must not determine authorization.

10. Authorization Model

Authorization has two primary dimensions:

Role

- Business / Branch Scope

Example:

OWNER
↓
Authorized Business
↓
Authorized Branches
WORKER
↓
Authorized Business
↓
Authorized Operational Branch 11. Owner Authorization

Owner access is Business-level management access.

The Owner must be able to access authorized Business records across its Branches.

Owner
↓
Business
├── Branch A
├── Branch B
└── Branch C

Owner access must still respect Business ownership.

12. Worker Authorization

Worker access must remain within the Worker’s authorized operational scope.

Worker
↓
Business
↓
Authorized Branch
↓
Operational Records

A Worker must not access another Business.

A Worker must not access unauthorized Branch data.

13. Business Isolation

Every protected query must enforce Business ownership.

Incorrect:

GET /products/:id
↓
Find product by ID

Correct:

Authenticated User
↓
Business Scope
↓
Product

A valid record ID must never be sufficient to cross Business boundaries.

14. Branch Isolation

Where records are Branch-specific:

Authenticated User
↓
Authorized Branch
↓
Record

The backend must verify Branch ownership through the relevant Business relationship.

15. Frontend Trust Boundary

The frontend is an untrusted client.

The frontend may send:

Request
Filters
Form Data

The frontend must not be treated as authoritative for:

User ID
Role
Business ID
Branch authorization
Permissions

The backend remains authoritative.

16. Authentication Endpoints

The authentication API must expose the endpoints already defined by the backend implementation.

Typical contract:

POST /auth/login
POST /auth/logout
GET /auth/me

Exact paths and response shapes must follow the existing backend implementation.

Agents must not invent competing endpoints.

17. Login

Conceptual flow:

User enters credentials
↓
Frontend sends credentials
↓
Backend validates credentials
↓
Identity established
↓
Authentication session/token created
↓
Frontend receives authenticated state
↓
User enters system

Invalid credentials:

Credentials
↓
Authentication failure
↓
Reject

Do not reveal whether a particular credential component was correct.

18. Current User

The frontend must be able to establish the current authenticated user.

Conceptually:

Authenticated Session
↓
GET current user
↓
User
├── id
├── name
├── role
├── Business scope
└── Branch scope where applicable

The frontend must use this information to construct the appropriate interface.

Authorization still occurs on the backend.

19. Logout

Logout must invalidate or terminate the authenticated session according to the existing authentication mechanism.

After logout:

Authenticated Request
↓
Rejected

The frontend must clear its authenticated application state.

20. Session / Token Handling

The exact mechanism already implemented by the backend is authoritative.

Requirements:

Do not expose secrets unnecessarily.
Do not store credentials in unsafe client storage.
Do not place authentication secrets in source code.
Do not allow clients to modify authentication claims.
Expired authentication must be rejected. 21. Password Handling

If password authentication is used:

Passwords must never be stored in plaintext.
Password verification must occur server-side.
Password hashes must never be returned to the frontend.
Authentication responses must not expose password information.

The existing backend password hashing mechanism is authoritative.

22. Authorization Enforcement

Authorization must occur at the backend boundary.

Request
↓
Authentication
↓
Authorization
↓
Validation
↓
Business Operation

Never:

Request
↓
Business Operation
↓
Authorization 23. Resource Ownership

For any protected resource:

Resource
↓
Business
↓
User Business Scope

must be verified.

For Branch resources:

Resource
↓
Branch
↓
Business
↓
User Business Scope

must be verified.

24. Role-Protected Operations

Owner-only operations must explicitly enforce:

role === OWNER

Worker operations must explicitly enforce the Worker authorization rules.

Do not infer permissions from frontend route visibility.

25. Authentication State in Frontend

The frontend must maintain:

Unauthenticated
Authenticated
Authentication Loading

At minimum.

Conceptually:

App starts
↓
Check authentication
├── Not authenticated → Login
└── Authenticated → Load system

The frontend must not briefly expose protected screens before authentication is resolved.

26. Role-Based Frontend Routing

The frontend may route users according to role.

OWNER
↓
Owner interface
WORKER
↓
Worker interface

But route protection is only a UX layer.

The backend remains the authorization authority.

27. Unauthorized Requests

If authentication is missing:

401 Unauthorized

If authentication exists but permission is insufficient:

403 Forbidden

Use the application's established error format.

28. Authentication Failure

Authentication failure must:

Reject access.
Avoid exposing sensitive details.
Return the established authentication error.
Not reveal database internals.
Not reveal whether an account exists where security policy prohibits it. 29. Security Requirements

The implementation must protect against:

Unauthorized access.
Cross-Business access.
Cross-Branch access.
Role escalation.
User impersonation.
Token/session tampering.
Credential exposure.
IDOR-style resource access.
Sensitive error leakage. 30. Database Access Rules

Authentication-related queries must use the existing Prisma/database layer.

User lookup must be scoped appropriately.

Example:

Authenticated User
↓
User record
↓
Business / Branch relationship

Do not create a second User identity system.

31. API Response Rules

Authentication responses must contain only information required by the frontend.

Safe example:

{
"user": {
"id": "user-id",
"name": "John",
"role": "WORKER"
}
}

Never return:

password
passwordHash
authentication secrets
private tokens
internal security configuration

unless the established authentication protocol explicitly requires a token response.

32. Error Handling

Handle:

Invalid credentials
Missing credentials
Expired session
Invalid session
Unauthenticated request
Forbidden operation
Invalid authentication state
Database authentication failure

Use the established application error response format.

33. Performance

Authentication must:

Resolve quickly.
Avoid unnecessary database queries.
Avoid repeated user lookups where safe.
Avoid blocking operational requests.
Work reliably on mobile connections. 34. Tools
Primary
NestJS
TypeScript
Prisma
PostgreSQL
Existing authentication library/mechanism
Existing validation mechanism
Jest
Alternatives

Authentication alternatives may only replace the current mechanism through an explicit architectural decision.

Possible alternatives include:

Primary Alternative
Existing session/token mechanism JWT
Existing password hashing Argon2
Existing password hashing bcrypt
Existing validation Zod / class-validator

Agents must not switch authentication mechanisms automatically.

35. Testing Requirements
    Login Success
    Valid credentials
    ↓
    Authenticated
    ↓
    User enters system
    Login Failure
    Invalid credentials
    ↓
    Rejected
    ↓
    No authenticated state
    Current User

Verify authenticated requests resolve the correct User.

Logout
Login
↓
Logout
↓
Protected request
↓
Rejected
Owner Authorization

Owner can perform authorized management operations.

Worker Authorization

Worker can perform authorized operational actions.

Worker → Owner Restriction
Worker
↓
Owner-only operation
↓
403 Forbidden
Business Isolation
Business A User
↓
Business B Resource
↓
Rejected
Branch Isolation
Worker Branch A
↓
Branch B Resource
↓
Rejected
User Impersonation

Attempt:

Request
userId = another-user

Expected:

Backend continues using authenticated identity.
Role Tampering

Attempt to modify role from frontend.

Expected:

Backend ignores client role.
Expired Authentication
Expired session/token
↓
Protected request
↓
Rejected 36. Completion Criteria
✓ Login works
✓ Logout works
✓ Current-user resolution works
✓ Authentication state works
✓ Owner role works
✓ Worker role works
✓ Owner-only operations are protected
✓ Worker restrictions are enforced
✓ Business isolation works
✓ Branch isolation works
✓ Client cannot impersonate another user
✓ Client cannot elevate role
✓ Credentials are securely handled
✓ Sessions/tokens are securely handled
✓ Unauthorized requests are rejected
✓ Error handling works
✓ Mobile authentication works reliably
✓ Tests pass
✓ Application builds 37. Implementation Algorithm
Step 1 — Establish Identity
User
↓
Credentials
↓
Authenticated Identity
Step 2 — Establish Session
Authenticated Identity
↓
Session / Token
↓
Authenticated Application
Step 3 — Establish Actor
Authenticated User
↓
OWNER / WORKER
Step 4 — Establish Scope
Authenticated User
↓
Business
↓
Authorized Branches
Step 5 — Protect the System
Request
↓
Authentication
↓
Authorization
↓
Business Operation
Step 6 — Connect Owner Reality
Owner
↓
Management Interface
↓
Business / Branch Information
↓
Authorized Management Actions
Step 7 — Connect Worker Reality
Worker
↓
Operational Interface
↓
Authorized Branch
↓
Business Operations
Step 8 — Verify Isolation
Business A
↓
Own Data

Business B
↓
Own Data

No Cross-Business Access
Step 9 — Verify Complete Authentication Reality
User
↓
Identity
↓
Actor
↓
Business Scope
↓
Branch Scope
↓
Authorized Actions
↓
Business System
Step 10 — Transition
Authentication verified
↓
Authorization verified
↓
Owner access verified
↓
Worker access verified
↓
Business isolation verified
↓
Branch isolation verified
↓
Frontend authentication state verified
↓
Next capability

Never proceed merely because Auth compiles.
