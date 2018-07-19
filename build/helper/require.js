export default (async requirements => {
  for (const requirement of requirements) {
    if (!window[requirement]) {
      await new Promise(resolve => {
        Object.defineProperty(window, requirement, {
          set(value) {
            delete window[requirement];
            window[requirement] = value;resolve()
          }
        })
      })
    }
  }
  await new Promise(resolve => setTimeout(resolve))
});