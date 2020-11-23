var Utils = {
    nodeListToIterable: function(nodeList) {
        var items = [];
        for (var i = 0; i < nodeList.length; i++){
            items.push(nodeList[i])
        }
        return items;
    },
    formatScale: function(scale){
        return 'scale('+scale+')'
    },
}

if (typeof exports !== 'undefined') {
    module.exports = {
        Utils
    };
}
