// the current state of our cards
export let cards = []; // current player hand stores image elements on DOM
export let knownCards = []; // stores string representation of cards dealt
export let heldCards2 = [0, 0, 0, 0, 0, 0]; //binary held or not
export let cardDiv = document.getElementById("playingCards");
export let playerBank = formatCurrency(1000000); // $1MM starting
export let deck = [];

// betting, currency
export function formatCurrency(value) {
  return `$${Number(value).toLocaleString("en-US")}`;
}

export function updateBalance(bank, bet) {
  document.getElementById("currBalance").innerText = formatCurrency(bank);
  document.getElementById("currBet").innerText = formatCurrency(bet);
}

import {
  calculatePayoff,
  shuffleArray,
  calculatePayoffProbabilities,
} from "./gameLogic.js";

//removes cards from UI
export function removeCards() {
  while (cardDiv.children[0]) {
    cardDiv.firstChild.classList.remove("held");
    cardDiv.firstChild.remove();
  }

  document.getElementById("currHandType").innerText = "-";
  document.getElementById("payoffAmount").innerText = "-";
}

export function resetData() {
  //empty previous card hand and other arrays
  cards.splice(0, cards.length);
  knownCards.splice(0, knownCards.length);
  heldCards2 = [0, 0, 0, 0, 0];

  //empty known deck, and input newly created and shuffled one
  let tempDeck = [];
  const suits = ["h", "d", "c", "s"];
  const faceValues = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
  ];
  for (let suit of suits) {
    for (let faceValue of faceValues) {
      tempDeck.push(`${faceValue}${suit}`);
    }
  }
  tempDeck = shuffleArray(tempDeck);
  deck.splice(0, deck.length, ...tempDeck);
}

// start with 5 facedown cards
export function faceDown() {
  for (let i = 0; i < 5; i++) {
    let img = document.createElement("img");
    img.src = "/img/cards/png/card_back.png";
    img.classList.add("card");
    cardDiv.appendChild(img);
    cards.push(img);
  }
}

//give the player 5 brand new cards
export function freshDeal() {
  let deal = new Set();
  while (deal.size < 5) {
    deal.add(getRandomCard());
  }
  // modify arrays in place, since we export them can't simply overwrite
  cards.splice(0, cards.length, ...deal);
  knownCards.splice(0, knownCards.length, ...cards);

  //update the display
  displayUpdatedCards();
  // updateRLAgentSuggestions(cards);
  holdCards();
}

//after dealt, now hold or draw
export function draw() {
  let nHeld = heldCards2.reduce((acc, curr) => acc + curr, 0);
  let n = 5 - nHeld;
  let newCards = [];

  //generate n (new) random replacement cards
  do {
    let c = getRandomCard();
    if (!knownCards.includes(c)) {
      newCards.push(c);
      n--;
    }
  } while (n > 0);

  //update card array
  for (let i = 0; i < cards.length; i++) {
    if (heldCards2[i] == 0) {
      cards[i] = newCards.pop();
    }
  }

  displayUpdatedCards();

  // huhhh - TODO: separate this logic out
  // let [handType, payoff] = calculatePayoff(cards);
  // let winnings =
  //   payoff * parseInt(document.getElementById("bettingAmount").value);
  // console.log(winnings);
  // console.log(playerBank);
  // playerBank += winnings;
  // document.getElementById("currHandType").innerText = handType;
  // document.getElementById("payoffAmount").innerText = payoff;
  // document.getElementById("currBalance").innerText = playerBank;
}

//set index held binary arr 1 or 0, on click
function toggleHold(event) {
  const img = event.target;
  const indexHeld = Array.from(cardDiv.children).indexOf(img);
  if (heldCards2[indexHeld] == 0) {
    heldCards2[indexHeld] = 1;
    img.classList.add("held");
  } else {
    heldCards2[indexHeld] = 0;
    img.classList.remove("held");
  }

  let cardsToKeep = structuredClone(cards);
  cardsToKeep = cardsToKeep.filter((_, index) => heldCards2[index]);
  if (document.getElementById("probCheckBox").checked) {
    let probabilities = calculatePayoffProbabilities(deck, cardsToKeep);
    updatePayoffProbabilities(probabilities);
  }
}

function probabilityDisplay() {
  if (document.getElementById("probCheckBox").checked) {
    let probabilities = calculatePayoffProbabilities(deck, cardsToKeep);
    updatePayoffProbabilities(probabilities);
  }
}

export function holdCards() {
  const imgs = Array.from(cardDiv.children);
  imgs.forEach((img) => {
    // Remove any existing event listener before adding a new one
    img.removeEventListener("click", toggleHold);
    img.addEventListener("click", toggleHold);
  });
}

//using card array, update gfx
export function displayUpdatedCards() {
  for (let i = 0; i < 5; i++) {
    cardDiv.children[i].src = `../img/cards/png/${cards[i]}.png`;
  }
}

//generates ANY random card from a 52-card deck, returns string as below
function getRandomCard() {
  return deck.pop();
}

// button generator
export function newButton(name, innerText) {
  const btn = document.createElement("button");
  btn.setAttribute("id", name);
  btn.innerText = innerText;
  return btn;
}

export function updatePayoffProbabilities(handProbabilities) {
  if (document.getElementById("probCheckBox").checked) {
    let formatted = {};
    for (let hand in handProbabilities) {
      formatted[hand] = (handProbabilities[hand] * 100).toFixed(6) + "%";
    }
    document
      .getElementById("payoffs")
      .querySelector("table").rows[1].cells[2].innerText =
      formatted["Natural royal flush"];
    document
      .getElementById("payoffs")
      .querySelector("table").rows[2].cells[2].innerText =
      formatted["Four deuces"];
    document
      .getElementById("payoffs")
      .querySelector("table").rows[3].cells[2].innerText =
      formatted["Wild royal flush"];
    document
      .getElementById("payoffs")
      .querySelector("table").rows[4].cells[2].innerText =
      formatted["Full house"];
    document
      .getElementById("payoffs")
      .querySelector("table").rows[5].cells[2].innerText =
      formatted["Straight"];
    document
      .getElementById("payoffs")
      .querySelector("table").rows[1].cells[5].innerText =
      formatted["Five of a kind"];
    document
      .getElementById("payoffs")
      .querySelector("table").rows[2].cells[5].innerText =
      formatted["Straight flush"];
    document
      .getElementById("payoffs")
      .querySelector("table").rows[3].cells[5].innerText =
      formatted["Four of a kind"];
    document
      .getElementById("payoffs")
      .querySelector("table").rows[4].cells[5].innerText = formatted["Flush"];
    document
      .getElementById("payoffs")
      .querySelector("table").rows[5].cells[5].innerText =
      formatted["No Pay Hand"];
  } else {
    let cols = [2, 5];
    let rows = [0, 1, 2, 3, 4, 5];
    for (let row of rows) {
      for (let col of cols) {
        document.getElementById("payoffs").querySelector("table").rows[
          row
        ].cells[col].innerText = "-";
      }
    }
  }
}

export function queryRLAgent(cards) {
  return Array.from({ length: 5 }, () => (Math.random() < 0.5 ? 0 : 1));
}

function updateRLAgentSuggestions(cards) {
  if (document.getElementById("AICheckBox").checked) {
    console.log("Am I being run?");
    let keepOrDiscard = queryRLAgent(cards);
    let i = 0;
    const lights = Array.from(indicatorLights.children);
    lights.forEach((light) => {
      if (keepOrDiscard[i] == 0) {
        light.style.backgroundColor = "black";
      } else {
        light.style.backgroundColor = "gold";
      }
      i++;
    });
  }
}

export function checkBoxToggle() {
  if (probCheckBox.checked) {
    let cardsToKeep = structuredClone(cards);
    cardsToKeep = cardsToKeep.filter((_, index) => heldCards2[index]);
    let probabilities = calculatePayoffProbabilities(deck, cardsToKeep);
    updatePayoffProbabilities(probabilities);
  } else {
    let cols = [2, 5];
    let rows = [0, 1, 2, 3, 4, 5];
    for (let row of rows) {
      for (let col of cols) {
        document.getElementById("payoffs").querySelector("table").rows[
          row
        ].cells[col].innerText = "-";
      }
    }
  }
}
