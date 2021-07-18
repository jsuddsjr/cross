import Subscribers from "./Subscribers.js";
import GameStore from "./GameStore.js";
import ShapeModel from "./ShapeModel.js";

const SUBMIT_EVENT = "submit";

export default class ResetBoardModal {
  constructor(id) {
    this.modal = document.getElementById(id);
    this.links = [...this.modal.querySelectorAll("a")];
    this.selectedSize = 15;

    /** @type {HTMLButtonElement} */
    this.okButton = this.modal.querySelector(".js-create-btn");

    /** @type {HTMLElement} */
    this.previewPane = this.modal.querySelector(".grid-preview");

    this.store = new GameStore();
    this.subscribers = new Subscribers(this);
    this.fetchPreviews();

    this.links.forEach((a) =>
      a.addEventListener("click", () => {
        this.links.forEach((a) => a.classList.remove("active"));
        a.classList.add("active");
        this.selectedSize = parseInt(a.dataset.size);
        this.fetchPreviews();
      })
    );

    this.okButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.subscribers.notify(SUBMIT_EVENT);
    });
  }

  /**
   * Generate previews for templates of specified size.
   */
  fetchPreviews() {
    this.previewPane.innerHTML = "";
    this.previewPane.style.setProperty("--preview-size", this.selectedSize);
    this.store.fetchTemplates(this.selectedSize).map(this.generateTemplatePreview.bind(this));
  }

  /**
   * Convert template string into elements.
   * @param {String} template
   */
  generateTemplatePreview(template) {
    const boardPreview = document.createElement("a");
    boardPreview.dataset.template = template;
    boardPreview.href = "#";

    boardPreview.innerHTML = [...template]
      .map((c) => `<div class="${c === ShapeModel.blockedType ? "b" : "w"}" ></div>`)
      .join("");

    this.previewPane.appendChild(boardPreview);
  }

  onSubmit(cb) {
    this.subscribers.subscribe(SUBMIT_EVENT, cb);
    return this;
  }
}
