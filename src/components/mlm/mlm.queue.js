const httpStatus = require('http-status');
const { qNode } = require('./mlm.node');
const ApiError = require('../../utils/ApiError');

class Queue {
  constructor() {
    this.items = [];
  }

  /**
   * Checks if the queue is empty
   * @returns {Promise<Boolean>}
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Inserts a valid node into the queue
   * Throws ApiError if node is not valid
   * @param {Object<qNode>} node
   * @throws {Object<ApiError>}
   */
  enqueue(node) {
    try {
      //const n = await qNode.validateAsync(node);
      this.items.push(node);
    } catch (err) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message !== undefined ? err.message : 'Could not enqueue');
    }
  }

  /**
   * Deletes node from queue and returns the value
   * @returns {Promise<Object<qNode>>}
   */
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift();
  }

  /**
   * returns front element of queue
   * @returns {Promise<qNode || null}
   */
  front() {
    if (this.isEmpty) {
      return null;
    }
    return this.items[0];
  }
}

module.exports = Queue;
