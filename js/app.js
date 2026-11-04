(function () {
  const mock = window.RAIZES_MOCK || {};
  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });

  const storageKeys = {
    session: "raizes.session",
    users: "raizes.users",
    unitId: "raizes.unitId",
    channel: "raizes.channel",
    serviceMode: "raizes.serviceMode",
    cart: "raizes.cart",
    orders: "raizes.orders",
    latestOrderId: "raizes.latestOrderId",
    loyalty: "raizes.loyalty",
    consent: "raizes.consent",
    campaigns: "raizes.campaigns"
  };

  const defaultStatuses = [
    {
      key: "received",
      title: "Pedido recebido",
      description: "Seu pedido entrou na fila da unidade selecionada."
    },
    {
      key: "payment",
      title: "Pagamento aprovado",
      description: "O gateway externo confirmou a transação simulada."
    },
    {
      key: "kitchen",
      title: "Em preparo",
      description: "A cozinha iniciou a produção do pedido."
    },
    {
      key: "ready",
      title: "Pronto para retirada ou saída",
      description: "Pedido finalizado e aguardando retirada ou expedição."
    },
    {
      key: "completed",
      title: "Pedido concluído",
      description: "Fluxo encerrado com sucesso."
    }
  ];

  const App = {
    storageKeys,

    init() {
      this.ensureSeedData();
      this.migrateSeedData();
      this.renderShell();
      this.renderConsentBanner();
      this.bindGlobalEvents();
      this.syncInteractiveState();
      this.handleProfilePage();
    },

    ensureSeedData() {
      if (!localStorage.getItem(storageKeys.users)) {
        this.write(storageKeys.users, mock.users || []);
      }

      if (!localStorage.getItem(storageKeys.loyalty)) {
        this.write(storageKeys.loyalty, {
          points: 120,
          tier: "Mandacaru",
          marketing: false,
          redeemed: []
        });
      }

      if (!localStorage.getItem(storageKeys.unitId) && this.getUnits().length) {
        this.write(storageKeys.unitId, this.getUnits()[0].id);
      }

      if (!localStorage.getItem(storageKeys.channel)) {
        this.write(storageKeys.channel, "web");
      }

      if (!localStorage.getItem(storageKeys.serviceMode)) {
        this.write(storageKeys.serviceMode, "retirada");
      }
    },

    migrateSeedData() {
      const unitIdMap = {
        "valinhos-centro": "boa-viagem",
        "campinas-cambui": "rio-vermelho",
        "itu-centro": "meireles"
      };
      const users = this.getUsers();
      const migratedUsers = users.map((user) => {
        if (user.email && user.email.toLowerCase() === "lia@demo.com") {
          return {
            ...user,
            name: "Divonir Fagundes",
            email: "divonir@demo.com",
            phone: "(19) 99888-0001",
            preferredChannel: user.preferredChannel || "app",
            goal: user.goal || "delivery"
          };
        }

        if (user.email && user.email.toLowerCase() === "divonir@demo.com") {
          return {
            ...user,
            name: "Divonir Fagundes",
            phone: "(19) 99888-0001",
            preferredChannel: user.preferredChannel || "app",
            goal: user.goal || "delivery"
          };
        }

        if (user.email && user.email.toLowerCase() === "admin@demo.com") {
          return {
            ...user,
            name: "Gestão Raízes",
            goal: user.goal || "retirada"
          };
        }

        return user;
      });

      this.saveUsers(migratedUsers);

      const session = this.getSession();

      if (session && session.email && session.email.toLowerCase() === "lia@demo.com") {
        this.write(storageKeys.session, {
          ...session,
          name: "Divonir Fagundes",
          email: "divonir@demo.com",
          phone: "(19) 99888-0001",
          preferredChannel: session.preferredChannel || "app",
          goal: session.goal || "delivery"
        });
      }

      const currentUnitId = this.read(storageKeys.unitId, "");

      if (unitIdMap[currentUnitId]) {
        this.write(storageKeys.unitId, unitIdMap[currentUnitId]);
      }

      const cart = this.getCart();

      if (cart && unitIdMap[cart.unitId]) {
        this.write(storageKeys.cart, {
          ...cart,
          unitId: unitIdMap[cart.unitId],
          items: []
        });
      }
    },

    read(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (error) {
        return fallback;
      }
    },

    write(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },

    formatCurrency(value) {
      return currencyFormatter.format(value || 0);
    },

    formatDateTime(value) {
      return dateFormatter.format(new Date(value));
    },

    slugify(value) {
      return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    },

    getUsers() {
      return this.read(storageKeys.users, mock.users || []);
    },

    saveUsers(users) {
      this.write(storageKeys.users, users);
    },

    getSession() {
      return this.read(storageKeys.session, null);
    },

    setSession(session) {
      this.write(storageKeys.session, session);
      this.refreshShell();
    },

    createGuestSession() {
      const guestSession = {
        id: "guest",
        name: "Divonir Fagundes",
        email: "divonir@demo.local",
        phone: "(19) 99888-0001",
        preferredChannel: this.getCurrentChannel(),
        marketing: false,
        role: "customer",
        goal: this.getCurrentServiceMode()
      };

      this.setSession(guestSession);
      return guestSession;
    },

    getDisplayName() {
      const session = this.getSession();
      return session && session.name ? session.name : "Divonir Fagundes";
    },

    getUnits() {
      return mock.units || [];
    },

    getCurrentUnitId() {
      return this.read(storageKeys.unitId, this.getUnits()[0] ? this.getUnits()[0].id : "");
    },

    setCurrentUnitId(unitId) {
      this.write(storageKeys.unitId, unitId);
      const cart = this.getCart();

      if (cart.unitId && cart.unitId !== unitId) {
        this.clearCart();
      }

      this.refreshShell();
    },

    getCurrentUnit() {
      return this.getUnits().find((unit) => unit.id === this.getCurrentUnitId()) || this.getUnits()[0] || null;
    },

    getCurrentChannel() {
      return this.read(storageKeys.channel, "web");
    },

    setCurrentChannel(channel) {
      this.write(storageKeys.channel, channel);
      const session = this.getSession();

      if (session) {
        session.preferredChannel = channel;
        this.setSession(session);
      } else {
        this.refreshShell();
      }
    },

    getCurrentServiceMode() {
      return this.read(storageKeys.serviceMode, "retirada");
    },

    setCurrentServiceMode(serviceMode) {
      this.write(storageKeys.serviceMode, serviceMode);
    },

    getCampaigns() {
      const customCampaigns = this.read(storageKeys.campaigns, []);
      return [...(mock.campaigns || []), ...customCampaigns];
    },

    saveCustomCampaign(campaign) {
      const customCampaigns = this.read(storageKeys.campaigns, []);
      customCampaigns.unshift(campaign);
      this.write(storageKeys.campaigns, customCampaigns);
    },

    getMenuItems(unitId) {
      return (mock.menuItems || []).filter((item) => item.unitId === unitId);
    },

    findMenuItem(itemId) {
      return (mock.menuItems || []).find((item) => item.id === itemId) || null;
    },

    getCart() {
      return this.read(storageKeys.cart, {
        unitId: this.getCurrentUnitId(),
        items: []
      });
    },

    saveCart(cart) {
      this.write(storageKeys.cart, cart);
      this.refreshShell();
    },

    addToCart(itemId) {
      const item = this.findMenuItem(itemId);

      if (!item) {
        return;
      }

      const cart = this.getCart();

      if (cart.unitId && cart.unitId !== item.unitId) {
        cart.unitId = item.unitId;
        cart.items = [];
      }

      const existing = cart.items.find((entry) => entry.itemId === itemId);

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.items.push({ itemId, quantity: 1 });
      }

      cart.unitId = item.unitId;
      this.write(storageKeys.unitId, item.unitId);
      this.saveCart(cart);
      this.showToast("Item adicionado ao carrinho.");
    },

    updateCartItem(itemId, quantity) {
      const cart = this.getCart();
      const target = cart.items.find((entry) => entry.itemId === itemId);

      if (!target) {
        return;
      }

      if (quantity <= 0) {
        cart.items = cart.items.filter((entry) => entry.itemId !== itemId);
      } else {
        target.quantity = quantity;
      }

      this.saveCart(cart);
    },

    removeCartItem(itemId) {
      const cart = this.getCart();
      cart.items = cart.items.filter((entry) => entry.itemId !== itemId);
      this.saveCart(cart);
    },

    clearCart() {
      this.write(storageKeys.cart, {
        unitId: this.getCurrentUnitId(),
        items: []
      });
      this.refreshShell();
    },

    getApplicableCampaign(subtotal, unitId) {
      return this.getCampaigns()
        .filter((campaign) => (campaign.unitId === unitId || campaign.unitId === "all") && subtotal >= Number(campaign.minimumOrder || 0))
        .sort((first, second) => Number(second.discountRate || 0) - Number(first.discountRate || 0))[0] || null;
    },

    getCartDetails() {
      const cart = this.getCart();
      const unit = this.getUnits().find((entry) => entry.id === cart.unitId) || this.getCurrentUnit();
      const items = cart.items
        .map((entry) => {
          const item = this.findMenuItem(entry.itemId);
          return item
            ? {
                ...item,
                quantity: entry.quantity,
                total: item.price * entry.quantity
              }
            : null;
        })
        .filter(Boolean);

      const subtotal = items.reduce((total, item) => total + item.total, 0);
      const campaign = this.getApplicableCampaign(subtotal, unit ? unit.id : "");
      const discount = campaign ? subtotal * (Number(campaign.discountRate || 0) / 100) : 0;
      const serviceMode = this.getCurrentServiceMode();
      const serviceFee = serviceMode === "delivery" && unit ? Number(unit.deliveryFee || 0) : 0;
      const total = Math.max(subtotal - discount + serviceFee, 0);
      const pointsEarned = Math.floor(total / 5);

      return {
        unit,
        serviceMode,
        items,
        subtotal,
        discount,
        serviceFee,
        total,
        pointsEarned,
        campaign
      };
    },

    getLoyaltyTier(points) {
      if (points >= 220) {
        return "Seridó";
      }

      if (points >= 120) {
        return "Mandacaru";
      }

      return "Cacto";
    },

    getLoyalty() {
      const loyalty = this.read(storageKeys.loyalty, {
        points: 0,
        tier: "Cacto",
        marketing: false,
        redeemed: []
      });

      return {
        points: Number(loyalty.points || 0),
        tier: this.getLoyaltyTier(Number(loyalty.points || 0)),
        marketing: Boolean(loyalty.marketing),
        redeemed: Array.isArray(loyalty.redeemed) ? loyalty.redeemed : []
      };
    },

    saveLoyalty(loyalty) {
      loyalty.tier = this.getLoyaltyTier(loyalty.points || 0);
      this.write(storageKeys.loyalty, loyalty);
    },

    redeemReward(rewardId) {
      const loyalty = this.getLoyalty();
      const reward = (mock.rewards || []).find((entry) => entry.id === rewardId);

      if (!reward || loyalty.points < reward.points) {
        return false;
      }

      loyalty.points -= reward.points;
      loyalty.redeemed.unshift({
        rewardId,
        title: reward.title,
        points: reward.points,
        createdAt: Date.now()
      });
      this.saveLoyalty(loyalty);
      return true;
    },

    getOrders() {
      return this.read(storageKeys.orders, []).map((order) => this.normalizeOrder(order));
    },

    getLatestOrder() {
      const latestOrderId = this.read(storageKeys.latestOrderId, null);

      if (!latestOrderId) {
        return null;
      }

      return this.getOrders().find((order) => order.id === latestOrderId) || null;
    },

    normalizeOrder(order) {
      const normalizedOrder = order || {};
      const totals = normalizedOrder.totals || {};
      const payment = normalizedOrder.payment || {};
      const customer = normalizedOrder.customer || {};
      const items = Array.isArray(normalizedOrder.items)
        ? normalizedOrder.items.map((item) => ({
            ...item,
            tags: Array.isArray(item.tags) ? item.tags : [],
            quantity: Number(item.quantity || 0),
            price: Number(item.price || 0),
            total: Number(item.total || 0)
          }))
        : [];

      const statuses =
        Array.isArray(normalizedOrder.statuses) && normalizedOrder.statuses.length
          ? normalizedOrder.statuses.map((status, index) => ({
              key: status.key || defaultStatuses[index]?.key || `status-${index + 1}`,
              title: status.title || defaultStatuses[index]?.title || "Status do pedido",
              description: status.description || defaultStatuses[index]?.description || ""
            }))
          : defaultStatuses.map((status) => ({ ...status }));

      return {
        ...normalizedOrder,
        customer: {
          name: customer.name || "Cliente Raízes",
          email: customer.email || "",
          phone: customer.phone || ""
        },
        payment: {
          method: payment.method || "pix",
          provider: payment.provider || "Gateway AsaPay",
          transactionId: payment.transactionId || "Transação em processamento",
          consent: Boolean(payment.consent)
        },
        channel: normalizedOrder.channel || this.getCurrentChannel(),
        serviceMode: normalizedOrder.serviceMode || this.getCurrentServiceMode(),
        createdAt: Number(normalizedOrder.createdAt || Date.now()),
        pointsEarned: Number(normalizedOrder.pointsEarned || 0),
        campaign: normalizedOrder.campaign || null,
        notes: normalizedOrder.notes || "",
        totals: {
          subtotal: Number(totals.subtotal || 0),
          discount: Number(totals.discount || 0),
          serviceFee: Number(totals.serviceFee || 0),
          total: Number(totals.total || 0)
        },
        items,
        statuses
      };
    },

    createOrder(paymentData) {
      const cartDetails = this.getCartDetails();

      if (!cartDetails.items.length || !cartDetails.unit) {
        return null;
      }

      const session = this.getSession() || this.createGuestSession();
      const safePaymentData = paymentData || {};
      const now = Date.now();
      const order = this.normalizeOrder({
        id: `RDN-${String(now).slice(-6)}`,
        createdAt: now,
        unitId: cartDetails.unit.id,
        channel: this.getCurrentChannel(),
        serviceMode: cartDetails.serviceMode,
        customer: {
          name: String(safePaymentData.customerName || session.name || "Cliente Raízes").trim(),
          email: String(safePaymentData.customerEmail || session.email || "").trim(),
          phone: String(safePaymentData.customerPhone || session.phone || "").trim()
        },
        payment: {
          method: String(safePaymentData.paymentMethod || "pix"),
          provider: "Gateway AsaPay",
          transactionId: `ASA${Math.floor(100000 + Math.random() * 900000)}`,
          consent: Boolean(safePaymentData.paymentConsent)
        },
        items: cartDetails.items.map((item) => ({
          ...item,
          tags: Array.isArray(item.tags) ? [...item.tags] : []
        })),
        totals: {
          subtotal: cartDetails.subtotal,
          discount: cartDetails.discount,
          serviceFee: cartDetails.serviceFee,
          total: cartDetails.total
        },
        campaign: cartDetails.campaign ? { ...cartDetails.campaign } : null,
        pointsEarned: cartDetails.pointsEarned,
        notes: String(safePaymentData.notes || "").trim(),
        statuses: defaultStatuses.map((status) => ({ ...status }))
      });

      const orders = this.getOrders();
      orders.unshift(order);
      this.write(storageKeys.orders, orders);
      this.write(storageKeys.latestOrderId, order.id);

      const loyalty = this.getLoyalty();
      loyalty.points += cartDetails.pointsEarned;
      this.saveLoyalty(loyalty);

      this.write(storageKeys.consent, {
        accepted: true,
        timestamp: now,
        marketing: Boolean(session.marketing),
        source: "checkout"
      });

      this.clearCart();
      return order;
    },

    getOrderProgress(order) {
      if (!order) {
        return 0;
      }

      const elapsedSeconds = Math.floor((Date.now() - order.createdAt) / 5000);
      return Math.min(elapsedSeconds, order.statuses.length - 1);
    },

    getCurrentOrderStatus(order) {
      const index = this.getOrderProgress(order);
      return order && order.statuses ? order.statuses[index] : null;
    },

    getConsent() {
      return this.read(storageKeys.consent, {
        accepted: false,
        timestamp: null,
        marketing: false,
        source: "banner"
      });
    },

    acceptConsent(marketing) {
      this.write(storageKeys.consent, {
        accepted: true,
        timestamp: Date.now(),
        marketing: Boolean(marketing),
        source: "banner"
      });
      this.renderConsentBanner();
    },

    renderShell() {
      const headerTarget = document.querySelector("[data-app-header]");
      const footerTarget = document.querySelector("[data-app-footer]");
      const currentPage = document.body.dataset.page || "";
      const currentUnit = this.getCurrentUnit();
      const session = this.getSession();
      const cartCount = this.getCart().items.reduce((total, item) => total + item.quantity, 0);
      const navIsOpen = document.body.classList.contains("nav-open");
      const utilityAccountHref = session ? "perfil.html" : "index.html#login-form";
      const utilityAccountLabel = session ? "Minha conta" : "Entrar ou criar conta";
      const primaryLinks = [
        ["home", "index.html", "Início"],
        ["unidades", "unidades.html", "Unidades"],
        ["cardapio", "cardapio.html", "Cardápio"],
        ["carrinho", "carrinho.html", `Carrinho (${cartCount})`],
        ["pagamento", "pagamento.html", "Pagamento"],
        ["pedido", "pedido.html", "Pedido"]
      ];
      const secondaryLinks = [
        ["cadastro", "cadastro.html", "Cadastro"],
        ["fidelidade", "fidelidade.html", "Fidelidade"],
        ["perfil", "perfil.html", "Perfil"],
        ["admin", "admin.html", "Admin"]
      ];
      const navigationMarkup = (links) =>
        links
          .map(
            ([page, href, label]) =>
              `<a class="${currentPage === page ? "is-current" : ""}" href="${href}">${label}</a>`
          )
          .join("");

      if (headerTarget) {
        headerTarget.innerHTML = `
          <a class="skip-link" href="#main-content">Pular para o conteúdo</a>
          <div class="utility-bar">
            <div class="utility-shell">
              <div class="utility-links" aria-label="Acessos rápidos">
                <a href="fidelidade.html">Fidelidade</a>
                <a href="unidades.html">Unidades</a>
                <a href="admin.html">Operação</a>
              </div>
              <a class="utility-login" href="${utilityAccountHref}">${utilityAccountLabel}</a>
            </div>
          </div>
          <div class="site-header">
            <div class="header-shell">
              <div class="header-bar">
                <div class="brand-block">
                  <a class="brand-link" href="index.html">
                    <span class="brand-mark">RN</span>
                    <span class="brand-copy">
                      <strong>Raízes do Nordeste</strong>
                      <small>Sabores regionais com pedido digital e operação integrada</small>
                    </span>
                  </a>
                  <p class="brand-note">Peça com retirada, delivery e fidelidade em uma jornada mais clara, rápida e profissional.</p>
                </div>
                <div class="header-actions">
                  <a class="button button-secondary header-cta-secondary" href="cadastro.html">Criar conta</a>
                  <a class="button button-primary header-cta" href="unidades.html">Peça agora</a>
                  <button
                    class="menu-toggle"
                    type="button"
                    data-menu-toggle
                    aria-expanded="${navIsOpen}"
                    aria-controls="primary-navigation"
                    aria-label="Alternar menu principal"
                  >
                    <span class="menu-toggle-bar"></span>
                    <span class="menu-toggle-bar"></span>
                    <span class="menu-toggle-bar"></span>
                  </button>
                </div>
              </div>
              <div class="header-body" id="primary-navigation-shell">
                <div class="header-context-grid" aria-label="Contexto atual da navegação">
                  <div class="header-context-card header-context-card-profile">
                    <span class="header-section-label">Cliente</span>
                    <strong>${this.getDisplayName()}</strong>
                  </div>
                  <div class="header-context-card">
                    <span class="header-section-label">Canal</span>
                    <strong>${this.getCurrentChannel().toUpperCase()}</strong>
                  </div>
                  <div class="header-context-card">
                    <span class="header-section-label">Unidade</span>
                    <strong>${currentUnit ? currentUnit.city : "Sem unidade"}</strong>
                  </div>
                </div>
                <div class="header-nav-panels">
                  <section class="nav-panel">
                    <span class="header-section-label">Fluxo de compra</span>
                    <nav id="primary-navigation" class="nav-links nav-links-primary" aria-label="Navegação principal">
                      ${navigationMarkup(primaryLinks)}
                    </nav>
                  </section>
                  <section class="nav-panel nav-panel-secondary">
                    <span class="header-section-label">Conta e gestão</span>
                    <nav class="nav-links nav-links-secondary" aria-label="Atalhos da conta e operação">
                      ${navigationMarkup(secondaryLinks)}
                    </nav>
                  </section>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      if (footerTarget) {
        footerTarget.innerHTML = `
          <div class="site-footer">
            <div class="footer-shell">
              <div class="footer-columns">
                <div>
                  <h2>Operação omnicanal</h2>
                  <p>Cadastro, escolha de unidade, cardápio contextual, carrinho, checkout, pedido, fidelidade e visão administrativa.</p>
                </div>
                <div>
                  <h2>Privacidade e confiança</h2>
                  <p>Consentimento explícito, clareza no uso dos dados, interface responsiva e jornada orientada ao negócio.</p>
                </div>
                <div>
                  <h2>Crescimento da marca</h2>
                  <p>A base foi estruturada para evoluir produto, conteúdo promocional, relacionamento e eficiência da operação.</p>
                </div>
              </div>
              <div class="footer-bottom">
                <p>Protótipo navegável com dados mockados em <code>localStorage</code>, sem dependência de back-end ou pagamento real.</p>
              </div>
            </div>
          </div>
        `;
      }

      this.syncInteractiveState();
    },

    renderConsentBanner() {
      const consent = this.getConsent();
      const currentBanner = document.getElementById("consent-banner");

      if (currentBanner) {
        currentBanner.remove();
      }

      document.body.classList.remove("consent-visible");

      if (consent.accepted) {
        return;
      }

      const banner = document.createElement("aside");
      banner.id = "consent-banner";
      banner.className = "consent-banner";
      banner.innerHTML = `
        <strong>Privacidade em destaque</strong>
        <p>Usamos somente os dados necessários para autenticação, pedido, fidelidade e comunicação do atendimento, com consentimento visível.</p>
        <div class="button-row">
          <button class="button button-primary" type="button" data-accept-consent>Aceitar essenciais</button>
          <a class="button button-secondary" href="perfil.html">Revisar preferências</a>
        </div>
      `;
      document.body.appendChild(banner);
      document.body.classList.add("consent-visible");
    },

    bindGlobalEvents() {
      if (this.globalEventsBound) {
        return;
      }

      this.globalEventsBound = true;

      document.addEventListener("click", (event) => {
        const channelButton = event.target.closest("[data-set-channel]");
        const acceptConsentButton = event.target.closest("[data-accept-consent]");
        const menuToggle = event.target.closest("[data-menu-toggle]");
        const navLink = event.target.closest(".nav-links a");
        const clickedInsideHeader = event.target.closest(".site-header");

        if (menuToggle) {
          this.toggleNav();
          return;
        }

        if (channelButton) {
          const selectedChannel = channelButton.dataset.setChannel;
          this.setCurrentChannel(selectedChannel);
          this.showToast(`Canal alterado para ${selectedChannel.toUpperCase()}.`);
          return;
        }

        if (acceptConsentButton) {
          this.acceptConsent(false);
          this.showToast("Consentimento salvo no navegador.");
          return;
        }

        if (navLink) {
          this.closeNav();
          return;
        }

        if (!clickedInsideHeader) {
          this.closeNav();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          this.closeNav();
        }
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth >= 1024) {
          this.closeNav();
        }
      });
    },

    refreshShell() {
      this.renderShell();
      this.renderConsentBanner();
    },

    syncInteractiveState() {
      document.querySelectorAll("[data-set-channel]").forEach((button) => {
        const isSelected = button.dataset.setChannel === this.getCurrentChannel();
        button.classList.toggle("is-selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
      });

      const menuToggle = document.querySelector("[data-menu-toggle]");

      if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", String(document.body.classList.contains("nav-open")));
      }
    },

    toggleNav() {
      document.body.classList.toggle("nav-open");
      this.syncInteractiveState();
    },

    closeNav() {
      if (!document.body.classList.contains("nav-open")) {
        return;
      }

      document.body.classList.remove("nav-open");
      this.syncInteractiveState();
    },

    showToast(message) {
      let toast = document.getElementById("app-toast");

      if (!toast) {
        toast = document.createElement("div");
        toast.id = "app-toast";
        toast.className = "toast";
        document.body.appendChild(toast);
      }

      toast.textContent = message;
      toast.classList.add("is-visible");
      clearTimeout(this.toastTimeout);
      this.toastTimeout = window.setTimeout(() => {
        toast.classList.remove("is-visible");
      }, 2200);
    },

    exportLocalData() {
      return {
        session: this.getSession(),
        consent: this.getConsent(),
        unitId: this.getCurrentUnitId(),
        channel: this.getCurrentChannel(),
        serviceMode: this.getCurrentServiceMode(),
        cart: this.getCart(),
        loyalty: this.getLoyalty(),
        orders: this.getOrders()
      };
    },

    clearLocalData() {
      Object.values(storageKeys).forEach((key) => localStorage.removeItem(key));
      this.ensureSeedData();
      this.refreshShell();
    },

    handleProfilePage() {
      const profileForm = document.getElementById("profile-form");
      const consentStatus = document.getElementById("consent-status");
      const exportButton = document.getElementById("export-data");
      const clearButton = document.getElementById("clear-data");
      const exportTarget = document.getElementById("profile-data-export");
      const activityTarget = document.getElementById("profile-activity");

      if (!profileForm) {
        return;
      }

      const session = this.getSession() || this.createGuestSession();
      const consent = this.getConsent();

      profileForm.name.value = session.name || "";
      profileForm.email.value = session.email || "";
      profileForm.phone.value = session.phone || "";
      profileForm.preferredChannel.value = session.preferredChannel || this.getCurrentChannel();
      profileForm.marketing.checked = Boolean(session.marketing || consent.marketing);

      if (consentStatus) {
        consentStatus.innerHTML = `
          <h3>Status do consentimento</h3>
          <p>${consent.accepted ? "Aceite registrado" : "Consentimento pendente"}</p>
          <p class="muted-text">Última atualização: ${consent.timestamp ? this.formatDateTime(consent.timestamp) : "não registrada"}</p>
        `;
      }

      if (activityTarget) {
        const recentOrders = this.getOrders().slice(0, 3);
        activityTarget.innerHTML = `
          <div class="section-heading">
            <div>
              <p class="eyebrow">Atividade recente</p>
              <h2>Últimos pedidos e relacionamento</h2>
            </div>
          </div>
          ${
            recentOrders.length
              ? recentOrders
                  .map(
                    (order) => `
                      <article class="order-card">
                        <div class="card-title-row">
                          <h3>${order.id}</h3>
                          <span class="tag is-success">${this.getCurrentOrderStatus(order).title}</span>
                        </div>
                        <p>${this.formatDateTime(order.createdAt)} • ${this.formatCurrency(order.totals.total)}</p>
                      </article>
                    `
                  )
                  .join("")
              : '<div class="empty-state">Nenhum pedido concluído até o momento.</div>'
          }
        `;
      }

      profileForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const updatedSession = {
          ...session,
          name: profileForm.name.value.trim(),
          email: profileForm.email.value.trim(),
          phone: profileForm.phone.value.trim(),
          preferredChannel: profileForm.preferredChannel.value,
          marketing: profileForm.marketing.checked
        };

        this.setSession(updatedSession);
        this.setCurrentChannel(updatedSession.preferredChannel);
        this.write(storageKeys.consent, {
          accepted: true,
          timestamp: Date.now(),
          marketing: updatedSession.marketing,
          source: "profile"
        });
        this.showToast("Perfil atualizado com sucesso.");
      });

      if (exportButton && exportTarget) {
        exportButton.addEventListener("click", () => {
          exportTarget.classList.remove("is-hidden");
          exportTarget.textContent = JSON.stringify(this.exportLocalData(), null, 2);
        });
      }

      if (clearButton) {
        clearButton.addEventListener("click", () => {
          if (!window.confirm("Deseja limpar os dados locais desta plataforma?")) {
            return;
          }

          this.clearLocalData();
          window.location.reload();
        });
      }
    }
  };

  window.RaizesApp = App;
  document.addEventListener("DOMContentLoaded", () => App.init());
})();
