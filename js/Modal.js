export default class Modal {
  /**
   * Constructor.
   * @param {String} modalId Id of the modal ("background") div.
   */
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    this.titleElement = this.modal.querySelector(".modal-title h3");
    this.bodyElement = this.modal.querySelector(".modal-body");
    this.closeButton = this.modal.querySelector("button");

    /** @type {HTMLElement} */
    this.triggerElement = null;

    // Set up click on close button and modal background to dismiss dialog.
    [this.closeButton, this.modal].forEach((el) => el.addEventListener("click", this.dismiss.bind(this)));

    [...this.modal.children].forEach(
      // Clicks inside the modal do not trigger close.
      (el) => el.addEventListener("click", (e) => e.stopImmediatePropagation())
    );

    this.modal.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        this.dismiss();
      }
    });
  }

  /**
   * Show modal dialog with the specified content.
   * @param {String} title
   * @param {String|HTMLElement} body
   * @param {HTMLElement} [triggerElement]
   */
  show(title, body, triggerElement) {
    this.modal.style.display = "flex";
    this.triggerElement = triggerElement;

    this.titleElement.textContent = title;
    if (body instanceof HTMLElement) {
      this.bodyElement.innerHTML = "";
      this.bodyElement.appendChild(body);
    } else {
      this.bodyElement.textContent = String(body);
    }

    this.closeButton.focus();
  }

  /**
   * Close dialog and return focus to prior element.
   */
  dismiss() {
    this.modal.style.display = "none";
    if (this.triggerElement) {
      this.triggerElement.focus();
    }
  }
}
