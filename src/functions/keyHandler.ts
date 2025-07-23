/**
 * 
 * { KeyHandler, Easter, AddKey, RemoveKey }
 * 
 * in the root
 * new KeyHandler(window)
 * 
 * anywhere in the code
 * window.dispatchEvent(Easter( () => {} ))
 * window.dispatchEvent(AddKey(name: String, event: KeyEvent))
 * window.dispatchEvent(RemoveKey(name: String))
 * 
 */

export type KeyEvent = {
  key: string,
  altKey?: boolean,
  ctrlKey?: boolean,
  shiftKey?: boolean,
  fnc: () => void
}

type KeyEvents = {
  [key: string]: KeyEvent
}

export class KeyHandler {
  #KonamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'B', 'A']
  #KonamiPos = 0
  #easterFnc: VoidFunction = () => {/* */ }
  #window: Window
  #debug = false
  #keyEvents: KeyEvents = {}

  private keyListener = ({ key, altKey, ctrlKey, shiftKey, ...rest }: KeyboardEvent) => {
    this.#debug && console.log('KeyListener', { key, altKey, ctrlKey, shiftKey, ...rest })
    if (key.toLowerCase() === this.#KonamiCode[this.#KonamiPos].toLowerCase()) {
      this.#KonamiPos++
      this.#debug && console.log('konamiPos', this.#KonamiPos)
      if (this.#KonamiPos === this.#KonamiCode.length) {
        console.log('KONAMI')
        this.#easterFnc() // changePage('easter')
        this.#KonamiPos = 0
      }
    } else { this.#KonamiPos = 0 }
    const keyEvent = Object.values(this.#keyEvents).find((keyEvent) => {
      if (keyEvent.key.toLowerCase() === key.toLowerCase()) {
        if (keyEvent.altKey && keyEvent.altKey !== altKey)
          return false
        if (keyEvent.shiftKey && keyEvent.shiftKey !== shiftKey)
          return false
        if (keyEvent.ctrlKey && keyEvent.ctrlKey !== ctrlKey)
          return false
        return true
      }
      return false
    })
    if (keyEvent) {
      this.#debug && console.log('keyEvent', keyEvent)
      keyEvent.fnc()
    } else {
      this.#debug && console.warn('keyEvent not found')
    }
  }

  private easter({ fnc }: EasterEvent) {
    this.#debug && console.log('easter', fnc)
    this.#easterFnc = fnc
  }

  private addKeyListener({ keyName, keyEvent }: AddKeyEvent) {
    if (this.#keyEvents[keyName])
      console.error(`WARNING\nKey Event ${keyName} is being overwritten\nCurrent:${JSON.stringify(this.#keyEvents[keyName], null, '  ')}\nNew: ${JSON.stringify(keyEvent, null, '  ')}`)
    this.#debug && console.log('addKeyListener', keyName, keyEvent)
    this.#keyEvents[keyName] = keyEvent
  }

  private removeKeyListener({ keyName }: RemoveKeyEvent) {
    this.#debug && console.log('removeKeyListener', keyName)
    delete this.#keyEvents[keyName]
  }

  constructor(window: Window, debug = false) {
    this.#window = window
    this.#debug = debug
    window.addEventListener('keyup', (...props) => this.keyListener(...props))
    window.addEventListener('addEasterFunc', (evt: EasterEvent) => this.easter(evt))
    window.addEventListener('addKeyListener', (evt: AddKeyEvent) => this.addKeyListener(evt))
    window.addEventListener('removeKeyListener', (evt: RemoveKeyEvent) => this.removeKeyListener(evt))
  }
}

class EasterEvent extends Event {
  #fnc: VoidFunction = () => {/* */ }
  constructor(fnc: VoidFunction) {
    super('addEasterFunc')
    this.#fnc = fnc
  }
  public get fnc() {
    return this.#fnc
  }
}

class AddKeyEvent extends Event {
  #keyName: string
  #keyEvent: KeyEvent
  constructor(keyName: string, keyEvent: KeyEvent) {
    super('addKeyListener')
    this.#keyName = keyName
    this.#keyEvent = keyEvent
  }
  public get keyName() {
    return this.#keyName
  }
  public get keyEvent() {
    return this.#keyEvent
  }
}

class RemoveKeyEvent extends Event {
  #keyName: string
  constructor(keyName: string) {
    super('removeKeyListener')
    this.#keyName = keyName
  }
  public get keyName() {
    return this.#keyName
  }
}

export const Easter = (fnc: VoidFunction) => new EasterEvent(fnc)
export const AddKey = (keyName: string, keyEvent: KeyEvent) => new AddKeyEvent(keyName, keyEvent)
export const RemoveKey = (keyName: string) => new RemoveKeyEvent(keyName)