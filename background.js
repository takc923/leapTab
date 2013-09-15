var vimiumBinds = "bdfghijklmnoprtuxyzBFGHJKLNOPTX";
var alphabets = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var bindedKeys = "";
for (var i = 0; i < alphabets.length; i++) {
    if (vimiumBinds.indexOf(alphabets[i]) == -1) {
        bindedKeys += alphabets[i];
    }
}

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
    // TODO: 今いるタブはスキップしたい
    chrome.windows.getCurrent({populate: true}, function(win) {
        for (var i = 0; i < bindedKeys.length && i < win.tabs.length; i++) {
            chrome.tabs.sendMessage(win.tabs[i].id, {
                action    : "change",
                args : {
                    faviconUrl: "http://developer.chrome.com/favicon.ico",
                    title     : bindedKeys[i] + "| " + win.tabs[i].title
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
    chrome.windows.getCurrent({populate: true}, function(win){
        if (bindedKeys.indexOf(String.fromCharCode(code)) >= win.tabs.length) reset();
        chrome.tabs.update(win.tabs[bindedKeys.indexOf(String.fromCharCode(code))].id, {selected: true});
    });
}
