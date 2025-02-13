import { updateTomatoDisplay } from './game.js';
export function setupShop() {
  const shopItems = document.querySelectorAll('.shop-item');
  // Retrieve persistent ownership data
  let ownedSkins = JSON.parse(localStorage.getItem('ownedSkins')) || [];
  let ownedBackgrounds = JSON.parse(localStorage.getItem('ownedBackgrounds')) || [];
  
  shopItems.forEach(item => {
    const imgElement = item.querySelector('img'); // product image
    const imgSrc = imgElement.getAttribute('src');
    const costElem = item.querySelector('p');
    // Assuming the tomato icon is the second image in the shop-item
    const tomatoIconElem = item.querySelectorAll('img')[1];
    const priceText = costElem.innerText;
    const priceMatch = priceText.match(/(\d+)/);
    const price = priceMatch ? parseInt(priceMatch[1]) : 0;
    
    // Determine type based on image source.
    let type = '';
    if (imgSrc.includes('snail')) {
      type = 'skin';
    } else if (imgSrc.includes('background')) {
      type = 'background';
    }
    item.dataset.type = type;
    item.classList.add(type);
    
    // If already owned, mark as owned and hide cost and tomato icon.
    if ((type === 'skin' && ownedSkins.includes(imgSrc)) ||
        (type === 'background' && ownedBackgrounds.includes(imgSrc))) {
      item.classList.add('owned');
      costElem.style.display = 'none';
      tomatoIconElem.style.display = 'none';
      if ((type === 'skin' && localStorage.getItem('currentSkin') === imgSrc) ||
          (type === 'background' && localStorage.getItem('currentBackground') === imgSrc)) {
        item.classList.add('applied');
      }
    }
    
    item.addEventListener('click', () => {
      if (item.classList.contains('owned')) {
        if (type === 'skin') {
          localStorage.setItem('currentSkin', imgSrc);
          document.dispatchEvent(new CustomEvent('skinPurchased', { detail: imgSrc }));
        } else if (type === 'background') {
          localStorage.setItem('currentBackground', imgSrc);
          document.dispatchEvent(new CustomEvent('backgroundPurchased', { detail: imgSrc }));
        }
        document.querySelectorAll(`.shop-item.${type}`).forEach(el => el.classList.remove('applied'));
        item.classList.add('applied');
        return;
      }
      
      let tomatoCount = Number(localStorage.getItem('tomatoCount')) || 0;
      if (tomatoCount < price) {
        return;
      }
      
      tomatoCount -= price;
      localStorage.setItem('tomatoCount', tomatoCount);
      updateTomatoDisplay();
      
      if (type === 'skin') {
        ownedSkins.push(imgSrc);
        localStorage.setItem('ownedSkins', JSON.stringify(ownedSkins));
        localStorage.setItem('currentSkin', imgSrc);
        document.dispatchEvent(new CustomEvent('skinPurchased', { detail: imgSrc }));
      } else if (type === 'background') {
        ownedBackgrounds.push(imgSrc);
        localStorage.setItem('ownedBackgrounds', JSON.stringify(ownedBackgrounds));
        localStorage.setItem('currentBackground', imgSrc);
        document.dispatchEvent(new CustomEvent('backgroundPurchased', { detail: imgSrc }));
      }
      
      item.classList.add('owned', 'applied');
      costElem.style.display = 'none';
      tomatoIconElem.style.display = 'none';
      document.querySelectorAll(`.shop-item.${type}`).forEach(el => {
        if (el !== item) el.classList.remove('applied');
      });
    });
  });
}
