import '@testing-library/jest-dom/extend-expect'
import fs from 'fs'
import path from 'path'
import constants from '../../constants'
import getters from '../../getters'
const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');

describe("Test getter functions on static html", function (){
    beforeEach(function (){
        document.body.innerHTML = html
    })

    it('getPrint should return the print DOM object', function () {
        const print = getters(constants).getPrint();
        expect(print).toBeInTheDocument()
    });

    it('getPages should return pages nodeList', function () {
        const pages = getters(constants).getPages();
        expect()
    });

})