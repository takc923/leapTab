chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        chrome.windows.getCurrent({populate: true},function(win){
            var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
            for (var i = 0;i < alphabet.length || i < win.tabs.length; i++) {
                chrome.tabs.sendMessage(win.tabs[i].id, {
                    action    : "change",
                    faviconUrl: "http://developer.chrome.com/favicon.ico",
                    title     : "[" + alphabet[i] + "] " + win.tabs[i].title
                });
            }
        });
    });
