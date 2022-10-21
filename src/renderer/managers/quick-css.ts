const quickCSSElement = document.createElement('link');
quickCSSElement.rel = 'stylesheet';
quickCSSElement.href = 'replugged://quickcss/main.css';

export function load (): void {
  document.head.appendChild(quickCSSElement);
}

export function unload () :void {
  quickCSSElement.remove();
}
