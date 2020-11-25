/*
* Command dispatcher
* */
var Commander = {
    execute: function ( command ) {
        var Commands = {
            setStyle: function (element, style){
                for(var k in style){
                    if (style.hasOwnProperty(k)){
                        element.style[k] = style[k]
                    }
                }
            },

            removeClass: function (element, className){
                element.classList.remove(className)
            },

            resetPageStatus: function (state) {
                state.isPageFinished = false;
            },

            appendPage: function (print, pages, page){
                pages.push(page);
                print.appendChild(page);
            },
            scaleElement: function (widget, scale) {
                widget.style['transform'] = scale
            },
            finishPage: function (state) {
                state.sumOfHeights = 0;
                state.isPageFinished = true;
            },
            addFooter: function (page, footer) {
                if(!page.querySelector('.footer')){
                    page.appendChild(footer);
                }
            },
            sumHeight: function (state, height){
                state.sumOfHeights +=  height
            },
            appendWidget: function (page, widget) {
                widget.classList.remove('mail__widget')
                widget.classList.add('widget')
                widget.removeAttribute('style')
                widget.removeAttribute('valign')
                widget.cssText = 'margin: 0; padding: 0;'
                page.appendChild(widget);
            },
            hideRemainingElements: function() {
                document.querySelector("#main > div.mail__container").style.display = "none";
            },
            markDocAsReady: function() {
                var readyElem = document.createElement("div");

                if (window.pdfdone) {
                    window.pdfdone();
                }
                readyElem.setAttribute('id', 'pdf-ready');
                document.body.appendChild(readyElem);
                window.status = 'ready';
            },
            transformToLandscape: function (print, pages) {
                for (var i=1; i < pages.length; i+=2) {
                    var landscapePage = document.createElement('div')
                    landscapePage.classList.add('landscape-page')
                    landscapePage.appendChild(pages[i])
                    Commander.execute('setStyle', pages[i], {position: '2/1'})
                    if (pages[i+1]){
                        landscapePage.appendChild(pages[i+1])
                        Commander.execute('setStyle', pages[i+1], {position: '3/2'})

                    }
                    print.appendChild(landscapePage)
                }
            }
        }
        if (!Commands[command]) {
            throw 'ERROR: ' + command + ' <- command not found in commands collection.'
        }
        return Commands[command].apply( Commands, [].slice.call(arguments, 1) );
    }
}

if (typeof exports !== 'undefined') {
    module.exports = Commander
}
