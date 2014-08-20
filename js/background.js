// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
    {
         // That fires when on the LORIS Student Detail Schedule
         conditions: [
         new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostEquals: 'loris.wlu.ca', pathSuffix: 'CrseSchdDetl' },
          css    : ['table.datadisplaytable']
         })
         ],
         // And shows the extension's page action.
         actions: [ new chrome.declarativeContent.ShowPageAction() ]
       }
       ]);
  });
});

// Fired when a page action icon is clicked. This event will not fire if the page action has a popup.
chrome.pageAction.onClicked.addListener( function (tab) {

  // inject ics.min.js dependencies
  chrome.tabs.executeScript({
    file: 'js/ics.deps.min.js'
  });

  // inject ics.min.js library
  chrome.tabs.executeScript({
    file: 'js/ics.min.js'
  });

  // inject script to do the scrape the data and create .ics file
  chrome.tabs.executeScript({
    file: 'js/main.js'
  });

});