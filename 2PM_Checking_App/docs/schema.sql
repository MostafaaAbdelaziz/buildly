-- Bob app PostgreSQL schema
-- Manages construction sites, 2 p.m. check-ins, issues, schedules, tasks, and drawings

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS & ROLES --------------------------------------------------------------

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('PROJECT_MANAGER', 'FOREMAN', 'SUBCONTRACTOR')),
    phone_number    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);


-- CONSTRUCTION SITES ---------------------------------------------------------

CREATE TABLE construction_sites (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    address         TEXT,
    description     TEXT,
    project_manager_id UUID NOT NULL REFERENCES users(id),
    start_date      DATE,
    end_date        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_construction_sites_project_manager
    ON construction_sites(project_manager_id);


-- SCHEDULES & SCHEDULE ITEMS -------------------------------------------------

CREATE TABLE schedules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id         UUID NOT NULL REFERENCES construction_sites(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    created_by_id   UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schedules_site ON schedules(site_id);

CREATE TABLE schedule_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id     UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    start_date      DATE NOT NULL,
    end_date        DATE,
    sort_order      INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schedule_items_schedule ON schedule_items(schedule_id);


-- TASKS ----------------------------------------------------------------------

CREATE TABLE tasks (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id             UUID NOT NULL REFERENCES construction_sites(id) ON DELETE CASCADE,
    schedule_item_id    UUID REFERENCES schedule_items(id) ON DELETE SET NULL,
    title               TEXT NOT NULL,
    description         TEXT,
    status              TEXT NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'IN_PROGRESS', 'BLOCKED', 'DONE')),
    assigned_to_user_id UUID REFERENCES users(id),
    created_by_id       UUID NOT NULL REFERENCES users(id),
    due_date            DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_site ON tasks(site_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to_user_id);


-- DRAWINGS -------------------------------------------------------------------

CREATE TABLE drawings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id         UUID NOT NULL REFERENCES construction_sites(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    file_url        TEXT NOT NULL,
    version         INTEGER NOT NULL DEFAULT 1,
    uploaded_by_id  UUID NOT NULL REFERENCES users(id),
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drawings_site ON drawings(site_id);


-- 2 P.M. CHECK-INS -----------------------------------------------------------

CREATE TABLE check_ins (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id         UUID NOT NULL REFERENCES construction_sites(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_in_date   DATE NOT NULL,
    check_in_time   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_ready        BOOLEAN NOT NULL,
    reason          TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_daily_check_in UNIQUE (site_id, user_id, check_in_date)
);

CREATE INDEX idx_check_ins_site_date
    ON check_ins(site_id, check_in_date);


-- ISSUES & ATTACHMENTS -------------------------------------------------------

CREATE TABLE issues (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id             UUID NOT NULL REFERENCES construction_sites(id) ON DELETE CASCADE,
    created_by_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to_user_id UUID REFERENCES users(id),
    related_task_id     UUID REFERENCES tasks(id) ON DELETE SET NULL,
    check_in_id         UUID REFERENCES check_ins(id) ON DELETE SET NULL,
    type                TEXT NOT NULL DEFAULT 'ISSUE'
                            CHECK (type IN ('ISSUE', 'RFI')),
    source_role         TEXT NOT NULL
                            CHECK (source_role IN ('PROJECT_MANAGER', 'FOREMAN', 'SUBCONTRACTOR')),
    title               TEXT NOT NULL,
    description         TEXT,
    status              TEXT NOT NULL DEFAULT 'OPEN'
                            CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_issues_site_created_at
    ON issues(site_id, created_at);

CREATE TABLE issue_attachments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id        UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    file_url        TEXT NOT NULL,
    caption         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_issue_attachments_issue
    ON issue_attachments(issue_id);


-- NOTIFICATIONS --------------------------------------------------------------

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            TEXT NOT NULL
                        CHECK (type IN ('DRAWING_UPDATED', 'NEW_ISSUE', 'ISSUE_UPDATED', 'CHECK_IN_REMINDER')),
    title           TEXT NOT NULL,
    body            TEXT,
    payload         JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at         TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_created_at
    ON notifications(user_id, created_at);

