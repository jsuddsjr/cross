import Subscribers from "./Subscribers.js";

const SUBMIT_EVENT = "submit";

export default class ResetBoardModal {
  constructor(id) {
    this.modal = document.getElementById(id);
    this.links = [...this.modal.querySelectorAll("a")];
    this.okButton = this.modal.querySelector(".js-create-btn");
    this.subscribers = new Subscribers(this);
    this.selectedSize = 15;

    this.links.forEach((a) =>
      a.addEventListener("click", () => {
        this.links.forEach((a) => a.classList.remove("active"));
        a.classList.add("active");
        this.selectedSize = parseInt(a.dataset.size);
      })
    );

    this.okButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.subscribers.notify(SUBMIT_EVENT);
    });
  }

  onSubmit(cb) {
    this.subscribers.subscribe(SUBMIT_EVENT, cb);
    return this;
  }
}
