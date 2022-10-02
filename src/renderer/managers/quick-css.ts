const quickCSSElement = document.createElement('link');
quickCSSElement.rel = 'stylesheet';
quickCSSElement.href = 'replugged://quickcss/main.css';

export function load () {
  document.head.appendChild(quickCSSElement);
}

export function unload () {
  quickCSSElement?.remove();
}

export function reload () {
  unload();
  load();
}
