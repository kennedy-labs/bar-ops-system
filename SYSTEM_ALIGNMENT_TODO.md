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

- [x] **P1-1 Backend:** Fix global validation pipe. `main.ts` uses Nest `ValidationPipe`
      (`class-validator`) but all DTOs use `createZodDto` (`nestjs-zod`). Switched to
      `ZodValidationPipe`. — _DONE, consumer-tested._
- [x] **P1-2 Backend:** Extend `User` model per `USERS_ARCHITECTURE`: added `branchId`,
      `phone`, `email`, `status`. Updated `CreateUserDto` + `UpdateUserDto` to accept
      `phone`, `password`, `role`, `status`. Migration added. — _DONE._
- [x] **P1-3 Backend:** `users.controller.getAll()` now filters by `businessId` query
      (was returning all users across every business). — _DONE._
- [x] **P1-4 Frontend:** Align Owner Management forms to the fixed backend contract —
      payloads (name/phone/role/password/businessId) match the new DTO; users list
      refreshes per selected business. — _DONE._
- [x] **P1-5 Frontend:** Stock page — Add Location folded **inside** Add Product (was
      independent + wrong); fields reconciled to `CreateStockLocationDto`. — _DONE._
- [x] **P1-6 Verify:** build + test the 4 forms (Business, User, Product, Stock Location)
      end-to-end. — _DONE: consumer confirmed success._

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