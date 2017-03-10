'use strict';

const mocha = require('mocha');

const TournamentBot = require('../controllers');

const bot = new TournamentBot();
const msg = {
  message_id: 1545,
  from: { id: 306946885, first_name: 'Nadia', username: 'nadiadillon' },
  chat: {
    id: -113251997,
    title: 'BOT',
    type: 'group',
    all_members_are_administrators: true },
    date: 1489160360,
    text: '/start',
    entities: [ { type: 'bot_command', offset: 0, length: 6 } ]
  };
};

describe('Start', function ()  {
  it('should add a tournament to chatsOpen', function () {
    bot.start(msg)
    bot.chatsOpen
  });
});
