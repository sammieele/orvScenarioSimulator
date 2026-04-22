// ConstellationSystem.js — tracks player behavior and injects constellation events (no UI)

class ConstellationSystem {

  // Adjust constellation favor based on the dominant trait of the chosen option
  observeChoice(choice, gameState) {
    let dominant = null;
    let maxAbs   = 0;
    for (const fx of choice.traitEffects) {
      if (abs(fx.amount) > maxAbs) {
        maxAbs   = abs(fx.amount);
        dominant = fx.trait;
      }
    }
    if (dominant === 'empathy') gameState.constellationFavor += 5;
    if (dominant === 'bravery') gameState.constellationFavor += 3;
    if (dominant === 'caution') gameState.constellationFavor += 1;
  }

  // Set narrative flags when favor crosses thresholds
  injectEvent(gameState) {
    if (gameState.constellationFavor > 30) {
      gameState.setFlag('constellationBoost', true);
    } else if (gameState.constellationFavor < -30) {
      gameState.setFlag('constellationSabotage', true);
    }
  }

  // Apply any pending constellation effect to probability bias; returns effect key or null
  applyFavorEffect(gameState) {
    if (gameState.getFlag('constellationBoost')) {
      gameState.probabilityBias += 10;
      gameState.setFlag('constellationBoost', false);
      return 'boost';
    }
    if (gameState.getFlag('constellationSabotage')) {
      gameState.probabilityBias -= 10;
      gameState.setFlag('constellationSabotage', false);
      return 'sabotage';
    }
    return null;
  }
}
