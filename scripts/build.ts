import esbuild from 'esbuild';
import path from 'path';

const NODE_VERSION = '14';
const CHROME_VERSION = '91';

const watch = process.argv.includes('--watch');

const common: esbuild.BuildOptions = {
  absWorkingDir: path.join(__dirname, '..'),
  bundle: true,
  minify: false,
  sourcemap: true,
  format: 'cjs' as esbuild.Format,
  logLevel: 'info',
  watch
};

Promise.all([
// Main
  esbuild.build({
    ...common,
    entryPoints: [ 'src/main/index.ts' ],
    platform: 'node',
    target: `node${NODE_VERSION}`,
    outfile: 'dist/main.js',
    external: [ 'electron' ]
  }),
  // Preload
  esbuild.build({
    ...common,
    entryPoints: [ 'src/preload.ts' ],
    platform: 'node',
    target: [ `node${NODE_VERSION}`, `chrome${CHROME_VERSION}` ],
    outfile: 'dist/preload.js',
    external: [ 'electron' ]
  }),
  // Renderer
  esbuild.build({
    ...common,
    entryPoints: [ 'src/renderer/index.ts' ],
    platform: 'browser',
    target: `chrome${CHROME_VERSION}`,
    outfile: 'dist/renderer.js'
  })
]);
