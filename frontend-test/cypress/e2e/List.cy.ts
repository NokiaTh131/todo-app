describe("Todo List", () => {
  const boardName = "test-board";
  const listName = "My new list";
  const updatedName = "Updated list name";

  beforeEach(() => {
    cy.visit(`${Cypress.env("FRONTEND_URL")}/login`);
    cy.get('[data-cy="input-email"]').type("test@example.com");
    cy.get('[data-cy="input-password"]').type("password123");
    cy.get('[data-cy="submit-login"]').click();
    cy.url().should("include", "/todo");
  });

  it("create a new board", () => {
    cy.get('[data-cy="create-board-button"]').click();
    cy.get('[data-cy="input-board-name"]').type(boardName);
    cy.get('[data-cy="input-board-description"]').type("test description");
    cy.get('[data-cy="submit-board-button"]').click();

    cy.contains(boardName).should("exist");
  });

  it("should create a new list", () => {
    cy.get('[data-cy^="board-"]').first().click();
    cy.get('[data-cy="add-list-button"]').click();

    cy.contains("New board").should("exist");
  });

  it("should edit list name", () => {
    cy.get('[data-cy^="board-"]').first().click();
    cy.get('[data-cy^="edit-list-button-"]').last().click();

    cy.get('[data-cy^="input-edit-list-"]')
      .clear()
      .type(`${updatedName}{enter}`);

    cy.contains(updatedName).should("exist");
  });

  it("should delete the list", () => {
    cy.get('[data-cy^="board-"]').first().click();
    cy.get('[data-cy^="delete-list-"]').last().click();

    cy.contains(updatedName).should("not.exist");
  });
});
