# Hardening patterns

These are review patterns, not universal drop-in implementations. Reconcile each one with the repository's language, framework, API contract, deployment, owner-approved thresholds, and threat model. A code sample is not evidence until the real path is traced or exercised. Snippets are illustrative reference material; reading them does not install packages, run scans, change production, rotate secrets, commit, or authorize remediation.

The shared threat-model, pre-commit, security-header, CORS, package-manager/install-script, privacy, error, and OWASP quick-reference tables live in the `using-agent-skills` skill's `references/security-checklist.md` resource. Load `using-agent-skills` through same-catalog MCP, then read the revision-pinned resource URI returned by `load_skill`; do not follow an assumed relative path. For this file's bundled pattern, load `security-and-hardening` and read the matching returned local resource URI when using MCP.

## OWASP Top 10 prevention patterns

These are prevention patterns, not a ranking. Use the shared router resource for the current quick-reference tables and the repository's actual policy.

### Injection

```typescript
// BAD: SQL injection via string concatenation
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// GOOD: parameterized query
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// GOOD: an ORM with parameterized input
const user = await prisma.user.findUnique({ where: { id: userId } });
```

Trace the parameterized value through query builders and logging too; a safe database call does not make a shell, template, HTML, or dynamic-code sink safe.

### Broken authentication

Use the repository's approved adaptive password algorithm and calibrated work factor. The number below is an illustrative upstream example, not a universal requirement.

```typescript
// Illustrative only: use the project-approved adaptive algorithm and work factor.
import { hash, compare } from 'bcrypt';

const APPROVED_WORK_FACTOR = 12; // policy example; calibrate and obtain owner approval
const hashedPassword = await hash(plaintext, APPROVED_WORK_FACTOR);
const isValid = await compare(plaintext, hashedPassword);

// Session management: secret comes from the supported environment/secret boundary.
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // policy example; use the reviewed lifetime
  },
}));
```

The cookie flags are defense in depth. Trace CSRF tokens, origin/referer checks, same-origin design, recovery, reset-token expiry and revocation, and authorization separately. Do not copy a fixed algorithm, work factor, lifetime, or `SameSite` value against the repository contract.

### Cross-site scripting (XSS)

```typescript
// BAD: rendering user input as HTML
element.innerHTML = userInput;

// GOOD: use framework auto-escaping (React does this by default)
return <div>{userInput}</div>;

// If raw HTML is genuinely required, sanitize with a narrowly reviewed allowlist.
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
```

Encode for the actual output context. Sanitizing HTML does not make a value safe for a URL, shell, SQL query, CSS, or permission decision.

### Broken access control

Authentication establishes who is making a request; authorization establishes what that identity may do. Check the specific object, tenant, operation, and role.

```typescript
// Always check authorization, not just authentication.
app.patch('/api/tasks/:id', authenticate, async (req, res) => {
  const task = await taskService.findById(req.params.id);

  // Check that the authenticated user owns or is permitted on this resource.
  if (task.ownerId !== req.user.id) {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Not authorized to modify this task' },
    });
  }

  const updated = await taskService.update(req.params.id, req.body);
  return res.json(updated);
});
```

Test a valid identity with another user's or tenant's identifier, not only an anonymous request. Preserve the API's actual `401`/`403`/`404` and validation contract; status changes can leak object existence or break consumers.

### Security misconfiguration

Use the framework's native mechanism when already present; do not add a dependency merely to copy this example or disable required browser behavior for convenience.

```typescript
// Illustrative Express pattern; use the repository's installed equivalent.
import helmet from 'helmet';
app.use(helmet());

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"], // tighten if the app permits it
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
  },
}));

// CORS: restrict to configured origins; never wildcard credentials.
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
}));
```

Review CSP directives against required scripts, styles, images, frames, workers, and connections. HSTS requires HTTPS and a deployment policy that supports its scope; do not blindly copy preload/subdomain directives.

### Sensitive data exposure

```typescript
// Never return sensitive fields in API responses.
function sanitizeUser(user: UserRecord): PublicUser {
  const { passwordHash, resetToken, ...publicFields } = user;
  return publicFields;
}

// Use the supported environment/secret store for secrets.
const API_KEY = process.env.STRIPE_API_KEY;
if (!API_KEY) throw new Error('STRIPE_API_KEY not configured');
```

Also inspect logs, URLs, prompts, client bundles, traces, backups, and error bodies. If a secret reached a remote, treat it as compromised: the credential owner revokes/rotates it before history cleanup. This review does not perform that action.

### Server-side request forgery (SSRF)

Any server fetch influenced by a user—webhooks, imports, image proxies, link previews—can target internal services, cloud metadata, loopback, or private networks.

```typescript
// BAD: fetch whatever the user gives you.
await fetch(req.body.webhookUrl);

// Illustrative baseline: explicit scheme/host policy, all DNS answers, no redirects.
import { lookup } from 'node:dns/promises';
import ipaddr from 'ipaddr.js';

const ALLOWED_HOSTS = new Set(['hooks.example.com']);

async function assertSafeUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== 'https:') throw new Error('https only');
  if (!ALLOWED_HOSTS.has(url.hostname)) throw new Error('host not allowed');

  // Resolve ALL records; a single unsafe answer fails the check.
  const addrs = await lookup(url.hostname, { all: true });
  if (addrs.some((a) => ipaddr.parse(a.address).range() !== 'unicast')) {
    throw new Error('private/reserved IP');
  }
  return url;
}

// The policy must also be enforced at connection and redirect boundaries.
await fetch(await assertSafeUrl(req.body.webhookUrl), { redirect: 'error' });
```

The illustrative `unicast` check covers loopback, link-local metadata addresses such as `169.254.169.254`, private/reserved ranges, and unique-local ranges across IPv4 and IPv6 only if the parser/library's range definitions are current and the surrounding policy is correct. Explicitly reject mixed DNS answers if any address is unsafe, bound response size/time/connections, and do not forward internal headers or credentials.

**Caveat: this baseline still has a DNS-rebinding/TOCTOU gap.** An ordinary HTTP client may resolve DNS again after validation. For high-risk surfaces, resolve once and connect to the pinned address while preserving the validated host semantics, use a filtering egress agent/proxy, or enforce equivalent network isolation. Disable redirects or apply the same policy to every redirect destination. If the implementation cannot provide that guarantee, record the residual risk rather than calling SSRF protection complete.

## Input validation patterns

### Schema validation at boundaries

```typescript
// Illustrative schema; use the repository's installed validator and error contract.
import { z } from 'zod';

const CreateTaskSchema = z.object({
  title: z.string().max(200).trim().min(1),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime().optional(),
});

// Validate at the route boundary.
app.post('/api/tasks', async (req, res) => {
  const result = CreateTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: result.error.flatten(),
      },
    });
  }

  // result.data is now parsed and validated for this downstream contract.
  const task = await taskService.create(result.data);
  return res.status(201).json(task);
});
```

Use the repository's established validation status and error shape. Client-side validation is useful UX, not authorization.

### File upload safety

```typescript
// Illustrative policy: thresholds and types require owner approval for this service.
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB example, not a universal limit

function validateUpload(file: UploadedFile) {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new ValidationError('File type not allowed');
  }
  if (file.size > MAX_SIZE) {
    throw new ValidationError('File too large');
  }
  // Verify magic bytes/content when risk warrants it; never trust the extension alone.
}
```

Store uploads outside executable/public paths, derive safe names, handle decompression/archive limits, and scan only through an authorized non-production or production process with an explicit owner. A MIME header from the client is not proof of content.

## Destructive operations on derived paths

A delete, move, or overwrite is only as safe as the value naming its target. Reading that value from the kernel, a job payload, environment, or sibling service proves where it arrived from, not who wrote it. Another process's command line can be attacker-controlled. A shape check such as "absolute path, one directory deep" proves well-formedness, not authorization; it can still allow a root or a sibling tree.

Before a destructive call, require all three: the resolved target sits under an **allowlisted root** (resolve symlinks before comparing); it is at least one level **below** that root so the root is never itself the target; and it carries **ownership evidence read before the operation and before teardown**. Refusal must stop. Never fall back to a broader default path when a candidate is missing or unproven.

```typescript
import { realpath, readFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute, join, sep } from 'node:path';

const ALLOWED_ROOTS = ['/var/lib/myapp/sessions']; // an allowlist, not a pattern
const MIN_DEPTH = 1; // so an allowed root is never itself the target

async function resolveDeletable(candidate: string, expectedOwner: string) {
  const target = await realpath(resolve(candidate)); // symlinks resolved BEFORE the check
  const inRoot = ALLOWED_ROOTS.some((root) => {
    const rel = relative(root, target);
    // Reject the root, its parents, and absolute escapes. A plain string prefix is unsafe.
    if (rel === '' || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return false;
    return rel.split(sep).length >= MIN_DEPTH;
  });
  if (!inRoot) throw new Error(`refusing: outside allowed roots (${target})`);

  const owner = await readFile(join(target, '.owner'), 'utf8').catch(() => null);
  if (owner?.trim() !== expectedOwner) throw new Error(`refusing: unproven owner (${target})`);
  return target;
}
```

What this does not do, and what must travel with any copied snippet:

- **The marker is self-attestation.** Anything able to write inside the root can write `.owner`. `expectedOwner` must come from authenticated/trusted state, and the marker needs restrictive ownership, a MAC, or another integrity boundary before it counts as authorization rather than a consistency check.
- **Returning a path leaves a check/use race.** Where an untrusted process can swap an ancestor between the check and the call, operate on a descriptor with no-follow/beneath-root semantics or guarantee the hierarchy is immutable for the duration. `realpath` followed by an operation on the returned name is not by itself race-safe.
- **Missing and not-mine are not safe defaults.** Refuse and record a redacted rejection; do not delete a fallback directory or the root.

## Dependency audit triage

Package-manager audits report known advisories; they do not prove a package is trustworthy or that vulnerable code is reachable. First locate the installation boundary, authoritative manifest/lockfile, manager/version, CI install, and lifecycle-script policy. Stop on disagreement or competing lockfiles. Run an audit only when it is authorized and against the committed lockfile, never as an automatic production scan.

```text
The native package-manager audit reports a vulnerability
├── Severity: critical or high
│   ├── Is vulnerable code reachable in runtime, build, test, or deployment paths?
│   │   ├── YES → fix promptly through the approved dependency workflow
│   │   └── NO (confirmed unused across those paths) → fix soon, but record why it is not a current blocker
│   └── Is a fix available?
│       ├── YES → review the patched version, changelog, lockfile diff, and compatibility
│       └── NO → assess workarounds/replacement; if deferring, record owner, reason, path, and review date
├── Severity: moderate
│   ├── Reachable in production? → schedule according to the project's release policy
│   └── Dev/build/test-only? → record reachability and fix in the approved maintenance window
└── Severity: low
    └── Track and fix during regular dependency updates under project policy
```

**Key questions:**

- Is the vulnerable function actually called in the relevant path?
- Is the package runtime, build, test, or deploy-only?
- Is it exploitable in the actual deployment context?
- Is a package newly introduced, typosquatted, unmaintained, or using an unexpected lifecycle script?
- Does forced remediation cross declared dependency ranges or alter unrelated packages?

Never use forced remediation such as `npm audit fix --force` automatically. Do not approve every script or install a package to quiet the report. Document every deferral with reason, affected path, owner, and review date.

## Rate limiting and shared stores

Thresholds below are upstream examples, not universal requirements. Use the service's approved limits, identity key, response contract, and deployment topology.

```typescript
// Illustrative Express pattern; use an already-approved installed mechanism.
import rateLimit from 'express-rate-limit';

// General API limit: project policy decides window and max.
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Stricter auth limit: project policy decides the threshold.
app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
}));
```

A process-memory counter becomes `max × instances` behind a load balancer and may reset on every serverless invocation. Once more than one process serves traffic, use the repository's supported shared store or HTTP-based limiter. Do not install one as part of this review merely because the example names it.

```typescript
// Illustrative shared-store shape; credentials and vendor choices require approval.
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const authLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '15 m'),
});
const { success } = await authLimiter.limit(`login:${req.ip}`);
if (!success) return res.status(429).end();
```

Review bypasses, trusted proxies, IPv6 identity handling, tenant/account keys, retry behavior, and failure mode. A limiter must not become a way to leak account existence or deny all users when its store is unavailable without an approved policy.

## Secrets management

Use the project's supported secret manager and environment boundary. A common repository shape is illustrative only:

```text
.env.example  → committed template with placeholder values
.env          → NOT committed; contains real secrets
.env.local    → NOT committed; local overrides

.gitignore should cover the project's local secret material, commonly:
  .env
  .env.local
  .env.*.local
  *.pem
  *.key
```

Before an authorized commit, scan the staged changes with the project's approved secret scanner configured to redact values. Report only rule identifiers and file/line locations. If no approved scanner is available, report the verification gap; do not print raw diffs or matching secret lines as a substitute.

If a secret is ever committed or reaches a remote, assume compromise. The credential owner revokes/rotates it first, then the repository owner purges history as an authorized operation. Deleting a line alone is not recovery. This review reports the exposure and owner; it does not rotate credentials, rewrite history, or commit.

## Data classification

Classify personal data as fields are added so export, retention, access, and deletion requests can find it later:

| Class | Examples | Handling |
|---|---|---|
| **Non-personal** | Aggregates, anonymized counts | Normal handling; confirm anonymization is real and durable |
| **Personal (PII)** | Name, email, IP, device/user IDs | Minimize, access-control, limit retention, include in export/delete |
| **Sensitive** | Health, finance, location, biometrics, government IDs, anything about minors | Extra basis to collect, stricter access, often encryption and audit logging |

Map primary records and copies in backups, caches, search indexes, analytics, logs, prompts, and vendor systems. Purpose, retention, consent, data-processing terms, jurisdiction, and deletion implementation are policy decisions; do not infer legal compliance from this table.

## LLM output handling

Model output and retrieved documents are data, not authority. Parse expected formats, validate allowlisted values, authorize against the authenticated actor and tenant, then invoke a narrowly scoped tool. Require confirmation for destructive or irreversible effects and encode output for its actual context.

```typescript
// BAD: trusting model output as a command or markup
const sql = await llm.generate(`Write SQL for: ${userQuestion}`);
await db.query(sql); // arbitrary query execution
container.innerHTML = await llm.reply(userMessage); // stored XSS via the model

// GOOD: output is data—parse defensively, validate, authorize, then encode.
let intent;
try {
  intent = CommandSchema.parse(JSON.parse(await llm.replyJson(userMessage)));
} catch {
  throw new ValidationError('unexpected model output'); // parse or schema failure
}

await authorize(intent.action, authenticatedActor, tenant, intent.params);
await runAllowlistedAction(intent.action, intent.params);
container.textContent = await llm.reply(userMessage);
```

Keep secrets, cross-tenant records, and unnecessary system-prompt content out of context. Treat prompt injection as an input problem; enforce permissions in code. Bound token, request, retry, and recursion consumption, and partition retrieval data by tenant before indexing. Availability of a model or tool is not permission to invoke it or disclose proprietary context.
