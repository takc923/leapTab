chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        chrome.windows.getCurrent({populate: true},function(win){
            _.each(win.tabs, function(tab){tab.favIconUrl = "https://wri.pe/favicon.ico";});
        });
    });
