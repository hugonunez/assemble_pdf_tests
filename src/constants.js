
/*
* Constants collection
* */
var A4 = {
    w: 210,
    h: 279
}

var default_page_height = Utils.mmToPx(A4.h)
var default_page_width = Utils.mmToPx(A4.w)
var constants = {
    ALL_WIDGETS_SELECTOR: "#main > div.mail__container > div",
    ALL_PAGES_SELECTOR: '#print > div.page',
    TABLE_WIDGET_SELECTOR: "table.widget-product",
    ALL_MAIL_CONTAINERS: "#main > div.mail__container",
    PAGE_HEIGHT: default_page_height,
    PAGE_WIDTH: default_page_width,
    PRINT_SELECTOR: 'print',
    DEFAULT_SKIP_FOOTER_THRESHOLD: default_page_height*0.05,
    DEFAULT_SCALE_DOWN: default_page_height*0.1
}

if (typeof exports !== 'undefined') {
    module.exports = {
        constants
    };
}