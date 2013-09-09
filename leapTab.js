window.addEventListener("load", function(){
    document.addEventListener("keypress", function(evt){
        if(evt.keyCode == 116){
            chrome.runtime.sendMessage({message: "message_content"});
        }
    });
});
