import '@testing-library/jest-dom/extend-expect'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import {Commander} from '../../commander'
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
        expect(item.classList.length).toBe(0)
    });


})