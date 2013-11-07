window.onload = function(){
    restore_options();
    document.getElementById("save-button").addEventListener("click",save_options);
};

// Saves options to chrome.storage.
function save_options() {
    var backgroundPage = chrome.extension.getBackgroundPage();
    var prefixKey = document.getElementById("prefix-key").value;
    if (prefixKey.length != 1
        || settings.alphanumeric.indexOf(prefixKey) == -1) {
        showMessage("<font color='#FF0000'>Invalid prefix key. It is a alphameric character.</font>");
        return;
    }

    var prefixModifierKey = document.getElementById("prefix-modifier-key").value;
    // TODO: clip this process into util or settings.
    var prefixKeyEvent = {
        keyCode  : prefixKey.toUpperCase().charCodeAt(0),
        shiftKey : prefixModifierKey == "shiftKey",
        ctrlKey  : prefixModifierKey == "ctrlKey",
        metaKey  : prefixModifierKey == "metaKey",
        altKey   : prefixModifierKey == "altKey"
    };
    var unbindKeys = document.getElementById("unbind-keys").value;
    var leapKeys = unbindKeys2leapKeys(
        unbindKeys,
        prefixKeyEvent
    );

    chrome.storage.sync.set({
        // for background and frontend js to get
        prefixKeyEvent: prefixKeyEvent,
        leapKeys : leapKeys,
        // for restore
        unbindKeys    : unbindKeys,
        prefixKey     : prefixKey,
        prefixModifierKey: prefixModifierKey
    },function() {
        if (chrome.runtime.lastError) {
            showMessage("<font color='#FF0000'>Failed to save...</font>");
        } else {
            backgroundPage.leapKeys = leapKeys;
            reloadSettings();

            showMessage("Saved!");
        }
    });
}

// Restores select box state to saved value from chrome.storage.
function restore_options() {
    chrome.storage.sync.get(["unbindKeys", "prefixKey", "prefixModifierKey"],function(items){
        document.getElementById("unbind-keys").value = items.unbindKeys || "";
        document.getElementById("prefix-key").value = items.prefixKey || settings.defaultPrefixKey;
        document.getElementById("prefix-modifier-key").value = items.prefixModifierKey || settings.defaultPrefixModifierKey;
    });
}

function reloadSettings() {
    chrome.windows.getAll({populate: true}, function(arrWin) {
        var tabs = [] ;
        for (var i in arrWin) {
            tabs = tabs.concat(arrWin[i].tabs);
        }
        for (var i in tabs) {
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

function unbindKeys2leapKeys(unbindKeys, prefixKeyEvent) {
    if (! settings.prefixKeyEvent.hasModifierKey()) {
        unbindKeys += util.getCharFromKeyEvent(prefixKeyEvent);
    }
    var leapKeys = "";
    for (var i = 0; i < settings.alphanumeric.length; i++) {
        if (unbindKeys.indexOf(settings.alphanumeric[i]) == -1) {
            leapKeys += settings.alphanumeric[i];
        }
    }
    return leapKeys;
}
