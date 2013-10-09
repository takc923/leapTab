var dummyInputElementId = "leaptab-dummy-element";
var availableKeys = "";
var prefixKeyEvent = {};
var dummyFavIconUrl = "";
var lastActiveElement;

window.addEventListener("load", function(){
    loadSettings(function(hasFavicon){
        // TODO: [origin]/favicon.ico にfaviconがある場合に対応する
        if (! hasFavicon) setDummyFavIcon();
        setDummyElement();

        document.addEventListener("keydown", function(evt){
            if (! isBeforeLeap() && isPrefixEvent(evt)) {
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
            } else if (isBeforeLeap() && evt.keyCode == 27){
                chrome.runtime.sendMessage({
                    action : "reset"
                });
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

function setDummyFavIcon() {
    var newLink = document.createElement("link");
    newLink.type = "image/x-icon";
    newLink.rel = "icon";
    newLink.href = dummyFavIconUrl;
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

// flagのhasFaviconと名前かぶってるのきもい
function hasFavicon(callback) {
    var links = document.head.getElementsByTagName("link");
    var iconLinks = [];
    // linksがnodelistのせいでfilterが使えなくなったからとりあえずこうしてるけど、リファクタリング出来ると思う
    for(var key in links) {
        if (links[key].rel != undefined
            && links[key].rel.search(/^\s*(shortcut\s+)?icon(\s+shortcut)?\s*$/i) != -1)
            // ここでcallback発動させてreturnでいいんじゃね
            iconLinks.push(links[key]);
    }

    if (iconLinks.length != 0) {
        callback(true);
        return;
    }

    var req = new XMLHttpRequest();
    req.open("GET", location.origin + "/favicon.ico");
    req.onload = function(){callback(true);};
    req.onerror = function(){callback(false);};
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
