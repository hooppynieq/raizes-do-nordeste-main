describe('CT-01: checkout com pagamento simulado aprovado', () => {

  it('cliente faz login, monta o pedido, paga e vê o pedido confirmado', () => {
    // 1) Login (conta de demonstração do README)
    cy.visit('/index.html');
    cy.get('[data-accept-consent]').click();            // fecha o banner LGPD que cobre a tela
    cy.get('#login-form input[name=email]').type('divonir@demo.com');
    cy.get('#login-form input[name=password]').type('123456');
    cy.get('#login-form button[type=submit]').click();

    // 2) Unidade
    cy.url().should('include', 'unidades.html');
    cy.get('[data-select-unit="boa-viagem"]').click();

    // 3) Cardápio -> carrinho
    cy.url().should('include', 'cardapio.html');
    cy.get('[data-add-item="rec-1"]').click();           // Baião Cremoso, R$ 36,90
    cy.contains('a', 'Ver carrinho').click();

    // 4) Carrinho: o usuário Divonir usa delivery, então há frete de R$ 7,90
    cy.url().should('include', 'carrinho.html');
    cy.contains('44,80');                                // total = 36,90 + 7,90
    cy.get('#cart-summary').should('be.visible');
    cy.screenshot('CT-01_carrinho', { capture: 'viewport' });
    cy.get('#cart-summary a[href="pagamento.html"]').click();

    // 5) Pagamento: marca os dois consentimentos e confirma
    cy.url().should('include', 'pagamento.html');
    cy.get('input[name=paymentConsent]').check();
    cy.get('input[name=termsConsent]').check();
    cy.get('#confirm-payment').click();

    // 6) Pedido confirmado (o mock espera 1,2 s)
    cy.url().should('include', 'pedido.html');
    cy.contains('Pedido confirmado');
    cy.get('#order-details').should('be.visible');
    cy.screenshot('CT-01_pedido-confirmado', { capture: 'viewport' });
    cy.contains('Pontos gerados');
    cy.screenshot('CT-01_pedido-confirmado');
  });
});