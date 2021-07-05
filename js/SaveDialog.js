import Modal from "./Modal.js";

export default class SaveDialog {
  constructor(modalId = "modalBackground") {
    this.modal = new Modal(modalId);
  }

  show() {
    this.modal.dismiss();
    this.modal.show("Save your work", "");
  }
}
