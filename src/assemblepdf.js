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
* Execute program when document loads.
* */
window.onload = function () {
    var widgets = document.querySelectorAll(constants.ALL_WIDGETS_SELECTOR);
    var print = document.getElementById(constants.PRINT_SELECTOR);
    var pages = Commander.execute('nodeListToIterable', document.querySelectorAll(constants.ALL_PAGES_SELECTOR));
    var mode = 'portrait';

    Commander.execute('assemblePDF', {
        items: widgets,
        pages: pages,
        skipFooterThreshold: constants.DEFAULT_SKIP_FOOTER_THRESHOLD,
        scaleDownThreshold: constants.DEFAULT_SCALE_DOWN,
        pageHeight: constants.PAGE_HEIGHT,
        print: print,
        mode: mode
    });
    Commander.execute('hideRemainingElements');
    Commander.execute('markDocAsReady');
}
