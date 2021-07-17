/** @type {Map<string, Promise<string[]>>} */
const shapeCache = new Map();

/** @type {Map<string, Promise<Map<string, number>[]>>} */
const potentialCache = new Map();

export default class WordIndex {
  constructor() {
    this.baseUrl = "https://cross-api-webapp.azurewebsites.net/api"; //  "http://localhost:3000/api"; //
    this.apiKey = "ySY24UEoGh820gYU4gVi";
  }

  /**
   * Get map of available values for each position in the shape.
   * @param {String} shape
   * @returns
   */
  async getPotentialsByShape(shape) {
    const cachedPromise = potentialCache.get(shape);
    if (cachedPromise) return cachedPromise;

    const url = `${this.baseUrl}/p/${shape}?key=${this.apiKey}`;

    /** @type {Promise<Map<string, number>[]>} */
    const promise = fetchData(url).then((data) => {
      console.log(data);
      return data.map((a) => new Map(a));
    });
    potentialCache.set(shape, promise);
    return promise;
  }

  /**
   * Get words that match the specified shape.
   * Shape can contain 0/1 for vowel/cons, dot (.) for any or letter.
   * @param {String} shape
   * @returns
   */
  async getWordsByShape(shape) {
    const cachedPromise = shapeCache.get(shape);
    if (cachedPromise) return cachedPromise;

    const url = `${this.baseUrl}/s/${shape}?key=${this.apiKey}`;

    /** @type {Promise<string[]>} */
    const promise = fetchData(url);
    shapeCache.set(shape, promise);
    return promise;
  }
}

async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}
