(function () {
  const app = window.RaizesApp;

  function getServiceModeLabel(serviceMode) {
    const labels = {
      retirada: "Retirada",
      delivery: "Delivery",
      "consumo-local": "Consumo no local"
    };

    return labels[serviceMode] || serviceMode;
  }

  function renderCartItems(target, details) {
    target.innerHTML = details.items.length
      ? details.items
          .map(
            (item) => `
              <article class="line-item">
                <header>
                  <div>
                    <h2>${item.name}</h2>
                    <p class="muted-text">${item.category} • ${item.description}</p>
                  </div>
                  <strong>${app.formatCurrency(item.total)}</strong>
                </header>
                <div class="chip-row">
                  ${item.tags.map((tag) => `<span class="chip">${tag}</span>`).join("")}
                </div>
                <div class="cart-actions">
                  <div class="qty-control">
                    <button type="button" data-qty-action="decrease" data-item-id="${item.id}">-</button>
                    <strong>${item.quantity}</strong>
                    <button type="button" data-qty-action="increase" data-item-id="${item.id}">+</button>
                  </div>
                  <button class="button button-ghost" type="button" data-remove-item="${item.id}">Remover item</button>
                </div>
              </article>
            `
          )
          .join("")
      : `
          <div class="empty-state">
            Seu carrinho está vazio. Escolha uma unidade e adicione itens do cardápio para continuar.
          </div>
        `;
  }

  function renderSummary(target, details) {
    if (!details.items.length || !details.unit) {
      target.innerHTML = `
        <h2>Resumo indisponível</h2>
        <p>Adicione itens ao carrinho para gerar subtotal, frete e pontos.</p>
        <a class="button button-primary" href="cardapio.html">Ir ao cardápio</a>
      `;
      return;
    }

    target.innerHTML = `
      <div class="card-media banner-media">
        <img
          src="${details.unit.image}"
          alt="Destaque visual da unidade ${details.unit.name}"
          width="1536"
          height="1024"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
      </div>
      <div class="section-heading">
        <div>
          <p class="eyebrow">Totais da compra</p>
          <h2>${details.unit.name}</h2>
        </div>
        <span class="tag">${getServiceModeLabel(details.serviceMode)}</span>
      </div>
      <div class="summary-emphasis">
        <span>Total estimado</span>
        <strong>${app.formatCurrency(details.total)}</strong>
        <p>${details.unit.city} • preparo médio ${details.unit.eta} • pagamento rápido na próxima etapa.</p>
      </div>
      <ul class="summary-list">
        <li><span>Subtotal</span><strong>${app.formatCurrency(details.subtotal)}</strong></li>
        <li><span>Desconto</span><strong>${app.formatCurrency(details.discount)}</strong></li>
        <li><span>Frete</span><strong>${app.formatCurrency(details.serviceFee)}</strong></li>
        <li><span>Total</span><strong>${app.formatCurrency(details.total)}</strong></li>
        <li><span>Pontos a receber</span><strong>${details.pointsEarned}</strong></li>
      </ul>
      <ul class="trust-list">
        <li>Seu pagamento será enviado para um parceiro externo com retorno visual na confirmação.</li>
        <li>Você ainda pode revisar itens, quantidades e preferências antes de concluir.</li>
      </ul>
      ${
        details.campaign
          ? `
            <article class="campaign-card">
              ${
                details.campaign.image
                  ? `
                    <div class="card-media campaign-media">
                      <img
                        src="${details.campaign.image}"
                        alt="Campanha ${details.campaign.title}"
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
                <h3>${details.campaign.title}</h3>
                <span class="tag">${details.campaign.discountRate}%</span>
              </div>
              <p>${details.campaign.description}</p>
            </article>
          `
          : ""
      }
      <div class="form-actions">
        <a class="button button-primary" href="pagamento.html">Seguir para pagamento</a>
        <button class="button button-secondary" type="button" id="clear-cart">Limpar carrinho</button>
      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const itemsTarget = document.getElementById("cart-items");
    const summaryTarget = document.getElementById("cart-summary");

    if (!itemsTarget || !summaryTarget) {
      return;
    }

    function rerender() {
      const details = app.getCartDetails();
      renderCartItems(itemsTarget, details);
      renderSummary(summaryTarget, details);
    }

    itemsTarget.addEventListener("click", (event) => {
      const qtyButton = event.target.closest("[data-qty-action]");
      const removeButton = event.target.closest("[data-remove-item]");
      const details = app.getCartDetails();

      if (qtyButton) {
        const item = details.items.find((entry) => entry.id === qtyButton.dataset.itemId);

        if (!item) {
          return;
        }

        const newQuantity = qtyButton.dataset.qtyAction === "increase" ? item.quantity + 1 : item.quantity - 1;
        app.updateCartItem(item.id, newQuantity);
        rerender();
        return;
      }

      if (removeButton) {
        app.removeCartItem(removeButton.dataset.removeItem);
        rerender();
      }
    });

    summaryTarget.addEventListener("click", (event) => {
      const clearButton = event.target.closest("#clear-cart");

      if (!clearButton) {
        return;
      }

      app.clearCart();
      app.showToast("Carrinho limpo.");
      rerender();
    });

    rerender();
  });
})();
