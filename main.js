'use strict';

const TournamentBot = require('./controllers');


const bot = new TournamentBot();

bot.telegram.onText(/\/start/, (msg) => bot.start(msg));

bot.telegram.onText(/\/register/, (msg) => bot.register(msg));

bot.telegram.onText(/\/go/, (msg) => bot.go(msg));

bot.telegram.onText(/\/deletetournament/, (msg) => bot.deleteTournament(msg));

bot.telegram.onText(/YES/ , (msg) => bot.confirmDeletion(msg));

bot.telegram.onText(/NO/, (msg) => bot.cancelDeletion(msg));

bot.telegram.onText(/\/help/, (msg) => bot.help(msg));

bot.telegram.onText(/\/next/, (msg) => bot.next(msg));

bot.telegram.onText(/\/game/, (msg) => bot.game(msg));

bot.telegram.onText(/\/stats/, (msg) => bot.stats(msg));

bot.telegram.onText(/\/result (.+)/, (msg, match) => bot.result(msg, match));
