# Backend Production Readiness Roadmap

This document outlines the final steps to transition the backend from a development state to a production-ready API, allowing seamless integration with the future frontend.

## 1. Authentication & Security
- [ ] **Implement Login Logic**: In `auth.service.ts`, implement `validateUser` (using `bcrypt` to compare passwords) and `login` (to generate a JWT).
- [ ] **JWT Strategy**: Implement `JwtStrategy` to verify tokens on every request.
- [ ] **Guard Protection**: Apply `JwtAuthGuard` to all controllers (e.g., `ReportsController`, `TransfersController`) to ensure only authenticated users can access the data.
- [ ] **Environment Variables**: Move all sensitive data (JWT_SECRET, DATABASE_URL) to a `.env` file and use `@nestjs/config`.

## 2. Refinement & Robustness
- [ ] **Complete Profit Calculation**: Finalize the `getProfitReport` logic in `reports.service.ts` to use historical `ProductCostHistory`.
- [ ] **Global Exception Filter**: Create a global `HttpExceptionFilter` in `src/filters/` to ensure all API errors return a standardized `{ message, status, timestamp }` format.
- [ ] **Add Analytics Module**: Build a small `Analytics` module to provide summarized data for the frontend dashboard.

## 3. Quality Assurance
- [ ] **Unit Tests**: Ensure every service has a corresponding `service.spec.ts` with at least 50% coverage, specifically targeting critical business logic (Transfers, Inventory, Discrepancies).
- [ ] **Database Integrity**: Run `npx prisma migrate dev` to ensure your schema is fully synced, and test a full re-migration on a local clone to ensure the setup is reproducible.

## 4. Deployment Readiness
- [ ] **Dockerization**: Create a `Dockerfile` and `docker-compose.yml` to allow the backend to be deployed anywhere.
- [ ] **Health/Ready Endpoints**: Add a `/health` endpoint that checks the DB connection status.
- [ ] **Production Logging**: Configure the NestJS `Logger` to suppress excessive debug info in production while keeping error logs.

## 5. Frontend Integration Preparation
- [ ] **API Documentation**: Install `@nestjs/swagger` and add decorators (`@ApiTags`, `@ApiOperation`) to all controller endpoints so the frontend team (or you) can easily visualize the API structure.
- [ ] **CORS Configuration**: Ensure `app.enableCors()` is correctly configured in `main.ts` to allow requests from your frontend's future origin (e.g., `http://localhost:3000`).

---
### The Path Forward (Beginner Priority)
1. **Auth First**: Without users, you cannot test access control.
2. **Standardize API**: Standardize error messages so the frontend can display them easily.
3. **Swagger**: This is the best "connect to backend" tool for frontend developers.
