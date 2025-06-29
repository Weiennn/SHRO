// Captures changes in tab URL to re-init the extension on dynamic url change

function urlChangeListener(tab_id, change, _) {
    console.log(tab_id);
    if (change.url) {
        browser.tabs.sendMessage(tab_id, "");
    }
}

browser.tabs.onUpdated.addListener(urlChangeListener)