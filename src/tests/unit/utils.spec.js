import { fireEvent, getByText } from '@testing-library/dom'
import '@testing-library/jest-dom/extend-expect'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import {Utils} from '../../assemble_pdf'
const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');

let dom
let document
let body

describe("Test Utils", () => {
  beforeEach(() => {
/*    dom = new JSDOM(html, {runScripts: 'dangerously'})
    body = dom.window.document.body;
    document = dom.window.document*/
  })

  it("validate required params with empty input", async () => {
    expect( Utils.validateRequiredParams).toThrow('Must have at least 1 parameter' )
  })

  it("validate required params with null input", async () => {
    const params = null;
    const value = Utils.validateRequiredParams(params)
    expect(value).toBe(false)
  })

  it("validate required params with single input", async () => {
    const params = [1];
    const value = Utils.validateRequiredParams(...params)
    expect(value).toBe(true)
  })

  it("validate required params with multiple input", async () => {
    const params = [1,2];
    const value = Utils.validateRequiredParams(...params)
    expect(value).toBe(true)
  })

  it("validate required params with multiple input", async () => {
    const params = [1,0];
    const value = Utils.validateRequiredParams(...params)
    expect(value).toBe(false)
  })
})

/*

describe('index.html', () => {
  beforeEach(() => {
    // Constructing a new JSDOM with this option is the key
    // to getting the code in the script tag to execute.
    // This is indeed dangerous and should only be done with trusted content.
    // https://github.com/jsdom/jsdom#executing-scripts
    dom = new JSDOM(html, { runScripts: 'dangerously' })
    container = dom.window.document.body
  })

  it('renders a heading element', () => {
    expect(container.querySelector('h1')).not.toBeNull()
    expect(getByText(container, 'Pun Generator')).toBeInTheDocument()
  })

  it('renders a button element', () => {
    expect(container.querySelector('button')).not.toBeNull()
    expect(getByText(container, 'Click me for a terrible pun')).toBeInTheDocument()
  })

  it('renders a new paragraph via JavaScript when the button is clicked', async () => {
    const button = getByText(container, 'Click me for a terrible pun')
    
    fireEvent.click(button)
    let generatedParagraphs = container.querySelectorAll('#pun-container p')
    expect(generatedParagraphs.length).toBe(1)

    fireEvent.click(button)
    generatedParagraphs = container.querySelectorAll('#pun-container p')
    expect(generatedParagraphs.length).toBe(2)

    fireEvent.click(button)
    generatedParagraphs = container.querySelectorAll('#pun-container p')
    expect(generatedParagraphs.length).toBe(3)
  })
})
*/
