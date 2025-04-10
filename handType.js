const payoffs = {
  "Natural royal flush": 800,
  "Four deuces": 200,
  "Wild royal flush": 25,
  "Five of a kind": 15,
  "Straight flush": 9,
  "Four of a kind": 5,
  "Full house": 3,
  Flush: 2,
  Straight: 2,
  "Three of a Kind": 1,
  "No Pay Hand": -1,
};

// in order of highest to lowest payoff, first hand to return will elminate cases implicitly in lower hands
export function handTest(cards) {
  const hands = [
    isNRF,
    isFourDeuces,
    isWRF,
    isFive,
    isStraightFlush,
    isFour,
    isFullHouse,
    isFlush,
    isStraight,
    isThree,
  ];

  for (const typeCheck of hands) {
    let result = typeCheck(cards);
    if (result) {
      //   console.log(cards);
      return result;
    }
  }

  //no win found
  //   console.log(cards);
  return ["Not winning", 0];
}

// "Natural royal flush": 800,
function isNRF(cards) {
  let suits = new Set();
  let ranks = new Set();
  cards.forEach((card) => {
    suits.add(card.slice(-1));
    ranks.add(parseInt(card.slice(0, -1)));
  });
  let ranksFound = JSON.stringify(Array.from(ranks).sort());
  let expectedRanks = JSON.stringify([1, 10, 11, 12, 13]);

  if (suits.size == 1 && ranksFound == expectedRanks) {
    return ["Natural royal flush", 800];
  }
}

// "Four deuces": 200,
function isFourDeuces(cards) {
  let numDeuces = 0;
  cards.forEach((card) => {
    if (card.charAt(0) == "2") {
      numDeuces++;
    }
  });
  if (numDeuces == 4) {
    return ["Four deuces", 200];
  }
}

// "Wild royal flush": 25,
function isWRF(cards) {
  //check suits, but skip checking deuce suits
  let suits = new Set();
  let ranks = [];
  cards.forEach((card) => {
    if (card.charAt(0) != "2") {
      suits.add(card.slice(-1));
      if (parseInt(card.slice(0, -1)) == 1) {
        ranks.push(14);
      } else {
        ranks.push(parseInt(card.slice(0, -1)));
      }
    }
  });

  //lowest rank at least 10, only 1 suit guarantee no rank overlap
  ranks.sort((a, b) => a - b);
  if (suits.size == 1 && ranks[0] >= 10) {
    return ["Wild royal flush", 25];
  }
}

// "Five of a kind": 15,
function isFive(cards) {
  //**check four deuces first (always check highest handType first)
  //just grab ranks, suit irrelevant
  let ranks = cards.map((card) => card.slice(0, -1));
  if (new Set(ranks).size == 2 && ranks.includes("2")) {
    return ["Five of a kind", 15];
  }
}

// "Straight flush": 9,
function isStraightFlush(cards) {
  //check suits, but skip checking deuce suits
  let suits = new Set();
  let ranks = [];
  cards.forEach((card) => {
    if (card.charAt(0) != "2") {
      suits.add(card.slice(-1));
      ranks.push(parseInt(card.slice(0, -1)));
    }
  });

  ranks = ranks.sort((a, b) => a - b);

  //natural - diff between last and first = 4
  if (
    suits.size == 1 &&
    new Set(ranks).length == 5 &&
    ranks[4] - ranks[0] == 4
  ) {
    return ["Straight flush", 9];
  }

  //with deuces
  let numDeuces = 5 - ranks.length;
  let gaps = 0;

  //aces high
  if (ranks[0] == 1) {
    ranks[0] = 14;
    ranks = ranks.sort((a, b) => a - b);
  }
  for (let i = 0; i < ranks.length; i++) {
    let gap = ranks[i + 1] - ranks[i];
    if (gap > 1) {
      gaps += gap - 1;
    }
  }
  //check if we have enough deuces to fill the gaps, unique suit guarantees no rank overlaps
  if (suits.size == 1 && numDeuces >= gaps) {
    return ["Straight flush", 9];
  }

  //aces low
  if (ranks[ranks.length - 1] == 14) {
    let temp = ranks[0];
    ranks[0] = 1;
    ranks[ranks.length - 1] = temp;
    ranks = ranks.sort((a, b) => a - b);
  }
  //reset gaps for aces low
  gaps = 0;
  for (let i = 0; i < ranks.length; i++) {
    let gap = ranks[i + 1] - ranks[i];
    if (gap > 1) {
      gaps += gap - 1;
    }
  }
  //check if we have enough deuces to fill the gaps, unique suit guarantees no rank overlaps
  if (suits.size == 1 && numDeuces >= gaps) {
    return ["Straight flush", 9];
  }
}

// "Four of a kind": 5,
function isFour(cards) {
  let ranks = [];
  cards.forEach((card) => {
    if (card.charAt(0) != "2") {
      ranks.push(parseInt(card.slice(0, -1)));
    }
  });
  let numDeuces = 5 - ranks.length;
  let countRank = {};
  ranks.forEach((rank) => {
    countRank[rank] = (countRank[rank] || 0) + 1;
  });

  if (numDeuces + Math.max(...Object.values(countRank)) == 4) {
    return ["Four of a kind", 5];
  }
  return false;
}

// "Full house": 3,
function isFullHouse(cards) {
  let ranks = [];
  cards.forEach((card) => {
    if (card.charAt(0) != "2") {
      ranks.push(parseInt(card.slice(0, -1)));
    }
  });

  let numDeuces = 5 - ranks.length;
  let countRank = {};
  ranks.forEach((rank) => {
    countRank[rank] = (countRank[rank] || 0) + 1;
  });

  let numRanks = Object.keys(countRank).length;
  if (numRanks != 2) {
    return false;
  }

  //consider count of seen ranks (at most we have 1 duece) and exactly 2 other ranks
  let sumOfCounts = Object.values(countRank).reduce((a, b) => a + b);
  if (sumOfCounts + numDeuces == 5 && (numDeuces == 1 || numDeuces == 0)) {
    return ["Full house", 3];
  }
  return false;
}

// Flush: 2,
function isFlush(cards) {
  //check suits, but skip checking deuce suits
  let suits = new Set();
  cards.forEach((card) => {
    if (card.charAt(0) != "2") {
      suits.add(card.slice(-1));
    }
  });
  if (suits.size == 1) {
    return ["Flush", 2];
  }
}

// Straight: 2,
function isStraight(cards) {
  let ranks = [];
  cards.forEach((card) => {
    if (card.charAt(0) != "2") {
      ranks.push(parseInt(card.slice(0, -1)));
    }
  });

  //compare ranks
  ranks = ranks.sort((a, b) => a - b);

  //natural - diff between last and first = 4, all diff values

  if (new Set(ranks).size == 5 && ranks[4] - ranks[0] == 4) {
    return ["Straight", 2];
  }

  //with deuces
  let numDeuces = 5 - ranks.length;
  let gaps = 0;

  //aces high test
  if (ranks[0] == 1) {
    ranks[0] = 14;
    ranks = ranks.sort((a, b) => a - b);
  }
  for (let i = 0; i < ranks.length - 1; i++) {
    let gap = ranks[i + 1] - ranks[i];
    if (gap > 1) {
      gaps += gap - 1;
    }
  }
  if (numDeuces >= gaps && new Set(ranks).size == ranks.length) {
    return ["Straight", 2];
  }

  //aces low test - reset ranks
  if (ranks[ranks.length - 1] == 14) {
    let temp = ranks[0];
    ranks[0] = 1;
    ranks[ranks.length - 1] = temp;
    ranks = ranks.sort((a, b) => a - b);
  }
  //reset gaps for aces low
  gaps = 0;
  for (let i = 0; i < ranks.length - 1; i++) {
    let gap = ranks[i + 1] - ranks[i];
    if (gap > 1) {
      gaps += gap - 1;
    }
  }

  //check if we have enough deuces to fill the gaps, no duplicate ranks
  if (numDeuces >= gaps && new Set(ranks).size == ranks.length) {
    return ["Straight", 2];
  }

  //aces high straights

  return false;
}

// "Three of a Kind": 1,
function isThree(cards) {
  let ranks = [];
  cards.forEach((card) => {
    if (card.charAt(0) != "2") {
      ranks.push(parseInt(card.slice(0, -1)));
    }
  });

  let numDeuces = 5 - ranks.length;
  let countRank = {};
  ranks.forEach((rank) => {
    countRank[rank] = (countRank[rank] || 0) + 1;
  });
  if (Math.max(...Object.values(countRank)) + numDeuces == 3) {
    return ["Three of a Kind", 1];
  }
}
