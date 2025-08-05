describe("Home page", () => {
  it("connects", () => {
    const url = Cypress.env("FRONTEND_URL");
    cy.visit(url);
  });
  it("visit register page", () => {
    const url = Cypress.env("FRONTEND_URL");
    cy.visit(url);
    cy.get('[data-cy="register-button"]').click();
    cy.url().should("include", "/register");
  });
  it("visit login page", () => {
    const url = Cypress.env("FRONTEND_URL");
    cy.visit(url);
    cy.get('[data-cy="login-button"]').click();
    cy.url().should("include", "/login");
  });
});

describe("Register page", () => {
  it("connects", () => {
    const url = `${Cypress.env("FRONTEND_URL")}/register`;
    cy.visit(url);
  });
});
