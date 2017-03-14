'use strict';

const nconf = require('nconf');
const TelegramBot = require('node-telegram-bot-api');

const Tournament = require('../tournament.js');
const messages = require('../messages');
nconf.argv().env().file({ file: './.env.json.default' });

const token = nconf.get('TELEGRAM_TOKEN');
const telegram = new TelegramBot(token, {polling: true});

class TournamentBot {

  constructor () {
    this.chatsOpen = {};
    this.telegram = telegram
  };

  async start (msg) {
    const chatId = msg.chat.id;
    const response = messages.start;
    if (msg.chat.type === 'group') {
      this.telegram.getChatAdministrators(chatId)
      .then((data) => {
        const chatAdmin = {id: data[0].user.id, name: data[0].user.first_name }
        if (msg.from.id === chatAdmin.id) {
          if (this.chatsOpen[chatId] === undefined) {
            this.chatsOpen[chatId] = new Tournament(chatId,chatAdmin);
            this.telegram.sendMessage(chatId, response, {parse_mode: 'Markdown'});
          } else if (this.chatsOpen[chatId].playing === true) {
            this.telegram.sendMessage(chatId, messages.alreadyPlaying);
          } else this.telegram.sendMessage(chatId, messages.alreadyPlaying);
        } else this.telegram.sendMessage(chatId, messages.notAdmin(chatAdmin.name));
      })
      .catch(err => console.log(err));
    }
  };

  register (msg) {
    const chatId = msg.chat.id;
    const name = msg.from.first_name;
    const userId = msg.from.id;

    const tournament = this.chatsOpen[chatId];
    if (tournament && tournament.registering) {
      if (!tournament.players[userId]) {
        tournament.addPlayer(name, userId)
        const playerCount = Object.keys(tournament.players).length
        this.telegram.sendMessage(chatId, messages.userRegistered(name, playerCount) );
      } else this.telegram.sendMessage(chatId, messages.alreadyRegistered);
    } else {
      this.telegram.sendMessage(chatId, messages.registrationClosed);
      }
  };

  go (msg) {
    const chatId = msg.chat.id;
    const tournament = this.chatsOpen[chatId];
    const user = msg.from
    const username = msg.from.first_name;
    const chatAdmin = tournament.chatAdmin;
    if (tournament) {
      if (chatAdmin.id === user.id) {
        if (!tournament.playing) {
          const playerCount = Object.keys(tournament.players).length;
          if (playerCount >= 2) {
            tournament.registering = false;
            tournament.playing = true;
            tournament.createTournament();
            this.telegram.sendMessage(chatId, messages.newTournament(playerCount));
            tournament.updateWildcards();
          } else this.telegram.sendMessage(chatId, `You need ${4 - playerCount} more players to start a tournament!`);
        } else this.telegram.sendMessage(chatId, messages.alreadyPlaying);
      } else this.telegram.sendMessage(chatId, messages.notAdmin(chatAdmin.name));
    } else this.telegram.sendMessage(chatId, messages.notPlaying);
  };

  deleteTournament (msg) {
    const chatId = msg.chat.id;
    const tournament = this.chatsOpen[chatId];
    const chatAdmin = tournament.chatAdmin;
    const user = msg.from;
    const opts = {
      reply_markup: JSON.stringify({
        keyboard: [[`YES`, `NO`]],
        one_time_keyboard: true,
        resize_keyboard: true,
        selective: true
      }),
      reply_to_message_id: msg.message_id,
    };

    if (tournament) {
      if (chatAdmin.id === user.id) {
        this.telegram.sendMessage(chatId, `Are you sure?`, opts);
      } else this.telegram.sendMessage(chatId, messages.notAdmin(chatAdmin.name));
    } else this.telegram.sendMessage(chatId, messages.notPlaying);
  }

  confirmDeletion (msg) {
    const chatId = msg.chat.id;
    const hideKeyboard = {reply_markup: JSON.stringify({hide_keyboard: true})}

    delete this.chatsOpen[chatId];
    this.telegram.sendMessage(chatId, `Current tournament deleted.`, hideKeyboard);
  }

  cancelDeletion (msg) {
    const chatId = msg.chat.id;
    const hideKeyboard = {reply_markup: JSON.stringify({hide_keyboard: true})}
    this.telegram.sendMessage(chatId, `The tournament has not been deleted.`, hideKeyboard);
  }

  help (msg) {
    const chatId = msg.chat.id;
    const resp = messages.help;

    this.telegram.sendMessage(chatId, resp, {parse_mode: 'Markdown'});
  }

  next (msg) {
    const chatId = msg.chat.id;
    const user = msg.from;
    const username = user.first_name;
    const tournament = this.chatsOpen[chatId]
    if (tournament && tournament.playing) {
      if (tournament.players[user.id]) {
        if(tournament.playingPlayers[user.id]) {
          const opponent = tournament.findNextOpponent(username)
          if (opponent) {
            this.telegram.sendMessage(chatId, messages.opponent(username, opponent));
          } else this.telegram.sendMessage(chatId, messages.undecidedOpponent);
        } else this.telegram.sendMessage(chatId, messages.knockedOut);
      } else this.telegram.sendMessage(chatId, messages.userNotPlaying);
    } else this.telegram.sendMessage(chatId, messages.notPlaying);
  }

  game (msg) {
    const chatId = msg.chat.id;
    const user = msg.from;
    const username = user.first_name;
    const tournament = this.chatsOpen[chatId];
    const chatAdmin = tournament.chatAdmin;
    if (tournament && tournament.playing) {
      if (user.id === chatAdmin.id) {
        const nextGame = tournament.findNextGame();
        nextGame.playing = true;
        console.log(nextGame.player1.name);
        console.log(nextGame.playe2.name);
        const player1 = nextGame.player1.name;
        const player2 = nextGame.player2.name;
        const round = tournament.nextGame[1] === 0 ? `It's the ${tournament.round}!` : '';
        tournament.updateWildcards();
        const wildcards = tournament.wildcards;
        this.telegram.sendMessage(chatId, `${messages.wildcard(round, wildcards)} ${messages.game(player1, player2)}`);
      } else this.telegram.sendMessage(chatId, messages.notAdmin(chatAdmin.name));
    } else this.telegram.sendMessage(chatId, messages.notPlaying);
  };

  result(msg, match) {
    const chatId = msg.chat.id;
    const user = msg.from;
    const tournament = this.chatsOpen[chatId];
    const chatAdmin = tournament.chatAdmin;
    const nextGame = tournament.findNextGame();
    if (user.id === chatAdmin.id) {
      if(tournament.playing) {
        const resp = match[1];
        const isValidResult = /\s*\d+\s*-\s*\d+\s*/.test(resp);
        if (nextGame.playing) {
          if(isValidResult) {
            tournament.gamePlayed(resp)
            const winner = nextGame.winner.name;
            if (tournament.round === 'finished') {
              this.telegram.sendMessage(chatId, messages.overallWinner(winner));
              tournament.playing = false;
            } else this.telegram.sendMessage(chatId, messages.gameWinner(winner));
          } else this.telegram.sendMessage(chatId, messages.resultFormat);
        } else this.telegram.sendMessage(chatId, messages.gameNotStarted);
      } else this.telegram.sendMessage(chatId, messages.notPlaying);
    } else this.telegram.sendMessage(chatId, messages.notAdmin(chatAdmin.name));
  }

  stats (msg) {
    const chatId = msg.chat.id;
    const user = msg.from;
    const tournament = this.chatsOpen[chatId];
    if (tournament) {
      if (tournament.players[user.id]) {
        tournament.getStats(username);
        this.telegram.sendMessage(chatId, `${username} scored ${tournament.players[username].goals} points`);
      } else this.telegram.sendMessage(chatId, messages.userNotPlaying);
    } else this.telegram.sendMessage(chatId, messages.notPlaying);
  };

};

module.exports = TournamentBot;
