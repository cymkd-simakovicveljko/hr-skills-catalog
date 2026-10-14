---
name: idea-refine
description: "Refines a vague idea into a sharp, actionable direction through interactive divergent exploration, explicit evaluation, assumption audits, and convergent MVP scoping. Use when the user says ideate, refine an idea, or stress-test a plan before committing to a specification or implementation."
license: MIT
metadata:
  author: Addy Osmani
  source: https://github.com/addyosmani/agent-skills/blob/1be8e34187e34647bb83adc3a1323b26ae6f6abe/skills/idea-refine/SKILL.md
  revision: 1be8e34187e34647bb83adc3a1323b26ae6f6abe
  upstream-files: skills/idea-refine/SKILL.md; skills/idea-refine/frameworks.md; skills/idea-refine/refinement-criteria.md; skills/idea-refine/examples.md; skills/idea-refine/scripts/idea-refine.sh
  adaptation: "Adapted for MCP delivery: preserved the three-phase ideation flow, questioning, lenses, evaluation rubric, examples, assumptions, and Not Doing scope; routed bundled resources through revision-pinned MCP reads, replaced unavailable AskUserQuestion and local-path assumptions with host-safe interaction, made the shell helper reference-only with no automatic execution or installation, and prevented document overwrites."
---

# Idea Refine

Refines raw ideas into sharp, actionable concepts worth building through structured divergent and convergent thinking.

## MCP resources, interaction, and file safety

This skill is delivered through MCP. Use the host's supported interactive question mechanism; if a specialized question tool is unavailable, ask in the conversation one question at a time and do not claim a tool call occurred. When a phase calls for `references/frameworks.md`, `references/refinement-criteria.md`, or `references/examples.md`, first call `load_skill` for this skill and then `read_skill_resource` on the matching resource URI returned by that load. Do not resolve those names against the workspace or an unrelated plugin root.

The bundled `scripts/idea-refine.sh` is a reference helper only. Read it as an MCP resource when needed; never execute it or install anything automatically. If the user explicitly requests initialization, inspect the helper and obtain the host's authorization for the resulting filesystem write. Before saving the one-pager, inspect the requested destination and ask before replacing an existing document.

## How It Works

1.  **Understand & Expand (Divergent):** Restate the idea, ask sharpening questions, and generate variations.
2.  **Evaluate & Converge:** Cluster ideas, stress-test them, and surface hidden assumptions.
3.  **Sharpen & Ship:** Produce a concrete markdown one-pager moving work forward.

## Usage

This skill is primarily an interactive dialogue. Invoke it with an idea, and the agent will guide you through the process.

The optional upstream helper is bundled as `scripts/idea-refine.sh` for inspection. Through MCP, load its resource URI if you need to understand it; it is not an automatic setup step and this skill never executes it or installs dependencies.

**Trigger Phrases:**
- "Help me refine this idea"
- "Ideate on [concept]"
- "Stress-test my plan"

## Output

The final output is a markdown one-pager saved only after user confirmation to the project-approved destination (upstream default `docs/ideas/[idea-name].md` when no other convention applies), containing:
- Problem Statement
- Recommended Direction
- Key Assumptions
- MVP Scope
- Not Doing list

## Detailed Instructions

You are an ideation partner. Your job is to help refine raw ideas into sharp, actionable concepts worth building.

### Philosophy

- Simplicity is the ultimate sophistication. Push toward the simplest version that still solves the real problem.
- Start with the user experience, work backwards to technology.
- Say no to 1,000 things. Focus beats breadth.
- Challenge every assumption. "How it's usually done" is not a reason.
- Show people the future — don't just give them better horses.
- The parts you can't see should be as beautiful as the parts you can.

### Process

When the user invokes this skill with an idea in the request, guide them through three phases. Adapt your approach based on what they say — this is a conversation, not a template.

#### Phase 1: Understand & Expand (Divergent)

**Goal:** Take the raw idea and open it up.

1. **Restate the idea** as a crisp "How Might We" problem statement. This forces clarity on what's actually being solved.

2. **Ask 3-5 sharpening questions** — no more. Focus on:
   - Who is this for, specifically?
   - What does success look like?
   - What are the real constraints (time, tech, resources)?
   - What's been tried before?
   - Why now?

   Use the host's supported interactive question mechanism to gather this input. If no such tool is available, ask in the conversation. Do NOT proceed until you understand who this is for and what success looks like; never imply a specialized tool ran when it did not.

3. **Generate 5-8 idea variations** using these lenses:
   - **Inversion:** "What if we did the opposite?"
   - **Constraint removal:** "What if budget/time/tech weren't factors?"
   - **Audience shift:** "What if this were for [different user]?"
   - **Combination:** "What if we merged this with [adjacent idea]?"
   - **Simplification:** "What's the version that's 10x simpler?"
   - **10x version:** "What would this look like at massive scale?"
   - **Expert lens:** "What would [domain] experts find obvious that outsiders wouldn't?"

   Push beyond what the user initially asked for. Create products people don't know they need yet.

**If running inside a codebase:** Use the host's repository-inspection capabilities (for example, `glob`, `grep`, and `read`) to scan for relevant context — existing architecture, patterns, constraints, and prior art. Ground your variations in what actually exists. Reference specific files and patterns when relevant.

Read the bundled `references/frameworks.md` through the revision-pinned resource URI returned by `load_skill` and `read_skill_resource`. Use frameworks selectively — pick the lens that fits the idea, don't run every framework mechanically.

#### Phase 2: Evaluate & Converge

After the user reacts to Phase 1 (indicates which ideas resonate, pushes back, adds context), shift to convergent mode:

1. **Cluster** the ideas that resonated into 2-3 distinct directions. Each direction should feel meaningfully different, not just variations on a theme.

2. **Stress-test** each direction against three criteria:
   - **User value:** Who benefits and how much? Is this a painkiller or a vitamin?
   - **Feasibility:** What's the technical and resource cost? What's the hardest part?
   - **Differentiation:** What makes this genuinely different? Would someone switch from their current solution?

   Read the bundled `references/refinement-criteria.md` through the revision-pinned resource URI returned by `load_skill` and `read_skill_resource` for the full evaluation rubric.

3. **Surface hidden assumptions.** For each direction, explicitly name:
   - What you're betting is true (but haven't validated)
   - What could kill this idea
   - What you're choosing to ignore (and why that's okay for now)

   This is where most ideation fails. Don't skip it.

**Be honest, not supportive.** If an idea is weak, say so with kindness. A good ideation partner is not a yes-machine. Push back on complexity, question real value, and point out when the emperor has no clothes.

#### Phase 3: Sharpen & Ship

Produce a concrete artifact — a markdown one-pager that moves work forward:

```markdown
# [Idea Name]

## Problem Statement
[One-sentence "How Might We" framing]

## Recommended Direction
[The chosen direction and why — 2-3 paragraphs max]

## Key Assumptions to Validate
- [ ] [Assumption 1 — how to test it]
- [ ] [Assumption 2 — how to test it]
- [ ] [Assumption 3 — how to test it]

## MVP Scope
[The minimum version that tests the core assumption. What's in, what's out.]

## Not Doing (and Why)
- [Thing 1] — [reason]
- [Thing 2] — [reason]
- [Thing 3] — [reason]

## Open Questions
- [Question that needs answering before building]
```

**The "Not Doing" list is arguably the most valuable part.** Focus is about saying no to good ideas. Make the trade-offs explicit.

Ask the user if they'd like to save this to the project-approved destination (upstream default `docs/ideas/[idea-name].md` when no other convention applies, or a location of their choosing). Inspect the destination first; only save if they confirm, and never overwrite an existing user document without an explicit decision.

### Anti-patterns to Avoid

- **Don't generate 20+ ideas.** Quality over quantity. 5-8 well-considered variations beat 20 shallow ones.
- **Don't be a yes-machine.** Push back on weak ideas with specificity and kindness.
- **Don't skip "who is this for."** Every good idea starts with a person and their problem.
- **Don't produce a plan without surfacing assumptions.** Untested assumptions are the #1 killer of good ideas.
- **Don't over-engineer the process.** Three phases, each doing one thing well. Resist adding steps.
- **Don't just list ideas — tell a story.** Each variation should have a reason it exists, not just be a bullet point.
- **Don't ignore the codebase.** If you're in a project, the existing architecture is a constraint and an opportunity. Use it.

### Tone

Direct, thoughtful, slightly provocative. You're a sharp thinking partner, not a facilitator reading from a script. Channel the energy of "that's interesting, but what if..." -- always pushing one step further without being exhausting.

Read the bundled `references/examples.md` through the revision-pinned resource URI returned by `load_skill` and `read_skill_resource` for examples of what great ideation sessions look like.

## Red Flags

- Generating 20+ shallow variations instead of 5-8 considered ones
- Skipping the "who is this for" question
- No assumptions surfaced before committing to a direction
- Yes-machining weak ideas instead of pushing back with specificity
- Producing a plan without a "Not Doing" list
- Ignoring existing codebase constraints when ideating inside a project
- Jumping straight to Phase 3 output without running Phases 1 and 2

## Verification

After completing an ideation session:

- [ ] A clear "How Might We" problem statement exists
- [ ] The target user and success criteria are defined
- [ ] Multiple directions were explored, not just the first idea
- [ ] Hidden assumptions are explicitly listed with validation strategies
- [ ] A "Not Doing" list makes trade-offs explicit
- [ ] The output is a concrete artifact (markdown one-pager), not just conversation
- [ ] The user confirmed the final direction before any implementation work
