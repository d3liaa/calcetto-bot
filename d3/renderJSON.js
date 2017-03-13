'use strict';

const fs = require('fs');

const renderJSON = (rounds) => {
  const bracket = {};

  // inserts a string at next possible place in bracket
  // TODO: only balanced up to 8 players
  const insert = (str) => {
    let currentBracket = bracket.winners;
    let pushed = false;
    while (!pushed) {
      if (currentBracket.length < 2) {
        currentBracket.push({ 'name': str, 'winners': [] });
        pushed = true;
      } else {
        if (currentBracket[0].winners.length < 2) {
          currentBracket = currentBracket[0].winners;
        } else if (currentBracket[1].winners.length < 2) {
          currentBracket = currentBracket[1].winners;
        } else {
          if (currentBracket[0].winners[0].winners.length < 2) {
            currentBracket = currentBracket[0].winners[0].winners;
          } else if  (currentBracket[0].winners[1].winners.length < 2) {
            currentBracket = currentBracket[0].winners[1].winners;
          } else if  (currentBracket[1].winners[0].winners.length < 2) {
            currentBracket = currentBracket[1].winners[0].winners;
          } else if  (currentBracket[1].winners[1].winners.length < 2) {
            currentBracket = currentBracket[1].winners[1].winners;
          }
        }
      }
    };
  };

  // removes the games that have a 0 in them
  const removeZeros = (bracket) => {
    if (bracket.winners.length === 2) {
      if (bracket.winners[1].name === '0') {
        bracket.winners.splice(1,1);
      } else removeZeros(bracket.winners[1]);
      if (bracket.winners[0].name === '0') {
        bracket.winners.splice(0,1);
      } else removeZeros(bracket.winners[0]);
    } else if (bracket.winners.length === 1) {
      if (bracket.winners[0].name === '0') bracket.winners.splice(0,1);
      else removeZeros(bracket.winners[0]);
    }
  };

  // iterates over the rounds array
  // and inserts each game into bracket
  for (let i = rounds.length-1; i >= 0; i--) {
    if (Array.isArray(rounds[i])) {
      for (let j = 0; j < rounds[i].length; j++) {
        const game = rounds[i][j];
        switch (game.player1) {
          case null:
            insert('');
            break;
          case 0:
            insert('0');
            break;
          default:
            insert(game.player1.name);
        };
        switch (game.player2) {
          case null:
            insert('');
            break;
          case 0:
            insert('0');
            break;
          default:
            insert(game.player2.name);
        };
      };
    } else {
      if (rounds[i]) bracket.name = player.name;
      else bracket.name = '';
      bracket.winners = [];
    }
  };

  removeZeros(bracket);

  fs.writeFile('./d3/bracket.json', JSON.stringify(bracket), err => {
    if (err) console.log(err);
  });

};

module.exports = renderJSON;
