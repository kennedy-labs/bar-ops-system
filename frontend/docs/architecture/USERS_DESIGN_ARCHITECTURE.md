USERS_DESIGN_ARCHITECTURE.md

Static technical contract for the Users capability.

The AI agent must translate this specification into working software.
It must not redesign, reinterpret, or invent business behavior.

Only the Implementation Algorithm is dynamic.

1. Purpose

The Users capability represents the people who interact with the system.

The system has exactly two actors:

OWNER
WORKER

The Users capability is responsible for:

User identity
User information
User role
Business ownership
Branch association required for operations
User creation and management
User retrieval
User updates
User authorization context

The Users capability does not manage:

Authentication mechanisms
Shifts
Inventory
Products
Payments
Expenses
Transfers
Reports

Those capabilities remain in their respective modules.

2. Requirements: Functional and Non-functional
   Functional Requirements

The system must:

Create users.
Retrieve users.
Retrieve individual users.
Update permitted user information.
Assign users to a Business.
Identify users as OWNER or WORKER.
Allow Owners to manage Workers.
Associate Workers with the Branches where they operate.
Provide the authenticated user's identity to dependent capabilities.
Prevent users from belonging to another Business.
Prevent unauthorized users from managing other users.
Preserve user identity across operational records.
Non-functional Requirements

The Users capability must provide:

Strict Business isolation.
Deterministic authorization.
Stable user identity.
Referential integrity.
Secure handling of user information.
Reliable persistence.
Consistent validation.
Consistent error responses.
Efficient user retrieval.
No duplicate user ownership relationships.
Predictable behavior across all dependent modules. 3. Dependencies
Depends On
Business
Branch
Authentication / Authorization
Prisma
PostgreSQL
Used By
Authentication
Shifts
Shift Stock Items
Inventory operations
Stock Movements
Transfers
Expenses
Discrepancies
Reports
Analytics

Users provide the identity required to establish who performed an operation.

4. Design Principles
   Every user belongs to exactly one Business.
   A user has exactly one system role.
   The only roles are OWNER and WORKER.
   The Owner is the management/admin authority.
   Workers perform operational activities.
   Authorization is enforced by the backend.
   Frontend role hiding is not security.
   Client-provided ownership must never override authenticated ownership.
   Cross-Business user access must be rejected.
   User identity must remain stable.
   Historical operational records must retain the identity of the user who performed them.
   User management must not become an operational module.
   Authentication credentials must not be mixed with ordinary user profile information unless required by the authentication architecture.
5. Actors
   OWNER

The Owner:

Manages the Business.
Manages Workers.
Manages Business-related information.
Views management information.
Performs authorized management actions.
Can access business-wide information.
WORKER

The Worker:

Performs business operations.
Records operational data.
Performs assigned shift activities.
Views information relevant to their work.
Must not manage the Business.

Role structure:

User
│
├── OWNER
│
└── WORKER

Do not introduce:

ADMIN
MANAGER
SUPERVISOR
CASHIER

unless the project explicitly changes its actor model.

6. Architecture
   Business
   │
   └── Users
   │
   ├── OWNER
   │
   └── WORKER
   │
   └── Branch assignment

Operational attribution:

Worker
↓
Operational action
↓
System record
↓
User identity preserved

Management:

Owner
↓
Management action
↓
System 7. Module Skeleton
Users
│
├── User Identity
│
├── User Information
│
├── Role
│ ├── OWNER
│ └── WORKER
│
├── Business Ownership
│
├── Branch Association
│
├── API
│ ├── Create
│ ├── List
│ ├── Retrieve
│ └── Update
│
├── Validation
│
├── Authorization
│
└── Persistence
└── Prisma 8. File Structure
backend/
├── src/
│ └── users/
│ ├── users.module.ts
│ ├── users.controller.ts
│ ├── users.service.ts
│ │
│ ├── dto/
│ │ ├── create-user.dto.ts
│ │ └── update-user.dto.ts
│ │
│ └── entities/
│ └── user.entity.ts
│
└── prisma/
└── schema.prisma

If the existing project uses a repository layer, mapper layer, or another established convention, preserve that convention consistently.

Do not create competing architectural patterns.

9. Entity Design
   User

Required fields:

id
businessId
name
role
createdAt
updatedAt

Where required by the existing authentication design, authentication-related identity information may be associated with the User.

Branch association must follow the established Branch/User relationship.

Field Requirements
Field Requirement
id Stable unique identifier
businessId Required Business ownership
name Required
role Required
createdAt Automatically generated
updatedAt Automatically maintained 10. Role Design

The role must be represented as an enum.

enum UserRole {
OWNER
WORKER
}

No third role is permitted.

Role controls authorization behavior.

It must not be treated merely as a frontend display value.

11. Prisma Design

The core model must follow the project's established Prisma schema.

Example:

enum UserRole {
OWNER
WORKER
}

model User {
id String @id @default(cuid())

businessId String
business Business @relation(fields: [businessId], references: [id])

name String
role UserRole @default(WORKER)

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([businessId])
}

The exact relation fields must match the existing Prisma architecture.

Do not create duplicate relations between User, Business, or Branch.

12. Database Constraints

The database must enforce:

Unique User ID.
Required Business ownership.
Valid Business foreign key.
Valid User role.
Required User name.
Referential integrity.

A User must never exist without valid Business ownership.

13. Business Ownership

Every User belongs to exactly one Business.

Business A
│
├── Owner
├── Worker 1
└── Worker 2

A user from Business A must never access or operate on behalf of Business B.

Ownership must be enforced in queries and mutations.

Never rely solely on:

userId

to establish authorization.

Authorization must establish:

Authenticated User
↓
Authenticated Business
↓
Requested Resource 14. Branch Association

Workers operate at physical Branches.

The User capability must support the project's established Branch association model.

Conceptually:

Business
↓
Branch
↓
Worker

If the system permits a Worker to operate at multiple Branches, that relationship must be explicitly represented.

If Workers are restricted to one Branch, that restriction must be enforced consistently.

Do not infer Branch membership from frontend state.

15. API Contract
    Create User
    POST /users

Owner-only management operation.

Example:

{
"name": "John",
"role": "WORKER"
}

The Business ownership must come from authorized Business context.

The client must not be allowed to assign the user to another Business.

Get Users
GET /users

Returns users belonging to the authorized Business.

Owner access is required for full user-management access.

Workers may only receive the user information required by their operational responsibilities.

Get User
GET /users/:id

Returns the requested User only if the User belongs to the authorized Business.

Update User
PATCH /users/:id

Updates permitted User information.

Protected identity and ownership fields must not be modified through ordinary profile updates.

16. API Response Requirements

User responses must return only information required by the requesting actor.

Example:

{
"id": "user-id",
"businessId": "business-id",
"name": "John",
"role": "WORKER",
"createdAt": "timestamp",
"updatedAt": "timestamp"
}

Never expose:

Password hashes
Authentication secrets
Session secrets
Tokens
Internal credentials

through ordinary User endpoints.

17. API Error Behavior

The Users API must handle:

Invalid input
Unauthorized request
Forbidden request
User not found
Business not found
Branch not found
Cross-Business access
Invalid role
Database failure

The API must use the project's standardized error-response format.

Raw database errors must never be returned directly.

18. Validation
    Create User

Validate:

Name exists.
Name is not blank.
Role is one of:
OWNER
WORKER
Business ownership is valid.
Branch association is valid where applicable.
Update User

Only editable fields may be modified.

Reject attempts to modify protected ownership fields through ordinary updates.

Role changes must be explicitly authorized.

19. Authorization
    OWNER

The Owner may:

View users.
Create Workers.
Update permitted Worker information.
Manage Worker operational access.
Perform other user-management operations explicitly permitted by the system.

The Owner must not accidentally lose their own management authority through an ordinary Worker-management operation.

WORKER

Workers must not:

Create users.
Create Owners.
Modify Business ownership.
Modify another user's role.
Modify another user's authorization.
Access another Business's users.

Workers may access limited user information required for operations.

20. Owner Protection

The system must preserve the existence of an authorized Owner.

Do not allow ordinary Worker-management actions to accidentally create a Business with no authorized Owner.

Operations that could remove or disable the final Owner must be explicitly protected.

If Owner removal is supported later, the system must require a deliberate, authorized process.

21. Security Requirements

The implementation must:

Authenticate requests.
Authorize user-management operations.
Enforce Business ownership.
Prevent cross-Business access.
Validate role values.
Protect authentication credentials.
Avoid exposing secrets through User endpoints.
Prevent Workers from escalating privileges.
Prevent client-controlled role escalation.
Prevent client-controlled Business reassignment.

The backend is the final authority.

22. User Identity and Operational Records

When a Worker performs an operation, the resulting record must preserve the responsible User identity where the underlying operational capability requires attribution.

Example:

Worker
↓
Records stock movement
↓
Stock Movement
↓
performedBy / user relationship

Similarly:

Worker
↓
Records expense
↓
Expense
↓
Responsible User

The exact field names belong to the operational modules.

The Users capability provides the identity.

It does not own the operational record.

23. Authentication Boundary

Authentication answers:

Who is this person?

Users answers:

Which system user is this person, which Business do they belong to, and what role do they have?

Authorization answers:

What may this user do?

These responsibilities must not be mixed.

Authentication
↓
Identify User
↓
Users
↓
Business + Role
↓
Authorization
↓
Operation 24. Performance and Reliability

The Users capability must:

Index businessId.
Use efficient User ID lookups.
Avoid loading unnecessary operational relationships.
Avoid N+1 queries.
Return only required fields.
Preserve database consistency.
Fail safely when dependent systems are unavailable.

User lists must remain efficient as the Business grows.

25. Tools
    Primary
    NestJS
    TypeScript
    Prisma
    PostgreSQL
    Existing project validation mechanism
    Jest
    Alternatives
    Primary Alternative
    Prisma PostgreSQL driver/query layer
    Jest Vitest
    Existing validation mechanism Zod / class-validator

Alternatives must preserve the same:

Authorization behavior
API contract
Database constraints
Business isolation
Validation
Test behavior

Do not replace tools merely for preference.

26. Testing Requirements
    User Creation

Verify:

Owner
↓
Create Worker
↓
Worker belongs to correct Business

Invalid role values must be rejected.

User Retrieval

Verify:

Business A
↓
Users A

cannot retrieve:

Business B
↓
Users B
Role Enforcement

Verify:

OWNER → user management = allowed
WORKER → user management = rejected

Verify that a Worker cannot escalate their own role.

Business Isolation

Create:

Business A
├── Owner A
└── Worker A

Business B
├── Owner B
└── Worker B

Verify:

Owner A → Worker A = allowed
Owner A → Worker B = rejected

Owner B → Worker B = allowed
Owner B → Worker A = rejected
Operational Attribution

Verify that an authenticated Worker can perform an authorized operational action and that the resulting record can identify the responsible User where required.

27. Completion Criteria

The Users capability is complete when:

✓ User can be created
✓ User can be retrieved
✓ Users can be listed
✓ User can be updated
✓ OWNER and WORKER are the only roles
✓ Business ownership is enforced
✓ Branch association works
✓ Owner permissions work
✓ Worker restrictions work
✓ Privilege escalation is prevented
✓ Cross-Business access is rejected
✓ Authentication boundary works
✓ Operational attribution works
✓ Validation works
✓ Database constraints work
✓ Error handling works
✓ Tests pass
✓ Application builds 28. Implementation Algorithm

This is the only dynamic section.

Follow the steps in order.
Every transition must be explicitly verified before continuing.

Step 1 — Establish User Persistence

Create the User representation.

Business
↓
User
↓
Database

Verify that a User can be persisted with valid Business ownership.

Step 2 — Establish User Identity

Connect User retrieval to the existing authentication identity.

Authenticated person
↓
System User
↓
Business
↓
Role

Verify that the authenticated identity resolves to the correct User.

Step 3 — Establish Roles

Implement exactly:

OWNER
WORKER

Verify that role information is available to authorization.

Step 4 — Establish Owner Management

Connect Owner access to User management.

Owner
↓
Users
↓
Create / View / Update Worker

Verify Owner permissions.

Step 5 — Establish Worker Identity

Connect Worker identity to operational access.

Worker
↓
Business
↓
Branch
↓
Operational capability

Verify that the Worker can be recognized by dependent modules.

Step 6 — Establish Business Isolation

Test multiple Businesses.

Business A
↓
Users A

Business B
↓
Users B

Verify that neither Business can access the other's Users.

Step 7 — Establish Operational Attribution

Connect User identity to an operational action.

Worker
↓
Operational action
↓
Record
↓
Responsible User

Verify that the transition preserves the responsible User identity.

Step 8 — Verify the Complete User Boundary

Run:

Create User
↓
Authenticate User
↓
Resolve Business
↓
Resolve Role
↓
Authorize
↓
Perform operation
↓
Record responsible User

Verify the complete chain.

Step 9 — Transition to the Next Capability

Only after User identity, role, Business ownership, authorization, and operational attribution are verified:

Users built
↓
Users verified
↓
Business → User ownership verified
↓
Role → authorization verified
↓
User → operation attribution verified
↓
Users becomes available to dependent capabilities
↓
Next implementation step

Never proceed merely because the User module compiles.
