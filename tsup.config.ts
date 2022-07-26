import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    injector: './injectors/index.ts',
    patcher: './src/patcher.js',
    preload: './src/preload.js',
    preloadSplash: './src/preloadSplash.js',
    style: './src/Powercord/managers/style.css',
    serialize: './src/fake_node_modules/powercord/webpack/serialize.js',
    proxy: './src/fake_node_modules/powercord/webpack/proxy.js',
  },
  outDir: 'dist',
  clean: true,
  external: [ 'electron'],
  noExternal: [ 'fix-path' ],
  loader: {
    '.pem': 'file'
  }
});
