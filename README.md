# orvScenarioSimulator
`UIRenderer` knows nothing about game logic. `ScenarioEngine` knows nothing about pixels. The separation is intentional and strictly maintained.

---

## Controls

| Input | Action |
|-------|--------|
| **Click** | Advance typewriter text / select a choice |
| **Enter** | Skip typewriter animation / advance screens |
| **Space** | Skip in-scenario typewriter |
| **R** | Restart the simulation |

---

## Running the Project

No build step required. Open `orv_simulator.html` in a browser. All dependencies (p5.js) load via CDN.

```bash
# Optional: serve locally to avoid file:// quirks
npx serve .
# or
python3 -m http.server
```

---

## Design Philosophy

The simulator is intentionally **code-complex, visually minimal**. The interface uses only text, buttons, and simple bars — not to cut corners, but because the deception lives in the numbers, not the aesthetics. A clean, authoritative UI makes the dishonest probability feel more trustworthy.

The point is that you believe it anyway.

---

**Course:** ART 234 · **Author:** Sammie Le · **Stack:** p5.js, vanilla JavaScript  
**Inspired by:** *Omniscient Reader's Viewpoint* by Sing Shong
