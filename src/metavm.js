const worker = {
  _worker: new Worker("/src/worker.js"),
  async sendContext(base) {
    const context = {};
    for await (const [key, val] of Object.entries(base)) {
      context[key] = await val;
    }
    this._worker.postMessage({ method: "createContext", context });
  },
  sendScript(script, name) {
    try {
      this._worker.postMessage({ name, method: "addScript", script });
      return true;
    } catch (e) {
      console.error("Couldn't send script to worker: ", e.message);
      return false;
    }
  },
  execScript(name, ctx) {
    return () => new Promise((resolve) => {
      this.sendContext(ctx);
        this._worker.postMessage({ name, method: "runScript" });
        this._worker.addEventListener("message", (e) => {
          const { result } = e.data;
          resolve(result);
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

    this.context = options.context || createContext();
    worker.sendContext(this.context);
    worker.sendScript(this.src, this.name);
  }

  get exports() {
    return worker.execScript(this.name, this.context);
  }
}

const createScript = (name, src, options) => new MetaScript(name, src, options);

export { createContext, createScript };
