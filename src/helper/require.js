const require_set = new Set;
export default
async requirements => {
    for (const requirement of requirements) {
        if (!window[requirement]) {
            if (require_set.has(requirement)) {
                await require_set.get(requirement);
            } else {
                const requirement_promise = new Promise(resolve => {
                    Object.defineProperty(window, requirement, {
                        set(value) {
                            delete window[requirement];
                            window[requirement] = value;
                            resolve();
                        }
                    });
                });
                require_set.add(requirement_promise);
                await requirement_promise;
            }
        }
    }
    // ensure requirement scripts have finished
    await new Promise(resolve => setTimeout(resolve));
};