export default class Subscribers {
  /**
   * @param {Object} publisher
   */
  constructor(publisher) {
    this.publisher = publisher;

    /** @type {Map<string, NotifyFunc[]>} */
    this.subscribers = new Map();
  }

  /**
   * Set a callback for named event.
   * @param {String} eventName
   * @param {NotifyFunc} notifyFunc
   */
  subscribe(eventName, notifyFunc) {
    const list = this.subscribers.get(eventName) || [];
    if (list.length === 0) {
      this.subscribers.set(eventName, list);
    }
    list.push(notifyFunc);
  }

  /**
   * Notify subscribers of event.
   * @param {String} eventName
   */
  notify(eventName) {
    const list = this.subscribers.get(eventName) || [];
    list.forEach((notifyFunc) => {
      try {
        notifyFunc(this.publisher);
      } catch (err) {
        console.log(err);
      }
    });
  }
}

/**
 * @callback NotifyFunc
 * @param {Object} publisher
 * @returns {Void}
 */

/**
 * Subscribe to save events.
 * @param {NotifyFunc} callback
 * @returns
 */
// onSave(callback) {
//   this.subscribers.subscribe(SAVE_EVENT, callback);
//   return this;
// }
