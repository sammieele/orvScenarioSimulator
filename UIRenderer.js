// UIRenderer.js — all rendering and UI display logic (no game logic)

// Shared palette (browser global, used by sketch.js end screen too)
const COL = {
  bg:        '#0a0a0f',
  panel:     '#12121a',
  border:    '#2a2a3a',
  accent:    '#7b6ef6',
  accentDim: '#3d3570',
  gold:      '#c9a84c',
  success:   '#4caf82',
  danger:    '#e05c5c',
  text:      '#e8e6f0',
  textDim:   '#8880a8',
  textMuted: '#4a4860',
  trust:     '#4a9eff',
  overlay:   'rgba(10,10,15,0.92)',
};

class UIRenderer {
  constructor() {
    // — Timing (ms unless noted) —
    this.typewriterSpeed    = 28;   // chars/sec
    this.choiceDelayMs      = 800;
    this.choiceFadeSpeed    = 520;
    this.outcomeDelay       = 4500;
    this.systemMsgDuration  = 4000;
    this.conclusionSpeed    = 30;   // chars/sec

    this.typewriterText   = '';
    this.typewriterTarget = '';
    this.typewriterIndex  = 0;
    this.typewriterTimer  = 0;
    this.typewriterDone   = false;

    this.buttons       = [];      // { label, prob, x, y, w, h, index, hovered }
    this.pendingChoices = null;
    this.onChoiceClick = null;    // callback(choiceIndex)
    this.choiceDelayTimer = 0;
    this.choiceAlpha      = 0;

    this.outcomeText    = '';
    this.outcomeSuccess = false;
    this.showingOutcome = false;
    this.outcomeTimer   = 0;

    this.systemMessage     = '';
    this.showingSystemMsg  = false;
    this.systemMsgTimer    = 0;

    this.conclusionText      = '';
    this.conclusionTypedText = '';
    this.conclusionIndex     = 0;
    this.conclusionTimer     = 0;
    this.conclusionDone      = false;
    this.showingConclusion   = false;

    this.particlesStars = this._buildStars(120);
    this.constellations = this._buildConstellations(6);
    this._currentTitle  = '';

    this.layout = {
      contentPaddingX: 80,
      topPaddingY: 58,
      sectionPadding: 0,
      lineSpacing: 26,
      choiceSpacing: 14,
      titleSize: 22,
      bodyTextSize: 16,
      titleUnderlineGap: 12,
      bodyToChoicesGap: 20,
      choiceHeight: 52,
      bottomPadding: 55,
      panelPaddingX: 28,
      panelPaddingTop: 24,
      panelPaddingBottom: 24,
      panelRadius: 12,
      promptMinHeight: 132,
      promptBoxInsetX: 14,
      promptBoxInsetY: 10,
      promptBoxRadius: 10,
    };
  }

  _buildStars(count) {
    return Array.from({ length: count }, () => ({
      x:        random(width),
      y:        random(height),
      size:     random() < 0.14 ? random(10, 15) : random(3, 6),
      phase:    random(TWO_PI),
      speed:    random(0.18, 0.65),
      alphaMin: random(45, 85),
      alphaMax: random(110, 190),
      halo:     random() < 0.2,
    }));
  }

  _buildConstellations(count) {
    const sets = [];
    const margin = 110;
    const spreadX = max(120, width * 0.2);
    const spreadY = max(90, height * 0.2);

    for (let i = 0; i < count; i++) {
      const corner = i % 4;
      const anchorX = (corner === 0 || corner === 2) ? margin : width - margin;
      const anchorY = (corner === 0 || corner === 1) ? margin : height - margin;
      const dirX = (corner === 0 || corner === 2) ? 1 : -1;
      const dirY = (corner === 0 || corner === 1) ? 1 : -1;
      const nodeCount = floor(random(4, 7));
      const nodes = [];

      for (let n = 0; n < nodeCount; n++) {
        nodes.push({
          x: anchorX + dirX * random(12, spreadX),
          y: anchorY + dirY * random(10, spreadY),
          r: random(1.5, 2.8),
        });
      }

      const links = [];
      for (let n = 1; n < nodeCount; n++) links.push([n - 1, n]);
      if (nodeCount >= 4) links.push([0, 2]);

      sets.push({ nodes, links });
    }

    return sets;
  }

  updateTypewriter(dt) {
    if (!this.typewriterDone) {
      this.typewriterTimer += dt;
      const interval = 1000 / this.typewriterSpeed;
      while (this.typewriterTimer >= interval &&
             this.typewriterIndex <= this.typewriterTarget.length) {
        this.typewriterText = this.typewriterTarget.slice(0, this.typewriterIndex);
        this.typewriterIndex++;
        this.typewriterTimer -= interval;
      }
      if (this.typewriterIndex > this.typewriterTarget.length) {
        this.typewriterDone = true;
        this.choiceDelayTimer = 0;
      }
    }

    if (this.typewriterDone && this.buttons.length === 0 && this.pendingChoices && this.pendingChoices.length > 0) {
      this.choiceDelayTimer += dt;
      if (this.choiceDelayTimer >= this.choiceDelayMs) this._buildChoiceButtons();
    }

    if (this.buttons.length > 0 && this.choiceAlpha < 255) {
      this.choiceAlpha = min(255, this.choiceAlpha + this.choiceFadeSpeed * (dt / 1000));
    }
  }

  updateOutcome(dt) {
    if (this.showingOutcome) this.outcomeTimer += dt;
  }

  updateSystemMsg(dt) {
    if (this.showingSystemMsg) this.systemMsgTimer += dt;
  }

  updateConclusion(dt) {
    if (!this.showingConclusion || this.conclusionDone) return;
    this.conclusionTimer += dt;
    const interval = 1000 / this.conclusionSpeed;
    while (this.conclusionTimer >= interval &&
           this.conclusionIndex <= this.conclusionText.length) {
      this.conclusionTypedText = this.conclusionText.slice(0, this.conclusionIndex);
      this.conclusionIndex++;
      this.conclusionTimer -= interval;
    }
    if (this.conclusionIndex > this.conclusionText.length) this.conclusionDone = true;
  }

  isOutcomeExpired()   { return this.showingOutcome   && this.outcomeTimer   >= this.outcomeDelay; }
  isSystemMsgExpired() { return this.showingSystemMsg && this.systemMsgTimer >= this.systemMsgDuration; }

  draw(gameState) {
    this._drawBackground();
    this._drawStars();
    this._drawFrame();
    this._drawHUD(gameState);
    if (this.showingOutcome)        this._drawOutcome();
    else if (this.showingSystemMsg) this._drawSystemMessage();
    else if (this.showingConclusion) this._drawConclusion();
    else                            this._drawNarrativeAndChoices();
    this._drawScanlines();
  }

  _drawBackground() {
    background(COL.bg);
    for (let i = 0; i < 8; i++) {
      const alpha = map(i, 0, 8, 0, 80);
      noFill();
      stroke(0, 0, 0, alpha);
      strokeWeight(40);
      rect(i * 20, i * 20, width - i * 40, height - i * 40);
    }
    noStroke();
  }

  _drawStars() {
    const t = millis() / 1000;

    for (const s of this.particlesStars) {
      const alpha = map(sin(s.phase + t * s.speed), -1, 1, s.alphaMin, s.alphaMax);
      if (s.halo) {
        noStroke();
        fill(255, 255, 255, 12);
        ellipse(s.x, s.y, s.size * 2.1, s.size * 2.1);
      }
      this._drawFourPointStar(s.x, s.y, s.size, alpha);
    }

    for (const constellation of this.constellations) {
      stroke(255, 255, 255, 38);
      strokeWeight(0.75);
      for (const [a, b] of constellation.links) {
        const p1 = constellation.nodes[a];
        const p2 = constellation.nodes[b];
        line(p1.x, p1.y, p2.x, p2.y);
      }

      noStroke();
      fill(255, 255, 255, 82);
      for (const node of constellation.nodes) {
        ellipse(node.x, node.y, node.r, node.r);
      }
    }
  }

  _drawFourPointStar(x, y, size, alpha) {
    push();
    stroke(255, 255, 255, alpha);
    strokeWeight(size > 8 ? 1.2 : 0.9);
    line(x - size, y, x + size, y);
    line(x, y - size, x, y + size);
    stroke(255, 255, 255, alpha * 0.75);
    strokeWeight(0.8);
    line(x - size * 0.62, y - size * 0.62, x + size * 0.62, y + size * 0.62);
    line(x - size * 0.62, y + size * 0.62, x + size * 0.62, y - size * 0.62);
    pop();
  }

  _drawFrame() {
    noFill();
    stroke(185, 185, 198, 120);
    strokeWeight(1);
    rect(30, 30, width - 60, height - 60, 4);
    stroke(240, 240, 248, 80);
    strokeWeight(0.8);
    rect(36, 36, width - 72, height - 72, 3);

    const cs = 18;
    const [x1, y1, x2, y2] = [30, 30, width - 30, height - 30];
    this._drawCornerOrnament(x1 + cs, y1 + cs, 1, 1, 0.85);
    this._drawCornerOrnament(x2 - cs, y1 + cs, -1, 1, 0.85);
    this._drawCornerOrnament(x1 + cs, y2 - cs, 1, -1, 0.85);
    this._drawCornerOrnament(x2 - cs, y2 - cs, -1, -1, 0.85);
  }

  _drawScanlines() {
    noStroke();
    for (let y = 0; y < height; y += 3) {
      fill(0, 0, 0, 8);
      rect(0, y, width, 1);
    }
  }

  // HUD: title, trust bar, constellation dot, trait readouts, scenario counter
  _drawHUD(gs) {
    const padL = 60, padR = width - 60;
    const y = 54;

    textFont('monospace');
    textSize(9);
    fill(COL.textMuted);
    noStroke();
    textAlign(LEFT);
    text('[ ORV SCENARIO SIMULATOR ]', padL, y);

    // Constellation favor dot
    const favX = padR - 24, favY = y - 4;
    const favColor = gs.constellationFavor > 20  ? COL.gold :
                     gs.constellationFavor < -20 ? COL.danger : COL.textMuted;
    fill(favColor);
    ellipse(favX, favY, 8, 8);
    stroke(favColor);
    strokeWeight(0.5);
    noFill();
    ellipse(favX, favY, 14, 14);
    noStroke();

    // Trait readouts
    const traits = [
      { k: 'bravery', label: 'BRV', col: COL.danger  },
      { k: 'empathy', label: 'EMP', col: COL.success },
      { k: 'caution', label: 'CAU', col: COL.gold    },
    ];
    let tx = padL;
    for (const tr of traits) {
      fill(tr.col);
      textSize(10);
      textFont('monospace');
      text(tr.label, tx, height - 50);
      fill(COL.textDim);
      textSize(11);
      text(gs.playerTraits[tr.k] >= 0 ? '+' + gs.playerTraits[tr.k] : gs.playerTraits[tr.k], tx + 26, height - 50);
      tx += 72;
    }

    // Scenario counter
    fill(COL.textMuted);
    textAlign(RIGHT);
    textSize(9);
    text('SCENARIO ' + (gs.scenarioIndex + 1) + ' / ' + SCENARIOS.length, width - 60, height - 50);
    textAlign(LEFT);
    noStroke();
  }

  renderNarrativeText(title, bodyText) {
    this._currentTitle    = title;
    this.typewriterTarget = bodyText;
    this.typewriterText   = '';
    this.typewriterIndex  = 0;
    this.typewriterTimer  = 0;
    this.typewriterDone   = false;
    this.choiceDelayTimer = 0;
    this.choiceAlpha      = 0;
  }

  renderChoiceButtons(choiceList, onClickCb) {
    this.buttons        = [];
    this.onChoiceClick  = onClickCb;
    this.choiceAlpha    = 0;
    this.choiceDelayTimer = 0;
    this.pendingChoices = Array.isArray(choiceList)
      ? choiceList.map((choice) => ({
          label: choice.label,
          displayProbability: choice.displayProbability,
        }))
      : [];
  }

  _buildChoiceButtons() {
    if (!this.pendingChoices || this.pendingChoices.length === 0) return;

    this.buttons = [];
    const layout = this._getNarrativeLayout(this.pendingChoices.length);

    for (let i = 0; i < this.pendingChoices.length; i++) {
      this.buttons.push({
        label:   this.pendingChoices[i].label,
        prob:    this.pendingChoices[i].displayProbability,
        x:       layout.buttonsX,
        y:       layout.buttonsY + i * (layout.buttonH + layout.choiceGap),
        w:       layout.buttonW,
        h:       layout.buttonH,
        index:   i,
        hovered: false,
      });
    }

    this.pendingChoices = null;
  }

  skipChoiceDelay() {
    if (!this.typewriterDone) return false;
    if (this.buttons.length > 0) return false;
    if (!this.pendingChoices || this.pendingChoices.length === 0) return false;

    this.choiceDelayTimer = this.choiceDelayMs;
    this._buildChoiceButtons();
    this.choiceAlpha = 255;
    return true;
  }

  _drawNarrativeAndChoices() {
    const layout = this._getNarrativeLayout(this.buttons.length);
    this._syncChoiceButtonLayout(layout);
    this._drawScenarioSystemPanel(layout);

    if (this._currentTitle) {
      textFont('Georgia, serif');
      textSize(this.layout.titleSize);
      fill(COL.text);
      noStroke();
      textAlign(LEFT);
      text(this._currentTitle, layout.titleX, layout.titleY);
      noStroke();
    }

    fill(COL.text);
    noStroke();
    textAlign(LEFT);
    textFont('Georgia, serif');
    textSize(this.layout.bodyTextSize);
    textLeading(this.layout.lineSpacing);
    text(layout.displayBodyText, layout.promptTextX, layout.promptTextY, layout.promptTextW, layout.promptTextH);

    if (!this.typewriterDone && floor(millis() / 600) % 2 === 0) {
      push();
      noStroke();
      fill(180, 200, 220, 160);
      textFont('monospace');
      textSize(10);
      textAlign(RIGHT, BASELINE);
      text('[ SPACE — SKIP ]', layout.panelX + layout.panelW - 22, layout.panelY + layout.panelH - 14);
      pop();
    }

    for (const btn of this.buttons) {
      this._drawButton(btn, this.choiceAlpha);
    }
  }

  _getNarrativeLayout(choiceCount = 0) {
    const cfg = this.layout;
    const panelX = cfg.contentPaddingX;
    const panelY = cfg.topPaddingY;
    const panelW = width - cfg.contentPaddingX * 2;
    const panelInnerX = panelX + cfg.panelPaddingX;
    const panelInnerW = panelW - cfg.panelPaddingX * 2;
    const titleX = panelInnerX;
    const titleY = panelY + cfg.panelPaddingTop;

    const buttonW = min(panelInnerW, constrain(width - 160, 300, 680));
    const buttonH = cfg.choiceHeight;
    const choiceGap = cfg.choiceSpacing;
    const totalChoiceH = choiceCount > 0
      ? choiceCount * buttonH + (choiceCount - 1) * choiceGap
      : 0;

    push();
    textFont('Georgia, serif');
    textSize(cfg.titleSize);
    const titleWidth = this._currentTitle ? textWidth(this._currentTitle) : 0;
    pop();

    const measuredUnderlineW = titleWidth > 0 ? titleWidth : panelInnerW * 0.35;
    const underlineX1 = titleX;
    const underlineX2 = titleX + measuredUnderlineW;
    const underlineY = titleY + cfg.titleUnderlineGap;
    const promptTextX = panelInnerX;
    const promptTextY = titleY + cfg.titleSize + cfg.sectionPadding + 10;
    const promptTextW = panelInnerW;

    const maxPanelH = height - cfg.bottomPadding - panelY;
    const staticPanelH = cfg.panelPaddingTop + cfg.panelPaddingBottom + cfg.titleSize + 10
      + cfg.titleUnderlineGap + cfg.sectionPadding
      + (choiceCount > 0 ? cfg.bodyToChoicesGap : 0) + totalChoiceH;
    const maxPromptH = max(cfg.lineSpacing * 4, maxPanelH - staticPanelH);

    push();
    textFont('Georgia, serif');
    textSize(cfg.bodyTextSize);
    textLeading(cfg.lineSpacing);
    const reservedPrompt = this._wrapTextToWidth(
      this.typewriterTarget || this.typewriterText,
      promptTextW,
      maxPromptH,
      cfg.lineSpacing
    );
    const displayPrompt = this._wrapTextToWidth(
      this.typewriterText,
      promptTextW,
      reservedPrompt.height,
      cfg.lineSpacing
    );
    pop();

    const promptTextH = constrain(
      max(cfg.promptMinHeight, reservedPrompt.height),
      cfg.lineSpacing,
      maxPromptH
    );
    const buttonsY = promptTextY + promptTextH + (choiceCount > 0 ? cfg.bodyToChoicesGap : 0);
    const panelH = min(buttonsY + totalChoiceH + cfg.panelPaddingBottom - panelY, maxPanelH);

    return {
      panelX,
      panelY,
      panelW,
      panelH,
      titleX,
      titleY,
      underlineX1,
      underlineX2,
      underlineY,
      promptTextX,
      promptTextY,
      promptTextW,
      promptTextH,
      displayBodyText: displayPrompt.text,
      buttonsX: panelInnerX + (panelInnerW - buttonW) / 2,
      buttonsY,
      buttonW,
      buttonH,
      choiceGap,
    };
  }

  _drawScenarioSystemPanel(layout) {
    const x = layout.panelX;
    const y = layout.panelY;
    const w = layout.panelW;
    const h = layout.panelH;
    const r = this.layout.panelRadius;
    const midY = y + h / 2;
    const tabW = 16;
    const tabH = 30;
    const iconY = y + 18;
    const iconGap = 18;
    const iconX = x + w - 24;

    push();
    noStroke();
    fill(100, 210, 255, 72);
    rect(x, y, w, h, r);
    fill(130, 225, 255, 22);
    rect(x + 3, y + 3, w - 6, h - 6, max(0, r - 2));

    fill(255, 255, 255, 10);
    ellipse(x + w * 0.2, y + h * 0.2, w * 0.28, h * 0.45);
    fill(255, 255, 255, 6);
    ellipse(x + w * 0.24, y + h * 0.18, w * 0.18, h * 0.22);

    fill(110, 220, 255, 28);
    rect(x - tabW + 4, midY - tabH / 2, tabW, tabH, 7);
    rect(x + w - 4, midY - tabH / 2, tabW, tabH, 7);

    noFill();
    stroke(160, 235, 255, 36);
    strokeWeight(4);
    rect(x - 1, y - 1, w + 2, h + 2, r + 1);
    stroke(235, 250, 255, 110);
    strokeWeight(1.4);
    rect(x, y, w, h, r);
    stroke(170, 235, 255, 42);
    strokeWeight(0.9);
    rect(x + 5, y + 5, w - 10, h - 10, max(0, r - 3));

    stroke(255, 255, 255, 50);
    strokeWeight(1);
    line(x + 16, y + 14, x + 58, y + 14);
    line(x + 16, y + 14, x + 30, y + 30);
    line(x + w - 16, y + h - 14, x + w - 58, y + h - 14);
    line(x + w - 16, y + h - 14, x + w - 30, y + h - 30);

    noStroke();
    fill(255, 255, 255, 110);
    textFont('monospace');
    textSize(9);
    textAlign(CENTER, CENTER);
    text('-', iconX - iconGap * 2, iconY);
    text('□', iconX - iconGap, iconY);
    text('×', iconX, iconY);

    stroke(210, 235, 255, 24);
    strokeWeight(1);
    line(layout.promptTextX - 2, layout.promptTextY - 12, layout.promptTextX + layout.promptTextW + 2, layout.promptTextY - 12);
    pop();
  }

  _drawInnerPromptBox(layout) {
    const insetX = this.layout.promptBoxInsetX;
    const insetY = this.layout.promptBoxInsetY;
    const x = layout.promptTextX - insetX;
    const y = layout.promptTextY - insetY;
    const w = layout.promptTextW + insetX * 2;
    const h = layout.promptTextH + insetY * 2;
    const r = this.layout.promptBoxRadius;
    const midY = y + h / 2;
    const tabW = 12;
    const tabH = 22;
    const iconY = y + 13;
    const iconGap = 13;
    const iconX = x + w - 18;

    push();
    noStroke();
    fill(100, 210, 255, 72);
    rect(x, y, w, h, r);
    fill(130, 225, 255, 22);
    rect(x + 2, y + 2, w - 4, h - 4, max(0, r - 1));

    fill(255, 255, 255, 10);
    ellipse(x + w * 0.22, y + h * 0.2, w * 0.22, h * 0.28);
    fill(255, 255, 255, 6);
    ellipse(x + w * 0.26, y + h * 0.18, w * 0.12, h * 0.18);

    fill(110, 220, 255, 28);
    rect(x - tabW + 3, midY - tabH / 2, tabW, tabH, 6);
    rect(x + w - 3, midY - tabH / 2, tabW, tabH, 6);

    noFill();
    stroke(160, 235, 255, 36);
    strokeWeight(3);
    rect(x - 1, y - 1, w + 2, h + 2, r + 1);
    stroke(235, 250, 255, 110);
    strokeWeight(1.2);
    rect(x, y, w, h, r);
    stroke(170, 235, 255, 42);
    strokeWeight(0.8);
    rect(x + 4, y + 4, w - 8, h - 8, max(0, r - 3));

    stroke(255, 255, 255, 50);
    strokeWeight(0.8);
    line(x + 12, y + 11, x + 44, y + 11);
    line(x + 12, y + 11, x + 24, y + 23);
    line(x + w - 12, y + h - 11, x + w - 44, y + h - 11);
    line(x + w - 12, y + h - 11, x + w - 24, y + h - 23);

    noStroke();
    fill(255, 255, 255, 110);
    textFont('monospace');
    textSize(7);
    textAlign(CENTER, CENTER);
    text('-', iconX - iconGap * 2, iconY);
    text('□', iconX - iconGap, iconY);
    text('×', iconX, iconY);
    pop();
  }

  _drawDottedRect(x, y, w, h, step) {
    push();
    noStroke();
    fill(220, 220, 232, 86);
    for (let px = x; px <= x + w; px += step) {
      rect(px, y, 1.5, 1.5);
      rect(px, y + h, 1.5, 1.5);
    }
    for (let py = y; py <= y + h; py += step) {
      rect(x, py, 1.5, 1.5);
      rect(x + w, py, 1.5, 1.5);
    }
    pop();
  }

  _drawCornerOrnament(cx, cy, sx = 1, sy = 1, scaleFactor = 1) {
    push();
    translate(cx, cy);
    scale(sx * scaleFactor, sy * scaleFactor);

    noFill();
    stroke(238, 238, 246, 122);
    strokeWeight(0.9);
    beginShape();
    vertex(0, -6);
    vertex(6, 0);
    vertex(0, 6);
    vertex(-6, 0);
    endShape(CLOSE);

    stroke(220, 220, 230, 96);
    line(-11, 0, -2, 0);
    line(2, 0, 11, 0);
    line(0, -11, 0, -2);
    line(0, 2, 0, 11);

    noStroke();
    fill(245, 245, 250, 95);
    ellipse(-9, -9, 1.8, 1.8);
    ellipse(-5, -13, 1.8, 1.8);
    ellipse(-13, -5, 1.8, 1.8);
    pop();
  }

  _drawEdgeMotifs(x, y, w, h) {
    const marks = [0.25, 0.5, 0.75];
    push();
    for (const t of marks) {
      const ex = x + w * t;
      const ey = y + h * t;

      this._drawFourPointStar(ex, y + 8, 4.2, 95);
      this._drawFourPointStar(ex, y + h - 8, 4.2, 95);
      this._drawFourPointStar(x + 8, ey, 3.7, 82);
      this._drawFourPointStar(x + w - 8, ey, 3.7, 82);

      stroke(220, 220, 230, 88);
      strokeWeight(0.8);
      line(ex - 5, y + 16, ex + 5, y + 16);
      line(ex, y + 11, ex, y + 21);
      line(ex - 5, y + h - 16, ex + 5, y + h - 16);
      line(ex, y + h - 21, ex, y + h - 11);
    }
    pop();
  }

  _wrapTextToWidth(text, maxWidth, maxHeight, lineHeight) {
    const source = String(text ?? '').replace(/\r\n?/g, '\n');
    const paragraphs = source.split('\n');
    const lines = [];

    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/).filter(Boolean);

      if (words.length === 0) {
        lines.push('');
        continue;
      }

      let currentLine = words[0];
      for (let i = 1; i < words.length; i++) {
        const nextLine = currentLine + ' ' + words[i];
        if (textWidth(nextLine) <= maxWidth) currentLine = nextLine;
        else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }
      lines.push(currentLine);
    }

    const maxLines = max(1, floor((maxHeight + 1) / lineHeight));
    if (lines.length > maxLines) {
      const trimmed = lines.slice(0, maxLines);
      trimmed[maxLines - 1] = this._truncateLineToWidth(trimmed[maxLines - 1], maxWidth);
      return { text: trimmed.join('\n'), height: maxLines * lineHeight };
    }

    return { text: lines.join('\n'), height: max(lines.length, 1) * lineHeight };
  }

  _truncateLineToWidth(line, maxWidth) {
    const ellipsis = '...';
    let trimmed = line;
    while (trimmed.length > 0 && textWidth(trimmed + ellipsis) > maxWidth) {
      trimmed = trimmed.slice(0, -1);
    }
    return trimmed + ellipsis;
  }

  _syncChoiceButtonLayout(layout) {
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].x = layout.buttonsX;
      this.buttons[i].y = layout.buttonsY + i * (layout.buttonH + layout.choiceGap);
      this.buttons[i].w = layout.buttonW;
      this.buttons[i].h = layout.buttonH;
    }
  }

  _drawButton(btn, alpha = 255) {
    push();
    drawingContext.globalAlpha = constrain(alpha / 255, 0, 1);

    const hover  = btn.hovered;
    const labelColor = color(220, 230, 255);
    const buttonBg = color(18, 18, 28);
    const buttonBorder = color(100, 220, 255);
    const hoverOverlay = color(100, 220, 255, 38);
    const textY = btn.y + btn.h * 0.5;
    const trackX = btn.x + 12;
    const trackW = btn.w - 24;
    const trackY = btn.y + btn.h - 18;

    noStroke();
    fill(0, 0, 0, 60);
    rect(btn.x + 3, btn.y + 3, btn.w, btn.h, 4);

    fill(buttonBg);
    stroke(buttonBorder);
    strokeWeight(1.1);
    rect(btn.x, btn.y, btn.w, btn.h, 4);
    if (hover) {
      noStroke();
      fill(hoverOverlay);
      rect(btn.x + 1, btn.y + 1, btn.w - 2, btn.h - 2, 3);
    }
    noStroke();

    fill(COL.bg);
    rect(trackX, trackY, trackW, 7, 2);

    const probColor = btn.prob >= 60 ? COL.success :
                      btn.prob >= 40 ? COL.gold    : COL.danger;
    fill(probColor);
    rect(trackX, trackY, trackW * (btn.prob / 100), 7, 2);

    textFont('Georgia, serif');
    textSize(15);
    fill(labelColor);
    textAlign(LEFT, CENTER);
    noStroke();
    text(btn.label, btn.x + 16, textY);

    textFont('monospace');
    textSize(10);
    fill(labelColor);
    textAlign(RIGHT, CENTER);
    text(btn.prob + '%', btn.x + btn.w - 14, textY);
    textAlign(LEFT);

    pop();
  }

  renderOutcome(outcomeText, wasSuccess) {
    this.outcomeText    = this._normalizeOverlayText(outcomeText);
    this.outcomeDelay   = max(3500, this.outcomeText.length * 55);
    this.outcomeSuccess = wasSuccess;
    this.showingOutcome = true;
    this.outcomeTimer   = 0;
    this.buttons        = [];
  }

  _normalizeOverlayText(text) {
    return String(text ?? '')
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map(line => line.trim().replace(/[ \t]{2,}/g, ' '))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  _drawOutcome() {
    const cx = width / 2, cy = height / 2;
    const panelX = 80;
    const panelY = cy - 120;
    const panelW = width - 160;
    const panelH = 240;
    const bodyPadX = this.layout.panelPaddingX;
    const bodyX = panelX + bodyPadX;
    const bodyY = panelY + 72;
    const bodyW = panelW - bodyPadX * 2;
    const bodyH = panelH - 108;
    const panelR = this.layout.panelRadius;

    noStroke();
    fill(100, 210, 255, 72);
    rect(panelX, panelY, panelW, panelH, panelR);
    fill(130, 225, 255, 22);
    rect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, max(0, panelR - 2));

    fill(255, 255, 255, 10);
    ellipse(panelX + panelW * 0.2, panelY + panelH * 0.2, panelW * 0.28, panelH * 0.45);
    fill(255, 255, 255, 6);
    ellipse(panelX + panelW * 0.24, panelY + panelH * 0.18, panelW * 0.18, panelH * 0.22);

    noFill();
    stroke(160, 235, 255, 36);
    strokeWeight(4);
    rect(panelX - 1, panelY - 1, panelW + 2, panelH + 2, panelR + 1);
    stroke(235, 250, 255, 110);
    strokeWeight(1.4);
    rect(panelX, panelY, panelW, panelH, panelR);
    stroke(170, 235, 255, 42);
    strokeWeight(0.9);
    rect(panelX + 5, panelY + 5, panelW - 10, panelH - 10, max(0, panelR - 3));
    noStroke();

    textFont('monospace');
    textSize(11);
    fill(this.outcomeSuccess ? COL.success : COL.danger);
    textAlign(CENTER);
    text(this.outcomeSuccess ? '[ SUCCESS ]' : '[ FAILURE ]', cx, cy - 80);

    textFont('Georgia, serif');
    textSize(16);
    fill(COL.text);
    textAlign(LEFT, TOP);
    textLeading(28);
    text(this.outcomeText, bodyX, bodyY, bodyW, bodyH);

    const dotCount = (floor(this.outcomeTimer / 500) % 3) + 1;
    const continuingText = 'CONTINUING' + '.'.repeat(dotCount);
    noStroke();
    fill(180, 200, 220, 255);
    textFont('monospace');
    textSize(9);
    textAlign(CENTER);
    text(continuingText, cx, panelY + panelH - 18);

    textAlign(LEFT);
  }

  // Constellation event message overlay
  renderSystemMessage(messageText) {
    this.systemMessage    = messageText;
    this.showingSystemMsg = true;
    this.systemMsgTimer   = 0;
  }

  renderConclusion(text) {
    this.showingConclusion = true;
    this.conclusionText = String(text || '').trim();
    this.conclusionTypedText = '';
    this.conclusionIndex = 0;
    this.conclusionTimer = 0;
    this.conclusionDone = false;
  }

  skipConclusionTypewriter() {
    if (!this.showingConclusion || this.conclusionDone) return false;
    this.conclusionTypedText = this.conclusionText;
    this.conclusionIndex = this.conclusionText.length + 1;
    this.conclusionDone = true;
    return true;
  }

  _drawSystemMessage() {
    const cx = width / 2, cy = height / 2;
    const alpha = this.systemMsgTimer < 400
      ? map(this.systemMsgTimer, 0, 400, 0, 255)
      : this.systemMsgTimer > this.systemMsgDuration - 400
        ? map(this.systemMsgTimer, this.systemMsgDuration - 400, this.systemMsgDuration, 255, 0)
        : 255;

    fill(0, 0, 0, alpha * 0.85);
    rect(0, 0, width, height);

    fill(red(color(COL.gold)), green(color(COL.gold)), blue(color(COL.gold)), alpha);
    textFont('monospace');
    textSize(11);
    textAlign(CENTER);
    text('[ CONSTELLATION EVENT ]', cx, cy - 30);

    textFont('monospace');
    textSize(18);
    fill(red(color(COL.text)), green(color(COL.text)), blue(color(COL.text)), alpha);
    text(this.systemMessage, cx, cy + 10, width - 200, 120);
    textAlign(LEFT);
  }

  _drawConclusion() {
    const cx = width / 2;
    const marginX = max(60, width * 0.08);
    const panelW  = width - marginX * 2;
    const panelH  = min(height - 120, max(330, height * 0.58));
    const panelX  = (width - panelW) / 2;
    const panelY  = (height - panelH) / 2;
    const panelR  = this.layout.panelRadius;
    const sideTabW = 16;
    const sideTabH = 30;
    const midY    = panelY + panelH / 2;

    noStroke();
    fill(100, 210, 255, 72);
    rect(panelX, panelY, panelW, panelH, panelR);
    fill(130, 225, 255, 22);
    rect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, max(0, panelR - 2));

    fill(255, 255, 255, 10);
    ellipse(panelX + panelW * 0.2, panelY + panelH * 0.2, panelW * 0.28, panelH * 0.45);
    fill(255, 255, 255, 6);
    ellipse(panelX + panelW * 0.24, panelY + panelH * 0.18, panelW * 0.18, panelH * 0.22);

    fill(110, 220, 255, 28);
    rect(panelX - sideTabW + 4, midY - sideTabH / 2, sideTabW, sideTabH, 7);
    rect(panelX + panelW - 4, midY - sideTabH / 2, sideTabW, sideTabH, 7);

    noFill();
    stroke(160, 235, 255, 36);
    strokeWeight(4);
    rect(panelX - 1, panelY - 1, panelW + 2, panelH + 2, panelR + 1);
    stroke(235, 250, 255, 110);
    strokeWeight(1.4);
    rect(panelX, panelY, panelW, panelH, panelR);
    stroke(170, 235, 255, 42);
    strokeWeight(0.9);
    rect(panelX + 5, panelY + 5, panelW - 10, panelH - 10, max(0, panelR - 3));
    noStroke();

    textFont('monospace');
    textSize(11);
    fill(220, 230, 255, 200);
    textAlign(CENTER);
    text('[ FINAL RECORD ]', cx, panelY + 34);

    stroke(160, 235, 255, 50);
    strokeWeight(0.8);
    line(panelX + 32, panelY + 44, panelX + panelW - 32, panelY + 44);
    noStroke();

    const titleText = 'EPILOGUE';
    textFont('Georgia, serif');
    textSize(min(28, width * 0.038));
    textAlign(CENTER);
    fill(180, 220, 255, 18);
    text(titleText, cx - 2, panelY + 76);
    text(titleText, cx + 2, panelY + 76);
    text(titleText, cx, panelY + 74);
    text(titleText, cx, panelY + 78);
    fill(200, 230, 255, 38);
    text(titleText, cx - 1, panelY + 76);
    text(titleText, cx + 1, panelY + 76);
    fill(240, 248, 255, 255);
    text(titleText, cx, panelY + 76);

    const starY = panelY + 90;
    this._drawFourPointStar(cx, starY, 4.5, 160);
    this._drawFourPointStar(cx - 22, starY, 2.8, 100);
    this._drawFourPointStar(cx + 22, starY, 2.8, 100);

    const bodyPadX   = max(40, panelW * 0.1);
    const bodyX      = panelX + bodyPadX;
    const bodyW      = panelW - bodyPadX * 2;
    const bodyStartY = panelY + 112;

    noStroke();
    textFont('Georgia, serif');
    textSize(15);
    fill(COL.text);
    textAlign(CENTER, TOP);
    textLeading(26);
    text(this.conclusionTypedText, bodyX, bodyStartY, bodyW, panelH - 185);

    if (this.conclusionDone && floor(millis() / 600) % 2 === 0) {
      fill(180, 200, 220, 255);
      textFont('monospace');
      textSize(11);
      textAlign(CENTER);
      text('CLICK OR PRESS ENTER FOR STATS', cx, panelY + panelH - 28);
    }

    textAlign(LEFT);
  }

  clearScreen() {
    this.buttons          = [];
    this.pendingChoices   = null;
    this._currentTitle    = '';
    this.typewriterText   = '';
    this.typewriterTarget = '';
    this.typewriterDone   = false;
    this.choiceDelayTimer = 0;
    this.choiceAlpha      = 0;
    this.showingOutcome   = false;
    this.showingSystemMsg = false;
    this.showingConclusion = false;
    this.outcomeTimer     = 0;
    this.systemMsgTimer   = 0;
    this.conclusionText      = '';
    this.conclusionTypedText = '';
    this.conclusionIndex     = 0;
    this.conclusionTimer     = 0;
    this.conclusionDone      = false;
  }

  handleMouseMoved(mx, my) {
    for (const btn of this.buttons) {
      btn.hovered = (mx >= btn.x && mx <= btn.x + btn.w &&
                     my >= btn.y && my <= btn.y + btn.h);
    }
  }

  handleMouseClicked(mx, my) {
    if (!this.onChoiceClick) return;
    for (const btn of this.buttons) {
      if (mx >= btn.x && mx <= btn.x + btn.w &&
          my >= btn.y && my <= btn.y + btn.h) {
        this.onChoiceClick(btn.index);
        return;
      }
    }
  }
}
