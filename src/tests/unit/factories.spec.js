import Factories from '../../factories';

describe("Test factories functions", function (){
    it('makeFooter command should return a footer object', function () {
        const width = '100px'
        const footer = Factories.makeFooter(width)
    });
})