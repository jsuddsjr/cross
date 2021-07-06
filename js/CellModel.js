import ShapeModel from "./ShapeModel.js";
import WordModel from "./WordModel.js";
import Subscribers from "./Subscribers.js";

const NO_SOLUTION_CLASS = "no-solution";
const BLOCKED_EVENT = "blocked";
const CONTENT_EVENT = "content";

export default class CellModel {
  /**
   * Constructor.
   * @param {HTMLElement} [cellElement]
   */
  constructor(cellElement) {
    this.cellElement = cellElement || document.createElement("div");
    this.cellElement.className = "cell";
    this.cellElement.tabIndex = 0;

    /** @type {CellModel?} */
    this.partnerCell = null;
    this.isBlocked = false;
    this.shape = new ShapeModel(this.cellElement);
    this.available = new Set(ShapeModel.anyType);

    /** @type {WordModel?} */
    this.down = this.across = this.activeWord = null;

    /** @type {HTMLElement?} */
    this.numberElement = null;
    this.subscribers = new Subscribers(this);

    this.cellElement.addEventListener("click", (e) => {
      if (e.ctrlKey) {
        this.toggleBlocked();
        this.subscribers.notify(BLOCKED_EVENT);
      } else {
        this.activeWord = this.activeWord ? (this.activeWord === this.across ? this.down : this.across) : this.across;
        if (this.activeWord) this.activeWord.setActiveWord(this);
      }
    });

    this.cellElement.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.altKey) return;

      /** @type {1|-1} */
      let direction = 1;

      if (!this.activeWord) this.activeWord = this.across;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (this.isBlocked || this.shape.getLetter() === " ") {
            this.toggleBlocked();
            this.subscribers.notify(BLOCKED_EVENT);
          } else {
            this.shape.setContent(" ");
            this.subscribers.notify(CONTENT_EVENT);
          }
          break;
        case "Backspace":
          this.shape.setContent();
          this.subscribers.notify(CONTENT_EVENT);
          direction = -1;
          break;
        case "ArrowDown":
          this.activeWord = this.down;
          break;
        case "ArrowUp":
          this.activeWord = this.down;
          direction = -1;
          break;
        case "ArrowLeft":
          this.activeWord = this.across;
          direction = -1;
          break;
        case "ArrowRight":
          this.activeWord = this.across;
          break;
        default: {
          if (e.key.match(/^[01a-z]$/i)) {
            this.shape.setContent(e.key.toLowerCase());
            this.subscribers.notify(CONTENT_EVENT);
          } else return;
        }
      }

      if (this.activeWord) this.activeWord.setActiveWord(this, direction);
    });
  }

  /**
   * Reset this cell to unassigned state.
   */
  clearAllStates() {
    this.cellElement.classList.remove(WordModel.ACTIVE_CELL_CLASS, WordModel.ACTIVE_CLASS);
    this.across = this.down = this.activeWord = null;
  }

  /**
   * Connect the cell back to their word models.
   * @param {WordModel} word
   * @param {String} direction
   * @param {Number} index
   */
  setWord(word, direction, index) {
    this.activeWord = null;
    this[direction] = word;
    this[direction + "_index"] = index;
  }

  /**
   * Return a set of shared letters.
   * @param {Set<string>} across
   * @param {Set<string>} down
   * @returns Shared letters, or empty set.
   */
  intersect(across, down) {
    if (across.has(ShapeModel.anyType)) {
      this.available = down;
    } else if (down.has(ShapeModel.anyType)) {
      this.available = across;
    } else {
      this.available = new Set([...across.values()].filter(down.has));
    }

    if (this.available.size === 0) {
      this.cellElement.classList.add(NO_SOLUTION_CLASS);
    } else {
      this.cellElement.classList.remove(NO_SOLUTION_CLASS);
      if (this.available.size === 1) {
        this.shape.setContent(this.available.values()[0]);
      }
    }

    return this.available;
  }

  /**
   *
   * @param {CellModel|HTMLElement} cell
   */
  setPartnerCell(cell) {
    if (cell instanceof HTMLElement) {
      cell = new CellModel(cell);
    }
    if (cell !== this) this.partnerCell = cell;
  }

  /**
   * Clue number, or -1 to remove.
   * @param {Number} num
   */
  setClueNumber(num) {
    if (num > 0) {
      if (!this.numberElement) {
        this.numberElement = this.cellElement.appendChild(document.createElement("div"));
        this.numberElement.className = "number";
      }
      this.numberElement.textContent = num.toString();
    } else {
      if (this.numberElement) {
        this.numberElement.textContent = null;
      }
    }
  }

  /**
   * @param {Boolean} [value]
   */
  toggleBlocked(value) {
    if (value === undefined || this.isBlocked !== value) {
      this.isBlocked = !this.isBlocked;
      this.cellElement.classList.toggle("blocked");
      this.cellElement.classList.remove("active-cell");
      if (this.partnerCell) this.partnerCell.toggleBlocked(this.isBlocked);
      this.shape.setContent(this.isBlocked ? ShapeModel.blockedType : ShapeModel.anyType);
    }
  }

  /**
   * Subscribe to cell blocking changes.
   * @param {import("./Subscribers.js").NotifyFunc} cb
   * @returns This
   */
  onBlocked(cb) {
    this.subscribers.subscribe(BLOCKED_EVENT, cb);
    return this;
  }

  /**
   * Subscribe to cell content changes.
   * @param {import("./Subscribers.js").NotifyFunc} cb
   * @returns This
   */
  onContentUpdated(cb) {
    this.subscribers.subscribe(CONTENT_EVENT, cb);
    return this;
  }
}
