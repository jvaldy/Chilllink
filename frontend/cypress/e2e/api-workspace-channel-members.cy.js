describe("API workspaces, channels and memberships", () => {
  const password = Cypress.env("defaultPassword");

  const uniqueId = () => `${Date.now()}-${Cypress._.random(1000, 9999)}`;

  function setupUsers({ includeMember = false, includeOutsider = false } = {}) {
    const stamp = uniqueId();
    const context = {
      ownerEmail: `cypress-${stamp}-owner@e2e.test`,
      memberEmail: `cypress-${stamp}-member@e2e.test`,
      outsiderEmail: `cypress-${stamp}-outsider@e2e.test`,
      ownerToken: "",
      memberToken: "",
      outsiderToken: "",
      ownerId: null,
      memberId: null,
      outsiderId: null,
    };

    let chain = cy
      .registerUser(context.ownerEmail, password)
      .then(() => cy.loginUser(context.ownerEmail, password))
      .then((token) => {
        context.ownerToken = token;
      })
      .then(() =>
        cy.apiRequest({
          method: "GET",
          path: "/me",
          token: context.ownerToken,
        })
      )
      .then((meResponse) => {
        context.ownerId = meResponse.body.id;
      });

    if (includeMember) {
      chain = chain
        .then(() => cy.registerUser(context.memberEmail, password))
        .then(() => cy.loginUser(context.memberEmail, password))
        .then((token) => {
          context.memberToken = token;
        })
        .then(() =>
          cy.apiRequest({
            method: "GET",
            path: "/me",
            token: context.memberToken,
          })
        )
        .then((meResponse) => {
          context.memberId = meResponse.body.id;
        });
    }

    if (includeOutsider) {
      chain = chain
        .then(() => cy.registerUser(context.outsiderEmail, password))
        .then(() => cy.loginUser(context.outsiderEmail, password))
        .then((token) => {
          context.outsiderToken = token;
        })
        .then(() =>
          cy.apiRequest({
            method: "GET",
            path: "/me",
            token: context.outsiderToken,
          })
        )
        .then((meResponse) => {
          context.outsiderId = meResponse.body.id;
        });
    }

    return chain.then(() => context);
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

  it("lets owner create, rename and delete a workspace", () => {
    setupUsers().then((ctx) => {
      const workspaceName = `ws-${uniqueId()}`;
      const updatedName = `ws-renamed-${uniqueId()}`;

      createWorkspace(ctx.ownerToken, workspaceName).then((createResponse) => {
        expect(createResponse.status).to.eq(201);
        const workspaceId = createResponse.body.id;

        cy.apiRequest({
          method: "GET",
          path: `/workspaces/${workspaceId}`,
          token: ctx.ownerToken,
        }).then((showResponse) => {
          expect(showResponse.status).to.eq(200);
          expect(showResponse.body.name).to.eq(workspaceName);
        });

        cy.apiRequest({
          method: "PATCH",
          path: `/workspaces/${workspaceId}`,
          token: ctx.ownerToken,
          body: { name: updatedName },
        }).then((patchResponse) => {
          expect(patchResponse.status).to.eq(200);
          expect(patchResponse.body.name).to.eq(updatedName);
        });

        cy.apiRequest({
          method: "DELETE",
          path: `/workspaces/${workspaceId}`,
          token: ctx.ownerToken,
        }).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(204);
        });

        cy.apiRequest({
          method: "GET",
          path: `/workspaces/${workspaceId}`,
          token: ctx.ownerToken,
          failOnStatusCode: false,
        }).then((deletedResponse) => {
          expect(deletedResponse.status).to.eq(404);
        });
      });
    });
  });

  it("blocks member from renaming and deleting owner workspace", () => {
    setupUsers({ includeMember: true }).then((ctx) => {
      const workspaceName = `rbac-ws-${uniqueId()}`;

      createWorkspace(ctx.ownerToken, workspaceName).then((createResponse) => {
        const workspaceId = createResponse.body.id;

        cy.apiRequest({
          method: "POST",
          path: `/workspaces/${workspaceId}/members`,
          token: ctx.ownerToken,
          body: { email: ctx.memberEmail },
        }).its("status").should("eq", 200);

        cy.apiRequest({
          method: "PATCH",
          path: `/workspaces/${workspaceId}`,
          token: ctx.memberToken,
          body: { name: "should-fail" },
          failOnStatusCode: false,
        }).then((renameByMember) => {
          expect(renameByMember.status).to.eq(403);
        });

        cy.apiRequest({
          method: "DELETE",
          path: `/workspaces/${workspaceId}`,
          token: ctx.memberToken,
          failOnStatusCode: false,
        }).then((deleteByMember) => {
          expect(deleteByMember.status).to.eq(403);
        });
      });
    });
  });

  it("manages workspace members and prevents removing workspace owner", () => {
    setupUsers({ includeMember: true }).then((ctx) => {
      createWorkspace(ctx.ownerToken, `members-ws-${uniqueId()}`).then(
        (createResponse) => {
          const workspaceId = createResponse.body.id;

          cy.apiRequest({
            method: "POST",
            path: `/workspaces/${workspaceId}/members`,
            token: ctx.ownerToken,
            body: { email: ctx.memberEmail },
          }).then((firstAdd) => {
            expect(firstAdd.status).to.eq(200);
            expect(firstAdd.body.status).to.eq("member_added");
          });

          cy.apiRequest({
            method: "POST",
            path: `/workspaces/${workspaceId}/members`,
            token: ctx.ownerToken,
            body: { email: ctx.memberEmail },
          }).then((secondAdd) => {
            expect(secondAdd.status).to.eq(200);
            expect(secondAdd.body.status).to.eq("already_member");
          });

          cy.apiRequest({
            method: "GET",
            path: `/workspaces/${workspaceId}/members`,
            token: ctx.ownerToken,
          }).then((listResponse) => {
            expect(listResponse.status).to.eq(200);
            const emails = listResponse.body.map((member) => member.email);
            expect(emails).to.include(ctx.ownerEmail);
            expect(emails).to.include(ctx.memberEmail);
          });

          cy.apiRequest({
            method: "DELETE",
            path: `/workspaces/${workspaceId}/members/${ctx.memberId}`,
            token: ctx.ownerToken,
          }).then((removeMemberResponse) => {
            expect(removeMemberResponse.status).to.eq(204);
          });

          cy.apiRequest({
            method: "DELETE",
            path: `/workspaces/${workspaceId}/members/${ctx.ownerId}`,
            token: ctx.ownerToken,
            failOnStatusCode: false,
          }).then((removeOwnerResponse) => {
            expect(removeOwnerResponse.status).to.eq(400);
          });
        }
      );
    });
  });

  it("enforces owner-only channel administration", () => {
    setupUsers({ includeMember: true }).then((ctx) => {
      createWorkspace(ctx.ownerToken, `channel-rbac-${uniqueId()}`).then(
        (workspaceResponse) => {
          const workspaceId = workspaceResponse.body.id;

          cy.apiRequest({
            method: "POST",
            path: `/workspaces/${workspaceId}/members`,
            token: ctx.ownerToken,
            body: { email: ctx.memberEmail },
          }).its("status").should("eq", 200);

          cy.apiRequest({
            method: "POST",
            path: `/workspaces/${workspaceId}/channels`,
            token: ctx.memberToken,
            body: { name: "member-forbidden-channel" },
            failOnStatusCode: false,
          }).then((memberCreateChannel) => {
            expect(memberCreateChannel.status).to.eq(403);
          });

          createChannel(ctx.ownerToken, workspaceId, `channel-${uniqueId()}`).then(
            (createChannelResponse) => {
              expect(createChannelResponse.status).to.eq(201);
              const channelId = createChannelResponse.body.id;

              cy.apiRequest({
                method: "GET",
                path: `/workspaces/${workspaceId}/channels`,
                token: ctx.memberToken,
              }).then((memberListChannels) => {
                expect(memberListChannels.status).to.eq(200);
                const channel = memberListChannels.body.find(
                  (c) => c.id === channelId
                );
                expect(channel).to.exist;
                expect(channel.isMember).to.eq(false);
              });

              cy.apiRequest({
                method: "PATCH",
                path: `/workspaces/${workspaceId}/channels/${channelId}`,
                token: ctx.ownerToken,
                body: { name: `channel-renamed-${uniqueId()}` },
              }).its("status").should("eq", 200);

              cy.apiRequest({
                method: "PATCH",
                path: `/workspaces/${workspaceId}/channels/${channelId}`,
                token: ctx.memberToken,
                body: { name: "member-rename-forbidden" },
                failOnStatusCode: false,
              }).then((memberRenameChannel) => {
                expect(memberRenameChannel.status).to.eq(403);
              });

              cy.apiRequest({
                method: "DELETE",
                path: `/workspaces/${workspaceId}/channels/${channelId}`,
                token: ctx.ownerToken,
              }).its("status").should("eq", 204);
            }
          );
        }
      );
    });
  });

  it("enforces channel membership business rules", () => {
    setupUsers({ includeMember: true, includeOutsider: true }).then((ctx) => {
      createWorkspace(ctx.ownerToken, `channel-members-${uniqueId()}`).then(
        (workspaceResponse) => {
          const workspaceId = workspaceResponse.body.id;

          cy.apiRequest({
            method: "POST",
            path: `/workspaces/${workspaceId}/members`,
            token: ctx.ownerToken,
            body: { email: ctx.memberEmail },
          }).its("status").should("eq", 200);

          createChannel(ctx.ownerToken, workspaceId, `ops-${uniqueId()}`).then(
            (channelResponse) => {
              const channelId = channelResponse.body.id;

              cy.apiRequest({
                method: "POST",
                path: `/workspaces/${workspaceId}/channels/${channelId}/members`,
                token: ctx.ownerToken,
                body: { email: ctx.memberEmail },
              }).then((firstAdd) => {
                expect(firstAdd.status).to.eq(200);
                expect(firstAdd.body.status).to.eq("member_added");
              });

              cy.apiRequest({
                method: "POST",
                path: `/workspaces/${workspaceId}/channels/${channelId}/members`,
                token: ctx.ownerToken,
                body: { email: ctx.memberEmail },
              }).then((secondAdd) => {
                expect(secondAdd.status).to.eq(200);
                expect(secondAdd.body.status).to.eq("already_member");
              });

              cy.apiRequest({
                method: "POST",
                path: `/workspaces/${workspaceId}/channels/${channelId}/members`,
                token: ctx.ownerToken,
                body: { email: ctx.outsiderEmail },
                failOnStatusCode: false,
              }).then((outsiderAdd) => {
                expect(outsiderAdd.status).to.eq(400);
                expect(outsiderAdd.body.errorCode).to.eq(
                  "USER_NOT_WORKSPACE_MEMBER"
                );
              });

              cy.apiRequest({
                method: "GET",
                path: `/workspaces/${workspaceId}/channels/${channelId}/members`,
                token: ctx.ownerToken,
              }).then((listMembers) => {
                expect(listMembers.status).to.eq(200);
                const emails = listMembers.body.map((member) => member.email);
                expect(emails).to.include(ctx.ownerEmail);
                expect(emails).to.include(ctx.memberEmail);
                expect(emails).not.to.include(ctx.outsiderEmail);
              });

              cy.apiRequest({
                method: "DELETE",
                path: `/workspaces/${workspaceId}/channels/${channelId}/members/${ctx.outsiderId}`,
                token: ctx.ownerToken,
              }).then((removeOutsider) => {
                expect(removeOutsider.status).to.eq(200);
                expect(removeOutsider.body.status).to.eq("not_member");
              });

              cy.apiRequest({
                method: "DELETE",
                path: `/workspaces/${workspaceId}/channels/${channelId}/members/${ctx.memberId}`,
                token: ctx.ownerToken,
              }).its("status").should("eq", 204);
            }
          );
        }
      );
    });
  });
});
