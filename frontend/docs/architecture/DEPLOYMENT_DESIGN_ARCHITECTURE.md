DEPLOYMENT_DESIGN_ARCHITECTURE.md

Static technical contract. AI agents translate this specification into a deployable system. They must not redesign the architecture or invent infrastructure requirements.

Deployment technology is an implementation answer to the business requirements already defined.

1. Purpose

Deployment makes the completed system available for real business operation.

Completed System
↓
Production Environment
↓
Owner + Workers
↓
Real Business

Deployment must preserve:

Data integrity.
Security.
Availability.
Business isolation.
Operational continuity.
Backup/recovery capability.
Mobile accessibility. 2. Deployment Target

The system must be deployed as a production web application accessible from mobile devices.

Worker Phone
│
Owner Phone
│
▼
Internet
│
▼
Production Frontend
│
▼
Production Backend
│
▼
Production Database

The architecture must prioritize reliable, low-cost infrastructure.

3. Infrastructure Principles

The deployment must:

Prefer reliable free/low-cost resources.
Avoid unnecessary infrastructure.
Avoid infrastructure that requires manual administration where possible.
Support HTTPS.
Protect secrets.
Support database backups.
Support application rollback.
Support monitoring.
Support future scaling.
Avoid vendor lock-in where practical.

Reliability takes priority over saving a small amount of money.

4. Production Architecture
   Internet
   │
   ▼
   HTTPS / TLS
   │
   ┌────────┴────────┐
   ▼ ▼
   Frontend Backend API
   │ │
   └────────┬────────┘
   ▼
   PostgreSQL
   │
   Persistent Data

The frontend must never connect directly to PostgreSQL.

5. Recommended Deployment Model

Use managed hosting wherever practical.

Frontend
→ Managed Web Hosting

Backend
→ Managed Application Hosting

Database
→ Managed PostgreSQL

Domain
→ Managed DNS

TLS
→ Managed HTTPS

The exact provider may change according to pricing, availability, reliability, and project requirements.

The architecture must remain portable.

6. Frontend Deployment

The frontend must be deployed as a production Next.js application.

Requirements:

Production build must succeed.
Environment variables must be configured correctly.
Backend API URL must be production-specific.
HTTPS must be enabled.
Development secrets must never be exposed.
Error pages must not expose internal details.

Expected:

User opens production URL
↓
Frontend loads
↓
Authentication
↓
System 7. Backend Deployment

The NestJS backend must run as a production application.

Requirements:

Production build must succeed.
Database connection must use production credentials.
Secrets must come from environment configuration.
Development-only settings must be disabled.
API must be accessible through HTTPS.
Health monitoring must be possible.
Logs must be available.

Expected:

Frontend
↓
HTTPS
↓
Backend API
↓
Database 8. Database Deployment

PostgreSQL must use managed persistent storage where practical.

Requirements:

Persistent database.
Automated backups where available.
Secure credentials.
Encrypted connections.
Migration support.
Recovery procedure.
No development database in production.

The database is the authoritative persistent system state.

9. Database Migration

Production schema changes must use controlled migrations.

Development Schema
↓
Migration
↓
Test
↓
Production Migration

Never modify production schema manually without a controlled migration process.

10. Environment Separation

At minimum:

Development
Testing
Production

Each environment must have separate:

Database.
Secrets.
API configuration.
Authentication configuration.

Production data must never be casually used in development.

11. Environment Variables

Sensitive configuration must use environment variables.

Examples:

DATABASE_URL
AUTH_SECRET
API_URL
FRONTEND_URL
MPESA credentials
Other provider credentials

Never commit production secrets to Git.

Never place server secrets in frontend source code.

12. Secrets Management

Secrets must:

Exist only in secure environment configuration.
Never be committed to the repository.
Never appear in frontend bundles.
Never appear in logs.
Be rotated when compromised.
Be separated by environment. 13. Domain

The production system should use a stable domain.

Conceptually:

app.example.com
api.example.com

or an equivalent architecture.

The exact domain structure may be chosen during deployment implementation.

14. HTTPS

All production communication must use HTTPS.

HTTP
↓
Redirect / Reject
↓
HTTPS

No production credentials or business data may be transmitted over unsecured HTTP.

15. CORS

Backend CORS must permit only authorized frontend origins.

Development:

localhost

Production:

Production frontend domain

Do not use unrestricted production CORS.

16. Authentication in Production

Production authentication must:

Use production secrets.
Use secure cookies/tokens according to the existing authentication architecture.
Enforce HTTPS.
Reject expired authentication.
Preserve Owner/Worker authorization.
Preserve Business isolation.
Preserve Branch isolation. 17. API Configuration

The frontend must use the production API URL.

Frontend
↓
Production API URL
↓
Backend

The production URL must not accidentally point to:

localhost
development API
testing API 18. Mpesa Production Integration

Mpesa must have separate environments where supported:

Mpesa Sandbox
↓
Integration Testing

then:

Mpesa Production
↓
Real Transactions

Production credentials must never be placed in development.

Before enabling real transactions, verify:

Callback configuration.
Credentials.
Account configuration.
Transaction processing.
Duplicate protection.
Reconciliation.
Failure handling. 19. Deployment Pipeline

The deployment process should follow:

Code
↓
Git
↓
Tests
↓
Build
↓
Production Configuration
↓
Deploy
↓
Health Check
↓
Smoke Test
↓
Live System

Automatic deployment may be used where reliable.

20. Git Strategy

Production deployment must originate from a known Git commit.

Example:

main
↓
Verified Commit
↓
Production Deployment

Never deploy unknown local modifications.

21. Build Verification

Before deployment:

Backend
✓ Tests
✓ Build

Frontend
✓ Tests
✓ Build

Database
✓ Migration verified

Failure at any critical stage blocks deployment.

22. Health Checks

The backend must expose a health mechanism.

Example:

GET /health

Expected:

{
"status": "ok"
}

The exact response follows the existing backend implementation.

Health checks must confirm the application is alive.

Where appropriate, database connectivity must also be verified.

23. Logging

Production logs must provide enough information to diagnose failures.

Logs may contain:

Request failures.
Application errors.
Authentication failures.
Database errors.
Integration failures.
Mpesa processing failures.
Synchronization failures.

Logs must not contain:

Passwords.
Authentication secrets.
API secrets.
Sensitive payment credentials. 24. Monitoring

Monitor at minimum:

Frontend availability
Backend availability
Database availability
API errors
Database errors
Mpesa failures
Application crashes

Where supported, use managed monitoring before introducing custom infrastructure.

25. Error Monitoring

Production errors should be captured centrally where practical.

The system must allow developers to identify:

What failed
Where it failed
When it failed
Which operation failed

without exposing sensitive user data.

26. Database Backups

Production database backups are mandatory.

The deployment must provide:

Automated backups where possible.
Retention policy.
Recovery procedure.
Backup verification.

A backup that has never been tested for restoration is not considered sufficient.

27. Recovery

Recovery must be possible after:

Database failure
Application failure
Deployment failure
Configuration failure
Provider outage

Recovery procedure:

Failure
↓
Identify
↓
Restore / Rollback
↓
Verify
↓
Resume Operations 28. Rollback

Application deployment must support rollback to the previous known-good version.

Current Version
↓
Failure
↓
Previous Known-Good Version
↓
Rollback

Database migrations must be designed carefully because application rollback cannot automatically imply database rollback.

29. Database Migration Safety

Before production migration:

Backup
↓
Migration tested
↓
Production migration
↓
Verification

Destructive migrations require explicit verification before execution.

30. Availability

The system should remain available during normal business operation.

The deployment must minimize:

Unnecessary downtime.
Manual restarts.
Infrastructure maintenance.
Single points of failure where affordable. 31. Mobile Network Reality

The system must assume Workers may have:

Slow Internet
Intermittent Internet
Temporary Offline State
Limited Data

Deployment must therefore keep:

API payloads reasonable.
Frontend bundles reasonable.
Requests efficient.
Timeouts appropriate.
Retry behavior safe. 32. Offline Compatibility

Deployment must not invalidate the frontend's offline capabilities.

Production API unavailable
↓
Frontend detects failure
↓
Safe local behavior
↓
Reconnect
↓
Synchronization

The system must never assume permanent connectivity.

33. Security

Production deployment must enforce:

HTTPS.
Secure authentication.
Secure secrets.
Restricted database access.
Restricted CORS.
Environment separation.
Dependency updates.
Secure error responses.
Business isolation.
Branch isolation. 34. Database Network Security

Where supported:

Internet
✗
Direct PostgreSQL access

Backend
✓
PostgreSQL access

The database should not be publicly accessible unless explicitly required by the chosen provider architecture.

35. Dependency Management

Production dependencies must:

Be committed through package manifests/lockfiles.
Have reproducible versions.
Be reviewed before major upgrades.
Be checked for known security vulnerabilities.

Do not upgrade major dependencies immediately before deployment without testing.

36. Cost Control

The initial deployment should prioritize:

Free
↓
Reliable low-cost
↓
Paid scaling when necessary

Do not introduce paid infrastructure simply because it is technically available.

However:

Cost reduction must never compromise database persistence, security, or operational reliability.

37. Vendor Failure Strategy

The architecture must avoid unnecessary dependence on one provider.

Critical data must remain portable.

Primary portable assets:

Source Code
Database
Environment Configuration
Domain
Backups

If a hosting provider becomes unavailable, the application should be redeployable elsewhere.

38. Production Configuration Checklist

Before deployment:

✓ Production frontend URL
✓ Production backend URL
✓ Production database
✓ Database credentials
✓ Authentication secret
✓ CORS configuration
✓ HTTPS
✓ Mpesa configuration
✓ Environment variables
✓ Database migration
✓ Backups
✓ Health check
✓ Logging
✓ Error monitoring 39. Smoke Testing

Immediately after deployment:

Open Application
↓
Login Owner
↓
Login Worker
↓
Verify Business
↓
Verify Branch
↓
Start Test Shift
↓
Verify Opening
↓
Perform safe test operation
↓
Close test operation
↓
Verify Owner visibility

Production smoke tests must avoid corrupting real business records.

Use a controlled production verification strategy.

40. Production Business Verification

After technical smoke testing:

Owner
↓
Production System
↓
Business State
↓
Verify

Confirm:

Correct Business.
Correct Branches.
Correct Users.
Correct Products.
Correct inventory.
Correct authentication.
Correct permissions. 41. Deployment Failure Rules

If deployment fails:

STOP
↓
Do not continue adding changes
↓
Identify failure
↓
Rollback / Fix
↓
Retest

Do not stack unrelated changes onto a failed deployment.

42. Production Incident Flow
    Problem detected
    ↓
    Determine affected capability
    ↓
    Protect business data
    ↓
    Determine whether operations can continue
    ↓
    Fix / rollback
    ↓
    Verify
    ↓
    Resume
    ↓
    Record incident
43. Deployment Completion Criteria
    ✓ Frontend deployed
    ✓ Backend deployed
    ✓ Database deployed
    ✓ HTTPS enabled
    ✓ Authentication works
    ✓ Owner works
    ✓ Worker works
    ✓ Business isolation works
    ✓ Branch isolation works
    ✓ API works
    ✓ Database connectivity works
    ✓ Health check works
    ✓ Logs available
    ✓ Error monitoring available
    ✓ Backups configured
    ✓ Recovery procedure verified
    ✓ Rollback procedure verified
    ✓ Mpesa production configuration verified
    ✓ Mobile access works
    ✓ Production smoke test passes
    ✓ Full-system production verification passes
44. Implementation Algorithm
    Step 1 — Prepare Production
    Completed System
    ↓
    Production Configuration
    ↓
    Production Environment
    Step 2 — Establish Database
    Production PostgreSQL
    ↓
    Secure Connection
    ↓
    Migration
    ↓
    Verified Schema
    Step 3 — Deploy Backend
    Backend
    ↓
    Production Build
    ↓
    Production Server
    ↓
    Database
    ↓
    Health Check
    Step 4 — Deploy Frontend
    Frontend
    ↓
    Production Build
    ↓
    Production Hosting
    ↓
    Backend API
    Step 5 — Establish Secure Access
    HTTPS
    ↓
    Authentication
    ↓
    Authorization
    ↓
    Owner / Worker
    Step 6 — Establish Mpesa Production
    Mpesa Sandbox Verified
    ↓
    Production Credentials
    ↓
    Callbacks
    ↓
    Real Transaction Test
    ↓
    Reconciliation Verified
    Step 7 — Establish Recovery
    Backups
    ↓
    Restore Test
    ↓
    Rollback Test
    ↓
    Recovery Ready
    Step 8 — Verify Real Business Flow
    Worker
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
    Step 9 — Verify Owner Visibility
    Operational Records
    ↓
    Reports
    ↓
    Analytics
    ↓
    Owner
    Step 10 — Deployment Readiness Transition
    Build Verified
    ↓
    Tests Passed
    ↓
    Infrastructure Verified
    ↓
    Security Verified
    ↓
    Backup Verified
    ↓
    Recovery Verified
    ↓
    Production Smoke Test
    ↓
    Full-System Verification
    ↓
    LIVE

Deployment is complete only when the real business can safely enter the production system and operate through the entire reality without breaking the system or losing the truth of what happened.
