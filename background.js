var alphanumeric = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var availableKeys = getAvailableKeys();
var originalTabs = null;
var dummyFavIconUrl = chrome.extension.getURL("favicon/dummy_favicon.png");
var activeTabId;
var lastTabId;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var result = onMsgFuncDispatcher[request.action](request.args);
        sendResponse(result);
    }
);

var onMsgFuncDispatcher = {
    prepareLeap: function () {
        chrome.tabs.query({active: false, currentWindow: true}, function(tabs) {
            originalTabs = {};
            for (var i = 0; i < availableKeys.length && i < tabs.length; i++) {
                triggerChangeFavicon(tabs[i].id, getAlphanumericImageUrl(availableKeys[i]));
                originalTabs[availableKeys[i]] = tabs[i];
            }
        });
    },

    resetFaviconAll: function () {
        if (! originalTabs) return;
        // 全てのタブにやるのはどうなんだろう。どこかのタイミングでresetするべきかどうか判定するべきでは
        for (var i in originalTabs) {
            triggerResetFavicon(originalTabs[i].id);
        }
        originalTabs = null;
    },

    leap: function (args) {
        var code = args.code;
        if (availableKeys.indexOf(String.fromCharCode(code)) >= originalTabs.length) this.resetFaviconAll();
        chrome.tabs.update(originalTabs[String.fromCharCode(code)].id, {active: true});
    },

    getSettings: function () {
        return {
            availableKeys: availableKeys,
            prefixKeyEvent: getPrefixKeyEvent(),
            dummyFavIconUrl: dummyFavIconUrl
        };
    },

    leapLastTab: function () {
        chrome.tabs.update(lastTabId, {active: true});
    }
};

chrome.tabs.onActivated.addListener(function(activeInfo){
    lastTabId = activeTabId;
    activeTabId = activeInfo.tabId;
});




function triggerChangeFavicon(tabId, favIconUrl) {
    chrome.tabs.sendMessage(tabId, {
        action    : "changeFavicon",
        args: {favIconUrl: favIconUrl}
    });
}

// message送る系をfunction化したい
function triggerResetFavicon(tabId) {
    chrome.tabs.sendMessage(tabId, {
        action    : "resetFavicon"
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
    if (! doesPrefixEventHaveModifierKey())
        unavailableKeys += localStorage["prefixKey"];
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


// 同じコードはファイル切り出してbackgroundとfrontendでどっちも読みこめばいいのでは
function doesPrefixEventHaveModifierKey() {
    var prefixKeyEvent = getPrefixKeyEvent();
    return prefixKeyEvent.ctrlKey
    || prefixKeyEvent.metaKey
    || prefixKeyEvent.altKey;
}
