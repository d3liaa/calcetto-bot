'use strict';

const nconf = require('nconf');
const TelegramBot = require('node-telegram-bot-api');
const Tournament = require('../tournament.js');

nconf.argv().env().file({ file: './.env.json.default' });

const token = nconf.get('TELEGRAM_TOKEN');
const telegram = new TelegramBot(token, {polling: true});

class TournamentBot {

  constructor () {
    this.chatsOpen = {};
    this.telegram = telegram
  };

  start (msg) {
    const chatId = msg.chat.id;
    const response = `
      *Welcome!*

    Before we start the tournament, every player has to register.

    Please type /register to register at the tournament.
    Every player has to send /register.

    When ready, the administrator has to type /go to? start the tournament.

    Players can send /next to know the next opponent.
    If not playing, you can have fun watching some random /pic

    You can also play a single match 1 VS 1 by sending /quick
      `;
    if (msg.chat.type === 'group') {
      telegram.getChatAdministrators(chatId)
      .then((data) => {
        const chatAdmin = data[0].user.username;
        if (msg.from.username === chatAdmin) {
          if (this.chatsOpen[chatId] === undefined) {
            this.chatsOpen[chatId] = new Tournament(chatId,chatAdmin);
            telegram.sendMessage(chatId, response, {parse_mode: 'Markdown'});
          } else if (this.chatsOpen[chatId].playing === true) {
            telegram.sendMessage(chatId, 'You are already playing in a tournament.')
          } else telegram.sendMessage(chatId, 'You already set up a tournament, send /go to start.')
        } else telegram.sendMessage(chatId, `Only ${chatAdmin} can send me commands!`);
      })
      .catch(function(err) {
        console.log(err);
      })
    }
  }

  register (msg) {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    const tournament = this.chatsOpen[chatId];
    if (tournament && tournament.registering) {
      if (!tournament.players[username]) {
        tournament.addPlayer(username)
        telegram.sendMessage(chatId, `${username} has been registered! Current players registered: ${Object.keys(tournament.players).length}.`);
      } else telegram.sendMessage(chatId, `You have already been registered.`);
    } else telegram.sendMessage(chatId, `Registrations are closed. /start a tournament if you haven't yet.`);
  };

  go (msg) {
    const chatId = msg.chat.id;
    const tournament = this.chatsOpen[chatId];
    if (tournament) {
      if (tournament.chatAdmin === msg.from.username) {
        if (!tournament.playing) {
          const playerCount = Object.keys(tournament.players).length;
          if (playerCount >= 1) {
            tournament.registering = false;
            tournament.playing = true;
            telegram.sendMessage(chatId, `New tournament created with ${playerCount} players! Start!`);

            tournament.createTournament();

          } else {
            telegram.sendMessage(chatId, `You need ${4 - playerCount} more players to start a tournament!`);
          }
        } else telegram.sendMessage(chatId, `Your Tournament is already running!`);
      } else telegram.sendMessage(chatId, `Only ${tournament.chatAdmin} can send me commands!`);
    } else telegram.sendMessage(chatId, `You haven't started a tournament yet. Send /start.`);
  }

  deleteTournament (msg) {
    const chatId = msg.chat.id;
    const tournament = this.chatsOpen[chatId]
    const opts = {
      reply_markup: JSON.stringify({
      keyboard: [[`YES`, `NO`]],
      one_time_keyboard: true,
      resize_keyboard: true,
      selective: true
      })
    };
    const hideKeyboard = {reply_markup: JSON.stringify({hide_keyboard: true})}

    if (tournament) {
      if (tournament.chatAdmin === msg.from.username) {
        telegram.sendMessage(chatId, `Are you sure? @${tournament.chatAdmin}`, opts);
        telegram.onText(/YES/, () => {
          delete this.chatsOpen[chatId];
          telegram.sendMessage(chatId, `Current tournament deleted.`, hideKeyboard);
        })
        telegram.onText(/NO/, () => {
          telegram.sendMessage(chatId, `The tournament has not been deleted.`, hideKeyboard);
        })
      } else {
        telegram.sendMessage(chatId, `Only the group admin can send me commands!`);
      }
    } else {
      telegram.sendMessage(chatId, `You are not playing any tournament!`);
    }
  }

  help (msg) {
    const chatId = msg.chat.id;
    const resp = `
      To start a tournament you have to add me to a Telegram group.

    Then type /start to start a tournament!
    Every player has to register before the tournament starts.
    Once the tournament has started, only the group administrator can send me commands, except /next.
    Players can type /next to know the next opponent.

    You can control me by sending these commands:

      /start - start the registration process
      /register - register at the tournament
      /go - start the tournament
      /next - show next opponent
      /game - start the next game
      /deletetournament - delete an existing tournament
      /help - list of commands and help
      `;

    telegram.sendMessage(chatId, resp, {parse_mode: 'Markdown'});
  }

  next (msg) {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    const tournament = this.chatsOpen[chatId]
    if (tournament && tournament.playing) {
      if (tournament.players[username]) {
        if(tournament.playingPlayers[username]) {
          const opponent = tournament.findNextOpponent(username)
          if (opponent) {
            telegram.sendMessage(chatId, `${username} your opponent is ${opponent.name}`)
          } else telegram.sendMessage(chatId, `Your opponent has not been decided yet`)
        } else telegram.sendMessage(chatId, `You have already been knocked out!`);
      } else telegram.sendMessage(chatId, `You're not participating in this tournament`);
    } else telegram.sendMessage(chatId, `You're not in a tournament yet.`);
  }

  game (msg) {
    const chatId = msg.chat.id;
    const user = msg.from;
    const tournament = this.chatsOpen[chatId]
    if (tournament && tournament.playing) {
      if (user.username === tournament.chatAdmin) {
        const nextGame = tournament.findNextGame();
        const player1 = nextGame.player1.name;
        const player2 = nextGame.player2.name;
        const round = tournament.nextGame[1] === 0 ? `It's the ${tournament.round}!` : '';
        telegram.sendMessage(chatId, `${round}
          The next game is between ${player1} and ${player2}!
          Send /result ${player1}-${player2} to declare the winner.`);
        telegram.onText(/\/result (.+)/, (msg , match) => {
          if (user.username === tournament.chatAdmin) {
            const resp = match[1];
            tournament.gamePlayed(resp);
            if (tournament.round === 'finished') {
              telegram.sendMessage(chatId, `Congratulations! ${nextGame.winner.name} won the tournament.`);
              tournament.playing = false;
            }
          } else telegram.sendMessage(chatId, `Only ${tournament.chatAdmin} can send me commands!`);
        });
      } else telegram.sendMessage(chatId, `Only ${tournament.chatAdmin} can send me commands!`);
    } else telegram.sendMessage(chatId, `You're playing any tournament yet.`);
  }

  stats (msg) {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    const tournament = this.chatsOpen[chatId];
    if (tournament) {
      if (tournament.players[username]) {
        tournament.getStats(username);
        telegram.sendMessage(chatId, `${username} scored ${tournament.players[username].goals} points`);
      } else telegram.sendMessage(chatId, `You are not playing in this tournament`);
    } else telegram.sendMessage(chatId, `There is no tournament running, send /start to begin playing`);
  };

}

module.exports = TournamentBot;
