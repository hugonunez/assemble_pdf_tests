
//Override 1 function or use fallback
const fallbackOnload = window.onload;
window.onload = onLoad || fallbackOnload;

function onLoad () {
    const widgets = Getters.getWidgets();
    const parsedWidgets = Utils.parseWidgets(widgets)
    const pages = Utils.nodeListToIterable(Getters.getPages())
    const print = Getters.getPrint();
    const validated = Utils.validateRequiredParams(widgets, parsedWidgets, pages, print)
    if (validated) {
        return assemblePDF({
            pages,
            items: widgets,
            print,
            skipFooterThreshold: constants.DEFAULT_SKIP_FOOTER_THRESHOLD,
            scaleDownThreshold: constants.DEFAULT_SCALE_DOWN,
            pageHeight: constants.PAGE_HEIGHT
        })
    }
    console.log('Using fallback onLoad function')
    console.warn({MSG: "Could not load assemble_pdf, required elements returned: ", widgets, parsedWidgets, pages, print})
    return null
}

function makeFooter (){
    const footer = document.createElement("p");
    footer.setAttribute('class', 'pdf-footer');
    footer.style['outline'] = '1px solid blue'
    footer.innerHTML = 'Soy un footer';
    return footer
}


//assemble pdf onload function
function assemblePDF({items, pages, pageHeight, skipFooterThreshold, scaleDownThreshold, print}) {
    let sumOfHeights = 0;
    let isPageFinished = false;

    const Instructions = {
        scaleDownWidget(widget) {
            const scale = constants.PAGE_HEIGHT/ sumOfHeights;
            console.log({scale, widget})
            widget.style['transform'] = `scale(${scale})`;
        },
        scaleDownPage() {
            const page = pages[pages.length -1];
            const scale = constants.PAGE_HEIGHT/ sumOfHeights;
            console.log({scale, page})
            page.style['transform'] = `scale(${scale})`;
        },
        finishPage() {
            sumOfHeights = 0;
            isPageFinished = true;
        },
        addFooter() {
            const page = pages[pages.length -1];
            const footer = makeFooter();
            console.log({
                of:page.offsetWidth,
                wd: page.style.width,
                style: page.style
            })
            footer.style['width'] = `${page.offsetWidth}px`;
            print.appendChild(footer)
        },
        appendWidget(widget) {
            widget.style.outline = '1px dashed grey';
            const page = pages[pages.length -1];
            sumOfHeights += widget.offsetHeight;
            page.appendChild(widget);
        },
    }

    for (let i = 0; i < items.length; i++) {
        if (isPageFinished){
            Commands.createNewPage({print, pages})
            isPageFinished = false;
        }
        const itemHeight = items[i].offsetHeight;
        //Delta is equal to the prev sum of heights + the current item height - pageHeight
        const debt =  (sumOfHeights + itemHeight) - pageHeight ; //space to fill
        if (debt <= 0) { // Fits without a problem. Template A
           Instructions.appendWidget(items[i])
            if (i+1 === items.length) {
                //Add last footer
                Instructions.addFooter();
            }
        } else if (debt <= scaleDownThreshold) { // Fits but items must be scale down. Template B
            Instructions.appendWidget(items[i])
            Instructions.addFooter();
            /*Instructions.scaleDownPage();*/
            Instructions.scaleDownWidget(items[i-1]);
            Instructions.scaleDownWidget(items[i]);
            Instructions.finishPage();
        } else if (debt < skipFooterThreshold) { // Fits but will not add footer. Will enlarge working area be reducing margins
            console.log("")
            Instructions.appendWidget(items[i])
            Instructions.finishPage();
        } else {
            Instructions.addFooter();
            Instructions.finishPage();
        }
    }
    Commands.hideElements();
    Commands.markAsReady();
}
const default_page_height = (window.customSize)? window.customSize : 1056;
const constants = {
    ALL_WIDGETS_SELECTOR: "#main > div.mail__container > div",
    ALL_PAGES_SELECTOR: '#print > div.pdf-page > div',
    TABLE_WIDGET_SELECTOR: "table.widget-product",
    ALL_MAIL_CONTAINERS: "#main > div.mail__container",
    PAGE_HEIGHT: default_page_height,
    PRINT_SELECTOR: 'print',
    DEFAULT_SKIP_FOOTER_THRESHOLD: default_page_height*0.1,
    DEFAULT_SCALE_DOWN: default_page_height*0.05
}
const Factories = {
     makeWidget (rawWidget){
        if(!rawWidget) return null
        const type = Utils.getWidgetType(rawWidget.classList);
        const rows = Getters.getRows(rawWidget)
        return {
            widget: rawWidget,
            type,
            offsetHeight: rawWidget.offsetHeight,
            table: Getters.getTableFromWidget(rawWidget),
            tbody: Getters.getTbody(rawWidget),
            rows: rows.map(item => (this.makeRow(item))),
        }
    },
     makeRow(item){
        const rawCells = Getters.getCells(item);
        const cells = rawCells.map(el => (this.makeCell(el)))
        const isHorizontalRow = !!cells.find(el => el.cell.classList.contains('mail__hr'))
        return {row: item, cells, isHorizontalRow/*, height: getHeight(item)*/}
    },
     makeCell(item) {
        const img = item.querySelector('img');
        const map = item.querySelector('map');
        const rawLinks = Utils.nodeListToIterable(item.querySelectorAll('a'))
        return {cell: item, img: this.makeImage(img), map, links: rawLinks.map(item => (this.makeLink(item)))}
    },
     makeImage(item) {
        if (!item) {
            return null
        }
        return {
            img: item,
            src: item.src,
            width: item.width,
            height: item.height
        }
    },
     makeLink(item) {
        const style = getComputedStyle(item);
        return {
            link: item,
            href: item.href,
            style: {
                position: style.getPropertyValue('position'),
                top: style.getPropertyValue('top'),
                left: style.getPropertyValue('left'),
                width: style.getPropertyValue('width'),
                height: style.getPropertyValue('height')
            }
        }
    },
}
const Getters = {
    getRows(widget) {
        return Utils.nodeListToIterable(widget.querySelectorAll('tr'));
    },
    getCells(item) {
        return Utils.nodeListToIterable(item.querySelectorAll('td'));
    },
    getTbody(widget) {
        return widget.querySelector('tbody')
    },
    getPrint() {
        return document.getElementById(constants.PRINT_SELECTOR)
    },
    getWidgets() {
        return document.querySelectorAll(constants.ALL_WIDGETS_SELECTOR);
    },
    getPages() {
        return document.querySelectorAll(constants.ALL_PAGES_SELECTOR);
    },
    getTableFromWidget(widget){
    return widget.querySelector(constants.TABLE_WIDGET_SELECTOR)
    }
}
const Commands = {
    selfRemoveFromDOM(item) {
        item.parentNode.removeChild(item)
    },
    hideElements() {
        document.querySelector(constants.ALL_MAIL_CONTAINERS).style.display = "none";
    },
    markAsReady() {
        if (window.pdfdone) {
            window.pdfdone();
        }
        const page = false;
        if (page || true) {
            const readyElem = document.createElement("div");
            readyElem.setAttribute('id', 'pdf-ready');
            /*        page.appendChild(readyElem);*/
        }
        window.status = 'ready';
    },
    createNewPage({print = Getters.getPrint(), pages}) {
        const page = document.createElement("div");
        const pageWrapper = document.createElement("div")
        page.style['outline'] = '1px solid red'
        pageWrapper.style['outline'] = '1px solid orange'
        pageWrapper.setAttribute('class', 'pdf-page');
        pageWrapper.appendChild(page);
        print.appendChild(pageWrapper);
        pages.push(page);
        return page;
    },
    splitWidgetIntoPage({page, pWidget, pages, print}) {
        const itemClone = pWidget.cloneNode(true);
        let sumOfHeights = 0;
        let count = 0;
        const rows = Getters.getRows(pWidget)
        if (rows.length) {
            // Remove rows from widget, copy over from clone individually to fit to page
            for (let i = 0; i < rows.length; i++) {
                Commands.selfRemoveFromDOM(rows[i])
            }
            let nextRow = itemClone.querySelector('tr');
            const rowHeight = Utils.getHeight(nextRow);
            while (nextRow && count < 2 && sumOfHeights + rowHeight < pageHeight) {
                pWidget.querySelector('tbody').appendChild(nextRow);
                sumOfHeights += rowHeight;
                nextRow = itemClone.querySelector('tr');
                count++;
            }
            page.appendChild(pWidget);
            // Recurse on any remaining rows
            const cloneRows = Getters.getRows(itemClone)
            if (cloneRows.length) { return this.splitWidgetIntoPage(this.createNewPage({print, pages})) }
        }
        console.count("SPLIT")

        return sumOfHeights;
    }
}
const Utils = {
    parseWidgets(widgets) {
        return [...widgets].map(w =>Factories.makeWidget(w))
    },
    omitProperties(properties = [], fun, ...args){
        const res = fun(args[0], args[1]);
        return {...res, ...(properties.map(p => ({[p]: undefined})))}
    },
    getHeight(element) {
        if (!element) {
            throw 'Input element can not be null'
        }
        element.style.visibility = "hidden";
        document.body.appendChild(element);
        const height = element.offsetHeight + 0;
        document.body.removeChild(element);
        element.style.visibility = "visible";
        return height;
    },

    getWidgetType (classList){
        if(classList.length === 0){return 'unclassified'}
        if(classList.contains('mail__signature')){return 'mail__signature'}
        if(classList.contains('mail__intro-text')){return 'mail__intro-text'};
        return 'mail_widget'
    },
    nodeListToIterable(nodeList) {
        const items = [];
        nodeList.forEach(el => items.push(el))
        return items
    },
    validateRequiredParams(...params) {
        if (params.length == 0) {
            throw 'Must have at least 1 parameter'
        }
        return params.every(i => !!i)
    }
}

if (typeof exports !== 'undefined') {
    module.exports = {
        Utils,
        Factories,
        Commands,
        Getters,
        constants, 
        assemblePDF,
    };
}