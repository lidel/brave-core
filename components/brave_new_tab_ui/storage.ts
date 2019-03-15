/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Initial state when profile is empty
 * This will be later populated with back-end information
 * such as default search engine and stats
 */
export const defaultState: NewTab.State = {
  topSites: [],
  ignoredTopSites: [],
  pinnedTopSites: [],
  gridSites: [],
  showEmptyPage: false,
  isIncognito: chrome.extension.inIncognitoContext,
  useAlternativePrivateSearchEngine: false,
  isTor: chrome.getVariableValue('isTor') === 'true',
  isQwant: chrome.getVariableValue('isQwant') === 'true',
  bookmarks: {},
  stats: {
    adsBlockedStat: 0,
    trackersBlockedStat: 0,
    javascriptBlockedStat: 0,
    httpsUpgradesStat: 0,
    fingerprintingBlockedStat: 0
  }
}
