describe('topbar spec', () => {
  it('topbar in rootpage', () => {
    cy.visit('/')

    cy.get('.top-bar').should('exist')
  })

  it('topbar have github logo', () => {
    cy.visit('/')

    cy.get('.top-bar').get('i').get('.cursor-pointer').should('exist')
  })

  it('topbar github logo can click to github.com', () => {
    cy.visit('/')

    cy.window().then((win) => {
      // cy.spy(win, 'open').as('redirect');
      cy.stub(win, 'open').as('open')
    });
    cy.get('.top-bar').get('i').get('.cursor-pointer.mr-6').click()

    // call open function with correct url
    cy.get('@open').should('be.calledWith', 'https://github.com/Alwayfeels/TaggingMusic', '_blank')
  })

  it('topbar have "开始使用" and click it can jump to HomeView', () => {
    cy.visit('/') 
    
    cy.get('.n-button').contains('开始使用').click()
    // url should be /home
    cy.url().should('eq', Cypress.config().baseUrl + '/#/home')
  })

  it('topbar can jump back root page according to click "TaggingMusic" logo', () => {
    cy.visit('/#/home') 
    
    cy.get('.top-bar').get('.text-2xl.cursor-pointer').click()
    // url should be /
    cy.url().should('eq', Cypress.config().baseUrl + '/#/')
  })

  it('topbar click "登录" button can show Login dialog', () => {
    cy.visit('/#/') 
    
    cy.get('.n-button').contains('登录').click()
    cy.get('.custom-card').should('exist')
  })

  it('topbar userinfo and avatar should be empty when not login', () => {
    cy.visit('/#/') 
    
    cy.get('.userinfo').should('not.exist')
    cy.get('.user-avatar.rounded').should('not.exist')
  })
})