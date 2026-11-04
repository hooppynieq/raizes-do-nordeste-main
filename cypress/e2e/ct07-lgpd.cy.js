describe('CT-07: consentimento LGPD no cadastro', () => {

  // Preenche tudo, menos o consentimento, para isolar a causa do bloqueio
  function preencherCadastro(email) {
    cy.get('#register-form input[name=name]').type('Cliente Teste');
    cy.get('#register-form input[name=email]').type(email);
    cy.get('#register-form input[name=phone]').type('(19) 99999-0000');
    cy.get('#register-form input[name=password]').type('senha123');   // 6+ caracteres
  }

  beforeEach(() => {
    cy.visit('/cadastro.html');
  });

  it('CT-07a: consentimento e marketing iniciam desmarcados', () => {
    cy.get('#register-form input[name=consent]').should('not.be.checked');
    cy.get('#register-form input[name=marketing]').should('not.be.checked');
  });

  it('CT-07b: sem aceitar o consentimento, o cadastro é bloqueado', () => {
    preencherCadastro('semaceite@demo.com');
    cy.get('#register-form button[type=submit]').click();

    // Continua na mesma página
    cy.url().should('include', 'cadastro.html');

    // O navegador marcou o campo como inválido (campo obrigatório vazio)
    cy.get('#register-form input[name=consent]').then(($campo) => {
      expect($campo[0].validity.valueMissing).to.eq(true);
    });

    // Nenhum usuário ou sessão foi criado
    cy.window().then((win) => {
      const usuarios = JSON.parse(win.localStorage.getItem('raizes.users'));
      expect(usuarios.some((u) => u.email === 'semaceite@demo.com')).to.eq(false);
      expect(win.localStorage.getItem('raizes.session')).to.eq(null);
    });
  });

  it('CT-07c: com consentimento, o cadastro conclui e registra o aceite', () => {
    const email = `ok${Date.now()}@demo.com`;     // e-mail único a cada execução
    preencherCadastro(email);
    cy.get('#register-form input[name=consent]').check();
    cy.get('#register-form button[type=submit]').click();

    cy.url().should('include', 'unidades.html');

    cy.window().then((win) => {
      const consentimento = JSON.parse(win.localStorage.getItem('raizes.consent'));
      expect(consentimento.accepted).to.eq(true);
      expect(consentimento.marketing).to.eq(false);
      expect(consentimento.source).to.eq('cadastro');
    });
  });
});