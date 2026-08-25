# System Alignment & Fix Tracker

> **Purpose:** Persistent memory list to track progress on the system-doc → architecture → code
> alignment effort. Source of truth: `backend/docs/PROJECT_BLUEPRINT.md` +
> `frontend/docs/My_System_Nature.md`. Every fix here must bring **backend AND frontend**
> capabilities back in line with the intended system design.
>
> **Rule:** Update this file's checkboxes as we complete work. Do not let it go stale.

---

## Phase 1 — Unblock the UI (highest impact, smallest, safe)

Goal: stop the `"property X should not exist"` failures and make owner CRUD forms work.

- [ ] **P1-1 Backend:** Fix global validation pipe. `main.ts` uses Nest `ValidationPipe`
      (`class-validator`) but all DTOs use `createZodDto` (`nestjs-zod`). Switch to the Zod
      pipe so validated DTOs actually whitelist the correct fields.
      - _Why:_ root cause of `property name/sellingPrice/businessId should not exist`.
- [ ] **P1-2 Backend:** Extend `User` model per `USERS_ARCHITECTURE`: add `branchId`,
      `phone`, `email`, `status`. Update `CreateUserDto` + `UpdateUserDto` to accept
      `phone`, `password`, `role`, `status`. Add migration.
      - _Why:_ current `User` DTO/model drops `phone` + `password` the UI sends.
- [ ] **P1-3 Backend:** fix `users.controller.getAll()` to filter by `businessId` query
      (currently returns all users across every business — breaks multi-branch isolation).
      - _Also:_ `stock-locations` should scope by branch/business.
- [ ] **P1-4 Frontend:** Align Owner Management forms to the (fixed) backend contract —
      payloads already send name/phone/role/password/businessId; verify they match the new
      DTO after P1-2, and that the Users list refreshes per selected business.
- [ ] **P1-5 Frontend:** Align Stock page: Add Location should appear **inside Add Product**
      (currently independent + wrong). Reconcile location form (name/type/branch) to the
      backend `CreateStockLocationDto`.
- [ ] **P1-6 Verify:** build + test the 4 forms (Business, User, Product, Stock Location)
      end-to-end (UI → backend → DB) before moving to Phase 2.

---

## Phase 2 — Close model/architecture drift (needs product decisions)

Design decisions that change data model + semantics. Each needs explicit sign-off.

- [ ] **P2-1 StockLocation:** add `businessId` + `status` (+ `description`) to match
      `STOCK-LOCATION_ARCHITECTURE`. Migration required.
- [ ] **P2-2 Shift price/cost fidelity:** decide whether to freeze `sellingPrice`+`cost` on
      `ShiftStockItem`/`ShiftPaymentSummary` at close time (blueprint says immutability +
      "profit from recorded events"). **Decision required** — recommend YES.
- [ ] **P2-3 Multi-business ownership:** model a user belonging to multiple businesses safely
      (join table `UserBusiness`, or per-business user records) to honor
      "one owner, many businesses" without session-switch shortcuts.
      **Decision required.**

---

## Phase 3 — Enforce accountability (toward production)

Only when you're ready to stop allowing any-user access.

- [ ] **P3-1 Backend security:** re-enable Authentication module + JWT guards on operational
      controllers; scope reads/writes by `businessId` from the token.
- [ ] **P3-2 Backend:** per-branch filtering on `/reports/*` + operational reads to deliver
      true multi-branch isolation.
- [ ] **P3-3 Frontend:** role-based route guards (workers blocked from `/owner/*`).

---

## Phase 4 — Guardrails & docs

- [ ] **P4-1** Add unit/integration/API tests for lifecycle transitions (your docs require
      this).
- [ ] **P4-2** Update stale `PROJECT_BLUEPRINT.md` (reads currently return "outdated").

---

## Notes / Decisions Log

- **Auth disabled** (on purpose) for any-user testing. See Phase 3 to restore.
- **CORS:** currently wide-open for testing. Tighten to your specific Vercel domain(s) at
  production.
- Last audit performed: system-docs vs architecture vs current code (see conversation).

*Authoritative: 2 source-of-truth docs. Everything else (architecture, code) must adjust to
them — not the other way around.*