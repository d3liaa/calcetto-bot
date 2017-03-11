'use strict';

const renderJSON = require('./d3/renderJSON');

class Tournament {

  constructor (chatId, chatAdmin) {
    this.chatId = chatId;
    this.chatAdmin = chatAdmin;
    this.players = {};
    this.playingPlayers = {};
    this.registering = true;
    this.playing = false;
    this.rounds = [];
    this.nextGame = [0, 0];
    this.finals = {};
    this.round;
  };

  createTournament () {
    const numberOfPlayers = Object.keys(this.players).length;
    const startingNumber = findNextPowerOfTwo(numberOfPlayers);
    const numberOfRounds = Math.log2(startingNumber);
    const playersArr = [];
    const firstRound = [];

    this.finals = {
      quarterFinals: numberOfRounds - 3,
      semiFinals: numberOfRounds - 2,
      final: numberOfRounds - 1
    };

    this.round = this.chooseRound();

    for (let player in this.players) {
      if (this.players.hasOwnProperty(player)) {
        playersArr.push(this.players[player]);
        this.playingPlayers[player] = this.players[player];
      };
    };

    while (playersArr.length < startingNumber) playersArr.push(0);

    shuffle(playersArr);

    for (let i = 0; i < playersArr.length; i += 2) {
      firstRound.push({player1: playersArr[i], player2: playersArr[i+1]});
    };

    this.rounds.push(firstRound);

    let playersCount = startingNumber / 2;
    for (let i = 1; i < numberOfRounds; i++) {
      const round = [];
      for (let j = 0; j < playersCount; i+=2) round.push([null, null]);
      this.rounds.push(round);
      playersCount = playersCount / 2;
    };

  };

  addPlayer (username) {
    this.players[username] = {
      name: username,
      played: [],
      goals: 0
    };
  };

  findNextOpponent (username) {
    const rounds = this.rounds;
    for (let i = this.nextGame[0]; i < rounds.length; i++) {
      for(let j = this.nextGame[1]; j < rounds[i].length; j++) {
        if (rounds[i][j].player1.name === username) return rounds[i][j].player2;
        else if (rounds[i][j].player2.name === username) return rounds[i][j].player1;
      };
    };
  };

  findNextGame () {
    while (this.rounds[this.nextGame[0]][this.nextGame[1]].player1 === 0
      && this.rounds[this.nextGame[0]][this.nextGame[1]].player2 === 0) {
      if (this.nextGame[1] < this.nextGame[0].length) {
        this.nextGame[1] = this.nextGame[1] + 1;
      } else this.nextGame = [this.nextGame[0] + 1, 0];
    };
    return this.rounds[this.nextGame[0]][this.nextGame[1]];
  };

  gamePlayed (result) {
    const game = this.rounds[this.nextGame[0]][this.nextGame[1]];

    game.result = formatResult(result);
    game.winner = game.result[0] > game.result[1] ? game.player1 : game.player2;
    game.loser = game.result[0] < game.result[1] ? game.player1 : game.player2;

    delete this.playingPlayers[game.loser];

    this.players[game.winner.name].played.push(game);
    this.players[game.loser.name].played.push(game);
    this.players[game.winner.name].goals += Math.max.apply(null, result);
    this.players[game.loser.name].goals += Math.min.apply(null, result);

    this.placeInNextGame(game.winner);

    if (this.nextGame[1] < this.nextGame[0].length) {
      this.nextGame[1] = this.nextGame[1] + 1;
    } else this.nextGame = [this.nextGame[0] + 1, 0];

    for (let i = this.nextGame[0]; i < this.rounds.length; i++) {
      for (let j = this.nextGame[1]; j < this.rounds[i].length; j++) {
        const game = this.rounds[i][j];
        if (game.player1 === 0) this.placeInNextGame(game.player2);
        else if (game.player2 === 0) this.placeInNextGame(game.player1);
        else this.nextGame = [i, j];
      };
    };

    this.round = this.round === 'Final' ? 'finished' : this.chooseRound();
  };

  chooseRound () {
    switch (this.nextGame[0]) {
      case this.finals.quarterFinals:
        return 'Quarter-finals';
      case this.finals.semiFinals:
        return 'Semi-finals';
      case this.finals.final:
        return 'Final';
      default:
        return 'Preliminary Round';
    };
  };

  getStats (username) {
    const player = this.players[username];
    const avgScore = player.goals / player.played.length;

    let highest = 0;
    let lowest = 0;
    player.played.forEach(game => {
      const max = Math.max.apply(null, game.result);
      const min = Math.min.apply(null, game.result);
      if (game.winner === username ) {
        if (max > highest) highest = max;
        if (max < lowest) lowest = max;
      }
      else if (min > highest) highest = min;
      else if (min < lowest) lowest = min;
    });

    const ranking = this.getRanking();
    let playersRank;
    for (let i = 0; i < ranking.length; i++) {
      if (ranking[i].name === username) playersRank = i + 1;
    };
  };

  getRanking () {
    const players = this.players;
    const ranking = [];
    for (let player in players) {
      if (players.hasOwnProperty(player)) {
        ranking.push({
          name: player,
          goals : players[player].goals
        });
      }
    };
    return ranking.sort((a, b) => b.goals - a.goals)
  };

  getWildcards () {
    const wildcards = [];
    const currRound = this.rounds[this.nextGame[0]];
    currRound.forEach(game => {
      if (game.player1 === 0 && game.player2) wildcards.push(game.player2);
      else if (game.player2 === 0 && game.player1) wildcards.push(game.player1);
    });
    return wildcards;
  };

  placeInNextGame (player) {
    for (let i = this.nextGame[0]; i < this.rounds.length; i++) {
      for(let j = this.nextGame[1]; j < this.rounds[i].length; j++) {
        if (this.rounds[i][j].player1 === null) this.rounds[i][j].player1 = player;
        else if (this.rounds[i][j].player2 === null) this.rounds[i][j].player2 = player;
      };
    };
  };

};

const findNextPowerOfTwo = num => {
  return Math.pow(2, Math.ceil(Math.log2(num)));
};

const shuffle = (a) => {
  for (let i = a.length; i; i--) {
    const j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  };
};

const formatResult = (res) => res.replace(/\s/g, '').split('-').map(el => +el);

module.exports = Tournament;
