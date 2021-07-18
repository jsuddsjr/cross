import Subscribers from "./Subscribers.js";

const UPDATED_EVENT = "updated";

const ACTIVE_CLASS = "active";
const ACTIVE_CELL_CLASS = "active-cell";
const ERROR_CLASS = "error";
const WARNING_CLASS = "warning";
const WORD_WARNING_CLASS = "word-warning";
const ALL_STATES = [ACTIVE_CELL_CLASS, ERROR_CLASS, WARNING_CLASS, WORD_WARNING_CLASS, "down", "across"];

const scrabblePoints = new Map([
  ["_", 0],
  [" ", 0],
  ["a", 1],
  ["b", 3],
  ["c", 3],
  ["d", 2],
  ["e", 1],
  ["f", 4],
  ["g", 2],
  ["h", 4],
  ["i", 1],
  ["j", 8],
  ["k", 5],
  ["l", 1],
  ["m", 3],
  ["n", 1],
  ["o", 1],
  ["p", 3],
  ["q", 10],
  ["r", 1],
  ["s", 1],
  ["t", 1],
  ["u", 1],
  ["v", 4],
  ["w", 4],
  ["x", 8],
  ["y", 4],
  ["z", 10],
]);

/** @type {WordModel?} */
let activeWord = null;

export default class WordModel {
  /**
   * @param {import("./CellModel.js").default[]} cells
   * @param {String} direction
   */
  constructor(cells, direction = "across") {
    this.cells = cells;
    this.length = cells.length;
    this.direction = direction;

    this.subscribers = new Subscribers(this);

    this.cells.forEach((c, i) => {
      c.setWord(this, direction, i);
      c.onContentUpdated(() => this.subscribers.notify(UPDATED_EVENT));
    });

    // this.setWord(this.randomWord());
    // if (this.checkShape()) this.setState(WORD_WARNING_CLASS);
  }

  static get activeWord() {
    return activeWord;
  }

  static get ERROR_CLASS() {
    return ERROR_CLASS;
  }
  static get WARNING_CLASS() {
    return WARNING_CLASS;
  }
  static get WORD_WARNING_CLASS() {
    return WORD_WARNING_CLASS;
  }
  static get ACTIVE_CLASS() {
    return ACTIVE_CLASS;
  }
  static get ACTIVE_CELL_CLASS() {
    return ACTIVE_CELL_CLASS;
  }

  /**
   * @returns A simplified object suitable for storage.
   */
  asObject() {
    return {
      clue: "",
      number: this.getClueNumber(),
      direction: this.direction,
      answer: this.getWord(),
      shape: this.getShape(),
      length: this.cells.length,
      points: this.getScrabbleValue(),
    };
  }

  /**
   * Initialize word from object.
   * @param {*} obj Object from storage.
   */
  fromObject(obj) {
    if (obj.length === this.cells.length && obj.number === this.getClueNumber()) {
      this.setContent(obj.answer);
      this.direction = obj.direction;
    } else {
      throw new Error("Unexpected answer number or size.");
    }
  }

  /**
   * @returns True if every cell is empty.
   */
  isEmpty() {
    return this.cells.every((c) => c.isEmpty());
  }

  /**
   * Highlight active word and cell. If word is already active, then
   * advance the cell with focus in the specified direction.
   * @param {CellModel} activeCell
   * @param {1|0|-1} direction
   */
  setActiveWord(activeCell, direction = 0) {
    if (activeWord !== this) {
      if (activeWord) activeWord.removeStates(ACTIVE_CLASS, ACTIVE_CELL_CLASS);
      this.addStates(ACTIVE_CLASS);
      activeCell.cellElement.classList.add(ACTIVE_CELL_CLASS);
      activeWord = this;
    } else {
      let cursorIndex = this.cells.indexOf(activeCell) + direction;
      if (cursorIndex < 0) cursorIndex = this.cells.length - 1;
      else if (cursorIndex >= this.cells.length) cursorIndex = 0;
      this.removeStates(ACTIVE_CELL_CLASS);
      activeCell = this.cells[cursorIndex];
      activeCell.cellElement.classList.add(ACTIVE_CELL_CLASS);
      activeCell.cellElement.focus();
      activeCell.activeWord = this;
    }
  }

  /**
   * @returns The number for this clue.
   */
  getClueNumber() {
    const number = this.cells[0].numberElement;
    if (!number) throw new Error("Word is missing number element!");
    return parseInt(number.textContent || "0");
  }

  /**
   * @returns Word from cells.
   */
  getWord() {
    return this.cells.map((c) => c.shape.getLetter()).join("");
  }

  /**
   * @returns Shape from cells.
   */
  getShape() {
    return this.cells.map((c) => c.shape.getShape()).join("");
  }

  clearWord() {
    this.cells.forEach((c) => {
      c.shape.reset();
      c.clearAllStates();
    });
    this.subscribers.notify(UPDATED_EVENT);
  }
  /**
   * Reset the state in all cells.
   */
  clearAllStates() {
    this.removeStates(...ALL_STATES);
  }

  /**
   * Add state to all cells.
   * @param {String[]} states
   */
  addStates(...states) {
    this.cells.forEach((c) => c.cellElement.classList.add(...states));
  }

  /**
   * Remove state from all cells.
   * @param {String[]} states
   */
  removeStates(...states) {
    this.cells.forEach((c) => c.cellElement.classList.remove(...states));
  }

  /**
   * Set the content of the word.
   * @param {String} newWord
   */
  setContent(newWord) {
    if (newWord.length !== this.length) {
      throw new Error("Word length does not match number of cells.");
    }
    this.cells.forEach((c, i) => c.shape.setContent(newWord[i]));
  }

  /**
   * Calculates Scrabble score for this word.
   * @returns Point value
   */
  getScrabbleValue() {
    return this.cells.map((c) => scrabblePoints.get(c.shape.getLetter())).reduce((p, c) => c + p);
  }

  /**
   * Notify when cell changes occur.
   * @param {import("./Subscribers.js").NotifyFunc} cb
   * @returns This
   */
  onUpdated(cb) {
    this.subscribers.subscribe(UPDATED_EVENT, cb);
    return this;
  }

  TEST_checkShape() {
    const shapes = [0, 0];
    for (let c of this.getWord()) {
      const index = Number(c);
      const other = index ? 0 : 1;
      shapes[index]++;
      shapes[other] = 0;
      if (shapes[index] > 4) {
        return true;
      }
    }
    return false;
  }

  TEST_randomWord() {
    const word = [];
    for (let i = 0; i < this.length; i++) {
      word[i] = this.cells[i].cellElement.dataset.letter || (Math.random() > 0.55 ? "0" : "1");
      // String.fromCharCode(65 + Math.trunc(Math.random() * 26));
    }
    return word.join("");
  }
}
