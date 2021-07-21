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
    this.clues = document.querySelector(cluesSelector);

    this.clueElements = {
      across: this.clues.querySelector("#across"),
      down: this.clues.querySelector("#down"),
    };

    this.countElement = document.querySelector(totalsSelector + " .wordCount");
    this.lettersElement = document.querySelector(totalsSelector + " .letterCount");
    this.scrabbleScore = document.querySelector(totalsSelector + " .scrabbleScore");

    // DEBUG
    this.shapeElement = document.querySelector(".shape");
  }

  /**
   * @typedef {Object} WordInfo
   * @property {HTMLElement} element
   * @property {String} clue
   * @property {Number} score
   * @property {Boolean} isAcross
   * @property {Number} number
   */

  handleBoardLayout() {
    this.clueElements.across.innerHTML = "";
    this.clueElements.down.innerHTML = "";

    const wordList = this.board.getWordList();
    this.countElement.textContent = wordList.length;

    const incubator = document.createElement("div");

    for (let w of wordList) {
      incubator.innerHTML = this.clueFromWord(w);
      const element = incubator.firstChild;
      w.onUpdated(this.updateFromWord.bind(this, element));
      this.clueElements[w.direction].appendChild(element);
    }

    this.refreshScores();
  }

  refreshScores() {
    const shape = this.board.cells.map((c) => c.shape.getShape()).join("");
    if (this.shapeElement) {
      this.shapeElement.textContent = shape;
    }

    const letterCells = [...shape].filter((c) => !ShapeModel.isShapeChar(c));
    const uniqueLetters = new Set(letterCells);
    this.lettersElement.textContent = uniqueLetters.size;

    const scrabbleScore = [...this.clues.querySelectorAll(".score")].reduce(
      (score, el) => score + parseInt(el.dataset.score),
      0
    );

    const countCellsTwice = letterCells.length * 2;
    this.scrabbleScore.textContent = `${scrabbleScore} (${(scrabbleScore / countCellsTwice).toFixed(2)})`;
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

  /**
   * @param {HTMLLIElement} element
   * @param {*} word
   */
  updateFromWord(element, word) {
    element.querySelector(".clue").textContent = word.getWord();
    element.querySelector(".score").dataset.score = word.getScrabbleValue();
    setTimeout(this.refreshScores.bind(this), 200);
  }
}

const clueTemplate = [
  '<li class="number" value="',
  null,
  '"><span class="clue">',
  null,
  '</span> <span class="score" data-score="',
  null,
  '"></span></li>',
];
