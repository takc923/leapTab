var originalFaviconUrl;
var originalTitle;
window.addEventListener("load", function(){
    originalTitle = document.title;
    originalFaviconUrl = getFavIconUrl();
    document.addEventListener("keypress", function(evt){
        if(evt.keyCode == 116){
            chrome.runtime.sendMessage({
                action : "change",
                message: "message_content"
            });
        }
    });
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        favicon.change(request.faviconUrl, request.title);
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
