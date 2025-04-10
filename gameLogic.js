// here can write functions to determine payoffs and hand types etc
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

// Helper function to count occurrences of each rank
function countRanks(hand) {
  const rankCounts = {};
  hand.forEach((card) => {
    const rank = parseInt(card.slice(0, -1));
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });
  return rankCounts;
}

// Helper function to check if all cards are the same suit
function isSameSuit(hand) {
  const suits = hand
    .filter((card) => parseInt(card.slice(0, -1)) !== 2) // Exclude wild cards
    .map((card) => card.slice(-1));

  return new Set(suits).size <= 1; // Wild cards can match any suit
}

// Helper function to check for a straight
function isStraight(ranks, wildCount) {
  const sortedRanks = [...new Set(ranks)].sort((a, b) => a - b); // Remove duplicates and sort
  let gaps = 0;

  for (let i = 1; i < sortedRanks.length; i++) {
    const gap = sortedRanks[i] - sortedRanks[i - 1] - 1;
    gaps += gap;
  }

  // Check if wild cards can fill the gaps
  return gaps <= wildCount && sortedRanks.length + wildCount >= 5;
}

export function calculatePayoff(hand) {
  const requiredRanks = new Set([1, 10, 11, 12, 13]); // Ranks for a Royal Flush ("NATURAL")

  // Replace wild cards (2s) with all possible ranks and check combinations
  const wildCards = hand.filter((card) => parseInt(card.slice(0, -1)) === 2);
  const nonWildCards = hand.filter((card) => parseInt(card.slice(0, -1)) !== 2);
  const wildCount = wildCards.length;

  // Extract ranks of non-wild cards
  const nonWildRanks = nonWildCards.map((card) => parseInt(card.slice(0, -1)));

  // Check for "Natural royal flush" (no wild cards)
  if (
    wildCount === 0 &&
    isSameSuit(hand) &&
    requiredRanks.size === new Set(nonWildRanks).size &&
    [...requiredRanks].every((rank) => nonWildRanks.includes(rank))
  ) {
    return ["Natural royal flush", payoffs["Natural royal flush"]];
  }

  // Check for "Four deuces"
  if (wildCount === 4) {
    return ["Four deuces", payoffs["Four deuces"]];
  }

  // Check for "Wild royal flush" (with wild cards)
  if (
    isSameSuit(hand) &&
    [...requiredRanks].filter((rank) => !nonWildRanks.includes(rank)).length <=
      wildCount &&
    isStraight(nonWildRanks, wildCount)
  ) {
    return ["Wild royal flush", payoffs["Wild royal flush"]];
  }

  // Check for "Five of a kind"
  const rankCounts = countRanks(nonWildCards);
  if (Object.values(rankCounts).some((count) => count + wildCount === 5)) {
    return ["Five of a kind", payoffs["Five of a kind"]];
  }

  // Check for "Straight flush"
  if (isSameSuit(hand) && isStraight(nonWildRanks, wildCount)) {
    return ["Straight flush", payoffs["Straight flush"]];
  }

  // Check for "Four of a kind"
  if (Object.values(rankCounts).some((count) => count + wildCount === 4)) {
    return ["Four of a kind", payoffs["Four of a kind"]];
  }

  // Check for "Full house"
  const rankCountsArray = Object.values(rankCounts).sort((a, b) => b - a); // Sort counts in descending order
  if (rankCountsArray[0] + wildCount >= 3) {
    // Check for three of a kind
    const remainingWilds = wildCount - (3 - rankCountsArray[0]); // Deduct wilds used for three of a kind
    if (rankCountsArray[1] + remainingWilds >= 2) {
      // Check for a pair with remaining wilds
      return ["Full house", payoffs["Full house"]];
    }
  }

  // Check for "Flush"
  if (isSameSuit(hand)) {
    return ["Flush", payoffs["Flush"]];
  }

  // Check for "Straight"
  if (isStraight(nonWildRanks, wildCount)) {
    return ["Straight", payoffs["Straight"]];
  }

  // Check for "Three of a kind"
  if (rankCountsArray[0] + wildCount >= 3) {
    return ["Three of a Kind", payoffs["Three of a Kind"]];
  }

  // No matching hand
  return ["No Pay Hand", payoffs["No Pay Hand"]];
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Pick a random index
    [array[i], array[j]] = [array[j], array[i]]; // Swap
  }
  return array;
}

export function calculatePayoffProbabilities(deck, keptCards) {
  const remainingCards = difference(deck, keptCards);
  const possibleHands = combinations(remainingCards, 5 - keptCards.length).map(
    (hand) => keptCards.concat(hand)
  );

  // Initialize probabilities with all hand types set to 0
  const payoffProbabilities = {};
  for (const handType in payoffs) {
    payoffProbabilities[handType] = 0;
  }

  // Simulate all possible hands and count occurrences
  for (const hand of possibleHands) {
    const [handType] = calculatePayoff(hand); // Get the hand type
    payoffProbabilities[handType] = (payoffProbabilities[handType] || 0) + 1;
  }

  // Convert counts to probabilities
  const totalSimulations = possibleHands.length;
  for (const handType in payoffProbabilities) {
    payoffProbabilities[handType] /= totalSimulations; // Probability = count / total simulations
  }

  return payoffProbabilities;
}

function combinations(arr, m) {
  if (m > arr.length) return []; // If m is greater than array size, return empty list
  if (m === 0) return [[]]; // Base case: one way to choose 0 elements

  function generateCombinations(start, path) {
    if (path.length === m) {
      result.push([...path]); // Store a copy of the combination
      return;
    }
    for (let i = start; i < arr.length; i++) {
      path.push(arr[i]);
      generateCombinations(i + 1, path);
      path.pop(); // Backtrack
    }
  }

  const result = [];
  generateCombinations(0, []);
  return result;
}

function difference(array, ...values) {
  const excludeSet = new Set(values.flat()); // Flatten all values arrays and store in a Set
  return array.filter((item) => !excludeSet.has(item)); // Keep items not in excludeSet
}
