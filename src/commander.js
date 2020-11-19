/*
* Command dispatcher
* */
var Commander = {
    execute: function ( command ) {
        /*
        * Commands collection
        * */
        var Commands = {
            setStyle: function (element, style){
                for(var k in style){
                    if (style.hasOwnProperty(k)){
                        element.style[k] = style[k]
                    }
                }
            },
            addClass: function (element, className){
                element.classList.add(className)
            },
            removeClass: function (element, className){
                element.classList.remove(className)
            },
            removeParent: function (el) {

            },
            unwrap: function (wrapper) {
                // place childNodes in document fragment
                var docFrag = document.createDocumentFragment();
                setTimeout(function (){
                    while (wrapper.firstChild) {
                        var child = wrapper.removeChild(wrapper.firstChild);
                        docFrag.appendChild(child);
                    }

                    // replace wrapper with document fragment
                    wrapper.parentNode.replaceChild(docFrag, wrapper);
                })
            },
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
            resetPageStatus: function (state) {
                state.isPageFinished = false;
            },
            scalePage: function (props) {

                if (props.page){
                    if (props.scale !== 0 && props.scale !== 1){
                        props.page.style['transform'] = Commander.execute('formatScale', props.scale);
                    }
                }
            },
            createNewPage: function (props) {
                var page = document.createElement("div");
                page.setAttribute('class', 'page');
                props.print.appendChild(page);
                props.pages.push(page);
             /*   page.style.border = '1px solid green';*/
                return page;
            },

            scaleDownWidget: function (state, widget, customScale) {
                console.log("scaledownwidget", state, widget, customScale)
                var scale = constants.PAGE_HEIGHT/ (state.sumOfHeights);
                if (customScale){
                    scale = customScale
                }
                widget.style['transform'] = Commander.execute('formatScale', scale)
            },
            finishPage: function (state) {
                state.sumOfHeights = 0;
                state.isPageFinished = true;
                
            },
            addFooter: function (state, page, width) {
                var footer = document.createElement('div');
                var footerSignature = document.createElement('small');
                var separator = document.createElement('hr');
      
                footer.classList.add('footer')
                footer.style.width=width+'px'
                footerSignature.innerHTML = 'SEARS 2020';
                footer.appendChild(separator);
                footer.appendChild(footerSignature)
                if (state) {
                    state.sumOfHeights += footer.offsetHeight;
                }
                page.appendChild(footer);
            },
            appendWidget: function (state, pages, widget) {
                var page = pages[pages.length -1];
                state.sumOfHeights +=  widget.offsetHeight
      /*          widget.style.border = '1px dashed red'*/
                widget.classList.remove('mail__widget')
                widget.classList.add('widget')
                widget.removeAttribute('style')
                widget.removeAttribute('valign')
                Commander.execute('setStyle', {gridArea: 'widget'})
                widget.cssText = 'margin: 0; padding: 0;'

                page.appendChild(widget);
            },
            addBorder: function (element, color) {
                element.style.border = '1px solid ' + color
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
                print.innerHTML = ''
                for (var i=0; i < pages.length; i+=2) {
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
                setTimeout(function(){
                
                }, 5000)
      /*          var pages_tuples = [];
                for (var i=0; i < pages.length; i+=2) {
                    var sumOfWidths = pages[i].offsetWidth;
                    if ( pages[i+1]) {
                        sumOfWidths += pages[i+1].offsetWidth
                        Commander.execute("scalePage", {page: pages[i], scale: constants.PAGE_HEIGHT/sumOfWidths})
                        Commander.execute("scalePage", {page: pages[i+1], scale: constants.PAGE_HEIGHT/sumOfWidths})
                    }

                    pages_tuples.push([pages[i], pages[i+1]]);
                }
                print.innerHTML = ''
                for (var i=0; i< pages_tuples.length; i++){
                    var landScape = Commander.execute("createLandscapePage", {pages: pages_tuples[i]});
                    print.appendChild(landScape);
           /!*         print.appendChild(Commander.execute('makeLandscapeFooter', {pagesIndex: [i+i +1, i+i+2], noLastPage: !pages_tuples[i][1], mode: 'landscape'}))*!/
                }*/

            }
        }
        if (!Commands[command]) {
            throw 'ERROR: ' + command + ' <- command not found in commands collection.'
        }
        return Commands[command].apply( Commands, [].slice.call(arguments, 1) );
    }
}