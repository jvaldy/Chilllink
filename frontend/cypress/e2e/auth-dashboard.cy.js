describe("Login", () => {
  const password = Cypress.env("defaultPassword");
  const uniqueEmail = (suffix) =>
    `cypress-${Date.now()}-${Cypress._.random(1000, 9999)}-${suffix}@e2e.test`;

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("should load login page", () => {
    cy.visit("/login");
    cy.contains("Connexion").should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.contains("button", "Se connecter").should("be.visible");
  });

  it("should display required errors when fields are empty", () => {
    cy.visit("/login");

    cy.window().then((win) => {
      cy.spy(win, "fetch").as("fetchSpy");
    });

    cy.contains("button", "Se connecter").click();

    cy.get('input[type="email"]').then(($email) => {
      expect($email[0].checkValidity()).to.eq(false);
      expect($email[0].validationMessage).to.not.eq("");
    });

    cy.get("@fetchSpy").should("not.have.been.called");
    cy.url().should("include", "/login");
  });

  it("should display an error with invalid email format", () => {
    cy.visit("/login");

    cy.window().then((win) => {
      cy.spy(win, "fetch").as("fetchSpy");
    });

    cy.get('input[type="email"]').type("not-an-email");
    cy.get('input[type="password"]').type("ValidPass123!");
    cy.contains("button", "Se connecter").click();

    cy.get('input[type="email"]').then(($email) => {
      expect($email[0].checkValidity()).to.eq(false);
      expect($email[0].validationMessage).to.not.eq("");
    });

    cy.get("@fetchSpy").should("not.have.been.called");
    cy.url().should("include", "/login");
  });

  it("should display an error with incomplete email", () => {
    cy.visit("/login");

    cy.window().then((win) => {
      cy.spy(win, "fetch").as("fetchSpy");
    });

    cy.get('input[type="email"]').type("john@");
    cy.get('input[type="password"]').type("ValidPass123!");
    cy.contains("button", "Se connecter").click();

    cy.get('input[type="email"]').then(($email) => {
      expect($email[0].checkValidity()).to.eq(false);
      expect($email[0].validationMessage).to.not.eq("");
    });

    cy.get("@fetchSpy").should("not.have.been.called");
    cy.url().should("include", "/login");
  });

  it("should display a server error with valid email and valid password", () => {
    const email = uniqueEmail("server-error");

    cy.registerUser(email, password).its("status").should("eq", 201);

    cy.intercept("POST", "**/api/login_check", {
      statusCode: 500,
      body: { error: "Erreur serveur temporaire." },
    }).as("loginServerError");

    cy.visit("/login");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.contains("button", "Se connecter").click();

    cy.wait("@loginServerError");
    cy.contains("Erreur serveur temporaire.").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("should display a server error with wrong email and valid password", () => {
    cy.intercept("POST", "**/api/login_check", {
      statusCode: 401,
      body: {},
    }).as("loginWrongEmail");

    cy.visit("/login");
    cy.get('input[type="email"]').type("unknown-user@e2e.test");
    cy.get('input[type="password"]').type(password);
    cy.contains("button", "Se connecter").click();

    cy.wait("@loginWrongEmail");
    cy.contains("Identifiants invalides.").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("should display avatar button after successful login", () => {
    const email = uniqueEmail("success");

    cy.registerUser(email, password).its("status").should("eq", 201);

    cy.visit("/login");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.contains("button", "Se connecter").click();

    cy.url().should("include", "/dashboard");
    cy.get(".global-btn").should("contain.text", "Mon compte");
    cy.window().then((win) => {
      const token = win.localStorage.getItem("authToken");
      expect(token).to.be.a("string").and.not.to.be.empty;
    });
  });
});
