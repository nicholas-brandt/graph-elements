/** TODO:
 *	- pooling (+ load balancing by tracking # of open calls)
 *  - queueing (worth it? sortof free via postMessage already)
 *
 *	@example
 *	let worker = workerize(`
 *		export function add(a, b) {
 *			// block for a quarter of a second to demonstrate asynchronicity
 *			let start = Date.now();
 *			while (Date.now()-start < 250);
 *			return a + b;
 *		}
 *	`);
 *	(async () => {
 *		console.log('3 + 9 = ', await worker.add(3, 9));
 *		console.log('1 + 2 = ', await worker.add(1, 2));
 *	})();
 */
export default function workerize(code, options) {
  let exports = {};
  let exportsObjName = `__xpo${Math.random().toString().substring(2)}__`;
  if (typeof code === 'function') code = `(${Function.prototype.toString.call(code)})(${exportsObjName})`;
  code = toCjs(code, exportsObjName, exports) + `\n(${Function.prototype.toString.call(setup)})(self,${exportsObjName},{})`;
  let url = URL.createObjectURL(new Blob([code], {
    type: 'application/javascript'
  })),
      worker = new Worker(url, options),
      term = worker.terminate,
      callbacks = {},
      counter = 0,
      i;

  worker.kill = signal => {
    worker.postMessage({
      type: 'KILL',
      signal
    });
    setTimeout(worker.terminate);
  };

  worker.terminate = () => {
    URL.revokeObjectURL(url);
    term.call(worker);
  };

  worker.call = (method, params) => new Promise((resolve, reject) => {
    let id = `rpc${++counter}`;
    callbacks[id] = [resolve, reject];
    worker.postMessage({
      type: 'RPC',
      id,
      method,
      params
    });
  });

  worker.rpcMethods = {};
  setup(worker, worker.rpcMethods, callbacks);

  worker.expose = methodName => {
    worker[methodName] = function () {
      return worker.call(methodName, [].slice.call(arguments));
    };
  };

  for (i in exports) if (!(i in worker)) worker.expose(i);

  return worker;
}

function setup(ctx, rpcMethods, callbacks) {
  globalThis.generators = globalThis.generators || [];
  globalThis.generator_callbacks = globalThis.generator_callbacks || [];
  const generator_regex = /^\[object (Async)?Generator\]$/;
  ctx.addEventListener('message', ({
    data
  }) => {
    const {
      id,
      generator_id,
      result,
      params = [],
      method
    } = data;
    if (data.type !== 'RPC' || id == null) return;

    if (generator_id >= 0) {
      if ("result" in data) {
        // return promised generator result
        generator_callbacks[generator_id](result);
      } else if ("generator_call" in data) {
        // invoke worker generator
        const generator = generators[generator_id];

        (async () => {
          let result;

          if (generator.constructor.prototype.toString() == "[object AsyncGenerator]") {
            result = await generator.next();
          } else {
            result = generator.next();
          }

          const {
            value,
            done
          } = result;
          ctx.postMessage({
            type: 'RPC',
            id,
            generator_id,
            result: {
              value,
              done
            }
          });
        })();
      } else {
        // setup receiver generator
        const generator = generators[generator_id] = generators[generator_id] || async function* () {
          let params = [];

          while (true) {
            ctx.postMessage({
              type: 'RPC',
              id,
              generator_id,
              generator_call: true,
              params
            });
            const {
              value,
              done
            } = await new Promise(resolve => {
              generator_callbacks[generator_id] = resolve;
            });

            if (done) {
              return value;
            }

            params = yield value;
          }
        }();

        callbacks[id][0](generator);
      }

      return;
    }

    if (method) {
      const method = rpcMethods[data.method];

      if (method == null) {
        ctx.postMessage({
          type: 'RPC',
          id,
          error: 'NO_SUCH_METHOD'
        });
      } else {
        (async () => {
          try {
            const result = await method.apply(null, params);
            let is_generator;

            try {
              is_generator = generator_regex.test(result.constructor.prototype.toString());
            } catch (error) {}

            if (is_generator) {
              const generator_id = generators.push(result) - 1;
              ctx.postMessage({
                type: 'RPC',
                id,
                generator_id
              });
            } else {
              ctx.postMessage({
                type: 'RPC',
                id,
                result
              });
            }
          } catch (error) {
            ctx.postMessage({
              type: 'RPC',
              id,
              error: '' + error
            });
          }
        })();
      }
    } else {
      let callback = callbacks[id];
      if (callback == null) throw Error(`Unknown callback ${id}`);
      delete callbacks[id];
      if (data.error) callback[1](Error(data.error));else callback[0](data.result);
    }
  });
}

function toCjs(code, exportsObjName, exports) {
  code = code.replace(/^(\s*)export\s+default\s+/m, (s, before) => {
    exports.default = true;
    return `${before}${exportsObjName}.default=`;
  });
  code = code.replace(/^(\s*)export\s+((?:async\s*)?function(?:\s*\*)?|const|let|var)(\s+)([a-zA-Z$_][a-zA-Z0-9$_]*)/mg, (s, before, type, ws, name) => {
    exports[name] = true;
    return `${before}${exportsObjName}.${name}=${type}${ws}${name}`;
  });
  return `var ${exportsObjName}={};\n${code}\n${exportsObjName};`;
}