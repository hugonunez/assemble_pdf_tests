


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

/*
/////////////////      Strategy 2     /////////////////////
var ScaleDownSingleWidgetX = function (){
}
ScaleDownSingleWidgetX.prototype = new Handler();
ScaleDownSingleWidgetX.prototype.handleRequest = function (request){
    var width = request.items[request.index].offsetWidth;
    console.log("width vs pagewidth", width, request.pageWidth)
    if(width > request.pageWidth){
        Commander.execute('appendWidget', request.pages, request.items[request.index]);
        Commander.execute('addFooter', request.pages, request.mode, request.print);
        Commander.execute('scaleDownWidget', request.items[request.index], 0.9);
        Commander.execute('finishPage');
        return
    }
    this.next.handleRequest(request);
}
*/

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
    console.log("ScaleDownWidgets", {ts:  request.scaleDownThreshold, debt: request.debt})
    if(request.debt <= request.scaleDownThreshold){
        Commander.execute('appendWidget', request.pages, request.items[request.index]);
        Commander.execute('addFooter', request.pages, request.mode, request.print);
        Commander.execute('scaleDownWidget', request.items[request.index-1]);
        Commander.execute('scaleDownWidget', request.items[request.index]);
        Commander.execute('finishPage');
    }
    this.next.handleRequest(request);
}

/////////////////      Strategy  5    /////////////////////
var RemoveFooter = function (){}
RemoveFooter.prototype = new Handler();
RemoveFooter.prototype.handleRequest = function (request){
    console.log("RemoveFooter", {ts:  request.removeFooterThreshold, debt: request.debt})

    if(request.debt <= request.removeFooterThreshold){
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
        var handlePageFinished = new CheckIfPageFinished();
        /*var scaleDownSingleWidget = new ScaleDownSingleWidgetX();*/
        var addWidgetAndContinue = new AddWidgetAndContinue();
        var scaleDownWidgets = new ScaleDownWidgets();
        var removeFooter = new RemoveFooter();
        var defaultAssignment = new Default();
        var handleSignature = new HandleSignature();

        handlePageFinished
            .setNext(handleSignature)
            .setNext(addWidgetAndContinue)
            .setNext(scaleDownWidgets)
/*            .setNext(scaleDownSingleWidget)*/
            .setNext(removeFooter)
            .setNext(defaultAssignment);

        handlePageFinished.handleRequest(request);
    }
}