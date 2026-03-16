describe("Workspace, channel and messaging flows", () => {
  const password = Cypress.env("defaultPassword");

  it("lets owner create workspace/channel from UI and send a message", () => {
    const ownerEmail = `cypress-${Date.now()}-owner-ui@e2e.test`;
    const workspaceName = `ws-${Date.now()}`;
    const channelName = `chan-${Date.now()}`;
    const text = `hello-${Date.now()}`;

    cy.registerUser(ownerEmail, password).its("status").should("eq", 201);

    cy.loginUser(ownerEmail, password).then((token) => {
      cy.visitAs("/dashboard", token);
    });

    cy.get(".workspace-item.add").click();
    cy.get(".cl-modal .cl-input").first().type(workspaceName);
    cy.contains(".cl-modal .cl-btn-primary", "Creer").click();

    cy.get(".channel-menu-btn").click();
    cy.contains(".channel-menu-item", "Channel").click();

    cy.get(".cl-modal .cl-input").first().clear().type(channelName);
    cy.contains(".cl-modal .cl-btn-primary", "Creer").click();

    cy.contains(".channel-item", channelName).should("be.visible");

    cy.intercept("POST", "**/api/channels/*/messages").as("sendMessage");
    cy.get(".cl-composer-input").should("be.enabled").type(text);
    cy.get(".cl-composer-btn").click();

    cy.wait("@sendMessage")
      .its("response.statusCode")
      .should("eq", 201);
  });
});
