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
    availableKeys: "",
    prefixKeyEvent: {}
};
