// ProbabilitySystem.js — probability calculations and outcome resolution (no UI)

class ProbabilitySystem {

  // Apply state-based modifiers to the base actual probability
  modifyProbability(baseActual, gameState) {
    let p = baseActual;
    p += gameState.probabilityBias;
    if (gameState.getFlag('acceptedPower')) p += 15;

    const favor = gameState.constellationFavor;
    if (favor > 30)       p += 10;
    else if (favor < -30) p -= 10;

    return constrain(p, 0, 100);
  }

  // Roll a random outcome against a modified probability (0–100)
  rollOutcome(modifiedProbability) {
    return (random() * 100) < modifiedProbability;
  }

  // Resolve a choice: returns { success: bool, modifiedActual: number }
  resolveChoice(choice, gameState) {
    const modifiedActual = this.modifyProbability(choice.actualProbability, gameState);
    const success        = this.rollOutcome(modifiedActual);
    return { success, modifiedActual };
  }

  // Calculate how much trust shifts based on displayed vs actual probability
  calculateTrustShift(displayedProbability, modifiedActualProbability) {
    const diff = abs(displayedProbability - modifiedActualProbability);
    if (diff > 30) return -15;
    if (diff > 15) return -5;
    return 1;   // small positive reward when system was honest
  }
}
