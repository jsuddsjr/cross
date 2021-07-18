/** @typedef {import("./WordModel.js").default} WordModel */

export default class WordListView {
  /**
   * Constructor.
   * @param {import("./BoardView.js").default} board
   * @param {HTMLElement} acrossElement
   * @param {HTMLElement} downElement
   * @param {HTMLElement} countElement
   */
  constructor(board, acrossElement, downElement, countElement) {
    this.board = board.onLayout(this.update.bind(this));
    this.acrossElement = acrossElement;
    this.downElement = downElement;
    this.countElement = countElement;

    // DEBUG
    this.shapeElement = document.querySelector(".shape");

    /** @type {WordModel[]} */
    this.across = this.down = null;

    /** @type {Map<WordModel, String>} */
    this.map = new Map();
  }

  update() {
    this.map.clear();
    this.across = [];
    this.down = [];

    const wordList = this.board.getWordList();
    this.countElement.textContent = wordList.length;

    for (let w of wordList) {
      this[w.direction].push(w);
      this.map.set(w, this.clueFromWord(w));
      w.onUpdated(this.updateWord.bind(this));
    }

    this.repaint();
    this.shapeFromBoard();
  }

  updateWord(word) {
    this.map.set(word, this.clueFromWord(word));
    this.repaint();
  }

  repaint() {
    this.acrossElement.innerHTML = this.across.map((w) => this.map.get(w)).join("");
    this.downElement.innerHTML = this.down.map((w) => this.map.get(w)).join("");
  }

  shapeFromBoard() {
    if (this.shapeElement) {
      this.shapeElement.textContent = this.board.cells.map((c) => c.shape.getShape()).join("");
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
