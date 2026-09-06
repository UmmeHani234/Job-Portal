# API Documentation

Base URL (local): `http://localhost:5000/api`
Interactive Swagger UI: `http://localhost:5000/api/docs` (auto-generated from route annotations, always in sync with the code)
Raw OpenAPI JSON: `http://localhost:5000/api/docs.json`

All responses follow the shape:
```json
{ "success": true, "data": { ... } }
```
or on error:
```json
{ "success": false, "message": "..." }
```

Authenticated endpoints require header: `Authorization: Bearer <JWT>`

---

## Auth

### POST /auth/register
Register a candidate or employer.
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "Secret123", "role": "CANDIDATE" }
```
Returns `201` with `{ token, user }`. `role` must be `CANDIDATE` or `EMPLOYER` (admins are seeded, not self-registered).

### POST /auth/login
```json
{ "email": "jane@example.com", "password": "Secret123" }
```
Returns `200` with `{ token, user }`.

### POST /auth/forgot-password (optional module)
```json
{ "email": "jane@example.com" }
```
Generates a reset token (would be emailed in production).

### POST /auth/reset-password
```json
{ "email": "jane@example.com", "token": "...", "newPassword": "NewSecret123" }
```

---

## Jobs

### GET /jobs
Public. Query params:
| Param | Type | Description |
|---|---|---|
| search | string | matches title/description |
| location | string | partial match |
| work_mode | REMOTE\|ONSITE\|HYBRID | |
| employment_type | FULL_TIME\|PART_TIME\|CONTRACT\|INTERNSHIP | |
| skills | csv string | e.g. `Java,Selenium` |
| salary_min | number | jobs whose salary_max >= this |
| experience_max | number | jobs whose experience_min <= this |
| sort | newest\|oldest\|salary_high\|salary_low | default `newest` |
| page, limit | number | pagination (max limit 50) |

Returns `{ data: [...jobs], pagination: { total, page, limit, totalPages } }`

### GET /jobs/:id
Public. Full job detail including company.

### POST /jobs — **EMPLOYER**
```json
{
  "company_name": "Acme Corp",
  "title": "QA Automation Engineer",
  "location": "Bengaluru",
  "work_mode": "HYBRID",
  "employment_type": "FULL_TIME",
  "salary_min": 600000, "salary_max": 900000,
  "experience_min": 0, "experience_max": 2,
  "skills": ["Selenium", "TestNG", "Java"],
  "description": "...",
  "benefits": "...",
  "deadline": "2026-12-31"
}
```

### PUT /jobs/:id — **EMPLOYER (owner) or ADMIN**
Partial update, same fields as create.

### DELETE /jobs/:id — **EMPLOYER (owner) or ADMIN**

### PATCH /jobs/:id/close — **EMPLOYER (owner) or ADMIN**
Convenience endpoint to set status to CLOSED.

### GET /jobs/:id/applicants — **EMPLOYER (owner) or ADMIN**
List of applications with candidate details.

### POST /jobs/:id/apply — **CANDIDATE**
```json
{ "cover_letter": "optional text", "resume_url": "optional link" }
```
`409` if already applied.

### POST /jobs/:id/save — **CANDIDATE**
### DELETE /jobs/:id/save — **CANDIDATE**
### GET /jobs/saved/me — **CANDIDATE**

---

## Applications

### GET /applications — **authenticated**
Scoped automatically:
- CANDIDATE sees their own applications
- EMPLOYER sees applications to jobs they posted
- ADMIN sees all
Supports `page`, `limit`, `status` query params.

### PATCH /applications/:id/status — **EMPLOYER (of the job) or ADMIN**
```json
{ "status": "SHORTLISTED" }
```
Allowed values: `APPLIED`, `SHORTLISTED`, `REJECTED`, `HIRED`.

---

## Dashboard

### GET /dashboard — **authenticated**
Response shape depends on caller's role:
- **CANDIDATE**: `{ totalApplications, totalSaved, applicationsByStatus }`
- **EMPLOYER**: `{ totalJobsPosted, openJobs, closedJobs, totalApplicants }`
- **ADMIN**: `{ totalUsers, totalJobs, totalCompanies, totalApplications, jobsScrapedToday, topSkills, topCompanies, topLocations }`

---

## Scraper

### POST /scrape/jobs — **ADMIN**
Triggers a scrape run against the configured public source (RemoteOK's public JSON API by default).
Response:
```json
{ "data": { "source": "REMOTEOK", "jobsAdded": 12, "duplicatesSkipped": 40, "errors": 0, "errorDetails": [] } }
```

### GET /scrape/logs — **ADMIN**
History of past scrape runs (last 50).

---

## Error codes
| Code | Meaning |
|---|---|
| 400 | Validation error / bad request |
| 401 | Missing/invalid/expired JWT |
| 403 | Authenticated but wrong role / not the resource owner |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, duplicate application, duplicate saved job) |
| 429 | Rate limit exceeded |
| 500 | Server error |
