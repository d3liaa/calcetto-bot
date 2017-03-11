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
      // if (currentBracket.length < 2) {
      //   currentBracket.push({ 'name': str, 'winners': [] });
      //   pushed = true;
      // } else {
      //   if (currentBracket[0].winners.length < 2) {
      //     currentBracket = currentBracket[0].winners;
      //   } else if (currentBracket[1].winners.length < 2) {
      //     currentBracket = currentBracket[1].winners;
      //   }
      // }
    };
  };

  for (let i = rounds.length-1; i >= 0; i--) {
    if (Array.isArray(rounds[i])) {
      for (let j = 0; j < rounds[i].length; j++) {
        const game = rounds[i][j];
        if (game.player1) putInBracket(game.player1.name);
        if (game.player1 === null) putInBracket('null');
        if (game.player1 === 0) putInBracket('0');
        if (game.player2) putInBracket(game.player2.name);
        if (game.player2 === null) putInBracket('null');
        if (game.player2 === 0) putInBracket('0');
      };
    } else {
      if (rounds[i]) bracket.name = player.name;
      else bracket.name = '';
      bracket.winners = [];
    }
  };

  fs.writeFile('./d3/bracket.json', JSON.stringify(bracket), err => {
    if (err) console.log(err);
  });
};

renderJSON(mockRounds);

module.exports = renderJSON;
