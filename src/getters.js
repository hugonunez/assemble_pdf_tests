var collection = function(constants) {
    return {
        getWidgets: function () {
            return document.querySelectorAll(constants.ALL_WIDGETS_SELECTOR)
        },
        getPrint: function () {
            return document.getElementById(constants.PRINT_SELECTOR)
        },
        getPages: function () {
            return document.querySelectorAll(constants.ALL_PAGES_SELECTOR)
        }
    }
}
var getters = function(constants) {
    return collection(constants)
}

if (typeof exports !== 'undefined') {
    module.exports = getters
}else {
    getters = collection(constants)
}