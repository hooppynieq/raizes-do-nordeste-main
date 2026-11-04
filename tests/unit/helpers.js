function carregarApp() {
  jest.resetModules();
  localStorage.clear();
  document.body.innerHTML = '';
  require('../../js/mock.js');   // precisa vir antes do app.js
  require('../../js/app.js');
  const app = window.RaizesApp;
  app.ensureSeedData();          // o que o init() faria no navegador
  return app;
}
module.exports = { carregarApp };