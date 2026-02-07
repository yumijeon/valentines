// Initialize floating hearts
function createFloatingHearts() {
    const container = document.getElementById('heartsContainer');
    const heartCount = 12;
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = '💕';
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.top = `${Math.random() * 100}%`;
        heart.style.animationDelay = `${Math.random() * 8}s`;
        heart.style.animationDuration = `${6 + Math.random() * 4}s`;
        container.appendChild(heart);
    }
}

createFloatingHearts();

// Screen management
const coverScreen = document.getElementById('coverScreen');
const cardScreen = document.getElementById('cardScreen');
const resultYesScreen = document.getElementById('resultYesScreen');
const resultNoScreen = document.getElementById('resultNoScreen');
const envelope = document.getElementById('envelope');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const restartYes = document.getElementById('restartYes');
const restartNo = document.getElementById('restartNo');

// Envelope opening
envelope.addEventListener('click', () => {
    envelope.classList.add('opening');
    
    setTimeout(() => {
        coverScreen.classList.add('hidden');
        cardScreen.classList.remove('hidden');
    }, 520);
});

// Yes button
yesBtn.addEventListener('click', () => {
    cardScreen.classList.add('hidden');
    resultYesScreen.classList.remove('hidden');
});

// No button - runs away on proximity
let isRunning = false;
const proximityThreshold = 80; // pixels

function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function moveNoButton(cursorX, cursorY) {
    if (isRunning) return;
    
    const noBtnRect = noBtn.getBoundingClientRect();
    const noBtnCenterX = noBtnRect.left + noBtnRect.width / 2;
    const noBtnCenterY = noBtnRect.top + noBtnRect.height / 2;
    
    const distance = getDistance(cursorX, cursorY, noBtnCenterX, noBtnCenterY);
    
    if (distance < proximityThreshold) {
        isRunning = true;
        noBtn.classList.add('running');
        
        // Get card boundaries
        const card = document.querySelector('.card');
        const cardRect = card.getBoundingClientRect();
        const yesBtnRect = yesBtn.getBoundingClientRect();
        
        // Calculate safe area within card (with padding)
        const padding = 16;
        const minX = padding;
        const minY = padding + 80; // Account for message space
        const maxX = cardRect.width - noBtn.offsetWidth - padding;
        const maxY = cardRect.height - noBtn.offsetHeight - padding;
        
        // Yes button no-go zone (expanded by margin)
        const noGoMargin = 20;
        const yesNoGoLeft = yesBtnRect.left - cardRect.left - noGoMargin;
        const yesNoGoRight = yesBtnRect.right - cardRect.left + noGoMargin;
        const yesNoGoTop = yesBtnRect.top - cardRect.top - noGoMargin;
        const yesNoGoBottom = yesBtnRect.bottom - cardRect.top + noGoMargin;
        
        // Try to find a valid position
        let newX, newY;
        let attempts = 0;
        const maxAttempts = 20;
        
        do {
            newX = minX + Math.random() * (maxX - minX);
            newY = minY + Math.random() * (maxY - minY);
            attempts++;
            
            // Check if position overlaps with Yes button
            const overlapsYes = !(
                newX + noBtn.offsetWidth < yesNoGoLeft ||
                newX > yesNoGoRight ||
                newY + noBtn.offsetHeight < yesNoGoTop ||
                newY > yesNoGoBottom
            );
            
            if (!overlapsYes) break;
            
        } while (attempts < maxAttempts);
        
        // Fallback: if all attempts failed, place in bottom right
        if (attempts >= maxAttempts) {
            newX = maxX;
            newY = maxY;
        }
        
        // Apply new position
        noBtn.style.position = 'absolute';
        noBtn.style.left = `${newX}px`;
        noBtn.style.top = `${newY}px`;
        
        setTimeout(() => {
            isRunning = false;
            noBtn.classList.remove('running');
        }, 300);
    }
}

// Mouse proximity detection
cardScreen.addEventListener('mousemove', (e) => {
    if (!cardScreen.classList.contains('hidden')) {
        moveNoButton(e.clientX, e.clientY);
    }
});

// Touch proximity detection
cardScreen.addEventListener('touchstart', (e) => {
    if (!cardScreen.classList.contains('hidden')) {
        const touch = e.touches[0];
        moveNoButton(touch.clientX, touch.clientY);
    }
});

cardScreen.addEventListener('touchmove', (e) => {
    if (!cardScreen.classList.contains('hidden')) {
        const touch = e.touches[0];
        moveNoButton(touch.clientX, touch.clientY);
    }
});

// No button click (if caught)
noBtn.addEventListener('click', () => {
    cardScreen.classList.add('hidden');
    resultNoScreen.classList.remove('hidden');
});

// Restart buttons
function restart() {
    // Reset all screens
    coverScreen.classList.remove('hidden');
    cardScreen.classList.add('hidden');
    resultYesScreen.classList.add('hidden');
    resultNoScreen.classList.add('hidden');
    
    // Reset envelope
    envelope.classList.remove('opening');
    
    // Reset No button position
    noBtn.style.position = 'absolute';
    noBtn.style.left = '0';
    noBtn.style.top = '72px';
    isRunning = false;
}

restartYes.addEventListener('click', restart);
restartNo.addEventListener('click', restart);
