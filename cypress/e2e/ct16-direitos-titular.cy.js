describe('CT-16: direitos do titular (exportar e excluir dados locais)', () => {

  // Antes de cada teste: login e um pedido concluído, para haver dados a exportar
  beforeEach(() => {
    cy.loginDemo();
    cy.get('[data-select-unit="boa-viagem"]').click();
    cy.url().should('include', 'cardapio.html');
    cy.get('[data-add-item="rec-1"]').click();
    cy.visit('/carrinho.html');
    cy.get('#cart-summary a[href="pagamento.html"]').click();
    cy.url().should('include', 'pagamento.html');
    cy.get('input[name=paymentConsent]').check();
    cy.get('input[name=termsConsent]').check();
    cy.get('#confirm-payment').click();
    cy.url().should('include', 'pedido.html');
  });

  it('CT-16a: exporta os dados do titular na tela', () => {
    cy.visit('/perfil.html');
    cy.get('#profile-data-export').should('not.be.visible');   // escondido até exportar
    cy.get('#export-data').click();

    cy.get('#profile-data-export').should('be.visible');
    cy.get('#profile-data-export').should('contain', '"orders"');
    cy.get('#profile-data-export').should('contain', '"loyalty"');
    cy.get('#profile-data-export').should('contain', '"consent"');
    cy.screenshot('CT-16a_exportacao', { capture: 'viewport' });
  });

  it('CT-16b: a exportação inclui a senha em texto puro (D-04)', () => {
    cy.visit('/perfil.html');
    cy.get('#export-data').click();
    cy.get('#profile-data-export').should('contain', '"password": "123456"');
    cy.screenshot('CT-16b_senha-na-exportacao', { capture: 'viewport' });
  });

  it('CT-16c: a exclusão apaga pedidos e recria uma sessão de visitante (D-05, D-13)', () => {
    cy.visit('/perfil.html');

    // O sistema pede confirmação com window.confirm; o Cypress aceita sozinho
    cy.on('window:confirm', (texto) => {
      expect(texto).to.contain('limpar os dados locais');
    });
    cy.get('#clear-data').click();

    // A página recarrega; conferimos o resultado no armazenamento local
    cy.window().should((win) => {
      expect(win.localStorage.getItem('raizes.orders')).to.eq(null);
      const sessao = JSON.parse(win.localStorage.getItem('raizes.session'));
      expect(sessao.id).to.eq('guest');
      expect(sessao.name).to.eq('Divonir Fagundes');    // dado pessoal fixo recriado
    });
    cy.screenshot('CT-16c_apos-exclusao', { capture: 'viewport' });
  });
});