export default () => {
  const iframe = document.createElement('iframe');
  Object.defineProperty(window, 'localStorage', {
    value: document.body.appendChild(iframe).contentWindow?.localStorage
  });
};
