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
        case "prepareLeap" : prepareLeap();      break;
        case "reset"       : reset();            break;
        case "leap"        : leap(request.code); break;
        }
    }
);

chrome.tabs.onActivated.addListener(reset);

function prepareLeap() {
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

function leap(code) {
    chrome.windows.getCurrent({populate: true}, function(win){
        if (bindedKeys.indexOf(String.fromCharCode(code)) >= win.tabs.length) reset();
        chrome.tabs.update(win.tabs[bindedKeys.indexOf(String.fromCharCode(code))].id, {active: true});
    });
}
