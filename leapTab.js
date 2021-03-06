var lastActiveElement;

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
        if (settings.prefixKeyEvent.equal(evt) && ! isBeforeLeap()
            && (settings.prefixKeyEvent.hasModifierKey() || document.activeElement.tagName == "BODY")) {
            lastActiveElement = document.activeElement;
            dummyElement.focus();
        } else if (settings.prefixKeyEvent.equal(evt) && isBeforeLeap()) {
            chrome.runtime.sendMessage({
                action : "leapLastTab"
            });
        } else if (isBeforeLeap() && settings.isLeapEvent(evt)){
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
    reloadSettings: function() { settings.load(); }
}

function initialize(callback) {
    settings.load(function() {
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

function isBeforeLeap() {
    return document.activeElement.id == settings.dummyInputElementId;
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
