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

            createNewPage: function (props) {
                var page = document.createElement("div");
                page.setAttribute('class', 'page');
                props.print.appendChild(page);
                props.pages.push(page);
                return page;
            },

            scaleDownWidget: function (state, widget, customScale) {
                var scale = constants.PAGE_HEIGHT/ (state.sumOfHeights);
                if (customScale){
                    scale = customScale
                }
                widget.style['transform'] = Utils.formatScale(scale)
            },
            finishPage: function (state) {
                state.sumOfHeights = 0;
                state.isPageFinished = true;
            },
            addFooter: function (state, page, width) {
                var footer = document.createElement('div');
                var footerSignature = document.createElement('small');
                footerSignature.style['margin-top'] = '2em'
                footer.classList.add('footer')
                footer.style.width=width+'px'
                footerSignature.innerHTML = 'SEARS 2020';
                footer.appendChild(footerSignature)
                if (state) {
                    state.sumOfHeights += footer.offsetHeight;
                }
                if(!isThereFooter()){
                    page.appendChild(footer);
                }

                function isThereFooter(){
                    return !!page.querySelector('.footer')
                }
            },
            appendWidget: function (state, pages, widget) {
                var page = pages[pages.length -1];
                state.sumOfHeights +=  widget.offsetHeight
                widget.classList.remove('mail__widget')
                widget.classList.add('widget')
                widget.removeAttribute('style')
                widget.removeAttribute('valign')
                Commander.execute('setStyle', {gridArea: 'widget'})
                widget.cssText = 'margin: 0; padding: 0;'

                page.appendChild(widget);
            },
            hideRemainingElements: function() {
                // Hide extra element
                document.querySelector("#main > div.mail__container").style.display = "none";
            },
            markDocAsReady: function() {
                console.log('---------------------- COMPLETE------------------------');

                if (window.pdfdone) {
                    window.pdfdone();
                }
                if (true) {
                    var readyElem = document.createElement("div");
                    readyElem.setAttribute('id', 'pdf-ready');
                    document.body.appendChild(readyElem);
                }
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
                    console.log("@pages2", pages)
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
    module.exports = {
        Commander
    };
}
