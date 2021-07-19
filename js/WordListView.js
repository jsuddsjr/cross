import ShapeModel from "./ShapeModel.js";

/** @typedef {import("./WordModel.js").default} WordModel */

export default class WordListView {
  /**
   * Constructor.
   * @param {import("./BoardView.js").default} board
   * @param {string} cluesSelector
   * @param {string} totalsSelector
   */
  constructor(board, cluesSelector, totalsSelector) {
    this.board = board.onLayout(this.handleBoardLayout.bind(this));
    this.acrossElement = document.querySelector(cluesSelector + " #across");
    this.downElement = document.querySelector(cluesSelector + " #down");
    this.countElement = document.querySelector(totalsSelector + " .wordCount");
    this.lettersElement = document.querySelector(totalsSelector + " .letterCount");
    this.scrabbleScore = document.querySelector(totalsSelector + " .scrabbleScore");

    // DEBUG
    this.shapeElement = document.querySelector(".shape");

    /** @type {WordModel[]} */
    this.across = this.down = null;

    /** @type {Map<WordModel, String>} */
    this.clueMap = new Map();
  }

  handleBoardLayout() {
    this.clueMap.clear();
    this.across = [];
    this.down = [];

    const wordList = this.board.getWordList();
    this.countElement.textContent = wordList.length;

    for (let w of wordList) {
      this[w.direction].push(w);
      this.clueMap.set(w, this.clueFromWord(w));
      w.onUpdated(this.handleWordUpdate.bind(this));
    }

    this.repaint();
  }

  handleWordUpdate(word) {
    this.clueMap.set(word, this.clueFromWord(word));
    this.repaint();
  }

  repaint() {
    this.acrossElement.innerHTML = this.across.map((w) => this.clueMap.get(w)).join("");
    this.downElement.innerHTML = this.down.map((w) => this.clueMap.get(w)).join("");
    this.scrabbleScore.textContent = [...this.clueMap.keys()].reduce((score, w) => (score += w.getScrabbleValue()), 0);

    const shape = this.board.cells.map((c) => c.shape.getShape()).join("");
    const uniqueLetters = new Set([...shape].filter((c) => !ShapeModel.isShapeChar(c)));
    this.lettersElement.textContent = uniqueLetters.size;

    if (this.shapeElement) {
      this.shapeElement.textContent = shape;
    }
  }

  /**
   *
   * @param {WordModel} word
   */
  clueFromWord(word) {
    clueTemplate[1] = word.getClueNumber();
    clueTemplate[3] = word.getWord();
    clueTemplate[5] = word.getScrabbleValue();
    return clueTemplate.join("");
  }
}

const clueTemplate = [
  '<li class="number" value="',
  null,
  '"><span class="clue">',
  null,
  '</span> <span data-score="',
  null,
  '"></span></li>',
];
