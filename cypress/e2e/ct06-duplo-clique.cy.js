describe('CT-06: duplo clique em Confirmar pagamento', () => {

  it('gera apenas 1 pedido e credita os pontos uma vez', () => {
    // Login
    cy.visit('/index.html');
    cy.get('[data-accept-consent]').click();
    cy.get('#login-form input[name=email]').type('divonir@demo.com');
    cy.get('#login-form input[name=password]').type('123456{enter}');
    cy.url().should('include', 'unidades.html');

    // Unidade e item
    cy.get('[data-select-unit="boa-viagem"]').click();
    cy.url().should('include', 'cardapio.html');
    cy.get('[data-add-item="rec-1"]').click();

    // Carrinho
    cy.visit('/carrinho.html');
    cy.get('#cart-summary a[href="pagamento.html"]').click();
    cy.url().should('include', 'pagamento.html');

    // Pagamento: consentimentos e duplo clique
    cy.get('input[name=paymentConsent]').check();
    cy.get('input[name=termsConsent]').check();
    cy.get('#confirm-payment').dblclick();

    // O botão muda de estado logo após o primeiro clique
    cy.get('#confirm-payment').should('be.disabled');
    cy.screenshot('CT-06_botao-bloqueado', { capture: 'viewport' });

    // Aguarda o redirecionamento (o mock leva 1,2 s)
    cy.url().should('include', 'pedido.html');

    // Verificação: 1 pedido e pontos creditados uma única vez
    cy.window().then((win) => {
      const pedidos = JSON.parse(win.localStorage.getItem('raizes.orders'));
      expect(pedidos).to.have.length(1);

      const fidelidade = JSON.parse(win.localStorage.getItem('raizes.loyalty'));
      expect(fidelidade.points).to.eq(120 + pedidos[0].pointsEarned);
    });
  });
});