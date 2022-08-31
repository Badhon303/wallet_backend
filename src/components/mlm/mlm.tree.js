const Queue = require('./mlm.queue');
const Mlm = require('./mlm.model');
const mlmService = require('../../services');

let tree = {};

const pushCurrentObjToTree = async (mlmObj) => {
  const { childNo } = mlmObj;
  for (const indx of childNo) {
  }
};

const getDecendants = async (userId, level) => {
  const queue = new Queue();
  const mlmObj = await Mlm.findOne({ user: userId });
  console.log(mlmObj);

  await queue.enqueue({
    id: mlmObj._id,
    user: mlmObj.user,
    parent: mlmObj.parent,
    childNo: [],
    children: mlmObj.children,
    level: 0,
  });

  console.log(queue);
  console.log(level);

  while (!queue.isEmpty()) {
    const currentObj = queue.dequeue();
    console.log(currentObj);
    await pushCurrentObjToTree(currentObj);
    await pushChildrenToQueue();
    if (currentObj.level < level) {
      if (currentObj.childNo.length === 0) {
        tree[0] = { user: currentObj.user, parent: currentObj.parent, children: [] };
        console.log(tree);
      } else {
        let parent = tree;
        let indx;
        for (indx = 0; indx < currentObj.childNo - 1; indx += 1) {
          parent = parent[indx];
        }

        parent.children[currentObj.childNo.length - 1] = {
          name: currentObj.name,
          parent: currentObj.parent,
          children: [],
        };

        for (indx = 0; indx < currentObj.children.length; indx += 1) {
          const v = mlmService.fetchOne(currentObj.children[indx]);
          const { childNo } = currentObj;
          childNo.push(indx);
          queue.enqueue({
            id: v._id,
            parent: v.parent,
            childNo: childNo,
            children: v.children,
            level: currentObj.level + 1,
          });
        }
      }
    }
  }

  return tree;
};

module.exports = {
  getDecendants,
};
