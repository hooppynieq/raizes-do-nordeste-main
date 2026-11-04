const { carregarApp } = require('./helpers');

describe('Checkout e campanhas (F-01)', () => {
  let app;

  beforeEach(() => {
    app = carregarApp();
  });

  // ---------- CT-01: pedido com pagamento aprovado ----------
  test('CT-01: pedido com pagamento simulado é criado, credita pontos e esvazia o carrinho', () => {
    // Preparar: 1 item de R$ 36,90 na unidade Boa Viagem
    app.addToCart('rec-1');
    const pontosAntes = app.getLoyalty().points;      // 120

    const pedido = app.createOrder({
      customerName: 'Cliente Teste',
      customerEmail: 'teste@demo.com',
      customerPhone: '(19) 99999-0000',
      paymentMethod: 'pix',
      paymentConsent: true,
      termsConsent: true
    });

    expect(pedido).not.toBeNull();
    expect(pedido.id).toMatch(/^RDN-\d{6}$/);             
    expect(pedido.payment.transactionId).toMatch(/^ASA\d{6}$/); 
    expect(pedido.totals.total).toBeCloseTo(36.9, 2);
    expect(pedido.statuses[0].title).toBe('Pedido recebido');
    expect(pedido.pointsEarned).toBe(7);
    expect(app.getLoyalty().points).toBe(pontosAntes + 7);
    expect(app.getCartDetails().items).toHaveLength(0);
    expect(app.getLatestOrder().id).toBe(pedido.id);
  });

  // ---------- CT-02: campanha válida aplicada (adaptação do cupom RAIZ10) ----------
  test('CT-02: campanha de 10% é aplicada em Boa Viagem com pedido a partir de R$ 50', () => {
    app.addToCart('rec-1');   // R$ 36,90
    app.addToCart('rec-3');   // R$ 17,90  -> subtotal R$ 54,80

    const d = app.getCartDetails();

    expect(d.subtotal).toBeCloseTo(54.8, 2);
    expect(d.campaign.id).toBe('camp-1');       // "Almoço Raízes Recife"
    expect(d.discount).toBeCloseTo(5.48, 2);    // 10% de 54,80
    expect(d.serviceFee).toBe(0);               // modalidade padrão: retirada
    expect(d.total).toBeCloseTo(49.32, 2);
    expect(d.pointsEarned).toBe(9);             // floor(49,32 / 5)
  });

  // ---------- CT-03: sem campanha (adaptação do cupom inválido) ----------
  test('CT-03: pedido abaixo do mínimo não recebe desconto', () => {
    app.addToCart('rec-1');   // R$ 36,90, abaixo dos R$ 50 da campanha

    const d = app.getCartDetails();

    expect(d.campaign).toBeNull();
    expect(d.discount).toBe(0);
    expect(d.total).toBeCloseTo(36.9, 2);
  });

  test('CT-03 (limite): R$ 49,99 não ativa a campanha e R$ 50,00 ativa', () => {
    expect(app.getApplicableCampaign(49.99, 'boa-viagem')).toBeNull();
    expect(app.getApplicableCampaign(50, 'boa-viagem').id).toBe('camp-1');
  });

  // ---------- CT-06: duplo envio ----------
  test('CT-06: duplo envio com carrinho vazio não gera novo pedido nem duplica pontos', () => {
    app.addToCart('rec-1');
    const pontosAntes = app.getLoyalty().points;

    const pedido1 = app.createOrder({
      customerName: 'Cliente Teste',
      customerEmail: 'teste@demo.com',
      customerPhone: '(19) 99999-0000',
      paymentMethod: 'pix',
      paymentConsent: true,
      termsConsent: true
    });
    
    expect(pedido1).not.toBeNull();
    const pontosAposPrimeiro = app.getLoyalty().points;

    // Segunda tentativa sem repor itens no carrinho
    const pedido2 = app.createOrder({
      customerName: 'Cliente Teste',
      customerEmail: 'teste@demo.com',
      customerPhone: '(19) 99999-0000',
      paymentMethod: 'pix',
      paymentConsent: true,
      termsConsent: true
    });

    expect(pedido2).toBeNull();
    expect(app.getLoyalty().points).toBe(pontosAposPrimeiro);
  });

  // ---------- Níveis de fidelidade ----------
  test('Verificação de Níveis de Fidelidade por pontuação', () => {
    expect(app.getLoyaltyTier(119)).toBeDefined();
    expect(app.getLoyaltyTier(120)).toBeDefined();
    expect(app.getLoyaltyTier(220)).toBeDefined();
  });

  // ---------- CT-16: exclusão de dados ----------
  test('CT-16: exclusão de dados locais limpa pedidos e sessão', () => {
    app.addToCart('rec-1');
    app.createOrder({
      customerName: 'Cliente Teste',
      customerEmail: 'teste@demo.com',
      customerPhone: '(19) 99999-0000',
      paymentMethod: 'pix',
      paymentConsent: true,
      termsConsent: true
    });

    expect(app.getOrders()).not.toHaveLength(0);
    expect(app.getSession()).not.toBeNull();

    app.clearLocalData();

    expect(app.getOrders()).toHaveLength(0);
    expect(app.getSession()).toBeNull();
  });

  // ---------- D-03: consentimento (Defeito Conhecido) ----------
  // D-03: defeito conhecido
  test.failing('D-03: criar pedido sem consentimento de pagamento deve retornar null', () => {
    app.addToCart('rec-1');
    const pedido = app.createOrder({
      customerName: 'Cliente Teste',
      customerEmail: 'teste@demo.com',
      customerPhone: '(19) 99999-0000',
      paymentMethod: 'pix',
      paymentConsent: false, // Sem consentimento de pagamento
      termsConsent: true
    });

    expect(pedido).toBeNull();
  });
});