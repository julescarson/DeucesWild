import { calculatePayoff } from "./gameLogic.js";
import { handTest } from "./handType.js";

export function runTest() {
  const testCases = [
    // No Deuces
    {
      hand: ["10S", "11S", "12S", "13S", "1S"],
      expected: "Natural royal flush",
    },
    { hand: ["5D", "6D", "7D", "8D", "9D"], expected: "Straight flush" },
    { hand: ["9C", "9D", "9H", "9S", "3S"], expected: "Four of a kind" },
    { hand: ["8C", "8D", "8H", "3S", "3D"], expected: "Full house" },
    { hand: ["3S", "5S", "8S", "10S", "13S"], expected: "Flush" },
    { hand: ["4C", "5D", "6H", "7S", "8S"], expected: "Straight" },
    { hand: ["7C", "7D", "7H", "3S", "5D"], expected: "Three of a Kind" },
    { hand: ["3C", "5D", "7H", "9S", "13S"], expected: "No Pay Hand" },

    // 1 Deuce
    { hand: ["2S", "10S", "11S", "12S", "13S"], expected: "Wild royal flush" },
    { hand: ["10S", "2S", "11S", "12S", "13S"], expected: "Wild royal flush" },
    { hand: ["2S", "9C", "9D", "9H", "9S"], expected: "Five of a kind" },
    { hand: ["2S", "5D", "6D", "7D", "8D"], expected: "Straight flush" },
    { hand: ["2S", "9C", "9D", "9H", "3S"], expected: "Four of a kind" },
    { hand: ["2S", "5S", "8S", "10S", "13S"], expected: "Flush" },
    { hand: ["2S", "4C", "5D", "6H", "7S"], expected: "Straight" },
    { hand: ["2S", "5D", "7H", "9S", "13S"], expected: "No Pay Hand" },

    // 2 Deuces
    { hand: ["2S", "2D", "10S", "11S", "12S"], expected: "Wild royal flush" },
    { hand: ["2S", "2D", "9C", "9D", "9H"], expected: "Five of a kind" },
    { hand: ["2S", "2D", "5D", "6D", "7D"], expected: "Straight flush" },
    { hand: ["2S", "2D", "9C", "9D", "3S"], expected: "Four of a kind" },
    { hand: ["2S", "2D", "5S", "8S", "13S"], expected: "Flush" },
    { hand: ["2S", "2D", "4C", "5D", "6H"], expected: "Straight" },

    // 3 Deuces
    { hand: ["2S", "2D", "2H", "10S", "11S"], expected: "Wild royal flush" },
    { hand: ["2S", "2D", "2H", "9C", "9D"], expected: "Five of a kind" },
    { hand: ["2S", "2D", "2H", "5D", "6D"], expected: "Straight flush" },
    { hand: ["2S", "2D", "2H", "9C", "6D"], expected: "Four of a kind" },

    // 4 Deuces
    { hand: ["2S", "2D", "2H", "2C", "10S"], expected: "Four deuces" },
  ];

  // Run tests and print to console instead of writing to file
  testCases.forEach(({ hand, expected }) => {
    const [result, payoff] = calculatePayoff(hand);
    //only showing failed tests
    if (result != expected) {
      console.log(
        `Hand: ${hand.join(", ")} | ` +
          `Result: ${result} | ` +
          `Payoff: ${payoff} | ` +
          `Expected: ${expected} | ` +
          `Test ${result === expected ? "PASSED" : "FAILED"}`
      );
    }
  });

  testCases.forEach((e) => {
    let t = handTest(e.hand);

    if (e.expected != t[0]) {
      console.log(
        `Hand: ${e.hand.join(", ")} | ` +
          `Result: ${t[0]} | ` +
          `Payoff: ${t[1]} | ` +
          `Expected: ${e.expected} | ` +
          `Test ${t[0] === e.expected ? "PASSED" : "FAILED"}`
      );
    }
  });
}
