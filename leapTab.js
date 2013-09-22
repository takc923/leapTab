var availableKeys = "";
var prefixKeyEvent = "";
var lastActiveElement;

window.addEventListener("load", function(){
    loadSettings();
    document.addEventListener("keydown", function(evt){
        if (document.activeElement.tagName != "BODY" && ! prefixKeyEvent.ctrlKey && ! prefixKeyEvent.metaKey && ! prefixKeyEvent.altKey)  return;
        if(! isBeforeLeap() && isPrefixEvent(evt)) {
            chrome.runtime.sendMessage({
                action : "prepareLeap"
            });
            lastActiveElement = document.activeElement;
            document.activeElement.blur();
        }else if(isBeforeLeap() && isBinded(evt.keyCode)){
            chrome.runtime.sendMessage({
                action : "leap",
                code   : (evt.shiftKey || ! isAlphabet(evt.keyCode)) ? evt.keyCode : evt.keyCode + 32
            });
            evt.stopPropagation();
        } else if (isBeforeLeap() && evt.keyCode == 27){
            chrome.runtime.sendMessage({
                action : "reset"
            });
            lastActiveElement.focus();
        }
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.action) {
    case "change" : favicon.change(request.favIconUrl); break;
    case "reloadSettings"       : loadSettings();       break;
    }
});

function loadSettings() {
    chrome.runtime.sendMessage({
        action: "getSettings"
    }, function(response) {
        availableKeys = response.availableKeys;
        prefixKeyEvent = response.prefixKeyEvent;
    });
}


// TODO: 名前微妙 isEnableKeyとか有効なキーかどうか的な名前のほうが良さそう
function isBinded(code) {
    return availableKeys.indexOf(String.fromCharCode(code)) != -1;
}

function isAlphabet(code) {
    return String.fromCharCode(code).search(/^[a-zA-Z]$/) == 0;
}

function isBeforeLeap() {
    return getFavIconUrl().search(/^chrome-extension.*ico$/) == 0;
}

function getFavIconUrl() {
    var linkElements = document.head.getElementsByTagName("link");
    for(var i = 0; i < linkElements.length; i++) {
        if (linkElements[i].rel.search(/^\s*(shortcut)?\s*icon\s*(shortcut)?\s*$/i) != -1) {
            return linkElements[i].href;
        }
    }
    return location.origin + "/favicon.ico";
}

function isPrefixEvent(evt) {
    return evt.shiftKey == prefixKeyEvent.shiftKey
        && evt.ctrlKey == prefixKeyEvent.ctrlKey
        && evt.metaKey == prefixKeyEvent.metaKey
        && evt.altKey == prefixKeyEvent.altKey
        && evt.keyCode == prefixKeyEvent.keyCode;
}
