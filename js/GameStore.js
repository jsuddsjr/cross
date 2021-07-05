import CellModel from "./CellModel.js";
import ShapeModel from "./ShapeModel.js";

const PREFIX = "xw_";
const LAST_SAVED = "xw-in-progress";

/**
 * @typedef {Object} GameData
 * @property {String} id    Storage key.
 * @property {String} name  Friendly name of the saved game.
 * @property {String} cells String of cells.
 */

export default class GameStore {
  constructor() {
    this.isUnsaved = false;
    this.keys = Object.keys(localStorage).filter((key) => key.startsWith(PREFIX));
    this._lastSaved = readFromStorage(LAST_SAVED) || {
      id: LAST_SAVED,
      name: "",
      cells: "",
    };
  }

  get boards() {
    return this.keys.map((k) => readFromStorage(k));
  }

  get lastSaved() {
    if (this._lastSaved.cells) {
      return this._lastSaved;
    }
  }

  /**
   * Write updates to the board.
   * TODO: Save entire board, not just cells.
   * @param {CellModel[]} cells
   * @param {String} name
   */
  saveBoard(cells, name) {
    const id = keyFromName(name);
    const board = {
      id,
      name,
      cells: boardFromCells(cells),
    };
    writeToStorage(id, board);
    this.isUnsaved = false;
  }

  /**
   * Load named board.
   * @param {String} name
   * @returns Board data, if found.
   */
  loadBoard(name) {
    if (name) return readFromStorage(keyFromName(name));
  }

  /**
   * @param {GameData} board
   */
  cellsFromBoard(board) {
    return [...board.cells].map((shape) => {
      const cell = new CellModel();
      if (shape === ShapeModel.blockedType) {
        cell.toggleBlocked(true);
      } else {
        cell.shape.setContent(shape);
      }
      return cell;
    });
  }

  writeTempData(cells) {
    this._lastSaved.cells = boardFromCells(cells);
    writeToStorage(LAST_SAVED, this._lastSaved);
    this.isUnsaved = true;
  }
}

/**
 * @param {CellModel[]} cells
 * @returns A string representation of the board.
 */
function boardFromCells(cells) {
  return cells.map((c) => c.shape.getShape()).join("");
}

/**
 * Convert friendly name into key.
 * @param {String} name
 * @returns A storage key.
 */
function keyFromName(name) {
  return PREFIX + name.trim().replace(/\s+/g, "_");
}

/**
 * @param {String} key
 * @param {*} data
 */
function writeToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * @param {String} key
 * @returns {GameData}
 */
function readFromStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
