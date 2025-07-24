import { clearChildren } from "./clearChildren"

export type Page = {
  id: string
  renderer: () => any
  unRender?: VoidFunction
}

export class PageManager {
  #currentPage?: Page = {
    id: '',
    renderer: () => {/* */}
  }
  #window: Window
  #baseElement?: HTMLElement
  #debug: boolean

  constructor(window: Window, baseElement: HTMLElement, debug = false) {
    this.#window = window
    this.#debug = debug
    this.#baseElement = baseElement
    window.addEventListener('changePage', (evt: ChangePage) => this.updatePage(evt))
  }

  private updatePage({pageFunctions: pageFunctions}: ChangePage) {
    this.#debug && console.log('pageTest', this.#currentPage.id, pageFunctions.id)
    if(pageFunctions.id === this.#currentPage.id)
      return
    this.#debug && console.log('updatePage', this.#currentPage, pageFunctions)
    if(this.#currentPage.unRender) {
      this.#debug && console.log('unRender')
      this.#currentPage.unRender()
    }
    clearChildren(this.#baseElement)
    this.#currentPage = pageFunctions
    this.#currentPage.renderer()
  }
}

class ChangePage extends Event {
  #pageFunctions: Page
  constructor(pageFunctions: Page) {
    super('changePage')
    this.#pageFunctions = pageFunctions
  }
  public get pageFunctions() {
    return this.#pageFunctions
  }
}

export const changePage = (pageFunctions: Page) => new ChangePage(pageFunctions)
