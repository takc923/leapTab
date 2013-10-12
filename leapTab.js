var dummyInputElementId = "leaptab-dummy-element";
var availableKeys = "";
var prefixKeyEvent = {};
var dummyFavIconUrl = "";
var lastActiveElement;

window.addEventListener("load", function(){
    loadSettings(function(){
        setDummyElement();
        var dummyElement = document.getElementById(dummyInputElementId);

        dummyElement.addEventListener("blur", function(evt){
            chrome.runtime.sendMessage({
                action : "reset"
            });
            // changing active tab trigger blur event, however it does NOT change activeElement.
            dummyElement.blur();
            lastActiveElement.focus();
        });

        dummyElement.addEventListener("focus", function(evt){
            chrome.runtime.sendMessage({
                action : "prepareLeap"
            });
        });

        document.addEventListener("keydown", function(evt){
            if (isPrefixEvent(evt) && ! isBeforeLeap()
               && (doesPrefixEventHaveModifierKey() || document.activeElement.tagName == "BODY")) {
                lastActiveElement = document.activeElement;
                dummyElement.focus();
            } else if (isPrefixEvent(evt) && isBeforeLeap()) {
                chrome.runtime.sendMessage({
                    action : "leapLastTab"
                });
            } else if (isBeforeLeap() && isAvailableEvent(evt)){
                chrome.runtime.sendMessage({
                    action : "leap",
                    // これもなんとかならんのか
                    code   : (evt.shiftKey || ! isAlphabet(evt.keyCode)) ? evt.keyCode : evt.keyCode + 32
                });
                setTimeout(function(){
                    dummyElement.blur();
                }, 100);
            }
        });
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.action) {
    case "changeFavicon" : changeFavicon(request.favIconUrl, request.isUndo); break;
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

function isAvailableEvent(evt) {
    return availableKeys.indexOf(String.fromCharCode(evt.keyCode)) != -1
    && ! evt.ctrlKey && ! evt.metaKey && ! evt.altKey;
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

// TODO: isUndoってどうなん、あとsetDummyなんとかとかぶってる。resetするならreset用に作ったほうがいいのでは
function changeFavicon(iconUrl, isUndo) {
    if (changeLinkIfExists(iconUrl, isUndo)) return;

    var newLink = document.createElement("link");
    newLink.type = "image/x-icon";
    newLink.rel = "icon";
    newLink.href = iconUrl;
    document.head.appendChild(newLink);
}

// changeFaviconとの違いが名前からわかりづらすぎる
function changeLinkIfExists(iconUrl, isUndo) {
    var faviconLinks = document.head.querySelectorAll("link[rel~=icon]");
    var exists = false;

    for (var key in faviconLinks) {
        // TODO: lastHrefをちゃんと定義できるattrにする的な
        if (isUndo && faviconLinks[key].lastHref != undefined) {
            faviconLinks[key].href = faviconLinks[key].lastHref;
        } else if (faviconLinks[key].href == dummyFavIconUrl || faviconLinks[key].href.search(/^chrome-extension:/) == -1) {
            faviconLinks[key].lastHref = faviconLinks[key].href;
            faviconLinks[key].href = iconUrl;
        }
        exists = true;
    }
    return exists;
}

// TODO: 名前おかしい
function hasFavicon(callback) {
    if (document.head.querySelectorAll("link[rel~=icon]").length > 0) {
        callback();
        return;
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
    return prefixKeyEvent.ctrlKey
    || prefixKeyEvent.metaKey
    || prefixKeyEvent.altKey;
}
