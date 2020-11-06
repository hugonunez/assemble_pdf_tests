
//Override 1 function or use fallback
const fallbackOnload = window.onload;
window.onload = onLoad || fallbackOnload;

function onLoad () {
    const widgets = Getters.getWidgets();
    const parsedWidgets = Utils.parseWidgets(widgets);
    const pages = Utils.nodeListToIterable(Getters.getPages());
    const print = Getters.getPrint();
    const validated = Utils.validateRequiredParams(widgets, parsedWidgets, pages, print);
    const mode = 'landscape'; // portrait or landscape
    if (validated) {
        return assemblePDF({
            pages,
            items: widgets,
            print,
            skipFooterThreshold: constants.DEFAULT_SKIP_FOOTER_THRESHOLD,
            scaleDownThreshold: constants.DEFAULT_SCALE_DOWN,
            pageHeight: constants.PAGE_HEIGHT,
            mode
        });
    }
    console.log('Using fallback onLoad function');
    console.warn({MSG: "Could not load assemble_pdf, required elements returned: ", widgets, parsedWidgets, pages, print});
    return null
}
function makeSeparator({width}) {
    const separator = document.createElement('hr');
    separator.style.width = `${width}px`
    separator.style['margin-left'] = `${Math.floor(width*0.01)}px`
    separator.style['border-top'] = '2px solid grey'
    return separator
}
function makeFooterAndWrapper ({pageIndex, mode, width} = {mode: 'portrait', pageIndex: 1}){
    const footerWrapper = document.createElement('div');
    const footer = document.createElement("div");
    const rightSection = document.createElement('small');
    const footerSignature = document.createElement('small');
    const customWidth = mode === 'landscape'? width*2: width;

    //footer
    footer.style['padding'] = '10px'
    footer.style['font-weight'] = 'bold';
    footer.style['margin-top'] = '10px';
    footer.style['margin-bottom'] = '10px';
    footer.style['display'] = 'flex';
    footer.style['justify-content'] = 'space-between';
    footer.style.width = `${customWidth}px`
    footer.setAttribute('class', 'pdf-footer');

    footerSignature.style['color'] = 'grey';
    footerSignature.style['top'] = '10px';
    footerSignature.style['left'] = '50%'
    footerSignature.style['position'] = 'relative'
    footerSignature.style['margin-left'] = 'auto';
    footerSignature.style['margin-right'] = 'auto';
    footerSignature.innerHTML = 'SEARS 2020'

    if (mode === 'portrait'){
        rightSection.style['margin-right'] = '0';
        rightSection.style['margin-left'] = 'auto';
    }
    rightSection.innerHTML = `page ${pageIndex}`;

    footer.appendChild(rightSection);
    footerWrapper.style.width = `${customWidth}px`
    footerWrapper.appendChild(makeSeparator({width: customWidth}));
    footerWrapper.appendChild(footerSignature)
    footerWrapper.appendChild(footer)
    return {footerWrapper, footer}
}

//assemble pdf onload function
function assemblePDF({items, pages, pageHeight, skipFooterThreshold, scaleDownThreshold, print, mode}) {
    let sumOfHeights = 0;
    let isPageFinished = false;

    const Instructions = {
        scaleDownWidget(widget, scale = constants.PAGE_HEIGHT/ sumOfHeights) {
            widget.style['transform'] = `scale(${scale})`;
        },
        finishPage() {
            sumOfHeights = 0;
            isPageFinished = true;
        },
        addFooter() {
            const page = pages[pages.length -1];
            const {footer, footerWrapper} = makeFooterAndWrapper({pageIndex: pages.length, mode, width: page.offsetWidth});
            footer.style['width'] = `${page.offsetWidth}px`;
            print.appendChild(footerWrapper);
        },
        appendWidget(widget) {
            const page = pages[pages.length -1];
            sumOfHeights += widget.offsetHeight;
            page.appendChild(widget);
        },
        transformToLandscape() {
            const pages_tuples = [];
            const pages = Getters.getPages();
            for (let i=0; i < pages.length; i+=2) {
                let sumOfWidths = pages[i].offsetWidth;
                if ( pages[i+1]) {
                    sumOfWidths += pages[i+1].offsetWidth
                    Commands.scalePage({page: pages[i], scale: constants.PAGE_HEIGHT/sumOfWidths})
                    Commands.scalePage({page: pages[i+1], scale: constants.PAGE_HEIGHT/sumOfWidths})
                }

                pages_tuples.push([pages[i], pages[i+1]]);
            }
            print.innerHTML = ''
            pages_tuples.forEach((tuple, index) => {
                const landScape = Commands.createLandscapePage({pages: tuple});
                print.appendChild(landScape);
                print.appendChild(makeLandscapeFooter({pagesIndex: [index+index +1, index+index+2], noLastPage: !tuple[1], mode}))
            })

        }
    }

    for (let i = 0; i < items.length; i++) {
        if (isPageFinished){
            Commands.createNewPage({print, pages, mode});
            isPageFinished = false;
        }
        const itemHeight = items[i].offsetHeight;
        //Delta is equal to the prev sum of heights + the current item height - pageHeight
        const debt =  (sumOfHeights + itemHeight) - pageHeight ; //space to fill
        if (debt <= 0) { // Fits without a problem. Template A
            Instructions.appendWidget(items[i]);
            if (i+1 === items.length) {
                //Add last footer
                Instructions.addFooter();
            }
        } else if (debt <= scaleDownThreshold) { // Fits but items must be scale down. Template B
            Instructions.appendWidget(items[i]);
            Instructions.addFooter();
            /*Instructions.scaleDownPage();*/
            Instructions.scaleDownWidget(items[i-1]);
            Instructions.scaleDownWidget(items[i]);
            Instructions.finishPage();
        } else if (debt < skipFooterThreshold) { // Fits but will not add footer. Will enlarge working area be reducing margins
            Instructions.appendWidget(items[i])
            Instructions.finishPage();
        } else {
            Instructions.addFooter();
            Instructions.finishPage();
        }
    }

    if (mode === 'landscape'){
        Instructions.transformToLandscape();
    }
    Commands.hideElements();
    Commands.markAsReady();
}
function makeLandscapeFooter({pagesIndex, noLastPage, mode}) {
    const {footer, footerWrapper} = makeFooterAndWrapper({pageIndex: pagesIndex[0], mode});
    //left section
    const leftSection = document.createElement('small');

    leftSection.innerHTML = `Page ${pagesIndex[1]}`;
    if (!noLastPage){
        footer.appendChild(leftSection);
    }
    return footerWrapper
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
        if(!rawWidget) return null;
        const type = Utils.getWidgetType(rawWidget.classList);
        const rows = Getters.getRows(rawWidget)
        return {
            widget: rawWidget,
            type,
            offsetHeight: rawWidget.offsetHeight,
            table: Getters.getTableFromWidget(rawWidget),
            tbody: Getters.getTbody(rawWidget),
            rows: rows.map(item => (this.makeRow(item))),
        };
    },
     makeRow(item){
        const rawCells = Getters.getCells(item);
        const cells = rawCells.map(el => (this.makeCell(el)));
        const isHorizontalRow = !!cells.find(el => el.cell.classList.contains('mail__hr'));
        return {row: item, cells, isHorizontalRow/*, height: getHeight(item)*/}
    },
     makeCell(item) {
        const img = item.querySelector('img');
        const map = item.querySelector('map');
        const rawLinks = Utils.nodeListToIterable(item.querySelectorAll('a'));
        return {cell: item, img: this.makeImage(img), map, links: rawLinks.map(item => (this.makeLink(item)))}
    },
     makeImage(item) {
        if (!item) {
            return null;
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
        return widget.querySelector('tbody');
    },
    getPrint() {
        return document.getElementById(constants.PRINT_SELECTOR);
    },
    getWidgets() {
        return document.querySelectorAll(constants.ALL_WIDGETS_SELECTOR);
    },
    getPages() {
        return document.querySelectorAll(constants.ALL_PAGES_SELECTOR);
    },
    getTableFromWidget(widget){
        return widget.querySelector(constants.TABLE_WIDGET_SELECTOR);
    }
}

const Commands = {
    scalePage({page, scale}) {
        console.log({scale, page})
        if (page){
            if (scale !== 0 && scale !== 1){
                page.style['transform'] = `scale(${scale})`;

            }
        }
    },
    selfRemoveFromDOM(item) {
        item.parentNode.removeChild(item);
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
        const pageWrapper = document.createElement("div");
        pageWrapper.setAttribute('class', 'pdf-page');
        pageWrapper.appendChild(page);
        print.appendChild(pageWrapper);
        pages.push(page);
        return page;
    },
    createLandscapePage({pages}) {
        const page1 = pages[0];
        const page2 = pages[1];
        const pageWidth = constants.PAGE_HEIGHT;
        console.log({pageWidth})
        const pageWrapper = document.createElement("div");
        pageWrapper.style['display'] = 'flex';
        pageWrapper.style['align-items'] = 'center';
        pageWrapper.style['justify-content'] = 'center';
        pageWrapper.setAttribute('class', 'pdf-page-landscape');
        pageWrapper.appendChild(page1);
        if (page2) {
            pageWrapper.appendChild(page2);
        }
        return pageWrapper;
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
        return [...widgets].map(w =>Factories.makeWidget(w));
    },
    omitProperties(properties = [], fun, ...args){
        const res = fun(args[0], args[1]);
        return {...res, ...(properties.map(p => ({[p]: undefined})))}
    },
    getHeight(element) {
        if (!element) {
            throw 'Input element can not be null';
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
        return 'mail_widget';
    },
    nodeListToIterable(nodeList) {
        const items = [];
        nodeList.forEach(el => items.push(el));
        return items;
    },
    validateRequiredParams(...params) {
        if (params.length == 0) {
            throw 'Must have at least 1 parameter';
        }
        return params.every(i => !!i);
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