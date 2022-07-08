onmessage = (e) => {
    postMessage((new Function('return { method: "callback", body: 10 };'))());
}