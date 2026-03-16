const apiUrl = Cypress.env("apiUrl");

Cypress.Commands.add("registerUser", (email, password) => {
  return cy.request("POST", `${apiUrl}/register`, {
    email,
    password,
  });
});

Cypress.Commands.add("loginUser", (email, password) => {
  return cy
    .request("POST", `${apiUrl}/login_check`, {
      email,
      password,
    })
    .then((response) => response.body.token);
});

Cypress.Commands.add("visitAs", (path, token) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem("authToken", token);
    },
  });
});

Cypress.Commands.add(
  "apiRequest",
  ({ method, path, token, body, qs, failOnStatusCode = true }) => {
    const normalizedPath = path.startsWith("http")
      ? path
      : `${apiUrl}${path.startsWith("/") ? path : `/${path}`}`;

    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    return cy.request({
      method,
      url: normalizedPath,
      headers,
      body,
      qs,
      failOnStatusCode,
    });
  }
);
