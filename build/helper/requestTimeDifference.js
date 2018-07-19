import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";
const requestTime = requestAnimationFunction(time => time);
export default (async() => {
  const time = performance.now();
  return (await requestTime()) - time
});