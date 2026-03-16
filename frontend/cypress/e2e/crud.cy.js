describe("CRUD core flows", () => {
  const password = Cypress.env("defaultPassword");
  const uniqueId = () => `${Date.now()}-${Cypress._.random(1000, 9999)}`;
  const uniqueEmail = (suffix) =>
    `cypress-${uniqueId()}-${suffix}@e2e.test`;

  function createUserAndToken(suffix) {
    const email = uniqueEmail(suffix);

    return cy
      .registerUser(email, password)
      .its("status")
      .should("eq", 201)
      .then(() => cy.loginUser(email, password))
      .then((token) => ({ email, token }));
  }

  it("should perform Workspace CRUD", () => {
    createUserAndToken("workspace-owner").then(({ token }) => {
      const workspaceName = `ws-${uniqueId()}`;
      const renamedWorkspace = `ws-renamed-${uniqueId()}`;

      cy.apiRequest({
        method: "POST",
        path: "/workspaces",
        token,
        body: { name: workspaceName },
      }).then((createResponse) => {
        expect(createResponse.status).to.eq(201);
        const workspaceId = createResponse.body.id;

        cy.apiRequest({
          method: "GET",
          path: `/workspaces/${workspaceId}`,
          token,
        }).then((showResponse) => {
          expect(showResponse.status).to.eq(200);
          expect(showResponse.body.name).to.eq(workspaceName);
        });

        cy.apiRequest({
          method: "PATCH",
          path: `/workspaces/${workspaceId}`,
          token,
          body: { name: renamedWorkspace },
        }).then((patchResponse) => {
          expect(patchResponse.status).to.eq(200);
          expect(patchResponse.body.name).to.eq(renamedWorkspace);
        });

        cy.apiRequest({
          method: "DELETE",
          path: `/workspaces/${workspaceId}`,
          token,
        }).its("status").should("eq", 204);

        cy.apiRequest({
          method: "GET",
          path: `/workspaces/${workspaceId}`,
          token,
          failOnStatusCode: false,
        }).its("status").should("eq", 404);
      });
    });
  });

  it("should perform Channel CRUD", () => {
    createUserAndToken("channel-owner").then(({ token }) => {
      const workspaceName = `ws-channel-${uniqueId()}`;
      const channelName = `general-${uniqueId()}`;
      const renamedChannel = `support-${uniqueId()}`;

      cy.apiRequest({
        method: "POST",
        path: "/workspaces",
        token,
        body: { name: workspaceName },
      }).then((workspaceResponse) => {
        const workspaceId = workspaceResponse.body.id;

        cy.apiRequest({
          method: "POST",
          path: `/workspaces/${workspaceId}/channels`,
          token,
          body: { name: channelName },
        }).then((createChannelResponse) => {
          expect(createChannelResponse.status).to.eq(201);
          const channelId = createChannelResponse.body.id;

          cy.apiRequest({
            method: "GET",
            path: `/workspaces/${workspaceId}/channels/${channelId}`,
            token,
          }).then((showChannelResponse) => {
            expect(showChannelResponse.status).to.eq(200);
            expect(showChannelResponse.body.name).to.eq(channelName);
          });

          cy.apiRequest({
            method: "PATCH",
            path: `/workspaces/${workspaceId}/channels/${channelId}`,
            token,
            body: { name: renamedChannel },
          }).then((patchChannelResponse) => {
            expect(patchChannelResponse.status).to.eq(200);
            expect(patchChannelResponse.body.name).to.eq(renamedChannel);
          });

          cy.apiRequest({
            method: "DELETE",
            path: `/workspaces/${workspaceId}/channels/${channelId}`,
            token,
          }).its("status").should("eq", 204);

          cy.apiRequest({
            method: "GET",
            path: `/workspaces/${workspaceId}/channels/${channelId}`,
            token,
            failOnStatusCode: false,
          }).its("status").should("eq", 404);
        });
      });
    });
  });

  it("should perform Message CRUD for author", () => {
    createUserAndToken("message-author").then(({ token }) => {
      const workspaceName = `ws-msg-${uniqueId()}`;
      const channelName = `chat-${uniqueId()}`;
      const messageContent = `hello-${uniqueId()}`;
      const messageEdited = `edited-${uniqueId()}`;

      cy.apiRequest({
        method: "POST",
        path: "/workspaces",
        token,
        body: { name: workspaceName },
      }).then((workspaceResponse) => {
        const workspaceId = workspaceResponse.body.id;

        cy.apiRequest({
          method: "POST",
          path: `/workspaces/${workspaceId}/channels`,
          token,
          body: { name: channelName },
        }).then((channelResponse) => {
          const channelId = channelResponse.body.id;

          cy.apiRequest({
            method: "POST",
            path: `/channels/${channelId}/messages`,
            token,
            body: { content: messageContent },
          }).then((createMessageResponse) => {
            expect(createMessageResponse.status).to.eq(201);
            const messageId = createMessageResponse.body.id;

            cy.apiRequest({
              method: "GET",
              path: `/channels/${channelId}/messages/${messageId}`,
              token,
            }).then((showMessageResponse) => {
              expect(showMessageResponse.status).to.eq(200);
              expect(showMessageResponse.body.content).to.eq(messageContent);
            });

            cy.apiRequest({
              method: "PATCH",
              path: `/channels/${channelId}/messages/${messageId}`,
              token,
              body: { content: messageEdited },
            }).then((patchMessageResponse) => {
              expect(patchMessageResponse.status).to.eq(200);
              expect(patchMessageResponse.body.content).to.eq(messageEdited);
            });

            cy.apiRequest({
              method: "DELETE",
              path: `/channels/${channelId}/messages/${messageId}`,
              token,
            }).its("status").should("eq", 204);

            cy.apiRequest({
              method: "GET",
              path: `/channels/${channelId}/messages/${messageId}`,
              token,
              failOnStatusCode: false,
            }).its("status").should("eq", 404);
          });
        });
      });
    });
  });

  it("should perform membership add/list/remove flows", () => {
    const ownerEmail = uniqueEmail("owner-membership");
    const memberEmail = uniqueEmail("member-membership");
    let ownerToken = "";
    let memberId = null;

    cy.registerUser(ownerEmail, password)
      .its("status")
      .should("eq", 201)
      .then(() => cy.registerUser(memberEmail, password))
      .its("status")
      .should("eq", 201)
      .then(() => cy.loginUser(ownerEmail, password))
      .then((token) => {
        ownerToken = token;
        return cy.apiRequest({
          method: "POST",
          path: "/workspaces",
          token: ownerToken,
          body: { name: `ws-membership-${uniqueId()}` },
        });
      })
      .then((workspaceResponse) => {
        const workspaceId = workspaceResponse.body.id;

        cy.apiRequest({
          method: "POST",
          path: `/workspaces/${workspaceId}/members`,
          token: ownerToken,
          body: { email: memberEmail },
        }).then((addMemberResponse) => {
          expect(addMemberResponse.status).to.eq(200);
          expect(addMemberResponse.body.status).to.eq("member_added");
          memberId = addMemberResponse.body.userId;
        });

        cy.apiRequest({
          method: "GET",
          path: `/workspaces/${workspaceId}/members`,
          token: ownerToken,
        }).then((listMembersResponse) => {
          const memberEmails = listMembersResponse.body.map((m) => m.email);
          expect(memberEmails).to.include(memberEmail);
          expect(memberEmails).to.include(ownerEmail);
        });

        cy.apiRequest({
          method: "POST",
          path: `/workspaces/${workspaceId}/channels`,
          token: ownerToken,
          body: { name: `channel-membership-${uniqueId()}` },
        }).then((channelResponse) => {
          const channelId = channelResponse.body.id;

          cy.apiRequest({
            method: "POST",
            path: `/workspaces/${workspaceId}/channels/${channelId}/members`,
            token: ownerToken,
            body: { email: memberEmail },
          }).then((addChannelMemberResponse) => {
            expect(addChannelMemberResponse.status).to.eq(200);
            expect(addChannelMemberResponse.body.status).to.eq("member_added");
          });

          cy.apiRequest({
            method: "GET",
            path: `/workspaces/${workspaceId}/channels/${channelId}/members`,
            token: ownerToken,
          }).then((listChannelMembersResponse) => {
            const channelMemberEmails = listChannelMembersResponse.body.map(
              (m) => m.email
            );
            expect(channelMemberEmails).to.include(memberEmail);
          });

          cy.apiRequest({
            method: "DELETE",
            path: `/workspaces/${workspaceId}/channels/${channelId}/members/${memberId}`,
            token: ownerToken,
          }).its("status").should("eq", 204);

          cy.apiRequest({
            method: "DELETE",
            path: `/workspaces/${workspaceId}/members/${memberId}`,
            token: ownerToken,
          }).its("status").should("eq", 204);
        });
      });
  });
});
