'use strict';

const fs = require('fs');

const renderJSON = (root) => {
  const arrayify = (node) => {
    node.name = `${node.player1} - ${node.player2}`;
    node.children = [];
    node.children.push(node.leftChild);
    node.children.push(node.rightChild);
    if (node.children[0]) arrayify(node.children[0]);
    if (node.children[1]) arrayify(node.children[1]);
  };

  arrayify(root);

  return JSON.stringify(root);
  fs.writeFile('./d3/bracket.json', JSON.stringify(bracket), err => {
    if (err) console.log(err);
  });

};

module.exports = renderJSON;
