const worker = {
  _worker: new Worker("/src/worker.js"),
  execScript(name, script, ctx) {
    return () => new Promise((resolve, reject) => {
      const func = `(${Object.keys(ctx)}) => ${script}`
      this._worker.postMessage({ method: 'execScript', name, source: func, context: Object.values(ctx) });
      this._worker.addEventListener("message", (event) => {
        const { result, id } = event.data;
        if (name === id) resolve(result);
      });
    });
  },
};

const createContext = (context) => {
  if (context === undefined) return {};
  return context;
};

class MetaScript {
  constructor(name, src, options) {
    this.name = name;
    this.src = src;
    this.dirname = options.dirname || null;

    this.context = { ...options.context } || createContext();
    this.exports = worker.execScript(this.name, this.src, this.context);
  }
}

const createScript = (name, src, options) => new MetaScript(name, src, options);

export { createContext, createScript };
