describe("Todo board", () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env("FRONTEND_URL")}/login`);
    cy.get('[data-cy="input-email"]').type("test@example.com");
    cy.get('[data-cy="input-password"]').type("password123");
    cy.get('[data-cy="submit-login"]').click();
    cy.url().should("include", "/todo");
  });

  it("can open create board modal", () => {
    cy.get('[data-cy="create-board-button"]').click();
    cy.get('[data-cy="input-board-name"]').should("exist");
  });

  it("can create a new board", () => {
    const id = Math.random().toString(36).substring(2, 7);
    const boardName = `Test Board ${id}`;

    cy.get('[data-cy="create-board-button"]').click();
    cy.get('[data-cy="input-board-name"]').type(boardName);
    cy.get('[data-cy="input-board-description"]').type("test description");
    cy.get('[data-cy="submit-board-button"]').click();

    cy.contains(boardName).should("exist");
  });

  it("can select a board and view it", () => {
    cy.get('[data-cy="delete-button"]').should("not.exist");
    cy.get('[data-cy="edit-button"]').should("not.exist");

    cy.get('[data-cy^="board-"]').first().click();

    cy.get('[data-cy="board-name"]').should("exist");
    cy.get('[data-cy="delete-button"]').should("exist");
    cy.get('[data-cy="edit-button"]').should("exist");
  });

  it("can edit a board", () => {
    const id = Math.random().toString(36).substring(2, 7);
    const boardName = `ToEdit ${id}`;
    const description = "old";
    const newName = `Edited-${id}`;
    const newDescription = "new";

    cy.get('[data-cy="create-board-button"]').click();
    cy.get('[data-cy="input-board-name"]').type(boardName);
    cy.get('[data-cy="input-board-description"]').type(description);
    cy.get('[data-cy="submit-board-button"]').click();

    cy.contains(boardName).click();

    cy.get('[data-cy="board-name"]').should("exist").and("contain", boardName);
    cy.get('[data-cy="board-description"]')
      .should("exist")
      .and("contain", description);

    cy.get('[data-cy="edit-button"]').click();
    cy.get('[data-cy="input-board-name"]').clear().type(newName);
    cy.get('[data-cy="input-board-description"]').clear().type(newDescription);
    cy.get('[data-cy="submit-board-button"]').click();

    cy.get('[data-cy="board-name"]').should("exist").and("contain", newName);
    cy.get('[data-cy="board-description"]')
      .should("exist")
      .and("contain", newDescription);
  });

  it("can delete a board", () => {
    const id = Math.random().toString(36).substring(2, 7);
    const boardName = `ToDelete ${id}`;

    cy.get('[data-cy="create-board-button"]').click();
    cy.get('[data-cy="input-board-name"]').type(boardName);
    cy.get('[data-cy="submit-board-button"]').click();

    cy.contains(boardName).click();

    cy.get('[data-cy="delete-button"]').click();

    cy.contains(boardName).should("not.exist");
  });
});
