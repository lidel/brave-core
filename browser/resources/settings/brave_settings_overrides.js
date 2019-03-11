// Copyright (c) 2019 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

if (!BravePatching) {
  console.error('BravePatching was not available to brave_settings_overrides.js')
}

//
// Override, extend or modify existing modules
//

// Polymer Component Behavior injection (like superclasses)
BravePatching.RegisterPolymerComponentBehaviors({
  'settings-clear-browsing-data-dialog': [
    BraveClearBrowsingDataOnExitBehavior
  ]
})

// Templates
BravePatching.RegisterPolymerTemplateModifications({
  'settings-ui': (templateContent) => {
    // Take settings menu out of drawer and put permanently in DOM
    // TODO(petemill): If this becomes flakey on chromium rebases, consider
    // making our own settings-ui module template replacement since it's quite simple.
    const settingsMenuTemplate = templateContent.querySelector('#drawerTemplate')
    const container = templateContent.querySelector('#container')
    const drawer = templateContent.querySelector('cr-drawer')
    if (!settingsMenuTemplate || !container || !drawer) {
      console.warn('[brave overrides] settings-ui: could not find all the required elements for modification', { settingsMenuTemplate, container, drawer })
    }
    container.insertAdjacentElement('afterbegin', settingsMenuTemplate.content.querySelector('settings-menu'))
    drawer.remove()
  },
  'settings-menu': (templateContent) => {
    // Add title
    const titleEl = document.createElement('h1')
    titleEl.id = 'settingsHeader'
    titleEl.innerHTML = loadTimeData.getString('settings')
    const topMenuEl = templateContent.querySelector('#topMenu')
    if (!topMenuEl) {
      console.error('Could not find topMenu element to add title after')
    } else {
      topMenuEl.insertAdjacentElement('afterbegin', titleEl)
    }
    // Add Shields item
    const searchEl = templateContent.querySelector('a[href="/search"]')
    if (!searchEl) {
      console.error('Could not find search element to insert shields item before')
    }
    const shieldsEl = document.createElement('a')
    shieldsEl.href = '/shields'
    // TODO(petemill): translate
    shieldsEl.innerHTML = `
      <iron-icon icon="brave_settings:shields-success-o"></iron-icon>
      Shields
    `
    searchEl.insertAdjacentElement('beforebegin', shieldsEl)
  },
  'settings-basic-page': (templateContent) => {
    // Add 'Getting Started' section
    // Entire content is wrapped in another conditional template
    const actualTemplate = templateContent.querySelector('template')
    if (!actualTemplate) {
      console.error('Could not find basic-page template')
      return
    }
    const basicPageEl = actualTemplate.content.querySelector('#basicPage')
    if (!basicPageEl) {
      console.error('Could not find basicPage element to insert Getting Started section')
    } else {
      const gettingStartedEl = document.createElement('settings-section')
      gettingStartedEl.setAttribute('page-title', 'Getting Started')
      gettingStartedEl.setAttribute('section', 'getStarted')
      gettingStartedEl.innerHTML = `
        <brave-settings-getting-started prefs={{prefs}}></brave-settings-getting-started>
      `
      basicPageEl.insertAdjacentElement('afterbegin', gettingStartedEl)
    }
  }
})

// Icons
BravePatching.OverrideIronIcons('settings', 'brave_settings', {
  language: 'language',
  restore: 'reset'
})
BravePatching.OverrideIronIcons('cr', 'brave_settings', {
  person: 'logos-thumbs-up',
  search: 'search',
  ['file-download']: 'arrows-download',
  print: 'printer'
})

//
// Register any new modules
//

Polymer({
  is: 'brave-settings-getting-started'
})