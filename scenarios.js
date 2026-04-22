// scenarios.js — defines all four ORV scenarios (pure data, no logic)
// Each choice has displayProbability (shown to player) and actualProbability (real)

const SCENARIOS = [

  // Scenario 1: Bridge Collapse
  new Scenario(
    'bridge_collapse',
    'Bridge Collapse',
    'A decaying bridge spans the gap between you and safety. Monsters converge from behind. Every second costs lives. The system offers you odds — but can you trust the numbers?',
    [
      new Choice(
        'Run across immediately',
        70, 50,
        [{ trait: 'bravery', amount: 2 }],
        'You sprint across. The bridge groans but holds. You make it — barely.',
        'Halfway across, a plank gives way. You fall, dragged back. The monsters close in.',
        null
      ),
      new Choice(
        'Help another survivor cross',
        40, 65,
        [{ trait: 'empathy', amount: 3 }],
        'Together you move faster than alone. The weight is shared. You both survive.',
        'The added weight proves too much. The bridge collapses mid-span. Neither of you makes it.',
        null
      ),
      new Choice(
        'Search for another route',
        60, 30,
        [{ trait: 'caution', amount: 2 }],
        'Against the odds, you find a hidden path. The monsters lose your trail.',
        'The search wastes precious time. The route leads nowhere. The monsters find you.',
        null
      ),
    ]
  ),

  // Scenario 2: Constellation Favor
  new Scenario(
    'constellation_favor',
    'Constellation Favor',
    'A voice from beyond the veil. A constellation offers power — the kind that tips every scale in your favor.\nBut nothing is given freely in this world.',
    [
      new Choice(
        'Accept the power',
        65, 80,
        [{ trait: 'bravery', amount: 1 }, { trait: 'empathy', amount: -2 }],
        'Power floods through you. The world tilts in your favor. Something is lost — you are not sure what yet.',
        'The power overwhelms you. You lose control. The constellation watches, amused.',
        { name: 'acceptedPower', value: true }
      ),
      new Choice(
        'Refuse the offer',
        50, 45,
        [{ trait: 'caution', amount: 3 }],
        'You step back from the offer. The constellation fades. You feel no different — but perhaps that is the point.',
        'Your refusal is taken as weakness. The constellation withdraws all favor. The path ahead grows darker.',
        null
      ),
      new Choice(
        'Attempt to negotiate',
        55, 50,
        [{ trait: 'empathy', amount: 1 }, { trait: 'caution', amount: 1 }],
        'The constellation pauses. Terms are reached. You gain a fragment of power — on your own terms.',
        'The constellation does not negotiate. Your attempt is dismissed. You leave with nothing.',
        null
      ),
    ]
  ),

  // Scenario 3: Green Zone Betrayal
  new Scenario(
    'green_zone',
    'Green Zone Betrayal',
    'The system insists this sector is safe. Every reading is green. Survival rate: 80%. No threats detected. But the deeper you go, the more the system feels… wrong.',
    [
      new Choice(
        'Stay inside the zone',
        80, 40,
        [{ trait: 'caution', amount: -1 }],
        'You trust the system. By pure chance, the guarantee holds — this time.',
        'The guarantee was a lie. The zone collapses around you. The system offers no apology.',
        null
      ),
      new Choice(
        'Leave the zone early',
        20, 65,
        [{ trait: 'caution', amount: 3 }, { trait: 'bravery', amount: 1 }],
        'Against all displayed odds you walk away. Outside, the zone detonates. Your instincts were right.',
        'You break away — and walk straight into danger that the system never flagged.',
        null
      ),
      new Choice(
        'Test the boundary',
        50, -1,   // -1 = dynamic; resolved at runtime by ScenarioEngine
        [{ trait: 'empathy', amount: 1 }, { trait: 'caution', amount: 2 }],
        'The boundary flickers. You document the inconsistency. Knowledge is its own kind of survival.',
        'The test triggers an automated response. The zone locks down. You are inside when it does.',
        null
      ),
    ]
  ),

  // Scenario 4: The Strongest Sacrifice
  new Scenario(
    'sacrifice',
    'The Strongest Sacrifice',
    'A wave of monsters approaches. Someone must stay behind to buy the others time. The system tells you who has the best odds. Do you believe it?',
    [
      new Choice(
        'Volunteer yourself',
        20, 70,
        [{ trait: 'bravery', amount: 4 }, { trait: 'empathy', amount: 2 }],
        'You hold the line alone. Against every number, you survive. The others reach safety.',
        'You hold as long as you can. It is not enough. But the others make it.',
        null
      ),
      new Choice(
        'Designate someone else',
        70, 30,
        [{ trait: 'empathy', amount: -3 }, { trait: 'bravery', amount: -1 }],
        'The designated person is lost. You survive. The weight of that choice travels with you.',
        "The person you chose cannot hold. The wave catches everyone. The system's confidence was empty.",
        null
      ),
      new Choice(
        'Look for another solution',
        50, 50,   // ±25 random variance applied at runtime by ScenarioEngine
        [{ trait: 'caution', amount: 2 }, { trait: 'empathy', amount: 2 }],
        'An improbable third option. A gap in the wave. Everyone moves — everyone survives.',
        'There was no third option. The search cost precious seconds. The monsters reach you before the gate.',
        null
      ),
    ]
  ),

];
