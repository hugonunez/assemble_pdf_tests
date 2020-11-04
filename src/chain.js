//CHAIN OF RESPONSABILITY
//
// Let w = {offsetHeight, img}
//
// Let W = [w1,w2,w3,...wn] = Widgets
//
// Let P = [p1] = Pages
//
// Let scaleDownThreshold = x;
//
// Let changeLayoutTreshold = y;
//
// 0.- Calculate sum W heights
//
// 1.- Try to fit W in P[P.length-1]
//
// 2.- Iterate over W and fit as many widgets as posible into last page, recurse.
//
// 3.-

const setup = function () {
    const widgets = Getters.getWidgets();
    const print = Getters.getPrint();
    const pages = Getters.getPages();
    const skipPageThreshold =  constants.DEFAULT_SKIP_PAGE_THRESHOLD;
    //Creates necessary objects for chain of responsibility
    const init = {widgets, pages, pageHeight, skipPageThreshold, print}
    return init;
}

const Handler = function (handle, canDo, name = 'New Handler', init){
    this.next = null;
    this.done = false;
    this.handle = handle;
    this.attempt = function (init){
        const valid = canDo(init);
        if (valid){
            this.handle(init)
            this.setDone();
        }else {
            if (this.next) {
                this.next.attempt(...args)
            }else {
                this.setDone();
                throw 'No next function assigned to ' + name
            }
        }
    };
    this.setNextStep = function (handler) {
        this.next = handler
    }
    this.setDone = function (){
        this.done = true;
    }
    return this
}

//DEFINE HANDLERS
const handlers = {
    fitAllWidgetsIntoPage: Handler(function (init){
        //FIT ALL WIDGETS INTO PAGE
        const page = init.pages[init.pages.length-1]
        init.widgets.forEach(w => page.appendChild(w))
    }, function (widgets) {return !!widgets}, 'Fit all widgets into page'),

    defaultHandler: Handler( function (init){
        return assemblePDF(init)
    }, function (init) {return !!init.widgets},'Iterate over widgets and fit as many into page as posible')
}

//Define each handler's next step
handlers.fitAllWidgetsIntoPage.setNextStep(handlers.defaultHandler);
handlers.defaultHandler.setNextStep(null);








