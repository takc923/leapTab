var dummyInputElementId = "leaptab-dummy-element";
var availableKeys = "";
var prefixKeyEvent = {};
var dummyFavIconUrl = "";
var lastActiveElement;

window.addEventListener("load", function(){
    // ここinitialize的なものにして、 setDummyElementも中に入れちゃおうかな？
    loadSettings(function(){
        setDummyElement();

        document.getElementById(dummyInputElementId).addEventListener("blur", function(evt){
            chrome.runtime.sendMessage({
                action : "reset"
            });
            lastActiveElement.focus();
        });
        document.addEventListener("keydown", function(evt){
            if (! isBeforeLeap() && isPrefixEvent(evt)
                && (doesPrefixEventHaveModifierKey() || document.activeElement.tagName == "BODY")) {
                chrome.runtime.sendMessage({
                    action : "prepareLeap"
                });
                lastActiveElement = document.activeElement;
                document.getElementById(dummyInputElementId).focus();
            } else if (isBeforeLeap() && isAvailableKey(evt.keyCode)){
                chrome.runtime.sendMessage({
                    action : "leap",
                    // これもなんとかならんのか
                    code   : (evt.shiftKey || ! isAlphabet(evt.keyCode)) ? evt.keyCode : evt.keyCode + 32
                });
                evt.stopPropagation();
                setTimeout(function(){
                    document.getElementById(dummyInputElementId).blur();
                    lastActiveElement.focus();
                }, 100);
            }
        });
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.action) {
    case "change" : change(request.favIconUrl, request.isUndo); break;
    case "reloadSettings"       : loadSettings();       break;
    }
});

function setFavIconLink(favIconUrl) {
    var newLink = document.createElement("link");
    newLink.type = "image/x-icon";
    newLink.rel = "icon";
    newLink.href = favIconUrl;
    document.head.appendChild(newLink);
};

function loadSettings(callback) {
    chrome.runtime.sendMessage({
        action: "getSettings"
    }, function(response) {
        availableKeys = response.availableKeys;
        prefixKeyEvent = response.prefixKeyEvent;
        dummyFavIconUrl = response.dummyFavIconUrl;
        hasFavicon(callback);
    });
}

function isAvailableKey(code) {
    return availableKeys.indexOf(String.fromCharCode(code)) != -1;
}

function isAlphabet(code) {
    return String.fromCharCode(code).search(/^[a-zA-Z]$/) == 0;
}

function isBeforeLeap() {
    return document.activeElement.id == dummyInputElementId;
}

function isPrefixEvent(evt) {
    return evt.shiftKey == prefixKeyEvent.shiftKey
        && evt.ctrlKey == prefixKeyEvent.ctrlKey
        && evt.metaKey == prefixKeyEvent.metaKey
        && evt.altKey == prefixKeyEvent.altKey
        && evt.keyCode == prefixKeyEvent.keyCode;
}

// TODO: 名前変えろ
// TODO: isUndoってどうなん、あとsetDummyなんとかとかぶってる。resetするならreset用に作ったほうがいいのでは
function change(iconUrl, isUndo) {
    if (changeLinkIfExists(iconUrl, isUndo)) return;

    var newLink = document.createElement("link");
    newLink.type = "image/x-icon";
    newLink.rel = "icon";
    newLink.href = iconUrl;
    document.head.appendChild(newLink);
}

function changeLinkIfExists(iconUrl, isUndo) {
    var links = document.head.getElementsByTagName("link");
    var exists = false;
    // TODO: filterとかmapで書き換えられるよね
    for (var key in links) {
        if (links[key].rel != undefined && links[key].rel.search(/^\s*(shortcut\s+)?icon(\s+shortcut)?\s*$/i) != -1) {
            // googleとかw3.orgが戻らない
            if (isUndo && links[key].lastHref != undefined) {
                links[key].href = links[key].lastHref;
            } else if (links[key].href == dummyFavIconUrl || links[key].href.search(/^chrome-extension:/) == -1) {
                links[key].lastHref = links[key].href;
                links[key].href = iconUrl;
            }
            exists = true;
        }
    }
    return exists;
}

// TODO: 名前おかしい
function hasFavicon(callback) {
    var links = document.head.getElementsByTagName("link");
    var iconLinks = [];
    // linksがnodelistのせいでfilterが使えなくなったからとりあえずこうしてるけど、リファクタリング出来ると思う
    for(var key in links) {
        if (links[key].rel != undefined
            && links[key].rel.search(/^\s*(shortcut\s+)?icon(\s+shortcut)?\s*$/i) != -1) {
            callback();
            return;
        }
    }

    var req = new XMLHttpRequest();
    req.open("GET", location.origin + "/favicon.ico");
    req.addEventListener("loadend", function(evt){
        var is_success = evt.currentTarget.status == 200 && evt.currentTarget.response != "";
        setFavIconLink(is_success ? location.origin + "/favicon.ico" : dummyFavIconUrl);
        callback();
    });
    req.send();
}

// dummy elementにフォーカスしてるかどうかでprepare leapかどうかを判定できる
function setDummyElement() {
    var dummyInput = document.createElement("input");
    dummyInput.type = "text";
    dummyInput.style.position = "fixed";
    dummyInput.style.top = "0px";
    dummyInput.style.left = "0px";
    dummyInput.style.opacity = "0";
    dummyInput.style.zIndex = "-100";
    dummyInput.id = dummyInputElementId;
    document.body.appendChild(dummyInput);
}

function doesPrefixEventHaveModifierKey() {
    return prefixKeyEvent.shiftKey
    || prefixKeyEvent.ctrlKey
    || prefixKeyEvent.metaKey
    || prefixKeyEvent.altKey;
}
