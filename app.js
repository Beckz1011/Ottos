// Datenstruktur für Emotionen und Handlungen mit kürzeren Dateinamen
const emotionsHandlungen = [
  { id: 1, emotion: "Freude", handlung: "Gemeinsam lachen", emotionBild: "bilder/E1.png", handlungBild: "bilder/H1.png" },
  { id: 2, emotion: "Traurigkeit", handlung: "Jemanden in den Arm nehmen", emotionBild: "bilder/E2.png", handlungBild: "bilder/H2.png" },
  { id: 3, emotion: "Wut", handlung: "Tief durchatmen, um sich zu beruhigen", emotionBild: "bilder/E3.png", handlungBild: "bilder/H3.png" },
  { id: 4, emotion: "Angst", handlung: "Sich an jemanden festhalten", emotionBild: "bilder/E4.png", handlungBild: "bilder/H4.png" },
  { id: 5, emotion: "Überraschung", handlung: "Freudig auf ein Geschenk zeigen", emotionBild: "bilder/E5.png", handlungBild: "bilder/H5.png" },
  { id: 6, emotion: "Ekel", handlung: "Einen Teller wegschieben", emotionBild: "bilder/E6.png", handlungBild: "bilder/H6.png" },
  { id: 7, emotion: "Mitgefühl", handlung: "Ein Taschentuch anbieten", emotionBild: "bilder/E7.png", handlungBild: "bilder/H7.png" },
  { id: 8, emotion: "Stolz", handlung: "Ein Bild zeigen, das man gemalt hat", emotionBild: "bilder/E8.png", handlungBild: "bilder/H8.png" },
  { id: 9, emotion: "Scham", handlung: "Sich entschuldigen", emotionBild: "bilder/E9.png", handlungBild: "bilder/H9.png" },
  { id: 10, emotion: "Neid", handlung: "Mit verschränkten Armen auf jemanden schauen", emotionBild: "bilder/E10.png", handlungBild: "bilder/H10.png" },
  { id: 11, emotion: "Dankbarkeit", handlung: "Ein Geschenk überreichen", emotionBild: "bilder/E11.png", handlungBild: "bilder/H11.png" },
  { id: 12, emotion: "Unsicherheit", handlung: "Jemanden um Hilfe bitten", emotionBild: "bilder/E12.png", handlungBild: "bilder/H12.png" }
];

// Spielzustand
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 12; // Standardmäßig alle Paare
let timerInterval;
let seconds = 0;
let score = 0;

// DOM-Elemente
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const instructionsScreen = document.getElementById('instructions-screen');
const startButton = document.getElementById('start-button');
const instructionsButton = document.getElementById('instructions-button');
const backButton = document.getElementById('back-button');
const restartButton = document.getElementById('restart-button');
const muteButton = document.getElementById('mute-button');
const cardGrid = document.getElementById('card-grid');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');

// Neue DOM-Elemente für die Zurück-Taste
const backToMenuButton = document.getElementById('back-to-menu-button');

// Modal-Elemente
const endGameModal = document.getElementById('end-game-modal');
const closeModal = document.getElementById('close-modal');
const closeModalButton = document.getElementById('close-modal-button');
const endGameMessage = document.getElementById('end-game-message');

// Audio-Objekte erstellen und vorladen
const cardSwitchSound = new Audio('sounds/cardswitch.wav');
const pointsSound = new Audio('sounds/points.wav');
const woohooSound = new Audio('sounds/woohoo.wav');

// Lautstärke anpassen (optional)
cardSwitchSound.volume = 0.5;
pointsSound.volume = 0.5;
woohooSound.volume = 0.5;

// Vorladen der Sounds
cardSwitchSound.preload = 'auto';
pointsSound.preload = 'auto';
woohooSound.preload = 'auto';

// Stummschalt-Status
let isMuted = false;

// Event Listener für Mute-Button
muteButton.addEventListener('click', () => {
  isMuted = !isMuted;
  cardSwitchSound.muted = isMuted;
  pointsSound.muted = isMuted;
  woohooSound.muted = isMuted;
  muteButton.textContent = isMuted ? 'Ton an' : 'Ton aus';
});

// Event Listener für Start-Button
startButton.addEventListener('click', startGame);

// Event Listener für Anleitung-Button
instructionsButton.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  instructionsScreen.classList.remove('hidden');
});

// Event Listener für Zurück-Button in der Anleitung
backButton.addEventListener('click', () => {
  instructionsScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
});

// Event Listener für Zurück-zum-Menü-Button im Spielbildschirm
backToMenuButton.addEventListener('click', () => {
  // Stoppe den Timer
  clearInterval(timerInterval);
  
  // Verberge den Spielbildschirm und zeige das Hauptmenü
  gameScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  
  // Setze das Spiel zurück
  resetGame();
});

// Event Listener für Neustart-Button
restartButton.addEventListener('click', resetGame);

// Event Listener für Modal-Schließen
closeModal.addEventListener('click', () => {
  endGameModal.classList.add('hidden');
});
closeModalButton.addEventListener('click', () => {
  endGameModal.classList.add('hidden');
  resetGame();
});

// Spiel starten
function startGame() {
  // Auswahl der Paare abrufen
  const selectedPairs = getSelectedPairCount();
  if (!selectedPairs) {
    alert('Bitte wähle die Anzahl der Paare aus, bevor du das Spiel startest.');
    return;
  }
  totalPairs = selectedPairs;

  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  initializeCards();
  resetScoreAndTimer();
  startTimer();
}

// Funktion zum Abrufen der ausgewählten Anzahl der Paare
function getSelectedPairCount() {
  const pairOptions = document.getElementsByName('pair-count');
  for (let option of pairOptions) {
    if (option.checked) {
      return parseInt(option.value);
    }
  }
  return null; // Keine Auswahl getroffen
}

// Punkte und Timer zurücksetzen
function resetScoreAndTimer() {
  matchedPairs = 0;
  seconds = 0;
  score = 0;
  scoreElement.textContent = `Punkte: ${score}`;
  timerElement.textContent = `Zeit: 00:00`;
}

// Karten initialisieren
function initializeCards() {
  // Erstelle ein Array mit Emotionen und Handlungen basierend auf der ausgewählten Anzahl der Paare
  const selectedPairsData = emotionsHandlungen.slice(0, totalPairs);
  const pairedCards = selectedPairsData.flatMap(pair => [
    { ...pair, type: 'emotion' },
    { ...pair, type: 'handlung' }
  ]);

  // Mische die Karten
  cards = shuffleArray(pairedCards);

  // Render die Karten
  cardGrid.innerHTML = '';
  
  // Verwenden eines DocumentFragments zur Optimierung der DOM-Manipulation
  const fragment = document.createDocumentFragment();
  
  cards.forEach(card => {
    const cardElement = createCardElement(card);
    fragment.appendChild(cardElement);
  });
  
  cardGrid.appendChild(fragment);
}

// Karten erstellen
function createCardElement(card) {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card');
  cardDiv.dataset.id = card.id;
  cardDiv.dataset.type = card.type;

  const cardInner = document.createElement('div');
  cardInner.classList.add('card-inner');

  // Vorderseite der Karte: Unterschiedliches Rückseitenbild basierend auf Typ
  const cardFront = document.createElement('div');
  cardFront.classList.add('card-front');
  const frontImg = document.createElement('img');
  frontImg.src = card.type === 'emotion' ? "bilder/EBack.png" : "bilder/HBack.png"; // Aktualisierte Rückseitenbilder
  frontImg.alt = "Rückseite der Karte";
  frontImg.onerror = () => {
    frontImg.src = 'bilder/default.png'; // Fallback-Bild
  };
  cardFront.appendChild(frontImg);

  // Rückseite der Karte: Emotion oder Handlung mit Beschriftung
  const cardBack = document.createElement('div');
  cardBack.classList.add('card-back');
  const backImg = document.createElement('img');
  backImg.src = card.type === 'emotion' ? card.emotionBild : card.handlungBild;
  backImg.alt = card.type === 'emotion' ? card.emotion : card.handlung;
  backImg.onerror = () => {
    backImg.src = 'bilder/default.png'; // Fallback-Bild
  };
  const backText = document.createElement('p');
  backText.textContent = card.type === 'emotion' ? card.emotion : card.handlung;
  cardBack.appendChild(backImg);
  cardBack.appendChild(backText);

  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  cardDiv.appendChild(cardInner);

  // Event Listener für Karte
  cardDiv.addEventListener('click', handleCardClick);

  return cardDiv;
}

// Shuffle-Funktion (Fisher-Yates Algorithmus)
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Tausche Elemente
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// Karte anklicken
function handleCardClick() {
  if (flippedCards.length >= 2 || this.classList.contains('matched') || flippedCards.includes(this)) {
    return;
  }

  // Sound abspielen, bevor die Karte umgedreht wird
  if (!isMuted) {
    cardSwitchSound.currentTime = 0; // Sound zurücksetzen, falls er noch läuft
    cardSwitchSound.play().catch(error => {
      console.error('Fehler beim Abspielen von cardswitch.wav:', error);
    });
  }

  this.classList.add('flipped');
  flippedCards.push(this);

  if (flippedCards.length === 2) {
    checkForMatch();
  }
}

// Überprüfen auf Paar
function checkForMatch() {
  const [card1, card2] = flippedCards;
  const card1Data = getCardData(card1);
  const card2Data = getCardData(card2);

  console.log(`Überprüfe Paare: ${card1Data.type} (${card1Data.id}) mit ${card2Data.type} (${card2Data.id})`);

  let isMatch = false;

  // Prüfen, ob eine Emotion und die passende Handlung ausgewählt wurden
  if (
    (card1Data.type === 'emotion' && card2Data.type === 'handlung' && card2Data.id === card1Data.id) ||
    (card2Data.type === 'emotion' && card1Data.type === 'handlung' && card1Data.id === card2Data.id)
  ) {
    isMatch = true;
  }

  console.log(`Match gefunden: ${isMatch}`);

  if (isMatch) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    score += 10;
    scoreElement.textContent = `Punkte: ${score}`;
    matchedPairs++;

    // Sound abspielen, wenn Punkte hinzugefügt werden
    if (!isMuted) {
      pointsSound.currentTime = 0; // Sound zurücksetzen
      pointsSound.play().catch(error => {
        console.error('Fehler beim Abspielen von points.wav:', error);
      });
    }

    if (matchedPairs === totalPairs) {
      endGame();
    }
    flippedCards = [];
  } else {
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
    }, 1000);
    score -= 2;
    if (score < 0) score = 0; // Verhindert negative Punktzahlen
    scoreElement.textContent = `Punkte: ${score}`;
  }
}

// Daten einer Karte abrufen
function getCardData(cardElement) {
  const id = parseInt(cardElement.dataset.id);
  const type = cardElement.dataset.type;
  return cards.find(card => card.id === id && card.type === type);
}

// Spiel beenden
function endGame() {
  clearInterval(timerInterval);
  restartButton.classList.remove('hidden');

  // Sound abspielen, wenn das Spiel gewonnen ist
  if (!isMuted) {
    woohooSound.currentTime = 0; // Sound zurücksetzen
    woohooSound.play().catch(error => {
      console.error('Fehler beim Abspielen von woohoo.wav:', error);
    });
  }

  // Nachricht im Modal setzen
  endGameMessage.textContent = `Glückwunsch! Du hast alle Paare gefunden.\nZeit: ${formatTime(seconds)}\nPunkte: ${score}`;

  // Modal anzeigen
  setTimeout(() => {
    endGameModal.classList.remove('hidden');
  }, 100); // Kurze Verzögerung, um den Sound zu starten
}

// Spiel zurücksetzen
function resetGame() {
  matchedPairs = 0;
  seconds = 0;
  score = 0;
  scoreElement.textContent = `Punkte: ${score}`;
  timerElement.textContent = `Zeit: 00:00`;
  restartButton.classList.add('hidden');
  gameScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  flippedCards = [];

  // Entferne alle Klassen 'matched' und 'flipped' von den Karten
  const allCards = document.querySelectorAll('.card');
  allCards.forEach(card => {
    card.classList.remove('matched', 'flipped');
  });

  // Stoppe den Timer, falls er läuft
  clearInterval(timerInterval);
}

// Timer starten
function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    timerElement.textContent = `Zeit: ${formatTime(seconds)}`;
  }, 1000);
}

// Zeit formatieren
function formatTime(sec) {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
  return num < 10 ? `0${num}` : num;
}