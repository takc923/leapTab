var availableKeys = getAvailableKeys();
var originalTabs = null;
var dummyFavIconUrl = chrome.extension.getURL("favicon/dummy_favicon.png");

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var result = {};
        switch (request.action) {
        case "prepareLeap" : prepareLeap();          break;
        case "reset"       : reset();                break;
        case "leap"        : leap(request.code);     break;
        case "getSettings" : result = getSettings(); break;
        }
        sendResponse(result);
    }
);

chrome.tabs.onActivated.addListener(reset);

function getSettings() {
    return {
        availableKeys: availableKeys,
        prefixKeyEvent: getPrefixKeyEvent(),
        dummyFavIconUrl: dummyFavIconUrl
    };
}

function prepareLeap() {
    chrome.tabs.query({active: false, currentWindow: true}, function(tabs) {
        originalTabs = {};
        for (var i = 0; i < availableKeys.length && i < tabs.length; i++) {
            changeFavicon(tabs[i].id, getAlphanumericImageUrl(availableKeys[i]));
            originalTabs[availableKeys[i]] = tabs[i];
        }
    });
}

function reset() {
    if (! originalTabs) return;
    for (var i in originalTabs) {
        if (! originalTabs[i].favIconUrl || originalTabs[i].favIconUrl.search(/^chrome-extension.*ico$/) == 0) {
            originalTabs[i].favIconUrl = null;
        }
        changeFavicon(originalTabs[i].id, originalTabs[i].favIconUrl || dummyFavIconUrl, true);
    }
    originalTabs = null;
}

function leap(code) {
    if (availableKeys.indexOf(String.fromCharCode(code)) >= originalTabs.length) reset();
    chrome.tabs.update(originalTabs[String.fromCharCode(code)].id, {active: true});
}

function changeFavicon(tabId, favIconUrl, isUndo) {
    chrome.tabs.sendMessage(tabId, {
        action    : "change",
        favIconUrl: favIconUrl,
        isUndo: isUndo
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

function getPrefixKeyEvent() {
    return {
        keyCode  : localStorage["prefixKey"].toUpperCase().charCodeAt(0),
        shiftKey : localStorage["prefixModifierKey"] == "shiftKey",
        ctrlKey  : localStorage["prefixModifierKey"] == "ctrlKey",
        metaKey  : localStorage["prefixModifierKey"] == "metaKey",
        altKey   : localStorage["prefixModifierKey"] == "altKey"
    };
}
