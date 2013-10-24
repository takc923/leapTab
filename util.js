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
