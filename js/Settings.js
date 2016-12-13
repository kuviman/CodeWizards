var Settings = {
    CACHE_PREFIX: "CODEWIZARDS"
};

Settings.get = function (name, defaultValue) {
    name = this.CACHE_PREFIX + name;

    var result = localStorage.getItem(name);
    if (result === null) {
        if (defaultValue == undefined) {
            throw new QException("No default value specified");
        } else {
            result = defaultValue;
        }
    } else {
        result = JSON.parse(result);
    }

    return result;
};

Settings.set = function (name, value) {
    name = this.CACHE_PREFIX + name;

    localStorage.setItem(name, JSON.stringify(value));
};

Settings.setupCheckbox = function (settingsElem, name, callback, defaultValue) {
    if (defaultValue === undefined) {
        defaultValue = false;
    }
    var currentValue = Settings.get(name, defaultValue);

    var elem = settingsElem.find("input#" + name);
    elem.prop("checked", currentValue);
    if (callback) {
        callback(currentValue);
    }
    elem.change(function () {
        var newValue = $(this).is(":checked");
        Settings.set(name, newValue);
        if (callback) {
            callback(newValue);
        }
    });
};