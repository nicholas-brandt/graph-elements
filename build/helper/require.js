export default (async(a) => {
  for (const b of a) window[b] || (await new Promise((a) => {
      Object.defineProperty(window, b, {
        set(c) {
          delete window[b]
          , window[b] = c, a()
        }
      })
    }));
  await new Promise((a) => setTimeout(a))
});