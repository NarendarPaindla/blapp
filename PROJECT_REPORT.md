# 1. Introduction

## Abstract

The BloodLink application is implemented as a web-based blood donation and request management platform using a Node.js–Express backend, MongoDB persistence, and browser-based interfaces. The system consolidates user registration, authenticated access, donor profile maintenance, blood request creation, and inventory visibility into one workflow. Core entities are modeled as separate collections for users, requests, and blood inventory, with role-based controls for administrative operations.

The implemented design supports operational requirements commonly seen in academic prototype deployments: controlled data entry, clear status representation, and modular API endpoints that can be extended in later phases. Instead of relying on disconnected manual communication, the platform introduces a single service boundary for request intake and donor discovery logic.

## Problem Statement

Blood coordination in small hospitals and community-level blood drives is often delayed by fragmented donor records, low traceability of request status, and dependence on informal communication channels. The practical difficulty is not only identifying compatible blood groups, but also maintaining updated donor availability and handling urgent requests in a time-bound manner. The present implementation addresses this by introducing authenticated workflows, normalized data models, and API-based retrieval for requests, donor statistics, and inventory.

## 1.1 Objectives

The implemented system is designed around the following objectives:

1. To provide secure user onboarding and authentication using JWT-based session tokens.
2. To maintain structured user and donor profile attributes such as blood group, donation history, and availability status.
3. To enable creation and retrieval of blood requests with urgency metadata.
4. To maintain blood inventory entries per blood group and support additive/subtractive updates.
5. To enforce role-based boundaries so that user management and inventory administration are restricted to admin accounts.
6. To provide public and authenticated views for donor availability trends and emergency request visibility.

## 1.2 Existing System

In conventional settings, blood requirement fulfillment is frequently handled through phone calls, local spreadsheets, and ad hoc donor contact lists. Such approaches lack synchronized records, making it difficult to determine whether listed donors are active, eligible, or reachable at the time of need. Request lifecycle tracking is generally informal, which reduces accountability and introduces repeated follow-ups.

Another common limitation is weak data validation: blood group values, contact fields, and urgency labels may be recorded with inconsistent formats. This leads to avoidable errors when data is exchanged among operators. Administrative oversight is also minimal because there is no unified access model for privileged actions such as user moderation or inventory correction.

## 1.3 Proposed System

The proposed implementation is a full-stack, API-driven application that integrates identity, request handling, and inventory operations under a single server. The server exposes route groups for authentication, users, admin controls, requests, and inventory. MongoDB models enforce constraints through schema-level validation, enum restrictions, and lifecycle hooks such as password hashing and inventory timestamp updates.

From a usage perspective, users register and log in through web pages, update profile details, optionally mark themselves as donors, and create blood requests. Admin users access dedicated pages for user list maintenance and inventory updates. Public pages display aggregate donor statistics while avoiding exposure of sensitive profile data.

# 2. Literature Survey

Digital blood management systems in prior work generally converge on three architectural principles: centralized donor repositories, compatibility-aware search, and urgency-based request handling. Institutional deployments also emphasize data confidentiality, because donor identity and contact details must be exposed only under controlled access.

In this implementation, similar principles are reflected through schema design and route partitioning. Blood group compatibility is encoded as deterministic rules within server-side logic, while privileged endpoints are protected by authentication and role middleware. The approach aligns with common academic findings that rule-based matching can produce reliable baseline performance before introducing advanced predictive ranking.

Existing literature also reports that prototype success depends heavily on maintainable module boundaries. The BloodLink codebase follows this pattern by separating models, middleware, and route handlers, allowing easier extension toward notification services or analytics in future versions.

# 3. Methodology

The methodological flow follows a layered pattern: presentation interfaces collect data, API endpoints validate and process requests, and MongoDB collections persist state. Data transfer occurs in JSON format between frontend scripts and backend routes. Authentication tokens are stored client-side and attached to protected API calls through the Authorization header.

The implementation additionally includes periodic polling on selected screens (for inventory and request feeds) so that users see near-real-time updates without manual refresh. This design keeps the client side simple while still providing operational responsiveness for emergency contexts.

## 3.1 Proposed Model/Architecture

The system follows a three-tier structure.

**Presentation layer:** Static HTML pages with shared CSS and page-level JavaScript manage user interactions such as registration, login, request creation, profile updates, and admin operations.

**Application layer:** Express route modules process business operations:
- `authRoutes` for registration, login, and authenticated profile retrieval.
- `userRoutes` for profile update, donor search, and donor statistics.
- `requestRoutes` for blood request creation and listing.
- `inventoryRoutes` for inventory retrieval and quantity updates.
- `adminRoutes` for protected administrative operations.

**Data layer:** Mongoose models (`User`, `Request`, `Inventory`, `Donor`, `Donation`) define persistent entities with validation, constraints, and defaults.

### Module-wise Explanation

The authentication module issues JWT tokens and validates user credentials with bcrypt-based password comparison. The user module captures donor-related fields and performs compatibility-based search over available donors. The request module stores emergency and routine requests with urgency and status attributes. The inventory module tracks units per blood group and prevents negative deductions. The admin module enforces privileged controls for user deletion and inventory editing.

### Workflow / Data Flow

A typical authenticated flow begins with user registration and login. On successful login, tokenized user details are stored in browser local storage. Protected pages attach the bearer token through a shared helper and invoke profile or management endpoints. For blood requests, the UI posts request payloads to the server, and request cards are periodically refreshed from the request listing endpoint. Inventory dashboards similarly poll inventory endpoints and render status-coded cards by blood group.

## 3.2 Datasets

No external benchmark dataset is imported in the current repository. The working dataset is transactional and application-generated, stored in MongoDB collections.

The principal data entities are:

- **Users dataset:** identity fields (`name`, `email`, `phone`, `location`), credential hash, role, and donor attributes.
- **Requests dataset:** patient details, required blood group, units, hospital name, urgency level, and request status.
- **Inventory dataset:** blood group and available units with auto-updated timestamps.
- **Optional donor/donation datasets:** schema definitions exist for donor-centric and donation logging extensions.

Data quality is maintained through required fields, enum constraints for blood groups and status labels, regex validation for email and donor phone format, and unique keys such as user email and inventory blood group.

## 3.3 Algorithm (Compatibility-Based Donor Selection)

The implemented matching logic uses a deterministic donor-compatibility mapping. For a given patient blood group, the server traverses a donor-to-recipient compatibility table and derives the donor blood groups that can safely donate to that patient type. It then filters records to include only donor-enabled users with `availabilityStatus = Available`.

A concise representation of the implemented flow is shown below.

```text
Input: patientBloodGroup
1. compatibleGroups ← {donorGroup | patientBloodGroup ∈ compatibility[donorGroup]}
2. donors ← Users where isDonor = true
                   and bloodGroup ∈ compatibleGroups
                   and availabilityStatus = 'Available'
3. Return donor fields required for contact and triage
```

This approach ensures explainable behavior and direct alignment with transfusion compatibility rules encoded in application logic.

## 3.4 Performance Metrics

The repository does not include a formal benchmarking harness, but the implementation naturally supports the following measurable indicators during deployment testing:

1. **Authentication reliability:** successful login/registration responses and token-protected endpoint access rate.
2. **Request processing responsiveness:** latency from request submission to visibility in the request feed.
3. **Donor retrieval correctness:** compatibility-compliant donor lists for each requested blood group.
4. **Inventory consistency:** correctness of additive/subtractive updates and prevention of negative stock transitions.
5. **Role-enforcement integrity:** rejection rate of admin-only operations for non-admin users.

# 4. Results and Discussion

The implemented prototype demonstrates a complete operational cycle covering user onboarding, profile maintenance, request creation, and inventory monitoring. Public users can view aggregate donor availability, authenticated users can maintain donor metadata and submit blood requests, and administrators can perform user and inventory supervision.

The codebase reveals several strengths in practical terms. Schema-level validation improves data consistency, JWT middleware secures private routes, and model-level hooks reduce implementation errors (for example, automatic password hashing). Client-side polling supports near-live dashboards for emergency requests and inventory updates without introducing additional infrastructure.

At the same time, analysis of route integration indicates a deployment gap: the repository contains `donorRoutes.js`, and frontend scripts call `/api/donors/...`, but this route module is not mounted in `server.js`. In current form, donor-specific endpoints from that module are therefore unavailable unless route registration is added. This is an implementation limitation rather than a conceptual issue and can be resolved in one server configuration update.

# 5. Conclusion & Future scope

The system is structured as a modular academic prototype that successfully digitizes key blood-bank coordination tasks: authenticated user management, donor-aware profile handling, blood request registration, and inventory updates. The architecture is suitable for incremental scaling because model definitions, middleware, and route logic are cleanly separated.

Future work can improve production readiness through integration of notification channels, stronger audit trails for request-status transitions, route-level rate limiting, and optional geographic ranking for donor prioritization. A complete activation of currently defined donor and donation modules would further enrich functionality and reporting depth.

# 6. References

1. Node.js Documentation. https://nodejs.org/
2. Express.js Documentation. https://expressjs.com/
3. Mongoose Documentation. https://mongoosejs.com/
4. JSON Web Token (JWT) Introduction. https://jwt.io/introduction
5. bcrypt.js package reference (npm). https://www.npmjs.com/package/bcryptjs
6. MongoDB Manual. https://www.mongodb.com/docs/
