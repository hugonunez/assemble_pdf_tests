import Factories from '../../factories';

describe("Test factories functions", function (){
    it('makeFooter should return a footer element', function () {
        const width = '100px'
        const footer = Factories.makeFooter(width)
        expect(footer.classList).toContain('footer')
    });

    it('makePage should return a page element', function () {
        const page = Factories.makePage()
        expect(page.classList).toContain('page')
    });
})