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
* Execute program when document loads.
* */
window.onload = function () {
    var initialState =  {
        isPageFinished: false,
        sumOfHeights: 0,
    }
    var widgets = getters.getWidgets();
    var print = getters.getPrint();
    var pages = Utils.nodeListToIterable(
        getters.getPages()
    );
    var mode = 'portrait';
    var withFooter = true;
    for (var i = 0; i < widgets.length; i++) {
        chain.handle({
            state: initialState,
            print: print,
            items: widgets,
            pages: pages,
            index: i,
            mode: mode,
            withFooter: withFooter,
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
    // Commander.execute('hideRemainingElements');
    Commander.execute('markDocAsReady');
}

