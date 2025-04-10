import * as fn from "./func.js";
import { calculatePayoff, calculatePayoffProbabilities } from "./gameLogic.js";
import { handTest } from "./handType.js";

// uncomment these lines for testing hand types in console
// import { runTest } from "./tests2.js";
// runTest();

// Divs
const probCheckBox = document.getElementById("probCheckBox");
const buttons = document.getElementById("buttons");
const playerCash = document.getElementById("playerCash");
const betText = document.getElementById("placeBetText");
const handTableType = document.getElementById("currHandType");
const handTablePayoff = document.getElementById("payoffAmount");

// Gameplay
const dealButton = fn.newButton("deal", "Deal Cards");
const drawButton = fn.newButton("draw", "Draw");
const newHand = fn.newButton("redeal", "New Hand");
const resetBank = fn.newButton("resetBank", "Reset Balance");
buttons.appendChild(dealButton);
buttons.appendChild(drawButton);
buttons.appendChild(newHand);
buttons.appendChild(resetBank);

// Betting
const betUp = fn.newButton("betUp", "+$10,000");
const betDown = fn.newButton("betDown", "-$10,000");
const allIn = fn.newButton("allIn", "All in");
playerCash.appendChild(betUp);
playerCash.appendChild(betDown);
playerCash.appendChild(allIn);

// Init DOM
let playerBank = 1000000;
let currentBet = 0;
dealButton.hidden = false;
drawButton.hidden = true;
newHand.hidden = true;
resetBank.hidden = true;
betText.style.visibility = "hidden";
fn.faceDown();
fn.resetData();
fn.updateBalance(playerBank, currentBet);

// Don't allow gameplay until bet placed

// Gameplay button listeners
dealButton.addEventListener("click", () => {
  //require betting, temporary label
  if (currentBet <= 0) {
    betUp.classList.add("highlight");
    betText.style.visibility = "visible";
    setTimeout(() => {
      betUp.classList.remove("highlight");
      betText.style.visibility = "hidden";
    }, 1500);
    return;
  }
  fn.freshDeal();
  dealButton.hidden = true;
  drawButton.hidden = false;
  playerCash.style.visibility = "hidden";

  //player hand
  let playerHand = handTest(fn.cards);
  console.log(`
    ----- Deal ----\n
    Player Hand: ${fn.cards}\n
    old: ${calculatePayoff(fn.cards)}\n
    new: ${playerHand}\n`);

  //display table to player of current hand information
  handTableType.innerText = playerHand[0];
  handTablePayoff.innerText = fn.formatCurrency(playerHand[1] * currentBet);
});

drawButton.addEventListener("click", () => {
  fn.draw();
  drawButton.hidden = true;
  newHand.hidden = false;

  //player hand
  let playerHand = handTest(fn.cards);
  if (playerHand[1] > 0) {
    playerBank += playerHand[1] * currentBet;
  }
  console.log(`
    ----- Draw ----\n
    Player Hand: ${fn.cards}\n
    old: ${calculatePayoff(fn.cards)}\n
    new: ${playerHand}\n`);

  //display table to player of current hand information
  handTableType.innerText = playerHand[0];
  handTablePayoff.innerText = fn.formatCurrency(playerHand[1] * currentBet);

  //if we run out of money
  if (playerBank == 0) {
    resetBank.hidden = false;
  }
});

newHand.addEventListener("click", () => {
  currentBet = 0;
  fn.updateBalance(playerBank, currentBet);
  fn.removeCards();
  fn.resetData();
  fn.faceDown();
  newHand.hidden = true;
  dealButton.hidden = false;
  playerCash.style.visibility = "visible";
  //reset hand display
  handTableType.innerText = "-";
  handTablePayoff.innerText = "-";
});

betUp.addEventListener("click", () => {
  //make sure we have enough to bet
  if (playerBank >= 10000) {
    playerBank -= 10000;
    currentBet += 10000;
    fn.updateBalance(playerBank, currentBet);
    dealButton.hidden = false;
  } else {
    console.log("bet up insufficient");
  }
});

betDown.addEventListener("click", () => {
  //Make sure current bet can't go below min
  if (currentBet >= 10001) {
    playerBank += 10000;
    currentBet -= 10000;
    fn.updateBalance(playerBank, currentBet);
    dealButton.hidden = false;
  } else {
    console.log("bet down error");
  }
});

allIn.addEventListener("click", () => {
  if (playerBank > 0) {
    dealButton.hidden = false;
    currentBet += playerBank;
    playerBank = 0;
    fn.updateBalance(playerBank, currentBet);
  }
});

//reset button for when we go broke
resetBank.addEventListener("click", () => {
  playerBank = 1000000;
  fn.updateBalance(playerBank, 0);
  resetBank.hidden = true;
});

// ============ AI STUFF HERE ==========
// probCheckBox.addEventListener("change", () => {
//   fn.checkBoxToggle();
// });

function validateBettingAmount(input) {
  if (input.value !== "") {
    input.value = Math.max(1, parseInt(input.value, 10));
  }
  if (input.value < 1) {
    input.value = 1;
  }
}
