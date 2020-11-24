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
    }
}


if (typeof exports !== 'undefined') {
    module.exports = Factories
}