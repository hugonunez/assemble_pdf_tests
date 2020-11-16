/*
* Command dispatcher
* */
var Commander = {
    state: {
        isPageFinished: false,
        sumOfHeights: 0
    },
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
            assemblePDF: function(props) {
                for (var i = 0; i < props.items.length; i++) {
                    var itemHeight = props.items[i].offsetHeight;
                    var debt = (Commander.state.sumOfHeights + itemHeight) - props.pageHeight ;
                    var request = {
                        index: i,
                        items: props.items,
                        isPageFinished: Commander.state.isPageFinished,
                        pageHeight: constants.PAGE_HEIGHT,
                        pages: props.pages,
                        print: props.print,
                        mode: props.mode,
                        itemHeight: itemHeight,
                        debt: debt,
                        removeFooterThreshold: constants.DEFAULT_SKIP_FOOTER_THRESHOLD,
                        scaleDownThreshold: constants.DEFAULT_SCALE_DOWN
                    }
                    chain.handle(request)
                }
                if (props.mode === 'landscape'){
                    Commander.execute('transformToLandscape', props.print, props.pages);
                }

            },
            makeLandscapeFooter: function(props) {
                var tuple = Commander.execute('makeFooterAndWrapper', {pageIndex: props.pagesIndex[0], mode: 'landscape'});
                //left section
                var leftSection = document.createElement('small');

                leftSection.innerHTML = 'Page ' + props.pagesIndex[1];
                if (!props.noLastPage){
                    tuple[1].appendChild(leftSection);
                }
                return tuple[0]
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
            resetPageStatus: function () {
                Commander.state.isPageFinished = false;
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
            createLandscapePage: function (props) {
                var page1 = props.pages[0];
                var page2 = props.pages[1];
                var pageWrapper = document.createElement("div");
                pageWrapper.style['display'] = 'flex';
                pageWrapper.style['align-items'] = 'center';
                pageWrapper.style['justify-content'] = 'center';
                pageWrapper.setAttribute('class', 'pdf-page-landscape');
                pageWrapper.appendChild(page1);
                if (page2) {
                    pageWrapper.appendChild(page2);
                }
                return pageWrapper;
            },
            scaleDownWidget: function (widget, customScale) {
                var scale = constants.PAGE_HEIGHT/ (Commander.state.sumOfHeights);
                if (customScale){
                    scale = customScale
                }
                widget.style['transform'] = Commander.execute('formatScale', scale)
            },
            finishPage: function () {
                Commander.state.sumOfHeights = 0;
                Commander.state.isPageFinished = true;
            },
            addFooter: function (pages, mode, print) {
                var page = pages[pages.length -1];
                var footerTuple = Commander.execute('makeFooterAndWrapper', {pageIndex: pages.length, mode: mode, width: page.offsetWidth});
                Commander.state.sumOfHeights += footerTuple[0].offsetHeight;
                page.appendChild(footerTuple[0]);
            },
            appendWidget: function (pages, widget) {
                var page = pages[pages.length -1];
                Commander.execute('addHeight', widget.offsetHeight)
      /*          widget.style.border = '1px dashed red'*/
                widget.classList.remove('mail__widget')
                widget.classList.add('widget')
                widget.removeAttribute('style')
                widget.removeAttribute('valign')

                widget.cssText = 'margin: 0; padding: 0;'

                page.appendChild(widget);
            },
            makeSeparator: function(width) {
                const separator = document.createElement('hr');
                separator.style['border-top'] = '2px solid grey'
                return separator
            },
            addHeight: function (height){
                Commander.state.sumOfHeights += height
            },
            addBorder: function (element, color) {
                element.style.border = '1px solid ' + color
            },
            makeFooterAndWrapper: function (props){
                console.log("LENGTH", props)
                var footerWrapper = document.createElement('div');
                var rightSection = document.createElement('small');
                var footerSignature = document.createElement('small');
                var customWidth = props.mode === 'landscape'? props.width*2: props.width;
                footerWrapper.classList.add('footer')
                //footer
/*
                footerWrapper.style['padding'] = '10px'
                footerWrapper.style['font-weight'] = 'bold';
                footerWrapper.style['margin-top'] = '10px';
                footerWrapper.style['margin-bottom'] = '10px';
                footerWrapper.style['display'] = 'flex';
                footerWrapper.style['justify-content'] = 'space-between';
*/

          /*      //Signature
                footerSignature.style['color'] = 'grey';
                footerSignature.style['top'] = '10px';
                footerSignature.style['left'] = '50%'
                footerSignature.style['position'] = 'relative';
                footerSignature.style['margin-left'] = 'auto';
                footerSignature.style['margin-right'] = 'auto';
                footerSignature.innerHTML = 'SEARS 2020';
*/
/*                if (props.mode === 'portrait'){
                    rightSection.style['margin-right'] = '15px';
                    rightSection.style['margin-left'] = 'auto';
                }

                rightSection.innerHTML = 'page ' + props.pageIndex;
                footerWrapper.appendChild(rightSection);*/
                footerSignature.innerHTML = 'SEARS 2020';
                footerWrapper.appendChild(Commander.execute('makeSeparator'));
                footerWrapper.appendChild(footerSignature)
                var returnValue = [footerWrapper, footerWrapper] //INTERESANTE, no puedo retornar {footerWrapper, footer}?? o que sucede
                return returnValue
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
                var pages_tuples = [];
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
           /*         print.appendChild(Commander.execute('makeLandscapeFooter', {pagesIndex: [i+i +1, i+i+2], noLastPage: !pages_tuples[i][1], mode: 'landscape'}))*/
                }

            }
        }
        if (!Commands[command]) {
            throw 'ERROR: ' + command + ' <- command not found in commands collection.'
        }
        return Commands[command].apply( Commands, [].slice.call(arguments, 1) );
    }
}