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
function createPage() {
    console.log("Create new page");
    var print = document.getElementById('print');
    var pageWrapper = document.createElement("div")
    pageWrapper.setAttribute('class', 'pdf-page');
    page = document.createElement("div");
    /*    page.style['border-style'] = 'dashed'*/

    pageWrapper.appendChild(page);
    print.appendChild(pageWrapper);
    return page;
}
/*
* return the height of an element.
* */
function getHeight(element) {
    element.style.visibility = "hidden";
    document.body.appendChild(element);
    var height = element.offsetHeight + 0;
    document.body.removeChild(element);
    element.style.visibility = "visible";
    return height;
}

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
var Commands = {
    alert: function (msg) {
        alert(msg)
    },
    scalePage: function (props) {
        if (page){
            if (props.scale !== 0 && props.scale !== 1){
                page.style['transform'] = formatScale(props.scale);

            }
        }
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
        props.pages.push(page);
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
}

Commands.execute = function ( command ) {
    return Commands[command] && Commands[command].apply( Commands, [].slice.call(arguments, 1) );
};
Commands.execute('alert', "pepe", "2")
/*
* Execute program when document loads.
* */
window.onload = function () {

    assemblePDF({
        items: [], 
        pages: [],
        pageHeight: 1000,
        skipFooterThreshold: 100,
        scaleDownThreshold: 50,
        print: null,
        mode: 'portrait'
    });

    hideRemainingElements();
    markDocAsReady();

}

function formatScale(scale){
    return 'scale('+scale+')'
}

/*
*
* */
function assemblePDF(props) {
    console.log('---------------------- Stage 1 ------------------------');
    var sumOfHeights = 0;
    var isPageFinished = false;

    var Instructions = {
        scaleDownWidget: function (widget) {
            var scale = props.scale = constants.PAGE_HEIGHT/ sumOfHeights;
            widget.style['transform'] = formatScale(scale);
        },
        finishPage: function () {
            sumOfHeights = 0;
            isPageFinished = true;
        },
        addFooter: function () {
            var page = pages[pages.length -1];
            var footerTuple = makeFooterAndWrapper({pageIndex: pages.length, mode: props.mode, width: page.offsetWidth});
            footerTuple[0].style['width'] = page.offsetWidth + 'px';
            props.print.appendChild(footerTuple[1]);
        },
        appendWidget: function (widget) {
            var page = pages[pages.length -1];
            sumOfHeights += widget.offsetHeight;
            widget.style.border = '1px dashed red'
            page.appendChild(widget);
        },
        transformToLandscape: function () {
            var pages_tuples = [];
            var pages = []/*Getters.getPages()*/;
            for (var i=0; i < pages.length; i+=2) {
                var sumOfWidths = pages[i].offsetWidth;
                if ( pages[i+1]) {
                    sumOfWidths += pages[i+1].offsetWidth
                 /*   Commands.scalePage({page: pages[i], scale: constants.PAGE_HEIGHT/sumOfWidths})
                    Commands.scalePage({page: pages[i+1], scale: constants.PAGE_HEIGHT/sumOfWidths})*/
                }

                pages_tuples.push([pages[i], pages[i+1]]);
            }
            props.print.innerHTML = ''
/*            pages_tuples.forEach((tuple, index) => {
                const landScape = Commands.createLandscapePage({pages: tuple});
                print.appendChild(landScape);
                print.appendChild(makeLandscapeFooter({pagesIndex: [index+index +1, index+index+2], noLastPage: !tuple[1], mode}))
            })*/

        }
    }


    var total = 0
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
    }
}

function makeFooterAndWrapper (props){
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

    footerWrapper.appendChild(footerSignature)
    footerWrapper.appendChild(footer)
    var returnValue = [footerWrapper, footer] //INTERESANTE, no puedo retornar {footerWrapper, footer}?? o que sucede
    return returnValue
}

function hideRemainingElements() {
    // Hide extra element
    document.querySelector("#main > div.mail__container").style.display = "none";
}
function markDocAsReady() {
    console.log('---------------------- COMPLETE------------------------');

    if (window.pdfdone) {
        window.pdfdone();
    }

    if (page) {
        var readyElem = document.createElement("div");
        readyElem.setAttribute('id', 'pdf-ready');
        page.appendChild(readyElem);
    }
    window.status = 'ready';
}