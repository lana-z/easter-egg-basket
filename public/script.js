document.addEventListener('DOMContentLoaded', () => {
  const eggs = document.querySelectorAll('.egg');
  const basket = document.getElementById('basket');
  const modal = document.getElementById('egg-modal');
  const modalContent = document.getElementById('egg-content');
  const closeModal = document.querySelector('.close');

  const candyImages = [
    'assets/cadbury-creme-egg.png',
    'assets/caramel-egg.png',
    'assets/coconut-creme-egg.png',
    'assets/cookies-and-cream-eggs.png',
    'assets/dark-choc-bunny.png',
    'assets/dream-bunny.png',
    'assets/jelly-beans.png',
    'assets/marshmallow-choc-bunny.png',
    'assets/milk-choc-eggs.png',
    'assets/peeps-rainbow-bunny.png',
    'assets/peeps.png',
    'assets/reeses-pb-egg.png',
    'assets/robin-eggs.png',
    'assets/sour-patch.png',
  ];

  function showCandy() {
    const randomIndex = Math.floor(Math.random() * candyImages.length);
    return candyImages[randomIndex];
  }

  eggs.forEach(egg => {
    egg.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', e.target.id);
    });
  });

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
    img.id = egg.id + '-in-basket';

    img.addEventListener('click', () => {
      modal.style.display = "block";
      modalContent.innerHTML = `<img src="${showCandy()}" alt="Candy" style="width:100%;">`;
    });

    basket.appendChild(img);
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = "none";
  });

  window.addEventListener('click', e => {
    if (e.target == modal) {
      modal.style.display = "none";
    }
  });
});
