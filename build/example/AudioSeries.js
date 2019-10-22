export default class AudioSeries extends Array {
  constructor(max_length, ...args) {
    super(...args);
    this.maxLength = max_length;
    this.__sum = 0;
    this.__squareSum = 0;
  }

  add(value) {
    this.push(value);
    this.__sum += value;
    this.__squareSum += value ** 2;

    if (this.length > this.maxLength) {
      const value_removed = this.shift();
      this.__sum -= value_removed;
      this.__squareSum -= value_removed ** 2;
    }
  }

  get deviation() {
    return Math.sqrt((this.__squareSum - this.__sum ** 2 / this.length) / (this.length - 1));
  }

  get average() {
    return this.__sum / this.length;
  }

}