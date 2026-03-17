# ABSTRACT

The BloodLink application is implemented as a full-stack web platform for coordinated blood request handling, donor discovery, and inventory visibility. The system integrates identity management, donor eligibility attributes, urgency-based request recording, and stock-unit updates into one operational flow. The backend is developed with Node.js and Express, with MongoDB as persistence through Mongoose schemas. Static HTML pages and JavaScript modules provide user-facing and admin-facing interfaces.

The implementation follows a deterministic service model. Donor compatibility is not predicted by probabilistic classifiers; it is derived from explicit blood-group compatibility mapping and donor availability status. This design improves explainability and audit readiness. Security is handled through JWT authentication and middleware-level route protection for private and administrative operations.

The project is suitable for academic demonstration and institutional prototype deployment because it combines practical workflow completeness with clear modular decomposition. It supports account registration, profile maintenance, donor status updates, compatible donor search, blood request creation, emergency visibility cues, and controlled inventory operations.

# 1 Introduction

Blood requirement workflows are highly time-sensitive and coordination-intensive. In many practical settings, blood requests are still managed using phone calls, ad hoc messaging groups, or manually maintained donor lists. Such workflows can support small transaction volume but often degrade under concurrent demand, especially when multiple urgent requests are raised in short intervals.

The present system addresses this process weakness by providing a unified web-based platform. It centralizes user records, donor participation state, request entries, and inventory state in structured collections. The backend exposes domain routes for authentication, user operations, request operations, inventory operations, and admin governance. The frontend translates these APIs into task-oriented screens so that end users and administrators can complete operational activities without direct database access.

A major design choice in this implementation is interpretability. Compatibility matching is represented through an explicit donor-to-recipient mapping and availability constraints. This ensures that search outcomes can be traced back to concrete rules, making the workflow easier to validate in institutional review contexts.

## 1.1 Objectives

The system is designed to meet the following objectives in measurable and implementation-specific terms:

1. Establish a centralized portal for account management, donor participation, request submission, and stock visibility.
2. Enforce secure access through token-based authentication and route-level middleware checks.
3. Provide medically consistent donor search by blood-group compatibility with availability filtering.
4. Capture urgency-sensitive request details for normal, urgent, and critical cases.
5. Provide administrative control over users and inventory operations through role-restricted APIs.
6. Preserve data integrity using schema-level validation (required fields, enums, numeric ranges, and update hooks).
7. Maintain modular code structure that supports future extension (alerts, analytics, integration hardening, and test automation).

## 1.2 Existing System

In conventional blood coordination models, data collection and communication are usually fragmented. Donor records, hospital request details, and stock information are maintained in separate channels and often without synchronized updates. This results in limited visibility for decision-makers and creates dependence on human memory or manual follow-ups.

The major limitations of existing manual or semi-digital systems can be summarized as follows:

- Donor availability is frequently outdated at the time of search.
- Compatibility checks may be performed manually, increasing classification risk.
- Request urgency is not uniformly captured in a structured form.
- Inventory updates are delayed or inconsistently documented.
- Administrative interventions are not consistently routed through auditable APIs.

When demand rises, these process gaps reduce throughput and increase response uncertainty. Therefore, a consolidated application architecture becomes necessary to support reliable operations.

## 1.3 Proposed System

The proposed BloodLink platform implements an integrated three-layer architecture.

At the presentation layer, static pages handle registration, login, dashboards, profile updates, search, emergency listing, and admin operations. At the application layer, Express routes encode domain behavior and middleware applies authentication and authorization checks. At the persistence layer, Mongoose models maintain validated records for users, requests, inventory, donors, and donations.

Operationally, the workflow is designed for continuity:

- User account is created and authenticated.
- Profile is updated with donor-specific attributes where applicable.
- Compatible donors are retrieved through protected search endpoints.
- Requests are submitted with patient data and urgency level.
- Inventory status is displayed and updated through dedicated endpoints.
- Administrative routes enforce governance over critical entities.

The outcome is a clearer, traceable workflow with reduced dependency on informal communication channels.

# 2 Literature Survey

Contemporary healthcare web systems that manage blood or emergency resources commonly converge on five engineering principles: trusted identity, medically valid matching logic, urgency-aware request flow, inventory consistency, and administrative accountability. Systems that fail in one or more of these principles typically experience either incorrect routing of requests or delayed response behavior.

This project aligns with those principles through explicit implementation choices. Identity is handled through registration/login and JWT-backed private routes. Compatibility is based on deterministic blood-group logic. Validation is delegated to schema-level constraints in Mongoose to prevent malformed records from entering core collections. Administrative actions are separated from normal user actions through role middleware.

Another practical observation from prior system patterns is that adoption depends on usability structure. Task-specific pages reduce cognitive load and improve completion rates for routine actions. The project therefore separates request, profile, search, and administrative operations instead of combining all behavior into a single overloaded screen.

A further engineering lesson concerns route harmonization. The repository includes both user-based donor search and a standalone donor-route module. Since the standalone donor routes are not mounted by the main server entry in current runtime, endpoint alignment between frontend and backend is a critical integration consideration. This is an important real-world insight for deployment readiness.

# 3 Methodology

The methodology follows a requirement-to-module translation model. Functional requirements were mapped into persistent entities, then converted into route contracts, middleware guards, and user interface interactions.

Core methodology stages:

1. **Requirement decomposition:** identify user roles, data attributes, and critical operations.
2. **Schema design:** define entity fields, constraints, and timestamps.
3. **Route design:** isolate authentication, user, request, inventory, and admin concerns.
4. **Middleware integration:** apply protect/admin checks for secure operations.
5. **Frontend coupling:** bind page-level scripts to API endpoints and update cycles.
6. **Operational verification:** validate end-to-end flows for registration, search, request, and inventory updates.

## 3.1 Proposed Model/Architecture

The runtime model is route-centric and middleware-mediated.

- The server initializes Express middleware (`cors`, body parsing, static hosting), establishes MongoDB connection, and mounts API routes under namespace prefixes.
- Authentication routes manage registration/login/profile retrieval.
- User routes support profile update and compatibility search.
- Request routes handle creation/listing/status updates.
- Inventory routes provide stock retrieval and update procedures.
- Admin routes enforce role-restricted governance operations.

Architecturally, this can be interpreted as:

1. **Interface tier** (HTML/CSS/JS pages)
2. **Service tier** (Express routes + middleware)
3. **Data tier** (Mongoose models on MongoDB)

The separation improves maintainability and allows targeted extensions without full-stack rewrites.

## 3.2 Datasets

The project does not rely on an external benchmark corpus. It builds operational datasets from transactional usage.

### User dataset

Stores identity and role context: `name`, `email`, `password`, `phone`, `location`, `role`, with donor-specific fields including `isDonor`, `bloodGroup`, `lastDonationDate`, and `availabilityStatus`.

### Request dataset

Captures clinical request details: patient name, required blood group, units required, hospital name, urgency level, request status, and created timestamp.

### Inventory dataset

Stores blood-group-wise available units with update timestamp and non-negative constraints.

### Donor / Donation datasets

Includes standalone donor registration data and donation tracking entity for extension scenarios. These artifacts exist in the repository, with route activation status determined by server mounting.

## 3.3 Algorithm (Title if any)

### Blood Group Compatibility and Availability Filtering

The algorithm is deterministic. A map defines which recipient groups each donor blood group can serve. For a requested patient group, compatible donor groups are derived by reverse lookup and then filtered by donor activation and availability status.

#### Steps

1. Receive patient blood group from request parameter.
2. Traverse donor compatibility map.
3. Build a compatible donor-group list.
4. Query donors where donor flag is active and availability is `Available`.
5. Return constrained projection fields for actionable contact and location details.

#### Representative code-level pattern

```javascript
for (const [donorGroup, recipients] of Object.entries(donorCompatibility)) {
  if (recipients.includes(patientGroup)) {
    compatibleDonorGroups.push(donorGroup);
  }
}

const donors = await User.find({
  isDonor: true,
  bloodGroup: { $in: compatibleDonorGroups },
  availabilityStatus: 'Available'
}).select('name bloodGroup location phone lastDonationDate availabilityStatus');
```

This method is preferred for healthcare coordination contexts because the output is rule-explainable and straightforward to audit.

## 3.4 Performance Metrics

The current implementation supports practical metric framing at both technical and operational levels.

### Technical metrics

1. Authentication success ratio and protected-route access correctness.
2. Donor-search response time and compatibility correctness.
3. Request creation-to-visibility delay in polled dashboards.
4. Inventory update integrity across add/subtract operations.
5. Authorization rejection accuracy for unauthorized or non-admin calls.

### Operational metrics

1. Critical request visibility delay in emergency banner and request lists.
2. Relevance and actionability of returned donor records.
3. Administrative intervention speed for user and stock control.
4. Data-quality stability under schema validation constraints.

# 4 IMPLEMENTATION

## 4.1 System Setup

The application is implemented as a Node.js service with MongoDB storage and static frontend delivery. Setup requires runtime environment variables, package installation, and database accessibility.

### 4.1.1 Development Environment

Recommended environment:

- Node.js runtime (LTS preferred)
- npm package manager
- MongoDB instance (local or hosted)
- Environment variable file for JWT secret and database URI
- Browser runtime for frontend verification

Development scripts include `start` and `dev` from `package.json`.

### 4.1.2 Installation Procedure

1. Clone repository and change to project directory.
2. Install dependencies with `npm install`.
3. Provide `.env` values (`MONGODB_URI`, `JWT_SECRET`, optional `PORT`).
4. Start server using `npm run dev` or `npm start`.
5. Access UI through configured port and validate API connectivity.

### 4.1.3 Environment Configuration

Key environment values:

- `MONGODB_URI`: database connection string.
- `JWT_SECRET`: signing secret for token generation/verification.
- `PORT`: optional server port override.

Configuration quality directly affects authentication and persistence reliability.

### 4.1.4 Dependency Mapping

Major dependencies and responsibility mapping:

- `express`: API and middleware pipeline
- `mongoose`: schema modeling and persistence
- `jsonwebtoken`: token generation/verification
- `bcryptjs`: password hashing and comparison
- `cors`: cross-origin request handling
- `body-parser`: request payload parsing
- `dotenv`: environment loading
- `nodemon`: development auto-reload

## 4.2 Module-wise Implementation

### 4.2.1 Project Folder Structure

The repository follows modular grouping:

- `server.js` – application entrypoint
- `models/` – entity schemas (`User`, `Request`, `Inventory`, `Donor`, `Donation`)
- `routes/` – API domains (`auth`, `user`, `admin`, `request`, `inventory`, `donor`)
- `middleware/` – auth and role checks
- `public/` – static pages and JavaScript assets

This structure supports separation of concerns and maintainable scaling.

### 4.2.2 Backend Core Module (server/server.js)

Equivalent repository file: `server.js`.

The core module initializes middleware, establishes MongoDB connection, mounts route modules, serves static files, and starts HTTP listening. It also defines the base route that serves the landing page.

### 4.2.3 Authentication Module (server/routes/auth.js + server/middleware/auth.js)

Equivalent repository files: `routes/authRoutes.js` and `middleware/authMiddleware.js`.

The module supports registration, login, and authenticated profile retrieval. Password verification uses model method comparison and token issuance uses JWT with expiry configuration. Middleware validates bearer token and injects user context for downstream route handlers.

### 4.2.4 Event Management Module (server/routes/events.js + server/models/Event.js)

In this repository, the equivalent business domain is **Request Management**, represented by `routes/requestRoutes.js` and `models/Request.js`.

Request lifecycle includes creation, listing, and status update operations. Records include urgency level and hospital details, enabling both routine and emergency tracking.

### 4.2.5 Booking Lifecycle Module (server/routes/bookings.js + server/models/Booking.js)

In this repository, lifecycle-equivalent behavior is distributed across donor participation and request fulfillment context through `routes/userRoutes.js` and `routes/requestRoutes.js`.

User profile updates activate donor status and availability, while request routes persist demand-side records. Together, these flows represent supply-demand lifecycle coordination.

### 4.2.6 Payment Module (server/routes/payments.js)

No payment module exists in the current repository. The project scope is clinical coordination and inventory workflow, not transaction processing.

### 4.2.7 Organizer Analytics Module (server/routes/organizer.js)

Closest equivalent in this repository is donor statistics aggregation exposed by `GET /api/users/stats`, combined with dashboard-level inventory visibility and request lists.

### 4.2.8 Coupon Validation Module (server/routes/coupons.js + server/models/Coupon.js)

No coupon subsystem exists in the current repository. This module heading is retained for structural alignment with the provided contents format.

### 4.2.9 Check-in Module (server/routes/checkin.js)

No dedicated check-in endpoint exists. Operationally related behavior is request listing and profile-driven donor availability updates.

### 4.2.10 Utility Modules (server/utils/pdf.js, server/utils/email.js)

Dedicated utility modules are not present as `utils/` scripts in this repository. Current functionality is implemented directly in route and page scripts.

### 4.2.11 Frontend Infrastructure Modules (public/scripts/config.js, public/scripts/api.js)

Equivalent infrastructure behavior is distributed through `public/js/main.js`, including auth-header generation, session utilities, logout control, and emergency polling.

### 4.2.12 Frontend Feature Modules

Feature-level modules include:

- `public/js/dashboard.js` for inventory rendering and update interactions.
- `public/js/emergency.js` for request submission/listing in emergency views.
- `public/js/donor.js` for donor registration actions where route path is available.
- Inline page scripts in dashboard/profile/search pages for user-specific actions.

## 4.3 Code-Level Explanation

### 4.3.1 Token Enforcement Pattern

Token enforcement is middleware-based. Protected routes call `protect`, which extracts bearer token, verifies JWT signature, and fetches user context before allowing execution.

### 4.3.2 Filtered Event Query Construction

Equivalent in this repository is filtered donor search query construction. Compatibility map output is transformed into `$in` filter, then combined with donor status conditions.

### 4.3.3 Payment Signature Verification

Not applicable to current scope because no payment gateway integration is implemented.

### 4.3.4 Server-side Booking Amount and Tax Logic

Not applicable because the project does not implement commercial booking or tax computation.

### 4.3.5 Booking Cancellation Window Rule

No booking cancellation policy exists. Closest policy-like behavior is request status updates and inventory quantity boundaries.

### 4.3.6 Check-in Duplicate Prevention

No check-in subsystem exists. Duplicate prevention in current scope is primarily achieved through unique constraints (e.g., user email uniqueness) and controlled route logic.

### 4.3.7 Frontend Auth Request Standardization

Standardization is achieved through a shared helper that builds JSON headers and conditionally appends bearer token from local storage. This pattern is reused across protected fetch calls.

## 4.4 Screen-to-Screen Implementation Explanation

### 4.4.1 Screen: Signup (public/signup.html)

Equivalent screen: `public/register.html`.

The screen captures user identity and contact data, then posts to authentication registration endpoint. On successful registration, session flow proceeds toward authenticated usage.

### 4.4.2 Screen: Login (public/login.html)

`public/login.html` collects credentials and invokes login API. Successful responses include token and role metadata, which are stored client-side for protected navigation.

### 4.4.3 Screen: Home Event List (public/index.html)

Equivalent home screen: `public/index.html`.

The landing page acts as entry interface and links into authentication and role-specific operational screens.

### 4.4.6 Screen: My Bookings (public/my-bookings.html)

Equivalent operational context: user request visibility through `public/user-dashboard.html` and emergency/request list sections.

### 4.4.7 Screen: Organizer Dashboard (public/organizer-dashboard.html)

Equivalent administrative context: `public/admin-dashboard.html`, which provides inventory operations and governance-level controls.

### 4.4.8 Screen: Event Analytics (public/event-analytics.html)

Equivalent analytics context: inventory grid trends and donor stats endpoint usage for blood-group distribution awareness.

### 4.4.9 Screen: Create Event (public/create-event.html)

Equivalent creation workflow: blood request creation form in `public/user-dashboard.html` and request form behavior in `public/js/emergency.js`.

### 4.4.10 Screen: Edit Event (public/edit-event.html)

Equivalent update workflow: profile update (`public/profile.html`) and request/inventory status adjustments through available routes.

### 4.4.11 Screen: Check-in Flow (API-centric operational screen)

Equivalent API-centric operational behavior: emergency request polling, request list refresh, and inventory update actions triggered by frontend scripts.

## 4.5 Results-Oriented Implementation Notes

1. Authentication and profile lifecycle are functional with JWT-protected access.
2. Donor search behavior is deterministic and constrained by availability status.
3. Request workflows support urgency-tagged entries and listing visibility.
4. Inventory module provides practical stock operations with range safeguards.
5. Admin route protection establishes governance boundaries for privileged actions.
6. Frontend polling contributes to near-real-time emergency visibility.

## 4.6 Limitations and Technical Improvement Opportunities

1. Standalone donor route module exists but is not mounted in server runtime.
2. Some client scripts reference endpoints requiring route harmonization.
3. Dedicated analytics, notification, and audit modules are not yet implemented.
4. No automated test suite is configured in package scripts.
5. Domain-specific policies (ownership controls, transition rules) can be further tightened.

## 4.7 Integration Checklist for Report Submission

- Verify all environment variables are documented and validated.
- Ensure route-map table aligns with active server mounting.
- Confirm screen-to-endpoint mapping in implementation chapter.
- Include module equivalence notes where template headings differ from repository naming.
- Validate that non-applicable template modules are explicitly marked as out-of-scope.
- Confirm references and technical terms are consistent across chapters.

# 5 Results and Discussion

The implementation demonstrates successful integration of essential blood coordination workflows. Registration and login operations produce session-bearing responses and role context. Profile management allows users to transition into donor participation with blood-group and availability metadata. Donor search logic returns medically compatible records constrained by availability state.

Request handling supports structured urgency capture and chronological listing behavior. Emergency visibility is reinforced through polling-based refresh patterns on relevant pages. Inventory modules allow blood-group stock visibility and update transactions with lower-bound safeguards.

From a software architecture perspective, modular route decomposition and middleware layering are significant strengths. The separation of authentication, user logic, request logic, and inventory logic increases maintainability and enables incremental extension. At the same time, route harmonization between all frontend scripts and mounted backend modules remains a practical deployment priority.

In academic evaluation terms, the project exhibits a sound foundation in full-stack design, validation strategy, security controls, and operational flow coverage. With test automation, notification integration, and route consistency hardening, the same architecture can be advanced toward production-grade deployments.

# 6 Conclusion & Future scope

The BloodLink project delivers a coherent and institution-relevant implementation for blood coordination workflows. It combines secure identity management, deterministic donor compatibility search, urgency-aware request capture, and inventory governance in one service architecture.

The project’s core contribution is not only functional completion, but structural clarity. Data integrity is embedded in schema definitions, access control is enforced through middleware, and user-facing tasks are organized through dedicated screens and script modules. This produces a system that is easy to understand, extend, and evaluate in academic settings.

Future scope includes route harmonization for all donor-related pathways, notification channels for critical requests, richer analytics dashboards, stricter request-state transition policies, and complete automated testing across major API flows.

# 7 References

1. Node.js Documentation. https://nodejs.org/
2. Express.js Documentation. https://expressjs.com/
3. MongoDB Documentation. https://www.mongodb.com/docs/
4. Mongoose Documentation. https://mongoosejs.com/docs/
5. JSON Web Token (JWT) Documentation. https://jwt.io/introduction
6. bcryptjs Package Documentation. https://www.npmjs.com/package/bcryptjs
