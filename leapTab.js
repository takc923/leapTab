var availableKeys = "";

window.addEventListener("load", function(){
    chrome.runtime.sendMessage({
        action: "getSettings"
    }, function(response) {
        availableKeys = response.availableKeys;
    });
    document.addEventListener("keydown", function(evt){
        if (document.activeElement.tagName != "BODY")  return;
        if(! isBeforeLeap() && evt.keyCode == 65 && ! evt.shiftKey) {
            chrome.runtime.sendMessage({
                action : "prepareLeap"
            });
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
        }
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.action) {
    case "change" : favicon.change(request.favIconUrl); break;
    case "reset"       : reset();       break;
    }
});


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
    var linkDoms = document.head.getElementsByTagName("link");
    for(var i = 0; i < linkDoms.length; i++) {
        if (linkDoms[i].rel.search(/^\s*(shortcut)?\s*icon\s*(shortcut)?\s*$/i) != -1) {
            return linkDoms[i].href;
        }
    }
    return location.origin + "/favicon.ico";
}
