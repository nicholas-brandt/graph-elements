export default
async requirements => {
    for (const requirement of requirements) {
        if (!window[requirement]) {
            await new Promise(resolve => {
                Object.defineProperty(window, requirement, {
                    set(value) {
                        delete window[requirement];
                        window[requirement] = value;
                        resolve();
                    }
                });
            });
        }
    }
    // ensure requirement scripts have finished
    await new Promise(resolve => setTimeout(resolve));
};