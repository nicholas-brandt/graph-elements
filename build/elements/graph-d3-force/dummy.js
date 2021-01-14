importScripts(worker_url);
export function start(...args) {
  return _start(...args);
}
export function stop(...args) {
  return _stop(...args);
}
export function setGraph(...args) {
  return _setGraph(...args);
}
export function setConfiguration(...args) {
  return _setConfiguration(...args);
}
export function getTickPromise(...args) {
  return _getTickPromise(...args);
}
export function getEndPromise(...args) {
  return _getEndPromise(...args);
}