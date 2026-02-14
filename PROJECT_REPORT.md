1. Introduction

Blood is a critical and non-substitutable resource in healthcare systems. Timely blood availability directly affects survival probability in trauma care, emergency surgery, postpartum hemorrhage, oncology treatment, thalassemia management, and major elective procedures. In many institutions, blood request coordination is still performed through telephonic escalation, informal messaging groups, spreadsheet logs, and manually maintained donor lists. These mechanisms may function in low-load conditions but typically fail to provide predictable response quality under urgent demand spikes.

This report presents the complete design, implementation, and evaluation of a full-stack Blood Donation and Request Management System developed from scratch using a modular web architecture. The system digitizes donor lifecycle management, request generation and tracking, inventory visibility, and role-controlled administration. The project objective is not only to build an application interface, but to engineer a practical coordination platform where data quality, operational traceability, and security controls are treated as first-class requirements.

The implementation documented in this report is grounded in the actual repository structure and code modules, including backend APIs, middleware, models, static frontend pages, and client-side integration scripts. Instead of generic conceptual writing, each section explains how modules were built, why particular design decisions were made, and how components interact in a production-like workflow.

Diagram description (Figure 1: High-Level Context Diagram):
A context diagram can be represented with four external actors—Donor, Requesting User/Hospital, Admin Coordinator, and Blood Bank Operator—connected to the central Blood Donation System. Inbound flows: registration data, profile updates, emergency requests, inventory transactions. Outbound flows: donor compatibility results, request status visibility, and inventory dashboards.

1.1 Objectives

The project was implemented with the following academic and engineering objectives:

- Build a centralized platform for donor registration, emergency request handling, and inventory visibility.
- Enforce secure user authentication and token-based authorization for protected API access.
- Implement role-based access control for admin operations (user oversight and controlled inventory mutation).
- Integrate blood-group compatibility logic for donor retrieval to reduce manual coordination delay.
- Capture operationally relevant donor and request metadata such as urgency, availability, and donation history.
- Improve traceability by storing standardized records with schema-level validation rules.
- Deliver a modular repository structure that can be extended with notification pipelines and analytics.
- Document a complete implementation workflow suitable for final-year B.Tech/M.Tech submission and replication.

1.2 Existing System

In many small and medium healthcare ecosystems, the existing workflow for blood coordination is fragmented and human-dependent. Typical practices include maintaining donor contacts in personal notebooks or ad hoc spreadsheets, escalating urgent requests via phone calls, and manually validating blood-group compatibility during emergencies.

Major limitations of the existing approach:

- Data fragmentation: donor and request records are distributed across multiple unmanaged sources.
- Poor state visibility: requesters cannot consistently track request lifecycle status.
- High operational latency: matching and outreach require repeated manual effort.
- Governance gaps: sensitive personal information may be shared through non-secure channels.
- Inconsistent eligibility handling: recent donation intervals and availability are often not codified.
- Weak reporting capacity: no reliable data foundation for performance analysis or planning.

Observed practical consequences:

- Critical requests experience delays during peak load periods.
- Duplicate outreach attempts increase volunteer fatigue.
- Inventory planning becomes reactive rather than predictive.

1.3 Proposed System

The proposed system is a full-stack web application that unifies donor management, request management, and inventory operations under one maintainable architecture. It is designed to replace informal coordination with structured APIs, validated data models, and role-protected workflows.

Core capabilities implemented:

- User registration and login with JWT-based session model.
- Profile management with optional donor activation and availability controls.
- Dedicated donor registration endpoint with eligibility-aware status handling.
- Emergency request submission with urgency-level annotation.
- Inventory listing and update operations by blood group.
- Compatibility-aware donor search through deterministic blood-group rules.
- Admin-only routes protected by combined auth and role middleware.

Innovation and practical contribution:

- Converts a socially important but operationally informal process into a measurable digital workflow.
- Uses schema-level constraints to improve data quality at source.
- Implements modular route segmentation for long-term maintainability.
- Provides implementation-ready architecture that can scale toward notification-driven orchestration.

Diagram description (Figure 2: Layered Architecture):
A three-layer diagram can show Frontend Presentation Layer (HTML/CSS/JS), API and Business Layer (Express routes + middleware), and Data Persistence Layer (MongoDB with Mongoose schemas). Bidirectional arrows represent request-response and read-write operations.

2. Literature Survey

Digital blood management literature indicates a gradual transition from donor registry systems to integrated coordination platforms. Earlier work primarily focused on inventory balancing and minimizing wastage. Recent studies increasingly combine donor engagement, urgent request prioritization, and secure health-data handling.

Survey dimensions considered for this project:

- Donor recruitment and retention systems.
- Blood inventory optimization frameworks.
- Emergency response and routing systems.
- Security architecture for healthcare-adjacent applications.
- Data analytics for demand forecasting and shortage prediction.

Key findings from the literature:

- Centralized donor registries improve retrieval efficiency only when data is continuously validated.
- Urgency-aware request pipelines provide better real-world outcomes than unprioritized request queues.
- Security-by-design is mandatory due to contact data sensitivity and misuse risk.
- Explainable deterministic matching is often preferred in early deployment phases over opaque models.
- Many prototypes omit implementation depth and cannot be replicated from published descriptions.

Research gaps identified:

- Limited academic reports provide end-to-end module-level development details.
- Several systems discuss architecture abstractly but do not connect it to concrete repository layout.
- Practical middleware-level authorization patterns are often under-documented.
- Few studies show how frontend polling or live dashboard updates can be implemented with minimal complexity.

Positioning of this project:

This work addresses those gaps by presenting a repository-grounded, implementation-focused report that documents architecture, modules, route behavior, schema design, and integration workflow in reproducible detail.

Diagram description (Figure 3: Comparative Evaluation Matrix):
A table can compare surveyed systems against criteria such as compatibility logic, request state handling, access control, inventory support, and implementation reproducibility. The proposed system should score high on modularity and practical deployability.

3. Methodology

The project follows an iterative engineering methodology combining domain modeling, incremental implementation, and verification-driven refinement.

Phase 1: Requirement Engineering

- Identified actors (users, donors, admins, request initiators).
- Defined functional requirements (registration, request creation, donor search, inventory updates).
- Defined non-functional requirements (security, responsiveness, maintainability, traceability).

Phase 2: Architecture Design

- Structured the application into backend, middleware, data models, and frontend modules.
- Defined route namespaces and protected-route boundaries.
- Standardized schema fields and enum constraints.

Phase 3: Incremental Module Development

- Implemented authentication first to establish identity context.
- Built donor and request modules next to validate core workflow.
- Added inventory and admin modules for operational governance.
- Integrated frontend pages and JavaScript fetch-based API interactions.

Phase 4: Validation and Discussion

- Performed endpoint-level checks and scenario-driven workflow testing.
- Evaluated output quality against functional objectives and operational expectations.

Diagram description (Figure 4: Development Lifecycle Flow):
A process flow can depict Requirements -> Architecture -> Module Implementation -> Integration -> Testing -> Evaluation -> Documentation.

3.1 Proposed Model / Architecture

The system uses a modular web architecture:

- Presentation Layer: static HTML pages and JS scripts under `public/`.
- Application Layer: Express server with route files and middleware.
- Data Layer: MongoDB collections managed with Mongoose models.

Control-flow principles:

- Each functional domain has a dedicated route module (`auth`, `user`, `request`, `inventory`, `admin`, `donor`).
- Authentication is centralized via JWT middleware.
- Role enforcement is separated into dedicated role middleware.
- Data integrity is enforced via schema definitions.

Request processing sequence:

1. Frontend captures user input from forms.
2. Fetch API sends structured payload to backend endpoint.
3. Middleware validates token and role for protected operations.
4. Route handler performs business logic and persists updates.
5. Response is returned as JSON and rendered by the frontend.

3.2 Datasets (if applicable)

This project uses application-generated operational datasets rather than external benchmark datasets. Data is collected through normal platform usage and organized into the following logical groups:

- User dataset: identity, contact fields, role, donor flags.
- Donor dataset: blood group, availability, last donation date.
- Request dataset: patient requirement, urgency, units, hospital details.
- Inventory dataset: blood-group-level stock and update timestamps.
- Donation dataset: event-level donor-linked donation records.

Data controls implemented:

- Enum constraints for blood groups and status-like fields.
- Required fields for critical request and user attributes.
- Unique constraints to prevent duplicate user emails and inventory group entries.
- Numeric bounds for units and stock quantities.

3.3 Algorithm (Compatibility-Driven Donor Retrieval)

Title: Compatibility-Driven Donor Retrieval with Availability Filtering (CDDR-AF)

Objective:
Return only donors who are blood-group compatible with the requested group and currently available.

Algorithm logic:

- Define donor compatibility mapping (`donorGroup -> recipient groups`).
- For a requested patient group, identify all donor groups that can donate to it.
- Query donor/user records where group is in compatible set and availability is `Available`.
- Return selected fields to reduce unnecessary data exposure.

Pseudocode:

```text
INPUT: patientGroup
compatibleDonorGroups = []
for each (donorGroup, recipients) in donorCompatibility:
    if patientGroup in recipients:
        compatibleDonorGroups.push(donorGroup)

OUTPUT = find donors where:
    bloodGroup in compatibleDonorGroups
    AND availabilityStatus == 'Available'
return OUTPUT
```

Rationale for deterministic approach:

- Easy to validate and explain.
- Minimal runtime overhead.
- Suitable for medium-sized deployments.
- Extendable with additional ranking parameters (distance, reliability, response history).

3.4 Performance Metrics

Evaluation metrics were selected across both software and operational perspectives.

Technical metrics:

- API response time for critical endpoints.
- Endpoint success/failure ratios.
- Authentication validation consistency.
- Input validation rejection rates.

Operational metrics:

- Mean time to generate compatible donor shortlist.
- Critical request handling responsiveness.
- Request processing transparency through lifecycle visibility.
- Inventory update accuracy and consistency.

Engineering quality metrics:

- Security boundary integrity (protected/admin route compliance).
- Maintainability (modular route/model separation).
- Extensibility readiness (ease of adding services and integrations).

4. Implementation of the Project (Step-by-Step Module-wise Development)

This section explains the full implementation path from initial setup to deployment, mapped directly to repository modules. The goal is to teach a new developer how to rebuild the complete project.

4.1 Technology Stack Selection

Before implementation, technology choices were made based on simplicity, maintainability, and fit for rapid academic deployment.

Backend stack:

- Node.js runtime for asynchronous event-driven request processing.
- Express.js for lightweight REST API development.
- Mongoose ODM for schema management and MongoDB interaction.
- JWT for token-based authentication.
- bcryptjs for password hashing.
- dotenv for environment configuration.

Frontend stack:

- HTML/CSS for static page rendering.
- Vanilla JavaScript for form handling, fetch integration, and dynamic DOM rendering.

Database stack:

- MongoDB for document-centric storage suitable for evolving project schemas.

Why this stack:

- Strong ecosystem and low setup complexity.
- Rapid prototyping without sacrificing architectural clarity.
- Suitable for converting to production-grade modular services.

4.2 System Requirements (Hardware & Software)

Hardware requirements:

- Processor: 64-bit dual-core or higher.
- RAM: 8 GB minimum (16 GB recommended for smoother local dev).
- Storage: minimum 5 GB free space.

Software requirements:

- Node.js (LTS recommended).
- npm package manager.
- MongoDB local server or cloud instance.
- Browser for UI verification.
- Optional API tools (Postman/Insomnia).

Environment setup:

```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/blood-donation-system
JWT_SECRET=<secure-secret>
```

4.3 Project Folder Structure (Backend & Frontend if applicable)

Explanation before structure:

The repository is intentionally organized by concern boundaries. Backend business domains are separated into models, routes, and middleware. Frontend assets are grouped under `public/` so the server can expose them as static resources.

Code structure:

```text
blapp/
  server.js
  package.json
  models/
    User.js
    Donor.js
    Request.js
    Inventory.js
    Donation.js
  middleware/
    authMiddleware.js
    roleMiddleware.js
  routes/
    authRoutes.js
    userRoutes.js
    donorRoutes.js
    requestRoutes.js
    inventoryRoutes.js
    adminRoutes.js
  public/
    index.html
    login.html
    register.html
    user-dashboard.html
    admin-dashboard.html
    emergency.html
    dashboard.html
    profile.html
    search-donors.html
    css/styles.css
    js/main.js
    js/dashboard.js
    js/donor.js
    js/emergency.js
```

4.4 Database Design (Schema / Collections / Tables with explanation)

Explanation before schema representation:

The data model was designed to reflect operational actors and transactions while preserving validation boundaries at the schema level.

Collection 1: users

Purpose:
Stores all registered accounts and authentication-linked profile data.

Important fields:

- `name`, `email`, `password`, `phone`, `location`
- `role` (`user`, `admin`)
- donor extension fields: `isDonor`, `bloodGroup`, `lastDonationDate`, `availabilityStatus`

Collection 2: donors

Purpose:
Maintains donor records for direct donor module operations.

Important fields:

- `name`, `age`, `bloodGroup`, `phone`, `location`
- `lastDonationDate`, `availabilityStatus`

Collection 3: requests

Purpose:
Captures emergency and normal blood requests.

Important fields:

- `patientName`, `requiredBloodGroup`, `unitsRequired`, `hospitalName`
- `urgencyLevel` (`Normal`, `Urgent`, `Critical`)
- `requestStatus` (`Pending`, `Fulfilled`, `Cancelled`)

Collection 4: inventory

Purpose:
Tracks available stock by blood group.

Important fields:

- `bloodGroup` (unique)
- `availableUnits`
- `lastUpdated`

Collection 5: donations

Purpose:
Stores historical donation records linked to users.

Important fields:

- `donor` reference to `User`
- `donationDate`, `bloodGroup`, `units`, `location`, `notes`

4.5 Backend Development

Project Initialization

Step 1: Initialize Node project and install dependencies.

```bash
npm init -y
npm install express mongoose cors body-parser dotenv bcryptjs jsonwebtoken nodemon
```

Step 2: Create server bootstrap file and module folders.

Step 3: Configure npm scripts (`start`, `dev`).

Configuration

`server.js` implementation sequence:

- Load environment variables.
- Initialize Express app.
- Register middleware (`cors`, `bodyParser`, static files).
- Connect to MongoDB.
- Mount route modules by namespace.
- Start HTTP server.

Model Creation

The model development workflow:

1. Define schema fields and domain constraints.
2. Add pre-save hooks where required (password hash, inventory timestamp).
3. Add instance methods (password match helper).
4. Export models and consume in route modules.

Repository Layer

Current implementation note:

- Route files directly execute Mongoose operations.
- Repository abstraction is implicit rather than separate classes.

Suggested enhancement:

- Move persistence operations to dedicated repository files to improve unit testing and reuse.

Service Layer

Current state:

- Business logic is embedded in route handlers and helper maps.

Examples:

- Compatibility computation in donor and user routes.
- Donor availability rules during donor registration.
- Inventory arithmetic inside inventory/admin routes.

Suggested enhancement:

- Extract service modules (`authService`, `donorService`, `inventoryService`, `requestService`).

Controller Layer

Current state:

- Route callbacks function as controllers.

Responsibilities handled:

- Input extraction and validation.
- Core business operations.
- Success/error JSON responses.

Suggested enhancement:

- Split controllers into dedicated files to simplify route definitions and error orchestration.

API Endpoints with sample request/response

Auth API: Register

`POST /api/auth/register`

```json
{
  "name": "Meera Nair",
  "email": "meera.nair@example.com",
  "password": "Secure@123",
  "phone": "9876543210",
  "location": "Kochi"
}
```

Sample response:

```json
{
  "_id": "6601f3a9...",
  "name": "Meera Nair",
  "email": "meera.nair@example.com",
  "role": "user",
  "token": "<jwt>"
}
```

Auth API: Login

`POST /api/auth/login`

```json
{
  "email": "meera.nair@example.com",
  "password": "Secure@123"
}
```

User API: Profile update

`PUT /api/users/profile` (Bearer required)

```json
{
  "isDonor": true,
  "bloodGroup": "O+",
  "availabilityStatus": "Available",
  "lastDonationDate": "2025-01-15"
}
```

Request API: Create request

`POST /api/requests` (Bearer required)

```json
{
  "patientName": "Arjun Das",
  "requiredBloodGroup": "A-",
  "unitsRequired": 2,
  "hospitalName": "City Multispeciality",
  "urgencyLevel": "Critical"
}
```

Inventory API: Update units

`PUT /api/inventory/update`

```json
{
  "bloodGroup": "A-",
  "quantity": 3,
  "operation": "add"
}
```

4.6 Frontend Development (if applicable)

Project Setup

The frontend was built as static pages served by the backend, reducing deployment complexity and ensuring direct route-to-page mapping.

Routing Setup

The UI uses multi-page navigation model:

- Home (`index.html`)
- Login/Register (`login.html`, `register.html`)
- User/Admin dashboards (`user-dashboard.html`, `admin-dashboard.html`)
- Emergency and donor pages (`emergency.html`, `search-donors.html`, etc.)

Component Structure

Core UI components include:

- Emergency request submission form.
- Request listing cards with urgency badges.
- Inventory cards with status color indicators.
- Donor cards for compatible search output.
- Shared emergency alert banner.

UI Design

Design goals:

- readable hierarchy for critical information,
- urgency emphasis through color classes,
- feedback messages for user actions,
- responsive and uncluttered layout for operational use.

API Integration

Client integration pattern:

- gather input from form elements,
- call backend endpoint with fetch,
- parse JSON response,
- render cards/alerts or show validation message,
- poll selected endpoints for near real-time dashboard refresh.

4.7 Authentication & Authorization Flow

Complete flow:

1. User registers/logs in through auth routes.
2. Backend validates credentials and issues JWT token.
3. Frontend stores token in `localStorage`.
4. Protected API calls attach bearer token header.
5. `protect` middleware verifies token and injects authenticated user context.
6. `admin` middleware enforces role gate for privileged endpoints.

Security significance:

- Prevents unauthorized route access.
- Ensures role separation for critical mutations.
- Establishes auditable identity-linked operations.

4.8 Error Handling & Validation

Validation strategy:

- Schema-level validation for structure and domain correctness.
- Route-level checks for business constraints.
- Middleware-level checks for auth failures.

Common error classes:

- 400: invalid domain input.
- 401: missing/invalid token.
- 404: non-existent resource.
- 500: unhandled server error.

Practical improvement path:

- Add centralized error middleware for uniform API error payloads.
- Add request ID correlation for debugging.

4.9 Testing Strategy

Current verification approach:

- Route-level manual testing via frontend and API calls.
- Scenario tests for login, profile update, emergency requests, donor search, and inventory updates.

Recommended full testing strategy:

- Unit tests: compatibility logic and helper utilities.
- Integration tests: auth flow and protected endpoints.
- Contract tests: request/response schemas.
- UI tests: form workflows and dashboard refresh behavior.
- Security tests: unauthorized access attempts and role bypass checks.

Proposed tools for future extension:

- Jest + Supertest for backend.
- Playwright/Cypress for frontend workflows.

4.10 Deployment Steps

Local deployment steps:

1. Clone repository and install dependencies.
2. Configure `.env` with DB URI and JWT secret.
3. Ensure MongoDB server is reachable.
4. Run application (`npm run dev` or `npm start`).
5. Access UI at `http://localhost:8000`.

Cloud deployment steps (reference):

- Deploy Node service to Render/Railway/VM.
- Use managed MongoDB instance.
- Configure environment variables in hosting panel.
- Enable HTTPS and log monitoring.
- Validate health and protected-route behavior post-deploy.

4.11 Complete Development Workflow from Scratch to Final Deployment

Step-by-step implementation blueprint:

1. Define actors, use-cases, and non-functional requirements.
2. Initialize Node project and dependency stack.
3. Build server bootstrap and MongoDB connection.
4. Implement domain models with validation rules.
5. Implement authentication routes and token middleware.
6. Add user module with donor profile extensions.
7. Implement donor compatibility search endpoints.
8. Implement emergency request module.
9. Implement inventory module with update logic.
10. Add admin module with role-protected endpoints.
11. Build static frontend pages for each workflow.
12. Connect frontend forms to backend APIs with fetch.
13. Add polling for inventory/request awareness.
14. Perform validation-driven testing and error refinement.
15. Prepare deployment configuration and environment management.
16. Deploy application and perform smoke testing.
17. Finalize technical documentation and architectural notes.

How modules connect:

- Auth module establishes identity and trust context.
- User module enriches identity with donor-relevant attributes.
- Donor compatibility logic consumes blood-group data for matching.
- Request module generates demand signals.
- Inventory module provides stock-state visibility and mutation.
- Admin module governs sensitive operations with elevated access.
- Frontend modules orchestrate user interaction and API communication.

5. Results and Discussion

The implemented prototype achieved all primary functional targets and demonstrated stable behavior in representative workflow scenarios.

Functional outcomes:

- Successful registration/login and protected profile access.
- Donor profile activation and availability updates.
- Emergency request generation and listing.
- Compatibility-based donor retrieval.
- Inventory retrieval and controlled updates.
- Admin route access restricted to privileged users.

Discussion of technical significance:

- Modular route and model structure improves maintainability.
- Deterministic compatibility logic improves explainability for healthcare operators.
- Schema validation reduces malformed transactional data.
- Frontend polling delivers practical near-real-time visibility with low implementation overhead.

Operational benefits over manual baseline:

- Faster donor discovery.
- Better visibility into demand urgency.
- Reduced ambiguity in request and stock handling.
- Improved governance readiness through role-aware operations.

Limitations identified:

- No built-in multi-channel notification gateway in current release.
- Status lifecycle is intentionally simple and can be expanded.
- Automated test suite not yet integrated in repository.
- Geolocation-aware ranking not yet implemented.

Recommended next-stage improvements:

- Notification orchestration (SMS/Email/push).
- Advanced request state machine with SLA tracking.
- Geo-prioritized ranking and map-based dispatch support.
- Full CI-integrated test automation.

Diagram description (Figure 5: Performance Dashboard Concept):
A dashboard can display critical request count, fulfilled vs pending trend, donor availability distribution by blood group, and inventory depth indicators.

6. Conclusion & Future Scope

This project demonstrates that blood coordination can be significantly improved by combining modular software architecture with domain-aware workflow design. The developed platform moves from ad hoc communication patterns toward structured, auditable, and scalable operations. It satisfies core academic project requirements while remaining practical for pilot-level institutional deployment.

Key concluding points:

- The system successfully integrates authentication, donor management, request handling, inventory operations, and role-based governance.
- Architecture and code organization support future maintainability and extension.
- Deterministic matching and schema constraints establish a robust functional baseline.

Future scope:

- Add event-driven notifications and escalation workflows.
- Integrate GIS-based proximity and travel-time-aware donor ranking.
- Add predictive demand analytics and shortage forecasting.
- Implement mobile-first donor availability confirmation.
- Add immutable audit trails and compliance-ready consent models.
- Establish complete automated testing and CI/CD pipeline.

7. References

1. World Health Organization publications on blood safety, donation governance, and transfusion quality.
2. National blood transfusion policy and donor eligibility guidelines from public health authorities.
3. Express.js official documentation (routing, middleware, HTTP handling).
4. Mongoose documentation (schemas, validation, middleware, model operations).
5. JSON Web Token standards and secure authentication implementation guidance.
6. Peer-reviewed studies on digital blood donor engagement and emergency blood logistics.
7. Internal repository artifacts: backend routes, middleware, models, frontend integration scripts, and deployment configuration.
