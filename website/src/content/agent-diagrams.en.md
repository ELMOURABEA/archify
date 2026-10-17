# Create diagrams with your coding agent

Archify is an open-source diagram skill for coding agents including Claude Code, Codex, Cursor, OpenCode, and GitHub Copilot. Your agent interprets a description or repository evidence and writes typed JSON. Archify renders and checks that source to produce an interactive HTML diagram.

Use it when you want to explain a system's parts, a process, a sequence of calls, or another supported relationship structure. Start from words if you do not have a repository. Start from code when the diagram needs source evidence.

The generated diagram is a model of the facts its author supplied. Passing its checks does not prove that a running system behaves that way.

<span id="responsibilities" class="section-anchor" aria-hidden="true"></span>

## What your agent does, and what Archify does

Your agent reads the information you provide, asks about important missing facts, chooses a diagram type, and authors or revises the structured source. For a repository-backed task, the agent also examines relevant code.

Archify turns that source into an HTML artifact and applies its rendering and validation checks. The result retains a structured source you can revise through the agent. Readers can inspect the generated artifact in a browser without installing Archify themselves.

That distinction matters: Archify is not an independent source-code discovery service, a live system monitor, or a hosted team editor. A convincing picture is not evidence for a relationship that was never established.

<span id="setup" class="section-anchor" aria-hidden="true"></span>

## Set up your agent

Open the [agent-aware quick start](start.html). Select the agent you actually use and choose a project-scoped or global installation. Follow the command shown there rather than copying another agent's installation path.

The [installation reference](https://github.com/tt-a1i/archify/blob/main/README.md#installation-options) explains supported surfaces and their constraints. The renderer workflow needs an environment with file access and Node.js; requirements can differ by integration. Being able to chat with an AI model alone does not establish that the environment can run the workflow.

Installation instructions are not a guarantee that every agent/version combination has been tested. If setup fails, record the agent, its version, your operating system, and the exact error before changing the diagram itself.

<span id="description-workflow" class="section-anchor" aria-hidden="true"></span>

## No code repository: read a Chinese workflow diagram

Without a code repository, you can start with steps, allowances, and rules. Open the existing [Chinese leave-planning workflow](cases/life/leave-plan.workflow.html) alongside its [revision-pinned JSON source](https://github.com/tt-a1i/archify/blob/68031cf978e0b906aa56c684a394049a3ea9d583/docs/cases/life/leave-plan.workflow.json). This is a walkthrough of an existing source file, not a fresh agent execution record.

Read the two lanes, “休假计划” (leave plan) and “规则提醒” (rule reminders), separately. The diagram has 8 nodes and 7 relationships; its main path has only 6 nodes, from the opening allowance through four allocations to the final balance. Annual leave is allocated as 1 + 4 + 3 + 2, totaling 10 days. The spring allocation also uses 2 compensatory days, bringing the total to 12. Two branches connect expiry and approval reminders; they are not additional leave deductions.

Review order, allowance, and reminders separately: follow the main path to reconcile the remaining balance, then check whether a branch merely adds a constraint. Do not count a reminder as more leave. These are illustrative rules, not real calendar or company leave-policy advice. The “9/10 consecutive days off” labels are not a real-world guarantee; dates and applicable policies need separate verification.

To start from your own description, open the [workflow quick start](start.html?type=workflow&input=description), provide only confirmed steps and rules, and mark unknown conditions.

<span id="cache-scenarios" class="section-anchor" aria-hidden="true"></span>

## Try two bounded requests: cache hit and cache miss

A sequence diagram answers “who calls whom, and in what order?” For the stable 3.1.0 workflow described here, make two separate diagrams for these mutually exclusive scenarios rather than putting them on one request timeline. Try this description in your configured agent:

> Use Archify to create two separate sequence diagrams: one for a cache hit and one for a cache miss. Both begin with Browser calling API and API checking Redis. On a hit, API returns the cached result to Browser. On a miss, API queries PostgreSQL, writes the result to Redis, and returns it to Browser. Clearly label the scenario each diagram represents. Do not arrange mutually exclusive paths as the chronological steps of one request. Do not add authentication, queues, retries, or measured timings that were not specified. If missing information would materially affect the order, ask me first.

This is illustrative input, not a claim about your application. The existing [cache-miss example](https://archify.si/gallery/artifacts/cache-miss.sequence.html) illustrates a different, miss-only request with additional authentication and trace details. It is not the output of this prompt; do not copy those extra facts into your own system without evidence.

When reviewing your result, check:

- Are Browser, API, Redis, and PostgreSQL represented with the intended responsibilities?
- Are there two separately labeled diagrams, with no suggestion that a hit and a miss both execute during the same request?
- Does the miss path return a response after the database lookup and cache write described in the input?
- Did the agent introduce any unsupported behavior or timings?

If the diagram is wrong, correct the meaning first. For example: “In our application, cache population is asynchronous. Update that part of the sequence and mark the response timing as unknown until we confirm it.” Only make that correction when it is true for your application.

<span id="repository-evidence" class="section-anchor" aria-hidden="true"></span>

## Map a repository without inventing its architecture

Tell the agent which repository and behavior matter. A focused request is easier to check than “draw everything.”

> Read this repository and use Archify to explain the runtime path for [specific request or job]. Identify the components and relationships supported by the code. Distinguish runtime components from build or development tools. Use repository evidence where supported, state which revision you inspected, and mark unknown deployment details rather than inventing them. Keep implementation detail in supporting cards when it does not help explain the primary path.

Before accepting a repository-backed diagram, check:

- Scope: which request, job, module, or subsystem does it explain?
- Revision: what repository and commit were inspected?
- Evidence: which files support each important component and relationship?
- Boundaries: are external services and ownership or deployment boundaries established, or merely assumed?
- Completeness: are important failure or return paths missing from the story?
- Unknowns: are missing facts visible rather than disguised as certainty?

Where an artifact includes verified source links, inspect them. A source link shows where the diagram's evidence comes from; it does not by itself establish production behavior. Logs, traces, configuration, and human review may still be needed.

For an existing source-backed example, see the [MCO runtime architecture](https://archify.si/cases/mco-runtime.architecture.html) and its [typed source](https://github.com/tt-a1i/archify/blob/main/docs/cases/mco-runtime.architecture.json). The example describes its pinned revision, not the repository's future state.

[Follow the MCO source case: who decodes output and who writes files →](cases/mco-runtime.html)

<span id="review-and-share" class="section-anchor" aria-hidden="true"></span>

## Revise, inspect, and share

Make focused revisions through your agent: explain a missing return, rename a component, or correct a relationship. Preserve facts that have not changed. Ask the agent to rerun the applicable checks and report failures rather than presenting an unchecked revision as complete.

Open the HTML and review both its meaning and readability. Automated checks and a human visual inspection answer different questions. Do not treat one as a substitute for the other.

Share the HTML when readers need its interactions. Use an image export when a document or slide needs a static view. Archify documents PNG, JPEG, WebP, SVG, and WebM exports; availability depends on the format, browser, and local tooling. Inspect the actual artifact's export menu before committing to a delivery format. An exported image does not preserve the HTML's interactive controls.

Before sharing a repository-derived artifact, check its labels, cards, embedded source, and links for information that should not leave your team. A standalone file is portable, not automatically public-safe. The coding agent's own data handling remains separate from Archify's artifact format.

<span id="questions" class="section-anchor" aria-hidden="true"></span>

## Questions people ask

### Is Archify an AI image generator?

It produces structured diagrams through an agent-authored JSON and rendering workflow. Use it for explainable parts, relationships, steps, and states, rather than treating it as a general-purpose illustration generator.

### Which diagram types are available?

The current stable documentation lists architecture, workflow, sequence, dataflow, lifecycle, entity-relationship, class, tree, timeline, and waterfall diagrams. The [scenario guide](guide.html) explains selected starting recipes; it is not a promise that every mode supports every interaction or notation.

### Can I use it for flowcharts or UML?

Workflow mode can describe steps, branches, and participants. Class and sequence modes address particular modeling needs associated with UML. Choose the supported type for your question; do not assume complete UML-standard coverage from the existence of a class or sequence diagram.

### Can I start with Mermaid?

Yes, an agent can interpret supported Mermaid input and author Archify JSON from its meaning. This is not a promise of complete automatic parsing or lossless round-trip conversion. Check that the relationships and alternatives you need survive the conversion.

### Is a repository required?

No. A clear description can be enough. A repository becomes useful when the diagram must explain real code and you want inspectable source evidence.

### Is it free, and which Archify is this?

This guide concerns the [tt-a1i/archify open-source project](https://github.com/tt-a1i/archify), whose official website is [archify.si](https://archify.si). Its code is MIT-licensed. Your agent or other services may have their own costs and terms. A similarly named paid service is not automatically affiliated with this project.

### What should I do next?

Use [Start](start.html) for installation, the [Scenario Guide](guide.html) to choose a recipe, and the [Proof Lab](gallery.html) to inspect existing artifacts and their evidence.
