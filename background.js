chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.action) {
        case "prepareMove" : prepareMove(); break;
        case "reset"       : reset();       break;
        case "move"        : move();        break;
        }
    }
);

function prepareMove() {
    chrome.windows.getCurrent({populate: true}, function(win) {
        var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
        for (var i = 0; i < alphabet.length && i < win.tabs.length; i++) {
            chrome.tabs.sendMessage(win.tabs[i].id, {
                action    : "change",
                args : {
                    faviconUrl: "http://developer.chrome.com/favicon.ico",
                    title     : "[" + alphabet[i] + "] " + win.tabs[i].title
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

function move() {
}
