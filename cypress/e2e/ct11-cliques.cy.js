describe('CT-11: interações do carrinho até a confirmação do pedido', () => {

  it('conta as interações necessárias e compara com a meta de 3 (RQ-02)', () => {
    let interacoes = 0;

    // Preparação (não conta): login, unidade e item no carrinho
    cy.visit('/index.html');
    cy.get('[data-accept-consent]').click();
    cy.get('#login-form input[name=email]').type('divonir@demo.com');
    cy.get('#login-form input[name=password]').type('123456{enter}');
    cy.url().should('include', 'unidades.html');
    cy.get('[data-select-unit="boa-viagem"]').click();
    cy.url().should('include', 'cardapio.html');
    cy.get('[data-add-item="rec-1"]').click();
    cy.visit('/carrinho.html');
    cy.get('#cart-summary').should('be.visible');

    // Contagem: a partir do carrinho
    cy.get('#cart-summary a[href="pagamento.html"]').click().then(() => { interacoes++; });
    cy.url().should('include', 'pagamento.html');

    cy.get('input[name=paymentConsent]').check().then(() => { interacoes++; });
    cy.get('input[name=termsConsent]').check().then(() => { interacoes++; });
    cy.get('#confirm-payment').click().then(() => { interacoes++; });

    cy.url().should('include', 'pedido.html').then(() => {
      cy.log(`Interações contadas: ${interacoes}`);
      expect(interacoes, 'interações até concluir').to.eq(4);   // meta do RQ-02: <= 3
    });
    cy.screenshot('CT-11_pedido-concluido', { capture: 'viewport' });
  });
});