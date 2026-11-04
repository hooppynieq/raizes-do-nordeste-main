(function () {
  const app = window.RaizesApp;

  function getServiceModeLabel(serviceMode) {
    const labels = {
      retirada: "Retirada no balcão",
      delivery: "Entrega no endereço",
      "consumo-local": "Consumo no local"
    };

    return labels[serviceMode] || serviceMode;
  }

  function renderHero(target, unit, items) {
    const campaign = app.getCampaigns().find((entry) => entry.unitId === unit.id || entry.unitId === "all");
    const currentChannel = app.getCurrentChannel().toUpperCase();
    const serviceMode = app.getCurrentServiceMode();

    target.innerHTML = `
      <div class="commerce-hero-grid">
        <div class="commerce-hero-main">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Unidade ativa</p>
              <h2>${unit.name}</h2>
            </div>
            <span class="tag">${currentChannel} • ${getServiceModeLabel(serviceMode)}</span>
          </div>
          <p class="hero-copy">${unit.address} • ${unit.hours} • Atendimento no bairro ${unit.neighborhood}</p>
          ${
            campaign
              ? `<div class="notice"><strong>${campaign.title}</strong><p>${campaign.description}</p></div>`
              : ""
          }
          <div class="chip-row">
            <span class="chip">${items.length} itens no cardápio</span>
            <span class="chip">Nota ${unit.rating}</span>
            <span class="chip">Frete ${app.formatCurrency(unit.deliveryFee)}</span>
          </div>
        </div>
        <aside class="commerce-hero-side">
          <div class="card-media banner-media">
            <img
              src="${unit.image}"
              alt="Sabores e atmosfera da unidade ${unit.name}"
              width="1536"
              height="1024"
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
          </div>
          <div class="summary-emphasis">
            <span>Tempo médio</span>
            <strong>${unit.eta}</strong>
            <p>${getServiceModeLabel(serviceMode)} com operação ativa para ${unit.city}.</p>
          </div>
          <ul class="detail-list">
            <li><span>Cidade</span><strong>${unit.city}</strong></li>
            <li><span>Bairro</span><strong>${unit.neighborhood}</strong></li>
            <li><span>Canais</span><strong>${unit.channels.map((channel) => channel.toUpperCase()).join(" • ")}</strong></li>
          </ul>
        </aside>
      </div>
    `;
  }

  function renderCategoryOptions(select, items) {
    const categories = [...new Set(items.map((item) => item.category))];
    select.innerHTML = `
      <option value="all">Todas as categorias</option>
      ${categories.map((category) => `<option value="${category}">${category}</option>`).join("")}
    `;
  }

  function renderItems(target, items, query, category, unit) {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredItems = items.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesQuery =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });

    target.innerHTML = filteredItems.length
      ? filteredItems
          .map(
            (item) => `
              <article class="menu-card">
                <div class="menu-media" data-category="${app.slugify(item.category)}">
                  <span class="menu-media-badge">${unit.city}</span>
                  <strong>${item.category}</strong>
                  <small>${item.prepTime} de preparo médio</small>
                </div>
                ${
                  item.image
                    ? `
                      <div class="card-media menu-item-photo">
                        <img
                          src="${item.image}"
                          alt="Foto do item ${item.name}"
                          width="1536"
                          height="1024"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    `
                    : ""
                }
                <div class="menu-card-top">
                  <span class="tag is-neutral">${item.category}</span>
                  <span class="tag">${item.prepTime}</span>
                </div>
                <div class="card-title-row">
                  <div>
                    <h2>${item.name}</h2>
                    <p class="muted-text">${item.description}</p>
                  </div>
                </div>
                <div class="chip-row">
                  ${item.tags.map((tag) => `<span class="chip">${tag}</span>`).join("")}
                </div>
                <div class="menu-card-footer">
                  <div class="menu-card-price">
                    <span>A partir de</span>
                    <strong>${app.formatCurrency(item.price)}</strong>
                  </div>
                  <button class="button button-primary" type="button" data-add-item="${item.id}">Adicionar ao pedido</button>
                </div>
              </article>
            `
          )
          .join("")
      : '<div class="empty-state">Nenhum item encontrado com esse filtro.</div>';
  }

  function renderSupportPanels(campaignTarget, cartTarget) {
    const cartDetails = app.getCartDetails();
    const totalQuantity = cartDetails.items.reduce((total, item) => total + item.quantity, 0);
    const campaignCards = app
      .getCampaigns()
      .filter((campaign) => campaign.unitId === app.getCurrentUnitId() || campaign.unitId === "all")
      .slice(0, 3);

    campaignTarget.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">Campanhas em destaque</p>
          <h2>Promoções da unidade</h2>
        </div>
      </div>
      ${
        campaignCards.length
      ? campaignCards
          .map(
            (campaign) => `
              <article class="campaign-card">
                ${
                  campaign.image
                    ? `
                      <div class="card-media campaign-media">
                        <img
                          src="${campaign.image}"
                          alt="Campanha ${campaign.title}"
                          width="1536"
                          height="1024"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    `
                    : ""
                }
                <div class="card-title-row">
                  <h3>${campaign.title}</h3>
                  <span class="tag">${campaign.discountRate}%</span>
                </div>
                    <p>${campaign.description}</p>
                  </article>
                `
              )
              .join("")
          : '<div class="empty-state">Sem campanhas cadastradas para esta unidade.</div>'
      }
    `;

    cartTarget.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">Resumo atual</p>
          <h2>Seu pedido até aqui</h2>
        </div>
      </div>
      <div class="summary-emphasis">
        <span>Total parcial</span>
        <strong>${app.formatCurrency(cartDetails.total || cartDetails.subtotal)}</strong>
        <p>${totalQuantity} item(ns) selecionado(s) na unidade atual.</p>
      </div>
      <ul class="summary-list">
        <li><span>Itens</span><strong>${totalQuantity}</strong></li>
        <li><span>Subtotal</span><strong>${app.formatCurrency(cartDetails.subtotal)}</strong></li>
        <li><span>Pontos estimados</span><strong>${cartDetails.pointsEarned}</strong></li>
      </ul>
      <ul class="trust-list">
        <li>Pagamento com parceiro externo e retorno visual no checkout.</li>
        <li>Loja ativa sincronizada com cidade, canal e modalidade.</li>
      </ul>
      <div class="form-actions">
        <a class="button button-primary" href="carrinho.html">Ver carrinho</a>
        <a class="button button-secondary" href="unidades.html">Trocar unidade</a>
      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const unit = app.getCurrentUnit();
    const items = app.getMenuItems(unit.id);
    const heroTarget = document.getElementById("menu-unit-hero");
    const searchInput = document.getElementById("menu-search");
    const categorySelect = document.getElementById("menu-category");
    const listTarget = document.getElementById("menu-list");
    const campaignsTarget = document.getElementById("menu-campaigns");
    const cartTarget = document.getElementById("menu-cart-cta");

    if (!heroTarget || !searchInput || !categorySelect || !listTarget || !campaignsTarget || !cartTarget) {
      return;
    }

    renderHero(heroTarget, unit, items);
    renderCategoryOptions(categorySelect, items);
    renderItems(listTarget, items, "", "all", unit);
    renderSupportPanels(campaignsTarget, cartTarget);

    function rerenderItems() {
      renderItems(listTarget, items, searchInput.value, categorySelect.value, unit);
    }

    searchInput.addEventListener("input", rerenderItems);
    categorySelect.addEventListener("change", rerenderItems);

    listTarget.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add-item]");

      if (!button) {
        return;
      }

      app.addToCart(button.dataset.addItem);
      renderSupportPanels(campaignsTarget, cartTarget);
    });
  });
})();
