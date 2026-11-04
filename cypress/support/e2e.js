Cypress.Commands.add('loginDemo', () => {
  cy.visit('/index.html');
  cy.get('[data-accept-consent]').click();
  cy.get('#login-form input[name=email]').type('divonir@demo.com');
  cy.get('#login-form input[name=password]').type('123456{enter}');
  cy.url().should('include', 'unidades.html');
});