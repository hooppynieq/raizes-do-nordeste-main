(function () {
  const app = window.RaizesApp;

  function renderSummary(target) {
    const unit = app.getCurrentUnit();
    const channel = app.getCurrentChannel();
    const serviceMode = app.getCurrentServiceMode();
    const labels = {
      retirada: "Retirada",
      delivery: "Delivery",
      "consumo-local": "Consumo no local"
    };

    target.innerHTML = `
      <div class="commerce-hero-grid">
        <div class="commerce-hero-main">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Contexto selecionado</p>
              <h2>${unit ? unit.name : "Nenhuma unidade selecionada"}</h2>
            </div>
            <span class="tag is-success">${channel.toUpperCase()} • ${labels[serviceMode] || serviceMode}</span>
          </div>
          <p>${unit ? `${unit.address} • ${unit.hours} • bairro ${unit.neighborhood}` : "Escolha uma unidade para seguir."}</p>
        </div>
        <aside class="commerce-hero-side">
          ${
            unit
              ? `
                <div class="card-media banner-media">
                  <img
                    src="${unit.image}"
                    alt="Ambiente e sabores da unidade ${unit.name}"
                    width="1536"
                    height="1024"
                    loading="eager"
                    decoding="async"
                    fetchpriority="high"
                  />
                </div>
              `
              : ""
          }
        </aside>
      </div>
    `;
  }

  function renderUnits(target, cityFilter) {
    const channel = app.getCurrentChannel();
    const filteredUnits = app
      .getUnits()
      .filter((unit) => unit.channels.includes(channel))
      .filter((unit) => cityFilter === "all" || unit.city === cityFilter);

    target.innerHTML = filteredUnits.length
      ? filteredUnits
          .map(
            (unit) => `
              <article class="unit-card">
                <div class="card-media unit-media">
                  <img
                    src="${unit.image}"
                    alt="Destaque visual da unidade ${unit.name}"
                    width="1536"
                    height="1024"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="card-title-row">
                  <h2>${unit.name}</h2>
                  <span class="tag is-success">${unit.status}</span>
                </div>
                <p>${unit.address} • ${unit.neighborhood}</p>
                <div class="chip-row">
                  <span class="chip">Nota ${unit.rating}</span>
                  <span class="chip">Preparo ${unit.eta}</span>
                  <span class="chip">Frete ${app.formatCurrency(unit.deliveryFee)}</span>
                </div>
                <ul class="feature-list">
                  ${unit.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}
                </ul>
                <div class="form-actions">
                  <button class="button button-primary" type="button" data-select-unit="${unit.id}">Selecionar unidade</button>
                </div>
              </article>
            `
          )
          .join("")
      : '<div class="empty-state">Nenhuma unidade disponível para os filtros escolhidos.</div>';
  }

  document.addEventListener("DOMContentLoaded", () => {
    const cityFilter = document.getElementById("unit-city-filter");
    const channelSelect = document.getElementById("channel-select");
    const serviceModeSelect = document.getElementById("service-mode-select");
    const summaryTarget = document.getElementById("selected-unit-summary");
    const unitsTarget = document.getElementById("units-grid");

    if (!cityFilter || !channelSelect || !serviceModeSelect || !summaryTarget || !unitsTarget) {
      return;
    }

    const cities = [...new Set(app.getUnits().map((unit) => unit.city))];
    cityFilter.insertAdjacentHTML(
      "beforeend",
      cities.map((city) => `<option value="${city}">${city}</option>`).join("")
    );

    channelSelect.value = app.getCurrentChannel();
    serviceModeSelect.value = app.getCurrentServiceMode();

    function rerender() {
      renderSummary(summaryTarget);
      renderUnits(unitsTarget, cityFilter.value);
    }

    cityFilter.addEventListener("change", rerender);

    channelSelect.addEventListener("change", () => {
      app.setCurrentChannel(channelSelect.value);
      rerender();
    });

    serviceModeSelect.addEventListener("change", () => {
      app.setCurrentServiceMode(serviceModeSelect.value);
      rerender();
    });

    unitsTarget.addEventListener("click", (event) => {
      const button = event.target.closest("[data-select-unit]");

      if (!button) {
        return;
      }

      app.setCurrentUnitId(button.dataset.selectUnit);
      app.showToast("Unidade selecionada.");
      window.location.href = "cardapio.html";
    });

    rerender();
  });
})();
