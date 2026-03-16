describe("Register", () => {
  const password = Cypress.env("defaultPassword");
  // Génère un email unique à chaque exécution pour éviter les collisions en base.
  const uniqueEmail = (suffix) =>
    `cypress-${Date.now()}-${Cypress._.random(1000, 9999)}-${suffix}@e2e.test`;

  beforeEach(() => {
    // Isole chaque test de l'état d'authentification précédent.
    cy.clearLocalStorage();
  });

  it("should load register page", () => {
    // Smoke test : le formulaire et le bouton principal sont visibles.
    cy.visit("/register");
    cy.contains("Inscription").should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.contains("button", "S'inscrire").should("be.visible");
  });

  it("should prevent submit when fields are empty", () => {
    // La validation HTML native doit bloquer l'appel réseau.
    cy.visit("/register");

    cy.window().then((win) => {
      cy.spy(win, "fetch").as("fetchSpy");
    });

    cy.contains("button", "S'inscrire").click();

    cy.get('input[type="email"]').then(($email) => {
      expect($email[0].checkValidity()).to.eq(false);
    });

    cy.get("@fetchSpy").should("not.have.been.called");
  });

  it("should show invalid state for malformed email", () => {
    // Un email mal formé doit être rejeté côté client.
    cy.visit("/register");

    cy.window().then((win) => {
      cy.spy(win, "fetch").as("fetchSpy");
    });

    cy.get('input[type="email"]').type("bad-email");
    cy.get('input[type="password"]').type(password);
    cy.contains("button", "S'inscrire").click();

    cy.get('input[type="email"]').then(($email) => {
      expect($email[0].checkValidity()).to.eq(false);
    });

    cy.get("@fetchSpy").should("not.have.been.called");
  });

  it("should display server error when email is already used", () => {
    // Crée d'abord un utilisateur, puis vérifie l'erreur de doublon.
    const email = uniqueEmail("duplicate");

    cy.registerUser(email, password).its("status").should("eq", 201);

    cy.visit("/register");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.contains("button", "S'inscrire").click();

    cy.contains("Email is already used.").should("be.visible");
    cy.url().should("include", "/register");
  });

  it("should display success message after successful registration", () => {
    // Cas nominal : message de succès et reset du formulaire.
    const email = uniqueEmail("success");

    cy.visit("/register");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.contains("button", "S'inscrire").click();

    cy.contains(/Compte.*succ/).should("be.visible");
    cy.get('input[type="email"]').should("have.value", "");
    cy.get('input[type="password"]').should("have.value", "");
  });
});
