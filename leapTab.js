var availableKeys = "";
var prefixKeyEvent = "";
var dummyFavIconUrl = "";
var lastActiveElement;
// TODO: このフラグ使ってたら、prepareLeapしたあと、activeなタブを手動で変更した時flagがtrueのままfaviconが元に戻る。
var beforeLeapFlag = false;

window.addEventListener("load", function(){
    loadSettings(function(hasFavicon){
        if (! hasFavicon) setDummyFavIcon();

        document.addEventListener("keydown", function(evt){
            if (document.activeElement.tagName != "BODY" && ! prefixKeyEvent.ctrlKey && ! prefixKeyEvent.metaKey && ! prefixKeyEvent.altKey)  return;

            if(! isBeforeLeap() && isPrefixEvent(evt)) {
                chrome.runtime.sendMessage({
                    action : "prepareLeap"
                });
                lastActiveElement = document.activeElement;
                document.activeElement.blur();
                beforeLeapFlag = true;
            }else if(isBeforeLeap() && isAvailableKey(evt.keyCode)){
                chrome.runtime.sendMessage({
                    action : "leap",
                    code   : (evt.shiftKey || ! isAlphabet(evt.keyCode)) ? evt.keyCode : evt.keyCode + 32
                });
                evt.stopPropagation();
                beforeLeapFlag = false;
            } else if (isBeforeLeap() && evt.keyCode == 27){
                chrome.runtime.sendMessage({
                    action : "reset"
                });
                lastActiveElement.focus();
                beforeLeapFlag = false;
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
    return beforeLeapFlag;
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
            if (isUndo && links[key].lastHref != undefined) {
                links[key].href = links[key].lastHref;
            } else {
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
