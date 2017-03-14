'use strict';

const fs = require('fs');

const mockRoot = {
  player1: undefined,
  player2: undefined,
  leftChild: {
     player1: '127362181',
     player2: '127362182',
     leftChild: undefined,
     rightChild: undefined },
  rightChild: {
     player1: '127362183',
     player2: '127362184',
     leftChild: undefined,
     rightChild: undefined }
}

const renderJSON = (root) => {

  const arrayify = (node) => {
    node.name = `${node.player1} - ${node.player2}`;
    node.winners = [];
    if (node.leftChild) {
      node.winners.push(node.leftChild);
      arrayify(node.leftChild);
    } if (node.rightChild) {
      node.winners.push(node.rightChild);
      arrayify(node.rightChild);
    }
  };

  arrayify(root);

  fs.writeFile('./d3/bracket.json', JSON.stringify(root), err => {
    if (err) console.log(err);
  });

  return root
};

console.log(renderJSON(mockRoot));

module.exports = renderJSON;
