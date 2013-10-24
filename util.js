// TODO: rename this file.
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

// TODO: include settings not default.
var defaultPrefixKeyCode = 84; //t
var prefixModifierKey = "ctrlKey";
window.settings = {
    alphanumeric: "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    // TODO: change options page interface.
    defaultPrefixKeyEvent: {
        shiftKey: prefixModifierKey == "shiftKey",
        metaKey: prefixModifierKey == "metaKey",
        ctrlKey: prefixModifierKey == "ctrlKey",
        altKey: prefixModifierKey == "altKey",
        keyCode: defaultPrefixKeyCode
    },
    defaultPrefixKey: String.fromCharCode(defaultPrefixKeyCode),
    defaultPrefixModifierKey: prefixModifierKey
};
