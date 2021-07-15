import ShapeModel from "./ShapeModel.js";
import Subscribers from "./Subscribers.js";

/** @type {Map<string, string[]>} */
const index = new Map();

/** @type {Map<number, string[]>} */
const indexSize = new Map();

/** @type {Map<string, string[]>} */
const shapeCache = new Map();

/** @type {Map<string, Array<Set<string>>} */
const potentialCache = new Map();

let loading = false;
let loaded = false;

const subscribers = new Subscribers(index);
const LOADED_EVENT = "loaded";
const FAILED_EVENT = "failed";

export default class WordIndex {
  constructor() {
    if (!loading && !loaded) {
      loadIndex().then((loadedOk) => {
        loaded = loadedOk;
        subscribers.notify(loadedOk ? LOADED_EVENT : FAILED_EVENT);
      });
    }
  }

  /**
   * @returns True, if loaded.
   */
  isLoaded() {
    return loaded;
  }

  /**
   * JEST: reset global values.
   */
  static reset() {
    index.clear();
    indexSize.clear();
    loaded = loading = false;
  }

  /**
   * Get map of available values for each position in the shape.
   * @param {String} shape
   * @returns
   */
  getPotentialsByShape(shape) {
    // Do not process completely empty shapes.
    if (/^\.+$/.test(shape)) return [];

    if (potentialCache.has(shape)) return potentialCache.get(shape);
    const maps = Array.from({ length: shape.length }, () => new Set());
    this.getWordsByShape(shape).forEach((w) => [...w].map((c, i) => maps[i].add(c)));
    return maps;
  }

  /**
   * Get words that match the specified shape.
   * Shape can contain 0/1 for vowel/cons, dot (.) for any or letter.
   * @param {String} shape
   * @returns
   */
  getWordsByShape(shape) {
    // Change spaces into ANY type.
    // shape = shape.replace(/\s/g, ShapeModel.anyType);

    let results = shapeCache.get(shape);
    if (results) return results;

    // Count the unique types in this shape.
    const types = new Set(shape);

    // Convert letters into shapes and search.
    if (types.size > 3 || ShapeModel.letterMatch.test(shape)) {
      // Convert shape into word match by removing shape characters.
      const wordMatch = new RegExp("^" + shape.replace(ShapeModel.shapeMatch, ShapeModel.anyType));
      // Convert to simple shape by converting letters into VOWEL and CONSONANT.
      const simpleShape = shape.replace(new RegExp(ShapeModel.letterMatch, "g"), (sub) => {
        return /[aeiou]/.test(sub) ? ShapeModel.vowelType : ShapeModel.consonantType;
      });
      results = matchShapeSimple(simpleShape).filter((w) => wordMatch.test(w));
    } else if (types.has(ShapeModel.anyType)) {
      // Multiple matches on shape.
      results = matchShapeSimple(shape);
    } else {
      // No ambiguity. Just VOWEL and CONSONANT.
      results = index.get(shape) || [];
    }

    // Save results for next time.
    shapeCache.set(shape, results);

    return results;
  }

  /**
   * Get notification when index is loaded.
   * @param {import("./Subscribers.js").NotifyFunc} cb
   * @returns this
   */
  onLoaded(cb) {
    if (loaded) {
      cb(index);
    } else {
      subscribers.subscribe(LOADED_EVENT, cb);
    }
    return this;
  }

  /**
   * Get notification if index fails to load.
   * @param {import("./Subscribers.js").NotifyFunc} cb
   * @returns this
   */
  onFailed(cb) {
    subscribers.subscribe(FAILED_EVENT, cb);
    return this;
  }
}

/**
 * Fetch data from server. Can only be called once.
 */
async function loadIndex() {
  if (loading) {
    throw new Error("LoadIndex called while loading in progress.");
  }

  loading = true;

  const response = await fetch("data/wordshape.txt");

  if (!response.ok) {
    console.log(response);
    return false;
  }

  const text = await response.text();

  for (const line of text.split(/\r?\n/g)) {
    const [key, ...words] = line.split(",");
    index.set(key, words);

    // Index by size of key.
    const keyLen = key.length;
    const sizeArr = indexSize.get(keyLen) || [];
    if (sizeArr.length === 0) {
      indexSize.set(keyLen, sizeArr);
    }
    sizeArr.push(key);
  }

  // Enable reload, if needed.
  loading = false;
  return true;
}

/**
 * Combine list of words that match shape.
 * @param {String} shape
 * @returns
 */
function matchShapeSimple(shape) {
  /** @type {String[]} */
  const results = [];
  const shapesByLen = indexSize.get(shape.length);
  if (shapesByLen) {
    const shapeMatch = new RegExp("^" + shape);
    shapesByLen.forEach((key) => {
      if (shapeMatch.test(key)) {
        results.push.apply(results, index.get(key));
      }
    });
  }
  return results;
}
