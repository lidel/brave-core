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

    // Add 'Get Started' item and remove 'People' item
    const peopleEl = templateContent.querySelector('a[href="/people"]')
    if (!peopleEl) {
      console.error('Could not find people menu element to insert Get Started next to and to remove')
    }
    const getStartedEl = document.createElement('a')
    getStartedEl.href = '/getStarted'
    // TODO(petemill): translate
    getStartedEl.innerHTML = `
      <iron-icon icon="brave_settings:logos-thumbs-up"></iron-icon>
      Get Started
    `
    peopleEl.insertAdjacentElement('afterend', getStartedEl)
    // Remove People item
    peopleEl.remove()
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
    // Routes
    const r = settings.router.routes_
    if (!r.BASIC) {
      console.error('Routes: could not find BASIC page')
    }
    r.GET_STARTED = r.BASIC.createSection('/getStarted', 'getStarted')
    r.SHIELDS = r.BASIC.createSection('/shields', 'braveShieldsDefaults');
    r.EXTENSIONS = r.BASIC.createSection('/extensions', 'extensions');
    r.BRAVE_SYNC = r.BASIC.createSection('/braveSync', 'braveSync');
    if (!r.SITE_SETTINGS) {
      console.error('Routes: could not find SITE_SETTINGS page')
    }
    r.SITE_SETTINGS_AUTOPLAY = r.SITE_SETTINGS.createChild('autoplay');
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
      const sectionsFromTop = document.createElement('div')
      sectionsFromTop.innerHTML = `
        <template is="dom-if" if="[[showPage_(pageVisibility.getStarted)]]">
          <settings-section page-title="Getting Started" section="getStarted">
            <brave-settings-getting-started prefs={{prefs}} page-visibility=[[pageVisibility]]></brave-settings-getting-started>
          </settings-section>
        </template>
        <template is="dom-if" if="[[showPage_(pageVisibility.extensions)]]">
          <settings-brave-default-extensions-page prefs="{{prefs}}"></settings-brave-default-extensions-page>
        </template>
        <template is="dom-if" if="[[showPage_(pageVisibility.braveSync)]]"
        restamp>
          <settings-section page-title="${loadTimeData.getString('braveSync')}" section="braveSync">
            <settings-brave-sync-page prefs="{{prefs}}"></settings-brave-sync-page>
          </settings-section>
        </template>
        <template is="dom-if" if="[[showPage_(pageVisibility.braveShieldsDefaults)]]"
        restamp>
          <settings-section page-title="${loadTimeData.getString('braveShieldsDefaults')}"
              section="braveShieldsDefaults">
            <settings-default-brave-shields-page  prefs="{{prefs}}"></settings-default-brave-shields-page>
          </settings-section>
        </template>
      `
      basicPageEl.insertAdjacentElement('afterbegin', sectionsFromTop)
      // Move 'search' to before 'appearance'
      const searchEl = actualTemplate.content.querySelector('template[if="[[showPage_(pageVisibility.search)]]"]')
      if (!searchEl) {
        console.error('Could not find original search section for moving')
      }
      sectionsFromTop.insertAdjacentElement('beforeend', searchEl)
      // Advanced
      const advancedTemplate = actualTemplate.content.querySelector('template[if="[[showAdvancedSettings_(pageVisibility.advancedSettings)]]"]')
      if (!advancedTemplate) {
        console.error('Could not find advanced section')
      }
    }
  }
})

// Icons
BravePatching.OverrideIronIcons('settings', 'brave_settings', {
  language: 'language',
  restore: 'reset'
})
BravePatching.OverrideIronIcons('cr', 'brave_settings', {
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