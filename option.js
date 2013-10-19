window.onload = function(){
    restore_options();
    document.getElementById("save-button").addEventListener("click",save_options);
};

// Saves options to localStorage.
function save_options() {
    var backgroundPage = chrome.extension.getBackgroundPage();
    var prefixKey = document.getElementById("prefix-key").value;
    if (prefixKey.length != 1
        || backgroundPage.alphanumeric.indexOf(prefixKey) == -1) {
        showMessage("<font color='#FF0000'>prefix keyが不正です。英数字を1文字指定して下さい。</font>");
        return;
    }

    localStorage["prefixKey"] = document.getElementById("prefix-key").value;
    localStorage["unbindKeys"] = document.getElementById("unbind-keys").value;
    localStorage["prefixKey"] = prefixKey;
    localStorage["prefixModifierKey"] = document.getElementById("prefix-modifier-key").value;

    backgroundPage.availableKeys = backgroundPage.getAvailableKeys();
    reloadSettings();

    showMessage("保存しました。");
    return;
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    document.getElementById("unbind-keys").value = localStorage["unbindKeys"] || "";
    document.getElementById("prefix-key").value = localStorage["prefixKey"] || "";
    document.getElementById("prefix-modifier-key").value = localStorage["prefixModifierKey"] || "";
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
