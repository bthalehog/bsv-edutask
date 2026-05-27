describe('E2E test of to-do', () => {
  // Reused variables (code reused from login.cy.js)
  let uid // user id
  let name // name of the user (firstName + ' ' + lastName)
  let email // email of the user

  // Code reused from login.cy.js
  before(function () {
    // create a fabricated user from a fixture
    cy.fixture('user.json')
      .then((user) => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user
        }).then((response) => {
          uid = response.body._id.$oid
          name = user.firstName + ' ' + user.lastName
          email = user.email
        })
      })
  })

  // Code reused from login.cy.js - changed to beforeEach for new test start state
  beforeEach('login to the system with an existing account', () => {
    // Make sure every test starts in a logged in state
    cy.visit('http://localhost:3000') // Added initial direction
    cy.contains('div', 'Email Address')
      .find('input[type=text]')
      .type(email)

    cy.get('form')
      .submit()

    cy.get('h1')
      .should('contain.text', 'Your tasks, ' + name)
  })

  it('R8UC1: TC1.1 Create new to-do with non-empty description', () => {
    // Create task with title and youtube-affiliation
    cy.get('#title')
      .type('TC1.1 Create new to-do')
    cy.get('#url')
      .type('j_uu6bJ2IGI')
    cy.contains('input[type="submit"]', 'Create new Task')
      .click()

    // Navigate to created task
    cy.contains('.title-overlay', 'TC1.1 Create new to-do')
      .click()

    cy.get('.popup .todo-list', { timeout: 20000 })
      .should('be.visible')

    // Add to-do and verify visibility
    cy.get('.popup input[placeholder="Add a new todo item"]')
      .scrollIntoView()
      .type('Test-todo 1')
    cy.get('.popup input[value="Add"]')
      .scrollIntoView()
      .click()
    cy.contains('.popup .todo-item', 'Test-todo 1')
      .should('be.visible')
  })

  it('R8UC1: TC1.2 Add button is disabled when description is empty', () => {
    // Create task with title and youtube-affiliation
    cy.get('#title')
      .type('TC1.2 Empty to-do description')
    cy.get('#url')
      .type('j_uu6bJ2IGI')
    cy.contains('input[type="submit"]', 'Create new Task')
      .click()

    // Navigate to created task
    cy.contains('.title-overlay', 'TC1.2 Empty to-do description')
      .click()

    cy.get('.popup .todo-list', { timeout: 20000 })
      .should('be.visible')

    // Verify that the input is empty
    cy.get('.popup input[placeholder="Add a new todo item"]')
      .scrollIntoView()
      .should('have.value', '')

    // Verify that the add button is disabled
    cy.get('.popup input[value="Add"]')
      .scrollIntoView()
      .should('be.disabled')
  })

  it('R8UC2: TC2.1 Toggle active to-do to completed', () => {
    // Create task with title and youtube-affiliation
    cy.get('#title')
      .type('TC2.1 Toggle active to completed')
    cy.get('#url')
      .type('j_uu6bJ2IGI')
    cy.contains('input[type="submit"]', 'Create new Task')
      .click()

    // Navigate to created task
    cy.contains('.title-overlay', 'TC2.1 Toggle active to completed')
      .click()

    cy.get('.popup .todo-list', { timeout: 20000 })
      .should('be.visible')

    // Verify default to-do is active
    cy.contains('.popup .todo-item', 'Watch video')
      .find('.checker')
      .should('have.class', 'unchecked')

    // Toggle to completed
    cy.contains('.popup .todo-item', 'Watch video')
      .find('.checker')
      .click()

    // Verify completed state
    cy.contains('.popup .todo-item', 'Watch video')
      .find('.checker')
      .should('have.class', 'checked')
  })

  it('R8UC2: TC2.2 Toggle completed to-do to active', () => {
    // Create task with title and youtube-affiliation
    cy.get('#title')
      .type('TC2.2 Toggle completed to active')
    cy.get('#url')
      .type('j_uu6bJ2IGI')
    cy.contains('input[type="submit"]', 'Create new Task')
      .click()

    // Navigate to created task
    cy.contains('.title-overlay', 'TC2.2 Toggle completed to active')
      .click()

    cy.get('.popup .todo-list', { timeout: 20000 })
      .should('be.visible')

    // First toggle the default to-do to completed
    cy.contains('.popup .todo-item', 'Watch video')
      .find('.checker')
      .click()

    cy.contains('.popup .todo-item', 'Watch video')
      .find('.checker')
      .should('have.class', 'checked')

    // Toggle it back to active
    cy.contains('.popup .todo-item', 'Watch video')
      .find('.checker')
      .click()

    // Verify active state
    cy.contains('.popup .todo-item', 'Watch video')
      .find('.checker')
      .should('have.class', 'unchecked')
  })

  it('R8UC3: TC3.1 Delete to-do', () => {
    // Create task with title and youtube-affiliation
    cy.get('#title')
      .type('TC3.1 Delete to-do')
    cy.get('#url')
      .type('j_uu6bJ2IGI')
    cy.contains('input[type="submit"]', 'Create new Task')
      .click()

    // Navigate to created task
    cy.contains('.title-overlay', 'TC3.1 Delete to-do')
      .click()

    cy.get('.popup .todo-list', { timeout: 20000 })
      .should('be.visible')

    // Delete default to-do
    cy.contains('.popup .todo-item', 'Watch video')
      .find('.remover')
      .click()

    // Verify that the to-do is removed from the popup
    cy.contains('.popup .todo-item', 'Watch video', { timeout: 20000 })
      .should('not.exist')
  })

  // Code reused from login.cy.js to clear test-data
  after(function () {
    // clean up by deleting the user from the database
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/users/${uid}`
    }).then((response) => {
      cy.log(response.body)
    })
  })
})