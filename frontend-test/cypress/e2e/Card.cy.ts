describe("Card Management", () => {
  const boardName = "test-board";

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

  it("should create 2 new lists", () => {
    cy.contains(boardName).click();
    cy.get('[data-cy="add-list-button"]').click();
    cy.contains("New board").should("exist");

    cy.get('[data-cy^="edit-list-button-"]').last().click();

    cy.get('[data-cy^="input-edit-list-"]').clear().type("PENDING{enter}");
    cy.contains("PENDING").should("exist");

    cy.get('[data-cy="add-list-button"]').click();
    cy.contains("New board").should("exist");

    cy.get('[data-cy^="edit-list-button-"]').last().click();

    cy.get('[data-cy^="input-edit-list-"]').clear().type("SUCCESS{enter}");
    cy.contains("SUCCESS").should("exist");
  });

  it("should create a new card", () => {
    cy.contains(boardName).click();
    cy.get('[data-cy^="new-card-button-"]').first().click();

    cy.contains("create success").should("exist");
    cy.get('[data-cy^="card-button-"]').contains("New card").should("exist");
  });

  it("should open card modal and update card", () => {
    cy.contains(boardName).click();
    cy.get('[data-cy^="card-button-"]').first().click();

    cy.get('[data-cy="new-card-title"]').clear().type("Updated Title");
    cy.get('[data-cy="new-card-description"]')
      .clear()
      .type("Updated description");

    cy.get('[data-cy="update-button"]').click();

    cy.get('[data-cy="close-button"]').click();

    cy.contains("Update success").should("exist");
    cy.get('[data-cy^="card-button-"]')
      .first()
      .contains("Updated Title")
      .should("exist");
  });

  it("should move card to another list", () => {
    cy.contains(boardName).click();
    cy.get('[data-cy^="card-button-"]').first().click();

    cy.get('[data-cy="new-list-button"]').then(($select) => {
      const options = $select.find("option");
      const lastValue = options.last().val();

      // เลือก option สุดท้าย
      cy.wrap($select).select(lastValue as string);
    });

    cy.get('[data-cy="update-button"]').click();

    cy.get('[data-cy="close-button"]').click();

    cy.contains("Update success").should("exist");
    cy.get('[data-cy^="list-"]')
      .last()
      .contains("Updated Title")
      .should("exist");
  });

  it("should delete card", () => {
    cy.contains(boardName).click();
    cy.get('[data-cy^="card-button-"]').first().click();
    cy.get('[data-cy="deleted-button"]').click();

    cy.get('[data-cy^="card-button-"]').should("not.exist");
  });

  it("clear board", () => {
    cy.contains(boardName).click();
    cy.get('[data-cy="delete-button"]').click();
    cy.contains(boardName).should("not.exist");
  });
});
