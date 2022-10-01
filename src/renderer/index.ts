import * as webpack from './modules/webpack';

window.replugged = {
  webpack
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => webpack.loadWebpackModules());
} else {
  webpack.loadWebpackModules();
}
