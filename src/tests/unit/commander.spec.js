import '@testing-library/jest-dom/extend-expect'
import fs from 'fs'
import path from 'path'
import Utils from '../../utils'
import constants from '../../constants'
import getters from '../../getters'
import Commander from '../../commander'
import Factories from '../../factories'

const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');


describe("Test DOM commander functions", function (){

    beforeEach(function (){
        document.body.innerHTML = html;
    })

    it("setStyle command should set custom style", function (){
        const item = document.createElement('p')
        const customStyle = {
            ['font-weight']: 'bold',
        }
        Commander.execute('setStyle', item, customStyle)
        expect(item.style._values).toEqual(customStyle)
    })

    it('removeClass command should remove class', function () {
        const item = document.createElement('p');
        const classname = 'item';
        item.classList.add(classname)
        expect(item.classList).toContain(classname)
        Commander.execute('removeClass', item, classname)
        expect(item.classList).not.toContain(classname)
    });

    it('resetPageStatus command should reset isPageFinished', function () {
        const state = {isPageFinished: true}
        Commander.execute('resetPageStatus', state)
        expect(state.isPageFinished).toEqual(false)
    });

    it('appendPage should add page to print', function () {
        const print = getters(constants).getPrint()
        const pages = Utils.nodeListToIterable(getters(constants).getPages())
        const page = Factories.makePage();
        expect(getters(constants).getPages().length).toEqual(1)
        Commander.execute('appendPage', print, pages, page);
        expect(getters(constants).getPages().length).toEqual(2)
    });

    it('scaleElement command should apply transform property', function () {
        const widgets = getters(constants).getWidgets();
        const widget = widgets[widgets.length -1]
        const scale = 0.5;
        const expectedValue = Utils.formatScale(scale)
        Commander.execute('scaleElement', widget, expectedValue)
        expect(widget.style.transform).toBe(expectedValue)
    });

    it('sumHeight command should add value to state.sumOfHeight', function () {
        const state = {sumOfHeights: 0};
        const height = 100;
        Commander.execute('sumHeight', state, height)
        expect(state.sumOfHeights).toEqual(height)
    });

    it('finishPage command should change sumOfHeight and isPageFinished state', function () {
        const state = {sumOfHeights: 100, isPageFinished: false}
        const expectedValue = {sumOfHeights: 0, isPageFinished: true}
        Commander.execute('finishPage', state)
        expect(state).toEqual(expectedValue)
    });

    it('addFooter command should append widget to a given page ', function () {
        const pages = getters(constants).getPages();
        const page = pages[pages.length-1];
        const footer = Factories.makeFooter(page.offsetWidth)
        Commander.execute('addFooter', page, footer)
    });

    it('appendWidget command should add a widget to a page', function () {
        const page = Factories.makePage();
        const widgets = getters(constants).getWidgets();
        const widget = widgets[widgets.length -1];
        expect(page.childElementCount).toEqual(0)
        Commander.execute('appendWidget', page, widget);
        expect(page.childElementCount).toEqual(1)
    });

    it('markDocAsReady command should create readyElement', function () {
        expect(document.body.innerHTML).not.toContain('<div id="pdf-ready"></div>')
        expect(window.status).not.toEqual('ready')
        Commander.execute('markDocAsReady')
        expect(document.body.innerHTML).toContain('<div id="pdf-ready"></div>')
        expect(window.status).toEqual('ready')
    });
})