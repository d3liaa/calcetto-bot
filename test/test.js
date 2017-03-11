'use strict';

const mocha = require('mocha');
const sinon = require('sinon');
const chai = require('chai');
const should = chai.should();
const TournamentBot = require('../controllers');

const bot = new TournamentBot();
const msg = {
  message_id: 1545,
  from: { id: 306946885, first_name: 'Nadia', username: 'nadiadillon' },
  chat: {
    id: -113251997,
    title: 'BOT',
    type: 'group',
    all_members_are_administrators: true
  },
  date: 1489160360,
  text: '/start',
  entities: [ { type: 'bot_command', offset: 0, length: 6 } ]
};

describe('Start', function ()  {
  it('should add a tournament to chatsOpen', function (done) {
    const chatId = msg.chat.id;
    const getChatAdministrators = sinon.stub(bot.telegram, 'getChatAdministrators');
    const res = [
      {
        user: {
          id: 306946885,
          first_name: 'Nadia',
          username: 'nadiadillon'
        },
        status: 'creator'
      }
    ];
    const sendMessage = sinon.stub(bot.telegram, 'sendMessage');

    getChatAdministrators.returns(new Promise((resolve, reject) => resolve(res)));
    bot.start(msg).then(() => {
      bot.chatsOpen.should.have.property(chatId);
      done();
      getChatAdministrators.restore();
      sendMessage.restore()
    });
  });
});
