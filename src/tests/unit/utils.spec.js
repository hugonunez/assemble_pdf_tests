import {Utils} from "../../utils"
describe("Test Util functions", function (){

    it('Function nodeListToIterable should convert to array', function () {
        const nodeList = document.childNodes;
        expect(nodeList).not.toHaveProperty('push')
        const iterable = Utils.nodeListToIterable(nodeList);
        expect(iterable).toHaveProperty('push')
    });

    it('Function formatScale should return formatted text', function () {
        const value = Utils.formatScale(1);
        const expectedValue = 'scale(1)';
        expect(value).toEqual(expectedValue);
    });

})