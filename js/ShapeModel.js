const VOWEL = "0";
const CONSONANT = "1";
const ANY_TYPE = ".";
const BLOCKED = "#";
const SHAPE_MATCH = new RegExp(`[${VOWEL}${CONSONANT}${ANY_TYPE}]`, "g");
const LETTER_MATCH = /[a-z]/i;

/**
 * Manage a cell's attributes. A shape of 0 for vowel and 1 for consonant.
 */
export default class ShapeModel {
  /**
   * Constructor.
   * @param {HTMLElement} cellElement
   */
  constructor(cellElement) {
    this.cellElement = cellElement;
  }

  /** @param {String} char */
  static isShapeChar(char) {
    return "#.01".indexOf(char) !== -1;
  }

  static isLetter(char) {
    return LETTER_MATCH.test(char);
  }

  static get shapeMatch() {
    return SHAPE_MATCH;
  }
  static get letterMatch() {
    return LETTER_MATCH;
  }
  static get anyType() {
    return ANY_TYPE;
  }
  static get consonantType() {
    return CONSONANT;
  }
  static get vowelType() {
    return VOWEL;
  }
  static get blockedType() {
    return BLOCKED;
  }

  reset() {
    this.cellElement.dataset.shape = ANY_TYPE;
    this.cellElement.removeAttribute("data-letter");
  }

  get isAnyType() {
    return this.getShape() === ANY_TYPE;
  }

  get isShapeChar() {
    return ShapeModel.isShapeChar(this.getShape());
  }

  /**
   * Set the content of this cell.
   * @param {String} char
   */
  setContent(char) {
    if (char && char.length > 1) {
      throw new Error("Rebus squares (more than single letter) are not supported.");
    }

    if (ShapeModel.isShapeChar(char)) {
      this.cellElement.dataset.shape = char;
      this.cellElement.removeAttribute("data-letter");
    } else if (ShapeModel.isLetter(char)) {
      this.cellElement.dataset.shape = char;
      this.cellElement.dataset.letter = char;
    } else {
      this.reset();
      console.error(`Unrecognized character '${char}' for shape.`);
    }
  }

  getShape() {
    return this.cellElement.dataset.shape || ANY_TYPE;
  }

  getLetter() {
    return this.cellElement.dataset.letter || "_";
  }
}
