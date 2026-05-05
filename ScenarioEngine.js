// ScenarioEngine.js — controls scenario flow and coordinates all systems (no rendering)

class ScenarioEngine {
  constructor(gameState, scenarioList, probSystem, constSystem, uiRenderer) {
    this.gameState       = gameState;
    this.scenarioList    = scenarioList;
    this.probSystem      = probSystem;
    this.constSystem     = constSystem;
    this.ui              = uiRenderer;
    this.currentScenario   = null;
    this.state             = 'loading'; // loading | awaiting | resolving | advancing | system_msg | conclusion | end
    this.conclusionText    = '';
    this._pendingScenario  = null;
  }

  loadScenario(index) {
    if (index >= this.scenarioList.length) {
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

    const traitSummary = choice.traitEffects
      .map(fx => `${fx.trait} ${fx.amount >= 0 ? '+' : ''}${fx.amount}`)
      .join('  |  ');
    const fullOutcome = (success ? choice.successText : choice.failureText)
      + '\n\n[ ' + traitSummary + ' ]';
    this.ui.renderOutcome(fullOutcome, success);
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
    if (this._pendingScenario) {
      const s = this._pendingScenario;
      this._pendingScenario = null;
      this.ui.clearScreen();
      this.presentScenario(s);
    } else {
      this._doLoad();
    }
  }

  advanceFromConclusion() {
    if (this.state !== 'conclusion') return;
    this.ui.showingConclusion = false;
    this.state = 'end';
  }

  _buildConclusionText() {
    const gs = this.gameState;
    const t = gs.playerTraits;
    const maxTrait = max(t.bravery, t.empathy, t.caution);

    if (gs.getFlag('understoodGap'))                            return CONCLUSIONS.understoodGap;
    if (gs.getFlag('distrustedSystem') && gs.trustInSystem < 40) return CONCLUSIONS.distrustedSystem;
    if (gs.getFlag('refusedAudience'))                          return CONCLUSIONS.refusedAudience;
    if (gs.trustInSystem < 30)                                  return CONCLUSIONS.lowTrust;
    if (gs.trustInSystem > 70 && gs.getFlag('acceptedPower'))   return CONCLUSIONS.acceptedPower;
    if (t.bravery === maxTrait)                                 return CONCLUSIONS.bravery;
    if (t.empathy === maxTrait)                                 return CONCLUSIONS.empathy;
    if (t.caution === maxTrait)                                 return CONCLUSIONS.caution;
    return CONCLUSIONS.default;
  }

  _doLoad() {
    const next = this.loadScenario(this.gameState.scenarioIndex);
    if (!next) {
      this.conclusionText = this._buildConclusionText();
      this.ui.clearScreen();
      this.ui.renderConclusion(this.conclusionText);
      this.state = 'conclusion';
      return;
    }
    if (next.id === 'dokjas_record' && this.gameState.constellationFavor > 15) {
      this._pendingScenario = next;
      this.ui.clearScreen();
      this.ui.renderSystemMessage('The constellation already knows your name.');
      this.state = 'system_msg';
      return;
    }
    this.ui.clearScreen();
    this.presentScenario(next);
  }
}
