# 1. Introduction

## Abstract

Timely blood availability depends on the coordination of multiple actors: donors, patients, hospital staff, and administrators. In routine practice, this coordination is often slowed by disconnected records and manual communication. The implemented system provides a web-based blood donation and request management platform that unifies registration, donor discovery, emergency request handling, inventory tracking, and administrative supervision. The backend is implemented using Express and MongoDB, while the client interface is delivered through static HTML/CSS/JavaScript pages served by the same Node.js application.

The implementation introduces authenticated access with JWT, role-aware control for administrative operations, blood-group compatibility search, and request lifecycle updates. Data integrity is maintained through schema-level validation in Mongoose models for user identity, donor attributes, request details, and inventory quantities. The resulting platform supports transparent request processing and reduces dependence on ad hoc communication channels.

## Problem Statement

Blood requirement events are time-sensitive, yet donor identification and unit availability are frequently handled through non-standardized mechanisms. Typical operational issues include delayed donor lookup, duplicate outreach to unavailable donors, incomplete request details, and weak auditability of status changes. The problem addressed in this project is the absence of a single system where these workflows can be executed in a secure, validated, and role-controlled manner.

## 1.1 Objectives

The system is designed to achieve the following objectives:

1. Establish a centralized portal for user registration, donor activation, request submission, and blood inventory visibility.
2. Enable secure authentication and profile management using token-based sessions.
3. Implement donor search logic based on blood-group compatibility and availability status.
4. Support emergency and routine blood requests with urgency tagging and status updates.
5. Provide administrator-controlled inventory modification and user governance.
6. Preserve data consistency using model constraints, field validation, and controlled API contracts.

## 1.2 Existing System

In conventional setups, blood coordination is generally distributed across telephone calls, messaging groups, and manually maintained lists. These methods are effective only at very small scale and degrade during concurrent emergency demand. A technical review of such practice indicates major limitations:

- Donor records are rarely synchronized with current availability.
- Compatibility checks are frequently performed manually, creating avoidable errors.
- Requesters do not receive structured status visibility.
- Administrative interventions are not consistently logged through controlled workflows.

Because of these limitations, response time and process reliability become highly dependent on individual effort rather than system design.

## 1.3 Proposed System

The proposed system consolidates blood management into a three-layer web architecture. Users register and authenticate, update donor profile attributes, submit requests, and search for compatible donors through protected APIs. Administrators operate in a privileged context for inventory updates and user management. The system combines backend validation with front-end workflow pages such as login, profile, user dashboard, emergency panel, and admin dashboard.

The implementation is designed for practical deployment in institutional environments where traceable records and role separation are mandatory.

# 2. Literature Survey

Digital healthcare systems increasingly prioritize interoperability, authentication, and near-real-time response for critical resources. Blood service platforms reported in academic and deployment literature generally converge on five technical principles: (i) structured user identity, (ii) donor eligibility and compatibility logic, (iii) urgency-aware request workflows, (iv) inventory intelligence, and (v) administrative governance.

The present implementation aligns with this direction through deterministic blood-group compatibility mapping, role-aware endpoint protection, and schema-based field controls. Instead of adopting a black-box predictive model, it applies an explicit, auditable compatibility strategy suited to institutional acceptance and straightforward verification.

A further observation from existing systems is that usability heavily affects participation. Accordingly, this project includes separate user and admin interfaces and a simplified emergency view for rapid request posting and retrieval.

# 3. Methodology

The methodology combines domain constraints from transfusion workflows with full-stack web engineering practices. Requirements were translated into entities (User, Request, Inventory, Donation/Donor), then exposed through REST endpoints and integrated with page-level JavaScript clients.

## 3.1 Proposed Model/Architecture

### Architectural Design

The deployed structure follows a layered model:

- **Presentation Layer:** Static pages in `public/` for registration, login, dashboards, donor search, profile updates, and emergency operations.
- **Application Layer:** Express route modules (`authRoutes`, `userRoutes`, `requestRoutes`, `inventoryRoutes`, `adminRoutes`) and middleware (`protect`, `admin`) that enforce business rules.
- **Data Layer:** MongoDB collections modeled by Mongoose schemas for users, requests, inventory, donors, and donation records.

### System Architecture and Workflow

1. A user registers through `/api/auth/register`, where profile data is validated and persisted.
2. Password hashing is executed in model middleware before persistence.
3. On login, JWT is generated and returned to the client.
4. Protected routes extract and validate bearer tokens before executing business logic.
5. Donor search uses compatibility mapping to derive eligible donor blood groups for the requested patient group.
6. Requests are created and listed through `/api/requests`; urgency labels are retained as part of the request record.
7. Admin endpoints provide inventory mutation and user deletion under role checks.

### Technology Stack with Justification

The technology selection reflects a balance of implementation speed, maintainability, and suitability for CRUD-heavy healthcare coordination:

- **Node.js + Express:** Uniform JavaScript stack and lightweight API development.
- **MongoDB + Mongoose:** Flexible schema evolution with strong field-level validation and indexing support.
- **JWT (`jsonwebtoken`):** Stateless authentication for scalable API protection.
- **`bcryptjs`:** Password hashing for secure credential storage.
- **HTML/CSS/Vanilla JavaScript:** Lightweight client delivery without framework overhead, suitable for institutional prototypes.

## 3.2 Datasets

The system does not depend on external benchmark datasets. Instead, it constructs operational datasets through transactional use.

### Dataset Entities and Attributes

1. **User Dataset:** Identity (`name`, `email`), security fields (`password` hash), contact fields (`phone`, `location`), role (`user`/`admin`), and donor-related attributes.
2. **Request Dataset:** Patient details, required blood group, units required, hospital, urgency level, status, and creation timestamp.
3. **Inventory Dataset:** Blood group wise stock units and update timestamps.
4. **Donor/Donation Dataset:** Separate donor model with eligibility markers and donation records for potential extension scenarios.

### Data Validation Strategy

- Enumerations restrict blood groups and status fields.
- Numeric constraints enforce minimum required units and non-negative inventory.
- Unique email constraint prevents duplicate account identity.
- Pre-save middleware updates inventory timestamps and hashes passwords.

## 3.3 Algorithm (Blood Group Compatibility and Availability Filtering)

The core matching logic is rule-based and deterministic. Compatibility is represented as a mapping from donor blood group to receivable patient groups. During search, the algorithm computes the donor groups that can serve a given patient group and then filters records by donor availability.

### Algorithm Steps

1. Accept patient blood group as input.
2. Traverse the compatibility dictionary to identify donor groups that include the patient group.
3. Query donor candidates where:
   - `isDonor = true`
   - `bloodGroup` belongs to compatible donor group set
   - `availabilityStatus = 'Available'`
4. Return a constrained projection of fields required for contact and decision support.

### Reference Logic Snippet

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

The same deterministic style is used in legacy donor routes, with an additional 90-day interval check to mark recent donors unavailable.

## 3.4 Performance Metrics

Given the current prototype implementation, meaningful metrics are defined in two categories.

### Technical Metrics

- API response latency for authentication, request creation, donor search, and inventory queries.
- Error ratio for validation failures versus successful transactions.
- Token-protected endpoint access success rate.

### Operational Metrics

- Donor retrieval relevance, measured by blood-group compatibility correctness.
- Time from request creation to visible listing in dashboards.
- Inventory update consistency (requested operation versus persisted units).

These metrics are selected to remain directly measurable from existing endpoints without introducing unsupported instrumentation.

# 4. Results and Discussion

Functional verification confirms that the core end-to-end workflows execute correctly when MongoDB and JWT configuration are available.

- Registration and login flows produce tokenized sessions and role-aware redirects.
- Profile updates enable donor activation and blood-group assignment.
- Search endpoints return compatible, available donors only.
- Request creation stores urgency and patient metadata, and listing endpoints return recent records.
- Inventory management supports additive and subtractive stock updates, while admin-only endpoints enforce privilege checks.

### Module-wise Implementation Discussion

The implementation is modular and route-centric. `authRoutes` controls identity lifecycle, `userRoutes` handles profile and donor search, `requestRoutes` manages blood requests, `inventoryRoutes` exposes stock APIs, and `adminRoutes` applies governance operations over users and inventory. Middleware separation (`protect`, `admin`) improves maintainability and keeps authorization concerns out of business handlers.

The front-end mirrors these modules through dedicated pages. `login.html` and `register.html` establish account workflows, `user-dashboard.html` handles request submission, `search-donors.html` targets compatibility search, `profile.html` manages donor preference data, and `admin-dashboard.html` centralizes administrative control.

# 5. Conclusion & Future scope

The developed system delivers a practical and institution-ready prototype for blood donation and request coordination. By combining secure authentication, compatibility-driven donor retrieval, request tracking, and inventory administration, it addresses several deficiencies of manual blood coordination processes.

### Advantages

The platform provides centralized data handling, deterministic compatibility matching, role-based operational boundaries, and straightforward web deployment using commonly adopted technologies.

### Limitations

The current server wiring does not mount `routes/donorRoutes.js`, even though the module exists. Consequently, APIs such as `/api/donors/register` referenced by certain client scripts are not active in the present runtime configuration. The request API allows public listing but protects creation; this asymmetry is intentional in code but may require policy review for production.

### Future Scope

Future enhancement can focus on the following institutional requirements:

1. Integrate the donor route module into main server routing after harmonizing data models (`User` donor fields vs standalone `Donor` model).
2. Add request ownership, audit trails, and status-transition constraints.
3. Introduce automated notifications (SMS/email/push) for critical urgency cases.
4. Implement analytics dashboards for blood-group scarcity trends and donor participation.
5. Add test suites and API monitoring for production-level reliability assurance.

# 6. References

1. Node.js Official Documentation, https://nodejs.org/
2. Express.js Documentation, https://expressjs.com/
3. MongoDB Documentation, https://www.mongodb.com/docs/
4. Mongoose Documentation, https://mongoosejs.com/docs/
5. JSON Web Token (JWT) Introduction, https://jwt.io/introduction
6. bcryptjs package reference, https://www.npmjs.com/package/bcryptjs
