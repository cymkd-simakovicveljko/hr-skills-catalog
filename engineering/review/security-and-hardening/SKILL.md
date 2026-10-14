---
name: security-and-hardening
description: "Review untrusted-input, authentication, authorization, external-integration, dependency, privacy, and LLM/tool boundaries; identify concrete security gaps and report evidence without authorizing production changes."
license: MIT
metadata:
  author: Addy Osmani
  source: https://github.com/addyosmani/agent-skills/tree/1be8e34187e34647bb83adc3a1323b26ae6f6abe/skills/security-and-hardening
  revision: 1be8e34187e34647bb83adc3a1323b26ae6f6abe
  upstream-files: skills/security-and-hardening/SKILL.md; skills/security-and-hardening/references/hardening-patterns.md; references/security-checklist.md
  adaptation: "Restored the complete upstream threat-model, three-tier boundary, hardening-control, dependency-script, privacy, AI/tool, review, checklist, rationalization, red-flag, and verification procedures; retained repository-contract-aware API status, session/CSRF, SSRF DNS/redirect/TOCTOU, derived-path ownership, secret-compromise and privacy safeguards; routed shared security/testing references through same-catalog MCP while keeping hardening patterns local and prohibiting automatic installs, production scans, rotations, commits, and remediation."
---

# Security and hardening

Review security as a property of the whole path from an untrusted writer to a sensitive effect. Use this skill for user input, authentication and authorization, sessions, uploads, webhooks, server-side fetches, dependencies, secrets, personal data, or LLM/tool features.

This is a review. Loading it does not authorize installing packages, executing dependency scripts, changing production configuration, scanning production, rotating credentials, deleting data, committing, publishing, deploying, or applying remediation automatically. Report the action, evidence needed, and owner instead. A security review may inspect committed code, lockfiles, configuration, and authorized non-production fixtures; it must not turn a checklist into permission for an external effect.

## Shared procedures and resources

For the shared security checklist, first load `using-agent-skills` by exact skill name through the same catalog MCP revision, then read the returned revision-pinned resource URI for `references/security-checklist.md`. When review evidence needs focused testing guidance, read the returned `references/testing-patterns.md` resource the same way. Do not follow workspace-relative shared-reference links, assume a local plugin, or claim a shared procedure was applied unless it was loaded.

The worked `hardening-patterns.md` resource is local to this skill. When delivered through MCP, call `load_skill` for this skill and read the matching returned resource URI; do not resolve a relative filesystem path. Its snippets are illustrative patterns, not evidence and not commands already executed.

## Overview and use cases

Security-first development treats every external input as hostile, every secret as sacred, and every authorization check as mandatory. It is a constraint on each line that touches user data, authentication, or an external system—not a phase added after implementation.

Use this review when:

- building anything that accepts user input;
- implementing authentication or authorization;
- storing or transmitting sensitive data;
- integrating with external APIs or services;
- adding file uploads, webhooks, callbacks, or redirects;
- handling payment, personal, or health data;
- auditing dependencies for known vulnerabilities or supply-chain risk; or
- adding model, retrieval, agent, or tool effects.

## Process: threat model first

Controls bolted on without a threat model are guesses. Before judging a control, inspect the relevant code, configuration, lockfiles, CI, protocol, deployment, and repository security guidance. Record the actual route, error, authentication, authorization, cookie, rate-limit, dependency, and data-retention contracts. Do not import a status code, algorithm parameter, header, threshold, or legal conclusion from this skill when the repository or owner-approved policy has a different contract.

1. **Map trust boundaries.** Identify where data crosses into the system: requests, headers, cookies, uploads, webhooks, third-party APIs, queues, model output, tool arguments, environment variables, process arguments, filenames, job payloads, and values written by another process. Trust follows who wrote a value, not the channel that delivered it. A sibling process's command line or a path on a shared volume can be attacker-controlled.
2. **Name actors and assets.** Consider anonymous users, authenticated users, tenants, administrators, workers, deployers, vendors, and compromised dependencies. Name credentials, personal/payment data, audit records, privileged actions, money movement, and availability as assets.
3. **Run STRIDE for each boundary.** Use it as a concrete lens, not a ceremony:

| Threat | Ask | Evidence to seek |
|---|---|---|
| **S**poofing | Can an actor impersonate a user or service? | Authentication, signature, issuer, and audience checks |
| **T**ampering | Can data change between writer and effect? | Integrity checks, parameterized queries, HTTPS, immutable or signed inputs |
| **R**epudiation | Can a security-relevant action be denied later? | Audit events with actor, target, result, and correlation context |
| **I**nformation disclosure | Can a secret, tenant's data, or internal detail escape? | Field allowlists, access checks, redaction, encryption, generic external errors |
| **D**enial of service | Can input or a dependency consume unbounded resources? | Size, time, concurrency, rate, token, and recursion bounds |
| **E**levation of privilege | Can a user reach another tenant's data or a privileged effect? | Object-level authorization and least-privilege service/tool credentials |

4. **Write an abuse case beside each important use case.** Name the attacker-controlled value, protected asset, effect, and control that stops it. If the boundary or abuse case cannot be named, the feature is not ready to call hardened.

## The three-tier boundary system

These tiers guide review scope. They do not grant permission to make operational changes. Project policy, deployment constraints, and human approval remain authoritative.

### Always do

Within the relevant code path and authorized review scope:

- Validate external input at the system boundary with an allowlisted schema.
- Parameterize database and query-builder inputs; never concatenate untrusted input into SQL, NoSQL, shell, template, or dynamic-code expressions.
- Encode output for its actual context; use framework auto-escaping and narrowly sanitize raw HTML only when it is genuinely required.
- Use HTTPS for external communication where the protocol and deployment require it.
- Hash passwords with the repository's approved adaptive algorithm and calibrated work factor; never store plaintext. Do not impose a universal round count.
- Apply security headers appropriate to the deployed surface, including CSP, HSTS when HTTPS/preload/subdomain policy supports it, `X-Content-Type-Options`, framing, referrer, and permissions controls.
- Use session cookie flags and request-bound CSRF protection appropriate to the protocol; `SameSite` is defense in depth, not a complete CSRF strategy.
- Check authentication and object/tenant/operation authorization separately on every protected route or message handler.
- Review the authoritative lockfile and dependency scripts before any authorized install or release check; use the pinned manager's native audit when that audit is in scope. Do not run it against production or execute an install automatically.

### Ask first

Obtain the applicable owner, security, privacy, or operational approval before:

- adding a new authentication or recovery flow or changing auth logic;
- storing a new category of sensitive data, payment data, or personal data;
- adding an external service, callback, webhook, model, or vendor integration;
- changing CORS, cookies, CSRF, headers, rate limiting, or throttling;
- adding file upload or server-side fetch behavior;
- granting elevated roles, permissions, tool capabilities, or cross-tenant access;
- enabling a dependency lifecycle script, installing/upgrading a package, or changing the lockfile;
- collecting new telemetry, reproducing a failure against live traffic, repairing data, rotating credentials, rolling back production, or deleting records.

### Never do

- Never commit secrets to version control, examples, logs, URLs, prompts, client bundles, or error bodies.
- Never log passwords, tokens, full payment numbers, or unnecessary personal data.
- Never treat client-side validation as a security boundary.
- Never disable security headers, authentication, authorization, CSRF, or input validation for convenience.
- Never use `eval()` or raw `innerHTML` with user- or model-provided data.
- Never store sessions in client-accessible storage unless the protocol explicitly requires it and the reviewed design protects it.
- Never expose stack traces, queries, tokens, or internal error details to users.
- Never blanket-approve dependency scripts, force remediation to silence an audit, or guess which lockfile/manager is authoritative.
- Never call a risk cleared because a framework default, audit, or scanner exists without tracing its use and reachability.

## Hardening controls

The controls below are the workflow. A concrete implementation of each applicable control lives in [hardening patterns](references/hardening-patterns.md); open only the matching section. Shared threat, install-policy, headers, CORS, privacy, AI, error, and OWASP checklists live in the router resource described above.

### Injection, XSS, and access control

- Parameterize every query. Never build SQL, NoSQL, shell commands, template expressions, or dynamic code from input strings.
- Encode output through the framework's auto-escaping. If raw HTML is unavoidable, sanitize with an allowlist first and preserve the target context.
- Check **authorization** on every request, not just authentication: the identity must own or be permitted on the specific object, tenant, operation, and role. Test a valid identity using another user's identifier, not only an anonymous request.

Patterns: [Injection](references/hardening-patterns.md#injection), [XSS](references/hardening-patterns.md#cross-site-scripting-xss), [Access control](references/hardening-patterns.md#broken-access-control).

### Authentication and sessions

- Hash passwords with an approved adaptive algorithm and policy-calibrated work factor. Keep session secrets outside source control and in the supported secret boundary.
- Validate token/session signature, expiry, issuer, audience, revocation, and protocol-specific claims where required.
- Session cookies need `httpOnly`, `secure`, scope, lifetime, and an appropriate `SameSite` value for deployment. `SameSite` reduces some cross-site requests but does not replace CSRF tokens, origin/referer checks, same-origin design, or another request-bound defense.
- Make reset and recovery tokens single-use, time-bounded, enumeration-resistant, and authorized. Do not set a universal timeout or status if the repository contract differs.

Pattern: [Authentication](references/hardening-patterns.md#broken-authentication).

### Headers, CORS, and responses

- Apply headers appropriate to the browser surface: CSP starts from a restrictive policy and is tightened without breaking required behavior; use HSTS only when HTTPS and deployment policy support it; include content-type, framing, referrer, and permissions controls as applicable.
- Restrict CORS to configured origins, methods, headers, and credential behavior. Never combine a wildcard origin with credentials; a wildcard may be acceptable only for intentionally public, non-credentialed responses under policy.
- Strip password hashes, reset tokens, and other sensitive fields before responses. Return the repository's generic external error shape; keep stack traces, queries, tokens, and full sensitive values in protected logs only.
- Preserve the actual API rejection contract. `401`, `403`, `404`, validation statuses, and error bodies may have compatibility and information-disclosure consequences; do not replace them with a universal recommendation.

Patterns: [Misconfiguration](references/hardening-patterns.md#security-misconfiguration), [Sensitive data exposure](references/hardening-patterns.md#sensitive-data-exposure).

### Input validation and uploads

- Validate at the boundary with an allowlisted schema: shape, required fields, lengths, ranges, enums, encodings, and formats. Pass only the parsed value downstream and use the repository's established validation error shape/status.
- For uploads, cap size, allowlist declared types, verify magic bytes/content when risk warrants it, store outside executable/public paths, and derive names rather than trusting extensions or paths.
- Validate redirect destinations and callback targets against the intended host/scheme/service policy; syntactic URL validity is not authorization.

Patterns: [Schema validation](references/hardening-patterns.md#schema-validation-at-boundaries), [File upload](references/hardening-patterns.md#file-upload-safety).

### Server-side fetches (SSRF)

For every user-influenced URL—from webhooks and import-from-URL features to image proxies and link previews—trace parsing through connection and redirect handling:

1. Allow only required schemes and an explicit host/service policy.
2. Resolve every relevant DNS address and reject loopback, link-local, metadata, private, reserved, and unique-local addresses for both IP families. Reject mixed answers if any address is unsafe.
3. Disable redirects, or validate every redirect destination with the same policy.
4. Bound response size, time, connections, and forwarding; never forward credentials or internal headers by default.

Checking only a hostname misses alternate spellings, numeric addresses, IPv4/IPv6 differences, mixed DNS answers, and redirects. DNS validation followed by an ordinary client fetch leaves a rebinding/TOCTOU gap because the client may resolve again. For high-risk surfaces, pin the validated address for the connection, use a filtering egress proxy/agent, or enforce equivalent network isolation. Document the guarantee actually provided; do not call a hostname check complete SSRF protection.

Pattern: [SSRF](references/hardening-patterns.md#server-side-request-forgery-ssrf).

### Destructive operations on derived paths

A path from a request, job payload, configuration, environment variable, process argument, or sibling service is data. Its channel proves where it arrived, not who wrote it. For delete, move, overwrite, extraction, cleanup, or similar effects, before the operation:

- resolve symlinks and compare path components to an explicit allowlisted root;
- require a minimum depth so the root itself cannot be targeted; use path-aware relative comparison, not a string prefix;
- read ownership evidence before teardown and compare it with authenticated or otherwise trusted expected ownership;
- refuse and stop on mismatch; never fall back to a broader default path; and
- use descriptor-relative/no-follow/beneath-root operations or guarantee the hierarchy cannot change between check and use.

An in-tree `.owner` marker is self-attestation: a process able to write the tree may forge it. Treat it as a consistency signal unless restrictive ownership, a MAC, or another integrity boundary makes it meaningful. Resolving a name and later operating on that name is still a check/use race when another process can swap an ancestor.

Pattern: [Destructive paths](references/hardening-patterns.md#destructive-operations-on-derived-paths).

### Rate limiting and resource bounds

Limit authentication endpoints and expensive operations for the actual deployment topology. Thresholds are owner-approved policy, not universal numbers. A process-local limiter is insufficient across processes, hosts, serverless invocations, or regions; use the repository's supported shared mechanism. Bound request size, timeout, concurrency, recursion, tokens, response size, and queue/retry consumption as the path requires.

Pattern: [Rate limiting](references/hardening-patterns.md#rate-limiting).

### Secrets and sensitive data

- Keep secrets in the supported secret store or environment boundary, never in source, examples, logs, URLs, prompts, client bundles, or error bodies. Examples contain placeholders only; ignore rules cover local key material.
- Inspect the scoped/staged diff and relevant history with repository-approved tooling, with output redacted. A keyword search is not proof that secrets are absent.
- If a secret reached a remote, report it as compromised. The credential owner must revoke or rotate it before history cleanup; this review does not rotate credentials or rewrite history.
- Classify fields before adding or moving them. Collect personal data only for a stated necessary purpose, minimize access and telemetry, and define retention and deletion across primary stores, backups, caches, indexes, and analytics copies.
- Export, correction, deletion, consent, and third-party sharing depend on jurisdiction, product policy, contracts, and data-processing terms. Identify decisions and owners; do not assert legal compliance from code review alone.

Patterns: [Secrets management](references/hardening-patterns.md#secrets-management), [Data classification](references/hardening-patterns.md#data-classification).

### Dependencies and supply chain

1. **Find the installation boundary and manager.** Use the workspace root owning the authoritative lockfile, or an independent nested project only when it is outside that workspace. Corroborate the manifest's `packageManager`, lockfile, CI install, workspace declarations, and nested boundary. Stop and report disagreement or competing authoritative lockfiles rather than guessing. Pin or otherwise verify the manager version under project policy.
2. **Block dependency scripts before first execution.** Bootstrap with scripts disabled or a documented default-deny/fail-closed policy. Inspect the exact package, version, script source, and build need. Approve only the narrowest reviewed exception, preserve the policy in version control when authorized, and never blanket-approve.
3. **Use native audits when the authorized review scope calls for them.** Audit the committed lockfile—not production—and treat advisories as evidence about known vulnerable code, not proof of trustworthiness or exploitability. Triage severity with reachability across runtime, build, test, and deploy paths. Forced remediation may cross declared ranges and is never automatic; preview changes, read changelogs, and verify each upgrade.
4. **Review supply-chain signals.** Inspect package ownership, provenance/signatures where supported, maintenance and release history, lockfile diffs, transitive graph, lifecycle scripts, and typosquatting risk. Audits do not catch a newly malicious package. Every deferral records reason, affected path, owner, and review date.

Do not install a package merely to make an audit quiet. Do not execute a normal install to discover scripts. Do not change a lockfile, commit a policy, or run a production scan without explicit authorization.

Triage decision tree: [Dependency audit triage](references/hardening-patterns.md#dependency-audit-triage). Manager matrix and install-script gate: load the router's revision-pinned `references/security-checklist.md` resource.

### Personal data and privacy

Hardening asks "can an attacker read it?" Privacy asks "should we hold it at all, and for how long?" The cheapest data to protect, breach, and comply over is data never collected.

- **Classify fields as they are added** (non-personal, personal, sensitive) so access, retention, export, and deletion can find them later.
- **Collect only against a stated purpose.** "Might be useful later" is latent breach scope, not a purpose. Keep PII out of telemetry.
- **Set retention up front, then actually delete.** Include backups, caches, search indexes, analytics copies, and derived stores.
- **Support jurisdiction-required rights** such as export, correction, and deletion; design schemas so records are findable and erasable.
- **Gate consent and third-party sharing.** Sending PII to an analytics, advertising, or LLM vendor is sharing; contracts and a data-processing basis may be required. Make region a configurable policy, not a hardcoded legal assumption.

A privacy incident can trigger separate response obligations. Route any incident diagnosis through the debugging procedure; this review does not declare legal compliance.

### AI / LLM features and tools

Calling an LLM—chatbot, summarizer, agent, or RAG—adds an attack surface. Treat model output, retrieved documents, tool arguments, and user prompts as untrusted data:

- Parse output defensively and validate it against an allowlisted schema before use. Never pass raw output to `eval`, SQL, a shell, HTML, a file path, a redirect, or a permission decision.
- Assume prompt injection in user text, fetched pages, PDFs, and retrieved documents. The system prompt is not a security boundary; enforce permissions in code.
- Keep secrets, cross-tenant data, unnecessary system-prompt content, and unauthorized personal data out of context. Partition and validate retrieval data before indexing.
- Scope every tool to the minimum operation, tenant, and actor; validate every argument at the tool boundary.
- Require explicit confirmation for destructive or irreversible effects, and bound tokens, request rate, recursion, retries, and tool loops.
- Trace the complete model → parser → authorization → tool → effect chain. Availability of a model/tool integration is not authorization to invoke it or disclose proprietary context.

Pattern: [LLM output handling](references/hardening-patterns.md#llm-output-handling).

## Review evidence and report

Use the cheapest evidence that answers the risk, then label its level:

1. **Observed:** direct code/config/repository evidence cited by file and line or exact artifact.
2. **Traced:** a complete data/control path through callers, dependencies, wire formats, and failure handling.
3. **Executed:** a focused authorized repro, test, or running-surface check against real code; report the exact scenario and result. Do not claim execution that did not happen.

For each finding report:

- **Boundary and asset:** what crosses trust, who can write it, what is at risk, and what effect follows.
- **Failure and impact:** concrete misuse path and affected confidentiality, integrity, availability, or privilege.
- **Evidence:** exact file/line/config or executed scenario, including uncertainty and scope.
- **Recommendation and owner:** smallest control that closes the path, policy/contract decision it depends on, and owner of operational approval.
- **Disposition:** confirmed finding, cleared check, accepted risk, or unverified gap. A framework default or clean audit is not a clearance without tracing.

Separate confirmed findings from cleared checks and unverified gaps. State what was not run, what requires human approval, and confirm that the review performed no production action.

## Review checklist

Before sign-off, load `using-agent-skills` and read its returned `references/security-checklist.md` resource. Walk every applicable section: threat modeling, pre-commit secret handling, authentication, authorization, input, data protection and privacy, headers and CORS, dependency/install scripts and supply chain, AI/LLM, error handling, and OWASP quick-reference tables. For focused tests, load the returned `references/testing-patterns.md` resource as needed. Keep this checklist as review evidence, not as permission to run scans, installs, rotations, or commits.

## Common rationalizations

| Rationalization | Reality |
|---|---|
| "This is an internal tool; security doesn't matter." | Internal tools get compromised and often have privileged access. Trace their real boundaries. |
| "We'll add security later." | Retrofitting trust, data, and authorization boundaries is harder and can leave unreviewed exposure. |
| "No one would try to exploit this." | Automated and accidental misuse reaches weak boundaries; use an abuse case, not optimism. |
| "The framework handles security." | Frameworks provide mechanisms, not a guarantee that this path uses them correctly. |
| "It's just a prototype." | Prototypes accumulate data and become production; state which temporary controls are missing and who owns the gate. |
| "Threat modeling is overkill." | A short STRIDE pass exposes design flaws controls cannot patch afterward. |
| "It's just LLM output; it's only text." | Text can become SQL, markup, a shell command, a path, or a permission decision. |
| "The audit passed, so the dependency is safe." | Advisories cover known issues, not malicious packages, typosquatting, unreviewed scripts, or unreachable-code assumptions. |
| "Collect it now; we might need it later." | Data you do not hold cannot be breached, subpoenaed, or mis-deleted. |
| "We'll handle deletion requests manually." | Manual erasure misses backups, caches, indexes, and analytics; schema and code need a findable deletion path. |
| "Compliance is legal's problem." | Purpose, retention, consent, export, deletion, and sharing are also schema and code decisions; legal approval is still separate. |
| "The scanner says clean, so the path is safe." | A scanner cannot prove authorization, DNS rebinding resistance, ownership integrity, API compatibility, or runtime reachability. |

## Red flags

- User input passed directly to queries, shell commands, dynamic code, redirects, or HTML.
- A delete, move, overwrite, extraction, or cleanup target guarded only by a shape check.
- Resolved-path checks followed by a name-based operation without a TOCTOU guarantee.
- Secrets in source, examples, logs, URLs, prompts, bundles, or commit history.
- Protected endpoints without separate authentication and object/tenant authorization.
- Missing CSRF defense, unsafe session storage, wildcard credentialed CORS, or mismatched API rejection statuses.
- Missing security headers or stack traces/internal errors exposed to users.
- No rate limit on auth/expensive operations, or a process-local limiter across multiple instances.
- Competing lockfiles, non-reproducible installs, unreviewed lifecycle scripts, or blanket-approved scripts.
- Known reachable critical/high dependency findings without an owner, reason, and review date.
- Server fetches of user-supplied URLs without scheme/host, DNS, redirect, connection, and response bounds.
- Model output passed into a query, DOM, shell, path, redirect, `eval`, or permission decision.
- Secrets, PII, cross-tenant data, or full system prompts placed in model context.
- Personal data collected without purpose, retention, deletion, consent, or data-processing terms.
- Account deletion that only flips a flag while copies linger in stores, backups, caches, indexes, or analytics.
- A report calling a risk cleared because an audit, framework default, or loaded skill exists without observed evidence.

## Verification and completion evidence

A review is complete only when the report shows:

- [ ] Every relevant trust boundary and asset is mapped, with at least one abuse case and STRIDE pass.
- [ ] Authentication, object/tenant authorization, input/output handling, and error/rejection behavior are traced to the repository contract.
- [ ] SSRF checks account for schemes, DNS answers, private/reserved addresses, redirects, response/connection bounds, and DNS rebinding/TOCTOU where applicable.
- [ ] Destructive-path checks account for symlinks, allowlisted root, minimum depth, ownership evidence, self-attesting markers, and check/use races where applicable.
- [ ] Dependency installation boundaries, manager/lockfile authority, scripts, reachability, provenance, audit results, and remediation decisions are evidenced where applicable.
- [ ] Secrets, personal-data purpose/retention/deletion, sharing, and jurisdiction-dependent policy gaps are recorded.
- [ ] LLM output, retrieval boundaries, tool permissions, confirmation, and resource limits are traced where AI features exist.
- [ ] Each unresolved issue has severity, evidence gap, owner, and next decision.
- [ ] The report states what was not run and confirms no production install, scan, rotation, commit, deploy, data repair, or other operational action was performed by the review.

**Reply:** the evidence-based report, with confirmed findings separated from cleared checks and unverified gaps. Do not provide a reassuring conclusion that the evidence does not support.
