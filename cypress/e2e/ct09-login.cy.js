describe('CT-09: login inválido e controle de acesso', () => {

  function tentarLogin(email, senha) {
    cy.get('#login-form input[name=email]').clear();
    cy.get('#login-form input[name=email]').type(email);
    cy.get('#login-form input[name=password]').clear();
    cy.get('#login-form input[name=password]').type(senha);
    cy.get('#login-form button[type=submit]').click();
  }

  beforeEach(() => {
    cy.visit('/index.html');
    cy.get('[data-accept-consent]').click();     // fecha o banner que cobre a tela
  });

  it('CT-09a: senha errada mostra aviso e não cria sessão', () => {
    tentarLogin('divonir@demo.com', 'senha-errada');

    cy.get('#app-toast').should('have.class', 'is-visible');
    cy.get('#app-toast').should('contain', 'Senha inválida');
    cy.screenshot('CT-09a_senha-invalida', { capture: 'viewport' });

    cy.url().should('include', 'index.html');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('raizes.session')).to.eq(null);
    });
  });

  it('CT-09b: e-mail inexistente mostra mensagem diferente (D-11)', () => {
    tentarLogin('naoexiste@demo.com', 'qualquer1');

    cy.get('#app-toast').should('contain', 'Conta não encontrada');
    cy.screenshot('CT-09b_conta-inexistente', { capture: 'viewport' });
  });

  it('CT-09c: 5 erros seguidos não bloqueiam a conta (D-10)', () => {
    for (let i = 1; i <= 5; i++) {
      tentarLogin('divonir@demo.com', `errada${i}`);
      cy.get('#app-toast').should('contain', 'Senha inválida');
    }

    // Com a senha correta, o login ainda funciona: não houve bloqueio
    tentarLogin('divonir@demo.com', '123456');
    cy.url().should('include', 'unidades.html');
  });

  it('CT-09d: o painel admin abre sem login (D-07)', () => {
    cy.visit('/admin.html');
    cy.contains('h1', 'Visão operacional da rede');
    cy.get('#admin-stats').should('be.visible');
    cy.screenshot('CT-09d_admin-sem-login', { capture: 'viewport' });
  });

  it('CT-09e: cliente comum também acessa o painel admin (D-07)', () => {
    tentarLogin('divonir@demo.com', '123456');            // perfil "customer"
    cy.url().should('include', 'unidades.html');

    cy.visit('/admin.html');
    cy.contains('h1', 'Visão operacional da rede');
    cy.screenshot('CT-09e_admin-como-cliente', { capture: 'viewport' });
  });
});