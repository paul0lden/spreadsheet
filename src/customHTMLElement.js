export class EventRegestry extends Map {
  constructor() {
    super();
  }

  clearEvents() {
    for (const [name, value] of this) {
      if (!name.endsWith("-subreg")) {
        value.forEach(([callback, ref]) => {
          ref.removeEventListener(name, callback);
        });
        this.delete(name);
      } else {
        value.clearEvents();
      }
    }
  }
}

export class CustomHTMLElement extends HTMLElement {
  constructor() {
    super();

    if (!window.eventRegestry) {
      window.eventRegestry = new EventRegestry();
    }

    const subRegestry = window.eventRegestry;
    if (subRegestry) {
      this.eventRegestry = window.eventRegestry;
    } else {
      this.eventRegestry = new EventRegestry();
      window.eventRegestry.set(
        `${this.nodeName}${window.eventRegestry.size}-subreg`,
        this.eventRegestry
      );
    }

    for (const val of Object.getOwnPropertyNames(this.__proto__)) {
      if (val.toLowerCase().includes("handler")) {
        this.on(val.toLowerCase().replace("handler", ""), this[val]);
      }
    }
  }

  on(name, fn) {
    this.addEventListener(name, fn);
    const event = this.eventRegestry.get(name);
    if (event) event.add(fn);
    else this.eventRegestry.set(name, new Set([[fn, this]]));
    return this;
  }

  // TODO: implement
  emit(name, ...args) {
    const event = this.events.get(name);
    if (!event) return;
    this.dispatchEvent(name);
    for (const fn of event.values()) {
      fn(...args);
    }
  }

  remove(name, fn) {
    const event = this.eventRegestry.get(name);
    if (!event) return;
    if (event.has([fn, this])) {
      this.removeEventListener(name, fn);
      event.delete([fn, this]);
      return;
    }
  }

  clear() {
    this.eventRegestry.clearEvents();
  }

  addStyles(styles) {
    for (const [key, value] of Object.entries(styles)) {
      if (typeof this.style[key] !== "undefined") {
        this.style[key] = value;
      }
    }
    return this;
  }

  appendNode(node, { classes = [], text = "" } = {}) {
    if (text) node.append(text);
    if (classes) node.classList.add(...classes);
    this.appendChild(node);
    return node;
  }

  appendSibling(node, { classes = [], text = "" } = {}) {
    if (this.parentElement instanceof CustomHTMLElement) {
      return this.parentElement.appendNode(node, { classes, text });
    } else {
      console.error("Can not append sibling to default html element");
    }
  }

  appendText(text) {
    this.append(text);
    return this;
  }
}
