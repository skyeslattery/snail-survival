// js/input.js
export let isLeftPressed = false;
export let isRightPressed = false;
export let dashTriggered = false;
export let shieldTriggered = false;

export function setupInputListeners() {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      isLeftPressed = true;
    } else if (event.key === 'ArrowRight') {
      isRightPressed = true;
    } else if (event.code === 'KeyZ') {
      dashTriggered = true;
    } else if (event.code === 'KeyX') {
      shieldTriggered = true;
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft') {
      isLeftPressed = false;
    } else if (event.key === 'ArrowRight') {
      isRightPressed = false;
    } else if (event.code === 'KeyZ') {
      dashTriggered = false;
    } else if (event.code === 'KeyX') {
      shieldTriggered = false;
    }
  });
}
