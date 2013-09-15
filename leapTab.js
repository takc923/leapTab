// TODO: ここらへんの変数backgroundでも使ってるからまとめたい
// 1. globalな変数に入れる。window.settings的な
// 2. localstrageに入れる
var vimiumBinds = "bdfghijklnmoprtuxyzBFGHJKLNOPTX";
var originalFaviconUrl;
var originalTitle;
var beforeMoveFlag = false;
// TODO: 名前更新（英数字的なものに）
var alphanumeric = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
var bindedKeys = "";
for (var i = 0; i < alphanumeric.length; i++) {
    if (vimiumBinds.indexOf(alphanumeric[i]) == -1) {
        bindedKeys += alphanumeric[i];
    }
}

window.addEventListener("load", function(){
    originalTitle = document.title;
    originalFaviconUrl = getFavIconUrl();
    document.addEventListener("keydown", function(evt){
        if (document.activeElement.tagName != "BODY")  return;
        if(! beforeMoveFlag && evt.keyCode == 65 && ! evt.shiftKey) {
            beforeMoveFlag = true;
            chrome.runtime.sendMessage({
                action : "prepareMove"
            });
        }else if(beforeMoveFlag && isBinded(evt.keyCode)){
            beforeMoveFlag = false;
            chrome.runtime.sendMessage({
                action : "move",
                code   : (evt.shiftKey || ! isAlphabet(evt.keyCode)) ? evt.keyCode : evt.keyCode + 32
            });
        } else if (beforeMoveFlag && evt.keyCode == 27){
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
            case "move"        : move(request.args);        break;
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

// TODO: 名前微妙 isEnableKeyとか有効なキーかどうか的な名前のほうが良さそう
function isBinded(code) {
    return bindedKeys.indexOf(String.fromCharCode(code)) != -1;
}

function change(args) {
    document.title = args.title;
}

function reset() {
    favicon.change(originalFaviconUrl, originalTitle);
}

function isAlphabet(code) {
    return alphabets.indexOf(String.fromCharCode(code)) != -1 ;
}
