var Utils = {
    nodeListToIterable: function(nodeList) {
        var items = [];
        for (var i = 0; i < nodeList.length; i++){
            items.push(nodeList[i])
        }
        return items;
    },
    formatScale: function(scale){
        if (typeof scale != "number"){
            throw 'NOT A STRING'
        }
        return 'scale('+scale+')'
    },
    mmToPx: function (value, factor) {
        if (!factor){
            factor = 3.7795275591
        }
        return Math.floor(value * factor)
    },
}

if (typeof exports !== 'undefined') {
    module.exports = Utils
}
