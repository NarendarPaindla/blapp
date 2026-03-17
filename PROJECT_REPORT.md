# 1. Introduction

## Abstract

The BloodLink system is developed as a web-based blood donation and emergency coordination platform that connects donors, requesters, and administrators through a unified digital workflow. The implementation integrates secure user authentication, donor profile management, blood-group compatibility search, blood request lifecycle handling, and stock monitoring within a modular architecture. The backend is implemented using Node.js, Express, and MongoDB, while the frontend is delivered through static HTML, CSS, and JavaScript pages.

The system replaces fragmented manual communication practices with structured APIs and validated database records. Blood-group compatibility is resolved using deterministic rule mapping, thereby ensuring transparent and medically interpretable donor matching. The architecture supports practical institutional deployment and can be extended for notifications, audit trails, and analytics.

## Problem Statement

In many practical environments, blood coordination is managed through phone calls, messaging groups, and disconnected lists. Such workflows are not resilient under urgent demand, and they introduce delays in identifying compatible donors, confirming donor availability, and tracking request progression. Inventory updates are often manual, producing stale or inconsistent stock visibility.

The absence of centralized access control further increases operational risk. When identity, donor eligibility, and request records are not maintained in a single validated system, response quality depends heavily on individual effort rather than process integrity. The present implementation addresses this issue by establishing a centralized, role-aware, and data-validated platform for blood coordination.

## 1.1 Objectives

The implemented system is designed to satisfy the following operational and technical objectives:

1. Provide centralized records for users, donor metadata, blood requests, and blood stock.
2. Enforce secure access using JWT-based authentication and role-aware authorization.
3. Deliver deterministic donor compatibility filtering using blood-group rules.
4. Support urgency-aware blood request creation and listing for rapid response.
5. Enable inventory visibility and controlled add/subtract stock transactions.
6. Improve data quality through schema validation, enum constraints, and numeric limits.

## 1.2 Existing System

Conventional blood support workflows generally rely on informal communication channels and manually curated donor lists. Although workable at small scale, these methods become unreliable when multiple emergency requests occur simultaneously. Donor status may be outdated, compatibility checks are manually verified, and no consistent mechanism exists for request state monitoring.

The manual model also makes auditing difficult. Administrative teams must repeatedly reconcile information from different sources, increasing decision latency and introducing avoidable errors. These limitations motivate the need for a centralized and API-driven system.

## 1.3 Proposed System

The proposed system organizes blood coordination into a three-layer architecture. The presentation layer contains dedicated interfaces for registration, login, profile updates, donor search, emergency requests, and administrative operations. The service layer contains modular Express routes for authentication, users, requests, inventory, and admin tasks. The data layer uses MongoDB collections governed by Mongoose schemas.

The workflow begins with account registration and token-based login. Authenticated users can update donor settings, making blood group and availability status available for compatibility search. Request records capture patient and urgency context. Inventory endpoints expose current stock and apply transactional updates. This design improves traceability, reduces coordination delay, and supports controlled institutional operation.

# 2. Literature Survey

Digital blood management solutions generally emphasize five recurring design principles: identity assurance, compatibility correctness, urgency prioritization, inventory observability, and governance. The present repository follows this design direction through schema-backed models, middleware-enforced security boundaries, and modular route decomposition.

From a maintainability perspective, route-level modularization is a common best practice in web healthcare applications. The project uses separate route files for `auth`, `users`, `requests`, `inventory`, and `admin`, which reduces coupling and simplifies enhancement. Security patterns in comparable systems favor stateless sessions, implemented here through JWT validation middleware.

Another common requirement is operational visibility. The repository includes public donor aggregates, dashboard inventory cards, and emergency request feeds with periodic polling. These patterns align with practical blood coordination needs where situational awareness is critical.

# 3. Methodology

The implementation follows a full-stack, API-first methodology in which each domain concern is mapped to an explicit module. Mongoose schemas define entity-level constraints, Express handlers implement business rules, middleware enforces authorization, and frontend scripts consume REST endpoints through asynchronous fetch calls.

## 3.1 Proposed Model/Architecture

The architecture can be represented as follows:

- **Client Layer:** Static interfaces in `public/` for user interactions.
- **Application Layer:** Express routes mounted under `/api/*` in `server.js`.
- **Security Layer:** `protect` middleware for token validation and `admin` middleware for privileged operations.
- **Persistence Layer:** MongoDB with Mongoose models for users, requests, and inventory.

The server bootstrap initializes middleware (`cors`, `bodyParser`, static hosting), connects to MongoDB, and mounts route modules. This centralized initialization standardizes deployment behavior and simplifies debugging.

## 3.2 Datasets

The system does not depend on external benchmark datasets. All data is generated transactionally during operation and persisted in MongoDB.

The **user dataset** stores identity attributes and donor status fields (`isDonor`, `bloodGroup`, `availabilityStatus`). The **request dataset** stores patient details, required group, urgency level, units required, and request status. The **inventory dataset** stores blood-group-wise stock and update timestamps. These datasets are governed by schema validations to ensure domain correctness.

## 3.3 Algorithm(Title if any)

### Blood Group Compatibility Matching Algorithm

The donor search mechanism is implemented using a deterministic compatibility map in `routes/userRoutes.js`. For a requested patient blood group, the algorithm scans donor-group mappings and builds a compatible donor group list. A filtered database query then returns only donors who are active, compatible, and currently available.

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

The algorithm is intentionally rule-based so that output is auditable and clinically interpretable.

## 3.4 Performance Metrics

Although a dedicated benchmark suite is not included in the repository, implementation behavior can be evaluated through measurable runtime criteria. Authentication reliability can be assessed through protected route access outcomes. Compatibility quality can be measured by validating donor-group correctness for each query. Request visibility delay can be observed from creation time to dashboard display under polling cycles. Inventory integrity can be evaluated by verifying non-negative updates and group-level consistency.

# 4. Results and Discussion

Functional analysis of the implemented modules indicates that core platform operations are executable under standard environment configuration. Registration and login flows generate session tokens, and profile retrieval is protected by bearer-token verification. Profile update operations persist donor participation metadata required for compatibility search.

The donor search flow returns filtered donor records based on compatibility and availability constraints. Request APIs capture urgency-tagged demand records and expose request feeds in reverse chronology. Inventory APIs support both status retrieval and transactional stock update operations.

Frontend behavior reflects this backend design. Dashboard views render inventory and request information, while emergency interfaces support recurring refresh cycles to surface active demand. The modularity of route files and model definitions supports maintainability and future extensibility.

# 5. Conclusion & Future scope

The developed system establishes a technically grounded framework for blood coordination and emergency support. It integrates identity management, donor matching logic, request processing, and inventory tracking through a modular full-stack architecture.

### Advantages

The system centralizes operational records and reduces dependency on ad hoc communication. Compatibility checks are explicit and verifiable. Schema constraints improve data integrity, and middleware boundaries enforce controlled access.

### Limitations

Certain frontend scripts reference `/api/donors/*` endpoints while active server mounts expose donor compatibility through `/api/users/search/:bloodGroup`. This route inconsistency can affect selected UI paths and requires harmonization. In addition, automated testing coverage is limited in the current repository.

### Future scope

Future work can include endpoint contract harmonization, request ownership rules, status-transition governance, notification integration, audit logging, and automated integration tests. Analytical extensions for stock trend monitoring and urgency forecasting can further improve operational readiness.

# 6. References

1. Repository implementation files under `server.js`, `routes/`, `models/`, `middleware/`, and `public/`.
2. Express.js and middleware-based API design patterns as applied in this implementation.
3. MongoDB and Mongoose schema validation practices used for domain constraints.
4. JWT-based authentication and role-aware authorization workflows.
