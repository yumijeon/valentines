// ===============================
// Floating hearts (cute background)
// ===============================
function createFloatingHearts() {
  const container = document.getElementById("heartsContainer");
  if (!container) return;

  container.innerHTML = ""; // prevent duplicates on refresh
  const heartCount = 12;

  for (let i = 0; i < heartCount; i++) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.textContent = "💕";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.top = `${Math.random() * 100}%`;
    heart.style.animationDelay = `${Math.random() * 8}s`;
    heart.style.animationDuration = `${6 + Math.random() * 4}s`;
    container.appendChild(heart);
  }
}

createFloatingHearts();

// ===============================
// Screen management + elements
// ===============================
const coverScreen = document.getElementById("coverScreen");
const cardScreen = document.getElementById("cardScreen");
const resultYesScreen = document.getElementById("resultYesScreen");
const resultNoScreen = document.getElementById("resultNoScreen");

const envelope = document.getElementById("envelope");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

const restartYes = document.getElementById("restartYes");
const restartNo = document.getElementById("restartNo");

// ===============================
// GIF paths (IMPORTANT)
// ===============================
// If your filename has a space, you MUST encode it as %20 for GitHub Pages.
const GIFS = {
  yes: "assets/good%20choice.gif", // <-- "good choice.gif" becomes "good%20choice.gif"
  no: "assets/poodle.gif",
};

// Find the <img> inside each result screen and set the src.
// (Works even if you didn't add ids to the <img> tags.)
function setResultGifs() {
  if (!resultYesScreen || !resultNoScreen) return;

  const yesImg =
    resultYesScreen.querySelector("img") ||
    document.getElementById("resultYesGif");
  const noImg =
    resultNoScreen.querySelector("img") ||
    document.getElementById("resultNoGif");

  if (yesImg) {
    yesImg.src = GIFS.yes;
    yesImg.alt = "Good choice gif";
    yesImg.loading = "eager";
    yesImg.decoding = "async";
    yesImg.addEventListener("error", () =>
      console.log("YES gif failed to load:", yesImg.src)
    );
    yesImg.addEventListener("load", () =>
      console.log("YES gif loaded:", yesImg.src)
    );
  } else {
    console.log("Could not find an <img> inside #resultYesScreen");
  }

  if (noImg) {
    noImg.src = GIFS.no;
    noImg.alt = "Hold my poodle gif";
    noImg.loading = "eager";
    noImg.decoding = "async";
    noImg.addEventListener("error", () =>
      console.log("NO gif failed to load:", noImg.src)
    );
    noImg.addEventListener("load", () =>
      console.log("NO gif loaded:", noImg.src)
    );
  } else {
    console.log("Could not find an <img> inside #resultNoScreen");
  }
}

// run once on load
setResultGifs();

// ===============================
// Helpers: show/hide screens
// ===============================
function showOnly(screenToShow) {
  if (coverScreen) coverScreen.classList.add("hidden");
  if (cardScreen) cardScreen.classList.add("hidden");
  if (resultYesScreen) resultYesScreen.classList.add("hidden");
  if (resultNoScreen) resultNoScreen.classList.add("hidden");

  if (screenToShow) screenToShow.classList.remove("hidden");
}

// ===============================
// Envelope opening
// ===============================
if (envelope) {
  envelope.addEventListener("click", () => {
    envelope.classList.add("opening");

    setTimeout(() => {
      showOnly(cardScreen);
    }, 520);
  });
}

// ===============================
// Yes / No result transitions
// ===============================
if (yesBtn) {
  yesBtn.addEventListener("click", () => {
    showOnly(resultYesScreen);
  });
}

if (noBtn) {
  // If he catches it:
  noBtn.addEventListener("click", () => {
    showOnly(resultNoScreen);
  });
}

// ===============================
// No button: runs away inside card bounds
// ===============================
let isRunning = false;
const proximityThreshold = 100; // px

function getDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function moveNoButton(cursorX, cursorY) {
  if (isRunning || !noBtn || !yesBtn) return;

  const noBtnRect = noBtn.getBoundingClientRect();
  const noBtnCenterX = noBtnRect.left + noBtnRect.width / 2;
  const noBtnCenterY = noBtnRect.top + noBtnRect.height / 2;

  const distance = getDistance(cursorX, cursorY, noBtnCenterX, noBtnCenterY);
  if (distance >= proximityThreshold) return;

  isRunning = true;
  noBtn.classList.add("running");

  const card = document.querySelector(".card");
  if (!card) {
    // fallback: if no card found, just stop running
    isRunning = false;
    noBtn.classList.remove("running");
    return;
  }

  const cardRect = card.getBoundingClientRect();
  const yesBtnRect = yesBtn.getBoundingClientRect();

  // Ensure the "No" button is positioned relative to the card
  // (Your CSS should have the card as position: relative; and the no button position: absolute;)
  // If not, this still works as long as noBtn left/top are applied within card.
  const padding = 20;

  // Safe area inside card, in CARD coordinates
  const minX = padding;
  const minY = padding + 90; // avoid the message area near top
  const maxX = cardRect.width - noBtn.offsetWidth - padding;
  const maxY = cardRect.height - noBtn.offsetHeight - padding;

  // Expand "no-go" zone around the YES button (CARD coordinates)
  const noGoMargin = 30;
  const yesNoGoLeft = yesBtnRect.left - cardRect.left - noGoMargin;
  const yesNoGoRight = yesBtnRect.right - cardRect.left + noGoMargin;
  const yesNoGoTop = yesBtnRect.top - cardRect.top - noGoMargin;
  const yesNoGoBottom = yesBtnRect.bottom - cardRect.top + noGoMargin;

  let newX = minX;
  let newY = minY;

  let attempts = 0;
  const maxAttempts = 30;

  function overlapsYes(x, y) {
    return !(
      x + noBtn.offsetWidth < yesNoGoLeft ||
      x > yesNoGoRight ||
      y + noBtn.offsetHeight < yesNoGoTop ||
      y > yesNoGoBottom
    );
  }

  do {
    newX = minX + Math.random() * Math.max(1, maxX - minX);
    newY = minY + Math.random() * Math.max(1, maxY - minY);
    attempts++;
  } while (overlapsYes(newX, newY) && attempts < maxAttempts);

  // Fallback if we couldn't find a clean spot
  if (attempts >= maxAttempts) {
    newX = maxX; // far side
    newY = maxY;
  }

  // Apply new position within the card
  noBtn.style.left = `${newX}px`;
  noBtn.style.top = `${newY}px`;

  setTimeout(() => {
    isRunning = false;
    noBtn.classList.remove("running");
  }, 150);
}

// Mouse proximity detection (only when card is visible)
if (cardScreen) {
  cardScreen.addEventListener("mousemove", (e) => {
    if (!cardScreen.classList.contains("hidden")) {
      moveNoButton(e.clientX, e.clientY);
    }
  });

  // Touch proximity detection
  cardScreen.addEventListener(
    "touchstart",
    (e) => {
      if (!cardScreen.classList.contains("hidden")) {
        const touch = e.touches[0];
        if (touch) moveNoButton(touch.clientX, touch.clientY);
      }
    },
    { passive: true }
  );

  cardScreen.addEventListener(
    "touchmove",
    (e) => {
      if (!cardScreen.classList.contains("hidden")) {
        const touch = e.touches[0];
        if (touch) moveNoButton(touch.clientX, touch.clientY);
      }
    },
    { passive: true }
  );
}

// ===============================
// Restart (go back to cover)
// ===============================
function restart() {
  showOnly(coverScreen);

  // Reset envelope animation
  if (envelope) envelope.classList.remove("opening");

  // Reset No button state/position
  if (noBtn) {
    noBtn.classList.remove("running");
    isRunning = false;
    // Put it back to CSS default (so it starts near its original place)
    noBtn.style.left = "";
    noBtn.style.top = "";
  }

  // Re-apply GIF srcs (useful if cache/DOM got weird)
  setResultGifs();
}

if (restartYes) restartYes.addEventListener("click", restart);
if (restartNo) restartNo.addEventListener("click", restart);

restartYes.addEventListener('click', restart);
restartNo.addEventListener('click', restart);
