import Graph from "//cdn.jsdelivr.net/gh/mhelvens/graph.js/dist/graph.es6.js";

const doi_filter = /=>\s(.+)/;

export default
class Project extends Graph {
    citations = new Set;
    _leaf_citations = new Set;
    references = new Set;
    _leaf_references = new Set;
    metaData = new Map;
    metaCount = 0;
    meta = new EventTarget;
    constructor(dois) {
        super();
        this.initialDois = dois === undefined ? [] : Array.isArray(dois) ? dois : [dois];
        for (const doi of this.initialDois) {
            this.__addRootDOI(doi);
        }
    }
    __addRootDOI(doi) {
        this.addVertex(doi, {
            x: Math.random(),
            y: Math.random()
        });
        this._leaf_citations.add(doi);
        this._leaf_references.add(doi);
    }
    async loadCitations(levels = 1, _current_level = 0) {
        const promises = new Set;
        for (const leaf_citation of this._leaf_citations) {
            if (!this.metaData.has(leaf_citation)) {
                this.metaData.set(leaf_citation, "in_progress");
                const meta_data_promise = (async () => {
                    const meta_data_result = await this.constructor.fetchMetadata(leaf_citation);
                    const meta_data = meta_data_result[0];
                    if (!meta_data) {
                        // throw new Error("empty metadata received");
                        console.warn("empty metadata received");
                    }
                    this.metaData.set(leaf_citation, meta_data);
                    ++this.metaCount;
                    this.meta.dispatchEvent(new CustomEvent("meta-change"));
                    
                    const vertex = this.vertexValue(leaf_citation);
                    // vertex.title = meta_data.title;
                    vertex.text = meta_data ? meta_data.title : "[no metadata]";
                    vertex.element.classList.add("metadata");
                    const r = vertex.circleElement.r.baseVal.value;
                    vertex.circleElement.animate([{
                        r
                    }, {
                        r: r * 4
                    }, {
                        r
                    }], {
                       duration: 5e2 
                    });
                })();
                promises.add(meta_data_promise);
            }
            if (!this.citations.has(leaf_citation)) {
                this.citations.add(leaf_citation);
                if (_current_level < levels) {
                    const citations_promise = (async () => {
                        const citation_results = await this.constructor.fetchCitations(leaf_citation);
                        const citation_dois = citation_results.map(({citing}) => citing.match(doi_filter)[1]);
                        for (const citation_doi of citation_dois) {
                            this._leaf_citations.add(citation_doi);

                            const {x,y} = this.vertexValue(leaf_citation);
                            const angle = Math.random() * Math.PI * 2;
                            this.ensureVertex(citation_doi, {
                                x: x + Math.cos(angle) * 100,
                                y: y + Math.sin(angle) * 100
                            });
                            this.spanEdge(citation_doi, leaf_citation);
                            
                            
                        }
                        // console.log("citations resolved from ", leaf_citation);
                        await this.loadCitations(levels, _current_level + 1);
                    })();
                    promises.add(citations_promise);
                }
            }
        }
        await Promise.all(promises);
    }
    async loadReferences(levels = 1, _current_level = 0) {
        const promises = new Set;
        for (const leaf_reference of this._leaf_references) {
            if (!this.metaData.has(leaf_reference)) {
                this.metaData.set(leaf_reference, "in_progress");
                const meta_data_promise = (async () => {
                    const meta_data_result = await this.constructor.fetchMetadata(leaf_reference);
                    this.metaData.set(leaf_reference, meta_data_result);
                    
                })();
                promises.add(meta_data_promise);
            }
            if (!this.references.has(leaf_reference)) {
                this.references.add(leaf_reference);
                if (_current_level < levels) {
                    const references_promise = (async () => {
                        const reference_results = await this.constructor.fetchReferences(leaf_reference);
                        const reference_dois = reference_results.map(({cited}) => cited.match(doi_filter)[1]);
                        for (const reference_doi of reference_dois) {
                            this._leaf_references.add(reference_doi);

                            const vv = this.vertexValue(leaf_reference);
                            console.log("vv", vv);
                            const {x,y} = this.vertexValue(leaf_reference);
                            this.ensureVertex(reference_doi, {
                                x: x + (Math.random() - .5) * 100,
                                y: y + (Math.random() - .5) * 100
                            });
                            this.spanEdge(leaf_reference, reference_doi);
                        }
                        await this.loadReferences(levels, _current_level + 1);
                    })();
                    promises.add(references_promise);
                }
            }
        }
        await Promise.all(promises);
    }
    // opencitations
    static async fetchCitations(doi) {
        const url = "//opencitations.net/index/api/v1/citations/" + doi;
        if (!localStorage.getItem(url)) {
            const wait_promise = Requests.wait(true);
            await wait_promise;
        }
        // console.log("start request");
        const response = await (await fetch(url, {
            mode: 'cors', // no-cors, *cors, same-origin
        })).json();
        localStorage.setItem(url, "cached");
        // console.log("resolve request");
        Requests.resolve();
        return response;
    }
    static async fetchReferences(doi) {
        const url = "//opencitations.net/index/api/v1/references/" + doi;
        if (!localStorage.getItem(url)) {
            await Requests.wait(true);
        }
        const response = await (await fetch(url, {
            mode: 'cors', // no-cors, *cors, same-origin
        })).json();
        localStorage.setItem(url, "cached");
        Requests.resolve();
        return response;
    }
    static async fetchMetadata(doi) {
        const url = "//opencitations.net/index/api/v1/metadata/" + doi;
        if (!localStorage.getItem(url)) {
            const wait_promise = Requests.wait(false);
            await wait_promise;
        }
        // console.log("start meta request");
        const response = await (await fetch(url, {
            mode: 'cors', // no-cors, *cors, same-origin
        })).json();
        localStorage.setItem(url, "cached");
        // console.log("resolve request");
        Requests.resolve();
        return response;
    }
};

class Requests {
    static requests = [];
    static maxRate = Infinity;
    static counter = 0;
    static waiting = false;
    static wait(priority = false) {
        // console.log("wait");
        const promise = new Promise(resolve => {
            if (priority) {
                this.requests.unshift(resolve);
            } else {
                this.requests.push(resolve);
            }
        });
        return Promise.all([promise, this.resolve()]);
    }
    static async resolve() {
        if (!this.waiting && this.requests.length) {
            this.waiting = true;
            const _resolve = this.requests.shift();
            const timeout_promise = new Promise(resolve => {
                setTimeout(resolve, 1e3 / this.maxRate);
            });
            await Promise.all([_resolve(), timeout_promise]);
            this.waiting = false;
            await this.resolve();
        }
    }
}
