import CellModel from "./CellModel.js";
import ShapeModel from "./ShapeModel.js";

/**
 * @typedef {Object} GameData
 * @property {String} id    Storage key.
 * @property {String} name  Friendly name of the saved game.
 * @property {String} cells String of cells.
 */

const PREFIX = "xw_";
const LAST_SAVED = "xw-in-progress";
const TEMPLATES_KEY = "xw-templates";

const TEMPLATES_DEFAULT = [
  "...##....#.....#....##...",
  "##.....................##",
  "##...#.............#...##",
  "##....##................#................##....##",
  "##...###.....#..........#..........#.....###...##",
  "#...###.....##......#.......#......##.....###...#",
  "....#..........#..........#...........#.............###...#...#...###.............#...........#..........#..........#....",
  "....##.........#..........#.............#...###........#....#....#........###...#.............#..........#.........##....",
  ".....#..........#..........#.....##......###....#.........#...#.........#....###......##.....#..........#..........#.....",
  "....#...#........#...#........#...#.............#...###....#....#...#...#...........#...........#...#...#....#....###...#.............#...#........#...#........#...#....",
  "...#....#.......#....#............#....###...............##...###....#...........#.....#...........#....###...##...............###....#............#....#.......#....#...",
  "....#...##.......#....#.......#....#...###................#....##...#...#.........#...#.........#...#...##....#................###...#....#.......#....#.......##...#....",
  ".....#.....#........#.....#..............#......#......#........#....#..........#...............#....#...###....#....###...#....#...............#..........#....#........#......#......#..............#.....#........#.....#.....",
  ".....#.....#........#.....#..............#......#....#.............#.......###.................##....#.......#.....#.......#....##.................###.......#.............#....#......#..............#.....#........#.....#.....",
  ".......##.............#..............#............#.....#.......##....#.........#...#...........#........###.........###........#...........#...#.........#....##.......#.....#............#..............#.............##.......",
  "...#.....#........#.....#........#...............#.....#...........##...#####..................##....#.......#.....#.......#....##..................#####...##...........#.....#...............#........#.....#........#.....#...",
  ".....#.....#........#.....#........#.............#...#.........#.....#...........#...#....#...........#####...........#####...........#....#...#...........#.....#.........#...#.............#........#.....#........#.....#.....",
  "....##.....##........#.......#........#.......#............#........###......#....####....#....#.....#......#....#............#....#.......#....#....#.......#....#............#....#......#.....#....#....####....#......###........#............#.......#........#.......#........##.....##....",
  ".....#......#.........#......#.........#......#..........#...#......###........#........#.....#....###.....#.......#..........#.............#...#...#.............#..........#.......#.....###....#.....#........#........###......#...#..........#......#.........#......#.........#......#.....",
  ".....#....#...........#....#................#.........#...#....#....###....##.....###.......#.....#........#.....#........##....##......#.......#.......#......##....##........#.....#........#.....#.......###.....##....###....#....#...#.........#................#....#...........#....#.....",
  ".....#.....#..........#.....#..........#.....#..........#.....#...........#.......###.......#.....#...#......#.........#####.....#...........#.....#...........#.....#####.........#......#...#.....#.......###.......#...........#.....#..........#.....#..........#.....#..........#.....#.....",
];

const _templates = readFromStorage(TEMPLATES_KEY) || TEMPLATES_DEFAULT;

let _lastSaved = readFromStorage(LAST_SAVED) || {
  id: LAST_SAVED,
  name: "",
  cells: _templates[0],
};

let _isUnsaved = false;

export default class GameStore {
  /**
   * Read all boards from storage.
   * @returns {GameData[]}
   */
  get boards() {
    return Object.keys(localStorage)
      .sort()
      .filter((key) => key.startsWith(PREFIX))
      .map(readFromStorage);
  }

  /**
   * The last saved temporary board.
   */
  get lastSaved() {
    return _lastSaved;
  }

  get isUnsaved() {
    return _isUnsaved;
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
    _lastSaved = board;
    _isUnsaved = false;
  }

  /**
   * Save current board as a template.
   * @param {CellModel[]} cells
   */
  saveTemplate(cells) {
    const template = cells.map((c) => (c.isBlocked ? ShapeModel.blockedType : ShapeModel.anyType)).join("");
    if (_templates.includes(template)) return false;

    _templates.push(template);
    writeToStorage(TEMPLATES_KEY, _templates);
    return true;
  }

  /**
   * Find templates of specified base size.
   * @param {Number} size
   */
  fetchTemplates(size) {
    const sizeSquared = size * size;
    return _templates.filter((t) => t.length === sizeSquared);
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
        if (index >= 0 && index < _templates.length) {
          _lastSaved.cells = _templates[index];
        }
      }
      return readFromStorage(keyFromName(name)) || _lastSaved;
    }
  }

  /**
   * @param {GameData} board
   */
  cellsFromBoard(board) {
    return [...board.cells].map((shape) => {
      const cell = new CellModel();
      if (shape === ShapeModel.blockedType) {
        cell.toggleOne(true);
      } else {
        cell.shape.setContent(shape);
      }
      return cell;
    });
  }

  writeTempData(cells) {
    _lastSaved.cells = boardFromCells(cells);
    writeToStorage(LAST_SAVED, _lastSaved);
    _isUnsaved = true;
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
 */
function readFromStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
