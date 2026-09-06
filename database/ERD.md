# Entity Relationship Diagram (Description)

```
roles (1) ──────< (many) users
users (1, as employer) ──────< (many) companies         [companies.owner_id]
users (1, as employer) ──────< (many) jobs               [jobs.posted_by]
companies (1) ──────< (many) jobs                        [jobs.company_id]
users (1, as candidate) ──────< (many) applications       [applications.candidate_id]
jobs (1) ──────< (many) applications                      [applications.job_id]
users (1, as candidate) ──────< (many) saved_jobs         [saved_jobs.candidate_id]
jobs (1) ──────< (many) saved_jobs                        [saved_jobs.job_id]
jobs (1) ──────< (0..1) jobs                              [jobs.is_duplicate_of - self reference]
```

## Key constraints
- `users.email` UNIQUE
- `applications (job_id, candidate_id)` UNIQUE → a candidate can only apply once per job
- `saved_jobs (candidate_id, job_id)` UNIQUE → can't save the same job twice
- `jobs (source, source_url)` UNIQUE (partial, where source_url IS NOT NULL) → prevents duplicate scraped jobs
- Foreign keys use `ON DELETE CASCADE` for dependent child rows (applications, saved_jobs) and `ON DELETE SET NULL` where the parent user leaving shouldn't destroy history (companies.owner_id, jobs.posted_by)

## Indexing strategy
- Full-text GIN indexes on `jobs.title` and `jobs.description` for search
- GIN index on `jobs.skills` (array) for skill-based filtering
- B-tree indexes on frequently filtered columns: `location`, `status`, `employment_type`, `work_mode`, `posted_date`
- Standard indexes on all foreign keys used in JOIN/WHERE clauses (job_id, candidate_id, company_id, role_id)
