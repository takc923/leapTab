var availableKeys = getAvailableKeys();
var originalTabs;
var defaultFavIconUrl = chrome.extension.getURL("favicon/default_favicon.png");

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // applyとか使って書き直したい
        switch (request.action) {
        case "prepareLeap" : prepareLeap();      break;
        case "reset"       : reset();            break;
        case "leap"        : leap(request.code); break;
            // sendResponseここでやってんのなんとかしたい
        case "getSettings"        : sendResponse({
            availableKeys: availableKeys,
            // ここkeyとかeventとかの名前ちゃんとしたい。
            prefixEvent: keyStr2EventLikeObj(localStorage['prefixKey'] || "a")
        }); break;
        }
    }
);

chrome.tabs.onActivated.addListener(reset);

function prepareLeap() {
    // TODO: 今いるタブはスキップしたい
    chrome.windows.getCurrent({populate: true}, function(win) {
        originalTabs = win.tabs;
        for (var i = 0; i < availableKeys.length && i < win.tabs.length; i++) {
            changeFavicon(win.tabs[i].id, getAlphanumericImageUrl(availableKeys[i]));
        }
    });
}

function reset() {
    if (! originalTabs) return;
    for (var i = 0;i < originalTabs.length; i++) {
        // ここ綺麗にしたい。searchの中身もfrontendと同じだし
        // faviconのキャッシュとかでleapする前からalphanumericImageなことがあるので
        if (! originalTabs[i].favIconUrl || originalTabs[i].favIconUrl.search(/^chrome-extension.*ico$/) == 0) {
            originalTabs[i].favIconUrl = null;
        }
        changeFavicon(originalTabs[i].id, originalTabs[i].favIconUrl || defaultFavIconUrl);
    }
    originalTabs = null;
}

function leap(code) {
    chrome.windows.getCurrent({populate: true}, function(win){
        if (availableKeys.indexOf(String.fromCharCode(code)) >= win.tabs.length) reset();
        chrome.tabs.update(win.tabs[availableKeys.indexOf(String.fromCharCode(code))].id, {active: true});
    });
}

function changeFavicon(tabId, favIconUrl) {
    chrome.tabs.sendMessage(tabId, {
        action    : "change",
        favIconUrl: favIconUrl
    });
}

function getAlphanumericImageUrl(character) {
    var prefix = "";
    if(character.search(/^[0-9]$/) == 0) {
        prefix = "";
    } else if (character.search(/^[a-z]$/) == 0) {
        prefix = "s_";
    } else if (character.search(/^[A-Z]$/) == 0) {
        prefix = "c_";
    }
    return chrome.extension.getURL("favicon/" + prefix + character + ".ico");
}

// TODO: refactorしたい
function getAvailableKeys() {
    var unavailableKeys = localStorage["unbindKeys"] || "";
    var alphanumeric = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var availableKeys = "";
    for (var i = 0; i < alphanumeric.length; i++) {
        if (unavailableKeys.indexOf(alphanumeric[i]) == -1) {
            availableKeys += alphanumeric[i];
        }
    }
    return availableKeys;
}

function keyStr2EventLikeObj(keyStr) {
    return {
        shiftKey: keyStr.search(/^[A-Z]$/) == 0,
        keyCode: keyStr.toUpperCase().charCodeAt(0)
    };
}
