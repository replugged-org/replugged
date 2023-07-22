/**
 * Loads a stylesheet into the document
 * @param path Path to the stylesheet
 * @returns Link element
 */
export const loadStyleSheet = (path: string): HTMLLinkElement => {
  const el = document.createElement("link");
  el.rel = "stylesheet";
  el.href = `${path}?t=${Date.now()}`;
  document.head.appendChild(el);

  return el;
};
