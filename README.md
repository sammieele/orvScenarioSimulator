# ORV Scenario Simulator

> *"I've read this story before. I know how it ends. But you don't."*

A visual novel-style interactive experience built with p5.js, inspired by the web novel **Omniscient Reader's Viewpoint**. Players navigate four narrative scenarios where the system shows you the odds — but never quite tells the truth.

---

## About

The ORV Scenario Simulator is an ART 234 project exploring **perceived agency vs. actual control**. Every choice comes with a displayed success probability. What the system doesn't tell you is that those numbers may be wrong — deliberately, structurally, or because the constellation is watching.

The simulation tracks how you respond to misleading feedback, punishes blind trust, and rewards players who learn to read between the lines.

---

## Scenarios

| # | Title | Core Deception |
|---|-------|----------------|
| 1 | **Bridge Collapse** | Probabilities are close to honest — a gentle introduction |
| 2 | **Constellation Favor** | A hidden audience begins shaping your odds |
| 3 | **Green Zone Betrayal** | An 80% guarantee hides a 40% reality |
| 4 | **The Strongest Sacrifice** | The system's most confident prediction is its biggest lie |

---

## How It Works

### Systems

**Probability System** — Each choice has two numbers: a `displayProbability` shown to the player and an `actualProbability` used to resolve outcomes. These frequently differ. Past decisions, accepted power, and constellation favor all silently shift the actual odds before the dice roll.

**Trust in System** — A score (0–100) that tracks how often the displayed and actual probabilities align. Large mismatches erode trust; rare moments of honesty restore a little.

**Trait Tracking** — Every choice affects one or more of three traits:
- `bravery` — bold, direct action
- `empathy` — prioritizing others
- `caution` — observation before acting

**Constellation System** — An invisible audience monitors your playstyle. Consistent empathy raises constellation favor; bravery raises it less. Cross a threshold in either direction and the constellation intervenes — tipping the scales for or against you in the next scenario, without explanation.

---

### State That Persists Across Scenarios
scenarioIndex         — which scenario you're on
playerTraits          — running bravery / empathy / caution totals
trustInSystem         — eroded by dishonest probabilities
probabilityBias       — shifted by constellation events
constellationFavor    — your invisible audience score
flags                 — narrative switches (e.g. acceptedPower)

---

## Architecture

Eight files with a strict separation between data, logic, and rendering.
orv_simulator.html       — entry point, loads all scripts
sketch.js                — p5.js setup(), draw(), input handlers, start/end screens
GameState.js             — all persistent player data
Scenario.js              — Scenario and Choice data classes (no logic)
scenarios.js             — the four scenario objects with all probability values
ScenarioEngine.js        — scenario flow, choice resolution, system coordination
ProbabilitySystem.js     — probability modification, outcome rolling, trust shifts
ConstellationSystem.js   — behavior tracking, threshold events, favor effects
UIRenderer.js            — all drawing; receives data only, contains no game logic

---

**Course:** ART 234 · **Author:** Sammie Le · **Stack:** p5.js, vanilla JavaScript  
**Inspired by:** *Omniscient Reader's Viewpoint* by Sing Shong
