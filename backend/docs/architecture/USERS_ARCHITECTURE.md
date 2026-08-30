# 1. Purpose

The User module defines the people who operate the system.

A User performs operational actions such as opening shifts, recording stock movements, confirming transfers, recording expenses, and reconciling operations.

Every User belongs to exactly one Business and is assigned to one Branch.

---

# 2. Module Responsibility

The User module is responsible for:

- Creating users
- Managing user information
- Managing user roles
- Assigning users to branches
- Providing user identity for operational ownership

The User module is **not responsible** for:

- Authentication
- Authorization policies
- Branch management
- Product management
- Inventory management
- Shift calculations
- Stock reconciliation
- Profit calculations
- Reporting

These responsibilities belong to their respective modules.

---

# 3. Module Dependencies

## Depends On

- Business Module
- Branch Module
- Prisma
- Database

A User cannot exist without a Business and a Branch.

## Used By

The User module is used by:

- Shift Module
- Stock Movement Module
- Transfer Module
- Expense Module
- Mpesa Module
- Discrepancy Module
- Reports Module

Every operational action is attributed to a User.

---

# 4. Design Principles

The User module follows these principles:

- Every User belongs to one Business.
- Every User belongs to one Branch.
- Users represent operational ownership.
- Users perform actions but do not own business workflows.
- User identity must remain stable for audit history.
- Operational records reference Users instead of duplicating user information.
- Historical records must remain attributable even if user details change.

---

# 5. Module Skeleton

```
User
│
├── Identity
│   ├── Name
│   ├── Phone
│   ├── Email
│   └── Status
│
├── Organization
│   ├── Business
│   └── Branch
│
├── Role
│   ├── Worker
│   └── Owner
│
└── Operational Ownership
    ├── Shifts
    ├── Stock Movements
    ├── Transfers
    ├── Expenses
    ├── Mpesa Activities
    └── Discrepancies
```
# 6. File Structure

```
backend/
├── src/
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       │
│       ├── dto/
│       │   ├── create-user.dto.ts
│       │   └── update-user.dto.ts
│       │
│       └── entities/
│           └── user.entity.ts
│
└── prisma/
    └── schema.prisma
```

---

# 7. Entity Design

## User

### Fields

- id
- businessId
- branchId
- name
- phone
- email
- role
- status
- createdAt
- updatedAt

### Relationships

User belongs to:

- Business
- Branch

User participates in:

- Shift[]
- StockMovement[]
- Transfer[]
- Expense[]
- MpesaTransaction[]
- Discrepancy[]

---

# 8. API Design

## Endpoints

### Create User

```
POST /users
```

Creates a new User.

---

### Get All Users

```
GET /users
```

Returns all Users.

---

### Get User

```
GET /users/:id
```

Returns a single User.

---

### Update User

```
PATCH /users/:id
```

Updates editable User information.

---

### Delete User

```
DELETE /users/:id
```

Removes (or soft deletes) a User.

---

# 9. Workflow

```
Business exists
        │
        ▼
Branch exists
        │
        ▼
Create User
        │
        ▼
Assign Role
        │
        ▼
Assign Branch
        │
        ▼
User performs operational activities
        │
        ├── Opens Shifts
        ├── Records Stock Movements
        ├── Confirms Transfers
        ├── Records Expenses
        ├── Performs Mpesa Operations
        └── Creates Operational History
```

---

# 10. Integration Points

The User module integrates with:

- Business Module
- Branch Module
- Shift Module
- Stock Movement Module
- Transfer Module
- Expense Module
- Mpesa Module
- Discrepancy Module
- Reports Module

Every operational event in the system is attributable to a User.

# 11. Business Rules

- Every User belongs to exactly one Business.
- Every User is assigned to exactly one Branch.
- Every operational action must be attributable to one User.
- A User's role determines the operations they are allowed to perform.
- Historical operational records must remain linked to the User who performed them.
- Users may participate in multiple operational modules throughout the system.
- User ownership of historical records must never be lost.

---

# 12. Implementation Order

1. Create User Prisma model.
2. Add Business → User relationship.
3. Add Branch → User relationship.
4. Generate User migration.
5. Generate Users module.
6. Create DTOs.
7. Implement service.
8. Implement controller.
9. Add validation rules.
10. Test CRUD operations.
11. Verify User module before implementing Products.

---

# 13. Validation Rules

## User Creation

Validate:

- Business exists.
- Branch exists.
- Name is required.
- Role is valid.
- Email format is valid (if provided).
- Phone format is valid (if provided).

## User Updates

Allowed:

- Update profile information.
- Change assigned Branch.
- Change role.
- Activate or deactivate User.

Restricted:

- Changing Business ownership.
- Deleting Users with protected operational history.

## Data Integrity

- Every User references an existing Business.
- Every User references an existing Branch.
- User ID remains stable.
- Operational modules reference existing Users only.

---

# 14. Database Design

## Prisma Model

```prisma
model User {
  id String @id @default(cuid())

  businessId String
  business Business @relation(fields: [businessId], references: [id])

  branchId String
  branch Branch @relation(fields: [branchId], references: [id])

  name String

  phone String?
  email String?

  role UserRole
  status UserStatus

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Database Principles

- User is the operational identity.
- Operational modules reference User.
- User stores identity information only.
- Historical operational records remain attributable to the original User.

---

# 15. Testing Requirements

## Unit Tests

- Create User.
- Update User.
- Reject invalid Business references.
- Reject invalid Branch references.

## Integration Tests

- User belongs to Business.
- User belongs to Branch.
- Relationships load correctly.

## API Tests

Verify:

- POST /users
- GET /users
- GET /users/:id
- PATCH /users/:id
- DELETE /users/:id

---

# 16. Out of Scope

The User module does not:

- Authenticate users.
- Issue tokens.
- Manage passwords.
- Manage inventory.
- Execute shifts.
- Process transfers.
- Handle Mpesa reconciliation.
- Calculate profit.
- Detect discrepancies.
- Generate reports.

---

# 17. Possible Future Features

- Profile photos.
- Employee numbers.
- Multiple branch assignments.
- Permissions system.
- Activity history.
- Employment status.
- Emergency contacts.
- Notification preferences.

---

# 18. Completion Criteria

The User module is complete when:

- User entity exists.
- Business and Branch relationships are implemented.
- CRUD operations work.
- Validation is implemented.
- Tests pass.
- Operational modules can reference Users successfully.

---

# 19. Summary

The User module establishes the operational identity of the Bar Operations Reconciliation & Profit System.

It provides:

- User identity.
- Organizational assignment.
- Operational ownership.
- User attribution for every operational event.
