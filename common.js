window.util = {
    hasModifierKey: function (evt) {
        return evt.ctrlKey || evt.metaKey || evt.altKey;
    },

    getCharFromKeyEvent: function (evt) {
        var character = String.fromCharCode(evt.keyCode);
        if (character.search(/^[A-Z]$/) == 0 && ! evt.shiftKey) {
            character = character.toLowerCase();
        }
        return character;
    }
};

var defaultPrefixKeyCode = 84; //t
var defaultPrefixModifierKey = "ctrlKey";

window.settings = {
    dummyFavIconUrl: chrome.extension.getURL("favicon/dummy_favicon.png"),
    dummyInputElementId: "leaptab-dummy-element",
    alphanumeric: "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    // TODO: change options page interface.
    defaultPrefixKeyEvent: {
        shiftKey: defaultPrefixModifierKey == "shiftKey",
        metaKey: defaultPrefixModifierKey == "metaKey",
        ctrlKey: defaultPrefixModifierKey == "ctrlKey",
        altKey: defaultPrefixModifierKey == "altKey",
        keyCode: defaultPrefixKeyCode
    },
    defaultPrefixKey: String.fromCharCode(defaultPrefixKeyCode),
    defaultPrefixModifierKey: defaultPrefixModifierKey,
    // TODO: rename
    availableKeys: "",
    prefixKeyEvent: {},
    load: function(callback) {
        var self = this;
        chrome.storage.sync.get(["availableKeys", "prefixKeyEvent"], function(items) {
            if (chrome.extension.lastError) {
                console.log(chrome.extension.lastError.message);
                return;
            }
            self.availableKeys = items.availableKeys || self.alphanumeric;
            self.prefixKeyEvent = items.prefixKeyEvent || self.defaultPrefixKeyEvent;
            callback && callback();
        });
    },
    isPrefixEvent: function (evt) {
        return evt.shiftKey == this.prefixKeyEvent.shiftKey
            && evt.ctrlKey  == this.prefixKeyEvent.ctrlKey
            && evt.metaKey  == this.prefixKeyEvent.metaKey
            && evt.altKey   == this.prefixKeyEvent.altKey
            && evt.keyCode  == this.prefixKeyEvent.keyCode;
    },
    isAvailableEvent: function(evt) {
        return this.availableKeys.indexOf(String.fromCharCode(evt.keyCode)) != -1
            && ! evt.ctrlKey && ! evt.metaKey && ! evt.altKey;
    }
};
