(function () {
  const app = window.RaizesApp;
  const rewards = (window.RAIZES_MOCK && window.RAIZES_MOCK.rewards) || [];

  function renderOverview(target) {
    const loyalty = app.getLoyalty();
    const nextTierTarget = loyalty.points >= 220 ? 0 : loyalty.points >= 120 ? 220 - loyalty.points : 120 - loyalty.points;

    target.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">Status do relacionamento</p>
          <h2>Nível ${loyalty.tier}</h2>
        </div>
        <span class="tag is-success">${loyalty.points} pontos</span>
      </div>
      <div class="stats-grid">
        <article class="stat-card">
          <strong>${loyalty.points}</strong>
          <span>Pontos acumulados</span>
        </article>
        <article class="stat-card">
          <strong>${loyalty.redeemed.length}</strong>
          <span>Resgates realizados</span>
        </article>
        <article class="stat-card">
          <strong>${nextTierTarget}</strong>
          <span>Pontos para o próximo nível</span>
        </article>
      </div>
    `;
  }

  function renderRewards(target) {
    const loyalty = app.getLoyalty();

    target.innerHTML = rewards
      .map(
        (reward) => `
          <article class="reward-card">
            <div class="card-title-row">
              <h3>${reward.title}</h3>
              <span class="tag">${reward.points} pts</span>
            </div>
            <p>${reward.description}</p>
            ${
              loyalty.points >= reward.points
                ? `<button class="button button-primary" type="button" data-redeem-reward="${reward.id}">Resgatar</button>`
                : `<span class="tag is-neutral">Pontos insuficientes</span>`
            }
          </article>
        `
      )
      .join("");
  }

  function renderHistory(target) {
    const loyalty = app.getLoyalty();
    const orders = app.getOrders().slice(0, 5);

    target.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">Histórico</p>
          <h2>Movimentações recentes</h2>
        </div>
      </div>
      ${
        orders.length || loyalty.redeemed.length
          ? [
              ...orders.map(
                (order) => `
                  <article class="order-card">
                    <div class="card-title-row">
                      <h3>${order.id}</h3>
                      <span class="tag is-success">+${order.pointsEarned} pts</span>
                    </div>
                    <p>${app.formatDateTime(order.createdAt)}</p>
                  </article>
                `
              ),
              ...loyalty.redeemed.map(
                (reward) => `
                  <article class="order-card">
                    <div class="card-title-row">
                      <h3>${reward.title}</h3>
                      <span class="tag is-danger">-${reward.points} pts</span>
                    </div>
                    <p>${app.formatDateTime(reward.createdAt)}</p>
                  </article>
                `
              )
            ].join("")
          : '<div class="empty-state">Ainda não há movimentações registradas.</div>'
      }
    `;
  }

  function renderCampaigns(target) {
    const currentUnitId = app.getCurrentUnitId();
    const campaigns = app
      .getCampaigns()
      .filter((campaign) => campaign.unitId === currentUnitId || campaign.unitId === "all")
      .slice(0, 4);

    target.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">Campanhas ativas</p>
          <h2>Promoções com foco em retenção</h2>
        </div>
      </div>
      ${
        campaigns.length
          ? campaigns
              .map(
                (campaign) => `
                  <article class="campaign-card">
                    <div class="card-title-row">
                      <h3>${campaign.title}</h3>
                      <span class="tag">${campaign.discountRate}%</span>
                    </div>
                    <p>${campaign.description}</p>
                  </article>
                `
              )
              .join("")
          : '<div class="empty-state">Nenhuma campanha ativa para a unidade selecionada.</div>'
      }
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const overviewTarget = document.getElementById("loyalty-overview");
    const rewardsTarget = document.getElementById("rewards-grid");
    const historyTarget = document.getElementById("loyalty-history");
    const campaignsTarget = document.getElementById("loyalty-campaigns");

    if (!overviewTarget || !rewardsTarget || !historyTarget || !campaignsTarget) {
      return;
    }

    function rerender() {
      renderOverview(overviewTarget);
      renderRewards(rewardsTarget);
      renderHistory(historyTarget);
      renderCampaigns(campaignsTarget);
    }

    rewardsTarget.addEventListener("click", (event) => {
      const button = event.target.closest("[data-redeem-reward]");

      if (!button) {
        return;
      }

      const success = app.redeemReward(button.dataset.redeemReward);

      if (!success) {
        app.showToast("Pontos insuficientes para esse resgate.");
        return;
      }

      app.showToast("Recompensa resgatada com sucesso.");
      rerender();
    });

    rerender();
  });
})();
