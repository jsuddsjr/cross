import BoardView from "./BoardView.js";
import ResetBoardModal from "./ResetBoardModal.js";
import WordModel from "./WordModel.js";
import WordListView from "./WordListView.js";

const DEFAULT_BOARD_SIZE = "15";
const params = new URLSearchParams(document.location.search);
const boardSize = parseInt(params.get("size") || DEFAULT_BOARD_SIZE);
const boardName = params.get("name");

const board = document.querySelector(".board");
const saveBtn = document.querySelector(".js-save-btn");
const clearWordBtn = document.querySelector(".js-clear-word");
const clearGridBtn = document.querySelector(".js-clear-grid");
const clearErrorsBtn = document.querySelector(".js-clear-errors");
const saveTemplateBtn = document.querySelector(".js-save-template");

if (
  board instanceof HTMLElement &&
  saveBtn instanceof HTMLButtonElement &&
  clearWordBtn instanceof HTMLButtonElement &&
  clearGridBtn instanceof HTMLButtonElement &&
  clearErrorsBtn instanceof HTMLButtonElement &&
  saveTemplateBtn instanceof HTMLButtonElement
) {
  const boardView = new BoardView(board, boardSize);
  new WordListView(boardView, ".clues", ".totals");

  const resetModal = new ResetBoardModal("resetBoardModal");
  resetModal.onSubmit(() => {
    boardView.setSize(resetModal.selectedSize);
    if (resetModal.selectedBoard) {
      boardView.loadTemplate(resetModal.selectedBoard.dataset.template);
    } else {
      boardView.clear();
    }
  });

  boardView.load(boardName);

  boardView.onSaved(() => {
    alert(`Saved board as ${boardView.title}`);
    const form = document.forms.namedItem("save-form");
    /** @type {HTMLInputElement} */
    const name = form.elements.namedItem("name");
    name.value = boardView.title;
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

  clearErrorsBtn.onclick = (e) => {
    e.preventDefault();
    boardView.clearErrors();
  };

  saveTemplateBtn.onclick = (e) => {
    e.preventDefault();
    if (boardView.saveAsTemplate()) {
      resetModal.fetchPreviews();
    }
  };

  document.body.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "x": {
        if (e.ctrlKey) {
          boardView.clearErrors();
          e.preventDefault();
        }
        break;
      }
      case "X": {
        if (e.ctrlKey && WordModel.activeWord) {
          WordModel.activeWord.clearWord();
          e.preventDefault();
        }
        break;
      }
    }
  });
} else {
  throw new Error("Initialization failed. Missing require UI elements.");
}
