# 1. Introduction

## Abstract

The BloodLink platform is implemented as a web-based coordination system for blood donation and emergency blood request management. The system integrates donor profile maintenance, blood-group-compatible donor discovery, request lifecycle recording, and inventory visibility into a single application stack. The implementation uses Node.js and Express for service orchestration, MongoDB for persistent data storage, and role-aware authentication controls based on JSON Web Tokens.

The operational design emphasizes practical deployment in institutional and community settings where response time and data consistency are critical. Instead of informal communication-based coordination, the system maintains structured records for users, requests, and inventory. Compatibility filtering logic is explicitly encoded using blood-group rules so that donor results are deterministic and medically interpretable.

The developed solution also supports modular expansion. Route-level separation, schema-based validation, and static frontend pages provide a maintainable foundation for future additions such as notifications, analytics, and stronger administrative governance.

## Problem Statement

Blood availability management is often affected by fragmented records, delayed communication between requesters and donors, and the absence of a centralized status view. In manual workflows, the effort required to locate compatible donors and verify blood stock increases rapidly during critical demand periods. These process weaknesses can delay transfusion support and place additional burden on hospital and volunteer networks.

The repository implementation addresses this gap by introducing a centralized digital workflow. User registration and authentication establish identity. Donor participation status and blood group are captured within profile data. Urgency-based blood requests are stored in structured form, and inventory records are updated through API transactions. The resulting architecture improves traceability, reduces repetition in coordination steps, and supports faster operational response.

## 1.1 Objectives

The implementation is designed to satisfy the following objectives:

1. Establish a centralized and persistent data model for users, donor attributes, requests, and inventory.
2. Enforce secure API access using token-based authentication and role-dependent authorization.
3. Provide deterministic donor search based on blood-group compatibility and current donor availability.
4. Record and expose urgency-level blood requests for rapid operational awareness.
5. Support inventory monitoring and add/subtract transactions for each blood group.
6. Maintain data integrity through schema constraints, enum validations, and minimum value checks.

## 1.2 Existing System

In existing non-digital or partially digital workflows, donor and request information is commonly shared across calls, messaging groups, spreadsheets, or handwritten logs. The process is person-dependent and difficult to audit. Compatibility checks are frequently manual, and donor availability status may remain outdated after circumstances change.

Such workflows are vulnerable to inconsistency under concurrent requests. When multiple emergency cases arise, teams spend substantial time reconciling data from separate sources rather than acting on a unified and validated state. These shortcomings motivate the need for a structured, API-driven coordination platform.

## 1.3 Proposed System

The proposed system is organized into three major layers. The presentation layer contains static HTML/CSS/JavaScript pages for public information, user login/register flows, profile updates, donor search, dashboard views, emergency request feeds, and admin operations. The application layer contains Express route modules for authentication, user operations, request handling, inventory handling, and admin-restricted functions. The persistence layer uses Mongoose schemas to enforce field types and constraints for each business entity.

A normal workflow begins with user registration and login, followed by token-protected profile operations. When a user opts in as a donor, blood-group and availability fields become part of eligibility filtering. Request creation stores patient and urgency details, while inventory APIs provide stock visibility and updates. Collectively, these modules form an end-to-end blood coordination pipeline with explicit access boundaries and structured state management.

# 2. Literature Survey

Current blood management systems in academic and practical deployments generally converge on five design expectations: authenticated identity, blood-group correctness, request prioritization, inventory observability, and administrative control. The implemented repository follows this pattern through modular APIs and strongly typed schemas.

From a software architecture perspective, modular route decomposition is recognized as an effective approach for maintainability. In this project, separate route files are used for `auth`, `users`, `requests`, `inventory`, and `admin` concerns. This separation reduces coupling and allows independent enhancement of each functional area.

Security practices in comparable systems prioritize stateless sessions and middleware-guarded routes. The platform adopts JWT verification in middleware and restricts privileged actions to authorized users and administrators. Data quality is enforced at schema level through enumerations for blood groups and urgency levels, unique constraints for email and blood-group inventory records, and numeric lower bounds for required units.

Another recurring pattern in real-world systems is dashboard-based transparency. The repository supports public aggregate donor counts and near-real-time request visibility via periodic client polling. This aligns with institutional needs where rapid awareness of critical demand can improve decision response.

# 3. Methodology

The project methodology follows a full-stack, API-centered implementation model. Domain entities are defined in Mongoose schemas, route handlers implement business rules, middleware enforces authentication/authorization, and browser clients invoke APIs through fetch-based requests. Functional responsibilities are distributed so that each module has a clearly bounded scope.

## 3.1 Proposed Model/Architecture

The deployed architecture can be interpreted as a layered request-response system:

1. **Client Layer:** Static pages in `public/` present forms, dashboards, and donor search interfaces.
2. **Service Layer:** Express routes expose REST-style endpoints under `/api/*` namespaces.
3. **Security Layer:** `protect` middleware validates bearer tokens, and `admin` middleware enforces role checks.
4. **Data Layer:** MongoDB collections store user, request, and inventory documents through Mongoose models.

The server bootstrap in `server.js` loads middleware, establishes MongoDB connectivity, mounts route modules, and serves static frontend assets. This centralized startup flow enables consistent deployment behavior.

## 3.2 Datasets

No external benchmark dataset is used in this project. Instead, the system operates on transactional application data created during normal use. The effective datasets are as follows:

- **User Dataset (`users` collection):** Contains identity fields (name, email), login credentials (hashed password), profile metadata (phone, location), and donor-specific attributes (`isDonor`, `bloodGroup`, `availabilityStatus`, `lastDonationDate`).
- **Request Dataset (`requests` collection):** Stores patient name, required blood group, number of units, hospital details, urgency level, request status, and creation timestamp.
- **Inventory Dataset (`inventories` collection):** Maintains blood-group-wise stock counts, uniqueness per group, and last update time.

These datasets are schema-governed and form the basis for donor search, emergency feeds, and inventory dashboards.

## 3.3 Algorithm(Title if any)

### Blood Group Compatibility Matching Algorithm

The donor retrieval logic is implemented through deterministic compatibility mapping. Each donor blood group maps to a list of recipient groups. For a requested patient group, the algorithm computes all donor groups whose recipient list contains that patient group.

Algorithmic flow:

1. Accept patient blood group from route parameter.
2. Traverse compatibility map entries (`donorGroup -> recipientGroups`).
3. Collect donor groups that can serve the patient group.
4. Query user records with constraints: donor enabled, compatible blood group, and `Available` status.
5. Return only essential donor fields for contact and decision support.

Representative code:

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

This approach avoids probabilistic ranking and provides transparent compatibility decisions suitable for healthcare-oriented review.

## 3.4 Performance Metrics

The implemented repository does not include a formal benchmarking harness, but practical performance and correctness can be evaluated using operational metrics:

- **Authentication correctness:** Success and rejection behavior across register, login, and protected profile APIs.
- **Compatibility response quality:** Accuracy of donor group matching and filtering of unavailable donors.
- **Request feed timeliness:** Delay between request creation and visibility on dashboard/emergency pages using periodic polling.
- **Inventory transaction integrity:** Correctness of add/subtract updates and prevention of negative unit states.
- **Authorization enforcement:** Correct issuance of `401` or `403` responses for unauthorized actions.

These metrics are directly measurable from the existing API behavior and frontend interaction flows.

# 4. Results and Discussion

Repository-level verification indicates that the core system pipeline is operational. The authentication module supports registration and login, with JWT generation and profile retrieval under protected routes. User profile updates allow transition into donor mode and record availability metadata required for search eligibility.

Donor discovery is functionally implemented through the compatibility map and filtered database query. Request management stores emergency details with urgency classifications and exposes request lists sorted by recency. Inventory endpoints provide blood-group-wise status and transactional updates, while helper initialization supports bootstrapping all blood groups.

Frontend pages demonstrate end-user task separation: public home statistics, authenticated profile updates, donor search interface, request creation forms, and inventory visualization cards. Polling mechanisms in client scripts provide repeated refresh for emergency awareness and inventory visibility.

A notable implementation observation is route inconsistency in selected frontend scripts. Certain client calls reference `/api/donors/*`, whereas server-mounted routes include `/api/users/search/:bloodGroup` for donor compatibility retrieval. The platform remains functionally extensible, but harmonizing these endpoint contracts would improve deployment consistency.

# 5. Conclusion & Future scope

The implemented system provides a structured and technically coherent solution for blood coordination workflows. It combines secure identity management, medically aligned donor compatibility logic, urgency-aware request recording, and inventory tracking within a modular web architecture.

### Advantages

The system centralizes operational data and reduces reliance on ad hoc communication channels. Compatibility filtering is explicit and auditable. Schema-level validation improves data quality, and middleware boundaries establish clear access control for protected and administrative operations.

### Limitations

The repository presently shows partial mismatch between some frontend donor API calls and active server route mounts. Request creation is protected, yet listing is broadly accessible, which may require policy refinement for privacy-sensitive deployments. Automated test scripts are minimal, so regression assurance depends largely on manual verification.

### Future scope

Future enhancements can include endpoint harmonization, request ownership and lifecycle governance, notification integration (SMS/email/push), audit logging, and stronger automated testing for critical workflows. Analytical modules for demand prediction and stock trend visualization can further improve institutional readiness.

# 6. References

1. Repository source code: `server.js`, `routes/*.js`, `models/*.js`, `middleware/*.js`, and frontend files under `public/`.
2. Express.js middleware and routing model as reflected in implementation structure.
3. MongoDB with Mongoose schema validation patterns used throughout the project.
4. JSON Web Token based session handling used in authentication middleware.
