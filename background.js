var alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
var alphabetsHash = alphabets.split("");
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.action) {
        case "prepareMove" : prepareMove(); break;
        case "reset"       : reset();       break;
        case "move"        : move(request.code);reset();        break;
        }
    }
);

function prepareMove() {
    chrome.windows.getCurrent({populate: true}, function(win) {
        for (var i = 0; i < alphabetsHash.length && i < win.tabs.length; i++) {
            chrome.tabs.sendMessage(win.tabs[i].id, {
                action    : "change",
                args : {
                    faviconUrl: "http://developer.chrome.com/favicon.ico",
                    title     : "[" + alphabetsHash[i] + "] " + win.tabs[i].title
                }
            });
        }
    });
}

function reset() {
    chrome.windows.getCurrent({populate: true},function(win){
        for (var i = 0;i < win.tabs.length; i++) {
            chrome.tabs.sendMessage(win.tabs[i].id, {
                action    : "reset"
            });
        }
    });
}

function move(code) {
    chrome.windows.getCurrent({populate: true},function(win){
        if (alphabets.indexOf(String.fromCharCode(code)) >= win.tabs.length) reset();
        chrome.tabs.update(win.tabs[alphabets.indexOf(String.fromCharCode(code))].id, {selected: true});
    });
}
