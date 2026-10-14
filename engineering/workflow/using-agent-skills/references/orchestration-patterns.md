# Orchestration patterns

Adapted from `references/orchestration-patterns.md` in [Addy Osmani agent-skills at 1be8e34](https://github.com/addyosmani/agent-skills/blob/1be8e34187e34647bb83adc3a1323b26ae6f6abe/references/orchestration-patterns.md). MIT license is bundled with the router. This version preserves the five patterns, decision criteria, competing-hypothesis example and anti-patterns while replacing Claude-specific installation and capability assumptions with the actual host's facilities.

The main agent coordinates within the user's approved scope. A specialist returns findings; it does not secretly start other specialists. `using-agent-skills` is an instruction router in the main context, not an extra agent that paraphrases other agents' work.

## 1. Direct specialist perspective

Use one perspective on one artifact when that is enough: code review of a PR, security review of an auth route, or test-gap analysis of a change. Apply the appropriate skill and, when useful, its bundled persona. A persona is a prompt resource, not proof that a named agent is installed.

**Complete when:** the requested question is answered with evidence and limitations. Additional reviews are recommendations, not hidden delegated work.

## 2. Single-persona lifecycle mode

A saved workflow such as `review` or `webperf` combines a repeatable procedure with a specialist perspective. It should remove repeated setup, not add a routing-only agent. The host may expose this as a slash command, but MCP itself does not register commands.

Retrieve the relevant command resource through this router's returned resource URI. Invoke a host subagent only where it adds independent context or expertise; otherwise apply the perspective directly and say it was the same agent.

**Complete when:** the mode's actual checks and report are delivered, without claiming independent review that did not happen.

## 3. Parallel fan-out with merge

Use for independent perspectives on a known artifact, notably release-readiness review:

```text
                 code-reviewer     ─┐
release input →  security-auditor  ─┼→ main agent reconciles → readiness + recovery
                 test-engineer     ─┘
```

Before spawning:

- Give every reviewer the same exact diff/revision, task scope, acceptance criteria and applicable policy.
- Provide its persona, needed skill instructions or same-revision MCP URIs, and the expected output. Check whether the child actually has MCP access.
- Assign read-only ownership. Separate any runtime checks that contend for shared data, ports, caches or fixtures.
- Start independent reviewers in one host-supported concurrent batch. Do not serialize independent work and call it parallel.
- Keep merging in the main context: deduplicate findings, reconcile contradictions against code or execution evidence, and identify unverified claims.

If independent agents are unavailable, report that limitation. A sequential or same-agent pass may provide useful evidence, but is not equivalent to independent parallel review. If independent review is a required project gate, readiness stays blocked until it is supplied or the policy's authorized exception process resolves it.

Adopt this pattern only if reviewers produce distinct useful findings, there is no shared mutation dependency, and the main agent can reconcile their results without discarding evidence.

## 4. User-approved sequential lifecycle

The lifecycle has real dependencies:

```text
spec → approved scope → plan → approved implementation → build/test → review → authorized release
```

Carry the actual artifacts and evidence forward, not paraphrases that lose acceptance criteria. The user owns material product decisions and approval gates. Natural-language mode requests work even without native slash commands.

`build auto` is the bounded exception to per-task stepping: after a spec and full plan are approved, execute dependent tasks under that approval, retaining every verification gate. It does not authorize a new scope, risky operations, external model disclosure, or deployment. Per-task commits require authorization to commit, explicitly included in the approved execution plan or separately granted. Stop on failure or ambiguity and resume from recorded evidence only after resolution.

**Complete when:** each phase's artifact and applicable approval exist before its dependent action. A plan is not an implementation, and completed code is not a release.

## 5. Research isolation

Use a read-only research agent when a large reading set would obscure the main decision. Supply the exact question, search scope and required evidence. Ask for file/line references, negative-search scope, confirmed findings and uncertainties rather than a generic summary.

Use the host's existing read-only research facility; do not create a persona just to rename it. For a small direct lookup, do it inline.

**Complete when:** the digest answers the downstream question and retains enough source evidence for verification.

## Competing-hypothesis investigation

Example: checkout intermittently hangs after a release. Candidate causes include a payment race, a blocking authentication call, a query regression and a retrying dependency. This differs from release review: the investigators are finding a cause, not assessing one fixed diff.

If the host supports peer communication, assign independent hypotheses, common observations and disconfirming experiments. Reviewers can challenge each other's evidence while the main agent controls scope and shared resources. If it does not, the main agent relays concrete observations and conflicting predictions; disclose the coordination limitation.

A useful task prompt:

```text
Investigate intermittent checkout hangs without changing production.
One investigator traces event ordering and payment concurrency; another
traces auth and dependency latency; another designs a safe reproduction
that distinguishes the hypotheses. Share the exact traces and observations.
Test each candidate against counter-evidence. The main agent reconciles
findings and verifies the causal mechanism before proposing a repair.
```

Agreement between reviewers is not root-cause proof. Require a distinguishing observation or reproduction. Supply sanitized data and authorize any external provider separately. Release review remains the simpler fan-out pattern; don't add a collaboration layer where reviewers don't need to communicate.

## Anti-patterns and decision flow

Avoid routing-only personas, persona-calls-persona chains, deep coordinator trees, and lifecycle wrappers that silently remove human checkpoints. Each adds coordination without necessarily adding evidence.

1. One perspective on one artifact? Use it directly.
2. A repeated single-perspective workflow? Use the corresponding mode.
3. Independent specialist questions on the same artifact? Fan out and merge.
4. One phase needs the previous phase's result? Sequence the work with its approvals.
5. Investigators need to challenge competing explanations? Use supported peer coordination, or relay evidence explicitly.
6. A large read set with a small useful result? Isolate read-only research.

Add a new orchestration pattern only after real use demonstrates why these patterns are insufficient. Host plugins, experimental teams, hooks, caches and named agent types are not installed by this MCP catalog; discover actual capabilities and report missing ones.
