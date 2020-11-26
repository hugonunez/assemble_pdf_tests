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

    it('makeTemplate should return a formatted template, with footer', function () {
        const template = Factories.makeTemplate(1, true)
        const expectedValue = {
            'grid-template-areas':'"widget"\n' +
                '"footer"',
            'gap': '0em',
            'grid-template-rows': "1fr 76px",
            'align-items': 'center'
        };
        expect(template).toEqual(expectedValue)
    });

    it('makeTemplate should return a formatted template, without footer', function () {
        const template = Factories.makeTemplate(1, false)
        const expectedValue = {
            'grid-template-areas':'"widget"\n',
            'gap': '0em',
            'grid-template-rows': "1fr ",
            'align-items': 'center'
        };
        expect(template).toEqual(expectedValue)
    });

    it('makeTemplate should return a formatted template, with signature', function () {
        const template = Factories.makeTemplate(1, true, true)
        const expectedValue = {
            'grid-template-areas':'"widget"\n' +
                '"signature"\n' +
                '"footer"',
            'gap': '0em',
            'grid-template-rows': "1fr auto 76px",
            'align-items': 'center'
        };
        expect(template).toEqual(expectedValue)
    });
})