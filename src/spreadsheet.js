import { CustomHTMLElement } from "./customHTMLElement.js";
import { Sheet } from "./metacalc.js";

const splitLetters = (string) => {
  return {
    columnId: string.match(/[a-zA-Z]/g).join(""),
    rowId: string.match(/[0-9]/g).join(""),
  };
};

class Cell extends CustomHTMLElement {
  constructor(index, value) {
    super();
    this.classList.add(
      "font-normal",
      "w-20",
      "border-slate-600",
      "border-solid",
      "border-2",
      "focus-visible:outline-none",
      "focus-visible:outline-0",
      "focus-visible:ring-inset",
      "focus-visible:ring-4",
      "focus-visible:ring-sky-300",
      "focus-visible:bg-white"
    );
    this.addStyles({ margin: "-1px 0 0 0" });

    this.index = index.toString();
    this.appendText(innerText);
  }

  get isCell() {
    return true;
  }

  get selectStyles() {
    return [
      "bg-slate-200",
      "ring-inset",
      "ring-2",
      "ring-slate-600",
      "dark:bg-slate-700",
    ];
  }

  select() {
    this.classList.add(...this.selectStyles);
  }

  deselect() {
    this.classList.remove(...this.selectStyles);
  }

  blurHandler() {
    this.contentEditable = false;
  }

  disconnectedCallback() {
    this.clear();
  }

  edit() {
    this.contentEditable = true;
    this.focus();
  }
}

export class Spreadsheet extends CustomHTMLElement {
  constructor(data, { width = 10, height = 10, endless = false }) {
    super();
    this.classList.add(
      "m-6",
      "w-fit",
      "rounded-sm",
      "border-stone-900",
      "border-solid",
      "flex",
      "w-fit",
      "block",
      "dark:text-white"
    );
    this.state = {
      isSelecting: false,
    };
    this._sheet = new Sheet();

    this.cells = [];

    this.table = new Proxy(this,{
        get: (target, prop) => {
          if (prop === "columns") {
          }
        },
        set: (target, prop, value) => {},
      }
    );
  }

  get data() {}

  set data(obj) {}

  static numToChar(num) {
    const numToLetter = (n) => {
      return String.fromCharCode(65 + n);
    };
    if (num === undefined || num < 0) return undefined;
    const lastLetter = numToLetter(num % 26);
    const indexes = Math.floor(num / 26) - 1;
    const firstLetters =
      indexes > 0
        ? indexes > 26
          ? this.numToChar(indexes)
          : this.numToLetter(indexes)
        : undefined;
    return `${firstLetters ?? ""}${lastLetter ?? ""}`;
  }

  // selectHandler(e) {
  // e.preventDefault();
  // }

  mousedownHandler(e) {
    e.preventDefault();
    if (this.clickedElement) {
      if (this.clickedElement.isCell) this.clickedElement.deselect();
    }
    this.clickedElement = e.target;

    if (this.clickedElement.isCell && !this.clickedElement.isHeaderCell) {
      this.clickedElement.select();
    }

    this.setState((el) => ({ ...el, isSelecting: true }));
    this.selectionStart = e.target.index;
  }

  dblclickHandler(e) {
    if (e.target.isCell) {
      e.target.edit();
    }
  }

  mouseupHandler() {
    this.setState((el) => ({ ...el, isSelecting: false }));
  }

  keyboardHandler(e) {
    switch (e.key) {
      case "Enter":
        break;

      default:
        break;
    }
  }

  mouseoverHandler(e) {
    e.preventDefault();
    if (e.target.isCell && this.state.isSelecting)
      this.selectionTarget = e.target.index;
  }

  render() {
    for (const column in this.table.columns) {
      for (const row in this.table.rows) {
        const index = `${(column, row)}`;
        this.appendChild(new Cell(index, this.table[index]));
      }
    }
  }

  async connectedCallback() {
    this.render();
  }

  disconnectedCallback() {}

  attributeChangedCallback() {}
}

// add custom elements to a regestry

customElements.define("meta-cell", Cell);
customElements.define("meta-spreadsheet", Spreadsheet);
