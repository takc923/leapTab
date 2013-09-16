// TODO: ここらへんの変数backgroundでも使ってるからまとめたい
// 1. globalな変数に入れる。window.settings的な
// 2. localstrageに入れる
// 3. option pageで指定
var vimiumBinds = "bdfghijklnmoprtuxyzBFGHJKLNOPTX0123456789";
var originalFavIconUrl;
var beforeMoveFlag = false;
// TODO: alphanumericとalphabetsらへんの整理
var alphanumeric = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
var bindedKeys = "";
for (var i = 0; i < alphanumeric.length; i++) {
    if (vimiumBinds.indexOf(alphanumeric[i]) == -1) {
        bindedKeys += alphanumeric[i];
    }
}

window.addEventListener("load", function(){
    // TODO: resetするとき直前のfaviconにした方がいい
    originalFavIconUrl = getFavIconUrl();
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
    favicon.change(getAlphanumericImageUrl(args.character));
}

function reset() {
    favicon.change(originalFavIconUrl);
}

// 正規表現で出来るやろ...
function isAlphabet(code) {
    return alphabets.indexOf(String.fromCharCode(code)) != -1 ;
}

function getFavIconUrl() {
    var linkDoms = document.head.getElementsByTagName("link");
    for(var i = 0; i < linkDoms.length; i++) {
        if (linkDoms[i].rel.search(/^\s*(shortcut)?\s*icon\s*(shortcut)?\s*$/i) != -1) {
            return linkDoms[i].href;
        }
    }
    return location.origin + "/favicon.ico";
}

function getAlphanumericImageUrl(character) {
    var prefix = "";
    if(character.search(/^[0-9]$/) == 0) {
        prefix = "";
    } else if (character.search(/^[a-z]$/) == 0) {
        prefix = "s_";
    } else if (character.search(/^[A-Z]$/) == 0) {
        prefix = "c_";
    }
    return chrome.extension.getURL(prefix + character + ".ico");
}
