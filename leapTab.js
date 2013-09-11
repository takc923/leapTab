var originalFaviconUrl;
var originalTitle;
var beforeMoveFlag = false;
window.addEventListener("load", function(){
    originalTitle = document.title;
    originalFaviconUrl = getFavIconUrl();
    document.addEventListener("keypress", function(evt){
        if(! beforeMoveFlag && evt.keyCode == 116){
            beforeMoveFlag = true;
            chrome.runtime.sendMessage({
                action : "prepareMove"
            });
        }
        if(beforeMoveFlag && isAlphabetCharCode(evt.keyCode)){
            beforeMoveFlag = false;
            chrome.runtime.sendMessage({
                action : "move",
                code   : evt.keyCode
            });
        } else {
            beforeMoveFlag = false;
            chrome.runtime.sendMessage({
                action : "reset"
            });
        }
    });
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        switch (request.action) {
            case "change" : change(request.args); break;
            case "reset"       : reset();       break;
            case "move"        : move();        break;
        }
    });
});

function getFavIconUrl() {
    var linkDoms = document.head.getElementsByTagName("link");
    for(var i = 0; i < linkDoms.length; i++) {
        if (linkDoms[i].rel.indexOf("icon") != -1) {
            return linkDoms[i].href;
        }
    }
    return location.origin + "/favicon.ico";
}

function isAlphabetCharCode(code) {
    return code >= 65 && code <= 90 && code >= 97 && code <= 122;
}

function change(args) {
    console.log(args);
    document.title = args.title;
}

function reset() {
    console.log("まさか...?");
    favicon.change(originalFaviconUrl, originalTitle);
}

function move() {
}
