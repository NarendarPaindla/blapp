# 1. Introduction

## Abstract

Blood transfusion support requires a coordinated workflow across donors, requesters, and administrators. Delays in donor discovery or stock verification can directly affect patient care windows, particularly in urgent and critical demand conditions. The implemented system addresses this requirement through an integrated web application that combines user management, compatibility-aware donor search, blood request processing, and blood inventory maintenance.

The backend is implemented using Node.js with Express, and persistent storage is handled through MongoDB using Mongoose schemas. Authentication and route protection are implemented with JWT-based authorization and middleware-driven access control. The frontend is delivered as static HTML/CSS/JavaScript pages, allowing clear separation between user interactions and API-driven business processing.

The operational design emphasizes deterministic decision logic and traceable data updates. Instead of probabilistic matching, blood-group compatibility is implemented through explicit rule mapping and availability filtering. This ensures that search output remains transparent, medically interpretable, and easy to verify during institutional review.

## Problem Statement

In many practical settings, blood coordination depends on informal communication channels, fragmented records, and manual cross-verification of donor eligibility and blood-group compatibility. These practices are difficult to scale during simultaneous requests and do not provide reliable state visibility for stakeholders.

Key process-level problems include delayed donor identification, inconsistent donor availability records, weak request status tracking, and lack of centralized operational control. Without a unified system, administrative teams must repeatedly reconcile data from multiple sources, increasing turnaround time and introducing avoidable errors. The system documented here addresses this gap by implementing a centralized, role-aware, API-based workflow for blood coordination.

## 1.1 Objectives

The system is designed to satisfy the following objectives in technical and operational terms:

1. Provide a centralized platform for registration, profile management, donor activation, blood request handling, and inventory visibility.
2. Enforce secure access control through JWT-based authentication and role-aware route authorization.
3. Implement deterministic donor compatibility search based on blood-group mapping and current donor availability.
4. Support urgency-aware request lifecycle handling using structured request data and status fields.
5. Enable administrative governance for user management and inventory updates through protected endpoints.
6. Preserve data integrity by enforcing schema-level validation, enum constraints, minimum numeric rules, and controlled API payload structure.

## 1.2 Existing System

Conventional workflows for blood coordination are usually distributed across phone calls, chat groups, and manually maintained donor lists. Although functional for low-volume activity, this method suffers from poor synchronization and weak reliability under stress conditions.

The existing process model presents several limitations. Donor records may not reflect current availability, blood-group matching is often performed manually, and request progression is not consistently visible to all participants. Operational controls are typically person-dependent rather than system-enforced, which reduces repeatability and auditability. As request concurrency increases, response quality declines because coordination effort scales faster than the process itself.

## 1.3 Proposed System

The proposed system introduces an integrated architecture that combines interface pages, API modules, middleware controls, and validated database entities.

At the presentation layer, the application provides dedicated pages for login, registration, user dashboard, profile management, donor search, emergency request visibility, and administrative operations. At the application layer, Express route modules encapsulate domain behavior for authentication, user profile management, donor search, requests, inventory, and admin operations. At the persistence layer, Mongoose schemas enforce structure and data quality for users, requests, inventory, donor entries, and donation records.

The final workflow supports end-to-end execution: user onboarding, token issuance, protected profile operations, donor discovery with compatibility filtering, urgency-tagged request creation, and inventory updates. This model reduces dependence on ad hoc coordination and improves process clarity for institutional deployment.

# 2. Literature Survey

Digital blood management systems, as reflected by common architecture practices in healthcare web platforms, generally converge on a set of mandatory qualities: identity assurance, compatibility correctness, request prioritization, inventory observability, and administrative accountability.

The implemented project aligns with this direction through explicit route-level security and schema-level validation. Identity is handled via account registration and JWT-backed sessions. Authorization is enforced through middleware for private and admin routes. Compatibility is implemented as deterministic blood-group logic rather than heuristic estimation, providing direct interpretability for every donor result generated by the system.

A second recurring observation in operational systems is that maintainability is strongly tied to modular decomposition. This project follows a route-per-domain strategy (`auth`, `users`, `requests`, `inventory`, `admin`), reducing coupling and simplifying updates. A third observation concerns usability: adoption improves when user tasks are grouped by intent. The frontend therefore separates request generation, donor search, profile management, and admin controls into dedicated views.

Another practical requirement in blood coordination software is consistency between UI assumptions and active server routes. The repository includes both user-based donor search (`/api/users/search/:bloodGroup`) and standalone donor route logic (`routes/donorRoutes.js`). Since the standalone donor routes are not mounted in `server.js`, one class of compatibility queries must rely on the user module path in the current runtime. This reveals an integration lesson common in production systems: endpoint contracts and frontend API targets must be continuously harmonized.

# 3. Methodology

The implementation methodology follows a layered full-stack approach driven by functional decomposition. Requirements were mapped into entities, entities into API contracts, and contracts into page-level user actions. The same decomposition is reflected in repository organization: model definitions in `models/`, route logic in `routes/`, middleware in `middleware/`, and client assets in `public/`.

## 3.1 Proposed Model/Architecture

The runtime begins with server initialization, middleware registration, static file serving, and MongoDB connection setup. API routes are mounted under dedicated namespaces (`/api/auth`, `/api/users`, `/api/admin`, `/api/requests`, `/api/inventory`). Static pages are served from `public/`, and the base route loads `index.html`.

From an architectural standpoint, the system is organized into three coordinated planes:

- **Interaction Plane:** Browser-based forms and dashboards collect structured inputs and display request/inventory/donor state.
- **Control Plane:** Express handlers process authenticated and public operations according to route and role.
- **Persistence Plane:** Mongoose schemas validate and store operational records in MongoDB.

### Technology Stack (with justification)

Node.js with Express was selected for rapid API development, minimal deployment overhead, and natural middleware-driven request pipelines. The stack supports direct integration of authentication checks, role gates, and route modularity.

MongoDB with Mongoose was selected because the data shape is document-centric and evolves around operational entities with varied fields. Mongoose adds strong validation through enums, required fields, regex matching, minimum values, and lifecycle hooks.

JWT (`jsonwebtoken`) and `bcryptjs` provide a practical security base for stateless authentication and secure credential storage. Password hashing occurs before persistence through pre-save middleware, and protected routes verify bearer tokens for identity continuity.

The frontend uses static HTML/CSS/JavaScript to keep the interface lightweight and transparent. This choice reduces complexity while preserving dynamic behavior through API calls and periodic polling.

### System Architecture and Workflow / Data Flow

A complete request cycle is executed as follows:

1. **Registration and Login:** A new user account is created through `/api/auth/register`; login through `/api/auth/login` returns a JWT.
2. **Session Establishment:** Token data is stored client-side and attached to protected requests through authorization headers.
3. **Profile and Donor Activation:** The user updates profile metadata via `/api/users/profile`, including donor flags and availability.
4. **Donor Search:** For a selected patient blood group, `/api/users/search/:bloodGroup` computes compatible donor groups and returns available donors.
5. **Request Submission:** Blood requirement records are posted to `/api/requests` with urgency level and clinical location details.
6. **Request Visibility:** Pages fetch `/api/requests` periodically to present current requests and emergency signals.
7. **Inventory Maintenance:** `/api/inventory` endpoints provide stock reads and updates; admin routes offer privileged governance actions.

### Module-wise Explanation

**Authentication Module:**
`routes/authRoutes.js` implements registration, login, and authenticated profile fetch. Token generation uses a configurable secret and fixed expiry interval.

**User Module:**
`routes/userRoutes.js` handles profile updates and compatibility-based donor retrieval. It also exposes donor-count aggregation by blood group for available donors.

**Request Module:**
`routes/requestRoutes.js` supports request creation, listing, and updates. Creation is protected, while listing is public to support emergency visibility use cases.

**Inventory Module:**
`routes/inventoryRoutes.js` handles inventory listing, additive/subtractive stock adjustment, and optional initialization of all blood groups.

**Admin Module:**
`routes/adminRoutes.js` applies global protection via `protect` and `admin` middleware to ensure only administrators can manage users and execute admin inventory updates.

**Middleware Layer:**
`authMiddleware.js` verifies JWT and binds user context to requests. `roleMiddleware.js` validates admin privileges for restricted operations.

**Frontend Layer:**
`public/js/main.js` centralizes helper functions (auth header, login state, logout, emergency banner polling). `public/js/emergency.js` and inline page scripts coordinate request creation and display. `public/js/dashboard.js` handles inventory rendering and update form submission.

## 3.2 Datasets

The application relies on operational datasets generated through user interaction and API transactions. No external benchmark dataset is required for current functionality.

### User Dataset

The user entity stores identity fields (`name`, `email`, `password`, `phone`, `location`) and authorization context (`role`). Donor-centric attributes include `isDonor`, `bloodGroup`, `lastDonationDate`, and `availabilityStatus`. Email uniqueness is enforced and blood group values are restricted to valid enumerations.

### Request Dataset

Request records include `patientName`, `requiredBloodGroup`, `unitsRequired`, `hospitalName`, `urgencyLevel`, and `requestStatus`, with automatic timestamping. Numeric and enum validation constrains incorrect input at persistence level.

### Inventory Dataset

Inventory records track one document per blood group with `availableUnits` and `lastUpdated`. Non-negative quantity constraints and pre-save timestamp updates preserve consistency.

### Donor and Donation Datasets

A standalone donor schema (`models/Donor.js`) and donation schema (`models/Donation.js`) are present for extended scenarios. The donor schema includes age, compatibility fields, and availability state. In the current server configuration, standalone donor routes are present in code but are not active because they are not mounted by `server.js`.

## 3.3 Algorithm(Title if any)

### Blood Group Compatibility and Availability Filtering

The implemented search strategy is deterministic and rule-based. A compatibility dictionary defines recipient groups for each donor blood group. During execution, the algorithm identifies all donor groups that can donate to the selected patient group and applies availability filtering before returning results.

This approach offers high transparency. Every returned donor can be traced to a specific compatibility rule and explicit status condition. Such traceability is essential in operational healthcare support where explainability is mandatory.

### Algorithm Steps

1. Receive patient blood group from route parameter.
2. Iterate over compatibility map entries (`donorGroup -> recipientGroups`).
3. Select donor groups whose recipient list contains the patient group.
4. Query donor records with three constraints:
   - donor participation active (`isDonor = true`)
   - donor blood group in compatible set (`$in`)
   - current eligibility state (`availabilityStatus = 'Available'`)
5. Return constrained donor fields for contact and decision support.

### Representative Implementation

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

### Security and Validation Behavior in the Algorithmic Path

The donor search endpoint is protected by authentication middleware. As a result, compatibility output is not exposed to anonymous clients. At data level, donor blood groups are constrained by schema enums, ensuring search filtering is executed on valid domain values only.

## 3.4 Performance Metrics

Current performance assessment is centered on practical, measurable behavior available from existing API endpoints and UI flows.

### Technical Metrics

1. **Authentication Reliability:** success ratio for register/login/profile flows and correctness of token-protected access.
2. **Search Performance:** average response time of compatibility lookup and correctness of donor eligibility filters.
3. **Request Throughput Visibility:** time gap between request creation and dashboard display under polling.
4. **Inventory Consistency:** correctness of add/subtract operations and non-negative stock persistence.
5. **Authorization Rejection Accuracy:** frequency and correctness of 401/403 responses for restricted routes.

### Operational Metrics

1. **Emergency Awareness Delay:** time required for critical requests to appear in visible client alerts.
2. **Donor Reachability Quality:** proportion of returned donors with actionable contact and location fields.
3. **Administrative Control Effectiveness:** time and effort required for user governance and stock intervention.
4. **Data Integrity Stability:** incidence of invalid records blocked by schema-level validation.

# 4. Results and Discussion

Functional verification of repository workflows indicates that core operational requirements are implemented and executable with MongoDB and JWT environment settings.

Registration and login pipelines return valid session payloads, and profile retrieval operates under bearer-token protection. Profile update flow supports donor activation and blood-group assignment. Donor search returns only compatible and available entries when accessed through the user route module. Request creation captures urgency and hospital context, while listing endpoints provide chronological request visibility. Inventory modules support both retrieval and transactional update of blood-group stock.

The frontend exhibits coherent task separation. User dashboards support request submission and profile status visibility, donor search pages provide group-based query interfaces, and emergency-oriented displays poll request records for near-real-time updates. Admin routes enforce role gates before exposing user-management or privileged inventory operations.

A key architectural observation emerges from integration behavior: there is partial divergence between certain frontend API calls and active server route mounts. Specifically, repository code includes standalone donor route logic and scripts that reference `/api/donors/*`, while active server mounting focuses on `/api/users/search/:bloodGroup` for compatibility retrieval. This does not invalidate core functionality, but it highlights a deployment hardening task.

Overall, the present implementation demonstrates a practical, modular base for institutional blood coordination workflows, with strong potential for extension through route harmonization and test coverage.

# 5. Conclusion & Future scope

The implemented system establishes a clear and technically grounded framework for blood request coordination. It combines secure user identity handling, compatibility-oriented donor discovery, urgency-aware request processing, and maintainable inventory operations in a single web architecture.

The design strength lies in deterministic logic and modular implementation. Data validation is pushed close to persistence, authorization is enforced at middleware boundaries, and user operations are presented through dedicated interface contexts. These characteristics make the platform suitable as an academic and pre-production reference model.

### Advantages

The system centralizes records and minimizes dependency on informal communication channels. Compatibility logic is transparent and auditable. Role-based control introduces governance boundaries. Schema-level validation reduces malformed data entry, and modular routes improve maintainability and incremental extension.

### Limitations

Standalone donor APIs exist in the codebase but are not mounted in the active server configuration, creating route inconsistency for some client-side code paths. Public request listing is available while request creation is protected; this policy may need institutional review depending on privacy requirements. The project currently lacks an automated test suite in package scripts.

### Future scope

Future enhancements can prioritize end-to-end route harmonization, request ownership and status-transition control, audit trail recording, and production-grade observability. Notification channels (SMS/email/push), analytics for stock trends and urgency forecasting, and automated integration tests for critical endpoints can significantly improve operational readiness.

# 6. References

1. Node.js Official Documentation. https://nodejs.org/
2. Express.js Documentation. https://expressjs.com/
3. MongoDB Documentation. https://www.mongodb.com/docs/
4. Mongoose Documentation. https://mongoosejs.com/docs/
5. JSON Web Token (JWT) Documentation. https://jwt.io/introduction
6. bcryptjs Package Documentation. https://www.npmjs.com/package/bcryptjs
