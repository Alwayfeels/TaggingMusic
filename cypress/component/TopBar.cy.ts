/// <reference types="Cypress" />

import TopBar from '../../src/components/TopBar.vue';

describe('TopBar.cy.ts', () => {
  it('topbar component can mount', () => {
    cy.mount(TopBar)
  })

  it('topbar have github icon', () => {
    cy.mount(TopBar)
    cy.get('.cursor-pointer.mr-6.n-icon').should('exist');
  })

  it('topbar have app name', () => {
    cy.mount(TopBar)
    cy.contains('Tagging Music').should('exist');
  })

  it('topbar have login button', () => {
    cy.mount(TopBar)
    cy.get('.n-button').contains('登录').should('exist');
  })

  it('topbar should have not username and avatar when not login', () => {
    cy.mount(TopBar)
    cy.get('.user-avatar').should('not.exist');
    cy.get('.user-info').should('not.exist');
  })


  it('click 登录 btn can open dialog, and click close icon should close login dialog', () => {
    cy.mount(TopBar)
    cy.get('.n-modal-body-wrapper').should('not.exist');
    cy.get('.n-button').contains('登录').click();
    cy.get('.n-modal-body-wrapper').should('exist');
    cy.get('.n-modal-body-wrapper').contains('请使用手机端网易云音乐扫码登录').should('exist');
    cy.get('.n-card-header').get('.n-base-close').click();
    // 仍然挂在在 dom 上
    cy.clock()
    cy.tick(1000)
    cy.get('.n-modal-body-wrapper').contains('请使用手机端网易云音乐扫码登录').should('exist');
  })


  // it('click github icon should show github page', () => {
  //   cy.mount(TopBar)
  // })
})