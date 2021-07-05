import BoardView from "./BoardView.js";
import Modal from "./Modal.js";
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
const clearBtn = document.querySelector(".js-clear-btn");

if (
  board instanceof HTMLElement &&
  across instanceof HTMLElement &&
  down instanceof HTMLElement &&
  count instanceof HTMLElement &&
  saveBtn instanceof HTMLButtonElement &&
  clearBtn instanceof HTMLButtonElement
) {
  const boardView = new BoardView(board, boardSize);
  const wordListView = new WordListView(boardView, across, down, count);
  boardView.load(boardName);

  boardView.onSaved(() => {
    const modal = new Modal("modalBackground");
    modal.show("Saved", `Saved board as ${boardView.title}`);
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

  clearBtn.onclick = (e) => {
    e.preventDefault();
    boardView.clear();
  };
}
