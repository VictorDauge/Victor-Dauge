# DLIR Industrial Relations and Reporting

A hosted application for registering industrial matters and disputes, assigning case officers, recording progress, tracking programme workplans and Ministerial KRA links, managing financial returns and compiling quarterly/annual reports.

## Use the application

Open **https://dlir-industrial-relations.victordauge.chatgpt.site** and sign in with ChatGPT. There is no Python installation, command window or local application server for staff.

The first authenticated visitor to the initially owner-private deployment becomes the administrator. **The owner must open the application before sharing it.** Do not broaden the platform access policy until this first login has created the administrator.

The administrator configures staff in **Staff access & backups**, using each staff member's ChatGPT sign-in email, unit and role. Staff also need access through the Site's **Share** settings. Application membership and Site sharing are separate controls. Adding a staff entry does not send an email.

Roles:

| Role | Main permissions |
| --- | --- |
| Administrator | Configure accounts; all organisational units; backups and migration |
| Manager | Unit registry, assignments, progress, evidence approvals, finance, templates and approved reports |
| Registry | Unit registrations, assignments, progress, reporting narratives and exports |
| Case officer | Own assigned matters and programme activities; no finance or approval rights |
| Finance | Unit budgets and expenditure entries; aggregate reports; no case details |
| Reporting | Department-wide report consolidation, summary narratives and approval; no individual case details |

Register matters once with official references. Record assignments and dated actions under **Progress & activities**. Approve completed output evidence and expenditure before report statistics include them. Case closure requires an outcome and evidence; reopening is a separate event. Entries retain authorship and history. Refresh to see changes saved by colleagues.

Use **Narratives** for activity outcomes and the summary. Reports recalculate from event dates, approved outputs and finance returns. Approved report snapshots retain the generated files and figures. Upload mapped DOCX templates for other programmes and the Department consolidation before Word export; Programme 3 formats are configured separately in the live deployment.

**Department consolidation** combines entered unit statistics and spending. The reporting coordinator enters the Department summary, checks coverage and reconciles totals before approval. Missing returns must be obtained; zero entered records must not be treated as confirmed zero activity.

## Data and documents

Structured data is stored in Cloudflare D1 through the Sites host. Uploaded documents, Word templates and approved report packs are stored in R2. Every application data endpoint requires a verified identity and checks membership, role and organisational scope. Client-provided role or author values are not trusted. Staff with disabled membership cannot read or write.

Case references, voucher lines and conference evidence are protected against duplication. Version checks reject conflicting edits instead of overwriting another session. Case events and the updated case state are committed together. Templates use version and effective-date metadata. Source policy mappings retain document and clause references and effective dates.

DOCX/XLSX/PDF/JSON upload limit: 10 MB per file, 30 MB expanded archive. DOCX text is extracted for review. PDF and XLSX files remain reference documents; there is no OCR or automatic conversion of arbitrary reporting formats. Custom Word templates require `{{UNIT}}`, `{{YEAR}}` and `{{PERIOD}}`, plus the mapped report fields used in the configured formats.

The owner can import a ZIP backup from the previous no-install Browser Register **before live case, event, expenditure or approved report records are entered**. Limit: 10 MB ZIP, 1,000 rows and 20 MB expanded attachments. Imported officers retain directory identities and assignments; configure their sign-in emails afterwards. Uploaded documents and retained report packs are imported into protected object storage. Import preserves historical authorship; its application audit records the importing administrator.

In-app cloud backups include all records, access settings and up to 20 MB of attachments. Larger backups and disaster recovery require an ICT-managed storage export. Cloud backup restore is an ICT task; the import form accepts the earlier browser-register format, not the cloud archive. Store backups in an authorised departmental records location.

## Public GitHub source and private deployment configuration

This project is saved under `dlir-reporting/` on the `dlir-reporting` branch of `VictorDauge/Victor-Dauge`. Existing repository files are preserved.

The GitHub repository is public. The source copy therefore has a generic `private/seed.ts` with empty workplan/template seed data and a manifest without the live project ID. Departmental workplans, supplied Word formats, uploaded documents, identities, case data, database contents, object-store bytes, access credentials and environment secrets are not placed in GitHub. Live seed configuration is retained only in the protected hosting source and storage.

GitHub stores a source snapshot; publishing is managed by Sites. A GitHub push does not automatically deploy a new version. Changes must be validated and published through the project's hosting workflow. A new deployment from this generic GitHub source needs its own host registration, logical DB/BUCKET bindings and configured workplans/templates.

## Development and hosting

Node 22.13+ is needed only by developers. Use the included package-manager lockfile. Install dependencies, run `pnpm db:generate` after schema changes, inspect generated D1 migrations, then build the Worker. `.openai/hosting.json` declares logical `DB` and `BUCKET` bindings; the platform provisions actual resources. Generated migrations own schema changes; runtime code only seeds business records.

`app/chatgpt-auth.ts` uses dispatch-owned Sign in with ChatGPT. Production trusts the authenticated headers supplied by the hosting dispatcher. Do not expose this Worker behind a gateway that permits clients to spoof these headers. Do not add local/test authentication headers to production.

`lib/store.ts` handles storage, membership and atomic record writes. `lib/domain.ts` calculates report figures. `lib/reports.ts` merges mapped Word formats. `lib/application.ts` applies server-side validation and permissions. `public/application.js` and `public/workspace.html` provide the working interface.

## Validation and limits

100 checks passed against a compiled Worker with local D1 and R2, covering identities and disabled accounts, programme scope, assignments, dated closures/reopenings, evidence approvals, financial approvals, conflicts, source-document versions, stored-file retrieval, Word exports, immutable report snapshots, backups, CSRF protection and successful browser-register migration. Twelve interface checks passed with a simulated DOM. Additional Department consolidation checks are recorded in the delivery validation. Native browser interaction was unavailable in the build environment.

Quarterly and annual reports are implemented. Weekly/monthly KPI mappings are available, but separate weekly/monthly report layouts, automatic notifications, NEC/ILO submissions and scheduled report dispatch are not implemented. Staff write the narrative assessments; the application calculates the recorded statistics. It does not automatically infer legal or policy compliance from a document upload.

Programme, statutory-office and Executive Branch workplans, approved reporting formats, legal mandates, job descriptions, Ministerial KRAs, national-plan mappings and reporting deadlines must be configured from approved departmental documents. This application does not assert that missing inputs are already configured.
