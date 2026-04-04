# Bob App - Firestore Schema

This document describes the Firestore collections and their structure for the Bob app.

---

## Collections

### 1. `sites` (Construction Sites)

Represents construction sites managed by the app.

**Fields:**
- `name` (string, required) - Site name
- `description` (string, optional) - Site description
- `address` (object, optional) - Address information
  - `line1` (string) - Address line 1
  - `line2` (string) - Address line 2
  - `cityState` (string) - City and state
- `location` (object, optional) - Map pin coordinates (distinct from text `address`); `{ latitude, longitude }` numbers
- `projectManagerId` (string, required) - Firebase Auth UID of the project manager
- `status` (string, optional) - Site status (e.g., "ACTIVE", "COMPLETED")
- `deleted` (boolean, optional) - Soft delete flag (true = deleted, sites with deleted=true are hidden)
- `deletedAt` (timestamp, optional) - When the site was soft-deleted
- `createdAt` (timestamp) - Creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Example:**
```json
{
  "name": "Harbor View Apartments",
  "description": "12-unit residential building",
  "address": {
    "line1": "123 Main St",
    "line2": "Suite 100",
    "cityState": "Boston, MA"
  },
  "location": { "latitude": 42.3601, "longitude": -71.0589 },
  "projectManagerId": "abc123xyz",
  "status": "ACTIVE",
  "deleted": false,
  "createdAt": "2026-03-12T10:00:00Z",
  "updatedAt": "2026-03-12T10:00:00Z"
}
```

---

### 2. `schedules` (Site Schedules)

Represents schedules associated with a construction site. Multiple schedules can exist per site (e.g., "Foundation Schedule", "MEP Schedule").

**Fields:**
- `siteId` (string, required) - Reference to parent site document ID
- `name` (string, required) - Schedule name
- `description` (string, optional) - Schedule description
- `createdById` (string, required) - Firebase Auth UID of creator
- `createdAt` (timestamp) - Creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Example:**
```json
{
  "siteId": "site123",
  "name": "Foundation Schedule",
  "description": "All foundation and site prep work",
  "createdById": "user456",
  "createdAt": "2026-03-12T10:00:00Z",
  "updatedAt": "2026-03-12T10:00:00Z"
}
```

---

### 3. `schedule_items` (Phases/Milestones)

Represents phases or milestones within a schedule. Phases are flat (non-nested) organizational units.

**Fields:**
- `scheduleId` (string, required) - Reference to parent schedule document ID
- `name` (string, required) - Phase name
- `description` (string, optional) - Phase description
- `sortOrder` (number) - Sort order for display (uses timestamp if not set)
- `createdAt` (timestamp) - Creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Derived Fields (computed from tasks):**
- Start date: Earliest task start date in this phase
- End date: Latest task end date in this phase

**Example:**
```json
{
  "scheduleId": "schedule789",
  "name": "Site Preparation",
  "description": "Clear and level the site",
  "sortOrder": 1678886400000,
  "createdAt": "2026-03-12T10:00:00Z",
  "updatedAt": "2026-03-12T10:00:00Z"
}
```

---

### 4. `tasks` (Work Items)

Represents individual tasks. Tasks can be:
- **Scheduled tasks**: Linked to a phase via `scheduleItemId`
- **Ad-hoc tasks**: Not linked to any phase (`scheduleItemId` is null)

**Fields:**
- `siteId` (string, required) - Reference to parent site document ID
- `scheduleItemId` (string, nullable) - Reference to parent phase document ID (null for ad-hoc tasks)
- `title` (string, required) - Task title/name
- `description` (string, optional) - Task description
- `status` (string, optional) - Task status: "PENDING", "IN_PROGRESS", "BLOCKED", "DONE"
  - Default: "PENDING"
- `startDate` (string, optional) - Task start date in YYYY-MM-DD format
- `endDate` (string, optional) - Task end date in YYYY-MM-DD format
- `assignedTo` (string, optional) - Free text name or email of assigned person (not yet linked to Auth UID — future improvement)
- `createdById` (string, required) - Firebase Auth UID of creator
- `createdAt` (timestamp) - Creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Example:**
```json
{
  "siteId": "site123",
  "scheduleItemId": "phase456",
  "title": "Clear brush and debris",
  "description": "Remove all vegetation from construction area",
  "status": "IN_PROGRESS",
  "startDate": "2026-03-15",
  "endDate": "2026-03-17",
  "assignedTo": "user789",
  "createdById": "user456",
  "createdAt": "2026-03-12T10:00:00Z",
  "updatedAt": "2026-03-12T15:30:00Z"
}
```

---

### 5. `phase_templates` (Reusable Phase Templates)

Represents phase templates that can be reused across schedules and sites. When a template is used, it creates a new phase with tasks copied from the template.

**Fields:**
- `name` (string, required) - Template name
- `description` (string, optional) - Template description
- `createdById` (string, required) - Firebase Auth UID of creator
- `isPublic` (boolean) - Whether template is shared with all users or private to creator
- `tasks` (array of objects) - Template tasks (copied from the source phase at save time)
  - Each task object contains:
    - `title` (string, required)
    - `description` (string, optional)
    - `durationDays` (number, optional) - Inclusive calendar-day span derived from the source task’s `startDate`/`endDate` when the template was saved; defaults to `1` if missing (legacy templates)
- `createdAt` (timestamp) - Creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Example:**
```json
{
  "name": "Foundation Phase Template",
  "description": "Standard foundation work sequence",
  "createdById": "user456",
  "isPublic": true,
  "tasks": [
    { "title": "Excavation", "description": "Dig foundation trenches", "durationDays": 3 },
    { "title": "Rebar installation", "description": "Install rebar grid", "durationDays": 2 },
    { "title": "Concrete pour", "description": "Pour foundation concrete", "durationDays": 1 }
  ],
  "createdAt": "2026-03-12T10:00:00Z",
  "updatedAt": "2026-03-12T10:00:00Z"
}
```

---

### 6. `sites/{siteId}/folders` (Drawing Folders)

Subcollection under sites for organizing drawings.

**Fields:**
- `name` (string, required) - Folder name
- `createdAt` (timestamp) - Creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

---

### 7. `sites/{siteId}/drawings` (Construction Drawings)

Subcollection under sites for construction drawings/blueprints.

**Fields:**
- `title` (string, required) - Drawing title
- `description` (string, optional) - Drawing description
- `fileUrl` (string, required) - URL to the drawing file
- `folderId` (string, optional) - Reference to parent folder
- `version` (number) - Version number
- `uploadedById` (string, required) - Firebase Auth UID of uploader
- `uploadedAt` (timestamp) - Upload timestamp
- `updatedAt` (timestamp) - Last update timestamp

---

### 8. `site_members` (Site Memberships)

Tracks which users have been invited to or are active members of a site. Created by managers when inviting crew members.

**Fields:**
- `siteId` (string, required) - Reference to the site document ID
- `siteName` (string, required) - Denormalized site name for display
- `userId` (string, required) - Firebase Auth UID of the invited user
- `role` (string, required) - Role on this site: `"WORKER"`, `"FOREMAN"`, `"MANAGER"`
- `invitedBy` (string, required) - Firebase Auth UID of the manager who sent the invite
- `inviterName` (string, required) - Denormalized display name of inviter
- `status` (string, required) - `"PENDING"` | `"ACTIVE"` | `"REJECTED"`
- `addedAt` (timestamp) - When the invite was created
- `resolvedAt` (timestamp, nullable) - When the invite was accepted or rejected

**Example:**
```json
{
  "siteId": "site123",
  "siteName": "Harbor View Apartments",
  "userId": "uid_crewmember",
  "role": "WORKER",
  "invitedBy": "uid_manager",
  "inviterName": "Bob Johnson",
  "status": "PENDING",
  "addedAt": "2026-03-17T10:00:00Z",
  "resolvedAt": null
}
```

---

### 9. `notifications` (In-App Notifications)

In-app notifications for users. Currently used for site invitations. Listened to in real-time by the recipient's app.

**Fields:**
- `userId` (string, required) - Firebase Auth UID of the recipient
- `type` (string, required) - Notification type: `"SITE_INVITE"`
- `siteId` (string, required) - Reference to the relevant site
- `siteName` (string, required) - Denormalized site name
- `invitedBy` (string, required) - Firebase Auth UID of the inviter
- `inviterName` (string, required) - Denormalized display name of inviter
- `membershipId` (string, required) - Reference to the `site_members` document
- `read` (boolean) - `false` until the user accepts or rejects the invite
- `createdAt` (timestamp) - Creation timestamp

**Example:**
```json
{
  "userId": "uid_crewmember",
  "type": "SITE_INVITE",
  "siteId": "site123",
  "siteName": "Harbor View Apartments",
  "invitedBy": "uid_manager",
  "inviterName": "Bob Johnson",
  "membershipId": "member456",
  "read": false,
  "createdAt": "2026-03-17T10:00:00Z"
}
```

---

### 10. `daily_check_ins` (Daily 2:00 PM check-in)

One document per **site** × **local calendar day** × **user**. Document ID is deterministic: `{siteId}_{localDate}_{userId}` where `localDate` is `YYYY-MM-DD` in the **device local** timezone (same string stored in fields for querying).

**Fields:**
- `siteId` (string, required)
- `userId` (string, required) - Firebase Auth UID; must match the authenticated user on write
- `localDate` (string, required) - `YYYY-MM-DD` (local calendar day)
- `status` (string, required) - `"on_track"` | `"not_on_track"`
- `submittedAt` (timestamp) - Server time when saved

**Queries:** Composite index on `(siteId, localDate)` for listing all check-ins for a site on a given day (manager attendance view).

**Roster (who is expected):** `sites.projectManagerId` plus every **ACTIVE** `site_members` row for that site (deduplicated). Implemented in app code (`buildExpectedCheckInUserIds` in `services/dailyCheckInRepository.js`).

**Example:**
```json
{
  "siteId": "site123",
  "userId": "uid_worker",
  "localDate": "2026-04-02",
  "status": "on_track",
  "submittedAt": "2026-04-02T14:05:00Z"
}
```

---

## Data Relationships

```
Site (sites)
 ├── Schedule (schedules) - multiple per site
 │    └── Phase (schedule_items) - multiple per schedule, flat structure
 │         └── Task (tasks) - multiple per phase
 │              └── Has: startDate, endDate, status, assignedTo, description
 │
 ├── Ad-hoc Task (tasks) - tasks with scheduleItemId = null
 │
 ├── Folder (sites/{siteId}/folders) - subcollection
 └── Drawing (sites/{siteId}/drawings) - subcollection

Phase Template (phase_templates) - standalone, reusable across sites
 └── Template Tasks (embedded array) - title and description only

Site Member (site_members) - links users to sites with a role + invite status
Notification (notifications) - per-user inbox; SITE_INVITE type links to site_members
Daily check-in (daily_check_ins) - one per site × local day × user; PM can read all for a site/day
```

---

## Key Design Decisions

1. **Multiple Schedules per Site**: A site can have multiple schedules (e.g., by trade, phase, or building)

2. **Flat Phase Structure**: Phases are not nested; they're a flat list within each schedule

3. **Tasks Define Timeline**: 
   - Tasks have start and end dates
   - Phase dates are derived from the earliest/latest task dates within that phase
   - This allows granular control while maintaining phase organization

4. **Sequential Execution**:
   - Tasks within a phase execute sequentially (by sortOrder or creation time)
   - Phases within a schedule execute sequentially
   - Schedules within a site are independent (parallel work streams)

5. **Ad-hoc Tasks**: Tasks can exist without a phase for unplanned/flexible work

6. **Task Status Values**:
   - `PENDING`: Not started
   - `IN_PROGRESS`: Currently being worked on
   - `BLOCKED`: Blocked by dependencies or issues
   - `DONE`: Completed

7. **Phase Templates**:
   - Templates store task title and description only (no dates — dates are set manually after applying)
   - Templates can be private (creator only) or shared publicly with all users
   - Fetched on demand (not real-time) since they change infrequently

---

## Firestore Security Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    match /sites/{siteId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn();
      allow delete: if false; // Hard delete disabled; use soft delete (update with deleted=true)
    }

    match /sites/{siteId}/folders/{folderId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn();
      allow delete: if false;
    }

    match /sites/{siteId}/drawings/{drawingId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn();
      allow delete: if false;
    }

    match /schedules/{scheduleId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isSignedIn();
    }

    match /schedule_items/{scheduleItemId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isSignedIn();
    }

    match /tasks/{taskId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isSignedIn();
    }

    // Creator can edit/delete their own templates; public ones are readable by all
    match /phase_templates/{templateId} {
      allow read: if isSignedIn() &&
        (resource.data.isPublic == true ||
         resource.data.createdById == request.auth.uid);
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() &&
        resource.data.createdById == request.auth.uid;
    }

    // Any signed-in user can create (manager inviting). Only the invitee can accept/reject.
    match /site_members/{membershipId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn() &&
        resource.data.userId == request.auth.uid &&
        resource.data.status == 'PENDING';
      allow delete: if false;
    }

    // Only the recipient can read/mark-read their notifications. Any signed-in user can create.
    match /notifications/{notifId} {
      allow read, update: if isSignedIn() &&
        resource.data.userId == request.auth.uid;
      allow create: if isSignedIn();
      allow delete: if false;
    }

    // Daily check-ins: author or site project manager may read; doc id must match fields
    function dailyCheckInIdMatchesData(siteId, localDate, userId) {
      return siteId + '_' + localDate + '_' + userId;
    }
    function isSiteProjectManager(siteId) {
      return exists(/databases/$(database)/documents/sites/$(siteId)) &&
        get(/databases/$(database)/documents/sites/$(siteId)).data.projectManagerId == request.auth.uid;
    }
    match /daily_check_ins/{checkInId} {
      allow read: if isSignedIn() && (
        resource.data.userId == request.auth.uid ||
        isSiteProjectManager(resource.data.siteId)
      );
      allow create: if isSignedIn() &&
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.keys().hasAll(['siteId', 'userId', 'localDate', 'status', 'submittedAt']) &&
        request.resource.data.status in ['on_track', 'not_on_track'] &&
        checkInId == dailyCheckInIdMatchesData(
          request.resource.data.siteId,
          request.resource.data.localDate,
          request.resource.data.userId
        );
      allow update: if isSignedIn() &&
        resource.data.userId == request.auth.uid &&
        request.resource.data.userId == request.auth.uid &&
        checkInId == dailyCheckInIdMatchesData(
          request.resource.data.siteId,
          request.resource.data.localDate,
          request.resource.data.userId
        );
      allow delete: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Authoritative copy: [`firestore.rules`](../firestore.rules) at project root (includes `site_members` invite/removal rules not shown above).
