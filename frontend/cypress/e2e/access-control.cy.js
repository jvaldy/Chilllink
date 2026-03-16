describe("Access control and business rules", () => {
  const password = Cypress.env("defaultPassword");
  const apiUrl = Cypress.env("apiUrl");

  function seedScenario() {
    const stamp = Date.now();
    const ownerEmail = `cypress-${stamp}-owner-acl@e2e.test`;
    const memberEmail = `cypress-${stamp}-member-acl@e2e.test`;
    const outsiderEmail = `cypress-${stamp}-outsider-acl@e2e.test`;
    const context = {
      ownerEmail,
      memberEmail,
      outsiderEmail,
      ownerToken: "",
      memberToken: "",
      workspaceId: null,
      channelId: null,
    };

    return cy
      .registerUser(ownerEmail, password)
      .then(() => cy.registerUser(memberEmail, password))
      .then(() => cy.registerUser(outsiderEmail, password))
      .then(() => cy.loginUser(ownerEmail, password))
      .then((token) => {
        context.ownerToken = token;
        return cy.loginUser(memberEmail, password);
      })
      .then((token) => {
        context.memberToken = token;
        return cy.request({
          method: "POST",
          url: `${apiUrl}/workspaces`,
          headers: { Authorization: `Bearer ${context.ownerToken}` },
          body: { name: `acl-ws-${stamp}` },
        });
      })
      .then((workspaceRes) => {
        context.workspaceId = workspaceRes.body.id;
        return cy.request({
          method: "POST",
          url: `${apiUrl}/workspaces/${context.workspaceId}/members`,
          headers: { Authorization: `Bearer ${context.ownerToken}` },
          body: { email: context.memberEmail },
        });
      })
      .then(() => {
        return cy.request({
          method: "POST",
          url: `${apiUrl}/workspaces/${context.workspaceId}/channels`,
          headers: { Authorization: `Bearer ${context.ownerToken}` },
          body: { name: `acl-channel-${stamp}` },
        });
      })
      .then((channelRes) => {
        context.channelId = channelRes.body.id;
        return context;
      });
  }

  it("keeps channel locked for workspace member until owner adds membership", () => {
    seedScenario().then((ctx) => {
      cy.visitAs("/dashboard", ctx.memberToken);

      cy.get(".cl-composer-input").should("be.disabled");
      cy.contains(/channel verrouill/i).should("be.visible");

      cy.request({
        method: "POST",
        url: `${apiUrl}/workspaces/${ctx.workspaceId}/channels/${ctx.channelId}/members`,
        headers: { Authorization: `Bearer ${ctx.ownerToken}` },
        body: { email: ctx.memberEmail },
      }).its("status").should("eq", 200);

      cy.reload();

      cy.get(".cl-composer-input").should("be.enabled");
      cy.contains(/channel verrouill/i).should("not.exist");
    });
  });

  it("shows business error when adding outsider to channel", () => {
    seedScenario().then((ctx) => {
      cy.visitAs("/dashboard", ctx.ownerToken);

      cy.get(".chat-header-btn").click();
      cy.get(".cl-modal").should("be.visible");

      cy.get('.cl-modal input[placeholder*="email"]').type(ctx.outsiderEmail);
      cy.contains(".cl-modal .cl-btn-primary", "Ajouter").click();

      cy.contains(
        "Tu ne peux ajouter que des utilisateurs appartenant au workspace."
      ).should("be.visible");
    });
  });
});
