export const Boss = (function() {
    const $workers = Symbol();
    return class Boss {
        constructor() {
            this[$workers] = new Set;
        }
        get workers() {
            return new Set(this[$workers]);
        }
        addWorker(worker) {
            if (typeof worker == "string") worker = new Worker(worker);
            worker.addEventListener("message", event => {
                
            });
            this[$workers].add(worker);
        }
    };
})();