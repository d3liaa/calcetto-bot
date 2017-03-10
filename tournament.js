'use strict';

class Tournament {

  constructor (chatId, chatAdmin) {
    this.chatId = chatId;
    this.chatAdmin = chatAdmin;
    this.players = {};
    this.playingPlayers = {};
    // this.theFinalPlayers = [];
    this.registering = true;
    this.playing = false;
    this.rounds = [];
    this.wildcards = [];
    this.nextGame = 0;
  };

  createTournament () {
    const numberOfPlayers = Object.keys(this.players).length;
    const startingNumber = findNextPowerOfTwo(numberOfPlayers);
    const playersArr = [];
    const firstRound = [];

    for (let player in this.players) {
      if (this.players.hasOwnProperty(player)) {
        playersArr.push(this.players[player]);
        this.playingPlayers[player] = this.players[player]
      };
    };

    while (playersArr.length < startingNumber) playersArr.push(0);

    shuffle(playersArr);

    for (let i = 0; i < playersArr.length; i += 2) {
      firstRound.push([playersArr[i], playersArr[i+1]]);
    };

    firstRound.forEach(pairing => {
      if (pairing.includes(0)) {
        this.wildcards.push(pairing[Math.abs(pairing.indexOf(0) - 1)]);
      };
    });

    this.rounds.push(firstRound);
  };

  nextOpponent (username) {
    const rounds = flatten(this.rounds)

    for (let i = this.nextGame; i < rounds.length; i++) {
      if (rounds[i].includes(username) &&  rounds[i].length > 1) {
        return rounds[i][Math.abs(rounds[i].indexOf(username) - 1)]
      }
    }
  }
};

module.exports = Tournament;


const findNextPowerOfTwo = num => {
  return Math.pow(2, Math.ceil(Math.log2(num)));
};

const shuffle = (a) => {
  for (let i = a.length; i; i--) {
    const j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  };
};

const flatten = (arr) => {
  return arr.reduce((a,b) => a.concat(b))
}


// const tm = {};
//
// var Match = tm.Match = function () {
//  this.round = undefined;
//  this.player1 = undefined;
//  this.player2 = undefined;
//  this.score = undefined;
//  this.played = false;
//  this.childrenLeft = undefined;
//  this.childrenRight = undefined;
// }
//
// Match.prototype.addPlayers = function (where, players) {
//   if (where === 'right') {
//     this.childrenRight = new Match();
//     this.childrenRight.player1 = players.shift();
//     this.childrenRight.player2 = players.shift();
//   }
//   if (where === 'left') {
//     this.childrenLeft = new Match();
//     this.childrenLeft.player1 = players.shift();
//     this.childrenLeft.player2 = players.shift();
//   }
//   else return false;
// }
// //
// tm.createTournament = function (players) {
//   let final = new Match();
//   final.round = 'final';
//   let queue = [final];
//   let empty = players.length - 2;
//   let counter = 2;
//   let match;
//
//   while (queue.length > 0 && counter < empty) {
//     match = queue.shift();
//     counter += 2;
//     match.childrenLeft = new Match ();
//     queue.push(match.childrenLeft);
//     if (counter < empty) {
//       match.childrenRight = new Match ();
//       queue.push(match.childrenRight);
//       counter += 2;
//     }
//     if ((players.length) % 2 === 0 && counter === empty && match.childrenRight === undefined) {
//       match.addPlayers('right', players);
//       counter += 2;
//     }
//   }
//
//   if ((players.length) % 2 === 1){
//     if (counter > empty) {
//       queue[queue.length-1].player2 = players.shift()
//     }
//     if (match.childrenRight === undefined) {
//       match.addPlayers('right', players);
//     }
//   }
//
//   while (queue.length > 0 && players.length > 0) {
//     let match = queue.shift();
//     match.addPlayers('left', players);
//     if (players.length > 0) {
//       match.addPlayers('right', players);
//     }
//   }
//   return final;
// }
//
// Match.prototype.setWinner = function (num, winner) {
//   if (num === 1) {
//     this.player1 = winner;
//     this.childrenLeft.played = true;
//     return true;
//   }
//   if (num === 2) {
//     this.player2 = winner;
//     this.childrenLeft.played = true;
//     return true;
//   }
//   else return false;
// }
//
// Match.prototype.passRound = function (winner) {
//   if (this.childrenLeft === undefined) return false;
//   if (this.childrenLeft.player1 === winner) {
//     this.setWinner(1, winner);
//   } else if (this.childrenLeft.player2 === winner ) {
//     this.setWinner(1, winner);
//   }
//   if (this.childrenRight !== undefined) {
//     if (this.childrenRight.player1 === winner) {
//       this.setWinner(2, winner);
//     } else if (this.childrenRight.player2 === winner) {
//       this.setWinner(2, winner);
//     }
//   }
//
//   let found = this.childrenLeft.passRound(winner);
//   if (!found && this.childrenRight)
//     found = this.childrenRight.passRound(winner);
//
//   return found;
// }
//
// Match.prototype.nextMatch = function () {
//     let next, nextDepth = -1;
//
//     (function recurse (match, depth = 0) {
//         if (match.player1 && match.player2 && depth > nextDepth) {
//             next = match;
//             nextDepth = depth;
//         }
//         if (!match.player1 && match.childrenLeft)
//             recurse(match.childrenLeft, depth + 1);
//         if (!match.player2 && match.childrenRight)
//             recurse(match.childrenRight, depth + 1);
//     })(this);
//     return next;
// }
//
// Match.prototype.nextOpponent = function (player) {
//     if (this.player1 === player) return this.player2;
//     if (this.player2 === player) return this.player1;
//     var match;
//     if (!this.player2 && !this.player1 && this.childrenRight)
//         match = this.childrenRight.nextOpponent(player);
//     // maybe previous return value was undefined, then try the other side:
//     if (!match && !this.player1 && !this.player2 && this.childrenLeft)
//         match = this.childrenLeft.nextOpponent(player);
//     return match;
// }
//
// module.exports = tm;
