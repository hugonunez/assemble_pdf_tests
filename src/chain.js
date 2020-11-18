//Chain of responsibility for widgets assignments
var chain = {
    handle: function (request) {
        var handleFirstPage = new HandleFirstPage();
        var handleSignature = new HandleSignature();
        var handleCreateNewPage = new ChangeCreateNewPage();
        var addWidgetAndContinue = new AddWidgetAndContinue();
        var scaleDownWidgets = new ScaleDownWidgets();
        var removeFooter = new RemoveFooter();
        var defaultAssignment = new DefaultAddAndCreatePage();


        //repair work (handle X values)
        handleCreateNewPage
            .setNext(handleFirstPage)
            .setNext(handleSignature)
            .setNext(addWidgetAndContinue)
            .setNext(scaleDownWidgets)
            .setNext(removeFooter)
            .setNext(defaultAssignment);

        //repair work (handle width values)
        var handleWidgetSize = new HandleWidgetSize()
        
        handleCreateNewPage.handleRequest(request);
        handleWidgetSize.handleRequest(request)
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

var HandleWidgetSize = function (){};
HandleWidgetSize.prototype = new Handler();
HandleWidgetSize.prototype.handleRequest = function (request) {
    var widget = request.items[request.index]
    var condition = widget.offsetWidth >= request.pageWidth
    console.log({width: widget.offsetWidth, w2: widget.width, condition, widget})
    if (condition){
        var page = request.pages[0];
        Commander.execute('scaleDownWidget', widget, (request.pageWidth / widget.offsetWidth))
    }
    this.next.handleRequest(request)
}


var HandleFirstPage = function (){};
HandleFirstPage.prototype = new Handler();
HandleFirstPage.prototype.handleRequest = function (request) {
    if (request.index === 0){
        var page = request.pages[0];
        Commander.execute('unwrap', page)
    }
    this.next.handleRequest(request)
}

/////////////////      Strategy  1    /////////////////////
var ChangeCreateNewPage = function (){}
ChangeCreateNewPage.prototype = new Handler();
ChangeCreateNewPage.prototype.handleRequest = function (request){
    if(request.isPageFinished){
        Commander.execute('createNewPage', {
            print: request.print,
            pages: request.pages,
            mode: request.mode
        });
        Commander.execute('resetPageStatus')
    }
    this.next.handleRequest(request);
}



/////////////////      Strategy  3   /////////////////////
var AddWidgetAndContinue = function (){}
AddWidgetAndContinue.prototype = new Handler();
AddWidgetAndContinue.prototype.handleRequest = function (request){

    if(request.debt <= 0){
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
var DefaultAddAndCreatePage = function (){}
DefaultAddAndCreatePage.prototype = new Handler();
DefaultAddAndCreatePage.prototype.handleRequest = function (request){
    Commander.execute('createNewPage', {
        print: request.print,
        pages: request.pages,
        mode: request.mode
    });
    Commander.execute('resetPageStatus')
    Commander.execute('appendWidget', request.pages, request.items[request.index])
    Commander.execute('addFooter', request.pages, request.mode, request.print);
    Commander.execute('finishPage')
    return ;
}
var HandleSignature = function (){}
HandleSignature.prototype = new Handler();
HandleSignature.prototype.handleRequest = function (request){
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


