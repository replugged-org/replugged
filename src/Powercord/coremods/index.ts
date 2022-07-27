import coremods from './registry';
// eslint-disable-next-line @typescript-eslint/ban-types
const unloadFuncs: Function[] = [];

export async function load () {
  for (const mod of coremods) {
    try {
      const unload = await mod();
      if (typeof unload === 'function') {
        unloadFuncs.push(unload);
      }
    } catch (e) {
      console.error(e); // Stronger logging + warning
    }
  }
}
export function unload () {
  return Promise.all(unloadFuncs.map(f => f()));
}
