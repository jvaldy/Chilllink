describe("Presentation: six key end-to-end scenarios", () => {
  const password = Cypress.env("defaultPassword");

  const uniqueId = () => `${Date.now()}-${Cypress._.random(1000, 9999)}`;
  const uniqueEmail = (suffix) => `cypress-${uniqueId()}-${suffix}@e2e.test`;

  function registerAndLogin(label) {
    const email = uniqueEmail(label);

    return cy
      .registerUser(email, password)
      .its("status")
      .should("eq", 201)
      .then(() => cy.loginUser(email, password))
      .then((token) => ({ email, token }));
  }

  it("Scenario 1: redirects unauthenticated user to login", () => {
    cy.clearLocalStorage();
    cy.visit("/dashboard");
    cy.url().should("include", "/login");
  });

  it("Scenario 2: registers a new user through API", () => {
    const email = uniqueEmail("register");

    cy.registerUser(email, password).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.message).to.match(/registered/i);
    });
  });

  it("Scenario 3: rejects duplicate registration", () => {
    const email = uniqueEmail("duplicate");

    cy.registerUser(email, password).its("status").should("eq", 201);

    cy.apiRequest({
      method: "POST",
      path: "/register",
      body: { email, password },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(409);
      expect(response.body.error).to.eq("Email is already used.");
    });
  });

  it("Scenario 4: logs in from UI and reaches dashboard", () => {
    const email = uniqueEmail("login-ui");

    cy.registerUser(email, password).its("status").should("eq", 201);

    cy.visit("/login");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.contains("button", "Se connecter").click();

    cy.url().should("include", "/dashboard");
    cy.contains("Mon compte").should("be.visible");
  });

  it("Scenario 5: owner creates workspace + channel", () => {
    registerAndLogin("owner-create").then(({ token }) => {
      const workspaceName = `ws-${uniqueId()}`;
      const channelName = `general-${uniqueId()}`;

      cy.apiRequest({
        method: "POST",
        path: "/workspaces",
        token,
        body: { name: workspaceName },
      }).then((workspaceResponse) => {
        expect(workspaceResponse.status).to.eq(201);
        const workspaceId = workspaceResponse.body.id;

        cy.apiRequest({
          method: "POST",
          path: `/workspaces/${workspaceId}/channels`,
          token,
          body: { name: channelName },
        }).then((channelResponse) => {
          expect(channelResponse.status).to.eq(201);
          expect(channelResponse.body.name).to.eq(channelName);
        });
      });
    });
  });

  it("Scenario 6: enforces channel access rules (lock then unlock)", () => {
    const ownerEmail = uniqueEmail("owner-acl");
    const memberEmail = uniqueEmail("member-acl");
    const workspaceName = `acl-ws-${uniqueId()}`;
    const channelName = `acl-ch-${uniqueId()}`;
    let ownerToken = "";
    let memberToken = "";

    cy.registerUser(ownerEmail, password)
      .its("status")
      .should("eq", 201)
      .then(() => cy.registerUser(memberEmail, password))
      .its("status")
      .should("eq", 201)
      .then(() => cy.loginUser(ownerEmail, password))
      .then((token) => {
        ownerToken = token;
        return cy.loginUser(memberEmail, password);
      })
      .then((token) => {
        memberToken = token;

        cy.apiRequest({
          method: "POST",
          path: "/workspaces",
          token: ownerToken,
          body: { name: workspaceName },
        }).then((workspaceResponse) => {
          const workspaceId = workspaceResponse.body.id;

          cy.apiRequest({
            method: "POST",
            path: `/workspaces/${workspaceId}/members`,
            token: ownerToken,
            body: { email: memberEmail },
          }).its("status").should("eq", 200);

          cy.apiRequest({
            method: "POST",
            path: `/workspaces/${workspaceId}/channels`,
            token: ownerToken,
            body: { name: channelName },
          }).then((channelResponse) => {
            const channelId = channelResponse.body.id;

            cy.apiRequest({
              method: "GET",
              path: `/channels/${channelId}/messages`,
              token: memberToken,
              failOnStatusCode: false,
            }).then((lockedResponse) => {
              expect(lockedResponse.status).to.eq(403);
            });

            cy.apiRequest({
              method: "POST",
              path: `/workspaces/${workspaceId}/channels/${channelId}/members`,
              token: ownerToken,
              body: { email: memberEmail },
            }).its("status").should("eq", 200);

            cy.apiRequest({
              method: "POST",
              path: `/channels/${channelId}/messages`,
              token: memberToken,
              body: { content: "hello from member" },
            }).then((messageResponse) => {
              expect(messageResponse.status).to.eq(201);
              expect(messageResponse.body.content).to.eq("hello from member");
            });
          });
        });
      });
  });
});
