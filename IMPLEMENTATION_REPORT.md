# 7. Implementation

## 7.1 System Setup

The implementation is carried out using a Node.js runtime with Express as the web framework and MongoDB as the persistence layer. The project is organized as a monolithic full-stack repository in which backend APIs and frontend static resources are maintained together. Backend execution starts from `server.js`, while client interfaces are served from the `public/` directory.

System preparation begins with package installation. All runtime dependencies are declared in `package.json`, and the lock file ensures reproducible installation. The environment must provide Node.js, npm, and a reachable MongoDB instance. The application reads configuration values using `dotenv`, and startup behavior falls back to a local MongoDB URI when `MONGODB_URI` is not supplied.

A standard setup sequence is as follows:

```bash
npm install
```

After dependency installation, environment configuration should be completed in a `.env` file:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/blood-donation-system
JWT_SECRET=your_secure_secret_key
PORT=8000
```

The server can then be started with:

```bash
npm start
```

During startup, the application initializes middleware (`cors`, `body-parser`, and static file serving), establishes MongoDB connectivity, mounts API routes, and starts listening on the configured port. The setup is considered valid when the server prints successful MongoDB connection and port binding logs.

### 7.1.1 Dependency and Technology Justification

The implementation uses **Express** for route modularity and middleware-driven request handling, which is suitable for role-protected API workflows. **Mongoose** is used to enforce domain constraints through schema definitions, including enum validation for blood groups and urgency levels. **JWT** enables stateless session handling for protected endpoints. **bcryptjs** is used for password hashing at model level, ensuring credentials are never stored in plain text. On the frontend, plain HTML/CSS/JavaScript is used to keep deployment lightweight and transparent for academic inspection.

### 7.1.2 Folder and File Organization

The repository follows a clear directory strategy:

- `server.js`: application entry point and route mounting.
- `routes/`: API route handlers (`auth`, `users`, `requests`, `inventory`, `admin`).
- `models/`: Mongoose schemas (`User`, `Request`, `Inventory`, and donor-related models).
- `middleware/`: authentication and role authorization middleware.
- `public/`: static UI pages and client scripts.
- `public/js/`: client-side API integration logic.
- `public/css/`: styling resources.

This structure isolates responsibilities and allows module-wise explanation and testing.

## 7.2 Module-wise Implementation

### 7.2.1 Server Bootstrap Module (`server.js`)

The server bootstrap module is responsible for orchestrating the complete runtime environment. It initializes Express, enables CORS, configures request parsers, serves frontend files, opens MongoDB connectivity, and mounts all route groups under `/api/*`. This module is the integration hub where backend modules become externally reachable.

The route mounting sequence is implemented as:

- `/api/auth` → authentication operations.
- `/api/users` → profile updates, donor search, and stats.
- `/api/admin` → privileged operations.
- `/api/requests` → request lifecycle handling.
- `/api/inventory` → stock status and stock updates.

The same file also maps `/` to `public/index.html`, providing direct browser entry.

### 7.2.2 Authentication Module (`routes/authRoutes.js`)

This module handles registration, login, and authenticated profile retrieval. During registration, the route checks for duplicate users by email and then persists a new user document. Password hashing is not manually coded in the route; it is delegated to the `pre('save')` hook in `models/User.js`, which improves code hygiene and consistency.

Login validates credentials through `matchPassword`, then returns a JWT token with selected user identity fields. The profile endpoint (`GET /api/auth/profile`) is protected by middleware and returns donor-related attributes along with base profile data.

### 7.2.3 User and Donor Module (`routes/userRoutes.js`)

The user module supports two critical operations: profile updates and donor compatibility search. Profile update logic allows users to enable donor participation and provide donor-specific metadata such as blood group, last donation date, and availability status.

The donor search endpoint implements deterministic blood-group compatibility mapping. The algorithm first computes compatible donor groups for the requested recipient group, then queries only users who satisfy all constraints: donor enabled, compatible blood group, and current availability as `Available`.

The module also provides public donor count statistics (`/api/users/stats`) using aggregation. This endpoint enables donor availability display on the public home page without exposing individual donor details.

### 7.2.4 Request Management Module (`routes/requestRoutes.js`)

This module records and retrieves blood request transactions. The create route captures patient details, required group, units, hospital context, and urgency level. Requests are stored with created timestamps and default status values defined by the request schema.

The listing route returns requests ordered by most recent creation time. The update route supports status and field modifications. Together, these APIs provide the data backbone for emergency dashboards and request feeds.

### 7.2.5 Inventory Module (`routes/inventoryRoutes.js`)

The inventory module manages blood stock values. `GET /api/inventory` returns current stock records. `PUT /api/inventory/update` applies add or subtract operations with safeguards against insufficient stock. The module also includes an initialization endpoint that ensures all blood groups exist with default units, which is useful during first-time deployment or test database resets.

### 7.2.6 Administration Module (`routes/adminRoutes.js`)

Administrative APIs are protected with a two-stage security chain: authentication (`protect`) and role verification (`admin`). Once authorized, administrators can retrieve user lists, remove users, and perform inventory adjustments. This module establishes governance boundaries and operational control for privileged tasks.

### 7.2.7 Data Model Module (`models/*.js`)

`models/User.js` defines identity fields, role control, donor fields, and password security hooks. `models/Request.js` defines urgency and status enums with minimum units constraint. `models/Inventory.js` defines unique blood-group records and non-negative stock units with automatic timestamp updates.

Model-level validation ensures domain rules are not dependent solely on frontend checks, thereby preserving data consistency even when APIs are invoked directly.

### 7.2.8 Middleware Module (`middleware/*.js`)

`authMiddleware.js` validates bearer tokens and injects authenticated user context into incoming requests. `roleMiddleware.js` authorizes admin-only operations based on `req.user.role`. This layered approach decouples security from business logic and reduces repetitive checks across route files.

### 7.2.9 Frontend Integration Module (`public/` and `public/js/`)

The frontend is implemented as static multi-page interfaces. Shared authentication helpers are maintained in `public/js/main.js`, while feature-specific behavior is distributed across dedicated scripts:

- `dashboard.js` for inventory rendering and updates.
- `emergency.js` for request creation and request feed rendering.
- `donor.js` for donor form interactions in donor-facing pages.

Client scripts use `fetch` to communicate with backend endpoints and update UI state dynamically.

## 7.3 Code-Level Explanation

### 7.3.1 Authentication and Token Issuance

The token generation utility in the authentication module creates signed JWT payloads with user identity and expiry period. This token is returned on registration and login, then stored in browser local storage for protected API calls.

```javascript
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};
```

This function is used by both `/register` and `/login` flows, ensuring consistent session behavior.

### 7.3.2 Password Security at Model Layer

Password hashing is implemented in a model hook, which ensures encryption is applied automatically before persistence:

```javascript
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
```

The route handlers therefore remain concise while security is guaranteed at data model level.

### 7.3.3 Request Protection and User Context Injection

Protected route execution depends on the authentication middleware:

```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = await User.findById(decoded.id).select('-password');
```

This logic validates token authenticity and loads user context for downstream operations. By removing the password field from the selected document, response leakage risk is minimized.

### 7.3.4 Donor Compatibility Logic

Donor search uses deterministic compatibility filtering:

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
});
```

The first block computes mathematically compatible donor groups; the second block enforces participation and availability constraints in database query form.

### 7.3.5 Inventory Transaction Safety

Inventory updates are processed with explicit branch logic:

```javascript
if (operation === 'add') {
    inventoryItem.availableUnits += parseInt(quantity);
} else if (operation === 'subtract') {
    if (inventoryItem.availableUnits < quantity) {
        return res.status(400).json({ message: 'Insufficient units' });
    }
    inventoryItem.availableUnits -= parseInt(quantity);
}
```

This guards against underflow conditions and ensures stock values remain valid.

## 7.4 Screen-to-Screen Implementation Explanation

### 7.4.1 Screen: Public Home (`public/index.html`)

This screen acts as the public entry point. It presents branding, navigation, and donor availability summary cards by blood group. The page executes a fetch call to `/api/users/stats`, then renders donor counts for all blood groups. The frontend logic is embedded in the page and supported by shared utilities from `public/js/main.js`.

When the page loads, the data flow is as follows: browser request → `/api/users/stats` → aggregation in user route → JSON response → DOM card generation. This creates a privacy-preserving public view where only aggregate information is shown.

### 7.4.2 Screen: Registration (`public/register.html`)

The registration screen captures name, email, password, phone, and location. On submit, the client sends a POST request to `/api/auth/register`. The backend validates unique email, persists the user through the model, and returns a token payload.

The interaction sequence is: form input → registration API call → `User.create()` → password hash hook executes → user document saved → token returned → frontend stores session and redirects. This establishes authenticated onboarding with minimal friction.

### 7.4.3 Screen: Login (`public/login.html`)

The login interface accepts email and password and posts credentials to `/api/auth/login`. The backend verifies credentials using the model method `matchPassword`, then returns tokenized user data.

After successful login, token information is stored in local storage. Subsequent protected requests include `Authorization: Bearer <token>` through the shared `authHeader()` helper in `public/js/main.js`.

### 7.4.4 Screen: User Dashboard (`public/user-dashboard.html`)

The user dashboard is intended for authenticated operational visibility. It exposes navigation to donor search and profile modules and integrates shared alert behavior for emergency situations. Dynamic elements are maintained by `public/js/main.js` and feature scripts.

Periodic polling functions help keep emergency or inventory indicators reasonably current without requiring manual refresh, which supports practical usability during active coordination windows.

### 7.4.5 Screen: Profile Management (`public/profile.html`)

This screen allows authenticated users to manage personal attributes and donor status. When donor mode is enabled, additional fields such as blood group, availability, and last donation date become active. Submission triggers `PUT /api/users/profile` with bearer token headers.

The backend validates identity via middleware, loads the user record, updates mutable fields, and saves changes. These persisted donor fields directly influence compatibility search outcomes, establishing a tight data dependency between profile management and donor discovery.

### 7.4.6 Screen: Donor Search (`public/search-donors.html`)

The donor search page allows selection of recipient blood group and retrieval of compatible donors. The backend computes compatibility and returns only essential contact details for available donors.

The interaction path is: select blood group → invoke search endpoint → compatibility map evaluation → filtered database query → donor cards rendered on UI. This screen operationalizes the core matching function of the system.

### 7.4.7 Screen: Emergency Requests (`public/emergency.html`)

The emergency interface has two coupled components: request creation form and active request feed. On form submission, `public/js/emergency.js` posts request data to `/api/requests`. The same script periodically fetches request lists to render the latest demand cards.

Data flow includes urgency capture, persistence in the request collection, and subsequent display updates through polling. This mechanism provides near-real-time visibility of urgent blood demand.

### 7.4.8 Screen: Inventory Dashboard (`public/dashboard.html`)

The inventory dashboard visualizes blood stock levels by group. `public/js/dashboard.js` fetches `/api/inventory`, computes status classes based on thresholds, and renders visual cards with status indicators.

If an inventory update form is present, the same script issues `PUT /api/inventory/update` with add/subtract operations. The UI then refreshes inventory data to reflect transactional changes.

### 7.4.9 Screen: Admin Dashboard (`public/admin-dashboard.html`)

The admin interface is designed for privileged management. It interacts with `/api/admin/users` and `/api/admin/inventory` endpoints, both guarded by authentication and role verification middleware.

The end-to-end path is: admin login → protected API invocation with token → middleware authorization chain (`protect` + `admin`) → administrative action execution → updated records returned to UI. This ensures administrative capabilities are constrained to authorized roles.

### 7.4.10 Screen: Emergency Alert Banner (Shared UI Behavior)

A shared emergency banner behavior is implemented through `checkEmergencyAlerts()` in `public/js/main.js`. This function fetches `/api/requests`, checks for critical urgency entries, and updates banner visibility dynamically.

The behavior provides lightweight situational awareness across pages. By reusing shared script logic, the implementation avoids duplicated alert code and maintains consistent emergency signaling.

## 7.5 Implementation Outcome Summary

The implementation demonstrates a complete flow from identity onboarding to donor matching, request handling, and stock tracking. Module boundaries are clear, data contracts are schema-constrained, and route-level protection enforces security requirements. The frontend and backend are coupled through explicit endpoint calls, enabling straightforward traceability of each user action to database state changes.

Although certain endpoint references in frontend scripts and mounted routes require harmonization for full consistency, the overall architecture remains functionally coherent and extensible for advanced institutional deployment.
