document.addEventListener('DOMContentLoaded', () => {
    const eggs = document.querySelectorAll('.egg');
    const basket = document.getElementById('basket');
  
    eggs.forEach(egg => {
      egg.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', e.target.id); // Pass the egg id
      });
    });
  
    basket.addEventListener('dragover', e => {
      e.preventDefault(); 
    });
  
    basket.addEventListener('drop', e => {
      e.preventDefault();
      const eggId = e.dataTransfer.getData('text/plain');
      const egg = document.getElementById(eggId);
  
      // Egg no longer shows at original location
      egg.style.display = 'none';
  
      // Clone egg for inside basket
      const img = document.createElement('img');
      img.src = egg.src;
      img.classList.add('egg', 'basket-egg'); // Keep both classes to maintain size and add basket-specific styling
      img.id = egg.id + '-in-basket'; // Give cloned egg unique id
      basket.appendChild(img); // Append cloned egg image to basket
    });
});
