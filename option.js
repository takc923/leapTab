window.onload = function(){
    restore_options();
    document.getElementById("save-button").addEventListener("click",save_options);
};

// Saves options to localStorage.
function save_options() {
    localStorage["unbindKeys"] = document.getElementById("unbind-keys").value;
    localStorage["prefixKey"] = document.getElementById("prefix-key").value;
    localStorage["prefixModifierKey"] = document.getElementById("prefix-modifier-key").value;

    var backgroundPage = chrome.extension.getBackgroundPage();
    backgroundPage.availableKeys = backgroundPage.getAvailableKeys();
    reloadSettings();

    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "保存しました";
    setTimeout(function() {
        status.innerHTML = "";
    }, 1500);
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
