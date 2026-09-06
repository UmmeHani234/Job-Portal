-- ============================================================
-- Job Portal - PostgreSQL Schema
-- ============================================================
-- Run: psql -U postgres -d jobportal -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- ROLES
-- ------------------------------------------------------------
CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(20) UNIQUE NOT NULL CHECK (name IN ('ADMIN', 'EMPLOYER', 'CANDIDATE'))
);

INSERT INTO roles (name) VALUES ('ADMIN'), ('EMPLOYER'), ('CANDIDATE');

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(160) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role_id         INTEGER NOT NULL REFERENCES roles(id),
    phone           VARCHAR(20),
    resume_url      TEXT,                 -- candidate resume upload (bonus)
    reset_token     VARCHAR(255),
    reset_token_expiry TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);

-- ------------------------------------------------------------
-- COMPANIES  (one employer user can own/represent a company)
-- ------------------------------------------------------------
CREATE TABLE companies (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id    UUID REFERENCES users(id) ON DELETE SET NULL, -- employer who created it
    name        VARCHAR(160) NOT NULL,
    website     VARCHAR(255),
    logo_url    TEXT,
    location    VARCHAR(160),
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (name)
);

CREATE INDEX idx_companies_name ON companies(name);

-- ------------------------------------------------------------
-- JOBS
-- ------------------------------------------------------------
CREATE TABLE jobs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    posted_by       UUID REFERENCES users(id) ON DELETE SET NULL, -- employer user, NULL if scraped
    title           VARCHAR(200) NOT NULL,
    location        VARCHAR(160),
    work_mode       VARCHAR(20) CHECK (work_mode IN ('REMOTE','ONSITE','HYBRID')),
    employment_type VARCHAR(20) CHECK (employment_type IN ('FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP')),
    salary_min      NUMERIC(12,2),
    salary_max      NUMERIC(12,2),
    salary_currency VARCHAR(10) DEFAULT 'INR',
    experience_min  INTEGER DEFAULT 0,   -- years
    experience_max  INTEGER,
    skills          TEXT[],              -- e.g. ARRAY['Java','Selenium']
    description     TEXT NOT NULL,
    benefits        TEXT,
    deadline        DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED','DRAFT')),
    source          VARCHAR(50) NOT NULL DEFAULT 'MANUAL', -- MANUAL or scraper source name
    source_url      TEXT,                -- original URL if scraped
    posted_date     TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_duplicate_of UUID REFERENCES jobs(id), -- set by dedup logic if applicable
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate scraped jobs: same source + source_url must be unique
CREATE UNIQUE INDEX uq_jobs_source_url ON jobs(source, source_url) WHERE source_url IS NOT NULL;

CREATE INDEX idx_jobs_title ON jobs USING GIN (to_tsvector('english', title));
CREATE INDEX idx_jobs_description ON jobs USING GIN (to_tsvector('english', description));
CREATE INDEX idx_jobs_skills ON jobs USING GIN (skills);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX idx_jobs_work_mode ON jobs(work_mode);

-- ------------------------------------------------------------
-- APPLICATIONS
-- ------------------------------------------------------------
CREATE TABLE applications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_url      TEXT,
    cover_letter    TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'APPLIED'
                    CHECK (status IN ('APPLIED','SHORTLISTED','REJECTED','HIRED')),
    applied_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (job_id, candidate_id)   -- a candidate can apply to a job only once
);

CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ------------------------------------------------------------
-- SAVED JOBS
-- ------------------------------------------------------------
CREATE TABLE saved_jobs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (candidate_id, job_id)
);

CREATE INDEX idx_saved_jobs_candidate ON saved_jobs(candidate_id);

-- ------------------------------------------------------------
-- SCRAPE LOGS (supports Module 6 - scraper API reporting)
-- ------------------------------------------------------------
CREATE TABLE scrape_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source          VARCHAR(50) NOT NULL,
    jobs_added      INTEGER NOT NULL DEFAULT 0,
    duplicates_skipped INTEGER NOT NULL DEFAULT 0,
    errors          INTEGER NOT NULL DEFAULT 0,
    error_details   JSONB,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at     TIMESTAMPTZ
);

CREATE INDEX idx_scrape_logs_started ON scrape_logs(started_at DESC);

-- ------------------------------------------------------------
-- Trigger to auto-update updated_at columns
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
