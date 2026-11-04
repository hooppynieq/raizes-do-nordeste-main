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

  function renderHero(target, order) {
    const unit = app.getUnits().find((entry) => entry.id === order.unitId);
    const status = app.getCurrentOrderStatus(order) || {
      title: "Pedido em processamento",
      description: "Acompanhe a atualização do fluxo em instantes."
    };

    target.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">Pedido confirmado</p>
          <h2>${order.id}</h2>
        </div>
        <span class="tag is-success">${status.title}</span>
      </div>
      <p>${unit ? unit.name : "Unidade"} • ${app.formatDateTime(order.createdAt)} • ${order.payment.provider}</p>
      <div class="chip-row">
        <span class="chip">Canal ${order.channel.toUpperCase()}</span>
        <span class="chip">${getServiceModeLabel(order.serviceMode)}</span>
        <span class="chip">Transação ${order.payment.transactionId}</span>
      </div>
    `;
  }

  function renderTimeline(target, order) {
    const currentIndex = app.getOrderProgress(order);

    target.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">Evolução do fluxo</p>
          <h2>Status do pedido</h2>
        </div>
      </div>
      <div class="timeline">
        ${order.statuses
          .map((status, index) => {
            let stateClass = "";

            if (index < currentIndex) {
              stateClass = "is-complete";
            } else if (index === currentIndex) {
              stateClass = "is-active";
            }

            return `
              <article class="timeline-item ${stateClass}">
                <h3>${status.title}</h3>
                <p>${status.description}</p>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderDetails(target, order) {
    target.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">Resumo final</p>
          <h2>Itens e totais</h2>
        </div>
      </div>
      ${order.items
        .map(
          (item) => `
            <article class="line-item">
              <header>
                <div>
                  <h3>${item.name}</h3>
                  <p class="muted-text">${item.quantity} x ${app.formatCurrency(item.price)}</p>
                </div>
                <strong>${app.formatCurrency(item.total)}</strong>
              </header>
            </article>
          `
        )
        .join("")}
      <ul class="summary-list">
        <li><span>Subtotal</span><strong>${app.formatCurrency(order.totals.subtotal)}</strong></li>
        <li><span>Desconto</span><strong>${app.formatCurrency(order.totals.discount)}</strong></li>
        <li><span>Frete</span><strong>${app.formatCurrency(order.totals.serviceFee)}</strong></li>
        <li><span>Total</span><strong>${app.formatCurrency(order.totals.total)}</strong></li>
        <li><span>Pontos gerados</span><strong>${order.pointsEarned}</strong></li>
      </ul>
      <div class="form-actions">
        <a class="button button-primary" href="fidelidade.html">Ver fidelidade</a>
        <a class="button button-secondary" href="cardapio.html">Novo pedido</a>
      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const order = app.getLatestOrder();
    const emptyState = document.getElementById("order-empty");
    const content = document.getElementById("order-content");
    const heroTarget = document.getElementById("order-hero");
    const timelineTarget = document.getElementById("order-timeline");
    const detailsTarget = document.getElementById("order-details");

    if (!emptyState || !content || !heroTarget || !timelineTarget || !detailsTarget) {
      return;
    }

    if (!order) {
      emptyState.classList.remove("is-hidden");
      content.classList.add("is-hidden");
      return;
    }

    function rerender() {
      renderHero(heroTarget, order);
      renderTimeline(timelineTarget, order);
      renderDetails(detailsTarget, order);
    }

    rerender();

    const intervalId = window.setInterval(() => {
      rerender();

      if (app.getOrderProgress(order) >= order.statuses.length - 1) {
        window.clearInterval(intervalId);
      }
    }, 2000);
  });
})();
