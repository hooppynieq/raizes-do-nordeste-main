(function () {
  const app = window.RaizesApp;

  function renderPromotions() {
    const promotionsTarget = document.getElementById("home-promotions");

    if (!promotionsTarget) {
      return;
    }

    promotionsTarget.innerHTML = app
      .getCampaigns()
      .slice(0, 3)
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
              <span class="tag">${campaign.discountRate}% off</span>
            </div>
            <p>${campaign.description}</p>
            <p class="muted-text">Pedido mínimo: ${app.formatCurrency(campaign.minimumOrder)}</p>
          </article>
        `
      )
      .join("");
  }

  function handleLogin() {
    const guestAccess = document.getElementById("guest-access");

    if (guestAccess) {
      guestAccess.addEventListener("click", () => {
        app.createGuestSession();
        app.showToast("Acesso como visitante liberado.");
        window.location.href = "unidades.html";
      });
    }

    document.querySelectorAll("[data-login-form]").forEach((loginForm) => {
      loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const email = String(formData.get("email") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "").trim();
        const user = app.getUsers().find((entry) => entry.email.toLowerCase() === email);

        if (!user) {
          app.showToast("Conta não encontrada. Use o cadastro ou entre como visitante.");
          return;
        }

        if (user.password !== password) {
          app.showToast("Senha inválida para a conta informada.");
          return;
        }

        app.setSession({ ...user });
        app.setCurrentChannel(user.preferredChannel || "web");
        app.setCurrentServiceMode(user.goal || "retirada");
        app.showToast(`Sessão iniciada para ${user.name}.`);
        window.location.href = loginForm.dataset.redirect || "unidades.html";
      });
    });
  }

  function handleRegister() {
    document.querySelectorAll("[data-register-form]").forEach((registerForm) => {
      registerForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(registerForm);
        const users = app.getUsers();
        const email = String(formData.get("email") || "").trim().toLowerCase();

        if (users.some((user) => user.email.toLowerCase() === email)) {
          app.showToast("Já existe uma conta com esse e-mail.");
          return;
        }

        const newUser = {
          id: `user-${Date.now()}`,
          name: String(formData.get("name") || "").trim(),
          email,
          phone: String(formData.get("phone") || "").trim(),
          password: String(formData.get("password") || "").trim(),
          preferredChannel: String(formData.get("preferredChannel") || "web"),
          goal: String(formData.get("goal") || "retirada"),
          marketing: formData.get("marketing") === "on",
          role: "customer"
        };

        users.push(newUser);
        app.saveUsers(users);
        app.setSession({ ...newUser });
        app.setCurrentChannel(newUser.preferredChannel);
        app.setCurrentServiceMode(newUser.goal);
        app.write(app.storageKeys.consent, {
          accepted: true,
          timestamp: Date.now(),
          marketing: newUser.marketing,
          source: registerForm.dataset.consentSource || "cadastro"
        });
        app.showToast("Cadastro concluído com sucesso.");
        window.location.href = registerForm.dataset.redirect || "unidades.html";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderPromotions();
    handleLogin();
    handleRegister();
  });
})();
