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


// Note: Must use vanilla Javascript support whtmltopdf and other pdf converters which do not support es6 and jQuery
window.onload = function () {

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
        page.appendChild(widgets[i]);
        console.log("Widget added to page ", i);
    }

    // Hide extra element
    document.querySelector("#main > div.mail__container").style.display = "none";
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