### DevCollab 🛠️

DevCollab is an enterprise-grade, full-stack collaborative project management platform engineered specifically for development teams. The platform relies on a decoupled, asynchronous state architecture on the frontend and a strict layered service repository design on the backend. 

### 🏗️ Architecture & System Design Decisions

### 1. Dual-Workspace Routing Architecture

* **Personal Workspaces:** Endpoints operating under implicit owner privileges. This architecture bypasses collaborative Role-Based Access Control (RBAC) checks to provide an isolated developer playground.
* **Collaborative Workspaces:** Strict RBAC-enforced environments where every API endpoint requires active membership validation and action-string checks.

### 2. Backend-as-Source-of-Truth RBAC

* **Granular Action Strings:** Permissions are defined as specific capability tokens (e.g., edit_task, delete_task, add_comment, manage_members) rather than fragile, hardcoded role checks.
* **Payload Enriched Access:** Backend services dynamically compute and attach active user capabilities (userPermissions) and the human-readable role name (currentUserRole) directly into API payloads returned to the client.
* **Controller Layer Security:** Custom authorization middleware validates incoming request tokens and project permissions at the Express controller layer before any database operation executes.

### 3. 
𝑂

(

1

)
 Frontend UI Guarding

* **State Extraction:** A custom usePermissions React hook extracts active capability arrays directly from the global Redux state.
* **Instant UI Evaluation:** Internal lookups leverage a native JavaScript Set data structure. This ensures an 
𝑂

(

1

)
 time complexity for conditional UI rendering—instantly hiding or disabling structural elements (buttons, inputs, modals) based on server-provided capabilities.

### 📂 Project Structure

text

├── App/                  # Frontend Single Page Application (SPA)
│   ├── src/
│   │   ├── components/   # Reusable UI component library (TaskList, FilterBar, modals)
│   │   ├── hooks/        # Custom hook wrappers (usePermissions)
│   │   └── store/        # Redux Toolkit setup (profileSlice, projectSlice, taskSlice)
├── Backend/              # Node.js REST API Layer
│   ├── src/
│   │   ├── controllers/  # Route entry layers & request validation
│   │   ├── middleware/   # JWT auth, rate-limiters, & RBAC capability filters
│   │   ├── models/       # MongoDB / Mongoose Data Schemas
│   │   ├── repositories/ # Direct database access layers
│   │   └── services/     # Pure business logic implementation layers
├── .gitignore            # Git tracking exclusions
└── readme.md             # Project status log

Use code with caution.

### 📅 Day-by-Day Implementation Summary

### 🧱 Week 1: Foundation (Jul 03 – Jul 09)

* **Day 01: Auth Hardening & Profile Schema** 

  * *Backend:* Refactored JWT authentication pipeline, implemented refresh token rotation, and configured express-rate-limit for security. Expanded the extended User model (bio, avatar, socialLinks, skills).
  * *Endpoints:* Built GET /api/v1/users/me and PATCH /api/v1/users/me following the strict Route 

→right arrow
→
 Controller 

→right arrow
→
 Service 

→right arrow
→
 Repository architecture.
* **Day 02: Profile UI & Redux Integration** 

  * *Frontend:* Hand-wrote profileSlice in Redux Toolkit with manual asynchronous state handlers.
  * *UI/Forms:* Built the Profile management page using React Hook Form paired with Zod schema validation. Applied optimistic UI updates featuring automated error rollback loops.
* **Day 03: Project Schema & Backend CRUD** 

  * *Database:* Designed Project and ProjectMember schemas with a compound unique index { projectId, userId } to safely prevent duplicate workspace memberships.
  * *Logic:* Built backend CRUD services. Automatically assigned creating users as project owners and generated an initial system-wide ActivityLog entry.
* **Day 04: Project Frontend & Dashboard Skeleton** 

  * *Frontend:* Implemented projectSlice and designed GitHub repo-card style ProjectCard components.
  * *Dashboard:* Built the core project workspace grid, integrated an interactive create-project modal view, and wired end-to-end loading, empty, and error handler UI states.
* **Day 05: RBAC & Capabilities Engine** 

  * *Backend:* Defined discrete system role hierarchies (*Owner, Admin, Project Manager, Developer, Tester, Guest*). Built granular capability middleware using action strings instead of standard role tokens.
  * *Integration:* Applied the new authorization middleware across all project mutation API routes.
* **Day 06: Member Invitations** 

  * *Backend & DB:* Designed the transactional Invitation schema (projectId, invitedEmail, role, token, expiresAt) and implemented invite creation/acceptance endpoints.
  * *Frontend:* Built InviteMemberModal and pending workspace invitation list views.
* **Day 07: Week 1 Gate — Integration & Refactoring** 

  * Conducted rigorous regression testing across Auth 

→right arrow
→
 Profile 

→right arrow
→
 Projects 

→right arrow
→
 RBAC 

→right arrow
→
 Invitations.
  * Resolved runtime console errors, eliminated duplicate utility business logic, and tagged the repository state as week1-complete.

### 📋 Week 2: Project Management (Jul 10 – Jul 16)

* **Day 08: Task Schema & Backend CRUD** 

  * *Database:* Designed the core Task schema (title, description, projectId, assigneeId, priority, status, dueDate, createdBy) with a compound index { projectId, status } for query execution optimization.
  * *Backend:* Implemented task CRUD endpoints protected explicitly by action capability middleware.
* **Day 09: Task UI & Redux Management** 

  * *Frontend:* Hand-wrote comprehensive taskSlice state management logic.
  * *Components:* Built clean TaskList, TaskCard, and TaskDetail views featuring dynamic priority mapping and status badges.
* **Day 10: Comments Engine** 

  * *Database & Backend:* Designed the Comment schema (taskId, authorId, body, createdAt, editedAt). Built strict CRUD APIs enforcing author-only edit and deletion restrictions.
* **Day 11: Activity Feed & UI Permission Lockdown** 

  * *Activity Log:* Implemented an append-only ActivityLog service tracking key system mutations across workspaces.
  * *UI Security:* Integrated hasPermit checks into modal dialogues: 

    * RenderTaskModal: Enforces create_task capability on creation triggers.
    * RenderTaskDetailModal: Enforces edit_task for editing, delete_task for deletion, and add_comment for comment posting.
* **Day 12: Search, Filtering & Pagination** 

  * *Backend:* Added multi-parameter query filtering (status, priority, assignee) matched with efficient cursor-based pagination.
  * *Frontend:* Built the FilterBar component and wired an infinite scroll / load-more data pattern.
* **Day 13: Analytics & Aggregations** 

  * *Backend:* Built MongoDB aggregation pipelines to compile macro project metrics (task completion rate, overdue counters, activity distribution metrics).
  * *Frontend:* Built the primary dashboard analytics stats display panel.
* **Day 14: Week 2 Gate — Full System Regression** 

  * Verified the entire end-to-end task lifecycle (creation 

→right arrow
→
 assignment 

→right arrow
→
 status update 

→right arrow
→
 comment 

→right arrow
→
 completion).
  * Confirmed backend operational authorization parity with frontend hasPermit structural guards. Tagged repository state as week2-complete.

### 📈 Project Status & Current Milestone

* **Current Phase:** Weeks 1 & 2 Complete (Days 01 – 14)
* **Milestone Reached:** **Passed Week 2 Gate** 🟩
