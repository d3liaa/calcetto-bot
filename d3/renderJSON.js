'use strict';

const fs = require('fs');

const mockRounds = [
  [
    {
      player1: { name: 'a' },
      player2: { name: 'b' }
    },
    {
      player1: 0,
      player2: 0
    },
    {
      player1: { name: 'd' },
      player2: { name: 'c' }
    },
    {
      player1: 0,
      player2: { name: 'e' }
    },
  ],
  [
    {
      player1: { name: 'a' },
      player2: 0
    },
    {
      player1: { name: 'd' },
      player2: { name: 'e' }
    },
  ],
  [
    {
      player1: { name: 'a' },
      player2: null
    }
  ],
  null
];

const renderJSON = (rounds) => {

  // create object with based on rounds



  const bracket = {};
  const putInBracket = (str) => {
    let parentBracket = bracket;
    let currentBracket = bracket.winners;
    let pushed = false;
    while (!pushed) {
      if (currentBracket.length < 2) {
        currentBracket.push({ name: str, winners: [] });
        pushed = true;
      } else {

      }
      if (currentBracket.length < 2) {
        currentBracket.push({ 'name': str, 'winners': [] });
        pushed = true;
      } else {
        if (currentBracket[0].winners.length < 2) {
          currentBracket = currentBracket[0].winners;
        } else if (currentBracket[1].winners.length < 2) {
          currentBracket = currentBracket[1].winners;
        }
      }
    };
  };


  fs.writeFile('./d3/bracket.json', JSON.stringify(bracket), err => {
    if (err) console.log(err);
  });
};

renderJSON(mockRounds);

module.exports = renderJSON;
