const methods = {
	execScript: ({ name, source, context }) => {
		const func = new Function(`return ${source}`)();
		const result = func(...context);
		postMessage({ id: name, result });
	},
};

onmessage = (e) => {
	if (e.data.method in methods) {
		methods[e.data.method](e.data);
		return;
	} 
	console.error('Unknown method');
}
