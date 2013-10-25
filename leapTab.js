var lastActiveElement;

window.addEventListener("load", function(){
    initialize(function(){
        var dummyElement = document.getElementById(settings.dummyInputElementId);

        dummyElement.addEventListener("blur", function(evt){
            chrome.runtime.sendMessage({
                action : "resetFaviconAll"
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
               && (util.hasModifierKey(settings.prefixKeyEvent) || document.activeElement.tagName == "BODY")) {
                lastActiveElement = document.activeElement;
                dummyElement.focus();
            } else if (isPrefixEvent(evt) && isBeforeLeap()) {
                chrome.runtime.sendMessage({
                    action : "leapLastTab"
                });
            } else if (isBeforeLeap() && isAvailableEvent(evt)){
                var character = util.getCharFromKeyEvent(evt);
                chrome.runtime.sendMessage({
                    action : "leap",
                    args: {character: character}
                });
                setTimeout(function(){
                    dummyElement.blur();
                }, 100);
            }
        });
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    onMsgDispatcher[request.action](request.args);
});

var onMsgDispatcher = {
    changeFavicon: function (args) {
        var favIconUrl = args.favIconUrl;
        var query = "link[rel~=icon][href='" + settings.dummyFavIconUrl + "'], link[rel~=icon]:not([href^=chrome-extension])";
        var faviconLinks = document.head.querySelectorAll(query);
        var exists = false;

        for (var i = 0; i < faviconLinks.length; i++) {
            faviconLinks[i].dataset.lastHref = faviconLinks[i].href;
            faviconLinks[i].href = favIconUrl;
            exists = true;
        }
        return exists;
    },
    resetFavicon: function (iconUrl) {
        var faviconLinks = document.head.querySelectorAll("link[rel~=icon][data-last-href]");
        var exists = false;

        for (var i = 0; i < faviconLinks.length; i++) {
            faviconLinks[i].href = faviconLinks[i].dataset.lastHref;
            exists = true;
        }
        return exists;
    },
    reloadSettings: loadSettings
}

function initialize(callback) {
    loadSettings(function() {
        setDummyElement();
        setIconLinkIfNotExists(callback);
    });
}

function setFavIconLink(favIconUrl) {
    var newLink = document.createElement("link");
    newLink.type = "image/x-icon";
    newLink.rel = "icon";
    newLink.href = favIconUrl;
    document.head.appendChild(newLink);
};

function loadSettings(callback) {
    chrome.storage.sync.get(["availableKeys", "prefixKeyEvent"], function(items) {
        if (chrome.extension.lastError) {
            console.log(chrome.extension.lastError.message);
            return;
        }
        settings.availableKeys = items.availableKeys || settings.alphanumeric;
        settings.prefixKeyEvent = items.prefixKeyEvent || settings.defaultPrefixKeyEvent;
        callback && callback();
    });
}

function isAvailableEvent(evt) {
    return settings.availableKeys.indexOf(String.fromCharCode(evt.keyCode)) != -1
    && ! evt.ctrlKey && ! evt.metaKey && ! evt.altKey;
}

function isBeforeLeap() {
    return document.activeElement.id == settings.dummyInputElementId;
}

function isPrefixEvent(evt) {
    return evt.shiftKey == settings.prefixKeyEvent.shiftKey
        && evt.ctrlKey  == settings.prefixKeyEvent.ctrlKey
        && evt.metaKey  == settings.prefixKeyEvent.metaKey
        && evt.altKey   == settings.prefixKeyEvent.altKey
        && evt.keyCode  == settings.prefixKeyEvent.keyCode;
}

function setIconLinkIfNotExists(callback) {
    if (document.head.querySelectorAll("link[rel~=icon]").length > 0) {
        callback();
        return;
    }

    var req = new XMLHttpRequest();
    req.open("GET", location.origin + "/favicon.ico");
    req.addEventListener("loadend", function(evt){
        var is_success = this.status == 200
                && this.getResponseHeader("Content-Length") != 0
                && this.getResponseHeader("Content-Type").search(/^image/) != -1;
        setFavIconLink(is_success ? location.origin + "/favicon.ico" : settings.dummyFavIconUrl);
        callback();
    });
    req.send();
}

function setDummyElement() {
    var dummyInput = document.createElement("input");
    dummyInput.type = "text";
    dummyInput.style.position = "fixed";
    dummyInput.style.top = "0px";
    dummyInput.style.left = "0px";
    dummyInput.style.opacity = "0";
    dummyInput.style.zIndex = "-100";
    dummyInput.id = settings.dummyInputElementId;
    document.body.appendChild(dummyInput);
}
