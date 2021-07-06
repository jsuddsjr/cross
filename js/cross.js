import BoardView from "./BoardView.js";
import ResetBoardModal from "./ResetBoardModal.js";
import WordModel from "./WordModel.js";
import WordListView from "./WordListView.js";

const DEFAULT_BOARD_SIZE = "15";
const params = new URLSearchParams(document.location.search);
const boardSize = parseInt(params.get("size") || DEFAULT_BOARD_SIZE);
const boardName = params.get("name");

const board = document.querySelector(".board");
const across = document.getElementById("across");
const down = document.getElementById("down");
const count = document.querySelector("span.count");
const saveBtn = document.querySelector(".js-save-btn");
const clearWordBtn = document.querySelector(".js-clear-word");
const clearGridBtn = document.querySelector(".js-clear-grid");

if (
  board instanceof HTMLElement &&
  across instanceof HTMLElement &&
  down instanceof HTMLElement &&
  count instanceof HTMLElement &&
  saveBtn instanceof HTMLButtonElement &&
  clearWordBtn instanceof HTMLButtonElement &&
  clearGridBtn instanceof HTMLButtonElement
) {
  const boardView = new BoardView(board, boardSize);
  const wordListView = new WordListView(boardView, across, down, count);
  boardView.load(boardName);

  boardView.onSaved(() => {
    alert(`Saved board as ${boardView.title}`);
  });

  saveBtn.onclick = (e) => {
    e.preventDefault();
    const form = document.forms.namedItem("save-form");
    /** @type {HTMLInputElement} */
    const name = form.elements.namedItem("name");
    if (name.validity.valueMissing) {
      name.setCustomValidity("Enter a name for your crossword");
    } else {
      boardView.save(name.value);
    }
  };

  clearWordBtn.onclick = (e) => {
    e.preventDefault();
    if (WordModel.activeWord) {
      WordModel.activeWord.clearWord();
    }
  };

  clearGridBtn.onclick = (e) => {
    e.preventDefault();
    boardView.clearGrid();
  };

  const resetModal = new ResetBoardModal("resetBoardModal");
  resetModal.onSubmit(() => {
    boardView.setSize(resetModal.selectedSize);
    boardView.clear();
  });
} else {
  throw new Error("Initialization failed. Missing require UI elements.");
}
