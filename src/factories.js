var Factories = {
    makeFooter: function (width) {
        var footer = document.createElement('div');
        var footerSignature = document.createElement('small');
        footerSignature.style['margin-top'] = '2em';
        footer.classList.add('footer');
        Commander.execute('setStyle', footer, {
            'height': '76px',
            'text-align': 'center',
            'margin-top': '3em',
            'font-weight': 'bold',
        })
        footer.style.width=width+'px';
        footerSignature.innerHTML = 'SEARS 2020';
        footer.appendChild(footerSignature);
        return footer
    },
    makePage: function (){
        var page = document.createElement("div");
        Commander.execute('setStyle', page, {
            'width': '9.5in',
            'height': '13.0in',
            'margin-left': '0.3in',
            'display': 'table',
            'flex-direction': 'column',
            'align-items': 'center',
            'justify-content': 'center',
            'page-break-inside': 'avoid',
            '-webkit-column-break-inside': 'avoid',
        })
        page.setAttribute('class', 'page');
        return page
    },
    makeTemplate: function (nWidgets, withFooter, withSignature){
        var template = {
            "align-items": "center",
            "gap": "0em",
            'grid-template-areas': "",
            'grid-template-rows': '',
        };
        for (var i=0; i < nWidgets; i++){
            template['grid-template-areas'] += '"widget"\n'
            template['grid-template-rows'] += '1fr '
        }
        if (withSignature) {
            template['grid-template-areas'] += '"signature"\n'
            template['grid-template-rows'] += 'auto '
        }
        if (withFooter){
            template['grid-template-areas'] += '"footer"'
            template['grid-template-rows'] += '76px'
        }
        return template
    },
    makePageWrapper: function (){
        var pageWrapper = document.createElement('div')
        pageWrapper.classList.add('page-wrapper')
        Commander.execute('setStyle', pageWrapper, {
            'padding': '0',
            'border': '1px dashed grey',
            'width': '9.5in',
            'height': 'auto',
            'page-break-inside': 'avoid',
            '-webkit-column-break-inside': 'avoid',
        })
        return pageWrapper
    }
}


if (typeof exports !== 'undefined') {
    module.exports = Factories
}