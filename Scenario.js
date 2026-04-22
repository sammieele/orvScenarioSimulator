// Scenario.js — Scenario and Choice data classes (no logic or rendering)

class Choice {
  constructor(label, displayProbability, actualProbability,
              traitEffects, successText, failureText, flagToSet = null) {
    this.label              = label;
    this.displayProbability = displayProbability;   // shown to player
    this.actualProbability  = actualProbability;    // used in resolution
    this.traitEffects       = traitEffects;         // [{ trait, amount }]
    this.successText        = successText;
    this.failureText        = failureText;
    this.flagToSet          = flagToSet;            // { name, value } | null
  }
}

class Scenario {
  constructor(id, title, body, choices, requiredFlags = []) {
    this.id            = id;
    this.title         = title;
    this.body          = body;
    this.choices       = choices;
    this.requiredFlags = requiredFlags;
  }
}
