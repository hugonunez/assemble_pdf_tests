/*
* This file contains a program to organize widgets into an html page
* that can be rendered by whtmltopdf https://wkhtmltopdf.org/.
*
* The presented algorithm iterates through an array of widgets (HTMLElements),
* and tries to fit as many items as possible into a given page (Div Element).
*
* The way in which this widgets are assigned is managed by a chain of responsibility
* that will handle edge cases or default to a solution.
*
* Must use vanilla JS without ES6 for compatibility issues.
* */



var pageHeight = (window.customSize)? window.customSize : 1056;
/*
* Create a new page and append it to the print node.
* */


/*
* Constants collection
* */
var default_page_height = (window.customSize)? window.customSize : 1056;
var constants = {
    ALL_WIDGETS_SELECTOR: "#main > div.mail__container > div",
    ALL_PAGES_SELECTOR: '#print > div.pdf-page > div',
    TABLE_WIDGET_SELECTOR: "table.widget-product",
    ALL_MAIL_CONTAINERS: "#main > div.mail__container",
    PAGE_HEIGHT: default_page_height,
    PRINT_SELECTOR: 'print',
    DEFAULT_SKIP_FOOTER_THRESHOLD: default_page_height*0.1,
    DEFAULT_SCALE_DOWN: default_page_height*0.05
}
/*
* Commands collection
* */

/*
* Command dispatcher
* */
var Commander = {
    state: {
        isPageFinished: false,
        sumOfHeights: 0
    }
}
Commander.execute = function ( command ) {
    var Commands = {
        formatScale: function(scale){
            return 'scale('+scale+')'
        },
        resetPageStatus: function (isPageFinished) {
            Commander.state.isPageFinished = false;
        },
        scalePage: function (props) {
  /*          if (page){
                if (props.scale !== 0 && props.scale !== 1){
                    page.style['transform'] = formatScale(props.scale);

                }
            }*/
        },
        selfRemoveFromDOM: function (item) {
            item.parentNode.removeChild(item);
        },
        hideElements: function () {
            document.querySelector(constants.ALL_MAIL_CONTAINERS).style.display = "none";
        },
        createNewPage: function (props) {
            var page = document.createElement("div");
            var pageWrapper = document.createElement("div");
            pageWrapper.setAttribute('class', 'pdf-page');
            pageWrapper.appendChild(page);
            props.print.appendChild(pageWrapper);
/*            pages.push(page);*/
            return page;
        },
        createLandscapePage: function (props) {
            var page1 = pages[0];
            var page2 = pages[1];
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
        scaleDownWidget: function (widget) {
            var scale = constants.PAGE_HEIGHT/ Commander.state.sumOfHeights;
            widget.style['transform'] = Commander.execute('formatScale', scale)
        },
        finishPage: function () {
            Commander.state.sumOfHeights = 0;
            Commander.state.isPageFinished = true;
        },
        addFooter: function (pages, mode, print) {
            var page = pages[pages.length -1];
            var footerTuple = Commander.execute('makeFooterAndWrapper', {pageIndex: pages.length, mode: mode, width: page.offsetWidth});
            footerTuple[0].style['width'] = page.offsetWidth + 'px';
            print.appendChild(footerTuple[0]);
        },
        appendWidget: function (pages, widget) {
            var page = pages[pages.length -1];
            Commander.state.sumOfHeights += widget.offsetHeight;
/*            widget.style.border = '1px dashed red'*/
            page.appendChild(widget);
        },
        makeSeparator: function(width) {
            const separator = document.createElement('hr');
            separator.style.width = width+'px'
            separator.style['margin-left'] = Math.floor(width*0.01) + 'px';
            separator.style['border-top'] = '2px solid grey'
            return separator
        },
        makeFooterAndWrapper: function (props){
            var footerWrapper = document.createElement('div');
            var footer = document.createElement("div");
            var rightSection = document.createElement('small');
            var footerSignature = document.createElement('small');
            var customWidth = props.width;

            //footer
            footer.style['padding'] = '10px'
            footer.style['font-weight'] = 'bold';
            footer.style['margin-top'] = '10px';
            footer.style['margin-bottom'] = '10px';
            footer.style['display'] = 'flex';
            footer.style['justify-content'] = 'space-between';
            footer.style['width'] = customWidth + 'px'
            footer.setAttribute('class', 'pdf-footer');

            //Signature
            footerSignature.style['color'] = 'grey';
            footerSignature.style['top'] = '10px';
            footerSignature.style['left'] = '50%'
            footerSignature.style['position'] = 'relative';
            footerSignature.style['margin-left'] = 'auto';
            footerSignature.style['margin-right'] = 'auto';
            footerSignature.innerHTML = 'SEARS 2020';

            if (props.mode === 'portrait'){
                rightSection.style['margin-right'] = '0';
                rightSection.style['margin-left'] = 'auto';
            }

            rightSection.innerHTML = 'page ' + props.pageIndex;
            footer.appendChild(rightSection);
            footerWrapper.style.width = customWidth + 'px'

            footerWrapper.appendChild(Commander.execute('makeSeparator', customWidth));
            footerWrapper.appendChild(footerSignature)
            footerWrapper.appendChild(footer)
            var returnValue = [footerWrapper, footer] //INTERESANTE, no puedo retornar {footerWrapper, footer}?? o que sucede
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
        createPage: function() {
            console.log("Create new page");
            var print = document.getElementById('print');
            var pageWrapper = document.createElement("div")
            pageWrapper.setAttribute('class', 'pdf-page');
            page = document.createElement("div");
            /*    page.style['border-style'] = 'dashed'*/

            pageWrapper.appendChild(page);
            print.appendChild(pageWrapper);
            return page;
        },

        getHeight: function(element) {
            element.style.visibility = "hidden";
            document.body.appendChild(element);
            var height = element.offsetHeight + 0;
            document.body.removeChild(element);
            element.style.visibility = "visible";
            return height;
        },
        transformToLandscape: function (print) {
            var pages_tuples = [];
            var pages = []/*Getters.getPages()*/;
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
                /*                print.appendChild(makeLandscapeFooter({pagesIndex: [index+index +1, index+index+2], noLastPage: !tuple[1], mode}))*/
            }

        }
    }
    if (!Commands[command]) {
        throw 'ERROR: ' + command + ' <- command not found in commands collection.'
    }
    return Commands[command].apply( Commands, [].slice.call(arguments, 1) );
};
var Getters = {
    getPrint: function () {
        return document.getElementById(constants.PRINT_SELECTOR);
    },
    getWidgets: function () {
        return document.querySelectorAll(constants.ALL_WIDGETS_SELECTOR);
    },
    getPages: function () {
        return document.querySelectorAll(constants.ALL_PAGES_SELECTOR);
    },
}
/*
* Execute program when document loads.
* */
window.onload = function () {
    var widgets = Getters.getWidgets();
    /*var pages = Getters.getPages()*/
    var print = Getters.getPrint();
    var mode = 'portrait';

    assemblePDF({
        items: widgets,
/*        pages: pages,*/
        skipFooterThreshold: constants.DEFAULT_SKIP_FOOTER_THRESHOLD,
        scaleDownThreshold: constants.DEFAULT_SCALE_DOWN,
        pageHeight: constants.PAGE_HEIGHT,
        print: print,
        mode: mode
    });

    Commander.execute('hideRemainingElements');
    Commander.execute('markDocAsReady');

}



/*
*
* */
function assemblePDF(props) {

    for (var i = 0; i < props.items.length; i++) {
        var pages = Getters.getPages();
        if (Commander.state.isPageFinished){
            Commander.execute('createNewPage', {print: props.print, pages: pages, mode: props.mode});
            Commander.execute('resetPageStatus')
        }
        var itemHeight = props.items[i].offsetHeight;
        var debt = (Commander.state.sumOfHeights + itemHeight) - pageHeight ; //space to fill
        if (debt <= 0) { // Fits without a problem. Template A
            Commander.execute('appendWidget', pages, props.items[i])
            if (i+1 === props.items.length) {
                Commander.execute('addFooter', pages, props.mode, props.print)
            }
        } else if (debt <= props.scaleDownThreshold) { // Fits but items must be scale down. Template B
            Commander.execute('appendWidget', pages, props.items[i]);
            Commander.execute('addFooter', pages, props.mode, props.print);
            Commander.execute('scaleDownWidget', props.items[i-1]);
            Commander.execute('scaleDownWidget', props.items[i]);
            Commander.execute('finishPage');
        } else if (debt < props.skipFooterThreshold) { // Fits but will not add footer. Will enlarge working area be reducing margins
/*            Instructions.appendWidget(items[i])
            Instructions.finishPage();*/
            Commander.execute('appendWidget')
        } else {
            Commander.execute('addFooter', pages, props.mode, props.print);
            Commander.execute('finishPage')
        }
        console.log("COMMANDER STATE", Commander.state)
    }
    /*var total = 0
    var widgets = document.querySelectorAll("#main > div.mail__container > div");
    for (var i = 0; i < widgets.length; i++) {

        var pages = document.querySelectorAll('#print > div.pdf-page > div');
        var page = pages[pages.length - 1];

        var itemHeight = widgets[i].offsetHeight;

        var delta = (total + itemHeight) - pageHeight;
        // Create and add to a new page
        if (delta > 100) {
            console.log("Create new page. Delta: ", delta)
            page = createPage();
            total = 0;
        }

        total += itemHeight;
        widgets[i].style.border = '1px dashed red'
        page.appendChild(widgets[i]);
        console.log("Widget added to page ", i);
    }*/
}
