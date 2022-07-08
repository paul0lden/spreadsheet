const worker = {
  _worker: new Worker('/src/worker.js'),
  sendContext(context) {
		this._worker.postMessage({ method: 'createContext', body: {...context} });
  },
  sendScript(src, name) {
    try {
      this._worker.postMessage({ id: name, method: 'addScript', src });
      return true;
    } catch (e) {
      console.error('Couldn\'t send script to worker: ', e.message);
      return false;
    }
  },
  execScript(name) {
    this._worker.postMessage({ id: name, method: 'runScript' });
    return () => new Promise((resolve) => {
      this._worker.addEventListener('message', (e) => {
        const { id, body, message } = e.data;
        if (id === name && message === 'result') resolve(body);
      })});
  }
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
    return worker.execScript(this.name);
  }
}

const createScript = (name, src, options) => new MetaScript(name, src, options);

export {
  createContext,
  createScript,
};
