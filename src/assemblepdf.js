/*
* This file contains a program to organize widgets into an html page
* that can be rendered by whtmltopdf https://wkhtmltopdf.org/.
*
* The presented algorithm iterates through an array of widgets (HTMLElements),
* and tries to fit as many items as possible into a given page (Div Element).
*
* The way in which this widgets are assigned is managed by a chain of responsibility
* that will handle edge cases or default to a solution.
*
* Must use vanilla JS without ES6 for compatibility issues.
* */



var pageHeight = (window.customSize)? window.customSize : 1056;

function createPage() {
    console.log("Create new page");
    var print = document.getElementById('print');
    var pageWrapper = document.createElement("div")
    pageWrapper.setAttribute('class', 'pdf-page');
    page = document.createElement("div");
    /*    page.style['border-style'] = 'dashed'*/

    pageWrapper.appendChild(page);
    print.appendChild(pageWrapper);
    return page;
}

function getHeight(element) {
    element.style.visibility = "hidden";
    document.body.appendChild(element);
    var height = element.offsetHeight + 0;
    document.body.removeChild(element);
    element.style.visibility = "visible";
    return height;
}

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


window.onload = function () {

    assemblePDF({
        items: [], 
        pages: [],
        pageHeight: 1000,
        skipFooterThreshold: 100,
        scaleDownThreshold: 50,
        print: null,
        mode: 'portrait'
    });

    hideRemainingElements();
    markDocAsReady();

}

function assemblePDF(props) {
    console.log('---------------------- Stage 1 ------------------------');
  

    var total = 0
    var widgets = document.querySelectorAll("#main > div.mail__container > div");
    for (var i = 0; i < widgets.length; i++) {

        var pages = document.querySelectorAll('#print > div.pdf-page > div');
        var page = pages[pages.length - 1];

        var itemHeight = widgets[i].offsetHeight;

        var delta = (total + itemHeight) - pageHeight;
        // Create and add to a new page
        if (delta > 100) {
            console.log("Create new page. Delta: ", delta)
            page = createPage();
            total = 0;

        }

        total += itemHeight;
        widgets[i].style.border = '1px dashed red'
        page.appendChild(widgets[i]);
        console.log("Widget added to page ", i);
    }
}

function makeFooterAndWrapper (props){
    var footerWrapper = document.createElement('div');
    var footer = document.createElement("div");
    var rightSection = document.createElement('small');
    var footerSignature = document.createElement('small');
    var customWidth = props.width;

    //footer
    footer.style['padding'] = '10px'
    footer.style['font-weight'] = 'bold';
    footer.style['margin-top'] = '10px';
    footer.style['margin-bottom'] = '10px';
    footer.style['display'] = 'flex';
    footer.style['justify-content'] = 'space-between';
    footer.style['width'] = customWidth + 'px'
    footer.setAttribute('class', 'pdf-footer');

    footerSignature.style['color'] = 'grey';
   
}

function hideRemainingElements() {
    // Hide extra element
    document.querySelector("#main > div.mail__container").style.display = "none";
}
function markDocAsReady() {
    console.log('---------------------- COMPLETE------------------------');

    if (window.pdfdone) {
        window.pdfdone();
    }

    if (page) {
        var readyElem = document.createElement("div");
        readyElem.setAttribute('id', 'pdf-ready');
        page.appendChild(readyElem);
    }
    window.status = 'ready';
}