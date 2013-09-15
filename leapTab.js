// TODO: ここらへんの変数backgroundでも使ってるからまとめたい
// 1. globalな変数に入れる。window.settings的な
// 2. localstrageに入れる
var vimiumBinds = "bdfghijklnmoprtuxyzBFGHJKLNOPTX";
var originalTitle;
var beforeMoveFlag = false;
// TODO: alphanumericとalphabetsらへんの整理
var alphanumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
var alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
var bindedKeys = "";
for (var i = 0; i < alphanumeric.length; i++) {
    if (vimiumBinds.indexOf(alphanumeric[i]) == -1) {
        bindedKeys += alphanumeric[i];
    }
}

window.addEventListener("load", function(){
    originalTitle = document.title;
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
            evt.stopPropagation();
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

// TODO: 名前微妙 isEnableKeyとか有効なキーかどうか的な名前のほうが良さそう
function isBinded(code) {
    return bindedKeys.indexOf(String.fromCharCode(code)) != -1;
}

function change(args) {
    document.title = args.title;
}

function reset() {
    document.title = document.title.replace(/^.\| (.*)/, "$1");
}

function isAlphabet(code) {
    return alphabets.indexOf(String.fromCharCode(code)) != -1 ;
}
