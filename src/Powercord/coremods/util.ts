import { createElement } from 'powercord/util';
import { resolveCompiler } from 'powercord/compilers';

export function loadStyle (file: string) {
  const id = Math.random().toString(36).slice(2);
  const style = createElement('style', {
    id: `style-coremod-${id}`,
    'data-powercord': true,
    'data-coremod': true
  });

  document.head.appendChild(style);
  const compiler = resolveCompiler(file);

  if (!compiler) {
    throw new Error(`Could not find compiler for ${file}`);
  }

  const result = compiler.compile();

  if (result instanceof Promise) {
    result.then(css => (style.innerHTML = css));
  } else {
    style.innerHTML = result;
  }


  return id;
}
export function unloadStyle (id: string) {
  const el = document.getElementById(`style-coremod-${id}`);
  if (el) {
    el.remove();
  }
}
