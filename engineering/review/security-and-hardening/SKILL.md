---
name: security-and-hardening
description: "Review untrusted-input, authentication, authorization, external-integration, dependency, privacy, and LLM/tool boundaries; identify concrete security gaps and report evidence without authorizing production changes."
license: MIT
metadata:
  author: Addy Osmani
  source: https://github.com/addyosmani/agent-skills/tree/1be8e34187e34647bb83adc3a1323b26ae6f6abe/skills/security-and-hardening
  revision: 1be8e34187e34647bb83adc3a1323b26ae6f6abe
  upstream-files: skills/security-and-hardening/SKILL.md; skills/security-and-hardening/references/hardening-patterns.md; references/security-checklist.md
  adaptation: "Consolidated the upstream checklist into a model-invocable review workflow, removed unavailable companion calls and fixed host/tool assumptions, and qualified controls against the repository contract, jurisdiction, DNS rebinding, TOCTOU, and ownership-marker limits."
---

# Security and hardening

Review security as a property of the whole path from an untrusted writer to a sensitive effect. Use this skill for input handlers, authentication and authorization, sessions, uploads, webhooks, server-side fetches, dependencies, secrets, personal data, or LLM/tool features.

This is a review. It does not authorize installing packages, changing production configuration, rotating credentials, deleting data, publishing releases, or applying remediation automatically. If a finding needs an operational action, report the action and its owner instead.

## 1. Establish the contract and threat model

Read the repository's relevant code, configuration, lockfiles, CI, and local security guidance before judging a control. Record the actual route, error, authentication, authorization, cookie, rate-limit, and dependency contracts; do not import a status code, algorithm parameter, or policy from this document when the repository has a different established contract.

Map:

- **Actors and assets:** anonymous users, authenticated users, tenants, administrators, workers, deployers, credentials, personal data, payment data, audit records, privileged actions, and availability.
- **Trust boundaries:** requests, headers, cookies, uploads, webhooks, queues, third-party responses, model output, tool arguments, environment variables, process arguments, filenames, job payloads, and values written by another process. Trust follows who wrote a value, not the channel that delivered it.
- **Effects:** database queries, HTML or browser behavior, shell/process execution, filesystem deletion or overwrite, outbound network requests, secrets or PII leaving the system, role changes, and irreversible actions.

Run STRIDE over each boundary. Keep the questions concrete:

| Threat | Question | Evidence to seek |
| --- | --- | --- |
| Spoofing | Can an actor impersonate a user or service? | Authentication, signature, issuer, and audience checks |
| Tampering | Can data change between writer and effect? | Integrity checks, parameterized queries, HTTPS, immutable or signed inputs |
| Repudiation | Can a security-relevant action be denied later? | Useful audit events with actor, target, result, and correlation context |
| Information disclosure | Can a secret, tenant's data, or internal detail escape? | Field allowlists, access checks, redaction, encryption, generic external errors |
| Denial of service | Can input or a dependency consume unbounded resources? | Size, time, concurrency, rate, token, and recursion bounds |
| Elevation of privilege | Can a user reach another tenant's data or a privileged effect? | Object-level authorization and least-privilege tool/service credentials |

Write at least one abuse case beside each important use case. A boundary is not understood until the review can name the attacker-controlled value, the protected asset, the effect, and the control that stops it.

## 2. Review the boundary controls

### Authentication, sessions, and authorization

- Check authentication on every protected route or message handler, then check authorization for the specific object, tenant, operation, and role. A valid identity is not permission to act on an arbitrary identifier.
- Validate session or token signature, expiry, issuer, audience, and revocation rules where the repository's protocol requires them. Keep session secrets outside source control and use the repository's approved password-hashing algorithm and work factor; do not mandate a fixed bcrypt round count.
- Inspect cookie `httpOnly`, `secure`, scope, lifetime, and `SameSite` settings against deployment. `SameSite` reduces some cross-site requests but is not a complete CSRF strategy by itself; check the repository's CSRF token, origin/referer, same-origin, or equivalent request-bound defense.
- Keep auth material out of client-accessible storage unless the protocol explicitly requires it and has a reviewed alternative. Verify reset and recovery flows are single-use, time-bounded, enumeration-resistant, and authorized.
- Treat authorization failures and rejection statuses as part of the actual API/UI contract. Do not replace an established `401`, `403`, `404`, or validation response with a universal rule; check what callers and tests rely on and avoid leaking resource existence.

### Input, output, and file uploads

- Validate at the system boundary with an allowlisted schema: shape, required fields, lengths, ranges, enums, encodings, and formats. Pass only the parsed value downstream. Use the repository's established validation error shape and status.
- Parameterize database and query-builder inputs. Keep untrusted values out of shell commands, template expressions, dynamic code, and filesystem operations. Encode output in the target context; sanitize HTML with a narrowly defined allowlist only when raw HTML is genuinely required.
- Do not treat client-side validation as a security boundary. For uploads, limit size, allowlist declared types, verify content or magic bytes when risk warrants it, store outside executable/public paths, and derive names rather than trusting extensions or paths.
- Validate redirect destinations and callback targets against the intended policy; a syntactically valid URL can still be an open redirect or an internal destination.

### Headers, CORS, errors, and rate limits

- Check the headers appropriate to the deployed surface: CSP, HSTS where HTTPS and preload/subdomain policy support it, `X-Content-Type-Options`, framing policy, referrer policy, and permissions policy. Do not blindly copy a header that conflicts with required browser behavior.
- Restrict CORS to configured origins, methods, headers, and credentials required by the contract. Never combine a wildcard origin with credentials.
- Return the repository's generic external error shape and keep stack traces, queries, tokens, and other internals in protected logs only. Log security events with enough context to investigate without logging secrets or full sensitive values.
- Check authentication endpoints and expensive operations for rate, size, timeout, and concurrency limits. A process-local limiter is insufficient when traffic spans processes, hosts, serverless invocations, or regions; use the repository's supported shared mechanism. Do not invent fixed thresholds.

### Server-side requests (SSRF)

For every user-influenced URL, trace parsing through connection and redirect handling:

1. Allow only the required schemes and an explicit host or service policy.
2. Resolve all relevant DNS records and reject loopback, link-local, metadata, private, reserved, and unique-local addresses for both IP families. Reject mixed answers if any address is unsafe.
3. Disable redirects, or apply the same policy to every redirect destination.
4. Bound response size, time, and connection behavior; avoid forwarding credentials or internal headers.

DNS validation followed by an ordinary fetch has a rebinding/TOCTOU gap because the client may resolve again after validation. For high-risk surfaces, pin the validated address for the connection, use a filtering egress proxy/agent, or enforce equivalent network isolation. Document which guarantee the implementation actually provides.

### Destructive operations on derived paths

For delete, move, overwrite, extraction, cleanup, or similar effects, a path's origin or shape is not authorization. Before the effect, require all of the following:

- Resolve the candidate with symlinks handled, then compare the resolved target to an explicit allowlisted root.
- Require a minimum depth so the root itself cannot be the target; use path-aware relative comparison rather than a string prefix.
- Read ownership evidence before the operation and compare it with authenticated or otherwise trusted expected ownership. On refusal, record the rejected target safely and stop; never fall back to a broader default.

A marker inside the tree is self-attestation: a process that can write the target may be able to forge `.owner`. Treat it as a consistency check unless restrictive ownership, a MAC, or another integrity boundary makes it meaningful. Resolving a name and later operating on that name also leaves a check/use race if another process can swap an ancestor. Use descriptor- or no-follow/beneath-root operations, or make the hierarchy immutable for the interval. See [derived-path patterns](references/hardening-patterns.md#derived-path-operations).

### Dependencies and install scripts

Find the installation boundary first: the workspace or project root that owns the authoritative manifest and lockfile. Corroborate the declared package manager, lockfile, CI install, and any nested project boundary. Stop and report disagreement or competing authoritative lockfiles rather than guessing.

Review lifecycle scripts before a normal install can execute them. Bootstrap with the pinned manager's documented script-blocking or fail-closed policy, inspect the exact package/version and required script, approve only the narrowest reviewed exception, and preserve the policy in version control. Never blanket-approve scripts or install packages merely to make an audit quiet.

Run the manager's native audit against the committed lockfile when the review scope calls for it. Treat advisories as evidence about known vulnerable code, not proof that a package is trustworthy or exploitable. Triage severity with reachability across runtime, build, test, and deploy paths; review package ownership, provenance, maintenance, release history, lockfile changes, and typosquatting risk. Forced remediation may cross declared dependency ranges and is never automatic. Every deferral needs a reason, affected path, owner, and review date.

### Secrets and sensitive data

- Keep secrets in the repository's supported secret store or environment boundary, never in source, examples, logs, URLs, client bundles, prompts, or error bodies. Examples may contain placeholders only, and ignore rules must cover local key material.
- Inspect the staged diff and relevant history with repository-supported tooling. If a secret reached a remote, report it as compromised: the credential owner should revoke or rotate it before history cleanup. Do not perform that production action from a review.
- Classify fields before adding or moving them. Collect personal data only for a stated, necessary purpose; minimize access and telemetry; define retention and deletion across primary stores, backups, caches, indexes, and analytics copies.
- Export, correction, deletion, consent, and third-party sharing requirements depend on jurisdiction, product policy, contracts, and data-processing terms. Do not assert that a feature is legally compliant from code review alone; identify the policy and legal decisions still needed.

### LLMs and tools

Treat model output, retrieved documents, and tool arguments as untrusted input. Parse and validate model output against a schema before use; never pass it directly to `eval`, SQL, a shell, HTML, a file path, a redirect, or a permission decision. Prompt injection is expected, so enforce permissions in code rather than in a system prompt.

Keep secrets, cross-tenant data, and unnecessary system-prompt content out of context. Scope each tool to the minimum operation and tenant, validate every argument at the tool boundary, cap tokens/rate/recursion as appropriate, and require explicit confirmation for destructive or irreversible actions. Partition and validate retrieval data before indexing. If a model can cause an external effect, review the complete model → parser → authorization → tool → effect chain.

## 3. Collect evidence and report

Use the cheapest evidence that can answer the risk, then label its level:

1. **Observed:** direct code/config or repository evidence, cited by file and line or exact artifact.
2. **Traced:** a complete data/control path through callers, dependencies, wire formats, and failure handling.
3. **Executed:** a focused repro, test, or running-surface check against the real code. Report the command or scenario and result; do not claim execution you did not perform.

For each finding report:

- **Boundary and asset:** what crosses trust, what is at risk, and who can write it.
- **Failure and impact:** the concrete misuse path and affected confidentiality, integrity, availability, or privilege.
- **Evidence:** exact file/line/config or executed scenario, including uncertainty and scope.
- **Recommendation and owner:** the smallest control that closes the path, the policy/contract decision it depends on, and who must approve operational action.
- **Disposition:** confirmed finding, cleared check, accepted risk, or unverified gap. Do not call a risk cleared because an audit or framework default exists without tracing its use.

### Completion evidence

A review is complete only when the report shows:

- every relevant trust boundary and asset is mapped, with at least one abuse case and STRIDE pass;
- authentication, object/tenant authorization, input/output handling, and error/rejection behavior are traced to the repository contract;
- SSRF and destructive-path checks account for redirects, DNS rebinding/TOCTOU, symlinks, root depth, and ownership evidence where applicable;
- dependency installation boundaries, scripts, lockfiles, reachability, provenance, and remediation decisions are evidenced where applicable;
- secrets, personal-data purpose/retention/deletion, and jurisdiction-dependent policy gaps are recorded;
- LLM output and tool permissions are traced where AI features exist; and
- every unresolved issue has a severity, evidence gap, owner, and next decision. The report explicitly states what was not run and confirms that no production action was taken by the review.

## Focused patterns

Open [hardening patterns](references/hardening-patterns.md) only for the applicable derived-path, SSRF, dependency-triage, or model-output pattern. The reference is scoped to this skill and contains caveats that must travel with copied examples.

When loaded through MCP, read the matching revision-pinned resource URI returned by `load_skill`; do not assume this relative path exists in the local workspace.

**Reply:** the evidence-based report above, with confirmed findings separated from cleared checks and unverified gaps. Do not provide a reassuring conclusion that the evidence does not support.
