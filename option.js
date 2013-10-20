window.onload = function(){
    restore_options();
    document.getElementById("save-button").addEventListener("click",save_options);
};

// Saves options to chrome.storage.
function save_options() {
    var backgroundPage = chrome.extension.getBackgroundPage();
    var prefixKey = document.getElementById("prefix-key").value;
    if (prefixKey.length != 1
        || backgroundPage.alphanumeric.indexOf(prefixKey) == -1) {
        showMessage("<font color='#FF0000'>prefix keyが不正です。英数字を1文字指定して下さい。</font>");
        return;
    }

    var prefixModifierKey = document.getElementById("prefix-modifier-key").value;
    var prefixKeyEvent = {
        keyCode  : prefixKey.toUpperCase().charCodeAt(0),
        shiftKey : prefixModifierKey == "shiftKey",
        ctrlKey  : prefixModifierKey == "ctrlKey",
        metaKey  : prefixModifierKey == "metaKey",
        altKey   : prefixModifierKey == "altKey"
    };
    var unbindKeys = document.getElementById("unbind-keys").value;
    var availableKeys = unbindKeys2availableKeys(
        unbindKeys,
        prefixKeyEvent
    );

    chrome.storage.sync.set({
        // for background and frontend js to get
        prefixKeyEvent: prefixKeyEvent,
        availableKeys : availableKeys,
        // for this js to restore
        unbindKeys    : unbindKeys,
        prefixKey     : prefixKey,
        prefixModifierKey: prefixModifierKey
    },function() {
        if (chrome.runtime.lastError) {
            showMessage("<font color='#FF0000'>保存に失敗しました。</font>");
        } else {
            backgroundPage.availableKeys = availableKeys;
            reloadSettings();

            showMessage("保存しました。");
        }
    });
}

// Restores select box state to saved value from chrome.torage.
function restore_options() {
    chrome.storage.sync.get(["unbindKeys", "prefixKey", "prefixModifierKey"],function(items){
        document.getElementById("unbind-keys").value = items.unbindKeys || "";
        document.getElementById("prefix-key").value = items.prefixKey || "";
        document.getElementById("prefix-modifier-key").value = items.prefixModifierKey || "";
    });
}

function reloadSettings() {
    chrome.windows.getAll({populate: true}, function(arrWin) {
        var tabs = [] ;
        for(var i = 0;i < arrWin.length; i++) {
            tabs = tabs.concat(arrWin[i].tabs);
        }
        for(var i = 0;i < tabs.length; i++) {
            chrome.tabs.sendMessage(tabs[i].id, {
                action    : "reloadSettings"
            });
        }
    });
}

function showMessage(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
    setTimeout(function() {
        status.innerHTML = "";
    }, 3000);
}

function unbindKeys2availableKeys(unbindKeys, prefixKeyEvent) {
    var alphanumeric = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (! doesPrefixEventHaveModifierKey(prefixKeyEvent))
        unbindKeys += String.fromCharCode(prefixKeyEvent.keyCode);
    var availableKeys = "";
    for (var i = 0; i < alphanumeric.length; i++) {
        if (unbindKeys.indexOf(alphanumeric[i]) == -1) {
            availableKeys += alphanumeric[i];
        }
    }
    return availableKeys;
}

function doesPrefixEventHaveModifierKey(prefixKeyEvent) {
    return prefixKeyEvent.ctrlKey
    || prefixKeyEvent.metaKey
    || prefixKeyEvent.altKey;
}
