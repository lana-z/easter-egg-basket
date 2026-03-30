let score = 0;
let round = 1;
const maxRounds = 3;
let eggsCollected = 0;
let eggsVisibleInterval = 3000; // 3 seconds
let visibilityInterval; 
let roundTimer;
let basketArea = {};

document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');
  const scoreDisplay = document.getElementById('score');
  const roundDisplay = document.getElementById('round');
  const timerDisplay = document.getElementById('timer');

  const eggs = document.querySelectorAll('.egg');
  const basket = document.getElementById('basket');
  const gameDiv = document.getElementById('game');
  const basketImg = document.getElementById('basket-img');

  basketImg.draggable = false;

  startButton.addEventListener('click', startGame);

  function startGame() {
    clearInterval(visibilityInterval);
    clearInterval(roundTimer);
    score = 0;
    round = 1;
    eggsCollected = 0;
    updateScoreboard();
    startButton.disabled = true;
    placeEggs();
    startRound();
  }

  function startRound() {
    clearInterval(visibilityInterval);
    visibilityInterval = setInterval(toggleEggVisibility, eggsVisibleInterval);
    startTimer(10); 
  }

  function startTimer(duration) {
    let timeLeft = duration;
    timerDisplay.textContent = `Time Left: ${timeLeft} seconds`; 
    roundTimer = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = `Time Left: ${timeLeft} seconds`;
      if (timeLeft <= 0) {
        clearInterval(roundTimer);
        clearInterval(visibilityInterval);
        round++;
        if (round > maxRounds) {
          endGame();
        } else {
          startNextRound();
        }
      }
    }, 1000);
  }

  function endGame() {
    clearInterval(visibilityInterval);
    clearInterval(roundTimer);
    startButton.disabled = false;
    alert('Game Over! Nice hunting, your score is: ' + score);
    score = 0; // Reset score
    round = 1; // Reset round
    updateScoreboard();
    eggs.forEach(egg => egg.style.display = 'none'); // Hide all eggs
  }

  function updateScoreboard() {
    scoreDisplay.textContent = `Score: ${score}`;
    roundDisplay.textContent = `Round: ${round}`;
  }

  function startNextRound() {
    eggsCollected = 0;
    placeEggs();
    startRound(); 
  }

  const candyImages = [
    '/assets/cadbury-creme-egg.png',
    '/assets/caramel-egg.png',
    '/assets/coconut-creme-egg.png',
    '/assets/cookies-and-cream-eggs.png',
    '/assets/dark-choc-bunny.png',
    '/assets/dream-bunny.png',
    '/assets/jelly-beans.png',
    '/assets/marshmallow-choc-bunny.png',
    '/assets/milk-choc-eggs.png',
    '/assets/peeps-rainbow-bunny.png',
    '/assets/peeps.png',
    '/assets/reeses-pb-egg.png',
    '/assets/robin-eggs.png',
    '/assets/sour-patch.png',
  ];

  function showCandy() {
    const randomIndex = Math.floor(Math.random() * candyImages.length);
    return candyImages[randomIndex];
  }

  // Store egg content associations
  const eggContents = {};

  function showModal(contentSrc) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeModal = document.createElement('span');
    closeModal.className = 'close';
    closeModal.innerHTML = '&times;';
    closeModal.onclick = () => modal.style.display = 'none';

    const contentImg = document.createElement('img');
    contentImg.src = contentSrc;
    contentImg.style.width = '100%';

    // Randomly position the modal
    const maxHeight = window.innerHeight - 240; // 240px is the modal height
    const maxWidth = window.innerWidth - 180; // 180px is the modal width
    const topPos = Math.random() * maxHeight;
    const leftPos = Math.random() * maxWidth;

    modal.style.top = `${topPos}px`;
    modal.style.left = `${leftPos}px`;

    modalContent.appendChild(closeModal);
    modalContent.appendChild(contentImg);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.style.display = 'block';

    window.onclick = (e) => {
      if (e.target == modal) {
        modal.style.display = 'none';
      }
    };
  }

  function calculateBasketArea() {
    const basketRect = basketImg.getBoundingClientRect();
    const gameRect = gameDiv.getBoundingClientRect();
    
    // Calculate basket area relative to the game div
    basketArea.top = basketRect.top - gameRect.top;
    basketArea.bottom = basketRect.bottom - gameRect.top;
    basketArea.height = basketRect.height;

    console.log("Basket area calculated: Top:", basketArea.top, "Bottom:", basketArea.bottom);
  }

  window.addEventListener('resize', function() {
    calculateBasketArea();
    console.log("Window resized, basket area recalculated."); 
  });

  // Randomly place eggs around the game div
  function placeEggs() {
    calculateBasketArea();
    eggs.forEach(egg => {
        let validPosition = false;
        let topPos, leftPos;
        while (!validPosition) {
            const maxHeight = gameDiv.offsetHeight - egg.offsetHeight;
            const maxWidth = gameDiv.offsetWidth - egg.offsetWidth;
            topPos = Math.random() * maxHeight;
            leftPos = Math.random() * maxWidth;
            if (topPos < basketArea.top || topPos > basketArea.bottom) {
              validPosition = true;
          } else {
              console.log("Egg position rejected:", topPos);
          }
        }
        egg.style.top = `${topPos}px`;
        egg.style.left = `${leftPos}px`;
        egg.style.display = 'none'; 
    });
  }

  function toggleEggVisibility() {
    eggs.forEach(egg => {
      setTimeout(() => {
        egg.style.display = egg.style.display === 'none' ? 'block' : 'none';
        if (egg.style.display === 'block') {
          const maxHeight = gameDiv.offsetHeight - egg.offsetHeight;
          const maxWidth = gameDiv.offsetWidth - egg.offsetWidth;
          const topPos = Math.random() * maxHeight;
          const leftPos = Math.random() * maxWidth;

          egg.style.top = `${topPos}px`;
          egg.style.left = `${leftPos}px`;

          // Make the egg draggable only when it is visible
          egg.setAttribute('draggable', true);

          // Adding dragstart event listener dynamically
          egg.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', e.target.id);
          });
        } else {
          // When egg is hidden, make it not draggable
          egg.setAttribute('draggable', false);
        }
      }, Math.random() * 2000 + 1000); // Random timeout between 1s and 3s for each egg
    });
  }

  basket.addEventListener('dragover', e => {
    e.preventDefault();
  });

  basket.addEventListener('drop', e => {
    e.preventDefault();
    const eggId = e.dataTransfer.getData('text/plain');
    const egg = document.getElementById(eggId);
    egg.style.display = 'none';

    const img = document.createElement('img');
    img.src = egg.src;
    img.classList.add('egg', 'basket-egg');
    img.style.position = 'relative'; // changes to relative after dropped into basket
    img.style.margin = "1px"; // margin between the eggs

    img.addEventListener('click', () => {
      if (!eggContents[img.id]) {
        eggContents[img.id] = showCandy();
      }

      showModal(eggContents[img.id]);

      eggsCollected++;
      score += 10; 
      if (eggsCollected >= eggs.length) {
        round++;
        if (round > maxRounds) {
          endGame();
        } else {
          startNextRound();
        }
      }
      updateScoreboard();
    });

    basket.appendChild(img);
  });

});