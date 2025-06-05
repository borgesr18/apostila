describe('Menu e edição', () => {
  it('carrega o menu inicial', () => {
    cy.visit('http://localhost:8000');
    cy.get('#recipeNav').should('exist');
  });

  it('entra em modo de edição de uma receita', () => {
    cy.visit('http://localhost:8000');
    cy.contains('Pães Básicos').click();
    cy.get('.nav-item').first().click();
    cy.get('#editRecipeButton').click();
    cy.get('#saveRecipeChangesButton').should('be.visible');
  });
});
