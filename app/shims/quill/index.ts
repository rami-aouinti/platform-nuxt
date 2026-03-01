export default class Quill {
  root: { innerHTML: string }

  constructor(_selector: string, _options: any) {
    this.root = { innerHTML: '' }
  }

  on(_event: string, _callback: () => void) {}

  pasteHTML(_html: string) {}
}
