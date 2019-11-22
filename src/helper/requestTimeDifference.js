import requestAnimationFunction from "//cdn.jsdelivr.net/npm/requestanimationfunction/requestAnimationFunction.js";
const requestTime = requestAnimationFunction(() => performance.now());
export default async () => {
    const time = performance.now();
    const difference = await requestTime() - time;
    return difference;
};