var Factories = {
    makeFooter: function (width) {
        var footer = document.createElement('div');
        var footerSignature = document.createElement('small');
        footerSignature.style['margin-top'] = '2em';
        footer.classList.add('footer');
        footer.style.width=width+'px';
        footerSignature.innerHTML = 'SEARS 2020';
        footer.appendChild(footerSignature);
        return footer
    },
    makePage: function (){
        var page = document.createElement("div");
        page.setAttribute('class', 'page');
        return page
    },
    makeTemplate: function (nWidgets, withFooter, withSignature){
        var template = {
            'gap': '0em',
            'align-items': 'center',
            'grid-template-areas': '',
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
    }
}


if (typeof exports !== 'undefined') {
    module.exports = Factories
}