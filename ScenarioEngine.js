// ScenarioEngine.js — controls scenario flow and coordinates all systems (no rendering)

class ScenarioEngine {
  constructor(gameState, scenarioList, probSystem, constSystem, uiRenderer) {
    this.gameState       = gameState;
    this.scenarioList    = scenarioList;
    this.probSystem      = probSystem;
    this.constSystem     = constSystem;
    this.ui              = uiRenderer;
    this.currentScenario = null;
    this.state           = 'loading'; // loading | awaiting | resolving | advancing | system_msg | end
  }

  loadScenario(index) {
    if (index >= this.scenarioList.length) {
      this.state = 'end';
      return null;
    }
    const scenario = this.scenarioList[index];
    if (scenario.requiredFlags && scenario.requiredFlags.length > 0) {
      const met = scenario.requiredFlags.every(f => this.gameState.getFlag(f));
      if (!met) {
        this.gameState.advanceScenario();
        return this.loadScenario(index + 1);
      }
    }
    return scenario;
  }

  presentScenario(scenario) {
    this.currentScenario = scenario;
    this.ui.renderNarrativeText(scenario.title, scenario.body);
    this.ui.renderChoiceButtons(scenario.choices, (i) => this.handleChoice(i));
    this.state = 'awaiting';
  }

  handleChoice(choiceIndex) {
    if (this.state !== 'awaiting') return;
    this.state = 'resolving';

    // Shallow-clone choice so SCENARIOS data stays immutable
    const choice = Object.assign({}, this.currentScenario.choices[choiceIndex]);

    // Dynamic actual probability: "Test the boundary" (actualProbability === -1)
    if (choice.actualProbability === -1) {
      choice.actualProbability = constrain(
        this.gameState.trustInSystem * 0.5 + this.gameState.constellationFavor * 0.3,
        5, 90
      );
    }

    // Wild-variance: "Look for another solution" in sacrifice scenario
    if (this.currentScenario.id === 'sacrifice' && choiceIndex === 2) {
      choice.actualProbability = constrain(50 + random(-25, 25), 5, 95);
    }

    const { success, modifiedActual } = this.probSystem.resolveChoice(choice, this.gameState);

    // Trust shift
    const trustShift = this.probSystem.calculateTrustShift(
      choice.displayProbability, modifiedActual
    );
    this.gameState.trustInSystem = constrain(
      this.gameState.trustInSystem + trustShift, 0, 100
    );

    // Trait effects
    for (const fx of choice.traitEffects) {
      this.gameState.updateTrait(fx.trait, fx.amount);
    }

    // Narrative flags
    if (choice.flagToSet) {
      this.gameState.setFlag(choice.flagToSet.name, choice.flagToSet.value);
    }

    // Constellation tracking
    this.constSystem.observeChoice(choice, this.gameState);
    this.constSystem.injectEvent(this.gameState);

    this.ui.renderOutcome(success ? choice.successText : choice.failureText, success);
    this.ui.buttons = [];
  }

  advanceToNextScenario() {
    this.state = 'advancing';
    this.gameState.advanceScenario();

    const effect = this.constSystem.applyFavorEffect(this.gameState);
    if (effect) {
      const msg = effect === 'boost'
        ? 'The constellation tilts the scales in your favor.'
        : 'The constellation withdraws its blessing. The odds grow heavier.';
      this.ui.clearScreen();
      this.ui.renderSystemMessage(msg);
      this.state = 'system_msg';
    } else {
      this._doLoad();
    }
  }

  finishSystemMsg() {
    this._doLoad();
  }

  _doLoad() {
    const next = this.loadScenario(this.gameState.scenarioIndex);
    if (!next) { this.state = 'end'; return; }
    this.ui.clearScreen();
    this.presentScenario(next);
  }
}
