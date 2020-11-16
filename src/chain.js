


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

/////////////////      Strategy  1    /////////////////////
var CheckIfPageFinished = function (){}
CheckIfPageFinished.prototype = new Handler();
CheckIfPageFinished.prototype.handleRequest = function (request){
    if(request.isPageFinished){
        console.log("CheckIfPageFinished")
        Commander.execute('createNewPage', {
            print: request.print,
            pages: request.pages,
            mode: request.mode
        });
        Commander.execute('resetPageStatus')
    }
    this.next.handleRequest(request);
}

/////////////////      Strategy 2     /////////////////////
var ScaleDownSingleWidget = function (){}
ScaleDownSingleWidget.prototype = new Handler();
ScaleDownSingleWidget.prototype.handleRequest = function (request){
    if(request.itemHeight > request.pageHeight){
        console.log("ScaleDownSingleWidget")
        Commander.execute('appendWidget', request.pages, request.items[request.index]);
        Commander.execute('addFooter', request.pages, request.mode, request.print);
/*        Commander.execute('scaleDownWidget', request.items[request.index], (constants.PAGE_HEIGHT / request.itemHeight))*/
        Commander.execute('finishPage');
        return ;
    }
    this.next.handleRequest(request);
}

/////////////////      Strategy  3   /////////////////////
var AddWidgetAndContinue = function (){}
AddWidgetAndContinue.prototype = new Handler();
AddWidgetAndContinue.prototype.handleRequest = function (request){
    if(request.debt <= 0){
        console.log("AddWidgetAndContinue")
        Commander.execute('appendWidget', request.pages, request.items[request.index])
        if (request.index+1 === request.items.length) {
            Commander.execute('addFooter', request.pages, request.mode, request.print)
        }
        return ;
    }
    this.next.handleRequest(request);
}

/////////////////      Strategy   4   /////////////////////
var ScaleDownWidgets = function (){}
ScaleDownWidgets.prototype = new Handler();
ScaleDownWidgets.prototype.handleRequest = function (request){
    if(request.debt <= request.scaleDownThreshold){
        console.log("ScaleDownWidgets")
        Commander.execute('appendWidget', request.pages, request.items[request.index]);
        Commander.execute('addFooter', request.pages, request.mode, request.print);
        Commander.execute('scaleDownWidget', request.items[request.index-1]);
        Commander.execute('scaleDownWidget', request.items[request.index]);
        Commander.execute('finishPage');
        return ;
    }
    this.next.handleRequest(request);
}

/////////////////      Strategy  5    /////////////////////
var RemoveFooter = function (){}
RemoveFooter.prototype = new Handler();
RemoveFooter.prototype.handleRequest = function (request){
    if(request.debt <= request.removeFooterThreshold){
        console.log("RemoveFooter")
        return;
    }
    this.next.handleRequest(request);
}

/////////////////      Strategy  6   /////////////////////
var Default = function (){}
Default.prototype = new Handler();
Default.prototype.handleRequest = function (request){
    console.log("DefaultAssignment")
    Commander.execute('addFooter', request.pages, request.mode, request.print);
    Commander.execute('finishPage')
    return ;
}
var HandleSignature = function (){}
HandleSignature.prototype = new Handler();
HandleSignature.prototype.handleRequest = function (request){
    console.log("PRE", request.index + 1 === request.items.length, request.index + 1, request.items.length)
    if(request.index + 1 === request.items.length){
        var widget = request.items[request.index];
        var template = {
            'grid-template-areas':'"widget"\n' +
                                '"signature"\n' +
                                '"footer"',
            'gap': '0em',
            'grid-template-rows': "4fr auto 76px",
            'align-items': 'center'
        };
        var page = request.pages[request.pages.length -1];
        Commander.execute('removeClass', widget,'widget')
        Commander.execute('removeClass', widget,'mail__signature')
        Commander.execute('setStyle', page, template)
        Commander.execute('setStyle', widget, {position: '-2/-3', gridArea: 'signature', alignSelf: 'end', })
    }
    this.next.handleRequest(request);
}


//Chain of responsibility for widgets assignments
var chain = {
    handle: function (request) {
        var strategy0 = new CheckIfPageFinished();
        var strategy1 = new ScaleDownSingleWidget();
        var strategy2 = new AddWidgetAndContinue();
        var strategy3 = new ScaleDownWidgets();
        var strategy4 = new RemoveFooter();
        var strategy5 = new Default();
        var handleSignature = new HandleSignature();
        strategy0
            .setNext(strategy1)
            .setNext(handleSignature)
            .setNext(strategy2)
            .setNext(strategy3)
            .setNext(strategy4)
            .setNext(strategy5);

        strategy0.handleRequest(request);
    }
}