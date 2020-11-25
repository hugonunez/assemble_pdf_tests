//Chain of responsibility for widgets assignments
var chain = {
    handle: function (request) {
        //standard assignment
        var handleNewPage = new handleCreateNewPage();
        var addWidgetAndContinue = new AddWidgetAndContinue();
        var scaleDownWidgets = new ScaleDownWidgets();
        var defaultAssignment = new DefaultAddAndCreatePage();


        handleNewPage
            .setNext(addWidgetAndContinue)
            .setNext(scaleDownWidgets)
            .setNext(defaultAssignment);

        //repair work (handle width values and edge cases)
        var handleFirstPage = new HandleFirstPage();
        var handleSignature = new HandleSignature();
        var handleWidgetSize = new HandleWidgetSize();
        var handleSingleWidgetInPage = new HandleSingleWidgetInPage();
        var addFooter = new handleAddFooter();

        handleWidgetSize
            .setNext(handleFirstPage)
            .setNext(handleSignature)
            .setNext(addFooter);

        handleNewPage.handleRequest(request);
        handleWidgetSize.handleRequest(request);
    }
}

//Handler Abstract Class
var Handler = function (){
    this.next = {
        handleRequest: function (request){
            console.log("ALL HANDLERS HAVE BEEN TRIED, NONE MATCHED.")
        }
    }
};

//Abstract Class properties
Handler.prototype.setNext = function (next) {
    this.next = next;
    return next;
};
Handler.prototype.handleRequest = function (request){};

/*
* Define Strategies to assign widgets
* */
var HandleSingleWidgetInPage = function (){};
HandleSingleWidgetInPage.prototype = new Handler();
HandleSingleWidgetInPage.prototype.handleRequest = function (request) {
    var page = request.items[request.index].parentNode;
    var widgetsCount = page.querySelectorAll('.widget').length;
    console.log("HandleSingleWidgetInPage",request.index, widgetsCount, page)

    if (widgetsCount == 1){
        var template = Factories.makeTemplate(1, request.withFooter)
        Commander.execute('setStyle', page, template)
    }
    this.next.handleRequest(request)
}
var HandleWidgetSize = function (){};
HandleWidgetSize.prototype = new Handler();
HandleWidgetSize.prototype.handleRequest = function (request) {
    var widget = request.items[request.index]
    var condition = widget.offsetWidth >= request.pageWidth
    if (condition){
        Commander.execute('scaleElement', widget, Utils.formatScale((request.pageWidth / widget.offsetWidth)*0.95))
    }
    this.next.handleRequest(request)
}


var HandleFirstPage = function (){};
HandleFirstPage.prototype = new Handler();
HandleFirstPage.prototype.handleRequest = function (request) {
    if (request.index === 0){
        request.pages[0].removeChild(request.pages[0].firstElementChild)
        var page = Factories.makePage()
        Commander.execute('appendPage',
            request.print,
            request.pages,
            page
        );
        request.print.removeChild(request.print.firstElementChild)

    }

    this.next.handleRequest(request)
}

var handleCreateNewPage = function (){}
handleCreateNewPage.prototype = new Handler();
handleCreateNewPage.prototype.handleRequest = function (request){
    if(request.state.isPageFinished){
        var page = Factories.makePage()
        Commander.execute('appendPage',
            request.print,
            request.pages,
            page
        );
        Commander.execute('resetPageStatus', request.state)
    }
    this.next.handleRequest(request);
}

var AddWidgetAndContinue = function (){}
AddWidgetAndContinue.prototype = new Handler();
AddWidgetAndContinue.prototype.handleRequest = function (request){
    var itemHeight = request.items[request.index].offsetHeight;
    var debt = ( request.state.sumOfHeights + itemHeight) - request.pageHeight ;
    if(debt <= 0){
        console.log("AddWidgetAndContinue", {request})
        var footer = Factories.makeFooter(request.pageWidth)
        var page = request.pages[request.pages.length -1];
        Commander.execute('appendWidget', page, request.items[request.index])
        Commander.execute('sumHeight', request.state, itemHeight)
        Commander.execute('sumHeight', request.state, footer.offsetHeight)
        return ;
    }
    this.next.handleRequest(request);
}

var ScaleDownWidgets = function (){}
ScaleDownWidgets.prototype = new Handler();
ScaleDownWidgets.prototype.handleRequest = function (request){
    var itemHeight = request.items[request.index].offsetHeight;
    var debt = ( request.state.sumOfHeights + itemHeight) - request.pageHeight ;
    var page = request.pages[request.pages.length -1]
    if(debt <= request.scaleDownThreshold){
        Commander.execute('appendWidget', page, request.items[request.index]);
        Commander.execute('sumHeight', request.state, itemHeight)
        Commander.execute('scaleElement', request.items[request.index-1], Utils.formatScale((constants.PAGE_HEIGHT/ (request.state.sumOfHeights)*0.95)));
        Commander.execute('scaleElement', request.items[request.index], Utils.formatScale((constants.PAGE_HEIGHT/ (request.state.sumOfHeights)*0.95)));
        Commander.execute('resetPageStatus', request.state);
        Commander.execute('finishPage', request.state);
        return ;
    }
    this.next.handleRequest(request);
}

var handleAddFooter = function (){}
handleAddFooter.prototype = new Handler();
handleAddFooter.prototype.handleRequest = function (request) {
    if (request.withFooter){
        var page = request.pages[request.pages.length-1];
        var footer = Factories.makeFooter();
        Commander.execute('addFooter', page, footer)

    }
    return
    /**
     *  var page = request.pages[request.pages.length-1];
     var sum = 0
     for (var i=0; i< page.childNodes.length; i++){
        sum+= page.childNodes[i].offsetHeight
    }
     var debt = sum-request.pageHeight
     console.log({debt, sum, cnt: page.childNodes.length})

     var itemHeight = request.items[request.index].offsetHeight;
     var debt = ( request.state.sumOfHeights + itemHeight) - request.pageHeight ;
     if(debt <= request.removeFooterThreshold){
        console.log("RemoveFooter", {index:request.index, sum: request.state.sumOfHeights, itemH: request.items[request.index].offsetHeight } )

        var page = request.pages[request.pages.length-1];
        var footer = page.querySelector('.footer')
        footer.remove()
        var template = {
            'grid-template-areas':'"widget"\n',
            'gap': '0em',
            'grid-template-rows': "1fr 1rf",
            'align-items': 'center'
        };
        Commander.execute('setStyle', page, template)
        return;
    }
     this.next.handleRequest(request);
     *
     * **/
}


var DefaultAddAndCreatePage = function (){}
DefaultAddAndCreatePage.prototype = new Handler();
DefaultAddAndCreatePage.prototype.handleRequest = function (request){
    var page = Factories.makePage()
    var footer = Factories.makeFooter(request.pageWidth)
    Commander.execute('appendPage',
        request.print,
        request.pages,
        page
    );
    var template = Factories.makeTemplate(1, request.withFooter)
    Commander.execute('setStyle', page, template)
    Commander.execute('resetPageStatus', request.state)
    Commander.execute('appendWidget', page, request.items[request.index])
    Commander.execute('sumHeight', request.state, request.items[request.index].offsetHeight)
    Commander.execute('sumHeight', request.state, footer.offsetHeight)
    Commander.execute('finishPage', request.state)
    return ;
}

var HandleSignature = function (){}
HandleSignature.prototype = new Handler();
HandleSignature.prototype.handleRequest = function (request){
    if(request.index + 1 === request.items.length){
        var widget = request.items[request.index];
        var template = Factories.makeTemplate(1, request.withFooter, true)
        var page = request.pages[request.pages.length -1];
        Commander.execute('removeClass', widget,'widget')
        Commander.execute('removeClass', widget,'mail__signature')
        Commander.execute('setStyle', page, template)
        Commander.execute('setStyle', widget, {position: '-2/-3', gridArea: 'signature', alignSelf: 'end', })
    }
    this.next.handleRequest(request);
}


