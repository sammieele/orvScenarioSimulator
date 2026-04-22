// GameState.js — manages all persistent player data across scenarios

class GameState {
  constructor() { this.reset(); }

  reset() {
    this.scenarioIndex      = 0;
    this.playerTraits       = { bravery: 0, empathy: 0, caution: 0 };
    this.trustInSystem      = 50;        // neutral start (0–100)
    this.probabilityBias    = 0;         // shifts actual probabilities
    this.constellationFavor = 0;         // invisible audience score
    this.flags              = {};        // named narrative booleans
  }

  updateTrait(traitName, amount) {
    if (this.playerTraits[traitName] !== undefined) {
      this.playerTraits[traitName] += amount;
    }
  }

  setFlag(flagName, value) { this.flags[flagName] = value; }
  getFlag(flagName)        { return this.flags[flagName] ?? false; }
  advanceScenario()        { this.scenarioIndex++; }
}
