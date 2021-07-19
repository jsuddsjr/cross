import GameStore from "./GameStore.js";
import Subscribers from "./Subscribers.js";

const SUBMIT_EVENT = "submit";

export default class LoadBoardModal {
  constructor(id) {
    this.selectedBoard = null;

    this.modal = document.getElementById(id);
    this.select = this.modal.querySelector("select");
    this.select.onchange = this.selectBoard.bind(this);

    this.store = new GameStore();
    this.subscribers = new Subscribers(this);

    /** @type {HTMLButtonElement} */
    this.okButton = this.modal.querySelector(".js-load-btn");
    this.okButton.onclick = (e) => {
      e.preventDefault();
      this.subscribers.notify(SUBMIT_EVENT);
    };

    this.loadBoards();
  }

  loadBoards() {
    const options = this.store.boards.map((d) => `<option>${d.name}</option>`);
    if (options.length) {
      this.select.innerHTML = options.join("");
      this.selectedBoard = this.select.options[0].value;
      this.select.disabled = false;
      this.okButton.disabled = false;
    } else {
      this.select.disabled = true;
      this.okButton.disabled = true;
      this.select.innerHTML = "<option>Save a board first.</option>";
    }
  }

  selectBoard() {
    this.selectedBoard = this.select.options[this.select.selectedIndex].value;
  }

  onSubmit(cb) {
    this.subscribers.subscribe(SUBMIT_EVENT, cb);
  }
}
