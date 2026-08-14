# VulnTracker Roadmap

Full-stack vulnerability management platform. This document is the canonical, ordered
implementation plan. Work through phases in order — later phases depend on earlier ones.

## Stack

- **Backend**: Python/Flask, Supabase (Postgres), Flask-JWT-Extended + Supabase Auth,
  Flask-Limiter, Structlog, Swagger UI (flask-swagger-ui)
- **Frontend**: React 19 (Vite), React Router v7, Tailwind CSS, Axios + supabase-js
- **AI**: Google Generative AI (Gemini) chatbot
- **Deployment**: Docker + Render

## Current Entities

`users`, `vendors`, `software`, `vulnerabilities`, `threat_types`, `threats`,
`vulnerability_threats` (join table), `patches`.

---

## Phase 0 — Foundation fixes (do first; later phases depend on them)

### 0.1 Resolve Supabase Auth vs Flask-JWT-Extended overlap
- [ ] Decide: Supabase Auth issues tokens, Flask only *validates* them (recommended — removes duplicate auth logic)
- [ ] Remove Flask-JWT-Extended's token *creation* calls; keep only verification
- [ ] Write a `require_auth` decorator that validates incoming Supabase JWTs against Supabase's JWKS endpoint
- [ ] Update all protected routes to use the single decorator
- [ ] Test: confirm login still issues a usable token and protected routes reject invalid/expired ones

### 0.2 Add real RBAC
- [ ] Migration: add `role` enum column to `users` (`admin`, `analyst`, `viewer`), default `analyst`
- [ ] Backend: extend `require_auth` into `require_role(*allowed_roles)` decorator
- [ ] Apply role checks per route (e.g., only `admin`/`analyst` can POST/PUT/DELETE; `viewer` is read-only)
- [ ] Frontend: fetch role on login, store in auth context, conditionally render/hide write actions (buttons, forms)
- [ ] Test: log in as each role, confirm correct routes are blocked/allowed

### 0.3 CVSS vector + severity cleanup
- [ ] Migration: add `cvss_vector` (text) column to `vulnerabilities`
- [ ] Migration: add `severity_overridden` (boolean, default false) to `vulnerabilities`
- [ ] Backend: add a helper function that computes severity band from `cvss_score` (Critical 9.0–10, High 7.0–8.9, Medium 4.0–6.9, Low <4.0)
- [ ] Backend: on create/update, auto-set `severity` from the band UNLESS caller explicitly overrides it (then set `severity_overridden = true`)
- [ ] Frontend: display CVSS vector string on the vulnerability detail view; show an "overridden" badge when applicable

### 0.4 Status history / audit trail
- [ ] Migration: new table `vulnerability_status_history` (`id`, `vulnerability_id` FK, `old_status`, `new_status`, `changed_by` FK to users, `changed_at` timestamp)
- [ ] Backend: on every status update to a vulnerability, insert a history row (in the same transaction as the update)
- [ ] New endpoint: `GET /api/vulnerabilities/<id>/history`
- [ ] Frontend: add a "History" tab/section on the vulnerability detail page showing the timeline

### 0.5 Scope the AI chatbot
- [ ] Document (in code comments + README) whether the chatbot is read-only or can trigger writes — recommend **read-only** for now
- [ ] Restrict the context passed to Gemini to the current entity/page data + a scoped query function, not a full DB dump
- [ ] Add a system prompt for the chatbot that explicitly states its role and boundaries (explain vulnerabilities/patches, don't fabricate CVE data, defer to the DB as source of truth)

---

## Phase 1 — CVE ingestion pipeline (NVD sync)

- [ ] Get an NVD API key (free, higher rate limits) from the NVD website
- [ ] New module `sync/nvd_sync.py`:
  - [ ] Track `last_synced_at` (store in a small `sync_state` table or config row)
  - [ ] Call NVD API 2.0 for CVEs published/modified since `last_synced_at`
  - [ ] For each CVE, extract CPE (product) strings from the response
  - [ ] Match CPEs against `software` table (name/vendor matching — start with simple substring/fuzzy match)
  - [ ] Insert matched CVEs into `vulnerabilities`, including `cvss_score`, `cvss_vector`, `summary`, `description`, `published` date
  - [ ] Tag inserted rows with `source = 'nvd_auto'` (add this column if it doesn't exist)
  - [ ] Log run summary via Structlog (CVEs fetched, matched, inserted, errors)
- [ ] Add `sync_state` migration + `source` column migration on `vulnerabilities`
- [ ] Make the script runnable standalone (`python -m sync.nvd_sync`) for manual testing
- [ ] Add a Render Cron Job (or equivalent) to run it daily

---

## Phase 2 — KEV + EPSS enrichment

- [ ] Migration: add `is_kev` (boolean, default false) and `epss_score` (float, nullable) to `vulnerabilities`
- [ ] New module `sync/kev_sync.py`:
  - [ ] Pull CISA's `known_exploited_vulnerabilities.json`
  - [ ] Match by `cve_id`, set `is_kev = true` on matches
- [ ] New module `sync/epss_sync.py`:
  - [ ] Pull daily EPSS data from FIRST.org (`api.first.org/data/v1/epss`)
  - [ ] Match by `cve_id`, update `epss_score`
- [ ] Add both to the daily cron schedule (after NVD sync, since they enrich existing rows)
- [ ] Frontend: show KEV badge and EPSS score on vulnerability list/detail views; add sort/filter by these fields

---

## Phase 3 — Remediation SLA + assignment

- [ ] Migration: add `assigned_to` (FK to users, nullable), `sla_due_date` (timestamp, nullable) to `vulnerabilities`
- [ ] Backend: on vulnerability creation, auto-compute `sla_due_date` from severity (e.g., Critical = +7 days, High = +30 days, Medium = +90 days, Low = no SLA)
- [ ] New endpoint: `PATCH /api/vulnerabilities/<id>/assign` (role-gated — analyst/admin only)
- [ ] Dashboard: add "overdue" and "due this week" counts/widgets
- [ ] Frontend: assignment dropdown on vulnerability detail view, visual indicator when overdue

---

## Phase 4 — SBOM upload + OSV.dev matching

- [ ] New endpoint: `POST /api/software/<id>/sbom` — accepts CycloneDX or SPDX JSON file upload
- [ ] Backend: parse the SBOM to extract `{package_name, version}` pairs
- [ ] Call OSV.dev's batch query API (`POST https://api.osv.dev/v1/querybatch`) with the package list
- [ ] For each match returned, insert/update `vulnerabilities` rows, tagged `source = 'osv_sbom'`
- [ ] Frontend: SBOM upload UI on the software detail page, showing scan results/matches found

---

## Phase 5 — AI agent layer (Gemini, on top of Phase 1–2 pipeline)

Build only after Phases 1–2 are working — this adds judgment on top of a working data pipeline, it doesn't replace it.

- [ ] **CVE summarizer**: after NVD sync inserts a new CVE, call Gemini to generate a plain-English one-line summary; store in a `plain_summary` column
- [ ] **Threat auto-categorization (suggest-only)**: for each new CVE, have Gemini suggest a `threat_type` match; store as a *suggestion* (e.g., `suggested_threat_type_id`) that a human must confirm — do not auto-write to `threats`/`vulnerability_threats` without confirmation
- [ ] **Daily digest**: a scheduled job that summarizes the last 24h of sync activity (new CVEs, KEV matches, overdue items) into a short digest — store it or email/Slack it if you add notifications later
- [ ] Explicitly keep all AI-generated fields visually distinct in the UI (e.g., "AI-suggested" label) so users know what's human-verified vs. machine-suggested

---

## Cross-cutting (do alongside any phase, not blocking)

- [ ] Add `pip-audit` / `npm audit` to CI to catch vulnerable dependencies in VulnTracker itself
- [ ] Add basic pytest coverage for auth/RBAC logic and each new sync module (mock external API responses)
- [ ] Add a `/health` endpoint for uptime checks
- [ ] Add empty/loading/error states to frontend tables and forms
- [ ] Add search/filter/sort to the Vulnerabilities and Software tables
- [ ] Add a seeded demo dataset (fake vendors/software/CVEs) for demo purposes

---

## Suggested working order summary

1. Phase 0 (all of it) — fixes structural issues before more data/features build on top
2. Phase 1 — NVD sync (biggest single value-add)
3. Phase 2 — KEV + EPSS (quick wins once sync pattern exists)
4. Phase 3 — SLA/assignment
5. Phase 4 — SBOM/OSV
6. Phase 5 — AI agent layer
7. Cross-cutting items — weave in as time allows, ideally starting CI/tests early rather than at the end
