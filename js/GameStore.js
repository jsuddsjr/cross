import CellModel from "./CellModel.js";
import ShapeModel from "./ShapeModel.js";

const PREFIX = "xw_";
const LAST_SAVED = "xw-in-progress";
const TEMPLATES_KEY = "xw-templates";

const TEMPLATES_DEFAULT = [
  ".....#.....#........#.....#..............#......#......#........#....#..........#...............#....#...###....#....###...#....#...............#..........#....#........#......#......#..............#.....#........#.....#.....",
  ".....#.....#........#.....#..............#......#....#.............#.......###.................##....#.......#.....#.......#....##.................###.......#.............#....#......#..............#.....#........#.....#.....",
  ".......##.............#..............#............#.....#.......##....#.........#...#...........#........###.........###........#...........#...#.........#....##.......#.....#............#..............#.............##.......",
  "...#.....#........#.....#........#...............#.....#...........##...#####..................##....#.......#.....#.......#....##..................#####...##...........#.....#...............#........#.....#........#.....#...",
  ".....#.....#........#.....#........#.............#...#.........#.....#...........#...#....#...........#####...........#####...........#....#...#...........#.....#.........#...#.............#........#.....#........#.....#.....",
];

/**
 * @typedef {Object} GameData
 * @property {String} id    Storage key.
 * @property {String} name  Friendly name of the saved game.
 * @property {String} cells String of cells.
 */

export default class GameStore {
  constructor() {
    this.isUnsaved = false;
    this._templates = readFromStorage(TEMPLATES_KEY) || TEMPLATES_DEFAULT;
    this._lastSaved = readFromStorage(LAST_SAVED) || {
      id: LAST_SAVED,
      name: "",
      cells: this._templates[0],
    };
  }

  /**
   * Read all boards from storage.
   */
  get boards() {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .map((k) => readFromStorage(k));
  }

  /**
   * The last saved temporary board.
   */
  get lastSaved() {
    return this._lastSaved;
  }

  /**
   * Write updates to the board.
   * TODO: Save clues, not just cells.
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
    this._lastSaved = board;
    this.isUnsaved = false;
  }

  /**
   * Save current board as a template.
   * @param {CellModel[]} cells
   */
  saveTemplate(cells) {
    const template = cells.map((c) => (c.isBlocked ? ShapeModel.blockedType : ShapeModel.anyType));
    this._templates.push(template);
    writeToStorage(TEMPLATES_KEY, this._templates);
  }

  /**
   * Delete board from storage.
   * @param {String} name
   */
  deleteBoard(name) {
    localStorage.removeItem(keyFromName(name));
  }

  /**
   * Save board under a different key.
   * @param {String} name
   * @param {String} newName
   */
  renameBoard(name, newName) {
    const board = readFromStorage(keyFromName(name));
    if (board) {
      writeToStorage(keyFromName(newName), board);
      this.deleteBoard(name);
    }
  }

  /**
   * Load named board.
   * @param {String} name
   * @returns Board data, if found.
   */
  loadBoard(name) {
    if (name) {
      if (name.startsWith("template")) {
        const index = parseInt(name.substring(8)) || 0;
        if (index >= 0 && index < TEMPLATES_DEFAULT.length) {
          this._lastSaved.cells = TEMPLATES_DEFAULT[index];
        }
      }
      return readFromStorage(keyFromName(name)) || this._lastSaved;
    }
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
