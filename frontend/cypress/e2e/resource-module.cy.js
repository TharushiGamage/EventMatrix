describe("Resource Management Module Automated Tests", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173");
  });

  it("loads the EventMatrix login page", () => {
    cy.contains("EventMatrix").should("be.visible");
    cy.get('input[name="username"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.contains("Sign In").should("be.visible");
  });

  it("allows Resource Manager to login and view manager pages", () => {
    cy.get('input[name="username"]').type("Resource Manager");
    cy.get('input[name="password"]').type("resource123");
    cy.contains("Sign In").click();

    cy.contains("Resource Management").should("be.visible");
    cy.contains("Resource Manager").should("be.visible");

    cy.contains("Add Resource").should("be.visible");
    cy.contains("Resource List").should("be.visible");
    cy.contains("Request Approval").should("be.visible");
    cy.contains("Issue Management").should("be.visible");
    cy.contains("Notifications").should("be.visible");
  });

  it("allows Organizer to login and view organizer pages", () => {
    cy.get('input[name="username"]').type("Organizer");
    cy.get('input[name="password"]').type("organizer123");
    cy.contains("Sign In").click();

    cy.contains("Resource Management").should("be.visible");
    cy.contains("Organizer").should("be.visible");

    cy.contains("Reserve Resource").should("be.visible");
    cy.contains("Issue Report").should("be.visible");
    cy.contains("Notifications").should("be.visible");

    cy.contains("Add Resource").should("not.exist");
    cy.contains("Request Approval").should("not.exist");
  });

  it("shows validation error for invalid login", () => {
    cy.get('input[name="username"]').type("Wrong User");
    cy.get('input[name="password"]').type("wrong123");
    cy.contains("Sign In").click();

    cy.contains("Invalid username or password").should("be.visible");
  });
});