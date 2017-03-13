'use strict';

const mocha = require('mocha');
const sinon = require('sinon');
const chai = require('chai');
const should = chai.should();
const TournamentBot = require('../controllers');
const mocks = require('./mocks');

const bot = new TournamentBot();

const createMessage = (user, chatId) => {
  return {
    message_id: user.msg_id,
    from: { id: user.id, first_name: user.first_name, username: user.username },
    chat: {
      id: chatId,
      title: 'BOT',
      type: 'group',
      all_members_are_administrators: true
    },
    date: 1489160360,
    text: '/start',
    entities: [ { type: 'bot_command', offset: 0, length: 6 } ]
  }
}

mocks.forEach(chat => {
  chat.users.forEach((user, index, arr) => {
    arr[index] = createMessage(user, chat.chatId);
  });
});

describe('Tournament Methods', function ()  {
  let getChatAdministrators;
  let sendMessage;
  const chatAdmins = mocks.map(chat => chat.users[0]);

  beforeEach(function () {
    getChatAdministrators = sinon.stub(bot.telegram, 'getChatAdministrators');
    sendMessage = sinon.stub(bot.telegram, 'sendMessage');

  });

  afterEach(function () {
    getChatAdministrators.restore();
    sendMessage.restore()
  });

  describe('start', function () {
    const chatAdmins = mocks.map(chat => chat.users[0]);
    const res = chatAdmins.map(admin => {
      return [{
        user: {
          id: admin.from.id,
          first_name: admin.from.first_name,
          username: admin.from.username,
        },
        status: 'creator'
      }]
    });

    it(`should add 1 tournament to chatsOpen`, function (done) {
      getChatAdministrators.returns(new Promise((resolve, reject) => resolve(res[0])));
      bot.start(chatAdmins[0]).then(() => {
        bot.chatsOpen.should.have.property(mocks[0].chatId);
        done();
      });
    });

    it(`should add multiple tournaments to chatsOpen `, function (done) {
      getChatAdministrators.returns(new Promise((resolve, reject) => resolve(res[1])));
      bot.start(chatAdmins[1]).then(() => {
        bot.chatsOpen.should.have.property(mocks[1].chatId);
        done();
      });
    });
  });

  describe('register', function () {
    it('should add a player to the tournament', function () {
      let tournament;
      mocks.forEach(chat => {
        tournament = bot.chatsOpen[chat.chatId]
        chat.users.forEach(msg => {
          let username = msg.from.username;
          bot.register(msg)
          tournament.players.should.have.property(username);
        })
      })
      tournament.playing.should.be.false;
      tournament.registering.should.be.true;
    });
  });

  describe('go', function () {

    it('should start a tournament with 4 players or more', function () {
      let tournament;
      chatAdmins.forEach((admin) => {
        const chatId = admin.chat.id;
        tournament = bot.chatsOpen[chatId];

        bot.go(admin)

        const playingPlayers = Object.keys(tournament.playingPlayers).length;
        const players = Object.keys(tournament.players).length;

        tournament.registering.should.be.false;
        tournament.playing.should.be.true;

        playingPlayers.should.eql(players);
      });
    });

    it('should create the current tournament structure', function () {
      chatAdmins.forEach(admin => {
        const chatId = admin.chat.id;
        const tournament = bot.chatsOpen[chatId];
        const rounds = tournament.rounds;
        const numOfRounds = rounds.length;
        const playerCount = Object.keys(tournament.players).length;

        rounds.forEach((round, i) => {
          const actualGamesInRound = round.length;
          const expectedGamesInRound = Math.pow(2, numOfRounds -  1 - i);

          expectedGamesInRound.should.eql(actualGamesInRound);
        });
      });
    });

    it('should correctly assign wildcards in the first round', function () {
      chatAdmins.forEach(admin => {
        const chatId = admin.chat.id;
        const tournament = bot.chatsOpen[chatId];
        const firstRound = tournament.rounds[0];
        const actualWildcards = tournament.wildcards;
        const actualWildcardsCount = actualWildcards.length;

        const expectedWildcards = firstRound.filter(game => {
          return game.player1 === 0 && game.player2 !== 0 ||
          game.player2 === 0 && game.player1 !== 0
        });

        const expectedWildcardsCount = expectedWildcards.length;

        expectedWildcards.forEach(expected => {
          const expected_name = expected.player1.name || expected.player2.name
          const isActualWildcard = actualWildcards.some(actual => actual.name === expected_name);

          isActualWildcard.should.be.true;
        })

        actualWildcardsCount.should.be.eql(expectedWildcardsCount);
      });
    });
  });

  describe('play a game and input results', function () {

    const chatAdmins = mocks.map(chat => chat.users[0]);
    const correctMatch = [ '/result 1-2', '1-2', 'index: 0', 'input: /result 1-2' ];
    it('should update the current game with the scores and winner', function () {

      const expectedResult = correctMatch[1];
      const exResultArr = expectedResult.split('-').map(el => +el);
      const winningScore = Math.max.apply(null, exResultArr);
      const losingScore = Math.min.apply(null, exResultArr);

      const msgFromAdmin = chatAdmins[0];
      const username = msgFromAdmin.from.username;
      const chatId = msgFromAdmin.chat.id;
      const tournament = bot.chatsOpen[chatId];

      const currGame = tournament.rounds[tournament.nextGame[0]][tournament.nextGame[1]];

      const expectedWinner = exResultArr[0] > exResultArr[1] ? currGame.player1 : currGame.player2;
      const expectedLoser = exResultArr[0] < exResultArr[1] ? currGame.player1 : currGame.player2;
      const prev_player1_goals = currGame.player1.goals;
      const prev_player2_goals = currGame.player2.goals;
      bot.go(msgFromAdmin);
      bot.result(msgFromAdmin, correctMatch);

      should.equal(currGame.result, undefined)

      bot.game(msgFromAdmin);
      bot.result(msgFromAdmin, correctMatch);
      const actualResult = currGame.result.join('-');
      const actualWinner = currGame.winner;
      const actualLoser = currGame.loser;

      const new_player1_goals = expectedWinner === currGame.player1 ?
      winningScore + prev_player1_goals :
      losingScore + prev_player1_goals
      const new_player2_goals = expectedWinner === currGame.player2 ?
      winningScore + prev_player2_goals :
      losingScore + prev_player2_goals

      should.not.equal(currGame.result, undefined)
      actualResult.should.be.eql(expectedResult);
      actualWinner.should.be.eql(expectedWinner);
      actualLoser.should.be.eql(expectedLoser);
      currGame.player1.goals.should.be.eql(new_player1_goals);
      currGame.player2.goals.should.be.eql(new_player2_goals);
    });

    it('should only accept numbers as valid results', function () {
      const incorrectMatch = [ '/result hello-world', 'hello-world', 'index: 0', 'input: /result hello-world' ];
      const expectedResult = incorrectMatch[1];
      const msgFromAdmin = chatAdmins[1];
      const username = msgFromAdmin.from.username;
      const chatId = msgFromAdmin.chat.id;
      const tournament = bot.chatsOpen[chatId];
      const currGame = tournament.rounds[tournament.nextGame[0]][tournament.nextGame[1]];
      bot.go(msgFromAdmin);
      bot.game(msgFromAdmin);
      bot.result(msgFromAdmin, incorrectMatch);

      should.equal(currGame.result, undefined);

    });

    it('should update the nextGame' , function () {
      const match = [ '/result 1-2', '1-2', 'index: 0', 'input: /result 1-2' ];
      chatAdmins.forEach((admin) => {
        const chatId = admin.chat.id;
        const tournament = bot.chatsOpen[chatId];
        const prev_nextGame = [tournament.nextGame[0], tournament.nextGame[1]];
        bot.go(admin);
        bot.game(admin);
        bot.result(admin, match);
        prev_nextGame.should.not.eql(tournament.nextGame)
      });
    });
  });

  describe('deleteTournament', function () {
    const msgFromAdmin = chatAdmins[0];
    const chatId = msgFromAdmin.chat.id;

    it('should not delete a tournament if the user selects no', function () {
      const tournament = bot.chatsOpen[chatId];

      bot.deleteTournament(msgFromAdmin);
      should.not.equal(bot.chatsOpen[chatId], undefined);
      bot.cancelDeletion(msgFromAdmin);
      should.not.equal(bot.chatsOpen[chatId], undefined);
    });

    it('should successfully delete a tournament if the user selectects yes', function () {
      const tournament = bot.chatsOpen[chatId];

      bot.deleteTournament(msgFromAdmin);
      should.not.equal(bot.chatsOpen[chatId], undefined);
      bot.confirmDeletion(msgFromAdmin);
      should.equal(bot.chatsOpen[chatId], undefined)
    });
  });
});
