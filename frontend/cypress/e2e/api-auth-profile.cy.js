describe("API auth, me and profile", () => {
  const password = Cypress.env("defaultPassword");

  const uniqueEmail = (label) =>
    `cypress-${Date.now()}-${Cypress._.random(1000, 9999)}-${label}@e2e.test`;

  it("rejects duplicate registration", () => {
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

  it("returns current user with /me", () => {
    const email = uniqueEmail("me");

    cy.registerUser(email, password).its("status").should("eq", 201);
    cy.loginUser(email, password).then((token) => {
      cy.apiRequest({
        method: "GET",
        path: "/me",
        token,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.email).to.eq(email);
        expect(response.body).to.have.property("id");
        expect(response.body.roles).to.include("ROLE_USER");
      });
    });
  });

  it("creates then reads profile", () => {
    const email = uniqueEmail("profile");
    const profilePayload = {
      firstName: "Elise",
      lastName: "Bongou",
      birthDate: "1998-06-10",
      phoneNumber: "+33612345678",
      city: "Paris",
      country: "France",
      bio: "QA e2e profile",
    };

    cy.registerUser(email, password).its("status").should("eq", 201);
    cy.loginUser(email, password).then((token) => {
      cy.apiRequest({
        method: "GET",
        path: "/profile",
        token,
      }).then((initialProfile) => {
        expect(initialProfile.status).to.eq(204);
      });

      cy.apiRequest({
        method: "PATCH",
        path: "/profile",
        token,
        body: profilePayload,
      }).then((patchResponse) => {
        expect(patchResponse.status).to.eq(200);
        expect(patchResponse.body.firstName).to.eq(profilePayload.firstName);
        expect(patchResponse.body.lastName).to.eq(profilePayload.lastName);
        expect(patchResponse.body.phoneNumber).to.eq(profilePayload.phoneNumber);
      });

      cy.apiRequest({
        method: "GET",
        path: "/profile",
        token,
      }).then((profileResponse) => {
        expect(profileResponse.status).to.eq(200);
        expect(profileResponse.body.city).to.eq(profilePayload.city);
        expect(profileResponse.body.country).to.eq(profilePayload.country);
        expect(profileResponse.body.birthDate).to.contain("1998-06-10");
      });
    });
  });
});
