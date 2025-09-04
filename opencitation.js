const doi_filter = /=>\s(.+)/;

const cache_promise = (async () => {
    return caches.open("open-citations");
})();

async function queryCache(url) {
    const cache = await cache_promise;
    return cache.match(new Request(url));
}

class Requests {
    static #requests = [];
    static #__maxRate = 10;
    static get maxRate() {
        return this.#__maxRate;
    }
    static set maxRate(value) {
        this.#__maxRate = Math.max(1, Math.min(100, value)) || this.#__maxRate;
    }
    static #counter = 0;
    static requestPromise(priority = false) {
        const promise = new Promise(resolve => {
            if (this.#counter < this.maxRate) {
                resolve();
                ++this.#counter;
            } else {
                if (priority == false) {
                    this.#requests.push(resolve);
                } else {
                    this.#requests.unshift(resolve);
                }
            }
        });
        // console.log("counter", this.#counter);
        return promise;
    }
    static free() {
        --this.#counter;
        // console.log("free", this.#counter, this.maxRate, this.#requests.length);
        while (this.#counter < this.maxRate && this.#requests.length) {
            ++this.#counter;

            const resolve = this.#requests.shift();
            resolve();
        }
    }
    static get queue_length() {
        return this.#requests.length;
    }
}
globalThis.Requests = Requests;


async function fetchCitations(doi) {
    const url = "https://opencitations.net/index/api/v1/citations/" + doi;
    let response = await queryCache(url);
    if (!response) {
        try {
            await Requests.requestPromise();
            response = await fetch(url, {
                mode: "cors", // no-cors, *cors, same-origin
            });
        } finally {
            Requests.free();
        }
        ++Requests.maxRate;
        // console.log("maxRate", Requests.maxRate, Requests.queue_length);
    }
    const json = await response.json();
    return json;
}

export async function fetchMetadata(doi) {
    const url = "https://opencitations.net/index/api/v1/metadata/" + doi;
    try {
        await Requests.requestPromise();
        response = await fetch(url, {
            mode: "cors", // no-cors, *cors, same-origin
        });
        ++Requests.maxRate;
        // console.log("maxRate", Requests.maxRate, Requests.queue_length);
        const json = await response.json();
        return json;
    } finally {
        Requests.free();
    }
}

export async function* loadCitations(args) {
    // console.log("loadCitations", args);
    const {
        doi: initial_doi,
        levels = 1
    } = args;
    const dois = new Map([[initial_doi, []]]);
    const new_dois = new Set([initial_doi]);

    let added = true;
    while (added) {
        const promises = new Set;
        for (const new_doi of new_dois) {
            const parents = dois.get(new_doi);
            if (parents.length < levels) {
                const parentDOIs = [...parents, new_doi];

                promises.add({
                    promise: fetchCitations(new_doi),
                    parentDOIs
                });
            }
        }
        added = false;
        new_dois.clear();
        for (const { promise, parentDOIs } of promises) {
            try {
                const citation_results = await promise;
                const citation_dois = citation_results;//.map(({ citing }) => citing.match(doi_filter)[1]);
                for (const citation_doi of citation_dois) {
                    if (!dois.has(citation_doi)) {
                        new_dois.add(citation_doi);
                        dois.set(citation_doi, parentDOIs);
                        added = true;
                    }
                }
                for (const citation_doi of citation_dois) {
                    yield {
                        citationDOI: citation_doi,
                        parentDOIs
                    };
                }
            } catch (error) {
                Requests.maxRate = 1;
                console.log("maxRate", Requests.maxRate);
            }
        }
    }
}