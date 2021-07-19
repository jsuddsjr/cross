import CellModel from "./CellModel.js";
import WordModel from "./WordModel.js";
import WordIndex from "./WordIndex.js";
import Subscribers from "./Subscribers.js";
import GameStore from "./GameStore.js";

const LAYOUT_EVENT = "layout";
const SAVED_EVENT = "saved";

export default class BoardView {
  /**
   * Constructor.
   * @param {HTMLElement} boardElement
   * @param {Number} size
   * @param {String} title
   */
  constructor(boardElement, size = 15, title = "") {
    this.boardElement = boardElement;
    this.title = title;
    this.size = size;

    /** @type {CellModel[]} */
    this.cells = new Array(size * size);
    /** @type {WordModel[]} */
    this.wordList = [];

    this.setSize(size);

    this.boardElement.addEventListener("keypress", () => {
      this.updatePotentials();
    });

    this.index = new WordIndex();
    this.subscribers = new Subscribers(this);
    this.store = new GameStore();

    this.addCrosswords = addCrossWords.bind(this);
  }

  /**
   * @returns The active list of words.
   */
  getWordList() {
    return this.wordList;
  }

  /**
   * Sets the width and height of the board.
   * Also resets the board contents.
   * @param {Number} size
   */
  setSize(size) {
    this.size = size;
    this.boardElement.style.setProperty("--board-size", size.toString());
  }

  /**
   * Save the current board with a title.
   * @param {String} name
   */
  save(name) {
    this.title = name;
    this.store.saveBoard(this.cells, name);
    this.subscribers.notify(SAVED_EVENT);
  }

  saveAsTemplate() {
    if (this.store.saveTemplate(this.cells)) {
      this.title = `${this.size}x${this.size} template`;
      this.subscribers.notify(SAVED_EVENT);
      return true;
    } else {
      alert("Matching template already saved.");
      return false;
    }
  }

  load(name) {
    const data = this.store.loadBoard(name) || this.store.lastSaved;
    if (data) {
      this.setSize(Math.trunc(Math.sqrt(data.cells.length)));
      this.cells = this.store.cellsFromBoard(data);
      this.title = data.name;
      this.show();
    } else {
      this.clear();
    }
  }

  loadTemplate(template) {
    this.cells = this.store.cellsFromBoard({ cells: template });
    this.show();
  }

  clear() {
    this.cells = Array.from({ length: this.size * this.size }, () => new CellModel());
    this.show();
  }

  clearGrid() {
    this.cells.forEach((c) => {
      c.shape.reset();
      c.clearAllStates();
    });
    this.subscribers.notify(LAYOUT_EVENT);
  }

  clearErrors() {
    this.cells
      .filter((c) => c.cellElement.classList.contains(WordModel.WORD_WARNING_CLASS))
      .forEach((c) => {
        c.shape.reset();
        c.clearAllStates();
      });
    this.updatePotentials();
    this.subscribers.notify(LAYOUT_EVENT);
  }

  /**
   * Draw a new board.
   */
  show() {
    this.boardElement.innerHTML = "";
    const boardCount = this.cells.length;
    this.cells.forEach((cell, index) => {
      this.boardElement.appendChild(cell.cellElement);
      cell.setPartnerCell(this.cells[boardCount - index - 1]);
      cell.onBlocked(() => {
        this.renumber();
        this.store.writeTempData(this.cells);
      });
      cell.onContentUpdated(() => {
        this.updatePotentials();
        this.store.writeTempData(this.cells);
      });
    });

    this.renumber();
  }

  /**
   * Recalculate the words on the board.
   */
  renumber() {
    this.wordList = [];
    this.cells.forEach((c) => c.clearAllStates());
    let currentNumber = 1;

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      if (cell.isBlocked) continue;

      const cellAboveIndex = i - this.size;
      const cellAbove = cellAboveIndex < 0 || this.cells[cellAboveIndex].isBlocked;
      const cellToLeft = i % this.size === 0 || this.cells[i - 1].isBlocked;
      if (cellAbove || cellToLeft) {
        cell.setClueNumber(currentNumber++);
        this.addCrosswords(cell, i, cellToLeft, cellAbove);
      } else {
        cell.setClueNumber(-1);
      }
    }

    this.updatePotentials();
    this.subscribers.notify(LAYOUT_EVENT);
  }

  /**
   * Find issues with dictionary matches.
   */
  async updatePotentials() {
    this.wordList.forEach((w) => w.clearAllStates());

    /** @type {Boolean[]} */
    let bools;

    let maxIterations = 3;

    do {
      /** @type {Promise<boolean>[]} */
      const promises = [];

      for (let w of this.wordList) {
        if (w.length < 3) {
          w.addStates(WordModel.ERROR_CLASS);
          continue;
        }

        if (w.length > 10) {
          w.addStates(WordModel.WARNING_CLASS);
        }

        if (w.isEmpty()) {
          continue;
        }

        const action = this.index.getPotentialsByShape(w.getShape()).then(processPotentials.bind(w));
        promises.push(action);
      }

      bools = await Promise.all(promises);
    } while (--maxIterations && bools.length && bools.some((b) => b));

    this.subscribers.notify(LAYOUT_EVENT);
  }

  /**
   * Subscribe to layout events.
   * @param {import("./Subscribers.js").NotifyFunc} callback
   * @returns this
   */
  onLayout(callback) {
    this.subscribers.subscribe(LAYOUT_EVENT, callback);
    return this;
  }

  /**
   * Subscribe to save events.
   * @param {import("./Subscribers.js").NotifyFunc} callback
   * @returns this
   */
  onSaved(callback) {
    this.subscribers.subscribe(SAVED_EVENT, callback);
    return this;
  }
}

/**********************
 * PRIVATE FUNCTIONS
 **********************/

/**
 * What letters are possible?
 * @this {WordModel}
 * @param {Map<string, number>[]} potentials
 */
async function processPotentials(potentials) {
  let contentUpdated = false;
  const cells = this.cells;
  const dir = this.direction;

  cells.map((c) => c.cellElement.removeAttribute(`data-${dir}`));
  if (potentials.length === 0 || potentials[0].size === 0) {
    this.addStates(WordModel.WORD_WARNING_CLASS, this.direction);
  } else {
    potentials.forEach((map, index) => {
      const cell = cells[index];
      if (map.size === 1) {
        const c = [...map.keys()][0];
        if (cell.shape.getShape() !== c) {
          cell.shape.setContent(c);
          contentUpdated = true;
        }
      } else {
        // Filter by most probable options.
        let best = [...map.entries()].filter((a) => a[1] > 0.15);
        if (!best.length) {
          // Or, take top best ones.
          best = [...map.entries()].sort((a, b) => a[1] - b[1]).filter((a, i) => i < 5);
        }

        if (best.length)
          cell.cellElement.dataset[dir] = best
            .map((a) => a[0])
            .sort()
            .join("");
      }
    });
  }

  // Did we place any new letters?
  return contentUpdated;
}

/**
 * Create words starting at this location.
 * @this {BoardView}
 * @param {CellModel} anchorCell
 * @param {Number} index
 * @param {Boolean} across
 * @param {Boolean} down
 */
function addCrossWords(anchorCell, index, across, down) {
  /**
   * Add word to our list.
   * @param {BoardView} board
   * @param {CellModel[]} cells
   * @param {String} dir
   */
  function bindWord(board, cells, dir) {
    const word = new WordModel(cells, dir);
    word.onUpdated(() => board.updatePotentials());
    board.wordList.push(word);
  }

  if (across) {
    const cellsAcross = [anchorCell];
    const remainingRow = this.size - (index % this.size);
    for (let i = 1; i < remainingRow; i++) {
      const cell = this.cells[index + i];
      if (cell.isBlocked) break;
      cellsAcross.push(cell);
    }
    bindWord(this, cellsAcross, "across");
  }

  if (down) {
    const cellsDown = [anchorCell];
    for (let i = this.size; i < this.cells.length - index; i += this.size) {
      const cell = this.cells[index + i];
      if (cell.isBlocked) break;
      cellsDown.push(cell);
    }
    bindWord(this, cellsDown, "down");
  }
}
