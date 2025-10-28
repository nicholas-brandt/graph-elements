export function getAllKeysInPrototypeChain(obj) {
    const keys = new Set;
    // Traverse prototype chain
    while (obj !== null && obj !== Object.prototype) {
        // Add own string keys (enumerable + non-enumerable)
        for (const key of Object.getOwnPropertyNames(obj)) {
            keys.add(key);
        }
        // Add own symbol keys
        for (const sym of Object.getOwnPropertySymbols(obj)) {
            keys.add(sym);
        }
        // Move up the chain
        obj = Object.getPrototypeOf(obj);
    }
    // Optionally include Object.prototype keys
    if (obj === Object.prototype) {
        for (const key of Object.getOwnPropertyNames(obj)) {
            keys.add(key);
        }
        for (const sym of Object.getOwnPropertySymbols(obj)) {
            keys.add(sym);
        }
    }
    return [...keys];
};