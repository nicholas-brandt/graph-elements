export default class EarlyElement extends HTMLElement {
    adoptProperties() {
        for (const key in this) {
            const descriptor = Object.getOwnPropertyDescriptor(this, key);
            if (descriptor && descriptor.configurable) {
                // copy value
                const value = this[key];
                // delete own property to use prototype property
                delete this[key];
                // assign to prototype property
                this[key] = value;
            }
        }
    }
}