(function () {
  const app = window.RaizesApp;

  function renderStats(target) {
    const orders = app.getOrders();
    const campaigns = app.getCampaigns();
    const consent = app.getConsent();
    const averageTicket = orders.length
      ? orders.reduce((total, order) => total + order.totals.total, 0) / orders.length
      : 46.8;

    const stats = [
      { label: "Pedidos monitorados", value: orders.length || 18 },
      { label: "Ticket médio", value: app.formatCurrency(averageTicket) },
      { label: "Campanhas ativas", value: campaigns.length },
      { label: "Consentimento LGPD", value: consent.accepted ? "Ativo" : "Pendente" }
    ];

    target.innerHTML = stats
      .map(
        (stat) => `
          <article class="stat-card">
            <strong>${stat.value}</strong>
            <span>${stat.label}</span>
          </article>
        `
      )
      .join("");
  }

  function renderOrders(target) {
    const orders = app.getOrders().slice(0, 5);

    target.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">Fila operacional</p>
          <h2>Pedidos recentes</h2>
        </div>
      </div>
      ${
        orders.length
          ? orders
              .map((order) => {
                const status = app.getCurrentOrderStatus(order);
                return `
                  <article class="order-card">
                    <div class="card-title-row">
                      <h3>${order.id}</h3>
                      <span class="tag is-success">${status.title}</span>
                    </div>
                    <p>${app.formatDateTime(order.createdAt)} • ${app.formatCurrency(order.totals.total)}</p>
                    <p class="muted-text">${order.channel.toUpperCase()} • ${order.serviceMode}</p>
                  </article>
                `;
              })
              .join("")
          : '<div class="empty-state">Nenhum pedido real ainda. Gere pedidos no fluxo cliente para alimentar este painel.</div>'
      }
    `;
  }

  function renderPrivacyPanel(target) {
    const consent = app.getConsent();
    const alerts = (window.RAIZES_MOCK && window.RAIZES_MOCK.adminAlerts) || [];

    target.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">Privacidade e qualidade</p>
          <h2>Painel LGPD</h2>
        </div>
      </div>
      <div class="info-card">
        <h3>Status do consentimento</h3>
        <p>${consent.accepted ? "Consentimento registrado para a interface." : "Ainda não há aceite salvo no navegador."}</p>
        <p class="muted-text">Última atualização: ${consent.timestamp ? app.formatDateTime(consent.timestamp) : "não registrada"}</p>
      </div>
      ${alerts
        .map(
          (alert) => `
            <article class="campaign-card">
              <h3>Insight operacional</h3>
              <p>${alert}</p>
            </article>
          `
        )
        .join("")}
    `;
  }

  function renderUnitsPanel(target) {
    const units = app.getUnits();
    const campaigns = app.getCampaigns();

    target.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">Desempenho por unidade</p>
          <h2>Visão resumida da rede</h2>
        </div>
      </div>
      ${units
        .map(
          (unit) => `
            <article class="unit-card">
              <div class="card-title-row">
                <h3>${unit.name}</h3>
                <span class="tag">${unit.rating}</span>
              </div>
              <p>${unit.eta} • Frete ${app.formatCurrency(unit.deliveryFee)}</p>
              <p class="muted-text">${campaigns.filter((campaign) => campaign.unitId === unit.id || campaign.unitId === "all").length} campanhas visíveis</p>
            </article>
          `
        )
        .join("")}
    `;
  }

  function populateUnitSelect(select) {
    select.insertAdjacentHTML(
      "beforeend",
      app.getUnits().map((unit) => `<option value="${unit.id}">${unit.name}</option>`).join("")
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    const statsTarget = document.getElementById("admin-stats");
    const ordersTarget = document.getElementById("admin-orders");
    const privacyTarget = document.getElementById("privacy-panel");
    const unitsTarget = document.getElementById("admin-units");
    const campaignForm = document.getElementById("campaign-form");

    if (!statsTarget || !ordersTarget || !privacyTarget || !unitsTarget || !campaignForm) {
      return;
    }

    populateUnitSelect(campaignForm.unitId);

    function rerender() {
      renderStats(statsTarget);
      renderOrders(ordersTarget);
      renderPrivacyPanel(privacyTarget);
      renderUnitsPanel(unitsTarget);
    }

    campaignForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(campaignForm);
      const title = String(formData.get("title") || "").trim();

      app.saveCustomCampaign({
        id: `custom-${Date.now()}`,
        title,
        description: String(formData.get("description") || "").trim(),
        unitId: String(formData.get("unitId") || "all"),
        discountRate: Number(formData.get("discountRate") || 0),
        minimumOrder: Number(formData.get("minimumOrder") || 0),
        createdAt: Date.now(),
        slug: app.slugify(title)
      });

      campaignForm.reset();
      rerender();
      app.showToast("Campanha adicionada ao painel.");
    });

    rerender();
  });
})();
