var vimiumBinds = "bdfghijklmnoprtuxyzBFGHJKLNOPTX0123456789";
var alphanumeric = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var bindedKeys = "";
for (var i = 0; i < alphanumeric.length; i++) {
    if (vimiumBinds.indexOf(alphanumeric[i]) == -1) {
        bindedKeys += alphanumeric[i];
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.action) {
        case "prepareMove" : prepareMove();      break;
        case "reset"       : reset();            break;
        case "move"        : move(request.code); break;
        }
    }
);

chrome.tabs.onActivated.addListener(reset);

function prepareMove() {
    // TODO: 今いるタブはスキップしたい
    chrome.windows.getCurrent({populate: true}, function(win) {
        for (var i = 0; i < bindedKeys.length && i < win.tabs.length; i++) {
            chrome.tabs.sendMessage(win.tabs[i].id, {
                action    : "change",
                args : {
                    character : bindedKeys[i]
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
        chrome.tabs.update(win.tabs[bindedKeys.indexOf(String.fromCharCode(code))].id, {active: true});
    });
}
