// scenarios.js — all 8 ORV scenarios as one continuous story
// Audience: mixed (some ORV fans, some new). No assumed series knowledge.
// Story arc: A survivor discovers the System's odds are fabricated, and must
//            decide whether to trust, fight, or read between the lines.

const CONCLUSIONS = {
  understoodGap:    'You named the gap. Not the probability — the space between what was shown and what was real. Kim Dokja would have called that reading. The constellations are still watching. They always watch the ones who notice.',
  distrustedSystem: 'You never believed the numbers. Not fully. The system logged every moment you looked at a percentage and subtracted something from it. That habit kept you alive. In ORV, the reader always outlasts the story.',
  refusedAudience:  "You told the audience to look away. They didn't. But you said it anyway — which means you knew they were there. Knowing the audience exists and refusing to perform for it is the closest thing to authorship this world allows.",
  lowTrust:         "You read the system like a text you'd already memorized. Every lie, every gap between displayed and actual — you caught it. Kim Dokja would have approved. The constellations watched a reader, not a player.",
  acceptedPower:    "You trusted the numbers. You took the power when it was offered. The constellations smiled — the kind of smile that means you're being written, not writing. A useful protagonist. For now.",
  bravery:          'You moved first, calculated second. Reckless by some definitions. By others — the only kind of person who survives a story like this.',
  empathy:          'You kept pulling others through. The system never accounted for that. It rarely does. The strongest regression is the one no constellation predicted.',
  caution:          "You watched before you moved. In a story this dense with variables, that's not cowardice — it's authorship.",
  default:          "You made it through. The scenarios are closed. Whether that means you won depends on who's doing the reading.",
};

const SCENARIOS = [

  // ── 0: First Notification ─────────────────────────────────────────────────
  new Scenario(
    'first_notification',
    'First Notification',
    'Three days since the world ended. You\'re sheltering in a subway station when a message appears — not on a screen, in your vision. [SYSTEM: PROBABILITY DATA NOW AVAILABLE. ALL SURVIVAL ODDS CALCULATED FOR YOUR BENEFIT.] No one sent this. No one asked for it.',
    [
      new Choice(
        'Read the full notification',
        90, 90,
        [{ trait: 'caution', amount: 1 }],
        'Bridge collapse reported two blocks north. Survival if you stay: 34%. The system is specific. You file the number and start planning.',
        'The notification is corrupted. One line survives: "displayed values are approximations." You close it and keep moving.',
        { name: 'readNotification', value: true }
      ),
      new Choice(
        'Dismiss it immediately',
        40, 70,
        [{ trait: 'bravery', amount: 1 }],
        'Instinct moves faster than data. The station shudders a second later — something collapsed above. The odds said 40%. You made it anyway.',
        'You look away. The station shakes. You\'re not fast enough. The first scenario costs you before it\'s begun.',
        null
      ),
      new Choice(
        'Try to find who sent it',
        55, 55,
        [{ trait: 'empathy', amount: 1 }, { trait: 'caution', amount: 1 }],
        'No one else is reading anything. The message is yours alone. Whatever this system is — it knows you\'re here.',
        'No sender. No origin. The notification expires while you\'re searching. You\'ll make the next choice without data.',
        null
      ),
    ]
  ),

  // ── 1: Bridge Collapse ────────────────────────────────────────────────────
  new Scenario(
    'bridge_collapse',
    'Bridge Collapse',
    'Two blocks north — exactly where the system said. The bridge is the only route; the tunnels flooded overnight. Warped beams, missing planks, monsters closing from the south. The system is already showing odds. You remember what you read in the station — or what you didn\'t.',
    [
      new Choice(
        'Run across immediately',
        70, 50,
        [{ trait: 'bravery', amount: 2 }],
        'The bridge holds long enough. You reach the other side as it collapses behind you. The system said 70%.',
        'A beam gives way halfway across. The fall drops you back to the south side — where the monsters already are. The system said 70%.',
        null
      ),
      new Choice(
        'Help another survivor cross first',
        40, 65,
        [{ trait: 'empathy', amount: 3 }],
        'Together you move steadier than alone. You both make it. The system gave this the worst odds. It was wrong.',
        'The combined weight breaks the span mid-crossing. The system said 40%. That part, at least, was accurate.',
        null
      ),
      new Choice(
        'Search for another route',
        60, 30,
        [{ trait: 'caution', amount: 2 }],
        'A fire escape behind a collapsed wall. It holds. The system never mentioned this path.',
        'Twelve minutes lost. No other route. By the time you\'re back, the monsters have arrived.',
        null
      ),
    ]
  ),

  // ── 2: Constellation Favor ────────────────────────────────────────────────
  new Scenario(
    'constellation_favor',
    'Constellation Favor',
    'You\'re across. North side of the bridge: empty street, broken glass, a pharmacy with intact windows. Then a second message — no SYSTEM header, no sender. A voice that exists above the frequency of sound. "We have been watching since the station. We can adjust the numbers in your favor. All we ask is that you accept."',
    [
      new Choice(
        'Accept the power',
        65, 80,
        [{ trait: 'bravery', amount: 1 }, { trait: 'empathy', amount: -2 }],
        'Something shifts — not in the world, in you. The odds will tilt your way going forward. Something was exchanged. You\'re not sure what yet.',
        'The transfer fails. The voice goes quiet. You are exactly as you were — but they are still watching.',
        { name: 'acceptedPower', value: true }
      ),
      new Choice(
        'Refuse the offer',
        50, 45,
        [{ trait: 'caution', amount: 3 }],
        'You close the channel. The voice doesn\'t argue. You\'ll navigate whatever comes next on your own numbers — real ones.',
        'The refusal is processed like data. The constellation withdraws. The street ahead feels longer than it should.',
        null
      ),
      new Choice(
        'Try to negotiate terms',
        55, 50,
        [{ trait: 'empathy', amount: 1 }, { trait: 'caution', amount: 1 }],
        'A pause — longer than expected. Then: terms. A fragment of the boost, conditional. The voice seems to find this interesting.',
        'Constellations do not negotiate. The offer window closes. You leave with nothing adjusted and everything noted.',
        null
      ),
    ]
  ),

  // ── 3: The Honest Scenario ────────────────────────────────────────────────
  new Scenario(
    'honest_scenario',
    'The Honest Scenario',
    'Inside the pharmacy: supplies on the shelves, a locked back room, and a system notification you didn\'t ask for. [SYSTEM: THREE OPTIONS AVAILABLE. ONE DISPLAYED PROBABILITY IS ACCURATE. THE OTHERS ARE ESTIMATES.] The back room could have medicine, a weapon, or nothing.',
    [
      new Choice(
        'Break into the back room',
        75, 75,
        [{ trait: 'caution', amount: -1 }],
        'The lock gives easily — too easily. Inside: medical supplies, enough for the group. The system said 75%. This time that number was the honest one. You pocket the supplies and note the difference.',
        'The back room is empty. Someone cleared it out before you arrived. The system said 75% — and for once, it wasn\'t lying. The odds were just odds.',
        null
      ),
      new Choice(
        'Take only what\'s on the shelves and leave',
        25, 60,
        [{ trait: 'bravery', amount: 2 }],
        'You grab what you can see and move. Outside, you hear the back room ceiling collapse — the floor was rotted through. The system said 25% for this. Your real odds were 60%. The system was lying about which choice was safe.',
        'You grab the shelf stock and head for the door. A display case tips as you pass — noise, delay, exposure. The system said 25%. That number, at least, was close to true.',
        { name: 'distrustedSystem', value: true }
      ),
      new Choice(
        'Wait and watch the building before going in',
        50, 40,
        [{ trait: 'caution', amount: 3 }],
        'From across the street you spot the rotted flooring through the window — the back room would have dropped you. You enter carefully, take the shelf stock, and leave intact. The system said 50%. It was lying; your odds were worse. Your eyes gave you what the numbers didn\'t.',
        'Waiting costs you the window. Another group reaches the pharmacy first. You watch them clear the shelves from across the street. The system said 50% — and counted every second you stood still against you.',
        null
      ),
    ]
  ),

  // ── 4: Green Zone Betrayal ────────────────────────────────────────────────
  new Scenario(
    'green_zone',
    'Green Zone Betrayal',
    'Three blocks east of the pharmacy — where the system directed you. [SYSTEM: GREEN ZONE ACTIVE. THREAT LEVEL: 0. SURVIVAL RATE: 80%. RECOMMENDED ACTION: HOLD POSITION.] You\'ve been here forty minutes. Someone found food. Someone fell asleep. The indicators are all green. Your instincts are not.',
    [
      new Choice(
        'Stay — trust the 80% guarantee',
        80, 40,
        [{ trait: 'caution', amount: -1 }],
        'By chance — pure, unearned chance — the zone holds today. You watch the indicators stay green and wonder how long that gap keeps closing in your favor.',
        'The guarantee was fabricated. The zone fails at the forty-three minute mark. The system does not explain. The system does not apologize.',
        null
      ),
      new Choice(
        'Leave — ignore the 20% warning',
        20, 65,
        [{ trait: 'caution', amount: 3 }, { trait: 'bravery', amount: 1 }],
        'You pull two people out over their objections. From the next block you watch the green zone detonate. The system said 20%. Your instincts were running different numbers.',
        'You leave — and walk into a threat the system never flagged. The zone holds behind you. Outside it, you\'re unprotected.',
        null
      ),
      new Choice(
        'Test the boundary before deciding',
        50, -1,
        [{ trait: 'empathy', amount: 1 }, { trait: 'caution', amount: 2 }],
        'The boundary flickers — a seam in the system\'s confidence. You document it and pull back. The knowledge changes what the next decision costs.',
        'The test triggers an automated lockdown. The zone seals with you inside. The system considers the matter resolved.',
        null
      ),
    ]
  ),

  // ── 5: Dokja's Record ────────────────────────────────────────────────────
  new Scenario(
    'dokjas_record',
    "Dokja's Record",
    'Street outside the green zone — or what\'s left of it. A third message, different from the others. It doesn\'t come from the system. It comes from above it. "We have a record. Station. Bridge. Pharmacy. Green zone. Every choice, every gap between what we showed you and what was real. You have been reading this story from the inside. We wanted you to know that we noticed."',
    [
      new Choice(
        'Ask what it wants from you',
        60, 55,
        [{ trait: 'empathy', amount: 2 }],
        'It doesn\'t answer directly. But the next scenario\'s odds shift in a direction you can\'t quite name. Asking was the right move.',
        'Silence. The kind that means the question was recorded, not answered.',
        null
      ),
      new Choice(
        'Ignore it and keep moving',
        50, 65,
        [{ trait: 'bravery', amount: 2 }, { trait: 'caution', amount: -1 }],
        'You move. The constellation keeps its record. You were never performing for it. Your real odds were better than shown — you don\'t find out.',
        'Ignoring it costs you nothing visible. Somewhere, a weight shifts against you that you\'ll feel later.',
        null
      ),
      new Choice(
        'Tell it to stop watching',
        35, 45,
        [{ trait: 'caution', amount: 2 }, { trait: 'bravery', amount: 1 }],
        'It does not stop. But it notes the refusal separately. In this world, resistance is also data.',
        'The demand is met with something that feels like amusement. You survive the street — smaller, slightly, for having asked.',
        { name: 'refusedAudience', value: true }
      ),
    ]
  ),

  // ── 6: The Strongest Sacrifice ───────────────────────────────────────────
  new Scenario(
    'sacrifice',
    'The Strongest Sacrifice',
    'Two hours north, eight survivors left. At the highway overpass, the system cuts in. [SYSTEM: MONSTER WAVE INBOUND. ETA 4 MINUTES. DESIGNATE ONE TO HOLD POSITION. INDIVIDUAL SURVIVAL: 20%. GROUP SURVIVAL IF ACTIONED: 70%.] The math is clear. The math is always clear. That\'s never been the problem.',
    [
      new Choice(
        'Volunteer yourself',
        20, 70,
        [{ trait: 'bravery', amount: 4 }, { trait: 'empathy', amount: 2 }],
        'You hold the overpass alone. The system said 20%. The real number was 70% — it wanted you afraid, not accurate. You survive. You don\'t tell the others what the odds actually were.',
        'You hold as long as you can. It\'s not enough. The group makes it north. The system\'s 20% was honest. That\'s the worst part.',
        null
      ),
      new Choice(
        'Designate someone else',
        70, 30,
        [{ trait: 'empathy', amount: -3 }, { trait: 'bravery', amount: -1 }],
        'You name someone. They hold. They are lost. You survive with the weight of it — the system never factored that into its 70%.',
        'The person you chose cannot hold. The wave catches everyone. The system\'s confidence was not a promise.',
        null
      ),
      new Choice(
        'Look for a third option',
        50, 50,
        [{ trait: 'caution', amount: 2 }, { trait: 'empathy', amount: 2 }],
        'A gap in the wave — not in the system\'s data, just in the wave itself. Everyone moves at once. Everyone survives. The system had no probability for this because it didn\'t believe you\'d look.',
        'There was no third option. Four minutes lost. The wave reaches you before the gate. The system never listed this choice because it knew.',
        null
      ),
    ]
  ),

  // ── 7: The Gap ───────────────────────────────────────────────────────────
  new Scenario(
    'the_gap',
    'The Gap',
    'The safe zone is real. Checkpoint lights, actual guards, a generator running somewhere inside. Before you cross, the system sends one last message. [SYSTEM: SIMULATION COMPLETE. ONE QUESTION BEFORE YOUR RECORD IS CLOSED.] Every choice had a displayed probability. Every displayed probability had a second number underneath — the real one, the one you weren\'t shown. The gap between them: what was it?',
    [
      new Choice(
        '"The system\'s margin of error"',
        70, 50,
        [{ trait: 'caution', amount: 1 }],
        'A reasonable answer. The system logs it without comment. You step through. You survived — whether you understood what you survived is a different question.',
        'The system rejects it. Margins of error don\'t have agendas. The gap was not an accident.',
        null
      ),
      new Choice(
        '"What the system was hiding"',
        50, 70,
        [{ trait: 'empathy', amount: 1 }, { trait: 'bravery', amount: 1 }],
        'The system doesn\'t confirm or deny. But your final odds were better than shown. You notice. You were always going to notice. That was the point.',
        'The system doesn\'t confirm or deny. You named it anyway. Naming things that won\'t be confirmed is its own kind of survival.',
        { name: 'understoodGap', value: true }
      ),
      new Choice(
        '"Irrelevant — I made it through"',
        60, 60,
        [{ trait: 'bravery', amount: 2 }],
        'The system agrees. For the first and last time, you and it want the same answer. The checkpoint opens.',
        'The system disagrees. Survival without reading the gap is not the same as having read it. The record notes the distinction.',
        null
      ),
    ]
  ),

];