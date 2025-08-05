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
  beforeEach(() => {
    cy.visit(`${Cypress.env("FRONTEND_URL")}/register`);
  });

  it("renders the form", () => {
    cy.get('[data-cy="register-form"]').should("exist");
  });

  it("navigates to login page", () => {
    cy.get('[data-cy="to-login"]').click();
    cy.url().should("include", "/login");
  });

  it("shows error when passwords do not match", () => {
    cy.get('[data-cy="input-username"]').type("testuser");
    cy.get('[data-cy="input-email"]').type("invalid_test@example.com");
    cy.get('[data-cy="input-password"]').type("password123");
    cy.get('[data-cy="input-confirm-password"]').type("differentpassword");
    cy.get('[data-cy="submit-register"]').click();

    cy.get('[data-cy="error-message"]')
      .should("exist")
      .and("contain", "Passwords do not match");
  });

  it("shows error when Email already exists", () => {
    cy.get('[data-cy="input-username"]').type("testuser");
    cy.get('[data-cy="input-email"]').type("test@example.com");
    cy.get('[data-cy="input-password"]').type("password123");
    cy.get('[data-cy="input-confirm-password"]').type("password123");
    cy.get('[data-cy="submit-register"]').click();

    cy.get('[data-cy="error-message"]')
      .should("exist")
      .and("contain", "Email already exists");
  });

  it("registers successfully and navigates to /todo", () => {
    const uuid = Math.random().toString(36).substring(2, 8);
    const email = `test+${uuid}@example.com`;

    cy.get('[data-cy="input-username"]').type(`user${uuid}`);
    cy.get('[data-cy="input-email"]').type(email);
    cy.get('[data-cy="input-password"]').type("password123");
    cy.get('[data-cy="input-confirm-password"]').type("password123");
    cy.get('[data-cy="submit-register"]').click();

    cy.url().should("include", "/todo");
  });
});

describe("Login page", () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env("FRONTEND_URL")}/login`);
  });

  it("renders the form", () => {
    cy.get('[data-cy="login-form"]').should("exist");
  });

  it("navigates to register page", () => {
    cy.get('[data-cy="to-register"]').click();
    cy.url().should("include", "/register");
  });

  it("shows error on invalid email", () => {
    cy.get('[data-cy="input-email"]').type("invalid@example.com");
    cy.get('[data-cy="input-password"]').type("wrongpass");
    cy.get('[data-cy="submit-login"]').click();

    cy.get('[data-cy="error-message"]')
      .should("exist")
      .and("contain", "Wrong email or password.");
  });

  it("shows error on invalid password", () => {
    cy.get('[data-cy="input-email"]').type("test@example.com");
    cy.get('[data-cy="input-password"]').type("wrongpass");
    cy.get('[data-cy="submit-login"]').click();

    cy.get('[data-cy="error-message"]')
      .should("exist")
      .and("contain", "Wrong email or password.");
  });

  it("logs in successfully and navigates to /todo", () => {
    //make sure that we have this user in database
    cy.get('[data-cy="input-email"]').type("test@example.com");
    cy.get('[data-cy="input-password"]').type("password123");
    cy.get('[data-cy="submit-login"]').click();

    cy.url().should("include", "/todo");
  });
});
