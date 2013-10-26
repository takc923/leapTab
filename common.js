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

    this.dummyFavIconUrl = chrome.extension.getURL("favicon/dummy_favicon.png");
    this.dummyInputElementId = "leaptab-dummy-element";
    this.alphanumeric = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.defaultPrefixKey = String.fromCharCode(defaultPrefixKeyCode).toLowerCase(),
    this.leapKeys = this.alphanumeric;
    this.prefixKeyEvent = {
        shiftKey: this.defaultPrefixModifierKey == "shiftKey",
        metaKey: this.defaultPrefixModifierKey == "metaKey",
        ctrlKey: this.defaultPrefixModifierKey == "ctrlKey",
        altKey: this.defaultPrefixModifierKey == "altKey",
        keyCode: defaultPrefixKeyCode,
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
        chrome.storage.sync.get(["leapKeys", "prefixKeyEvent"], function(items) {
            if (chrome.extension.lastError) {
                console.log(chrome.extension.lastError.message);
                return;
            }
            if (items.leapKeys) self.leapKeys = items.leapKeys;
            if (items.prefixKeyEvent) self.prefixKeyEvent.merge(items.prefixKeyEvent);
            callback && callback();
        });
    },
    this.isLeapEvent = function(evt) {
        return this.leapKeys.indexOf(String.fromCharCode(evt.keyCode)) != -1
            && ! evt.ctrlKey && ! evt.metaKey && ! evt.altKey;
    }
}();
