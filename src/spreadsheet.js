import { CustomHTMLElement } from "./customHTMLElement.js";
import { Sheet } from "./metacalc.js";

const splitLetters = (string) => {
  return {
    columnId: string.match(/[a-zA-Z]/g).join(""),
    rowId: string.match(/[0-9]/g).join(""),
  };
};

class Cell extends CustomHTMLElement {
  constructor(index, innerText = "0") {
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
  constructor({ data, width, height }) {
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
    this.isSelecting = false;
    const staticFields = ['columns', 'rows', 'width', 'height'];
    this.table = new Proxy(this, {
      ownKeys(target) {
        return [];
      },
      getOwnPropertyDescriptor() {
        return { enumerable: true, configurable: true };
      },
      get: (target, prop) => {
        if (prop in staticFields) {
          const rows = {};
          const columns = {};
          for (const key in Object.keys(target.table)) {

            const { columnId, rowId } = splitLetters(key);
            columns[columnId] = 0;
            rows[rowId] = 0;
          }
          if (prop === 'columns') return Object.keys(columns);
          if (prop === 'width') return Object.keys(columns).length;
          if (prop === 'rows') return Object.keys(rows);
          if (prop === 'columns') return Object.keys(rows).length;
        }
        if (target.sheet.values[prop]) return target.sheet.values[prop];
        return '0';
      },
      set: (target, prop, value) => {
        if (porp in staticFields) {
          console.error("Static fields are not editable");
          return;
        }
        if (value) target.sheet.cells[prop] = value;
      },
    });
    this.sheet = new Sheet();
    this.defaultWidth = width;
    this.defaultHeight = height;
  }

  static get observedAttributes() {
    return ["data"];
  }

  get data() {}

  set data(obj) {}

  numToChar(num) {
    const numToLetter = (n) => {
      return String.fromCharCode(65 + n);
    };
    if (num === undefined || num < 0) return undefined;
    const lastLetter = this.numToLetter(num % 26);
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

    this.isSelecting = true;
    this.selectionStart = e.target.index;
  }

  dblclickHandler(e) {
    if (e.target.isCell) {
      e.target.edit();
    }
  }

  mouseupHandler() {
    this.isSelecting = false;
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
    if (e.target.isCell && this.isSelecting)
      this.selectionTarget = e.target.index;
  }

  renderTable() {
    for (const column in this.table.columns) {
      for (const row in this.table.rows) {
        const index = `${column, row}`;
        this.appendChild(new Cell(index, this.table[index]));
      }
    }
  }

  async connectedCallback() {
    this.renderTable();
  }

  disconnectedCallback() {}

  attributeChangedCallback() {}
}

// add custom elements to a regestry

customElements.define("meta-cell", Cell);
customElements.define("meta-spreadsheet", Spreadsheet);
