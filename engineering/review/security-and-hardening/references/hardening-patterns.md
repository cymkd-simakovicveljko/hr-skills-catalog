# Hardening patterns

These are review patterns, not universal drop-in implementations. Reconcile them with the repository's language, framework, API contract, deployment, and threat model. A code sample is not evidence until the real path is traced or exercised.

## Derived-path operations

A path supplied by a request, job, configuration value, environment variable, process argument, or sibling service is data. Its channel does not prove who wrote it. For a delete, move, overwrite, extraction, or cleanup effect:

```text
candidate = input path
resolved = resolve symlinks(candidate)

if resolved is not below an explicit allowed root: refuse
if resolved is the root or is shallower than the required minimum depth: refuse
owner = read ownership evidence before the effect
if owner does not match authenticated/trusted expected ownership: refuse

operate using a descriptor/no-follow/beneath-root primitive,
  or guarantee that the hierarchy cannot change between check and use
```

Compare path components after resolution. A string prefix check can mistake a sibling such as `/data/app-two` for a child of `/data/app`. Refusal must stop the operation; it must not select a broader default path.

An in-tree marker such as `.owner` is self-attestation. Anything able to write the tree may be able to forge it, so the marker is only a consistency signal until restrictive ownership, a MAC, or another integrity boundary protects it. `realpath` followed by an operation on the returned name also has a check/use race when another process can replace an ancestor. Look for descriptor-relative, no-follow, beneath-root, or immutable-hierarchy guarantees in high-risk code.

## SSRF review pattern

For a user-influenced URL, review the complete path from parsing to connection:

```text
url = parse(input)
require url.scheme and host match the explicit outbound policy
addresses = resolve every address for url.host
reject if any address is loopback, link-local, metadata, private,
  reserved, unique-local, or otherwise not permitted
forbid redirects, or validate every redirect with the same policy
bound time, response size, connections, and forwarded headers
connect using the validated address, or use a filtering egress boundary
```

Checking only a hostname string misses alternate spellings, numeric addresses, mixed DNS answers, IPv4/IPv6 differences, and redirects. Resolving once and then letting the HTTP client resolve again leaves a DNS-rebinding/TOCTOU gap. For high-risk endpoints, pin the address for the connection or put a filtering proxy/agent in front. If the implementation cannot make that guarantee, record the residual risk rather than calling SSRF protection complete.

## Authentication and CSRF review pattern

Authentication establishes who is making a request; authorization establishes what that identity may do. Trace both through the route, object lookup, tenant boundary, and effect. Test a valid identity using another user's identifier, not only an anonymous request.

Session cookie flags (`httpOnly`, `secure`, scope, lifetime, and an appropriate `SameSite` value) are useful defense in depth. `SameSite` is not a complete CSRF defense by itself: inspect the repository's request-bound CSRF token, origin/referer validation, same-origin design, or equivalent control. Preserve the API's actual rejection and error contract; a generic status recommendation is not a substitute for compatibility and information-disclosure analysis.

## Dependency and script triage

First locate the installation boundary and authoritative lockfile. Corroborate the manifest's manager/version signal, CI install, lockfile, workspace declarations, and nested-project boundary. Report disagreement or competing lockfiles instead of guessing.

Before a normal install can execute lifecycle scripts:

1. Use the pinned manager's documented script-blocking or fail-closed mode.
2. Inspect the exact package, version, script source, and build need.
3. Approve only the narrowest exception and commit the policy.
4. Re-run a clean frozen/immutable install under that policy, if execution is in scope.

Native audits identify known advisories. For each important finding, establish whether vulnerable code is reachable through runtime, build, test, or deployment paths and whether a fix is available. Review new package ownership, maintenance, release history, provenance, lockfile diff, transitive graph, and typosquatting risk. Do not blanket-install packages, auto-approve scripts, or use forced remediation to silence an audit. Record every deferral with its reason, owner, affected path, and review date.

## Model-output and tool pattern

Model output and retrieved documents are data, not authority:

```text
raw = model response
value = parse expected format
value = validate against an allowlisted schema
authorize(value.action, authenticated actor, tenant, target)
require confirmation for destructive/irreversible effects
invoke a narrowly scoped tool with validated arguments
encode or render output for its actual context
```

Reject paths that send raw model text to dynamic code, SQL, a shell, HTML, filesystem names, redirects, or permission decisions. Keep secrets, cross-tenant records, and unnecessary system-prompt content out of the context. Prompt injection is an input problem; enforce permissions in code. Bound token, request, and recursion consumption and partition retrieval data by tenant where applicable.
