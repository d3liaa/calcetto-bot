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

  beforeEach(function () {
    getChatAdministrators = sinon.stub(bot.telegram, 'getChatAdministrators');
    sendMessage = sinon.stub(bot.telegram, 'sendMessage');

  });

  afterEach(function () {
    getChatAdministrators.restore();
    sendMessage.restore()
  });

  describe('start()', function () {
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
  })
});

  describe('register()', function () {
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

  describe('go()', function () {
    const chatAdmins = mocks.map(chat => chat.users[0]);

    it('should start a tournament with 4 players or more', function () {
      let tournament;
      chatAdmins.forEach((admin, i) => {
        const chatId = mocks[i].chatId
        tournament = bot.chatsOpen[chatId];
        bot.go(admin)
        tournament.registering.should.be.false;
        tournament.playing.should.be.true;
        Object.keys(tournament.playingPlayers).length.should.eql(Object.keys(tournament.players).length);
      });
    });

  describe('result', function () {
    it('should update the current game with the scores', function () {

    });
  });
});
