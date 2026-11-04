(function () {
  const app = window.RaizesApp;

  function getFormField(form, name) {
    return form.elements.namedItem(name) || null;
  }

  function getServiceModeLabel(serviceMode) {
    const labels = {
      retirada: "Retirada",
      delivery: "Delivery",
      "consumo-local": "Consumo no local"
    };

    return labels[serviceMode] || serviceMode;
  }

  function renderSummary(target, details) {
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
          <p class="eyebrow">Resumo da cobrança</p>
          <h2>${details.unit.name}</h2>
        </div>
        <span class="tag">${getServiceModeLabel(details.serviceMode)}</span>
      </div>
      <div class="summary-emphasis">
        <span>Total da compra</span>
        <strong>${app.formatCurrency(details.total)}</strong>
        <p>${details.unit.city} • preparo médio ${details.unit.eta} • pagamento autorizado em fluxo externo.</p>
      </div>
      <ul class="detail-list">
        <li><span>Canal</span><strong>${app.getCurrentChannel().toUpperCase()}</strong></li>
        <li><span>Modalidade</span><strong>${getServiceModeLabel(details.serviceMode)}</strong></li>
        <li><span>Frete</span><strong>${app.formatCurrency(details.serviceFee)}</strong></li>
      </ul>
      ${details.items
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
        <li><span>Subtotal</span><strong>${app.formatCurrency(details.subtotal)}</strong></li>
        <li><span>Desconto</span><strong>${app.formatCurrency(details.discount)}</strong></li>
        <li><span>Frete</span><strong>${app.formatCurrency(details.serviceFee)}</strong></li>
        <li><span>Total</span><strong>${app.formatCurrency(details.total)}</strong></li>
      </ul>
      <ul class="trust-list">
        <li>Os dados mínimos seguem apenas para autenticação do pagamento e retorno do status.</li>
        <li>A confirmação visual é exibida antes do redirecionamento para o acompanhamento do pedido.</li>
      </ul>
    `;
  }

  function updateGatewayPreview(target, method, total) {
    const labels = {
      pix: "Pix instantâneo",
      cartao: "Cartão tokenizado",
      "vale-refeicao": "Autorização de benefício"
    };

    target.innerHTML = `
      <strong>Integração externa</strong>
      <p>O parceiro AsaPay receberá o valor ${app.formatCurrency(total)} via ${labels[method]} com retorno visual imediato ao cliente.</p>
      <ul class="trust-list">
        <li>Ambiente de homologação sem cobrança real.</li>
        <li>Fluxo apresentado com clareza para revisão antes do envio.</li>
      </ul>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const paymentEmpty = document.getElementById("payment-empty");
    const paymentContent = document.getElementById("payment-content");
    const summaryTarget = document.getElementById("checkout-summary");
    const paymentForm = document.getElementById("payment-form");
    const gatewayPreview = document.getElementById("gateway-preview");
    const confirmButton = document.getElementById("confirm-payment");
    const nameField = paymentForm ? getFormField(paymentForm, "customerName") : null;
    const emailField = paymentForm ? getFormField(paymentForm, "customerEmail") : null;
    const phoneField = paymentForm ? getFormField(paymentForm, "customerPhone") : null;
    const paymentMethodField = paymentForm ? getFormField(paymentForm, "paymentMethod") : null;
    let isSubmitting = false;

    if (!paymentEmpty || !paymentContent || !summaryTarget || !paymentForm || !gatewayPreview || !confirmButton) {
      return;
    }

    if (!nameField || !emailField || !phoneField || !paymentMethodField) {
      app.showToast("Não foi possível carregar os campos do pagamento.");
      return;
    }

    const details = app.getCartDetails();

    if (!details.items.length || !details.unit) {
      paymentEmpty.classList.remove("is-hidden");
      paymentContent.classList.add("is-hidden");
      return;
    }

    const session = app.getSession() || app.createGuestSession();
    nameField.value = session.name || "";
    emailField.value = session.email || "";
    phoneField.value = session.phone || "";

    renderSummary(summaryTarget, details);
    updateGatewayPreview(gatewayPreview, String(paymentMethodField.value || "pix"), details.total);

    paymentForm.addEventListener("change", () => {
      const formData = new FormData(paymentForm);
      updateGatewayPreview(gatewayPreview, String(formData.get("paymentMethod") || "pix"), app.getCartDetails().total);
    });

    paymentForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      const refreshedDetails = app.getCartDetails();

      if (!refreshedDetails.items.length || !refreshedDetails.unit) {
        app.showToast("Seu carrinho foi alterado. Revise os itens antes de pagar.");
        window.location.href = "carrinho.html";
        return;
      }

      if (typeof paymentForm.reportValidity === "function" && !paymentForm.reportValidity()) {
        return;
      }

      isSubmitting = true;
      confirmButton.disabled = true;
      confirmButton.textContent = "Enviando pagamento...";

      const formData = new FormData(paymentForm);
      const payload = Object.fromEntries(formData.entries());
      payload.paymentConsent = formData.get("paymentConsent") === "on";
      payload.termsConsent = formData.get("termsConsent") === "on";

      window.setTimeout(() => {
        try {
          const order = app.createOrder(payload);

          if (!order) {
            app.showToast("Não foi possível concluir o pedido.");
            isSubmitting = false;
            confirmButton.disabled = false;
            confirmButton.textContent = "Confirmar pagamento";
            return;
          }

          app.showToast("Pagamento aprovado no fluxo simulado.");
          window.location.href = "pedido.html";
        } catch (error) {
          console.error("Falha ao concluir pagamento:", error);
          app.showToast("O pagamento falhou. Tente novamente.");
          isSubmitting = false;
          confirmButton.disabled = false;
          confirmButton.textContent = "Confirmar pagamento";
        }
      }, 1200);
    });
  });
})();
