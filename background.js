var originalTabs = null;
var activeTabId;
var lastTabId;

settings.load();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var result = onMsgDispatcher[request.action](request.args);
        sendResponse(result);
    }
);

var onMsgDispatcher = {
    prepareLeap: function () {
        chrome.tabs.query({active: false, currentWindow: true}, function(tabs) {
            originalTabs = {};
            for (var i = 0; i < settings.leapKeys.length && i < tabs.length; i++) {
                chrome.tabs.sendMessage(tabs[i].id,{
                    action: "changeFavicon",
                    args  : {
                        favIconUrl: getAlphanumericImageUrl(settings.leapKeys[i])
                    }
                });
                originalTabs[settings.leapKeys[i]] = tabs[i];
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
        var character = args.character;
        if (settings.leapKeys.indexOf(character) >= originalTabs.length) this.resetFaviconAll();
        chrome.tabs.update(originalTabs[character].id, {active: true});
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
