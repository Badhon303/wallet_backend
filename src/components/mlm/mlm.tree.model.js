const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../models/plugins');

const mlmTree = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    tree: {
      type: String,
      set: (tree) => {
        return JSON.stringify(tree);
      },
    },
    message: {
      type: String,
      default: 'Tree update requests will be exicuted within 24 hours.',
    },
    requestedTime: { type: Date, required: true },
    executionTime: { type: Date, required: true },
  },
  { timestamps: true }
);

mlmTree.plugin(toJSON);
mlmTree.plugin(paginate);

/**
 * @typedef MlmTree
 */
const MlmTree = mongoose.model('MlmTree', mlmTree);

module.exports = MlmTree;
