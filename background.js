var alphanumeric = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var availableKeys;
// REFACTOR ME
setAvailableKeys();
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
                chrome.tabs.sendMessage(tabs[i].id,{
                    action: "changeFavicon",
                    args  : {
                        favIconUrl: getAlphanumericImageUrl(availableKeys[i])
                    }
                });
                originalTabs[availableKeys[i]] = tabs[i];
            }
        });
    },

    resetFaviconAll: function () {
        if (! originalTabs) return;
        for (var i in originalTabs) {
                chrome.tabs.sendMessage(originalTabs[i].id,{
                    action: "resetFavicon"
                });
        }
        originalTabs = null;
    },

    leap: function (args) {
        var code = args.code;
        if (availableKeys.indexOf(String.fromCharCode(code)) >= originalTabs.length) this.resetFaviconAll();
        chrome.tabs.update(originalTabs[String.fromCharCode(code)].id, {active: true});
    },

    leapLastTab: function () {
        chrome.tabs.update(lastTabId, {active: true});
    }
};

chrome.tabs.onActivated.addListener(function(activeInfo){
    lastTabId = activeTabId;
    activeTabId = activeInfo.tabId;
});

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

function setAvailableKeys() {
    chrome.storage.sync.get("availableKeys", function(items){
        availableKeys = items.availableKeys;
    });
}
