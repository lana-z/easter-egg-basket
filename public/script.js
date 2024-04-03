document.addEventListener('DOMContentLoaded', () => {
  const eggs = document.querySelectorAll('.egg');
  const basket = document.getElementById('basket');

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
      if (!eggContents[img.id]) {
        eggContents[img.id] = showCandy();
      }

      showModal(eggContents[img.id]);
    });

    basket.appendChild(img);
  });
});