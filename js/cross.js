import BoardView from "./BoardView.js";
import ResetBoardModal from "./ResetBoardModal.js";
import LoadBoardModal from "./LoadBoardModal.js";
import WordModel from "./WordModel.js";
import WordListView from "./WordListView.js";

const DEFAULT_BOARD_SIZE = "15";
const params = new URLSearchParams(document.location.search);
const boardSize = parseInt(params.get("size") || DEFAULT_BOARD_SIZE);
const boardName = params.get("name");
const templateShape = params.get("template");

const board = document.querySelector(".board");
const saveBtn = document.querySelector(".js-save-btn");
const clearWordBtn = document.querySelector(".js-clear-word");
const clearGridBtn = document.querySelector(".js-clear-grid");
const clearErrorsBtn = document.querySelector(".js-clear-errors");
const saveTemplateBtn = document.querySelector(".js-save-template");

const searchCluesBtn = document.querySelector(".js-search-clues");
const searchWordBtn = document.querySelector(".js-search-word");
const searchWikiBtn = document.querySelector(".js-search-wiki");
const searchScrabble = document.querySelector(".js-search-scrabble");
const searchDictionary = document.querySelector(".js-search-freedict");

if (
  board instanceof HTMLElement &&
  saveBtn instanceof HTMLButtonElement &&
  clearWordBtn instanceof HTMLButtonElement &&
  clearGridBtn instanceof HTMLButtonElement &&
  clearErrorsBtn instanceof HTMLButtonElement &&
  saveTemplateBtn instanceof HTMLButtonElement &&
  searchWordBtn instanceof HTMLButtonElement &&
  searchWikiBtn instanceof HTMLButtonElement &&
  searchCluesBtn instanceof HTMLButtonElement &&
  searchScrabble instanceof HTMLButtonElement &&
  searchDictionary instanceof HTMLButtonElement
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

  const loadModal = new LoadBoardModal("loadSavedModal");
  loadModal.onSubmit(() => {
    if (loadModal.selectedBoard) {
      boardView.load(loadModal.selectedBoard);
    }
  });

  if (templateShape) {
    boardView.loadTemplate(templateShape);
  } else {
    boardView.load(boardName);
  }

  /************************
   * Save modal
   ************************/

  const saveAsModal = document.getElementById("saveBoardAs");
  saveAsModal.addEventListener("shown.bs.modal", function () {
    saveAsModal.querySelector("#save-form #name").focus();
  });

  boardView.onSaved(() => {
    alert(`Saved board as ${boardView.title}`);
    const form = document.forms.namedItem("save-form");
    /** @type {HTMLInputElement} */
    const name = form.elements.namedItem("name");
    name.value = boardView.title;

    loadModal.loadBoards();
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

  /***********************
   * Menu buttons
   ***********************/

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

  /**********************
   * Help menu functions
   **********************/

  const createAnchor = (url, target = "_blank") => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.rel = "noopener noreferrer";
    anchor.target = target;
    document.body.appendChild(anchor).click();
  };

  const wordHandler = (urlTemplate, e) => {
    e.preventDefault();
    if (WordModel.activeWord) {
      if (WordModel.activeWord.isComplete) {
        createAnchor(urlTemplate + WordModel.activeWord.getShape());
      } else {
        alert("Incomplete word. Fill all the squares and try again.");
      }
    } else {
      alert("Select a filled-in word first.");
    }
  };

  searchWordBtn.onclick = wordHandler.bind(null, "https://google.com/search?q=define%20");
  searchWikiBtn.onclick = wordHandler.bind(null, "https://en.wikipedia.org/wiki/");
  searchCluesBtn.onclick = wordHandler.bind(null, "https://www.wordplays.com/crossword-clues/");
  searchScrabble.onclick = wordHandler.bind(null, "https://scrabblewordfinder.org/dictionary/");
  searchDictionary.onclick = wordHandler.bind(null, "https://www.thefreedictionary.com/");

  /*******************
   * Keyboard shortcuts
   ********************/

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
