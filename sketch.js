// sketch.js — p5.js entry point, ART 234 — ORV Scenario Simulator

// Module instances (global so p5 callbacks can reach them)
let gameState, probSystem, constSystem, uiRenderer, engine;

// Start screen state
let showingStartScreen = true;
let startTypewriterText   = '';
let startTypewriterTarget = "I've read this story before. I know how it ends.\n\nBut you don't.\n\nSo go ahead — make your choices.\nTrust the numbers if you want to.\n\nI'll be watching.";
let startTypewriterIndex  = 0;
let startTypewriterTimer  = 0;
let startTypewriterDone   = false;
let startScreenPage       = 0; // 0 = intro, 1 = how to play
const START_TYPEWRITER_SPEED = 32; // chars per second

// Initialize all systems and start the first scenario
function initGame() {
  showingStartScreen    = true;
  startTypewriterText   = '';
  startTypewriterIndex  = 0;
  startTypewriterTimer  = 0;
  startTypewriterDone   = false;
  startScreenPage       = 0;
  gameState   = new GameState();
  probSystem  = new ProbabilitySystem();
  constSystem = new ConstellationSystem();
  uiRenderer  = new UIRenderer();

  // SCENARIOS defined in scenarios.js; Scenario/Choice classes in Scenario.js
  engine = new ScenarioEngine(gameState, SCENARIOS, probSystem, constSystem, uiRenderer);
}

function _startGame() {
  showingStartScreen = false;
  const first = engine.loadScenario(0);
  if (first) engine.presentScenario(first);
}

// p5.js lifecycle
function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('display', 'block');
  frameRate(60);
  textFont('Georgia, serif');
  initGame();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  uiRenderer.particlesStars = uiRenderer._buildStars(120);
  uiRenderer.constellations = uiRenderer._buildConstellations(6);
}

function draw() {
  const dt = deltaTime;

  if (showingStartScreen) {
    _updateStartTypewriter(dt);
    _drawStartScreen();
    return;
  }

  if (engine.state === 'end') {
    _drawEndScreen(gameState);
    return;
  }

  uiRenderer.updateTypewriter(dt);
  uiRenderer.updateOutcome(dt);
  uiRenderer.updateSystemMsg(dt);
  uiRenderer.updateConclusion(dt);

  if (uiRenderer.isOutcomeExpired()) {
    uiRenderer.showingOutcome = false;
    engine.advanceToNextScenario();
  }

  if (engine.state === 'system_msg' && uiRenderer.isSystemMsgExpired()) {
    uiRenderer.showingSystemMsg = false;
    engine.finishSystemMsg();
  }

  uiRenderer.draw(gameState);
}

// Input
function mouseMoved() {
  if (showingStartScreen) return;
  if (uiRenderer) uiRenderer.handleMouseMoved(mouseX, mouseY);
}

function mouseClicked() {
  if (showingStartScreen) {
    if (startTypewriterDone) {
      if (startScreenPage === 0) startScreenPage = 1;
      else _startGame();
    }
    return;
  }
  if (engine && engine.state === 'conclusion') {
    if (!uiRenderer.conclusionDone) {
      uiRenderer.skipConclusionTypewriter();
    } else {
      engine.advanceFromConclusion();
    }
    return;
  }
  if (engine && engine.state === 'resolving' && uiRenderer.showingOutcome) {
    uiRenderer.outcomeTimer = uiRenderer.outcomeDelay; // force expiry on click
    return;
  }
  if (uiRenderer) uiRenderer.handleMouseClicked(mouseX, mouseY);
}

function keyPressed() {
  if (key === 'r' || key === 'R') initGame();
  if (showingStartScreen) {
    if (key === 'Enter') {
      if (!startTypewriterDone) {
        startTypewriterText  = startTypewriterTarget;
        startTypewriterDone  = true;
        startTypewriterIndex = startTypewriterTarget.length + 1;
      } else if (startScreenPage === 0) {
        startScreenPage = 1;
      } else {
        _startGame();
      }
    }
    return;
  }
  if (engine && engine.state === 'conclusion') {
    if (key === 'Enter' || key === ' ') {
      if (!uiRenderer.conclusionDone) {
        uiRenderer.skipConclusionTypewriter();
      } else {
        engine.advanceFromConclusion();
      }
    }
    return;
  }
  if (key === ' ' && uiRenderer) {
    if (!uiRenderer.typewriterDone) {
      uiRenderer.typewriterText  = uiRenderer.typewriterTarget;
      uiRenderer.typewriterDone  = true;
      uiRenderer.typewriterIndex = uiRenderer.typewriterTarget.length + 1;
      uiRenderer.choiceDelayTimer = 0;
    } else {
      uiRenderer.skipChoiceDelay();
    }
  }
}

// Start screen helpers
function _updateStartTypewriter(dt) {
  if (startTypewriterDone || startScreenPage !== 0) return;
  startTypewriterTimer += dt;
  const interval = 1000 / START_TYPEWRITER_SPEED;
  while (startTypewriterTimer >= interval &&
         startTypewriterIndex <= startTypewriterTarget.length) {
    startTypewriterText = startTypewriterTarget.slice(0, startTypewriterIndex);
    startTypewriterIndex++;
    startTypewriterTimer -= interval;
  }
  if (startTypewriterIndex > startTypewriterTarget.length) startTypewriterDone = true;
}


function _drawStartScreen() {
  const cx = width / 2;

  uiRenderer._drawBackground();
  uiRenderer._drawStars();
  uiRenderer._drawFrame();

  const marginX = max(60, width * 0.08);
  const panelW  = width - marginX * 2;
  const panelH  = min(height - 120, max(330, height * 0.58));
  const panelX  = (width - panelW) / 2;
  const panelY  = (height - panelH) / 2;
  const panelR  = uiRenderer.layout.panelRadius;
  const sideTabW = 16;
  const sideTabH = 30;
  const midY    = panelY + panelH / 2;

  // Panel fill — same layered glass as end screen
  noStroke();
  fill(100, 210, 255, 72);
  rect(panelX, panelY, panelW, panelH, panelR);
  fill(130, 225, 255, 22);
  rect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, max(0, panelR - 2));

  // Soft glare blobs
  fill(255, 255, 255, 10);
  ellipse(panelX + panelW * 0.2, panelY + panelH * 0.2, panelW * 0.28, panelH * 0.45);
  fill(255, 255, 255, 6);
  ellipse(panelX + panelW * 0.24, panelY + panelH * 0.18, panelW * 0.18, panelH * 0.22);

  // Side tabs
  fill(110, 220, 255, 28);
  rect(panelX - sideTabW + 4, midY - sideTabH / 2, sideTabW, sideTabH, 7);
  rect(panelX + panelW - 4, midY - sideTabH / 2, sideTabW, sideTabH, 7);

  // Border rings
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

  // Header label
  textFont('monospace');
  textSize(11);
  fill(220, 230, 255, 200);
  textAlign(CENTER);
  text('[ OMNISCIENT READER\'S VIEWPOINT SIMULATOR ]', cx, panelY + 34);

  // Divider line under header
  stroke(160, 235, 255, 50);
  strokeWeight(0.8);
  line(panelX + 32, panelY + 44, panelX + panelW - 32, panelY + 44);
  noStroke();

  // Title — switches per page
  const titleText = startScreenPage === 0
    ? 'OMNISCIENT READER\'S VIEWPOINT'
    : 'STAR STREAM ORIENTATION';
  textFont('Georgia, serif');
  textSize(min(28, width * 0.038));
  textAlign(CENTER);
  // Outer glow layers
  fill(180, 220, 255, 18);
  text(titleText, cx - 2, panelY + 76);
  text(titleText, cx + 2, panelY + 76);
  text(titleText, cx, panelY + 74);
  text(titleText, cx, panelY + 78);
  fill(200, 230, 255, 38);
  text(titleText, cx - 1, panelY + 76);
  text(titleText, cx + 1, panelY + 76);
  // Main white text
  fill(240, 248, 255, 255);
  text(titleText, cx, panelY + 76);

  // Decorative star accent under title
  const starY = panelY + 90;
  uiRenderer._drawFourPointStar(cx, starY, 4.5, 160);
  uiRenderer._drawFourPointStar(cx - 22, starY, 2.8, 100);
  uiRenderer._drawFourPointStar(cx + 22, starY, 2.8, 100);

  // Body — page 0: typewriter intro / page 1: how to play
  const bodyPadX   = max(40, panelW * 0.1);
  const bodyX      = panelX + bodyPadX;
  const bodyW      = panelW - bodyPadX * 2;
  const bodyStartY = panelY + 112;

  noStroke();
  if (startScreenPage === 0) {
    textFont('Georgia, serif');
    textSize(15);
    fill(COL.text);
    textAlign(CENTER, TOP);
    textLeading(26);
    text(startTypewriterText, bodyX, bodyStartY, bodyW, panelH - 185);

    if (startTypewriterDone && floor(millis() / 600) % 2 === 0) {
      fill(180, 200, 220, 255);
      textFont('monospace');
      textSize(11);
      textAlign(CENTER);
      text('CLICK TO CONTINUE', cx, panelY + panelH - 28);
    }
  } else {
    // How to play — measure the widest line to size the block, then center it
    textFont('monospace');
    textSize(12);
    const labelColW = textWidth('CONSTELLATION FAVOR') + 20; // widest label + gap
    textSize(10);
    const longestDesc = "Rises when your choices align with the story's deeper pattern.";
    const descColW   = textWidth(longestDesc);
    const blockW     = min(labelColW + descColW + 16, bodyW);
    const blockX     = cx - blockW / 2;
    const descX      = blockX + labelColW;
    let hy = bodyStartY;
    const lh = 18;
    const gap = 8;
    textAlign(LEFT);

    textFont('monospace');
    textSize(10);
    fill(160, 210, 255, 180);
    text('YOUR CHOICES SHAPE THREE TRAITS:', blockX, hy);
    hy += lh + gap;

    const traits = [
      ['BRAVERY', 'Bold action and direct risk-taking'],
      ['EMPATHY', 'Prioritizing others over self-interest'],
      ['CAUTION', 'Pausing to observe before acting'],
    ];
    for (const [label, desc] of traits) {
      fill(220, 240, 255, 230);
      textSize(12);
      text(label, blockX, hy);
      fill(170, 195, 220, 180);
      textSize(10);
      text(desc, descX, hy);
      hy += lh;
    }
    hy += gap;

    fill(160, 210, 255, 180);
    textSize(10);
    text('SUCCESS %', blockX, hy);
    hy += lh - 4;
    fill(170, 195, 220, 180);
    text("The % shown is what the System tells you.", blockX, hy);
    hy += lh - 4;
    text("The real odds are hidden. Trust the numbers — or don't.", blockX, hy);
    hy += lh + gap;

    fill(160, 210, 255, 180);
    textSize(10);
    text('CONSTELLATION FAVOR', blockX, hy);
    hy += lh - 4;
    fill(170, 195, 220, 180);
    text("Rises when your choices align with the story's deeper pattern.", blockX, hy);

    if (floor(millis() / 600) % 2 === 0) {
      fill(180, 200, 220, 255);
      textFont('monospace');
      textSize(11);
      textAlign(CENTER);
      text('CLICK TO BEGIN', cx, panelY + panelH - 28);
    }
  }
  textAlign(LEFT);
}

// End screen (uses COL palette from UIRenderer.js)
function _drawEndScreen(gs) {
  const cx = width / 2;
  const cy = height / 2;

  uiRenderer._drawBackground();
  uiRenderer._drawStars();
  uiRenderer._drawFrame();

  const marginX = max(60, width * 0.08);
  const panelW = width - marginX * 2;
  const panelH = min(height - 120, max(330, height * 0.58));
  const panelX = (width - panelW) / 2;
  const panelY = (height - panelH) / 2;
  const panelR = uiRenderer.layout.panelRadius;
  const sideTabW = 16;
  const sideTabH = 30;
  const midY = panelY + panelH / 2;

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

  const headerY = panelY + 34;
  noStroke();
  textFont('monospace');
  textSize(11);
  fill(220, 230, 255, 200);
  textAlign(CENTER);
  text('[ END OF SIMULATION ]', cx, headerY);

  const statLeftX = panelX + 54;
  const statRightX = panelX + panelW - 54;
  const statStartY = panelY + 78;
  const statGap = 34;
  const t = gs.playerTraits;
  const statRows = [
    ['BRAVERY', (t.bravery >= 0 ? '+' : '') + t.bravery],
    ['EMPATHY', (t.empathy >= 0 ? '+' : '') + t.empathy],
    ['CAUTION', (t.caution >= 0 ? '+' : '') + t.caution],
    ['TRUST IN SYSTEM', gs.trustInSystem.toFixed(0) + '%'],
    ['CONSTELLATION FAVOR', String(gs.constellationFavor)],
    ['POWER ACCEPTED', gs.getFlag('acceptedPower') ? 'YES' : 'NO'],
  ];

  const statColors = [COL.danger, COL.success, COL.gold, COL.trust, COL.text, COL.gold];
  textFont('monospace');
  textSize(16);
  for (let i = 0; i < statRows.length; i++) {
    const y = statStartY + i * statGap;
    fill(220, 230, 255, 220);
    textAlign(LEFT);
    text(statRows[i][0], statLeftX, y);
    fill(statColors[i]);
    textAlign(RIGHT);
    text(statRows[i][1], statRightX, y);
  }

  if (floor(millis() / 600) % 2 === 0) {
    noStroke();
    fill(180, 200, 220, 255);
    textFont('monospace');
    textSize(9);
    textAlign(CENTER);
    text('PRESS R TO RESTART', cx, panelY + panelH - 18);
  }
  textAlign(LEFT);
}
