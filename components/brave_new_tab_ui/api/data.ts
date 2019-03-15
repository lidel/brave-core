/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { bindActionCreators } from 'redux'
import * as newTabActions from '../actions/new_tab_actions'
import store from '../store'
import { defaultState } from '../storage'
import * as backgroundAPI from './background'
import { debounce } from '../../common/debounce'
const keyName = 'new-tab-data'

/**
 * Get actions from the C++ back-end down to front-end components
 */
let actions: any
export const getActions = () => {
  if (actions) {
    return actions
  }
  actions = bindActionCreators(newTabActions, store.dispatch.bind(store))
  return actions
}

/**
 * Obtains the top sites and submits an action with the results
 */
export const fetchTopSites = () => {
  chrome.topSites.get((topSites: NewTab.Site[]) => {
    return getActions().topSitesDataUpdated(topSites || [])
  })
}

/**
 * Get initial data from the back-end
 * @param state - The application state
 */
export const getLoadTimeData = (state: NewTab.State) => {
  state = { ...state }
  state.stats = defaultState.stats
  ;['adsBlockedStat', 'trackersBlockedStat', 'javascriptBlockedStat',
    'httpsUpgradesStat', 'fingerprintingBlockedStat'].forEach((stat) => {
      state.stats[stat] = parseInt(chrome.getVariableValue(stat), 10) || 0
    })
  state.useAlternativePrivateSearchEngine = chrome.getVariableValue('useAlternativePrivateSearchEngine') === 'true'
  return state
}

/**
 * Get initial background data
 * @param state - The application state
 */
const cleanData = (state: NewTab.State): NewTab.State => {
  state = { ...state }
  state.backgroundImage = backgroundAPI.randomBackgroundImage()
  state = getLoadTimeData(state)
  return state
}

/**
 * Get and load all items from localStorage
 */
export const load = (): NewTab.State => {
  const data = window.localStorage.getItem(keyName)
  let state = defaultState
  if (data) {
    try {
      state = JSON.parse(data)
    } catch (e) {
      console.error('Could not parse local storage data: ', e)
    }
  }
  return cleanData(state)
}

/**
 * Set all items in localStorage
 */
export const debouncedSave = debounce<NewTab.State>((data: NewTab.State) => {
  if (data) {
    window.localStorage.setItem(keyName, JSON.stringify(cleanData(data)))
  }
}, 50)
