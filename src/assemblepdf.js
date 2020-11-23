/*
* This file contains a program to organize widgets into an html page
* that can be rendered by wkhtmltopdf https://wkhtmltopdf.org/.
*
* The presented algorithm iterates through an array of widgets (HTMLElements),
* and tries to fit as many items as possible into a given page (Div Element).
*
* The way in which this widgets are assigned is managed by a chain of responsibility
* that will handle edge cases or default to a solution.
*
* Must use vanilla JS without ES6 for compatibility issues.
* */

/*
* Constants collection
* */
/*
var default_page_height = (window.customSize)? window.customSize : 1056;
var constants = {
    ALL_WIDGETS_SELECTOR: "#main > div.mail__container > div",
    ALL_PAGES_SELECTOR: '#print > div.page > div',
    TABLE_WIDGET_SELECTOR: "table.widget-product",
    ALL_MAIL_CONTAINERS: "#main > div.mail__container",
    PAGE_HEIGHT: default_page_height,
    PRINT_SELECTOR: 'print',
    DEFAULT_SKIP_FOOTER_THRESHOLD: default_page_height*0.05,
    DEFAULT_SCALE_DOWN: default_page_height*0.1
}
*/

/*
* Constants collection
* */
var A4 = {
    w: 210,
    h: 279
}
function mmToPx(value, factor = 3.7795275591) {
    return Math.floor(value * factor)
}

var default_page_height = mmToPx(A4.h)
var default_page_width = mmToPx(A4.w) /*(window.customSize)? window.customSize : 1056;*/
var constants = {
    ALL_WIDGETS_SELECTOR: "#main > div.mail__container > div",
    ALL_PAGES_SELECTOR: '#print > div.page',
    TABLE_WIDGET_SELECTOR: "table.widget-product",
    ALL_MAIL_CONTAINERS: "#main > div.mail__container",
    PAGE_HEIGHT: default_page_height,
    PAGE_WIDTH: default_page_width,
    PRINT_SELECTOR: 'print',
    DEFAULT_SKIP_FOOTER_THRESHOLD: default_page_height*0.05,
    DEFAULT_SCALE_DOWN: default_page_height*0.1
}

/*
* Execute program when document loads.
* */
window.onload = function () {
    var state =  {
        isPageFinished: false,
        sumOfHeights: 0,
    }
    var widgets = document.querySelectorAll(constants.ALL_WIDGETS_SELECTOR);
    var print = document.getElementById(constants.PRINT_SELECTOR);
    var pages = Commander.execute('nodeListToIterable', document.querySelectorAll(constants.ALL_PAGES_SELECTOR));
    var mode = 'portrait';

    for (var i = 0; i < widgets.length; i++) {
        chain.handle({
            state,
            print: print,
            items: widgets,
            pages: pages,
            index: i,
            mode: mode,
            //Constants
            pageHeight: constants.PAGE_HEIGHT,
            pageWidth: constants.PAGE_WIDTH,
            removeFooterThreshold: constants.DEFAULT_SKIP_FOOTER_THRESHOLD,
            scaleDownThreshold: constants.DEFAULT_SCALE_DOWN,
        })
    }
    if (mode === 'landscape'){
        Commander.execute('transformToLandscape', print, pages);
    }
    Commander.execute('hideRemainingElements');
    Commander.execute('markDocAsReady');
}
