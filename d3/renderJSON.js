'use strict';

const fs = require('fs');

const renderJSON = (rounds) => {

  const bracket = {};

  fs.writeFile('bracket.json', JSON.stringify(bracket));
};

module.exports = renderJSON;
