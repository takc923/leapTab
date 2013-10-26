window.util = {
    getCharFromKeyEvent: function (evt) {
        var character = String.fromCharCode(evt.keyCode);
        if (character.search(/^[A-Z]$/) == 0 && ! evt.shiftKey) {
            character = character.toLowerCase();
        }
        return character;
    }
};


window.settings = new function () {
    var self = this;
    var defaultPrefixKeyCode = 84; //t

    this.defaultPrefixModifierKey = "ctrlKey";
    var defaultPrefixKeyEvent = {
        shiftKey: this.defaultPrefixModifierKey == "shiftKey",
        metaKey: this.defaultPrefixModifierKey == "metaKey",
        ctrlKey: this.defaultPrefixModifierKey == "ctrlKey",
        altKey: this.defaultPrefixModifierKey == "altKey",
        keyCode: defaultPrefixKeyCode
    };

    this.dummyFavIconUrl = chrome.extension.getURL("favicon/dummy_favicon.png");
    this.dummyInputElementId = "leaptab-dummy-element";
    this.alphanumeric = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.defaultPrefixKey = String.fromCharCode(defaultPrefixKeyCode),
    this.availableKeys = "";
    this.prefixKeyEvent = {
        hasModifierKey: function() {
            return this.ctrlKey || this.metaKey || this.altKey;
        },
        merge: function (obj) {
            for (var key in obj) this[key] = obj[key];
        },
        equal: function (evt) {
            return evt.shiftKey == this.shiftKey
                && evt.ctrlKey  == this.ctrlKey
                && evt.metaKey  == this.metaKey
                && evt.altKey   == this.altKey
                && evt.keyCode  == this.keyCode;
        }
    };
    this.load = function(callback) {
        chrome.storage.sync.get(["availableKeys", "prefixKeyEvent"], function(items) {
            if (chrome.extension.lastError) {
                console.log(chrome.extension.lastError.message);
                return;
            }
            self.availableKeys = items.availableKeys || self.alphanumeric;
            self.prefixKeyEvent.merge(items.prefixKeyEvent || defaultPrefixKeyEvent);
            callback && callback();
        });
    },
    this.isAvailableEvent = function(evt) {
        return this.availableKeys.indexOf(String.fromCharCode(evt.keyCode)) != -1
            && ! evt.ctrlKey && ! evt.metaKey && ! evt.altKey;
    }
}();
