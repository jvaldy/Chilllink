describe("API messages, typing and channel access", () => {
  const password = Cypress.env("defaultPassword");

  const uniqueId = () => `${Date.now()}-${Cypress._.random(1000, 9999)}`;

  function setupOwnerAndMember() {
    const stamp = uniqueId();
    const context = {
      ownerEmail: `cypress-${stamp}-owner-msg@e2e.test`,
      memberEmail: `cypress-${stamp}-member-msg@e2e.test`,
      ownerToken: "",
      memberToken: "",
    };

    return cy
      .registerUser(context.ownerEmail, password)
      .then(() => cy.registerUser(context.memberEmail, password))
      .then(() => cy.loginUser(context.ownerEmail, password))
      .then((ownerToken) => {
        context.ownerToken = ownerToken;
        return cy.loginUser(context.memberEmail, password);
      })
      .then((memberToken) => {
        context.memberToken = memberToken;
        return context;
      });
  }

  function createWorkspace(ownerToken, name) {
    return cy.apiRequest({
      method: "POST",
      path: "/workspaces",
      token: ownerToken,
      body: { name },
    });
  }

  function createChannel(ownerToken, workspaceId, name) {
    return cy.apiRequest({
      method: "POST",
      path: `/workspaces/${workspaceId}/channels`,
      token: ownerToken,
      body: { name },
    });
  }

  it("denies message and typing access when workspace member is not in channel", () => {
    setupOwnerAndMember().then((ctx) => {
      createWorkspace(ctx.ownerToken, `locked-ws-${uniqueId()}`).then(
        (workspaceResponse) => {
          const workspaceId = workspaceResponse.body.id;

          cy.apiRequest({
            method: "POST",
            path: `/workspaces/${workspaceId}/members`,
            token: ctx.ownerToken,
            body: { email: ctx.memberEmail },
          }).its("status").should("eq", 200);

          createChannel(ctx.ownerToken, workspaceId, `locked-channel-${uniqueId()}`).then(
            (channelResponse) => {
              const channelId = channelResponse.body.id;

              cy.apiRequest({
                method: "GET",
                path: `/channels/${channelId}/messages`,
                token: ctx.memberToken,
                failOnStatusCode: false,
              }).then((listDenied) => {
                expect(listDenied.status).to.eq(403);
              });

              cy.apiRequest({
                method: "POST",
                path: `/channels/${channelId}/messages`,
                token: ctx.memberToken,
                body: { content: "blocked message" },
                failOnStatusCode: false,
              }).then((sendDenied) => {
                expect(sendDenied.status).to.eq(403);
              });

              cy.apiRequest({
                method: "POST",
                path: `/channels/${channelId}/typing`,
                token: ctx.memberToken,
                failOnStatusCode: false,
              }).then((typingDenied) => {
                expect(typingDenied.status).to.eq(403);
              });
            }
          );
        }
      );
    });
  });

  it("allows message lifecycle for author and blocks non-author edits", () => {
    setupOwnerAndMember().then((ctx) => {
      createWorkspace(ctx.ownerToken, `messages-ws-${uniqueId()}`).then(
        (workspaceResponse) => {
          const workspaceId = workspaceResponse.body.id;

          cy.apiRequest({
            method: "POST",
            path: `/workspaces/${workspaceId}/members`,
            token: ctx.ownerToken,
            body: { email: ctx.memberEmail },
          }).its("status").should("eq", 200);

          createChannel(ctx.ownerToken, workspaceId, `messages-channel-${uniqueId()}`).then(
            (channelResponse) => {
              const channelId = channelResponse.body.id;

              cy.apiRequest({
                method: "POST",
                path: `/workspaces/${workspaceId}/channels/${channelId}/members`,
                token: ctx.ownerToken,
                body: { email: ctx.memberEmail },
              }).its("status").should("eq", 200);

              cy.apiRequest({
                method: "POST",
                path: `/channels/${channelId}/typing`,
                token: ctx.memberToken,
              }).then((typingOk) => {
                expect(typingOk.status).to.eq(200);
                expect(typingOk.body.status).to.eq("ok");
              });

              cy.apiRequest({
                method: "POST",
                path: `/channels/${channelId}/messages`,
                token: ctx.ownerToken,
                body: { content: "owner message" },
              }).then((ownerSend) => {
                expect(ownerSend.status).to.eq(201);
                const ownerMessageId = ownerSend.body.id;

                cy.apiRequest({
                  method: "PATCH",
                  path: `/channels/${channelId}/messages/${ownerMessageId}`,
                  token: ctx.memberToken,
                  body: { content: "hijack attempt" },
                  failOnStatusCode: false,
                }).then((memberPatchDenied) => {
                  expect(memberPatchDenied.status).to.eq(403);
                });

                cy.apiRequest({
                  method: "DELETE",
                  path: `/channels/${channelId}/messages/${ownerMessageId}`,
                  token: ctx.memberToken,
                  failOnStatusCode: false,
                }).then((memberDeleteDenied) => {
                  expect(memberDeleteDenied.status).to.eq(403);
                });

                cy.apiRequest({
                  method: "PATCH",
                  path: `/channels/${channelId}/messages/${ownerMessageId}`,
                  token: ctx.ownerToken,
                  body: { content: "owner edited message" },
                }).then((ownerPatch) => {
                  expect(ownerPatch.status).to.eq(200);
                  expect(ownerPatch.body.content).to.eq("owner edited message");
                });

                cy.apiRequest({
                  method: "GET",
                  path: `/channels/${channelId}/messages/${ownerMessageId}`,
                  token: ctx.ownerToken,
                }).then((ownerShow) => {
                  expect(ownerShow.status).to.eq(200);
                  expect(ownerShow.body.content).to.eq("owner edited message");
                });

                cy.apiRequest({
                  method: "POST",
                  path: `/channels/${channelId}/messages`,
                  token: ctx.memberToken,
                  body: { content: "member message" },
                }).then((memberSend) => {
                  expect(memberSend.status).to.eq(201);
                  const memberMessageId = memberSend.body.id;

                  cy.apiRequest({
                    method: "GET",
                    path: `/channels/${channelId}/messages`,
                    token: ctx.ownerToken,
                  }).then((listResponse) => {
                    expect(listResponse.status).to.eq(200);
                    expect(listResponse.body.length).to.be.gte(2);
                  });

                  cy.apiRequest({
                    method: "DELETE",
                    path: `/channels/${channelId}/messages/${memberMessageId}`,
                    token: ctx.memberToken,
                  }).its("status").should("eq", 204);
                });

                cy.apiRequest({
                  method: "DELETE",
                  path: `/channels/${channelId}/messages/${ownerMessageId}`,
                  token: ctx.ownerToken,
                }).its("status").should("eq", 204);

                cy.apiRequest({
                  method: "GET",
                  path: `/channels/${channelId}/messages/${ownerMessageId}`,
                  token: ctx.ownerToken,
                  failOnStatusCode: false,
                }).then((deletedOwnerMessage) => {
                  expect(deletedOwnerMessage.status).to.eq(404);
                });
              });
            }
          );
        }
      );
    });
  });
});
