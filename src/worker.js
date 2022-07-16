const scripts = new Map();

const methods = {
	createContext: ({ context }) => {
		console.log(context);
		Object.entries(context).forEach(([key, value]) => {
			self[key] = value;
		});
	},
	addScript: ({ name, script }) => {
		scripts.set(name, new Function(`return ${script}`)());
	},
	runScript: ({ name }) => {
		postMessage({ result: scripts.get(name)()})
	},
};

onmessage = (e) => {
	if (e.data.method in methods) {
		methods[e.data.method](e.data);
		return;
	} 
	console.error('Unknown method');
}
