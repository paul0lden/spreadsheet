import { createContext, createScript } from './worker-vm.js';

const wrap = (target) =>
  new Proxy(target, {
    get: (target, prop) => {
      if (prop === "constructor") return null;
      const value = target[prop];
      if (typeof value === "number") return value;
      return wrap(value);
    },
  });

const math = wrap(Math);

const getValue = (target, prop) => {
  if (prop === 'Math') return math;
  const { expressions, data } = target;
  if (!expressions.has(prop)) return data.get(prop);
  const expression = expressions.get(prop);
  return expression();
};

const getCell = (target, prop) => {
  const { expressions, data } = target;
  const collection = expressions.has(prop) ? expressions : data;
  return collection.get(prop);
};

const setCell = (target, prop, value) => {
  if (typeof value === "string" && value[0] === "=") {
    const src = '() => ' + value.substring(1);
    const options = { context: target.context };
    const script = createScript(prop, src, options);
    target.expressions.set(prop, script.exports);
  } else {
    target.data.set(prop, value);
  }
  return true;
};

const hasValue = (target, prop) => {
  if (target.values[prop]) return true;
  return false;
};

export class Sheet {
  constructor() {
    this.data = new Map();
    this.expressions = new Map();
    this.values = new Proxy(this, {
      ownKeys(target) {
        return [...target.data.keys(), ...target.expressions.keys()];
      },
      getOwnPropertyDescriptor() {
        return { enumerable: true, configurable: true };
      },
      get: getValue,
      has: hasValue,
    });
    this.context = createContext(this.values);
    this.cells = new Proxy(this, { get: getCell, set: setCell });
  }
}
