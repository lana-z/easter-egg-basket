document.addEventListener('DOMContentLoaded', () => {

  // ===== Asset Arrays =====
  const EGG_SRCS = [
    'assets/egg1.png', 'assets/egg2.png', 'assets/egg3.png', 'assets/egg4.png',
    'assets/egg5.png', 'assets/egg6.png', 'assets/egg7.png', 'assets/egg8.png',
  ];

  const CANDY_SRCS = [
    'assets/cadbury-creme-egg.png', 'assets/caramel-egg.png',
    'assets/coconut-creme-egg.png', 'assets/cookies-and-cream-eggs.png',
    'assets/dark-choc-bunny.png', 'assets/dream-bunny.png',
    'assets/jelly-beans.png', 'assets/marshmallow-choc-bunny.png',
    'assets/milk-choc-eggs.png', 'assets/peeps-rainbow-bunny.png',
    'assets/peeps.png', 'assets/reeses-pb-egg.png',
    'assets/robin-eggs.png', 'assets/sour-patch.png',
  ];

  // ===== Round Config =====
  const ROUNDS = [
    { duration: 8, visibleWindow: 1500, maxActive: 3, pointsPerEgg: 10 },
    { duration: 8, visibleWindow: 1000, maxActive: 4, pointsPerEgg: 20 },
    { duration: 8, visibleWindow: 800, maxActive: 5, pointsPerEgg: 30 },
  ];

  const CLEAN_SWEEP_BONUS = 50;
  const COMBO_WINDOW_MS = 1000;

  // ===== DOM Refs =====
  const gameArea = document.getElementById('game');
  const startScreen = document.getElementById('start-screen');
  const startButton = document.getElementById('start-button');
  const hud = document.getElementById('hud');
  const hudScore = document.getElementById('hud-score');
  const hudRound = document.getElementById('hud-round');
  const hudTimer = document.getElementById('hud-timer');
  const hudCombo = document.getElementById('hud-combo');
  const roundBanner = document.getElementById('round-banner');
  const roundBannerText = document.getElementById('round-banner-text');
  const basketImg = document.getElementById('basket-img');
  const candyCollection = document.getElementById('candy-collection');
  const gameOverScreen = document.getElementById('game-over');
  const finalScoreEl = document.getElementById('final-score');
  const eggsCollectedCountEl = document.getElementById('eggs-collected-count');
  const candyFoundLabel = document.getElementById('candy-found-label');
  const candyGrid = document.getElementById('candy-grid');
  const playAgainButton = document.getElementById('play-again-button');
  const finishButton = document.getElementById('finish-button');
  const finalScreen = document.getElementById('final-screen');
  const howToPlayLinks = document.querySelectorAll('.how-to-play-link');
  const howToPlayOverlay = document.getElementById('how-to-play');
  const howToPlayClose = document.getElementById('how-to-play-close');
  const startHighScore = document.getElementById('start-high-score');
  const gameOverHighScore = document.getElementById('game-over-high-score');

  // ===== High Score =====
  function getHighScore() {
    return parseInt(localStorage.getItem('easterEggHuntHighScore') || '0', 10);
  }

  function updateHighScore(score) {
    const high = getHighScore();
    if (score > high) {
      localStorage.setItem('easterEggHuntHighScore', score);
      return true;
    }
    return false;
  }

  function displayHighScore() {
    const high = getHighScore();
    if (high > 0) {
      startHighScore.textContent = `Your best: ${high}`;
      startHighScore.classList.remove('hidden');
    } else {
      startHighScore.classList.add('hidden');
    }
  }

  // Show high score on load
  displayHighScore();

  // ===== Game State =====
  let state = {};

  function resetState() {
    state = {
      score: 0,
      round: 0,
      totalEggsCollected: 0,
      eggsCollectedThisRound: 0,
      totalEggsSpawnedThisRound: 0,
      collectedCandies: [],
      uniqueCandies: new Set(),
      comboMultiplier: 1,
      lastCollectTime: 0,
      timeLeft: 0,
      activeEggs: [],
      isPlaying: false,
      roundTimerInterval: null,
      spawnInterval: null,
    };
  }

  // ===== Init =====
  startButton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    startGame();
  });

  playAgainButton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    startGame();
  });

  howToPlayLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      howToPlayOverlay.classList.remove('hidden');
    });
  });

  howToPlayClose.addEventListener('click', (e) => {
    e.preventDefault();
    howToPlayOverlay.classList.add('hidden');
  });

  function showCandyDetail(src) {
    const overlay = document.createElement('div');
    overlay.id = 'candy-detail';
    const img = document.createElement('img');
    img.id = 'candy-detail-img';
    img.src = src;
    img.alt = 'Candy';
    const name = document.createElement('p');
    name.id = 'candy-detail-name';
    name.textContent = candyNameFromSrc(src);
    overlay.appendChild(img);
    overlay.appendChild(name);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => {
      overlay.remove();
    });
  }

  const CANDY_NAMES = {
    'assets/cadbury-creme-egg.png': 'Cadbury Creme Egg',
    'assets/caramel-egg.png': 'Caramel Egg',
    'assets/coconut-creme-egg.png': 'Coconut Creme Egg',
    'assets/cookies-and-cream-eggs.png': 'Cookies and Cream Eggs',
    'assets/dark-choc-bunny.png': 'Dark Chocolate Bunny',
    'assets/dream-bunny.png': 'Dream Bunny',
    'assets/jelly-beans.png': 'Jelly Beans',
    'assets/marshmallow-choc-bunny.png': 'Marshmallow Chocolate Bunny',
    'assets/milk-choc-eggs.png': 'Milk Chocolate Eggs',
    'assets/peeps-rainbow-bunny.png': 'Peeps Rainbow Bunny',
    'assets/peeps.png': 'Peeps',
    'assets/reeses-pb-egg.png': "Reese's Peanut Butter Egg",
    'assets/robin-eggs.png': 'Robin Eggs',
    'assets/sour-patch.png': 'Sour Patch',
  };

  function candyNameFromSrc(src) {
    return CANDY_NAMES[src] || src.replace('assets/', '').replace('.png', '');
  }

  finishButton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    gameOverScreen.classList.add('hidden');
    finalScreen.classList.remove('hidden');
  });

  // ===== Game Flow =====
  function startGame() {
    resetState();
    state.isPlaying = true;

    // Reset UI
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    finalScreen.classList.add('hidden');
    howToPlayOverlay.classList.add('hidden');
    hud.classList.remove('hidden');
    candyCollection.innerHTML = '';
    document.body.style.overflow = 'hidden';

    startRound();
  }

  function startRound() {
    const config = ROUNDS[state.round];
    state.eggsCollectedThisRound = 0;
    state.totalEggsSpawnedThisRound = 0;
    state.timeLeft = config.duration;

    // Clear any leftover eggs
    clearActiveEggs();

    updateHUD();

    // Show round banner
    showRoundBanner(state.round + 1, () => {
      // Start spawning and timer after banner
      scheduleSpawns();
      startRoundTimer();
    });
  }

  function startRoundTimer() {
    const config = ROUNDS[state.round];
    state.timeLeft = config.duration;
    updateHUD();

    state.roundTimerInterval = setInterval(() => {
      state.timeLeft--;
      updateHUD();

      if (state.timeLeft <= 5) {
        hudTimer.classList.add('danger');
      }

      if (state.timeLeft <= 0) {
        endRound();
      }
    }, 1000);
  }

  function endRound() {
    clearInterval(state.roundTimerInterval);
    clearInterval(state.spawnInterval);
    state.roundTimerInterval = null;
    state.spawnInterval = null;
    hudTimer.classList.remove('danger');

    // Despawn remaining eggs
    clearActiveEggs();

    state.round++;
    if (state.round >= ROUNDS.length) {
      showGameOver();
    } else {
      startRound();
    }
  }

  function showGameOver() {
    state.isPlaying = false;
    hud.classList.add('hidden');
    document.body.style.overflow = '';

    // Populate game over screen
    finalScoreEl.textContent = `Score: ${state.score}`;
    eggsCollectedCountEl.textContent = `Eggs collected: ${state.totalEggsCollected}`;
    candyFoundLabel.textContent = `Candy Found: ${state.uniqueCandies.size} / ${CANDY_SRCS.length}`;

    // High score
    const isNew = updateHighScore(state.score);
    const high = getHighScore();
    if (isNew) {
      gameOverHighScore.textContent = `New best: ${high}!`;
    } else {
      gameOverHighScore.textContent = `Your best: ${high}`;
    }
    gameOverHighScore.classList.remove('hidden');
    displayHighScore();

    // Build candy grid
    candyGrid.innerHTML = '';
    CANDY_SRCS.forEach(src => {
      const slot = document.createElement('div');
      slot.className = 'candy-slot';
      const found = state.uniqueCandies.has(src);
      if (!found) {
        slot.classList.add('not-found');
      }
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Candy';
      slot.appendChild(img);
      if (found) {
        slot.addEventListener('click', () => {
          showCandyDetail(src);
        });
      }
      candyGrid.appendChild(slot);
    });

    gameOverScreen.classList.remove('hidden');
  }

  // ===== Egg Spawning =====
  function scheduleSpawns() {
    const config = ROUNDS[state.round];
    // Spawn first egg immediately
    spawnEgg();

    // Stagger subsequent spawns
    const interval = Math.max(config.visibleWindow / config.maxActive, 400);
    state.spawnInterval = setInterval(() => {
      if (state.activeEggs.length < config.maxActive) {
        spawnEgg();
      }
    }, interval);
  }

  function spawnEgg() {
    if (!state.isPlaying) return;

    const config = ROUNDS[state.round];
    const egg = document.createElement('img');
    egg.src = EGG_SRCS[Math.floor(Math.random() * EGG_SRCS.length)];
    egg.className = 'egg';
    egg.alt = 'Easter egg';
    egg.draggable = false;

    // Random position avoiding edges
    const eggW = 60;
    const eggH = 80;
    const padding = 10;
    const maxLeft = gameArea.offsetWidth - eggW - padding;
    const maxTop = gameArea.offsetHeight - eggH - padding;
    egg.style.left = `${padding + Math.random() * maxLeft}px`;
    egg.style.top = `${padding + Math.random() * maxTop}px`;

    // Collect on tap
    egg.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      collectEgg(egg, e);
    });

    gameArea.appendChild(egg);
    state.activeEggs.push(egg);
    state.totalEggsSpawnedThisRound++;

    // Auto-despawn after visible window
    const despawnTimer = setTimeout(() => {
      despawnEgg(egg);
    }, config.visibleWindow);

    egg._despawnTimer = despawnTimer;
  }

  function despawnEgg(egg) {
    if (!egg.parentNode || egg.classList.contains('collected')) return;

    clearTimeout(egg._despawnTimer);
    egg.classList.add('despawning');

    egg.addEventListener('animationend', () => {
      removeEgg(egg);
    }, { once: true });
  }

  function removeEgg(egg) {
    if (egg.parentNode) egg.parentNode.removeChild(egg);
    state.activeEggs = state.activeEggs.filter(e => e !== egg);
  }

  function clearActiveEggs() {
    state.activeEggs.forEach(egg => {
      clearTimeout(egg._despawnTimer);
      if (egg.parentNode) egg.parentNode.removeChild(egg);
    });
    state.activeEggs = [];
  }

  // ===== Collection =====
  function collectEgg(egg, event) {
    if (egg.classList.contains('collected') || egg.classList.contains('despawning')) return;

    egg.classList.add('collected');
    clearTimeout(egg._despawnTimer);

    const config = ROUNDS[state.round];

    // Combo logic
    const now = Date.now();
    if (now - state.lastCollectTime < COMBO_WINDOW_MS) {
      state.comboMultiplier = Math.min(state.comboMultiplier + 1, 3);
    } else {
      state.comboMultiplier = 1;
    }
    state.lastCollectTime = now;

    // Score
    const points = config.pointsPerEgg * state.comboMultiplier;
    state.score += points;
    state.totalEggsCollected++;
    state.eggsCollectedThisRound++;

    // Show score popup
    const rect = egg.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    const popupX = rect.left - gameRect.left + rect.width / 2;
    const popupY = rect.top - gameRect.top;
    showScorePopup(popupX, popupY, points, state.comboMultiplier);

    // Pick candy
    const candy = CANDY_SRCS[Math.floor(Math.random() * CANDY_SRCS.length)];
    state.collectedCandies.push(candy);
    state.uniqueCandies.add(candy);

    // Animate egg collection (shrink and fade)
    egg.style.transition = 'transform 0.4s ease-in, opacity 0.4s ease-in';
    egg.style.transform = 'scale(0.2)';
    egg.style.opacity = '0';

    setTimeout(() => {
      removeEgg(egg);
      addCandyToBasket(candy);
    }, 400);

    updateHUD();

    // Check clean sweep
    if (state.eggsCollectedThisRound >= state.totalEggsSpawnedThisRound &&
        state.activeEggs.filter(e => !e.classList.contains('collected')).length === 0) {
      // All currently spawned eggs collected — keep going, the round continues via timer
    }
  }

  function showScorePopup(x, y, points, multiplier) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    let text = `+${points}`;
    if (multiplier > 1) text += ` x${multiplier}`;
    popup.textContent = text;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    gameArea.appendChild(popup);

    popup.addEventListener('animationend', () => {
      if (popup.parentNode) popup.parentNode.removeChild(popup);
    }, { once: true });
  }

  function addCandyToBasket(candySrc) {
    const img = document.createElement('img');
    img.src = candySrc;
    img.alt = 'Candy';
    candyCollection.appendChild(img);

    // Bounce basket
    basketImg.classList.remove('bounce');
    void basketImg.offsetWidth; // force reflow
    basketImg.classList.add('bounce');
  }

  // ===== Round Banner =====
  function showRoundBanner(roundNum, callback) {
    roundBannerText.textContent = roundNum <= ROUNDS.length ? `Round ${roundNum}` : 'Final Round!';
    roundBanner.classList.remove('hidden');

    // Reset animation
    roundBannerText.style.animation = 'none';
    void roundBannerText.offsetWidth;
    roundBannerText.style.animation = '';

    setTimeout(() => {
      roundBanner.classList.add('hidden');
      if (callback) callback();
    }, 1500);
  }

  // ===== HUD =====
  function updateHUD() {
    hudScore.textContent = `Score: ${state.score}`;
    hudRound.textContent = `Round ${state.round + 1} of ${ROUNDS.length}`;
    hudTimer.textContent = `Time: ${state.timeLeft}s`;

    if (state.comboMultiplier > 1) {
      hudCombo.textContent = `x${state.comboMultiplier}`;
      hudCombo.classList.remove('hidden');
    } else {
      hudCombo.classList.add('hidden');
    }
  }

});
